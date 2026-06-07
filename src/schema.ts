import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { parse, annotateTypes, ast } from '@polyglot-sql/sdk';
import type { SchemaColumn, SchemaLoadOptions, SchemaTable, ValidationSchema } from './types.js';

const TABLE_CONSTRAINT_RE = /^(?:constraint\s+\S+\s+)?(?:primary\s+key|foreign\s+key|unique|check)\b/i;

export async function loadSchema(patterns: string[], options: SchemaLoadOptions = {}): Promise<ValidationSchema> {
  const cwd = options.cwd ?? process.cwd();
  const files = (
    await Promise.all(patterns.map((pattern) => glob(pattern, { cwd, absolute: true, nodir: true })))
  ).flat().sort();

  const tables: SchemaTable[] = [];
  const sqlFiles: string[] = [];
  for (const file of files) {
    const sql = await readFile(file, 'utf8');
    sqlFiles.push(sql);
    tables.push(...parseCreateTables(sql, options.dialect ?? 'generic'));
  }
  let schema: ValidationSchema = { tables };
  for (const sql of sqlFiles) {
    schema = applySchemaMutations(sql, schema, options.dialect ?? 'generic');
  }
  for (const sql of sqlFiles) {
    for (const table of parseCreateAsTables(sql, schema, options.dialect ?? 'generic')) {
      if (!schema.tables.some((existing) => sameTable(existing, table))) schema.tables.push(table);
    }
    schema.tables.push(...parseCreateSynonyms(sql, schema, options.dialect ?? 'generic'));
    schema.tables.push(...parseCreateViews(sql, schema, options.dialect ?? 'generic'));
  }
  for (const sql of sqlFiles) {
    schema = applySchemaMutations(sql, schema, options.dialect ?? 'generic');
  }

  return schema;
}

export function parseCreateTables(sql: string, dialect = 'generic'): SchemaTable[] {
  const astTables = parseCreateTablesWithAst(sql, dialect);
  if (astTables.length > 0) return astTables;
  return parseCreateTablesFallback(sql);
}

function parseCreateTablesWithAst(sql: string, dialect = 'generic'): SchemaTable[] {
  const parseResult = parse(sql, dialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return [];
  return parseResult.ast.flatMap(tableFromCreateTableStatement);
}

function tableFromCreateTableStatement(statement: unknown): SchemaTable[] {
  if (!isRecord(statement) || !isRecord(statement.create_table) || statement.create_table.as_select) return [];
  const createTable = statement.create_table;
  const tableName = tableNameFromRef(createTable.name);
  if (!tableName) return [];
  const schema = tableSchemaFromRef(createTable.name);
  const columns = Array.isArray(createTable.columns) ? createTable.columns.map(schemaColumnFromColumnDef).filter((column): column is SchemaColumn => column !== null) : [];
  const primaryKey = primaryKeyColumns(createTable, columns);
  const uniqueKeys = uniqueKeyColumns(createTable, columns);
  const foreignKeys = foreignKeyConstraints(createTable);
  for (const column of columns) {
    if (primaryKey.includes(column.name)) column.primaryKey = true;
    if (uniqueKeys.some((key) => key.length === 1 && key[0] === column.name)) column.unique = true;
  }
  return [{
    name: tableName,
    ...(schema ? { schema } : {}),
    columns,
    ...(primaryKey.length > 0 ? { primaryKey } : {}),
    ...(uniqueKeys.length > 0 ? { uniqueKeys } : { uniqueKeys: [] }),
    ...(foreignKeys.length > 0 ? { foreignKeys } : { foreignKeys: [] }),
  }];
}

function schemaColumnFromColumnDef(column: unknown): SchemaColumn | null {
  if (!isRecord(column)) return null;
  const name = identifierName(column.name);
  if (!name) return null;
  const primaryKey = column.primary_key === true;
  return {
    name,
    type: dataTypeToString(column.data_type) ?? 'unknown',
    nullable: primaryKey ? false : typeof column.nullable === 'boolean' ? column.nullable : undefined,
    primaryKey,
    unique: column.unique === true,
  };
}

function primaryKeyColumns(createTable: Record<string, unknown>, columns: SchemaColumn[]): string[] {
  const inline = columns.filter((column) => column.primaryKey).map((column) => column.name);
  const tableLevel = Array.isArray(createTable.constraints)
    ? createTable.constraints.flatMap((constraint) => {
        const primaryKey = isRecord(constraint) ? constraint.PrimaryKey : undefined;
        return isRecord(primaryKey) && Array.isArray(primaryKey.columns) ? primaryKey.columns.map(identifierName).filter((name): name is string => Boolean(name)) : [];
      })
    : [];
  return [...new Set([...inline, ...tableLevel])];
}

function uniqueKeyColumns(createTable: Record<string, unknown>, columns: SchemaColumn[]): string[][] {
  const inline = columns.filter((column) => column.unique).map((column) => [column.name]);
  const tableLevel = Array.isArray(createTable.constraints)
    ? createTable.constraints.flatMap((constraint) => {
        const unique = isRecord(constraint) ? constraint.Unique : undefined;
        return isRecord(unique) && Array.isArray(unique.columns)
          ? [unique.columns.map(identifierName).filter((name): name is string => Boolean(name))]
          : [];
      })
    : [];
  return [...inline, ...tableLevel].filter((key) => key.length > 0);
}

function foreignKeyConstraints(createTable: Record<string, unknown>): unknown[] {
  if (!Array.isArray(createTable.constraints)) return [];
  return createTable.constraints.flatMap((constraint) => {
    const foreignKey = isRecord(constraint) ? constraint.ForeignKey : undefined;
    if (!isRecord(foreignKey)) return [];
    const references = isRecord(foreignKey.references) ? foreignKey.references : {};
    return [{
      columns: Array.isArray(foreignKey.columns) ? foreignKey.columns.map(identifierName).filter(Boolean) : [],
      references: {
        table: tableNameFromRef(references.table),
        columns: Array.isArray(references.columns) ? references.columns.map(identifierName).filter(Boolean) : [],
        ...(tableSchemaFromRef(references.table) ? { schema: tableSchemaFromRef(references.table) } : {}),
      },
    }];
  });
}

function parseCreateTablesFallback(sql: string): SchemaTable[] {
  const tables: SchemaTable[] = [];
  for (const statement of findCreateTableStatements(sql)) {
    const rawName = cleanIdentifier(statement.name);
    const nameParts = rawName.split('.');
    const tableName = nameParts.pop() ?? rawName;
    const schema = nameParts.length > 0 ? nameParts.join('.') : undefined;
    const columns = parseColumns(statement.body);
    const primaryKey = columns.filter((column) => column.primaryKey).map((column) => column.name);
    tables.push({
      name: tableName,
      ...(schema ? { schema } : {}),
      columns,
      ...(primaryKey.length > 0 ? { primaryKey } : {}),
      uniqueKeys: [],
      foreignKeys: [],
    });
  }
  return tables;
}

export function parseCreateViews(sql: string, schema: ValidationSchema = { tables: [] }, dialect = 'generic'): SchemaTable[] {
  const parseResult = parse(sql, dialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return [];
  const annotated = annotateViewTypes(sql, schema, dialect) ?? parseResult.ast;
  return annotated.flatMap((statement) => viewFromStatement(statement, schema));
}

export function parseCreateAsTables(sql: string, schema: ValidationSchema = { tables: [] }, dialect = 'generic'): SchemaTable[] {
  const parseResult = parse(sql, dialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return [];
  const annotated = annotateViewTypes(sql, schema, dialect) ?? parseResult.ast;
  return annotated.flatMap((statement) => tableFromCreateAsStatement(statement, schema));
}

export function parseCreateSynonyms(sql: string, schema: ValidationSchema = { tables: [] }, dialect = 'generic'): SchemaTable[] {
  const parseResult = parse(sql, dialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return [];
  return parseResult.ast.flatMap((statement) => synonymFromStatement(statement, schema));
}

function applySchemaMutations(sql: string, schema: ValidationSchema, dialect = 'generic'): ValidationSchema {
  const parseResult = parse(sql, dialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return schema;
  return parseResult.ast.reduce<ValidationSchema>((current, statement) => {
    if (!isRecord(statement)) return current;
    if (isRecord(statement.alter_table)) return schemaAfterAlterTable(statement.alter_table, current);
    if (isRecord(statement.drop_table)) return schemaAfterDropTable(statement.drop_table, current);
    if (isRecord(statement.drop_view)) return dropSchemaRelations(current, [statement.drop_view.name]);
    if (isRecord(statement.drop_schema)) return schemaAfterDropSchema(statement.drop_schema, current);
    if (isRecord(statement.drop_database)) return schemaAfterDropSchema(statement.drop_database, current);
    if (isRecord(statement.drop_namespace)) return schemaAfterDropSchema(statement.drop_namespace, current);
    if (isRecord(statement.raw)) return schemaAfterRawStatement(statement.raw, current);
    return current;
  }, schema);
}

function schemaAfterDropTable(dropTable: Record<string, unknown>, schema: ValidationSchema): ValidationSchema {
  const names = Array.isArray(dropTable.names) ? dropTable.names : [];
  return dropSchemaRelations(schema, names);
}

function schemaAfterDropSchema(dropSchema: Record<string, unknown>, schema: ValidationSchema): ValidationSchema {
  const name = identifierName(dropSchema.name);
  if (!name) return schema;
  return {
    tables: schema.tables.filter((table) => table.schema?.toLowerCase() !== name.toLowerCase()),
  };
}

function schemaAfterRawStatement(raw: Record<string, unknown>, schema: ValidationSchema): ValidationSchema {
  const sql = typeof raw.sql === 'string' ? raw.sql : '';
  const alterSchemaRename = sql.match(/^alter\s+(?:schema|database)\s+(.+?)\s+rename\s+to\s+(.+?)\s*$/i);
  if (alterSchemaRename) {
    const oldName = cleanIdentifier(alterSchemaRename[1].trim());
    const newName = cleanIdentifier(alterSchemaRename[2].trim());
    if (!oldName || !newName) return schema;
    return {
      tables: schema.tables.map((table) => table.schema?.toLowerCase() === oldName.toLowerCase()
        ? { ...table, schema: newName }
        : table),
    };
  }
  return schema;
}

function dropSchemaRelations(schema: ValidationSchema, refs: unknown[]): ValidationSchema {
  const names = refs.flatMap((ref) => {
    const name = tableNameFromRef(ref);
    const schemaName = isRecord(ref) ? tableSchemaFromRef(ref) : undefined;
    return name ? [{ name: name.toLowerCase(), schema: schemaName?.toLowerCase() }] : [];
  });
  if (names.length === 0) return schema;
  return {
    tables: schema.tables.filter((table) => !names.some((target) => {
      if (table.name.toLowerCase() !== target.name) return false;
      if (target.schema && table.schema?.toLowerCase() !== target.schema) return false;
      return true;
    })),
  };
}

function schemaAfterAlterTable(alterTable: Record<string, unknown>, schema: ValidationSchema): ValidationSchema {
  const tableName = tableNameFromRef(alterTable.name);
  if (!tableName || !Array.isArray(alterTable.actions)) return schema;
  const schemaName = tableSchemaFromRef(alterTable.name);
  return {
    tables: schema.tables.map((table) => {
      if (table.name.toLowerCase() !== tableName.toLowerCase()) return table;
      if (schemaName && table.schema?.toLowerCase() !== schemaName.toLowerCase()) return table;
      return applyAlterActions(table, alterTable.actions as unknown[]);
    }),
  };
}

function applyAlterActions(table: SchemaTable, actions: unknown[]): SchemaTable {
  return actions.reduce<SchemaTable>((current, action) => {
    if (!isRecord(action)) return current;
    if (isRecord(action.RenameTable)) return renameAlterTable(current, action.RenameTable);
    if (isRecord(action.AddColumn)) return addAlterColumn(current, action.AddColumn.column);
    if (isRecord(action.DropColumn)) return dropAlterColumn(current, action.DropColumn.name);
    if (isRecord(action.RenameColumn)) return renameAlterColumn(current, action.RenameColumn.old_name, action.RenameColumn.new_name);
    if (isRecord(action.ChangeColumn)) return changeAlterColumn(current, action.ChangeColumn);
    if (isRecord(action.AlterColumn)) return alterColumn(current, action.AlterColumn);
    if (isRecord(action.AddConstraint)) return addAlterConstraint(current, action.AddConstraint);
    if (isRecord(action.Raw)) return applyRawAlterAction(current, action.Raw);
    return current;
  }, { ...table, columns: [...table.columns] });
}

function renameAlterTable(table: SchemaTable, tableRef: unknown): SchemaTable {
  const name = tableNameFromRef(tableRef);
  const schemaName = tableSchemaFromRef(tableRef);
  if (!name) return table;
  return { ...table, name, ...(schemaName ? { schema: schemaName } : {}) };
}

function addAlterColumn(table: SchemaTable, columnDefinition: unknown): SchemaTable {
  const column = schemaColumnFromColumnDef(columnDefinition);
  if (!column) return table;
  const columns = table.columns.filter((existing) => existing.name.toLowerCase() !== column.name.toLowerCase());
  return { ...table, columns: [...columns, column] };
}

function dropAlterColumn(table: SchemaTable, columnName: unknown): SchemaTable {
  const name = identifierName(columnName);
  if (!name) return table;
  return { ...table, columns: table.columns.filter((column) => column.name.toLowerCase() !== name.toLowerCase()) };
}

function renameAlterColumn(table: SchemaTable, oldColumnName: unknown, newColumnName: unknown): SchemaTable {
  const oldName = identifierName(oldColumnName);
  const newName = identifierName(newColumnName);
  if (!oldName || !newName) return table;
  return {
    ...table,
    columns: table.columns.map((column) => column.name.toLowerCase() === oldName.toLowerCase() ? { ...column, name: newName } : column),
  };
}

function changeAlterColumn(table: SchemaTable, changeColumn: Record<string, unknown>): SchemaTable {
  const oldName = identifierName(changeColumn.old_name);
  const newName = identifierName(changeColumn.new_name);
  if (!oldName || !newName) return table;
  const type = dataTypeToString(changeColumn.data_type);
  return {
    ...table,
    columns: table.columns.map((column) => column.name.toLowerCase() === oldName.toLowerCase()
      ? { ...column, name: newName, ...(type ? { type } : {}) }
      : column),
  };
}

function alterColumn(table: SchemaTable, alterColumnNode: Record<string, unknown>): SchemaTable {
  const name = identifierName(alterColumnNode.name);
  if (!name) return table;
  const action = alterColumnNode.action;
  return {
    ...table,
    columns: table.columns.map((column) => {
      if (column.name.toLowerCase() !== name.toLowerCase()) return column;
      if (action === 'SetNotNull') return { ...column, nullable: false };
      if (action === 'DropNotNull') return { ...column, nullable: true };
      if (isRecord(action) && isRecord(action.SetDataType)) {
        const type = dataTypeToString(action.SetDataType.data_type);
        return type ? { ...column, type } : column;
      }
      return column;
    }),
  };
}

function addAlterConstraint(table: SchemaTable, constraint: Record<string, unknown>): SchemaTable {
  if (isRecord(constraint.PrimaryKey)) {
    const columns = constraintColumns(constraint.PrimaryKey);
    return {
      ...table,
      ...(columns.length > 0 ? { primaryKey: columns } : {}),
      columns: table.columns.map((column) => columns.some((name) => name.toLowerCase() === column.name.toLowerCase())
        ? { ...column, primaryKey: true, nullable: false }
        : column),
    };
  }
  if (isRecord(constraint.Index) && String(constraint.Index.kind ?? '').toLowerCase() === 'unique') {
    const columns = constraintColumns(constraint.Index);
    return {
      ...table,
      ...(columns.length > 0 ? { uniqueKeys: [...(table.uniqueKeys ?? []), columns] } : {}),
      columns: table.columns.map((column) => columns.length === 1 && columns[0]?.toLowerCase() === column.name.toLowerCase()
        ? { ...column, unique: true }
        : column),
    };
  }
  return table;
}

function constraintColumns(constraint: Record<string, unknown>): string[] {
  return Array.isArray(constraint.columns)
    ? constraint.columns.map(identifierName).filter((name): name is string => Boolean(name))
    : [];
}

function applyRawAlterAction(table: SchemaTable, raw: Record<string, unknown>): SchemaTable {
  const sql = typeof raw.sql === 'string' ? raw.sql : '';
  const modifyColumn = sql.match(/^modify\s+(?:column\s+)?("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/i);
  if (modifyColumn) {
    const columnName = cleanIdentifier(modifyColumn[1]);
    const type = dataTypeFromRawColumnSpec(modifyColumn[2]);
    return {
      ...table,
      columns: table.columns.map((column) => column.name.toLowerCase() === columnName.toLowerCase()
        ? { ...column, ...(type ? { type } : {}) }
        : column),
    };
  }
  const setSchema = sql.match(/^set\s+schema\s+(.+)$/i);
  if (setSchema) return { ...table, schema: cleanIdentifier(setSchema[1].trim()) };
  return table;
}

function dataTypeFromRawColumnSpec(spec: string): string | undefined {
  const type = spec.trim().split(/\s+/)[0];
  return type ? cleanIdentifier(type).toLowerCase() : undefined;
}

function tableFromCreateAsStatement(statement: unknown, schema: ValidationSchema): SchemaTable[] {
  if (!isRecord(statement) || !isRecord(statement.create_table)) return [];
  const createTable = statement.create_table;
  const name = tableNameFromRef(createTable.name);
  if (!name) return [];
  const schemaName = tableSchemaFromRef(createTable.name);
  if (!createTable.as_select) {
    const copied = copiedTableColumns(createTable, schema);
    return copied ? [{ name, ...(schemaName ? { schema: schemaName } : {}), columns: copied }] : [];
  }
  const explicitColumns = Array.isArray(createTable.columns) ? createTable.columns : [];
  if (explicitColumns.length > 0) {
    return [{
      name,
      ...(schemaName ? { schema: schemaName } : {}),
      columns: explicitColumns.map((column) => ({
        name: identifierName(column) ?? 'column',
        type: dataTypeToString(isRecord(column) ? column.data_type : undefined) ?? 'unknown',
        nullable: isRecord(column) && typeof column.nullable === 'boolean' ? column.nullable : undefined,
        primaryKey: isRecord(column) && column.primary_key === true,
        unique: isRecord(column) && column.unique === true,
      })),
    }];
  }

  return [{
    name,
    ...(schemaName ? { schema: schemaName } : {}),
    columns: columnsFromQuery(createTable.as_select, schema),
  }];
}

function copiedTableColumns(createTable: Record<string, unknown>, schema: ValidationSchema): SchemaColumn[] | undefined {
  const sourceRef = isRecord(createTable.clone_source) ? createTable.clone_source : likeTableSource(createTable);
  if (!sourceRef) return undefined;
  const sourceName = tableNameFromRef(sourceRef)?.toLowerCase();
  const sourceSchema = tableSchemaFromRef(sourceRef)?.toLowerCase();
  if (!sourceName) return undefined;
  const source = schema.tables.find((table) => {
    if (table.name.toLowerCase() !== sourceName) return false;
    if (sourceSchema && table.schema?.toLowerCase() !== sourceSchema) return false;
    return true;
  });
  return source ? source.columns.map((column) => ({ ...column })) : undefined;
}

function synonymFromStatement(statement: unknown, schema: ValidationSchema): SchemaTable[] {
  if (!isRecord(statement) || !isRecord(statement.create_synonym)) return [];
  const synonym = statement.create_synonym;
  const name = tableNameFromRef(synonym.name);
  const targetName = tableNameFromRef(synonym.target);
  if (!name || !targetName) return [];
  const schemaName = tableSchemaFromRef(synonym.name);
  const targetSchema = tableSchemaFromRef(synonym.target);
  const target = schema.tables.find((table) => {
    if (table.name.toLowerCase() !== targetName.toLowerCase()) return false;
    if (targetSchema && table.schema?.toLowerCase() !== targetSchema.toLowerCase()) return false;
    return true;
  });
  if (!target) return [];
  return [{
    name,
    ...(schemaName ? { schema: schemaName } : {}),
    columns: target.columns.map((column) => ({ ...column })),
    ...(target.primaryKey ? { primaryKey: [...target.primaryKey] } : {}),
    ...(target.uniqueKeys ? { uniqueKeys: target.uniqueKeys.map((key) => [...key]) } : {}),
    ...(target.foreignKeys ? { foreignKeys: [...target.foreignKeys] } : {}),
  }];
}

function likeTableSource(createTable: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!Array.isArray(createTable.constraints)) return undefined;
  for (const constraint of createTable.constraints) {
    const like = isRecord(constraint) && isRecord(constraint.Like) ? constraint.Like : undefined;
    if (like && isRecord(like.source)) return like.source;
  }
  return undefined;
}

function annotateViewTypes(sql: string, schema: ValidationSchema, dialect: string): unknown[] | undefined {
  try {
    const result = annotateTypes(sql, dialect as never, toPolyglotSchema(schema) as never) as { success: boolean; ast?: unknown[] };
    return result.success ? result.ast : undefined;
  } catch {
    return undefined;
  }
}

function viewFromStatement(statement: unknown, schema: ValidationSchema): SchemaTable[] {
  if (!isRecord(statement) || !isRecord(statement.create_view)) return [];
  const view = statement.create_view;
  const name = tableNameFromRef(view.name);
  if (!name) return [];
  const schemaName = tableSchemaFromRef(view.name);
  const explicitColumns = Array.isArray(view.columns) ? view.columns : [];
  const columns = columnsFromQuery(view.query, schema, explicitColumns);
  return [{ name, ...(schemaName ? { schema: schemaName } : {}), columns }];
}

function columnsFromQuery(query: unknown, schema: ValidationSchema, explicitColumns: unknown[] = []): SchemaColumn[] {
  const cteSchema = { tables: cteTablesFromQuery(query, schema) };
  const relationSchema = { tables: relationTablesFromQuery(query, mergeSchemas(cteSchema, schema)) };
  const effectiveSchema = mergeSchemas(relationSchema, cteSchema, schema);
  const expressions = selectExpressions(query);
  const select = selectNode(query);
  const fromTables = selectFromTables(query);
  const nullableRelations = nullableRelationsFromSelect(select);
  return expressions.flatMap((expression, index) => {
    const star = isRecord(expression) ? expression.star : undefined;
    if (isRecord(star)) return columnsFromStar(star, effectiveSchema, fromTables, select, nullableRelations);
    const columnName = cleanIdentifier(identifierName(explicitColumns[index]) ?? outputName(expression, index + 1));
    const base = baseExpression(expression);
    return [{
      name: columnName,
      type: inferredType(base) ?? schemaColumnType(base, effectiveSchema, fromTables) ?? literalType(base) ?? 'unknown',
      nullable: schemaColumnNullable(base, effectiveSchema, fromTables, nullableRelations),
    }];
  });
}

function columnsFromStar(
  star: Record<string, unknown>,
  schema: ValidationSchema,
  fromTables: string[],
  select?: Record<string, unknown>,
  nullableRelations = new Set<string>(),
): SchemaColumn[] {
  const qualifier = identifierName(star.table)?.toLowerCase();
  const suppressed = qualifier ? new Map<string, Set<string>>() : suppressedJoinColumns(select, schema);
  const selectedTables = schema.tables.filter((table) => {
    if (qualifier) return table.name.toLowerCase() === qualifier;
    if (fromTables.length === 0) return true;
    return fromTables.map((name) => name.toLowerCase()).includes(table.name.toLowerCase());
  });
  return selectedTables.flatMap((table) => table.columns
    .filter((column) => !suppressed.get(table.name.toLowerCase())?.has(column.name.toLowerCase()))
    .map((column) => ({
      ...column,
      nullable: nullableRelations.has(table.name.toLowerCase()) ? true : column.nullable,
    })));
}

function nullableRelationsFromSelect(select: Record<string, unknown> | undefined): Set<string> {
  const nullable = new Set<string>();
  if (!select || !Array.isArray(select.joins)) return nullable;
  const leftNames = relationSourcesFromSelect({ ...select, joins: [] }).map(relationSourceName).filter((name): name is string => Boolean(name));
  for (const join of select.joins) {
    if (!isRecord(join) || !isRecord(join.this)) continue;
    const kind = String(join.kind ?? '');
    const rightName = relationSourceName(join.this);
    if ((kind === 'Left' || kind === 'Full') && rightName) nullable.add(rightName.toLowerCase());
    if (kind === 'Right' || kind === 'Full') {
      for (const leftName of leftNames) nullable.add(leftName.toLowerCase());
    }
  }
  return nullable;
}

function suppressedJoinColumns(select: Record<string, unknown> | undefined, schema: ValidationSchema): Map<string, Set<string>> {
  const suppressed = new Map<string, Set<string>>();
  if (!select || !Array.isArray(select.joins)) return suppressed;
  const leftNames = relationSourcesFromSelect({ ...select, joins: [] }).map(relationSourceName).filter((name): name is string => Boolean(name));
  const leftColumns = new Set(schema.tables
    .filter((table) => leftNames.map((name) => name.toLowerCase()).includes(table.name.toLowerCase()))
    .flatMap((table) => table.columns.map((column) => column.name.toLowerCase())));
  for (const join of select.joins) {
    if (!isRecord(join) || !isRecord(join.this)) continue;
    const rightName = relationSourceName(join.this);
    if (!rightName) continue;
    const usingColumns = Array.isArray(join.using)
      ? join.using.map(identifierName).filter((name): name is string => Boolean(name))
      : [];
    const naturalColumns = join.kind === 'Natural'
      ? schema.tables
        .find((table) => table.name.toLowerCase() === rightName.toLowerCase())
        ?.columns.map((column) => column.name).filter((name) => leftColumns.has(name.toLowerCase())) ?? []
      : [];
    const columns = [...usingColumns, ...naturalColumns].map((name) => name.toLowerCase());
    if (columns.length > 0) suppressed.set(rightName.toLowerCase(), new Set(columns));
  }
  return suppressed;
}

function relationTablesFromQuery(query: unknown, schema: ValidationSchema): SchemaTable[] {
  const select = selectNode(query);
  const sources = relationSourcesFromSelect(select);
  return sources.flatMap((source) => relationTableFromSource(source, schema));
}

function relationSourcesFromSelect(select: Record<string, unknown> | undefined): Record<string, unknown>[] {
  if (!select) return [];
  const from = isRecord(select.from) && Array.isArray(select.from.expressions) ? select.from.expressions : [];
  const joins = Array.isArray(select.joins) ? select.joins.flatMap((join) => isRecord(join) && isRecord(join.this) ? [join.this] : []) : [];
  return [...from, ...joins].filter(isRecord);
}

function relationTableFromSource(source: Record<string, unknown>, schema: ValidationSchema): SchemaTable[] {
  const subquery = isRecord(source.subquery) ? source.subquery : undefined;
  if (subquery) {
    const name = identifierName(subquery.alias);
    if (!name) return [];
    const explicitColumns = Array.isArray(subquery.column_aliases) ? subquery.column_aliases : [];
    return [{ name, columns: columnsFromQuery(subquery.this, schema, explicitColumns) }];
  }
  const alias = isRecord(source.alias) ? source.alias : undefined;
  if (alias && isRecord(alias.this) && isRecord(alias.this.function)) {
    const name = identifierName(alias.alias);
    if (!name) return [];
    const knownTable = knownTableFunction(alias.this, name);
    if (knownTable) return [knownTable];
    const columnAliases = Array.isArray(alias.column_aliases)
      ? alias.column_aliases.map(identifierName).filter((columnName): columnName is string => Boolean(columnName))
      : [];
    if (columnAliases.length === 0) return [];
    const types = tableFunctionColumnTypes(alias.this, schema);
    return [{
      name,
      columns: columnAliases.map((columnName, index) => ({ name: columnName, type: types[index] ?? types[0] ?? 'unknown' })),
    }];
  }
  return [];
}

function knownTableFunction(expression: unknown, alias: string): SchemaTable | undefined {
  const fn = isRecord(expression) ? expression.function : undefined;
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? '').toLowerCase();
  if (name === 'json_each' || name === 'json_tree') {
    return {
      name: alias,
      columns: [
        { name: 'key', type: 'text' },
        { name: 'value', type: 'json' },
        { name: 'type', type: 'text' },
        { name: 'atom', type: 'json' },
        { name: 'id', type: 'integer' },
        { name: 'parent', type: 'integer' },
        { name: 'fullkey', type: 'text' },
        { name: 'path', type: 'text' },
      ],
    };
  }
  return undefined;
}

function tableFunctionColumnTypes(expression: unknown, schema: ValidationSchema): string[] {
  const fn = isRecord(expression) ? expression.function : undefined;
  if (!isRecord(fn)) return [];
  const name = String(fn.name ?? '').toLowerCase();
  if (name === 'generate_series' || name === 'range') {
    const type = commonArgumentType(functionArguments(fn), schema);
    if (type && /date|time|timestamp/i.test(type)) return [type];
    return ['integer'];
  }
  return [];
}

function functionArguments(fn: Record<string, unknown>): unknown[] {
  return Array.isArray(fn.args) ? fn.args : [];
}

function commonArgumentType(args: unknown[], schema: ValidationSchema): string | undefined {
  const types = args
    .map((arg) => inferredType(arg) ?? literalType(arg) ?? schemaColumnType(arg, schema, []))
    .filter((type): type is string => Boolean(type));
  if (types.length === 0) return undefined;
  if (types.some((type) => /text|char|string/i.test(type))) return 'text';
  if (types.some((type) => /timestamp/i.test(type))) return 'timestamp';
  if (types.some((type) => /^date$/i.test(type))) return 'date';
  if (types.some((type) => /decimal|numeric|double|float|real/i.test(type))) return 'decimal';
  if (types.some((type) => /int|number|bigint|smallint/i.test(type))) return 'integer';
  return types[0];
}

function cteTablesFromQuery(query: unknown, schema: ValidationSchema): SchemaTable[] {
  const select = selectNode(query);
  const ctes = isRecord(select?.with) && Array.isArray(select.with.ctes) ? select.with.ctes : [];
  const tables: SchemaTable[] = [];
  for (const cte of ctes) {
    if (!isRecord(cte)) continue;
    const name = identifierName(cte.alias);
    if (!name) continue;
    const availableSchema = mergeSchemas({ tables }, schema);
    tables.push({
      name,
      columns: columnsFromQuery(cte.this, availableSchema, Array.isArray(cte.columns) ? cte.columns : []),
    });
  }
  return tables;
}

function selectNode(query: unknown): Record<string, unknown> | undefined {
  if (isRecord(query) && isRecord(query.union)) return selectNode(query.union.left);
  if (isRecord(query) && isRecord(query.intersect)) return selectNode(query.intersect.left);
  if (isRecord(query) && isRecord(query.except)) return selectNode(query.except.left);
  return isRecord(query) && isRecord(query.select) ? query.select : undefined;
}

function selectExpressions(query: unknown): unknown[] {
  if (isRecord(query) && isRecord(query.union)) return selectExpressions(query.union.left);
  if (isRecord(query) && isRecord(query.intersect)) return selectExpressions(query.intersect.left);
  if (isRecord(query) && isRecord(query.except)) return selectExpressions(query.except.left);
  if (isRecord(query) && isRecord(query.values)) {
    const rows = Array.isArray(query.values.expressions) ? query.values.expressions : [];
    const firstRow = rows.find(isRecord);
    return isRecord(firstRow) && Array.isArray(firstRow.expressions) ? firstRow.expressions : [];
  }
  const select = isRecord(query) ? query.select : undefined;
  return isRecord(select) && Array.isArray(select.expressions) ? select.expressions : [];
}

function selectFromTables(query: unknown): string[] {
  if (isRecord(query) && isRecord(query.union)) return selectFromTables(query.union.left);
  if (isRecord(query) && isRecord(query.intersect)) return selectFromTables(query.intersect.left);
  if (isRecord(query) && isRecord(query.except)) return selectFromTables(query.except.left);
  const select = isRecord(query) ? query.select : undefined;
  return relationSourcesFromSelect(isRecord(select) ? select : undefined)
    .map(relationSourceName)
    .filter((name): name is string => Boolean(name));
}

function relationSourceName(source: Record<string, unknown>): string | undefined {
  if (isRecord(source.table)) return tableNameFromRef(source.table);
  if (isRecord(source.subquery)) return identifierName(source.subquery.alias);
  if (isRecord(source.alias)) return identifierName(source.alias.alias);
  return undefined;
}

function outputName(expression: unknown, index: number): string {
  const alias = isRecord(expression) ? expression.alias : undefined;
  if (isRecord(alias)) return identifierName(alias.alias) ?? `column_${index}`;
  const column = isRecord(expression) ? expression.column : undefined;
  if (isRecord(column)) return identifierName(column.name) ?? `column_${index}`;
  return `column_${index}`;
}

function baseExpression(expression: unknown): unknown {
  const alias = isRecord(expression) ? expression.alias : undefined;
  if (isRecord(alias) && isRecord(alias.this)) return alias.this;
  if (isRecord(expression) && isRecord(expression.this) && isRecord(expression.alias)) return expression.this;
  return expression;
}

function inferredType(expression: unknown): string | undefined {
  try {
    const dataType = ast.getInferredType(expression as never) as unknown;
    if (!isRecord(dataType)) return undefined;
    const value = dataType.data_type ?? dataType.type ?? dataType.name;
    return typeof value === 'string' ? value : undefined;
  } catch {
    return undefined;
  }
}

function dataTypeToString(dataType: unknown): string | undefined {
  if (!isRecord(dataType)) return undefined;
  if (dataType.data_type === 'struct' && Array.isArray(dataType.fields)) {
    const fields = dataType.fields.flatMap((field) => {
      if (!isRecord(field)) return [];
      const name = identifierName(field.name);
      const type = dataTypeToString(field.data_type) ?? 'unknown';
      return name ? [`${name} ${type}`] : [];
    });
    return `struct<${fields.join(', ')}>`;
  }
  if (dataType.data_type === 'array') {
    return `array<${dataTypeToString(dataType.element_type) ?? 'unknown'}>`;
  }
  const value = dataType.data_type === 'custom' && typeof dataType.name === 'string'
    ? dataType.name
    : dataType.data_type ?? dataType.type ?? dataType.name;
  return typeof value === 'string' ? normalizeDataTypeName(value) : undefined;
}

function normalizeDataTypeName(value: string): string {
  const lower = value.toLowerCase();
  if (lower === 'serial' || lower === 'serial4') return 'integer';
  if (lower === 'bigserial' || lower === 'serial8') return 'big_int';
  if (lower === 'smallserial' || lower === 'serial2') return 'small_int';
  return value;
}

function literalType(expression: unknown): string | undefined {
  const literal = isRecord(expression) ? expression.literal : undefined;
  if (!isRecord(literal)) return undefined;
  const literalKind = String(literal.literal_type ?? '');
  const value = String(literal.value ?? '');
  if (literalKind === 'string') return 'text';
  if (literalKind === 'number') return value.includes('.') ? 'decimal' : 'integer';
  if (literalKind === 'boolean') return 'boolean';
  return undefined;
}

function schemaColumnType(expression: unknown, schema: ValidationSchema, fromTables: string[]): string | undefined {
  return schemaColumn(expression, schema, fromTables)?.column.type;
}

function schemaColumnNullable(
  expression: unknown,
  schema: ValidationSchema,
  fromTables: string[],
  nullableRelations = new Set<string>(),
): boolean | undefined {
  const resolved = schemaColumn(expression, schema, fromTables);
  if (!resolved) return undefined;
  return nullableRelations.has(resolved.table.name.toLowerCase()) ? true : resolved.column.nullable;
}

function schemaColumn(expression: unknown, schema: ValidationSchema, fromTables: string[]): { table: SchemaTable; column: SchemaColumn } | undefined {
  const column = isRecord(expression) ? expression.column : undefined;
  if (!isRecord(column)) return undefined;
  const columnName = identifierName(column.name)?.toLowerCase();
  const tableName = identifierName(column.table)?.toLowerCase();
  if (!columnName) return undefined;
  for (const table of schema.tables) {
    if (tableName && table.name.toLowerCase() !== tableName) continue;
    if (!tableName && fromTables.length > 0 && !fromTables.map((name) => name.toLowerCase()).includes(table.name.toLowerCase())) continue;
    const candidate = table.columns.find((schemaColumn) => schemaColumn.name.toLowerCase() === columnName);
    if (candidate) return { table, column: candidate };
  }
  return undefined;
}

function tableNameFromRef(ref: unknown): string | undefined {
  if (!isRecord(ref)) return undefined;
  const nestedName = isRecord(ref.name) ? ref.name.name : ref.name;
  return typeof nestedName === 'string' ? cleanIdentifier(nestedName) : undefined;
}

function tableSchemaFromRef(ref: unknown): string | undefined {
  if (!isRecord(ref)) return undefined;
  return identifierName(ref.schema);
}

function identifierName(identifier: unknown): string | undefined {
  if (!identifier) return undefined;
  if (typeof identifier === 'string') return cleanIdentifier(identifier);
  if (isRecord(identifier) && typeof identifier.name === 'string') return cleanIdentifier(identifier.name);
  if (isRecord(identifier) && isRecord(identifier.name)) return identifierName(identifier.name);
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toPolyglotSchema(schema: ValidationSchema): unknown {
  return {
    tables: schema.tables.map((table) => ({
      ...table,
      columns: table.columns.map((column) => ({ ...column, type: column.type })),
    })),
  };
}

function findCreateTableStatements(sql: string): Array<{ name: string; body: string }> {
  const statements: Array<{ name: string; body: string }> = [];
  const re = /create\s+(?:temporary\s+|temp\s+)?table\s+(?:if\s+not\s+exists\s+)?([`"[\]\w.]+)\s*\(/gi;
  for (const match of sql.matchAll(re)) {
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = findMatchingParen(sql, bodyStart - 1);
    if (bodyEnd > bodyStart) {
      statements.push({ name: match[1], body: sql.slice(bodyStart, bodyEnd) });
    }
  }
  return statements;
}

function findMatchingParen(input: string, openIndex: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = openIndex; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      if (ch === quote && input[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '\'' || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseColumns(body: string): SchemaColumn[] {
  return splitTopLevel(body, ',')
    .map((definition) => definition.trim())
    .filter(Boolean)
    .filter((definition) => !TABLE_CONSTRAINT_RE.test(definition))
    .map(parseColumn)
    .filter((column): column is SchemaColumn => column !== null);
}

function parseColumn(definition: string): SchemaColumn | null {
  const nameMatch = definition.match(/^\s*("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/s);
  if (!nameMatch) {
    return null;
  }
  const name = cleanIdentifier(nameMatch[1]);
  const rest = nameMatch[2].trim();
  const type = extractType(rest);
  if (!type) {
    return null;
  }
  return {
    name,
    type,
    nullable: !/\bnot\s+null\b/i.test(rest) && !/\bprimary\s+key\b/i.test(rest),
    primaryKey: /\bprimary\s+key\b/i.test(rest),
    unique: /\bunique\b/i.test(rest),
  };
}

function extractType(rest: string): string {
  const constraintMatch = rest.search(/\s+(?:constraint|not\s+null|null|primary\s+key|unique|references|default|check|collate|generated)\b/i);
  return (constraintMatch >= 0 ? rest.slice(0, constraintMatch) : rest).trim();
}

export function cleanIdentifier(identifier: string): string {
  return identifier
    .trim()
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/^["`]/, '')
    .replace(/["`]$/, '');
}

export function splitTopLevel(input: string, delimiter: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let depth = 0;
  let quote: string | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      if (ch === quote && input[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '\'' || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && ch === delimiter) {
      parts.push(input.slice(start, i));
      start = i + 1;
    }
  }

  parts.push(input.slice(start));
  return parts;
}

export function mergeSchemas(...schemas: Array<ValidationSchema | undefined>): ValidationSchema {
  return { tables: schemas.flatMap((schema) => schema?.tables ?? []) };
}

function sameTable(left: SchemaTable, right: SchemaTable): boolean {
  if (left.name.toLowerCase() !== right.name.toLowerCase()) return false;
  return (left.schema ?? '').toLowerCase() === (right.schema ?? '').toLowerCase();
}

export function schemaPath(file: string): string {
  return path.normalize(file);
}
