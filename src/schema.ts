import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse, annotateTypes, ast } from '@polyglot-sql/sdk';
import { assertSupportedDialect, normalizeDialect } from './dialect.js';
import { normalizeTypeName } from './sql-type.js';
import type { SchemaColumn, SchemaFunction, SchemaLoadOptions, SchemaProcedure, SchemaTable, ValidationSchema } from './types.js';

const TABLE_CONSTRAINT_RE = /^(?:constraint\s+\S+\s+)?(?:primary\s+key|foreign\s+key|unique|check|period\s+for)\b/i;

export async function resolveSchemaGlobPatterns(patterns: string[], cwd = process.cwd()): Promise<string[]> {
  return (
    await Promise.all(patterns.map((pattern) => globFiles(pattern, cwd)))
  ).flat().sort();
}

export async function loadSchema(patterns: string[], options: SchemaLoadOptions = {}): Promise<ValidationSchema> {
  const cwd = options.cwd ?? process.cwd();
  const files = await resolveSchemaGlobPatterns(patterns, cwd);
  return loadSchemaFiles(files, options);
}

export async function loadSchemaFiles(files: string[], options: SchemaLoadOptions = {}): Promise<ValidationSchema> {
  const dialect = assertSupportedDialect(options.dialect);
  const tables: SchemaTable[] = [];
  const sqlFiles: string[] = [];
  const typeAliases = new Map<string, string>();
  for (const file of files) {
    const sql = await loadSchemaScript(file, dialect);
    sqlFiles.push(sql);
    const astTables = parseCreateTablesWithAst(sql, dialect, typeAliases);
    tables.push(...(astTables.length > 0 ? astTables : parseCreateTablesFallback(sql)));
    tables.push(...parseCreateTableFunctions(sql, dialect));
  }
  const functions = activeScalarFunctionsFromSqlFiles(sqlFiles, dialect);
  let schema: ValidationSchema = { tables, ...(functions.length > 0 ? { functions } : {}) };
  for (const sql of sqlFiles) {
    schema = applySchemaMutations(sql, schema, dialect, typeAliases);
  }
  for (const sql of sqlFiles) {
    for (const table of parseCreateAsTables(sql, schema, dialect)) {
      if (!schema.tables.some((existing) => sameTable(existing, table))) schema.tables.push(table);
    }
    schema.tables.push(...parseCreateSynonyms(sql, schema, dialect));
    schema.tables.push(...parseCreateViews(sql, schema, dialect));
  }
  for (const sql of sqlFiles) {
    schema = applySchemaMutations(sql, schema, dialect, typeAliases);
  }
  const schemaWithFunctions = schema.functions ? schema : mergeSchemas(schema, { tables: [], functions });
  const procedures = activeProceduresFromSqlFiles(sqlFiles, schemaWithFunctions, dialect);

  return mergeSchemas(schema, { tables: [], procedures });
}

async function globFiles(pattern: string, cwd: string): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of glob(pattern, { cwd, withFileTypes: true })) {
    if (entry.isFile()) {
      files.push(path.join(entry.parentPath, entry.name));
    }
  }
  return files;
}

async function loadSchemaScript(file: string, dialect: string, seen = new Set<string>()): Promise<string> {
  const resolved = path.resolve(file);
  if (seen.has(resolved)) return '';
  seen.add(resolved);
  const sql = await readFile(resolved, 'utf8');
  const expanded = await expandSchemaScriptIncludes(sql, dialect, path.dirname(resolved), seen);
  return normalizeSchemaScript(expanded, dialect);
}

async function expandSchemaScriptIncludes(sql: string, dialect: string, baseDir: string, seen: Set<string>): Promise<string> {
  const normalizedDialect = normalizeDialect(dialect);
  const lines = sql.replace(/^\uFEFF/, '').split(/\r?\n/);
  const expanded: string[] = [];
  const psqlConditions = normalizedDialect === 'postgresql' ? newPsqlConditionState() : undefined;
  for (const line of lines) {
    if (psqlConditions && updatePsqlConditionState(psqlConditions, line)) {
      expanded.push(line);
      continue;
    }
    if (psqlConditions && !isPsqlConditionActive(psqlConditions)) {
      expanded.push(line);
      continue;
    }
    const includePath = schemaIncludePath(line, normalizedDialect);
    if (!includePath) {
      expanded.push(line);
      continue;
    }
    expanded.push(await loadSchemaScript(resolveSchemaInclude(includePath, baseDir), normalizedDialect, seen));
  }
  return expanded.join('\n');
}

function schemaIncludePath(line: string, dialect: string): string | undefined {
  const trimmed = line.trim();
  if (dialect === 'oracle') {
    const match = trimmed.match(/^(?:@{1,2}|start\s+)(.+)$/i);
    return match ? unquoteScriptPath(firstScriptArgument(match[1])) : undefined;
  }
  if (dialect === 'postgresql') {
    const match = trimmed.match(/^\\(?:i|include|ir|include_relative)\s+(.+)$/i);
    return match ? unquoteScriptPath(firstScriptArgument(match[1])) : undefined;
  }
  if (['mysql', 'mariadb', 'singlestore', 'tidb'].includes(dialect)) {
    const match = trimmed.match(/^(?:source|\\\.)\s+(.+)$/i);
    return match ? unquoteScriptPath(firstScriptArgument(match[1])) : undefined;
  }
  if (dialect === 'tsql') {
    const match = trimmed.match(/^:r\s+(.+)$/i);
    return match ? unquoteScriptPath(firstScriptArgument(match[1])) : undefined;
  }
  if (dialect === 'sqlite' || dialect === 'duckdb') {
    const match = trimmed.match(/^\.read\s+(.+)$/i);
    return match ? unquoteScriptPath(firstScriptArgument(match[1])) : undefined;
  }
  return undefined;
}

function firstScriptArgument(spec: string | undefined): string {
  if (!spec) return '';
  const trimmed = spec.trim();
  const quoted = trimmed.match(/^(['"])(.*?)\1/);
  if (quoted) return quoted[2] ?? '';
  return trimmed.split(/\s+/)[0] ?? '';
}

function unquoteScriptPath(spec: string): string | undefined {
  const trimmed = spec.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function resolveSchemaInclude(includePath: string, baseDir: string): string {
  return path.isAbsolute(includePath) ? includePath : path.resolve(baseDir, includePath);
}

export function parseCreateTables(sql: string, dialect = 'generic'): SchemaTable[] {
  const normalizedDialect = normalizeDialect(dialect);
  const normalizedSql = normalizeSchemaScript(sql, normalizedDialect);
  const astTables = parseCreateTablesWithAst(normalizedSql, normalizedDialect);
  if (astTables.length > 0) return astTables;
  return parseCreateTablesFallback(normalizedSql);
}

function normalizeSchemaScript(sql: string, dialect: string): string {
  const normalizedDialect = normalizeDialect(dialect);
  if (normalizedDialect === 'postgresql') return normalizePsqlScript(sql);
  if (normalizedDialect === 'oracle') return normalizeOracleSqlPlusScript(sql);
  if (['mysql', 'mariadb', 'singlestore', 'tidb'].includes(normalizedDialect)) return normalizeMysqlDelimiterScript(sql);
  if (normalizedDialect === 'tsql') return normalizeTsqlGoScript(sql);
  if (normalizedDialect === 'sqlite' || normalizedDialect === 'duckdb') return normalizeDotCommandScript(sql);
  return sql;
}

function normalizeDotCommandScript(sql: string): string {
  return sql
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => !/^\s*\.[A-Za-z]/.test(line))
    .join('\n');
}

function normalizePsqlScript(sql: string): string {
  const state = newPsqlConditionState();
  const variables = new Map<string, string>();
  return sql
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .flatMap((line) => {
      if (updatePsqlConditionState(state, line)) return [];
      if (!isPsqlConditionActive(state)) return [];
      const setVariable = psqlSetVariable(line);
      if (setVariable) {
        variables.set(setVariable.name.toLowerCase(), setVariable.value);
        return [];
      }
      const unsetVariable = psqlUnsetVariable(line);
      if (unsetVariable) {
        variables.delete(unsetVariable.toLowerCase());
        return [];
      }
      if (/^\s*\\/.test(line)) return [];
      return [applyPsqlVariables(line, variables)];
    })
    .join('\n');
}

type PsqlConditionFrame = {
  parentActive: boolean;
  active: boolean;
  matched: boolean;
};

function newPsqlConditionState(): PsqlConditionFrame[] {
  return [];
}

function updatePsqlConditionState(state: PsqlConditionFrame[], line: string): boolean {
  const match = line.trim().match(/^\\(if|elif|else|endif)\b(?:\s+(.*))?$/i);
  if (!match) return false;
  const command = match[1]?.toLowerCase();
  const expression = match[2] ?? '';
  if (command === 'if') {
    const parentActive = isPsqlConditionActive(state);
    const active = parentActive && psqlBooleanExpression(expression) !== false;
    state.push({ parentActive, active, matched: active });
    return true;
  }
  const current = state.at(-1);
  if (!current) return true;
  if (command === 'elif') {
    const active = current.parentActive && !current.matched && psqlBooleanExpression(expression) !== false;
    current.active = active;
    current.matched = current.matched || active;
    return true;
  }
  if (command === 'else') {
    const active = current.parentActive && !current.matched;
    current.active = active;
    current.matched = true;
    return true;
  }
  if (command === 'endif') {
    state.pop();
    return true;
  }
  return true;
}

function isPsqlConditionActive(state: PsqlConditionFrame[]): boolean {
  return state.every((frame) => frame.active);
}

function psqlBooleanExpression(expression: string): boolean | undefined {
  const normalized = expression.trim().replace(/^['"]|['"]$/g, '').toLowerCase();
  if (['false', 'off', 'no', '0'].includes(normalized)) return false;
  if (['true', 'on', 'yes', '1'].includes(normalized)) return true;
  return undefined;
}

function psqlSetVariable(line: string): { name: string; value: string } | undefined {
  const match = line.trim().match(/^\\set\s+([A-Za-z_][\w]*)\s*(.*)$/i);
  if (!match) return undefined;
  return {
    name: match[1] ?? '',
    value: unquotePsqlValue(match[2] ?? ''),
  };
}

function psqlUnsetVariable(line: string): string | undefined {
  return line.trim().match(/^\\unset\s+([A-Za-z_][\w]*)\b/i)?.[1];
}

function unquotePsqlValue(value: string): string {
  const trimmed = value.trim();
  const quoted = trimmed.match(/^(['"])([\s\S]*)\1$/);
  return quoted ? quoted[2] ?? '' : trimmed;
}

function applyPsqlVariables(line: string, variables: Map<string, string>): string {
  return line
    .replace(/(?<!:):'([A-Za-z_][\w]*)'/g, (match, name: string) => variables.get(name.toLowerCase()) ?? match)
    .replace(/(?<!:):"([A-Za-z_][\w]*)"/g, (match, name: string) => quoteIdentifier(variables.get(name.toLowerCase())) ?? match)
    .replace(/(?<!:):([A-Za-z_][\w]*)/g, (match, name: string) => variables.get(name.toLowerCase()) ?? match);
}

function quoteIdentifier(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return `"${value.replace(/"/g, '""')}"`;
}

function normalizeOracleSqlPlusScript(sql: string): string {
  const statements: string[] = [];
  let buffer: string[] = [];
  const variables = new Map<string, string>();
  let defineOn = true;
  for (const line of sql.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '/') {
      pushBufferedStatement(statements, buffer);
      buffer = [];
      continue;
    }
    const defineSetting = sqlPlusDefineSetting(trimmed);
    if (defineSetting !== undefined) {
      defineOn = defineSetting;
      continue;
    }
    const defined = sqlPlusDefine(trimmed);
    if (defined) {
      variables.set(defined.name.toLowerCase(), defined.value);
      continue;
    }
    const undefinedName = sqlPlusUndefine(trimmed);
    if (undefinedName) {
      variables.delete(undefinedName.toLowerCase());
      continue;
    }
    if (isSqlPlusCommand(trimmed)) continue;
    buffer.push(defineOn ? applySqlPlusVariables(line, variables) : line);
  }
  pushBufferedStatement(statements, buffer);
  return statements.join('\n');
}

function isSqlPlusCommand(line: string): boolean {
  return /^(?:set|prompt|spool|whenever|define|undefine|variable|column|remark|rem)\b/i.test(line);
}

function sqlPlusDefineSetting(line: string): boolean | undefined {
  const match = line.match(/^set\s+define\s+(on|off)\b/i);
  if (!match) return undefined;
  return match[1]?.toLowerCase() === 'on';
}

function sqlPlusDefine(line: string): { name: string; value: string } | undefined {
  const match = line.match(/^define\s+([A-Za-z_][\w$#]*)\s*(?:=\s*)?(.+)$/i);
  if (!match) return undefined;
  return {
    name: match[1] ?? '',
    value: unquoteSqlPlusValue(match[2] ?? ''),
  };
}

function sqlPlusUndefine(line: string): string | undefined {
  return line.match(/^undefine\s+([A-Za-z_][\w$#]*)\b/i)?.[1];
}

function unquoteSqlPlusValue(value: string): string {
  const trimmed = value.trim();
  const quoted = trimmed.match(/^(['"])([\s\S]*)\1$/);
  return quoted ? quoted[2] ?? '' : trimmed;
}

function applySqlPlusVariables(line: string, variables: Map<string, string>): string {
  return line.replace(/&&?([A-Za-z_][\w$#]*)(\.)?/g, (match, name: string, delimiter: string | undefined, offset: number, source: string) => {
    const value = variables.get(name.toLowerCase());
    if (value === undefined) return match;
    const next = source[offset + match.length];
    return delimiter && next === '.' ? value : `${value}${delimiter ?? ''}`;
  }).replace(/(?<=\w)\.\./g, '.');
}

function normalizeMysqlDelimiterScript(sql: string): string {
  const statements: string[] = [];
  let delimiter = ';';
  let buffer = '';
  let defaultSchema: string | undefined;
  for (const line of sql.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const delimiterMatch = line.trim().match(/^delimiter\s+(.+)$/i);
    if (delimiterMatch) {
      defaultSchema = pushMysqlDelimitedStatement(statements, buffer, defaultSchema);
      buffer = '';
      delimiter = delimiterMatch[1] ?? ';';
      continue;
    }
    buffer += `${line}\n`;
    if (buffer.trimEnd().endsWith(delimiter)) {
      buffer = buffer.trimEnd().slice(0, -delimiter.length);
      defaultSchema = pushMysqlDelimitedStatement(statements, buffer, defaultSchema);
      buffer = '';
    }
  }
  pushMysqlDelimitedStatement(statements, buffer, defaultSchema);
  return statements.join('\n');
}

function pushMysqlDelimitedStatement(statements: string[], statement: string, defaultSchema: string | undefined): string | undefined {
  const trimmed = statement.trim();
  if (!trimmed) return defaultSchema;
  const useMatch = trimmed.match(/^use\s+(.+?)\s*;?$/i);
  if (useMatch) return cleanIdentifier(useMatch[1].trim());
  pushDelimitedStatement(statements, qualifyMysqlSchemaObject(trimmed, defaultSchema));
  return defaultSchema;
}

function qualifyMysqlSchemaObject(statement: string, defaultSchema: string | undefined): string {
  if (!defaultSchema) return statement;
  return statement.replace(
    /^(\s*create\s+(?:(?:or\s+replace|temporary)\s+)*(?:table|view|procedure|function)\s+)(?!if\s+not\s+exists\s+)([`"']?[\w$]+[`"']?)(\s|\()/i,
    (match, prefix: string, name: string, suffix: string) => {
      if (name.includes('.')) return match;
      return `${prefix}${quoteSchemaObject(defaultSchema, name)}${suffix}`;
    },
  ).replace(
    /^(\s*create\s+(?:(?:or\s+replace|temporary)\s+)*table\s+if\s+not\s+exists\s+)([`"']?[\w$]+[`"']?)(\s|\()/i,
    (match, prefix: string, name: string, suffix: string) => {
      if (name.includes('.')) return match;
      return `${prefix}${quoteSchemaObject(defaultSchema, name)}${suffix}`;
    },
  );
}

function quoteSchemaObject(schema: string, objectName: string): string {
  const cleanedSchema = cleanIdentifier(schema);
  const quote = objectName.startsWith('`') ? '`' : objectName.startsWith('"') ? '"' : objectName.startsWith("'") ? "'" : '';
  return quote ? `${quote}${cleanedSchema}${quote}.${objectName}` : `${cleanedSchema}.${objectName}`;
}

function normalizeTsqlGoScript(sql: string): string {
  const statements: string[] = [];
  let buffer: string[] = [];
  const variables = new Map<string, string>();
  for (const line of sql.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const setVar = sqlcmdSetVar(line);
    if (setVar) {
      variables.set(setVar.name.toLowerCase(), setVar.value);
      continue;
    }
    if (/^\s*:[A-Za-z]/.test(line)) continue;
    if (/^\s*go(?:\s+\d+)?\s*$/i.test(line)) {
      pushBufferedStatement(statements, buffer);
      buffer = [];
      continue;
    }
    buffer.push(applySqlcmdVariables(line, variables));
  }
  pushBufferedStatement(statements, buffer);
  return statements.join('\n');
}

function sqlcmdSetVar(line: string): { name: string; value: string } | undefined {
  const match = line.trim().match(/^:setvar\s+([A-Za-z_][\w]*)\s*(.*)$/i);
  if (!match) return undefined;
  return {
    name: match[1] ?? '',
    value: unquoteSqlcmdValue(match[2] ?? ''),
  };
}

function unquoteSqlcmdValue(value: string): string {
  const trimmed = value.trim();
  const quoted = trimmed.match(/^(['"])([\s\S]*)\1$/);
  return quoted ? quoted[2] ?? '' : trimmed;
}

function applySqlcmdVariables(line: string, variables: Map<string, string>): string {
  return line.replace(/\$\(([^)]+)\)/g, (match, name: string) => variables.get(name.toLowerCase()) ?? match);
}

function pushBufferedStatement(statements: string[], buffer: string[]): void {
  pushDelimitedStatement(statements, buffer.join('\n'));
}

function pushDelimitedStatement(statements: string[], statement: string): void {
  const trimmed = statement.trim();
  if (!trimmed) return;
  statements.push(trimmed.endsWith(';') ? trimmed : `${trimmed};`);
}

function parseCreateTablesWithAst(sql: string, dialect = 'generic', typeAliases = new Map<string, string>()): SchemaTable[] {
  const parseResult = parse(sql, dialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return [];
  const tables: SchemaTable[] = [];
  for (const statement of parseResult.ast) {
    rememberTypeAlias(statement, typeAliases);
    tables.push(...tableFromCreateTableStatement(statement, typeAliases));
  }
  return tables;
}

function tableFromCreateTableStatement(statement: unknown, typeAliases = new Map<string, string>()): SchemaTable[] {
  if (!isRecord(statement) || !isRecord(statement.create_table) || statement.create_table.as_select) return [];
  const createTable = statement.create_table;
  const tableName = tableNameFromRef(createTable.name);
  if (!tableName) return [];
  const schema = tableSchemaFromRef(createTable.name);
  const columns = Array.isArray(createTable.columns) ? createTable.columns.map((column) => schemaColumnFromColumnDef(column, typeAliases)).filter((column): column is SchemaColumn => column !== null) : [];
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

function schemaColumnFromColumnDef(column: unknown, typeAliases = new Map<string, string>()): SchemaColumn | null {
  if (!isRecord(column)) return null;
  const name = identifierName(column.name);
  if (!name) return null;
  if (name.toLowerCase() === 'period' && dataTypeToString(column.data_type)?.toLowerCase() === 'for system_time') return null;
  const primaryKey = column.primary_key === true;
  const nullableType = isRecord(column.data_type) && column.data_type.data_type === 'nullable';
  return {
    name,
    type: dataTypeToStringWithAliases(column.data_type, typeAliases) ?? 'unknown',
    nullable: primaryKey ? false : nullableType ? true : typeof column.nullable === 'boolean' ? column.nullable : undefined,
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

function rememberTypeAlias(statement: unknown, typeAliases: Map<string, string>): void {
  if (!isRecord(statement) || !isRecord(statement.create_type)) return;
  const name = tableNameFromRef(statement.create_type.name);
  const type = typeFromCreateTypeDefinition(statement.create_type.definition);
  if (name && type) typeAliases.set(name.toLowerCase(), type);
}

function typeFromCreateTypeDefinition(definition: unknown): string | undefined {
  if (!isRecord(definition)) return undefined;
  const domain = isRecord(definition.Domain) ? definition.Domain : undefined;
  if (domain) return dataTypeToString(domain.base_type);
  if (Array.isArray(definition.Enum)) return 'text';
  if (Array.isArray(definition.Composite)) {
    const fields = definition.Composite.flatMap((field) => {
      if (!isRecord(field)) return [];
      const name = identifierName(field.name);
      const type = dataTypeToString(field.data_type) ?? 'unknown';
      return name ? [`${name} ${type}`] : [];
    });
    return `struct<${fields.join(', ')}>`;
  }
  return undefined;
}

function tableFromCreateTableFunctionStatement(statement: unknown): SchemaTable[] {
  if (!isRecord(statement) || !isRecord(statement.create_function)) return [];
  const createFunction = statement.create_function;
  const name = tableNameFromRef(createFunction.name);
  if (!name) return [];
  const body = typeof createFunction.returns_table_body === 'string' ? createFunction.returns_table_body : undefined;
  const match = body?.match(/^table\s*\(([\s\S]*)\)$/i);
  const columns = columnsFromSchemaString(match?.[1]);
  if (columns.length === 0) return [];
  const schema = tableSchemaFromRef(createFunction.name);
  return [{ name, ...(schema ? { schema } : {}), columns, uniqueKeys: [], foreignKeys: [] }];
}

function columnsFromSchemaString(spec: string | undefined): SchemaColumn[] {
  if (!spec) return [];
  return splitTopLevel(spec, ',').flatMap((part) => {
    const match = part.trim().match(/^([`"']?[\w$]+[`"']?)\s+(.+)$/);
    if (!match) return [];
    const name = cleanIdentifier(match[1]);
    const type = dataTypeFromRawColumnSpec(match[2]) ?? 'unknown';
    return name ? [{ name, type }] : [];
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
  const normalizedDialect = normalizeDialect(dialect);
  const normalizedSql = normalizeSchemaScript(sql, normalizedDialect);
  const parseResult = parse(normalizedSql, normalizedDialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return parseCreateValuesViewsFallback(normalizedSql, schema, normalizedDialect);
  const annotated = annotateViewTypes(normalizedSql, schema, normalizedDialect) ?? parseResult.ast;
  return uniqueSchemaTables([
    ...annotated.flatMap((statement) => viewFromStatement(statement, schema)),
    ...parseCreateValuesViewsFallback(normalizedSql, schema, normalizedDialect),
  ]);
}

export function parseCreateAsTables(sql: string, schema: ValidationSchema = { tables: [] }, dialect = 'generic'): SchemaTable[] {
  const normalizedDialect = normalizeDialect(dialect);
  const normalizedSql = normalizeSchemaScript(sql, normalizedDialect);
  const parseResult = parse(normalizedSql, normalizedDialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return parseCreateValuesTablesFallback(normalizedSql, schema, normalizedDialect);
  const annotated = annotateViewTypes(normalizedSql, schema, normalizedDialect) ?? parseResult.ast;
  return uniqueSchemaTables([
    ...annotated.flatMap((statement) => tableFromCreateAsStatement(statement, schema)),
    ...parseCreateValuesTablesFallback(normalizedSql, schema, normalizedDialect),
  ]);
}

export function parseCreateSynonyms(sql: string, schema: ValidationSchema = { tables: [] }, dialect = 'generic'): SchemaTable[] {
  const normalizedDialect = normalizeDialect(dialect);
  const normalizedSql = normalizeSchemaScript(sql, normalizedDialect);
  const parseResult = parse(normalizedSql, normalizedDialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return [];
  return parseResult.ast.flatMap((statement) => synonymFromStatement(statement, schema));
}

export function parseCreateTableFunctions(sql: string, dialect = 'generic'): SchemaTable[] {
  const normalizedDialect = normalizeDialect(dialect);
  const normalizedSql = normalizeSchemaScript(sql, normalizedDialect);
  const parseResult = parse(normalizedSql, normalizedDialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return [];
  return parseResult.ast.flatMap(tableFromCreateTableFunctionStatement);
}

export function parseCreateScalarFunctions(sql: string, dialect = 'generic'): SchemaFunction[] {
  const normalizedDialect = normalizeDialect(dialect);
  const normalizedSql = normalizeSchemaScript(sql, normalizedDialect);
  const parseResult = parse(normalizedSql, normalizedDialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return [];
  return parseResult.ast.flatMap(functionFromCreateFunctionStatement);
}

function activeScalarFunctionsFromSqlFiles(sqlFiles: string[], dialect: string): SchemaFunction[] {
  const functions = new Map<string, SchemaFunction>();
  for (const sql of sqlFiles) {
    const parseResult = parse(sql, dialect as never) as { success: boolean; ast?: unknown[] };
    if (!parseResult.success || !Array.isArray(parseResult.ast)) continue;
    for (const statement of parseResult.ast) {
      for (const fn of functionFromCreateFunctionStatement(statement)) {
        functions.set(schemaObjectKey(fn), fn);
      }
      const dropped = droppedRoutineRef(statement, 'drop_function');
      if (dropped) functions.delete(dropped);
    }
  }
  return [...functions.values()];
}

export function parseCreateProcedures(sql: string, schema: ValidationSchema = { tables: [] }, dialect = 'generic'): SchemaProcedure[] {
  const normalizedDialect = normalizeDialect(dialect);
  const normalizedSql = normalizeSchemaScript(sql, normalizedDialect);
  const parseResult = parse(normalizedSql, normalizedDialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return [];
  return parseResult.ast.flatMap((statement) => procedureFromCreateProcedureStatement(statement, schema, normalizedDialect));
}

function activeProceduresFromSqlFiles(sqlFiles: string[], schema: ValidationSchema, dialect: string): SchemaProcedure[] {
  const procedures = new Map<string, SchemaProcedure>();
  for (const sql of sqlFiles) {
    const parseResult = parse(sql, dialect as never) as { success: boolean; ast?: unknown[] };
    if (!parseResult.success || !Array.isArray(parseResult.ast)) continue;
    for (const statement of parseResult.ast) {
      for (const procedure of procedureFromCreateProcedureStatement(statement, schema, dialect)) {
        procedures.set(schemaObjectKey(procedure), procedure);
      }
      const dropped = droppedRoutineRef(statement, 'drop_procedure');
      if (dropped) procedures.delete(dropped);
    }
  }
  return [...procedures.values()];
}

function droppedRoutineRef(statement: unknown, key: 'drop_function' | 'drop_procedure'): string | undefined {
  if (!isRecord(statement) || !isRecord(statement[key])) return undefined;
  const name = tableNameFromRef(statement[key].name);
  if (!name) return undefined;
  const schema = tableSchemaFromRef(statement[key].name);
  return schemaObjectKey({ name, ...(schema ? { schema } : {}) });
}

function schemaObjectKey(object: { name: string; schema?: string }): string {
  return `${object.schema ?? ''}.${object.name}`.toLowerCase();
}

function procedureFromCreateProcedureStatement(statement: unknown, schema: ValidationSchema, dialect: string): SchemaProcedure[] {
  if (!isRecord(statement) || !isRecord(statement.create_procedure)) return [];
  const createProcedure = statement.create_procedure;
  const name = tableNameFromRef(createProcedure.name);
  if (!name) return [];
  const columns = columnsFromProcedureDefinition(createProcedure, schema, dialect);
  if (columns.length === 0) return [];
  const procedureSchema = tableSchemaFromRef(createProcedure.name);
  return [{ name, ...(procedureSchema ? { schema: procedureSchema } : {}), columns }];
}

function columnsFromProcedureDefinition(createProcedure: Record<string, unknown>, schema: ValidationSchema, dialect: string): SchemaColumn[] {
  const returnColumns = columnsFromProcedureReturnType(createProcedure.return_type);
  if (returnColumns.length > 0) return returnColumns;
  const body = isRecord(createProcedure.body) ? createProcedure.body : undefined;
  if (body && isRecord(body.Expression)) {
    const literal = findLiteral(body.Expression);
    if (isRecord(literal) && literal.literal_type === 'dollar_string' && typeof literal.value === 'string') {
      return columnsFromProcedureSql(literal.value, schema, dialect);
    }
    return columnsFromQuery(body.Expression, schema);
  }
  const rawBlock = body && typeof body.RawBlock === 'string' ? body.RawBlock : undefined;
  return rawBlock ? columnsFromProcedureSql(rawBlock, schema, dialect) : [];
}

function columnsFromProcedureReturnType(returnType: unknown): SchemaColumn[] {
  if (!isRecord(returnType)) return [];
  const custom = returnType.data_type === 'custom' && typeof returnType.name === 'string' ? returnType.name : undefined;
  const match = custom?.match(/^table\s*\(([\s\S]*)\)$/i);
  return columnsFromSchemaString(match?.[1]);
}

function columnsFromProcedureSql(sql: string, schema: ValidationSchema, dialect: string): SchemaColumn[] {
  const body = sql.trim().replace(/^begin\b/i, '').replace(/\bend\s*$/i, '').trim();
  if (!/\bselect\b/i.test(body)) return [];
  const parseResult = parse(body, dialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return [];
  for (const statement of parseResult.ast) {
    const columns = columnsFromQuery(statement, schema);
    if (columns.length > 0) return columns;
  }
  return [];
}

function findLiteral(expression: unknown): unknown {
  if (!isRecord(expression)) return undefined;
  if (isRecord(expression.literal)) return expression.literal;
  for (const value of Object.values(expression)) {
    const found = findLiteral(value);
    if (found) return found;
  }
  return undefined;
}

function functionFromCreateFunctionStatement(statement: unknown): SchemaFunction[] {
  if (!isRecord(statement) || !isRecord(statement.create_function)) return [];
  const createFunction = statement.create_function;
  const name = tableNameFromRef(createFunction.name);
  const returnType = dataTypeToString(createFunction.return_type);
  if (!name || !returnType) return [];
  const schema = tableSchemaFromRef(createFunction.name);
  return [{ name, ...(schema ? { schema } : {}), returnType }];
}

function applySchemaMutations(sql: string, schema: ValidationSchema, dialect = 'generic', typeAliases = new Map<string, string>()): ValidationSchema {
  const normalizedDialect = normalizeDialect(dialect);
  const parseResult = parse(sql, normalizedDialect as never) as { success: boolean; ast?: unknown[] };
  if (!parseResult.success || !Array.isArray(parseResult.ast)) return schema;
  return parseResult.ast.reduce<ValidationSchema>((current, statement) => {
    if (!isRecord(statement)) return current;
    rememberTypeAlias(statement, typeAliases);
    if (isRecord(statement.alter_table)) return schemaAfterAlterTable(statement.alter_table, current, typeAliases);
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
  const matchesSchema = (schemaName: string | undefined) => schemaName?.toLowerCase() === name.toLowerCase();
  return {
    tables: schema.tables.filter((table) => !matchesSchema(table.schema)),
    ...(schema.functions ? { functions: schema.functions.filter((fn) => !matchesSchema(fn.schema)) } : {}),
    ...(schema.procedures ? { procedures: schema.procedures.filter((procedure) => !matchesSchema(procedure.schema)) } : {}),
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
      ...(schema.functions ? {
        functions: schema.functions.map((fn) => fn.schema?.toLowerCase() === oldName.toLowerCase() ? { ...fn, schema: newName } : fn),
      } : {}),
      ...(schema.procedures ? {
        procedures: schema.procedures.map((procedure) => procedure.schema?.toLowerCase() === oldName.toLowerCase() ? { ...procedure, schema: newName } : procedure),
      } : {}),
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

function schemaAfterAlterTable(alterTable: Record<string, unknown>, schema: ValidationSchema, typeAliases = new Map<string, string>()): ValidationSchema {
  const tableName = tableNameFromRef(alterTable.name);
  if (!tableName || !Array.isArray(alterTable.actions)) return schema;
  const schemaName = tableSchemaFromRef(alterTable.name);
  return {
    tables: schema.tables.map((table) => {
      if (table.name.toLowerCase() !== tableName.toLowerCase()) return table;
      if (schemaName && table.schema?.toLowerCase() !== schemaName.toLowerCase()) return table;
      return applyAlterActions(table, alterTable.actions as unknown[], typeAliases);
    }),
  };
}

function applyAlterActions(table: SchemaTable, actions: unknown[], typeAliases = new Map<string, string>()): SchemaTable {
  return actions.reduce<SchemaTable>((current, action) => {
    if (!isRecord(action)) return current;
    if (isRecord(action.RenameTable)) return renameAlterTable(current, action.RenameTable);
    if (isRecord(action.AddColumn)) return addAlterColumn(current, action.AddColumn.column, typeAliases);
    if (isRecord(action.DropColumn)) return dropAlterColumn(current, action.DropColumn.name);
    if (isRecord(action.RenameColumn)) return renameAlterColumn(current, action.RenameColumn.old_name, action.RenameColumn.new_name);
    if (isRecord(action.ChangeColumn)) return changeAlterColumn(current, action.ChangeColumn, typeAliases);
    if (isRecord(action.AlterColumn)) return alterColumn(current, action.AlterColumn, typeAliases);
    if (isRecord(action.AddConstraint)) return addAlterConstraint(current, action.AddConstraint);
    if (isRecord(action.Raw)) return applyRawAlterAction(current, action.Raw, typeAliases);
    return current;
  }, { ...table, columns: [...table.columns] });
}

function renameAlterTable(table: SchemaTable, tableRef: unknown): SchemaTable {
  const name = tableNameFromRef(tableRef);
  const schemaName = tableSchemaFromRef(tableRef);
  if (!name) return table;
  return { ...table, name, ...(schemaName ? { schema: schemaName } : {}) };
}

function addAlterColumn(table: SchemaTable, columnDefinition: unknown, typeAliases = new Map<string, string>()): SchemaTable {
  const column = schemaColumnFromColumnDef(columnDefinition, typeAliases);
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

function changeAlterColumn(table: SchemaTable, changeColumn: Record<string, unknown>, typeAliases = new Map<string, string>()): SchemaTable {
  const oldName = identifierName(changeColumn.old_name);
  const newName = identifierName(changeColumn.new_name);
  if (!oldName || !newName) return table;
  const type = dataTypeToStringWithAliases(changeColumn.data_type, typeAliases);
  return {
    ...table,
    columns: table.columns.map((column) => column.name.toLowerCase() === oldName.toLowerCase()
      ? { ...column, name: newName, ...(type ? { type } : {}) }
      : column),
  };
}

function alterColumn(table: SchemaTable, alterColumnNode: Record<string, unknown>, typeAliases = new Map<string, string>()): SchemaTable {
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
        const type = dataTypeToStringWithAliases(action.SetDataType.data_type, typeAliases);
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

function applyRawAlterAction(table: SchemaTable, raw: Record<string, unknown>, typeAliases = new Map<string, string>()): SchemaTable {
  const sql = typeof raw.sql === 'string' ? raw.sql : '';
  const modifyColumn = sql.match(/^modify\s+(?:column\s+)?("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/i);
  if (modifyColumn) {
    const columnName = cleanIdentifier(modifyColumn[1]);
    const type = dataTypeFromRawColumnSpec(modifyColumn[2], typeAliases);
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

function dataTypeFromRawColumnSpec(spec: string, typeAliases = new Map<string, string>()): string | undefined {
  const type = spec.trim().split(/\s+/)[0];
  if (!type) return undefined;
  const normalized = normalizeDataTypeName(cleanIdentifier(type));
  return typeAliases.get(normalized.toLowerCase()) ?? normalized;
}

function tableFromCreateAsStatement(statement: unknown, schema: ValidationSchema): SchemaTable[] {
  if (!isRecord(statement) || !isRecord(statement.create_table)) return [];
  const createTable = statement.create_table;
  const name = tableNameFromRef(createTable.name);
  if (!name) return [];
  const schemaName = tableSchemaFromRef(createTable.name);
  if (!createTable.as_select) {
    const copied = copiedTableColumns(createTable, schema);
    const explicitColumns = Array.isArray(createTable.columns)
      ? createTable.columns.map((column) => schemaColumnFromColumnDef(column)).filter((column): column is SchemaColumn => column !== null)
      : [];
    return copied ? [{ name, ...(schemaName ? { schema: schemaName } : {}), columns: mergeSchemaColumns(copied, explicitColumns) }] : [];
  }
  const explicitColumns = Array.isArray(createTable.columns) ? createTable.columns : [];
  if (explicitColumns.length > 0) {
    const hasExplicitTypes = explicitColumns.some((column) => isRecord(column) && Boolean(dataTypeToString(column.data_type)));
    if (createTable.as_select && !hasExplicitTypes) {
      return [{
        name,
        ...(schemaName ? { schema: schemaName } : {}),
        columns: columnsFromQuery(createTable.as_select, schema, explicitColumns),
      }];
    }
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

function mergeSchemaColumns(baseColumns: SchemaColumn[], extraColumns: SchemaColumn[]): SchemaColumn[] {
  const columns = baseColumns.map((column) => ({ ...column }));
  for (const column of extraColumns) {
    const existingIndex = columns.findIndex((candidate) => candidate.name.toLowerCase() === column.name.toLowerCase());
    if (existingIndex >= 0) {
      columns[existingIndex] = column;
    } else {
      columns.push(column);
    }
  }
  return columns;
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
    if (targetSchema && table.schema && table.schema.toLowerCase() !== targetSchema.toLowerCase()) return false;
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
  const explicitColumns = definitionColumns(view);
  const columns = columnsFromQuery(view.query, schema, explicitColumns);
  return [{ name, ...(schemaName ? { schema: schemaName } : {}), columns }];
}

function parseCreateValuesViewsFallback(sql: string, schema: ValidationSchema, dialect: string): SchemaTable[] {
  return findCreateValuesStatements(sql, 'view').flatMap((statement) => {
    const parsedValues = parse(statement.valuesSql, dialect as never) as { success: boolean; ast?: unknown[] };
    if (!parsedValues.success || !Array.isArray(parsedValues.ast)) return [];
    const query = parsedValues.ast.find(isRecord);
    if (!query) return [];
    const rawName = cleanIdentifier(statement.name);
    const nameParts = rawName.split('.');
    const name = nameParts.pop() ?? rawName;
    const schemaName = nameParts.length > 0 ? nameParts.join('.') : undefined;
    return [{
      name,
      ...(schemaName ? { schema: schemaName } : {}),
      columns: columnsFromQuery(query, schema, statement.columns),
    }];
  });
}

function parseCreateValuesTablesFallback(sql: string, schema: ValidationSchema, dialect: string): SchemaTable[] {
  return findCreateValuesStatements(sql, 'table').flatMap((statement) => {
    const parsedValues = parse(statement.valuesSql, dialect as never) as { success: boolean; ast?: unknown[] };
    if (!parsedValues.success || !Array.isArray(parsedValues.ast)) return [];
    const query = parsedValues.ast.find(isRecord);
    if (!query) return [];
    const rawName = cleanIdentifier(statement.name);
    const nameParts = rawName.split('.');
    const name = nameParts.pop() ?? rawName;
    const schemaName = nameParts.length > 0 ? nameParts.join('.') : undefined;
    return [{
      name,
      ...(schemaName ? { schema: schemaName } : {}),
      columns: columnsFromQuery(query, schema, statement.columns),
    }];
  });
}

function uniqueSchemaTables(tables: SchemaTable[]): SchemaTable[] {
  return tables.filter((table, index) => !tables.slice(0, index).some((existing) => sameTable(existing, table)));
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
    if (isRecord(star)) {
      return applyExplicitColumnNames(columnsFromStar(star, effectiveSchema, fromTables, select, nullableRelations), explicitColumns, index);
    }
    const columnName = cleanIdentifier(definitionColumnName(explicitColumns[index]) ?? outputName(expression, index + 1));
    const base = baseExpression(expression);
    return [{
      name: columnName,
      type: schemaFunctionReturnType(base, effectiveSchema) ?? expressionType(base, effectiveSchema, fromTables) ?? 'unknown',
      nullable: schemaColumnNullable(base, effectiveSchema, fromTables, nullableRelations),
    }];
  });
}

function applyExplicitColumnNames(columns: SchemaColumn[], explicitColumns: unknown[], offset = 0): SchemaColumn[] {
  if (explicitColumns.length === 0) return columns;
  return columns.map((column, index) => ({
    ...column,
    name: cleanIdentifier(definitionColumnName(explicitColumns[offset + index]) ?? column.name),
  }));
}

function definitionColumns(definition: Record<string, unknown>): unknown[] {
  if (Array.isArray(definition.columns) && definition.columns.length > 0) return definition.columns;
  if (isRecord(definition.schema) && Array.isArray(definition.schema.expressions)) return definition.schema.expressions;
  return [];
}

function definitionColumnName(column: unknown): string | undefined {
  if (isRecord(column) && isRecord(column.column_def)) return definitionColumnName(column.column_def);
  return isRecord(column) ? identifierName(column.name) ?? identifierName(column) : identifierName(column);
}

function schemaFunctionReturnType(expression: unknown, schema: ValidationSchema): string | undefined {
  const fn = findFunctionExpression(expression);
  if (!fn) return undefined;
  const name = typeof fn.name === 'string' ? fn.name : identifierName(fn.name);
  if (!name) return undefined;
  const normalizedName = name.toLowerCase();
  return schema.functions?.find((candidate) => {
    if (candidate.name.toLowerCase() === normalizedName) return true;
    return candidate.schema ? `${candidate.schema}.${candidate.name}`.toLowerCase() === normalizedName : false;
  })?.returnType;
}

function findFunctionExpression(expression: unknown): Record<string, unknown> | undefined {
  if (!isRecord(expression)) return undefined;
  if (isRecord(expression.function)) return expression.function;
  for (const value of Object.values(expression)) {
    const found = findFunctionExpression(value);
    if (found) return found;
  }
  return undefined;
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
    .map((arg) => expressionType(arg, schema, []))
    .filter((type): type is string => Boolean(type));
  if (types.length === 0) return undefined;
  if (types.some((type) => /text|char|string/i.test(type))) return 'text';
  if (types.some((type) => /timestamp/i.test(type))) return 'timestamp';
  if (types.some((type) => /^date$/i.test(type))) return 'date';
  if (types.some((type) => /decimal|numeric|double|float|real/i.test(type))) return 'decimal';
  if (types.some((type) => /int|number|bigint|smallint/i.test(type))) return 'integer';
  return types[0];
}

function expressionType(expression: unknown, schema: ValidationSchema, fromTables: string[]): string | undefined {
  return castType(expression)
    ?? inferredType(expression)
    ?? schemaColumnType(expression, schema, fromTables)
    ?? literalType(expression)
    ?? aggregateType(expression, schema, fromTables)
    ?? windowFunctionType(expression, schema, fromTables)
    ?? scalarFunctionType(expression, schema, fromTables)
    ?? coalesceType(expression, schema, fromTables)
    ?? caseType(expression, schema, fromTables)
    ?? binaryExpressionType(expression, schema, fromTables);
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
    return typeof value === 'string' ? normalizeDataTypeName(value) : undefined;
  } catch {
    return undefined;
  }
}

function castType(expression: unknown): string | undefined {
  const cast = isRecord(expression) ? expression.cast ?? expression.try_cast ?? expression.safe_cast : undefined;
  return isRecord(cast) ? dataTypeToString(cast.to) : undefined;
}

function dataTypeToString(dataType: unknown): string | undefined {
  if (!isRecord(dataType)) return undefined;
  if (dataType.data_type === 'nullable' || dataType.data_type === 'low_cardinality') {
    return dataTypeToString(dataType.inner) ?? dataTypeToString(dataType.value) ?? 'unknown';
  }
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
  if (dataType.data_type === 'map') {
    return `map<${dataTypeToString(dataType.key_type) ?? 'unknown'}, ${dataTypeToString(dataType.value_type) ?? 'unknown'}>`;
  }
  const value = dataType.data_type === 'custom' && typeof dataType.name === 'string'
    ? dataType.name
    : dataType.data_type ?? dataType.type ?? dataType.name;
  if (value === 'timestamp' && dataType.timezone === true) return 'timestamptz';
  if (typeof value === 'string') {
    const normalizedValue = value.toLowerCase().replace(/\s+/g, '');
    if (typeof dataType.length === 'number' && ['char', 'character', 'varchar', 'var_char', 'varchar2', 'nvarchar', 'nvarchar2', 'nchar', 'raw', 'binary', 'varbinary'].includes(normalizedValue)) {
      return `${normalizedValue === 'var_char' ? 'varchar' : normalizedValue}(${dataType.length})`;
    }
    if (typeof dataType.precision === 'number' && ['decimal', 'dec', 'numeric', 'number', 'timestamp', 'time', 'datetime2'].includes(normalizedValue)) {
      return `${normalizedValue}(${dataType.precision}${typeof dataType.scale === 'number' ? `,${dataType.scale}` : ''})`;
    }
  }
  return typeof value === 'string' ? normalizeDataTypeName(value) : undefined;
}

function dataTypeToStringWithAliases(dataType: unknown, typeAliases: Map<string, string>): string | undefined {
  const type = dataTypeToString(dataType);
  if (!type) return undefined;
  return typeAliases.get(type.toLowerCase()) ?? type;
}

function normalizeDataTypeName(value: string): string {
  return normalizeTypeName(value);
}

function literalType(expression: unknown): string | undefined {
  if (isRecord(expression) && isRecord(expression.boolean)) return 'boolean';
  const literal = isRecord(expression) ? expression.literal : undefined;
  if (!isRecord(literal)) return undefined;
  const literalKind = String(literal.literal_type ?? '');
  const value = String(literal.value ?? '');
  if (literalKind === 'string') return 'text';
  if (literalKind === 'number') return value.includes('.') ? 'decimal' : 'integer';
  if (literalKind === 'boolean') return 'boolean';
  return undefined;
}

function coalesceType(expression: unknown, schema: ValidationSchema, fromTables: string[]): string | undefined {
  const coalesce = isRecord(expression) ? expression.coalesce : undefined;
  if (!isRecord(coalesce) || !Array.isArray(coalesce.expressions)) return undefined;
  return commonExpressionType(coalesce.expressions, schema, fromTables);
}

function caseType(expression: unknown, schema: ValidationSchema, fromTables: string[]): string | undefined {
  const caseExpression = isRecord(expression) ? expression.case : undefined;
  if (!isRecord(caseExpression)) return undefined;
  const branchExpressions = Array.isArray(caseExpression.whens)
    ? caseExpression.whens.flatMap((when) => Array.isArray(when) ? when[1] : [])
    : [];
  return commonExpressionType([...branchExpressions, caseExpression.else_].filter(Boolean), schema, fromTables);
}

function binaryExpressionType(expression: unknown, schema: ValidationSchema, fromTables: string[]): string | undefined {
  if (!isRecord(expression)) return undefined;
  for (const key of ['add', 'sub', 'mul', 'div', 'mod']) {
    const operation = expression[key];
    if (!isRecord(operation)) continue;
    const leftType = expressionType(operation.left, schema, fromTables);
    const rightType = expressionType(operation.right, schema, fromTables);
    return commonExpressionTypeFromTypes([leftType, rightType].filter((type): type is string => Boolean(type)));
  }
  for (const key of ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'like', 'is', 'in', 'between']) {
    if (isRecord(expression[key])) return 'boolean';
  }
  return undefined;
}

function aggregateType(expression: unknown, schema: ValidationSchema, fromTables: string[]): string | undefined {
  if (!isRecord(expression)) return undefined;
  if (isRecord(expression.count)) return 'integer';
  for (const key of ['sum', 'min', 'max', 'median']) {
    const aggregate = expression[key];
    if (!isRecord(aggregate)) continue;
    return expressionType(aggregate.this, schema, fromTables);
  }
  if (isRecord(expression.avg)) return 'decimal';
  return undefined;
}

function windowFunctionType(expression: unknown, schema: ValidationSchema, fromTables: string[]): string | undefined {
  const windowFunction = isRecord(expression) ? expression.window_function : undefined;
  const inner = isRecord(windowFunction) ? windowFunction.this : undefined;
  if (!isRecord(inner)) return undefined;
  if (Object.prototype.hasOwnProperty.call(inner, 'row_number') || Object.prototype.hasOwnProperty.call(inner, 'rank') || Object.prototype.hasOwnProperty.call(inner, 'dense_rank')) return 'integer';
  const valueFunction = inner.first_value ?? inner.last_value ?? inner.lag ?? inner.lead;
  return valueFunction ? expressionType(valueFunction, schema, fromTables) : aggregateType(inner, schema, fromTables);
}

function scalarFunctionType(expression: unknown, schema: ValidationSchema, fromTables: string[]): string | undefined {
  if (!isRecord(expression)) return undefined;
  for (const [key, type] of [
    ['lower', 'text'],
    ['upper', 'text'],
    ['trim', 'text'],
    ['substring', 'text'],
    ['concat', 'text'],
    ['length', 'integer'],
    ['abs', undefined],
    ['round', undefined],
  ] satisfies Array<[string, string | undefined]>) {
    const fn = expression[key];
    if (!isRecord(fn)) continue;
    return type ?? expressionType(fn.this, schema, fromTables);
  }
  const generic = expression.function;
  if (!isRecord(generic)) return undefined;
  const name = String(generic.name ?? '').toLowerCase();
  if (['lower', 'upper', 'trim', 'substring', 'concat', 'concat_ws', 'replace', 'reverse', 'initcap'].includes(name)) return 'text';
  if (['length', 'char_length', 'character_length', 'octet_length', 'bit_length'].includes(name)) return 'integer';
  if (['abs', 'round', 'ceil', 'ceiling', 'floor'].includes(name)) return commonExpressionType(functionArguments(generic), schema, fromTables);
  return undefined;
}

function commonExpressionType(expressions: unknown[], schema: ValidationSchema, fromTables: string[]): string | undefined {
  return commonExpressionTypeFromTypes(expressions.map((expression) => expressionType(expression, schema, fromTables)).filter((type): type is string => Boolean(type)));
}

function commonExpressionTypeFromTypes(types: string[]): string | undefined {
  if (types.length === 0) return undefined;
  if (types.some((type) => /text|char|string/i.test(type))) return 'text';
  if (types.some((type) => /timestamp/i.test(type))) return 'timestamp';
  if (types.some((type) => /^date$/i.test(type))) return 'date';
  if (types.some((type) => /decimal|numeric|double|float|real/i.test(type))) return 'decimal';
  if (types.some((type) => /bigint/i.test(type))) return 'bigint';
  if (types.some((type) => /int|number|smallint/i.test(type))) return 'integer';
  if (types.every((type) => type === 'boolean')) return 'boolean';
  return types[0];
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
  const re = /create\s+(?:(?:global\s+)?temporary\s+|(?:global\s+)?temp\s+)?table\s+(?:if\s+not\s+exists\s+)?([`"[\]\w.]+)\s*\(/gi;
  for (const match of sql.matchAll(re)) {
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = findMatchingParen(sql, bodyStart - 1);
    if (bodyEnd > bodyStart) {
      statements.push({ name: match[1], body: sql.slice(bodyStart, bodyEnd) });
    }
  }
  return statements;
}

function findCreateValuesStatements(sql: string, kind: 'table' | 'view'): Array<{ name: string; columns: Array<{ name: string }>; valuesSql: string }> {
  const statements: Array<{ name: string; columns: Array<{ name: string }>; valuesSql: string }> = [];
  const re = new RegExp(`create\\s+(?:(?:or\\s+replace|temporary|temp)\\s+)*${kind}\\s+(?:if\\s+not\\s+exists\\s+)?([\`"\\[\\]\\w.]+)\\s*(?:\\(([^)]*)\\))?\\s+as\\s+(values\\s+(?:[^;'"\\\`]|'[^']*'|"[^"]*"|\`[^\`]*\`)+)(?=;|$)`, 'gi');
  for (const match of sql.matchAll(re)) {
    const valuesSql = match[3]?.trim();
    if (!valuesSql) continue;
    statements.push({
      name: match[1] ?? '',
      columns: splitTopLevel(match[2] ?? '', ',').map((name) => ({ name: cleanIdentifier(name) })).filter((column) => Boolean(column.name)),
      valuesSql,
    });
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
    type: normalizeDataTypeName(type),
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
  const functions = schemas.flatMap((schema) => schema?.functions ?? []);
  const procedures = schemas.flatMap((schema) => schema?.procedures ?? []);
  return {
    tables: schemas.flatMap((schema) => schema?.tables ?? []),
    ...(functions.length > 0 ? { functions } : {}),
    ...(procedures.length > 0 ? { procedures } : {}),
  };
}

function sameTable(left: SchemaTable, right: SchemaTable): boolean {
  if (left.name.toLowerCase() !== right.name.toLowerCase()) return false;
  return (left.schema ?? '').toLowerCase() === (right.schema ?? '').toLowerCase();
}

export function schemaPath(file: string): string {
  return path.normalize(file);
}
