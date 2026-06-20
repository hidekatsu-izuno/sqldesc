import { parse, validateWithSchema, annotateTypes, generate, ast } from "@polyglot-sql/sdk";
import { namedBindType, positionalBindType } from "./binds.js";
import {
  adjustedOutputType,
  assertSupportedDialect,
  commandResultColumnConfigs,
  configuredScalarFunctionPatternType,
  getDialectConfig,
  isDialectFamily,
  procedureResultColumnConfigs,
  type ConfigColumn,
} from "./dialect.js";
import { normalizeJdbcBindTypes, transformJdbcSql } from "./jdbc.js";
import { mergeSchemas, parseCreateTables, splitTopLevel, cleanIdentifier } from "./schema.js";
import { displayTypeName, normalizeTypeName } from "./sql-type.js";
import type {
  AstExpression,
  Binds,
  ColumnInference,
  DescribeColumn,
  DescribeInput,
  DescribeResult,
  Diagnostic,
  DialectSelectStarColumnConfig,
  DialectSelectStarProfileConfig,
  NestedBaseColumn,
  NestedPathStep,
  OutputItem,
  SchemaColumn,
  SchemaFunction,
  SchemaProcedure,
  SchemaTable,
  StatementContext,
  StatementResultKind,
  StatementSummary,
  TableAliasEntry,
  TableAliasMap,
  UpdatableDescribeColumn,
  UpdatableDescribeInput,
  UpdatableDescribeResult,
  ValidationSchema,
} from "./types.js";

export async function describeQuery(input: DescribeInput): Promise<DescribeResult> {
  const dialect = assertSupportedDialect(input.dialect);
  const sql = input.jdbc ? transformJdbcSql(input.sql, dialect) : input.sql;
  const binds = input.jdbc ? normalizeJdbcBindTypes(input.binds, dialect) : input.binds;
  const schema = input.schema ?? { tables: [] };
  const effectiveSchema = schemaWithBuiltinMetadata(schema, dialect);
  const warnings: string[] = [];
  const diagnostics: Diagnostic[] = [];

  const parseResult = parse(sql, dialect as never) as PolyglotParseResult;
  const fallbackSql = rewriteParseSql(sql, dialect);
  const fallbackParseResult =
    !parseResult.success && fallbackSql !== sql
      ? (parse(fallbackSql, dialect as never) as PolyglotParseResult)
      : undefined;
  if (!parseResult.success && !fallbackParseResult?.success) {
    throw new Error(parseResult.error ?? "Failed to parse SQL.");
  }
  const parsedAst = parseResult.success ? parseResult.ast : fallbackParseResult?.ast;
  const typeSql = parseResult.success ? sql : fallbackSql;
  const annotatedAst = parseResult.success
    ? (annotateSqlTypes(typeSql, dialect, effectiveSchema) ?? parsedAst)
    : parsedAst;

  if (schema.tables.length > 0 && parseResult.success) {
    const validation = validateWithSchema(sql, toPolyglotSchema(effectiveSchema), dialect, {
      checkTypes: true,
      checkReferences: true,
      semantic: true,
    }) as PolyglotValidationResult;
    if (validation.errors) {
      diagnostics.push(...validation.errors.map((error) => toDiagnostic(error)));
    }
    if (validation.warnings) {
      diagnostics.push(...validation.warnings.map((warning) => toDiagnostic(warning, "warning")));
    }
  }

  const resultSets = extractResultSets(annotatedAst, effectiveSchema, dialect)
    .map((items, resultSetIndex) => ({
      index: resultSetIndex + 1,
      columns: describeOutputItems(items, effectiveSchema, binds, dialect, warnings),
    }))
    .filter((resultSet) => resultSet.columns.length > 0);
  const statements = summarizeStatements(annotatedAst, resultSets, dialect);
  const statementDiagnostics = diagnosticsForStatements(statements, resultSets.length === 0);
  warnings.push(...statementDiagnostics.map((diagnostic) => diagnostic.message));
  diagnostics.push(...statementDiagnostics);

  const columns = resultSets[0]?.columns ?? [];
  const allColumns = resultSets.flatMap((resultSet) => resultSet.columns);
  let returnedDiagnostics = suppressResolvedNestedDiagnostics(diagnostics, allColumns);
  returnedDiagnostics = suppressConfiguredCurrentUserDiagnostics(
    returnedDiagnostics,
    annotatedAst,
    dialect,
  );
  returnedDiagnostics = suppressCurrentTemporalIdentifierDiagnostics(
    returnedDiagnostics,
    annotatedAst,
  );
  returnedDiagnostics = suppressConfiguredDiagnosticPatterns(returnedDiagnostics, dialect);
  returnedDiagnostics = suppressWholeRowFunctionDiagnostics(
    returnedDiagnostics,
    annotatedAst,
    effectiveSchema,
  );
  returnedDiagnostics = suppressNamedFunctionArgumentDiagnostics(returnedDiagnostics, annotatedAst);
  returnedDiagnostics = suppressKnownTableFunctionArgumentDiagnostics(
    returnedDiagnostics,
    annotatedAst,
    dialect,
  );
  returnedDiagnostics = suppressVirtualTableArgumentDiagnostics(
    returnedDiagnostics,
    annotatedAst,
    effectiveSchema,
    dialect,
  );
  returnedDiagnostics = suppressConfiguredRowidDiagnostics(returnedDiagnostics, annotatedAst, dialect);
  returnedDiagnostics = suppressResolvedColumnDiagnostics(returnedDiagnostics, allColumns);
  returnedDiagnostics = suppressResolvedSourceDiagnostics(returnedDiagnostics, allColumns);
  returnedDiagnostics = suppressCompatibleComparisonDiagnostics(
    returnedDiagnostics,
    annotatedAst,
    effectiveSchema,
  );
  returnedDiagnostics = suppressTemporalUnitDiagnostics(returnedDiagnostics, annotatedAst);
  returnedDiagnostics = suppressResolvedOrderingDiagnostics(returnedDiagnostics, resultSets);
  returnedDiagnostics = suppressSetOperationTypeDiagnostics(
    returnedDiagnostics,
    annotatedAst,
    effectiveSchema,
  );
  returnedDiagnostics = suppressResolvedInsertValueDiagnostics(returnedDiagnostics, annotatedAst);
  returnedDiagnostics = suppressKnownSchemaDiagnostics(returnedDiagnostics, effectiveSchema);
  returnedDiagnostics = suppressStaticStatementDiagnostics(
    returnedDiagnostics,
    annotatedAst,
    resultSets,
    dialect,
  );
  returnedDiagnostics = suppressNonShapeValidationDiagnostics(returnedDiagnostics, resultSets);
  returnedDiagnostics = suppressRuntimeOnlyDiagnostics(returnedDiagnostics, statements);
  returnedDiagnostics = suppressResolvedPreparedDiagnostics(
    returnedDiagnostics,
    annotatedAst,
    resultSets,
  );
  returnedDiagnostics = suppressNoResultParseDiagnostics(returnedDiagnostics, statements);
  returnedDiagnostics = suppressExpandedStarDiagnostics(returnedDiagnostics, resultSets);

  return {
    columns,
    resultSets,
    statements,
    warnings: unique(warnings),
    diagnostics: returnedDiagnostics,
    binds,
    schema,
  };
}

export async function describeUpdatableQuery(
  input: UpdatableDescribeInput,
): Promise<UpdatableDescribeResult> {
  const dialect = assertSupportedDialect(input.dialect);
  const sql = input.jdbc ? transformJdbcSql(input.sql, dialect) : input.sql;
  const binds = input.jdbc ? normalizeJdbcBindTypes(input.binds, dialect) : input.binds;
  const schema = input.schema ?? { tables: [] };
  const parseResult = parse(sql, dialect as never) as PolyglotParseResult;
  if (!parseResult.success) {
    throw new Error(parseResult.error ?? "Failed to parse SQL.");
  }

  const analysis = analyzeUpdatableSelect(parseResult.ast, schema, dialect);
  if (analysis.reasons.length > 0 || !analysis.select || !analysis.table) {
    throw new Error(`Query is not updatable: ${analysis.reasons.join("; ")}.`);
  }

  const original = await describeQuery({ ...input, sql, jdbc: false, binds, dialect, schema });
  const existingKeyIndexes = projectedKeyIndexes(analysis.select, analysis.keyColumns);
  const existingKeyNames = projectedKeyNames(analysis.select, analysis.keyColumns);
  const missingKeys = analysis.keyColumns.filter(
    (column) => !existingKeyNames.has(column.resultName.toLowerCase()),
  );

  const rewrittenSql =
    missingKeys.length > 0
      ? generateUpdatableSql(
          parseResult.ast,
          analysis.select,
          analysis.qualifier,
          missingKeys,
          dialect,
        )
      : sql;
  const described =
    missingKeys.length > 0
      ? await describeQuery({ ...input, sql: rewrittenSql, jdbc: false, binds, dialect, schema })
      : original;
  if (described.resultSets.length !== 1) {
    throw new Error("Query is not updatable: expected exactly one static result set.");
  }

  const table = analysis.table;
  const configuredKeyColumn = getDialectConfig(dialect).metadata.updatableKeyColumn;
  const keySources = new Set(
    configuredKeyColumn
      ? []
      : analysis.keyColumns.map((column) => schemaColumnSource(table, column.name).toLowerCase()),
  );
  const columns: UpdatableDescribeColumn[] = described.columns.map((column) => ({
    ...column,
    key:
      existingKeyIndexes.has(column.index) ||
      keySources.has(column.source?.toLowerCase() ?? "") ||
      column.name.toLowerCase() === configuredKeyColumn?.toLowerCase(),
  }));

  return {
    updatable: true,
    sql: rewrittenSql,
    columns,
    resultSets: [{ index: 1, columns }],
    statements: described.statements,
    warnings: described.warnings,
    diagnostics: described.diagnostics,
    binds: described.binds,
    schema: described.schema,
  };
}

interface UpdatableSelectAnalysis {
  select?: Record<string, unknown>;
  table?: SchemaTable;
  qualifier: string;
  keyColumns: UpdatableKeyColumn[];
  reasons: string[];
}

interface UpdatableKeyColumn {
  name: string;
  resultName: string;
}

function analyzeUpdatableSelect(
  parsedAst: unknown,
  schema: ValidationSchema,
  dialect: string,
): UpdatableSelectAnalysis {
  const reasons: string[] = [];
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  if (statements.length !== 1) reasons.push("expected a single statement");
  const statement = statements[0];
  const select = isRecord(statement) && isRecord(statement.select) ? statement.select : undefined;
  if (!select) reasons.push("expected a top-level SELECT");
  if (!select) return { qualifier: "", keyColumns: [], reasons };

  reasons.push(...nonUpdatableSelectReasons(select));
  const sources = baseSelectSources(select);
  if (sources.length !== 1) reasons.push("expected exactly one base table in FROM");
  const source = sources[0];
  const tableName = source ? relationTableName(source) : undefined;
  const schemaName = source ? relationSchemaName(source) : undefined;
  if (!source || !isRecord(source.table) || !tableName) {
    reasons.push("expected FROM to reference a base table");
    return { select, qualifier: "", keyColumns: [], reasons };
  }

  const table = findSchemaTable(schema, tableName, schemaName);
  if (!table) {
    reasons.push(
      `table ${schemaName ? `${schemaName}.` : ""}${tableName} was not found in schema`,
    );
    return { select, qualifier: tableQualifier(source, tableName), keyColumns: [], reasons };
  }

  const configuredKeyColumn = getDialectConfig(dialect).metadata.updatableKeyColumn;
  const keyColumns = configuredKeyColumn
    ? [{ name: configuredKeyColumn, resultName: configuredKeyColumn }]
    : primaryKeyColumns(table).map((column) => ({ name: column.name, resultName: column.name }));
  if (keyColumns.length === 0) reasons.push(`table ${schemaTableName(table)} has no primary key`);

  return {
    select,
    table,
    qualifier: tableQualifier(source, tableName),
    keyColumns,
    reasons,
  };
}

function nonUpdatableSelectReasons(select: Record<string, unknown>): string[] {
  const reasons: string[] = [];
  if (Array.isArray(select.joins) && select.joins.length > 0) reasons.push("JOIN is not updatable");
  if (Array.isArray(select.from_joins) && select.from_joins.length > 0)
    reasons.push("JOIN is not updatable");
  if (Array.isArray(select.lateral_views) && select.lateral_views.length > 0)
    reasons.push("lateral views are not updatable");
  if (select.with != null) reasons.push("CTE queries are not updatable");
  if (select.group_by != null) reasons.push("GROUP BY is not updatable");
  if (select.having != null) reasons.push("HAVING is not updatable");
  if (select.distinct === true || select.distinct_on != null)
    reasons.push("DISTINCT is not updatable");
  if (Array.isArray(select.expressions) && select.expressions.some(isAggregateExpression))
    reasons.push("aggregate queries are not updatable");
  return reasons;
}

function baseSelectSources(select: Record<string, unknown>): Record<string, unknown>[] {
  const from =
    isRecord(select.from) && Array.isArray(select.from.expressions) ? select.from.expressions : [];
  const fromClause =
    isRecord(select.from_clause) && Array.isArray(select.from_clause.expressions)
      ? select.from_clause.expressions
      : [];
  return [...from, ...fromClause].filter(isRecord);
}

function findSchemaTable(
  schema: ValidationSchema,
  tableName: string,
  schemaName: string | undefined,
): SchemaTable | undefined {
  return schema.tables.find((table) => {
    if (table.name.toLowerCase() !== tableName.toLowerCase()) return false;
    if (schemaName) return table.schema?.toLowerCase() === schemaName.toLowerCase();
    return !table.schema;
  });
}

function primaryKeyColumns(table: SchemaTable): SchemaColumn[] {
  const keyNames = table.primaryKey?.length
    ? table.primaryKey
    : table.columns.filter((column) => column.primaryKey === true).map((column) => column.name);
  const lowered = new Set(keyNames.map((name) => name.toLowerCase()));
  return table.columns.filter((column) => lowered.has(column.name.toLowerCase()));
}

function projectedKeyIndexes(
  select: Record<string, unknown>,
  keyColumns: UpdatableKeyColumn[],
): Set<number> {
  const indexes = new Set<number>();
  const expressions = Array.isArray(select.expressions) ? select.expressions : [];
  expressions.forEach((expression, index) => {
    if (isProjectedKeyExpression(expression, keyColumns)) indexes.add(index + 1);
  });
  return indexes;
}

function projectedKeyNames(
  select: Record<string, unknown>,
  keyColumns: UpdatableKeyColumn[],
): Set<string> {
  const names = new Set<string>();
  const expressions = Array.isArray(select.expressions) ? select.expressions : [];
  for (const expression of expressions) {
    const name = projectedKeyName(expression, keyColumns);
    if (name) names.add(name.toLowerCase());
  }
  return names;
}

function isProjectedKeyExpression(
  expression: unknown,
  keyColumns: UpdatableKeyColumn[],
): boolean {
  return Boolean(projectedKeyName(expression, keyColumns));
}

function projectedKeyName(
  expression: unknown,
  keyColumns: UpdatableKeyColumn[],
): string | undefined {
  if (!isRecord(expression)) return undefined;
  const unwrapped = unwrapAlias(expression);
  const rowidKey = keyColumns.find((key) => key.name.toLowerCase() === "rowid");
  if (rowidKey && isRowidExpression(unwrapped.expression)) return rowidKey.resultName;
  const name = columnName(unwrapped.expression);
  if (!name) return undefined;
  return keyColumns.find((key) => key.name.toLowerCase() === name.toLowerCase())?.resultName;
}

function isRowidExpression(expression: unknown): boolean {
  const pseudocolumn = getAst(expression, "pseudocolumn");
  if (isRecord(pseudocolumn) && String(pseudocolumn.kind ?? "").toLowerCase() === "rowid")
    return true;
  const name = columnName(isRecord(expression) ? expression : {});
  return name?.toLowerCase() === "rowid";
}

function tableQualifier(source: Record<string, unknown>, tableName: string): string {
  const aliasNode =
    isRecord(source.alias) && isRecord(source.alias.this) ? source.alias : undefined;
  const alias = aliasNode ? identifierName(aliasNode.alias) : identifierName(source.alias);
  return alias ?? tableName;
}

function isAggregateExpression(expression: unknown): boolean {
  return [
    "aggregate_function",
    "avg",
    "count",
    "count_if",
    "sum",
    "min",
    "max",
    "median",
    "stddev",
    "variance",
    "string_agg",
    "group_concat",
    "listagg",
    "array_agg",
  ].some((key) => containsAstKey(expression, key));
}

function generateUpdatableSql(
  parsedAst: unknown,
  select: Record<string, unknown>,
  qualifier: string,
  missingKeys: UpdatableKeyColumn[],
  dialect: string,
): string {
  if (!Array.isArray(select.expressions)) select.expressions = [];
  const expressions = select.expressions;
  if (Array.isArray(expressions)) {
    expressions.push(...missingKeys.map((key) => keyColumnExpression(qualifier, key)));
  }
  const result = generate(parsedAst as never, dialect as never) as PolyglotGenerateResult;
  if (!result.success || !result.sql) {
    throw new Error(result.error ?? "Failed to generate updatable SQL.");
  }
  return Array.isArray(result.sql) ? result.sql.join("; ") : result.sql;
}

function keyColumnExpression(qualifier: string, key: UpdatableKeyColumn): AstExpression {
  return {
    column: {
      name: identifierExpression(key.name),
      table: identifierExpression(qualifier),
      join_mark: false,
      trailing_comments: [],
    },
  };
}

function identifierExpression(name: string): Record<string, unknown> {
  return { name, quoted: false, trailing_comments: [] };
}

function describeOutputItems(
  outputItems: OutputItem[],
  schema: ValidationSchema,
  binds: Binds | undefined,
  dialect: string,
  warnings: string[],
): DescribeColumn[] {
  return outputItems.map((item, index) => {
    const name = item.name ?? inferNameFromAst(item.expression, index + 1);
    const inferenceName = name || `column_${index + 1}`;
    if (item.type) {
      return {
        index: index + 1,
        name,
        type: displayTypeName(item.type, dialect),
        source: item.source,
      };
    }
    const inferred = inferColumn(
      item.expression,
      inferenceName,
      item.schema ?? schema,
      binds,
      dialect,
      item.source,
      item.tableAliases,
      item.functionReturnTypes,
    );
    if (inferred.type === "unknown" && inferred.note) warnings.push(inferred.note);
    const { confidence: _confidence, ...column } = inferred;
    const type = adjustedOutputType(name, column.type, dialect);
    return {
      index: index + 1,
      name,
      ...column,
      type: displayTypeName(type, dialect),
    };
  });
}

function inferColumn(
  expression: AstExpression,
  name: string,
  schema: ValidationSchema,
  binds: Binds | undefined,
  dialect: string,
  explicitSource?: string,
  tableAliases?: TableAliasMap,
  functionReturnTypes?: Map<string, string>,
): ColumnInference {
  const collation = getAst(expression, "collation");
  if (isRecord(collation) && isRecord(collation.this)) {
    return inferColumn(
      collation.this,
      name,
      schema,
      binds,
      dialect,
      explicitSource,
      tableAliases,
      functionReturnTypes,
    );
  }

  const specialIdentifierType = inferSpecialIdentifierType(expression, dialect);
  if (specialIdentifierType) {
    return { type: specialIdentifierType, confidence: "medium", source: "expression" };
  }

  const constructorType = inferConstructorType(expression, schema, binds);
  if (constructorType) {
    return { type: constructorType, confidence: "medium", source: "expression" };
  }

  const jsonScalarNestedColumn = inferJsonScalarNestedColumn(expression, schema, tableAliases);
  if (jsonScalarNestedColumn) {
    return {
      type: jsonScalarNestedColumn.type,
      nullable: jsonScalarNestedColumn.nullable,
      confidence: "medium",
      source: jsonScalarNestedColumn.source,
    };
  }

  const jsonType = inferJsonType(expression);
  if (jsonType) {
    return { type: jsonType, confidence: "medium", source: "expression" };
  }

  const temporalType = inferTemporalFunctionType(expression, schema, binds);
  if (temporalType) {
    return { type: temporalType, confidence: "medium", source: "expression" };
  }

  const geospatialType = inferGeospatialFunctionType(expression, dialect);
  if (geospatialType) {
    return { type: geospatialType, confidence: "medium", source: "expression" };
  }

  const identifierHashRandomType = inferIdentifierHashRandomType(expression, dialect);
  if (identifierHashRandomType) {
    return { type: identifierHashRandomType, confidence: "medium", source: "expression" };
  }

  const patternedScalarType = configuredScalarFunctionPatternType(name, dialect);
  if (patternedScalarType) {
    return { type: patternedScalarType, confidence: "medium", source: "expression" };
  }

  const aggregateType = inferAggregateType(expression, schema, binds, tableAliases, dialect);
  if (aggregateType) {
    return { type: aggregateType, confidence: "medium", source: "expression" };
  }

  const sourceColumn = findSchemaColumn(expression, schema, tableAliases);
  if (sourceColumn) {
    return {
      type: sourceColumn.column.type,
      nullable: sourceColumn.nullable,
      confidence: "high",
      source: schemaColumnSource(sourceColumn.table, sourceColumn.column.name),
    };
  }

  const bindSensitiveType = inferBindSensitiveFunctionType(expression, binds);
  if (bindSensitiveType) {
    return { type: bindSensitiveType, confidence: "medium", source: "expression" };
  }

  const conditionalType = inferConditionalType(expression, schema, binds, dialect);
  if (conditionalType) {
    return { type: conditionalType, confidence: "medium", source: "expression" };
  }

  const sequenceType = inferSequenceFunctionType(expression);
  if (sequenceType) {
    return { type: sequenceType, confidence: "medium", source: "expression" };
  }

  const configuredScalarType = inferConfiguredScalarFunctionType(expression, dialect);
  if (configuredScalarType) {
    return { type: configuredScalarType, confidence: "medium", source: "expression" };
  }

  const definedFunctionType = inferDefinedFunctionType(expression, functionReturnTypes);
  if (definedFunctionType) {
    return { type: definedFunctionType, confidence: "medium", source: "function" };
  }

  const annotatedType = adjustAnnotatedTypeForExpression(
    dataTypeToString(ast.getInferredType(expression as never)),
    expression,
    dialect,
  );
  if (annotatedType) {
    return { type: annotatedType, confidence: "high", source: "polyglot" };
  }

  const castType = inferCastType(expression, dialect);
  if (castType) {
    return { type: castType, confidence: "high", source: "cast" };
  }

  const literalType = inferLiteralType(expression, dialect);
  if (literalType) {
    return { type: literalType, confidence: "high", source: "literal" };
  }

  const bindType = inferBindType(expression, binds);
  if (bindType) {
    return { type: bindType, confidence: "medium", source: "bind" };
  }

  const namedBindColumnType = inferNamedBindFromColumn(expression, binds);
  if (namedBindColumnType) {
    return { type: namedBindColumnType, confidence: "medium", source: "bind" };
  }

  const nestedColumn = inferNestedColumn(expression, schema, tableAliases);
  if (nestedColumn) {
    return {
      type: nestedColumn.type,
      nullable: nestedColumn.nullable,
      confidence: "medium",
      source: nestedColumn.source,
    };
  }

  const wholeRowType = inferWholeRowType(expression, schema, tableAliases);
  if (wholeRowType) {
    return { type: wholeRowType.type, confidence: "medium", source: wholeRowType.source };
  }

  const expressionType = inferExpressionType(expression, schema, binds, tableAliases, dialect);
  if (expressionType) {
    return { type: expressionType, confidence: "medium", source: "expression" };
  }

  if (explicitSource) {
    return {
      type: "unknown",
      confidence: "low",
      source: explicitSource,
      note: `Could not infer type for result column "${name}".`,
    };
  }

  return {
    type: "unknown",
    confidence: "low",
    note: `Could not infer type for result column "${name}".`,
  };
}

function inferSpecialIdentifierType(
  expression: AstExpression,
  dialect: string,
): string | undefined {
  const config = getDialectConfig(dialect);
  const parameter = getAst(expression, "parameter");
  if (isRecord(parameter) && String(parameter.style ?? "").toLowerCase() === "doubleat") {
    const name = String(parameter.name ?? "").toLowerCase();
    const type = config.specialParameterTypes[name];
    if (type) return type;
  }

  const column = getAst(expression, "column");
  if (isRecord(column)) {
    const name = identifierName(column.name)?.toLowerCase();
    const type = name
      ? identifierName(column.table)
        ? (config.qualifiedSpecialColumnTypes[name] ??
          config.specialColumnTypes[name] ??
          config.pseudoColumnTypes[name])
        : (config.specialColumnTypes[name] ?? config.pseudoColumnTypes[name])
      : undefined;
    if (type) return type;
  }
  const pseudocolumn = getAst(expression, "pseudocolumn");
  if (isRecord(pseudocolumn)) {
    const kind = String(pseudocolumn.kind ?? "").toLowerCase();
    const type = config.pseudoColumnTypes[kind];
    if (type) return type;
  }

  return undefined;
}

function inferSequenceFunctionType(expression: AstExpression): string | undefined {
  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? "").toLowerCase();
  if (["seq1", "seq2", "seq4", "seq8"].includes(name)) return "integer";
  return ["nextval", "currval", "lastval", "setval"].includes(name) ? "bigint" : undefined;
}

function inferConfiguredScalarFunctionType(
  expression: AstExpression,
  dialect: string,
): string | undefined {
  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? "").toLowerCase();
  return (
    getDialectConfig(dialect).scalarFunctionTypes[name] ??
    getDialectConfig("generic").scalarFunctionTypes[name]
  );
}

function inferDefinedFunctionType(
  expression: AstExpression,
  functionReturnTypes?: Map<string, string>,
): string | undefined {
  if (!functionReturnTypes || functionReturnTypes.size === 0) return undefined;
  const fn = getAst(expression, "function");
  if (isRecord(fn)) {
    const name = String(fn.name ?? "").toLowerCase();
    return functionReturnTypes.get(name) ?? functionReturnTypes.get(unqualifiedFunctionName(fn));
  }
  const methodCall = getAst(expression, "method_call");
  if (!isRecord(methodCall)) return undefined;
  const method = identifierName(methodCall.method)?.toLowerCase();
  if (!method) return undefined;
  const receiver = isRecord(methodCall.this) ? columnName(methodCall.this) : undefined;
  const qualified = receiver ? `${receiver.toLowerCase()}.${method}` : undefined;
  return (
    (qualified ? functionReturnTypes.get(qualified) : undefined) ?? functionReturnTypes.get(method)
  );
}

function columnName(expression: AstExpression): string | undefined {
  const column = getAst(expression, "column");
  return isRecord(column) ? identifierName(column.name) : undefined;
}

function annotateSqlTypes(
  sql: string,
  dialect: string,
  schema: ValidationSchema,
): unknown[] | undefined {
  try {
    const result = annotateTypes(
      sql,
      dialect as never,
      toPolyglotSchema(schema) as never,
    ) as PolyglotAnnotateResult;
    return result.success ? result.ast : undefined;
  } catch {
    return undefined;
  }
}

function rewriteCreateValuesSql(sql: string): string {
  return sql.replace(
    /create\s+((?:(?:or\s+replace|temporary|temp)\s+)*(?:table|view)\s+(?:if\s+not\s+exists\s+)?[`"\[\]\w.]+\s*(?:\(([^)]*)\))?\s+as\s+)values\s+((?:[^;'"`]|'[^']*'|"[^"]*"|`[^`]*`)+)(?=;|$)/gi,
    (match, prefix: string, columns: string | undefined, valuesBody: string) => {
      const aliases = splitTopLevel(columns ?? "", ",")
        .map(cleanIdentifier)
        .filter(Boolean);
      if (aliases.length === 0) return match;
      return `create ${prefix}select * from (values ${valuesBody}) as sqldesc_values(${aliases.join(", ")})`;
    },
  );
}

function rewriteParseSql(sql: string, dialect: string): string {
  let rewritten = rewriteCreateValuesSql(sql);
  for (const rewrite of getDialectConfig(dialect).parserFallbacks.parseSqlRewrites ?? []) {
    const match = rewrite.pattern.match(/^\/(.*)\/([a-z]*)$/i);
    if (!match) continue;
    rewritten = rewritten.replace(new RegExp(match[1], match[2]), rewrite.replacement);
  }
  return rewritten;
}

function inferWholeRowType(
  expression: AstExpression,
  schema: ValidationSchema,
  tableAliases?: TableAliasMap,
): { type: string; source: string } | undefined {
  const column = getAst(expression, "column");
  if (!isRecord(column) || identifierName(column.table)) return undefined;
  const qualifier = identifierName(column.name)?.toLowerCase();
  if (!qualifier) return undefined;
  const relation = tableAliases?.get(qualifier);
  const tableName = relation?.tableName.toLowerCase() ?? qualifier;
  const schemaName = relation?.schemaName?.toLowerCase();
  const table = schema.tables.find((candidate) => {
    if (candidate.name.toLowerCase() !== tableName) return false;
    if (schemaName && candidate.schema?.toLowerCase() !== schemaName) return false;
    return true;
  });
  if (!table) return undefined;
  return {
    type: `struct<${table.columns.map((field) => `${field.name} ${field.type || "unknown"}`).join(", ")}>`,
    source: schemaTableName(table),
  };
}

function inferExpressionType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
  tableAliases?: TableAliasMap,
  dialect = "generic",
): string | undefined {
  if (isAst(expression, "boolean")) return "boolean";
  if (isAst(expression, "pi")) return "decimal";
  if (isAst(expression, "match_against")) return "decimal";
  if (getAst(expression, "x_m_l_element") || getAst(expression, "x_m_l_forest")) return "xml";
  const paren = getAst(expression, "paren");
  if (isRecord(paren) && isRecord(paren.this))
    return inferColumn(paren.this, "expression", schema, binds, "generic").type;
  const neg = getAst(expression, "neg");
  if (isRecord(neg) && isRecord(neg.this))
    return inferColumn(neg.this, "expression", schema, binds, "generic").type;
  const arraySlice = getAst(expression, "array_slice");
  if (isRecord(arraySlice) && isRecord(arraySlice.this))
    return inferColumn(arraySlice.this, "expression", schema, binds, "generic").type;
  const collation = getAst(expression, "collation");
  if (isRecord(collation) && isRecord(collation.this))
    return inferColumn(collation.this, "expression", schema, binds, "generic").type;

  const windowType = inferWindowFunctionType(expression, schema, binds, dialect);
  if (windowType) return windowType;
  const constructorType = inferConstructorType(expression, schema, binds);
  if (constructorType) return constructorType;
  const conditionalType = inferConditionalType(expression, schema, binds);
  if (conditionalType) return conditionalType;
  const predicateType = inferPredicateType(expression);
  if (predicateType) return predicateType;
  const jsonType = inferJsonType(expression);
  if (jsonType) return jsonType;
  const scalarSubqueryType = inferScalarSubqueryType(expression, schema, binds);
  if (scalarSubqueryType) return scalarSubqueryType;
  const aggregateType = inferAggregateType(expression, schema, binds, tableAliases, dialect);
  if (aggregateType) return aggregateType;
  const methodType = inferMethodCallType(expression, schema, binds);
  if (methodType) return methodType;
  const scalarType = inferScalarFunctionType(expression, schema, binds, dialect);
  if (scalarType) return scalarType;
  const arithmetic =
    getAst(expression, "add") ??
    getAst(expression, "sub") ??
    getAst(expression, "mul") ??
    getAst(expression, "div") ??
    getAst(expression, "int_div") ??
    getAst(expression, "mod") ??
    getAst(expression, "mod_func") ??
    getAst(expression, "bitwise_and") ??
    getAst(expression, "bitwise_or") ??
    getAst(expression, "bitwise_xor") ??
    getAst(expression, "bitwise_left_shift") ??
    getAst(expression, "bitwise_right_shift");
  if (isRecord(arithmetic)) {
    const types = [arithmetic.left, arithmetic.right, arithmetic.this, arithmetic.expression]
      .filter(isRecord)
      .map((part) => inferColumn(part, "expression", schema, binds, "generic").type);
    if (types.some((type) => /decimal|numeric|real|double|float/i.test(type))) return "decimal";
    if (types.some((type) => /int|number|bigint|smallint/i.test(type))) return "integer";
  }
  const power = getAst(expression, "power");
  if (isRecord(power)) return "decimal";
  if (isAst(expression, "concat")) return "text";
  const row = getAst(expression, "function");
  if (isRecord(row) && String(row.name ?? "").toLowerCase() === "row" && Array.isArray(row.args)) {
    const fields = row.args.filter(isRecord).map((arg, index) => {
      const name = inferNameFromAst(arg, index + 1);
      const type = inferColumn(arg, name, schema, binds, "generic").type;
      return `${name} ${type}`;
    });
    if (fields.length > 0) return `record<${fields.join(", ")}>`;
  }
  return undefined;
}

function inferMethodCallType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
): string | undefined {
  const methodCall = getAst(expression, "method_call");
  if (!isRecord(methodCall)) return undefined;
  const name = identifierName(methodCall.method)?.toLowerCase();
  if (!name) return undefined;
  const receiver = isRecord(methodCall.this) ? methodCall.this : undefined;
  if (
    [
      "lower",
      "upper",
      "trim",
      "ltrim",
      "rtrim",
      "substring",
      "substr",
      "replace",
      "regexp_replace",
    ].includes(name)
  )
    return "text";
  if (
    [
      "length",
      "char_length",
      "character_length",
      "array_length",
      "array_size",
      "cardinality",
      "list_position",
      "list_unique",
    ].includes(name)
  )
    return "integer";
  if (
    [
      "contains",
      "list_contains",
      "array_contains",
      "has",
      "list_has",
      "list_has_all",
      "list_has_any",
    ].includes(name)
  )
    return "boolean";
  if (["array_join", "array_to_string"].includes(name)) return "text";
  if (
    [
      "array_distinct",
      "array_compact",
      "array_reverse",
      "array_sort",
      "array_remove",
      "list_sort",
    ].includes(name)
  ) {
    return receiver ? firstArrayArgumentType([receiver], schema, binds) : undefined;
  }
  if (["list_extract", "array_extract"].includes(name)) {
    const type = receiver ? firstArrayArgumentType([receiver], schema, binds) : undefined;
    return type ? (arrayElementType(type) ?? type) : undefined;
  }
  return undefined;
}

function inferAggregateType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
  tableAliases?: TableAliasMap,
  dialect = "generic",
): string | undefined {
  if (isAst(expression, "count")) return dialectCountType(dialect);
  if (isAst(expression, "avg"))
    return dialectAvgType(expression, schema, binds, tableAliases, dialect);
  const avg = getAst(expression, "avg");
  if (isRecord(avg)) return dialectAvgType(avg, schema, binds, tableAliases, dialect);
  if (isAst(expression, "count_if")) return dialectCountType(dialect);
  if (isAst(expression, "approx_count_distinct") || isAst(expression, "approx_distinct"))
    return dialectCountType(dialect);
  const directValue = getAst(expression, "first_value") ?? getAst(expression, "last_value");
  if (isRecord(directValue) && isRecord(directValue.this))
    return inferAggregateExpressionType(directValue.this, schema, binds, tableAliases);

  const boolAggregate =
    getAst(expression, "bool_and") ??
    getAst(expression, "bool_or") ??
    getAst(expression, "every") ??
    getAst(expression, "logical_and") ??
    getAst(expression, "logical_or");
  if (isRecord(boolAggregate)) return "boolean";

  const decimalAggregate =
    getAst(expression, "stddev") ??
    getAst(expression, "variance") ??
    getAst(expression, "stddev_pop") ??
    getAst(expression, "stddev_samp") ??
    getAst(expression, "var_pop") ??
    getAst(expression, "var_samp");
  if (isRecord(decimalAggregate)) return "decimal";

  const bitwiseAggregate =
    getAst(expression, "bitwise_and_agg") ??
    getAst(expression, "bitwise_or_agg") ??
    getAst(expression, "bitwise_xor_agg");
  if (isRecord(bitwiseAggregate)) {
    const inner = firstAggregateExpression(bitwiseAggregate);
    return inner ? inferAggregateExpressionType(inner, schema, binds, tableAliases) : "integer";
  }

  const textAggregate =
    getAst(expression, "string_agg") ??
    getAst(expression, "group_concat") ??
    getAst(expression, "listagg");
  if (isRecord(textAggregate)) return "text";

  const arrayAggregate =
    getAst(expression, "array_agg") ??
    getAst(expression, "list") ??
    getAst(expression, "collect_list") ??
    getAst(expression, "collect_set");
  if (isRecord(arrayAggregate)) {
    const inner = firstAggregateExpression(arrayAggregate);
    const type = inner
      ? inferAggregateExpressionType(inner, schema, binds, tableAliases)
      : "unknown";
    return `array<${type}>`;
  }

  const arrayConcatAggregate = getAst(expression, "array_concat_agg");
  if (isRecord(arrayConcatAggregate)) {
    const inner = firstAggregateExpression(arrayConcatAggregate);
    return inner
      ? inferAggregateExpressionType(inner, schema, binds, tableAliases)
      : "array<unknown>";
  }

  const jsonAggregate =
    getAst(expression, "json_agg") ??
    getAst(expression, "json_object_agg") ??
    getAst(expression, "json_arrayagg") ??
    getAst(expression, "json_objectagg") ??
    getAst(expression, "j_s_o_n_array_agg") ??
    getAst(expression, "j_s_o_n_object_agg") ??
    getAst(expression, "j_s_o_n_b_object_agg");
  if (isRecord(jsonAggregate)) return "json";

  const withinGroup = getAst(expression, "within_group");
  if (isRecord(withinGroup)) {
    const ordered = Array.isArray(withinGroup.order_by)
      ? withinGroup.order_by
          .map((item) => (isRecord(item) && isRecord(item.this) ? item.this : undefined))
          .filter(isRecord)
      : [];
    const inner = isRecord(withinGroup.this) ? withinGroup.this : undefined;
    const innerAggregate = inner
      ? inferAggregateType(inner, schema, binds, tableAliases, dialect)
      : undefined;
    if (innerAggregate && innerAggregate !== "unknown") return innerAggregate;
    const orderType = commonArgumentType(ordered, schema, binds);
    if (orderType) return orderType;
  }

  const anyValue =
    getAst(expression, "any_value") ??
    getAst(expression, "first") ??
    getAst(expression, "last") ??
    getAst(expression, "mode");
  if (isRecord(anyValue)) {
    const inner = firstAggregateExpression(anyValue);
    if (inner) return inferAggregateExpressionType(inner, schema, binds, tableAliases);
  }

  const namedAggregate = getAst(expression, "aggregate_function");
  if (isRecord(namedAggregate))
    return aggregateTypeByName(
      String(namedAggregate.name ?? "").toLowerCase(),
      namedAggregate,
      schema,
      binds,
      tableAliases,
      dialect,
    );
  const parameterizedAggregate = getAst(expression, "combined_parameterized_agg");
  if (isRecord(parameterizedAggregate)) {
    const name = identifierName(parameterizedAggregate.this)?.toLowerCase();
    if (name === "quantiles") {
      const inner = firstExpression(
        Array.isArray(parameterizedAggregate.expressions)
          ? parameterizedAggregate.expressions.filter(isRecord)
          : [],
      );
      const type = inner
        ? inferAggregateExpressionType(inner, schema, binds, tableAliases)
        : "unknown";
      return `array<${type}>`;
    }
  }

  const genericFunction = getAst(expression, "function");
  if (isRecord(genericFunction)) {
    const name = String(genericFunction.name ?? "").toLowerCase();
    const type = aggregateTypeByName(name, genericFunction, schema, binds, tableAliases, dialect);
    if (type) return type;
  }

  const aggregate =
    getAst(expression, "sum") ??
    getAst(expression, "min") ??
    getAst(expression, "max") ??
    getAst(expression, "median");
  if (isRecord(aggregate)) {
    const inner = firstAggregateExpression(aggregate);
    if (getAst(expression, "sum"))
      return dialectSumType(aggregate, schema, binds, tableAliases, dialect);
    if (inner) return inferAggregateExpressionType(inner, schema, binds, tableAliases);
  }

  return undefined;
}

function dialectCountType(dialect: string): string {
  return getDialectConfig(dialect).aggregate.countType;
}

function dialectAvgType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
  tableAliases: TableAliasMap | undefined,
  dialect: string,
): string {
  const avg = getAst(expression, "avg");
  const inner = firstAggregateExpression(isRecord(avg) ? avg : expression);
  const innerType = inner
    ? inferAggregateExpressionType(inner, schema, binds, tableAliases)
    : undefined;
  const decimal = innerType ? decimalTypeParts(innerType) : undefined;
  const policy = getDialectConfig(dialect).aggregate;
  if (decimal && policy.avgDecimal === "mysqlPlus4")
    return `decimal(${decimal.precision + 4},${decimal.scale + 4})`;
  if (decimal && policy.avgDecimal === "tsqlScaleAtLeast6")
    return `decimal(38,${Math.max(decimal.scale, 6)})`;
  if (policy.avgDefault === "integerPreserving") {
    if (innerType && ["integer", "bigint"].includes(normalizeDataTypeName(innerType)))
      return innerType;
    return "decimal";
  }
  return policy.avgDefault;
}

function dialectSumType(
  aggregate: Record<string, unknown>,
  schema: ValidationSchema,
  binds: Binds | undefined,
  tableAliases: TableAliasMap | undefined,
  dialect: string,
): string | undefined {
  const inner = firstAggregateExpression(aggregate);
  const innerType = inner
    ? inferAggregateExpressionType(inner, schema, binds, tableAliases)
    : undefined;
  const decimal = innerType ? decimalTypeParts(innerType) : undefined;
  if (!decimal) return innerType;
  const policy = getDialectConfig(dialect).aggregate.sumDecimal;
  if (policy === "mysqlPlus22") return `decimal(${decimal.precision + 22},${decimal.scale})`;
  if (policy === "decimal38") return `decimal(38,${decimal.scale})`;
  if (policy === "numeric") return "numeric";
  if (policy === "number") return "number";
  return innerType;
}

function aggregateTypeByName(
  name: string,
  aggregate: Record<string, unknown>,
  schema: ValidationSchema,
  binds: Binds | undefined,
  tableAliases?: TableAliasMap,
  dialect = "generic",
): string | undefined {
  if (
    [
      "count",
      "count_if",
      "approx_count_distinct",
      "approx_distinct",
      "hash_agg",
      "regr_count",
      "uniq",
      "uniqexact",
      "bitmap_union_count",
    ].includes(name)
  )
    return dialectCountType(dialect);
  if (
    [
      "avg",
      "corr",
      "covar_pop",
      "covar_samp",
      "entropy",
      "geometric_mean",
      "kurtosis",
      "mad",
      "product",
      "regr_avgx",
      "regr_avgy",
      "regr_intercept",
      "regr_r2",
      "regr_slope",
      "stddev",
      "stddev_pop",
      "stddev_samp",
      "stddevpop",
      "stddevsamp",
      "sem",
      "skewness",
      "stdev",
      "stdevp",
      "variance",
      "var",
      "var_pop",
      "var_samp",
      "varp",
      "varpop",
      "varsamp",
      "percentile_approx",
      "approx_percentile",
      "percentile_cont",
      "quantile",
      "quantile_cont",
      "quantile_disc",
      "total",
    ].includes(name)
  ) {
    if (name === "avg") return dialectAvgType(aggregate, schema, binds, tableAliases, dialect);
    return "decimal";
  }
  if (name === "sum") return dialectSumType(aggregate, schema, binds, tableAliases, dialect);
  if (["csum", "mavg"].includes(name)) {
    const inner = firstAggregateExpression(aggregate);
    return inner ? inferAggregateExpressionType(inner, schema, binds, tableAliases) : "decimal";
  }
  if (
    [
      "bool_and",
      "bool_or",
      "every",
      "logical_and",
      "logical_or",
      "booland_agg",
      "boolor_agg",
    ].includes(name)
  )
    return "boolean";
  if (["string_agg", "group_concat", "listagg", "ai_agg"].includes(name)) return "text";
  if (
    ["json_group_array", "json_group_object", "jsonb_group_array", "jsonb_group_object"].includes(
      name,
    )
  )
    return "json";
  if (["bit_and", "bit_or", "bit_xor", "checksum"].includes(name)) {
    const inner = firstAggregateExpression(aggregate);
    return inner ? inferAggregateExpressionType(inner, schema, binds, tableAliases) : "integer";
  }
  if (["array_agg", "list", "collect_list", "collect_set"].includes(name)) {
    const inner = firstAggregateExpression(aggregate);
    const type = inner
      ? inferAggregateExpressionType(inner, schema, binds, tableAliases)
      : "unknown";
    return `array<${type}>`;
  }
  if (name === "array_concat_agg") {
    const inner = firstAggregateExpression(aggregate);
    return inner
      ? inferAggregateExpressionType(inner, schema, binds, tableAliases)
      : "array<unknown>";
  }
  if (name === "approx_quantiles" || name === "quantiles") {
    const inner = firstAggregateExpression(aggregate);
    const type = inner
      ? inferAggregateExpressionType(inner, schema, binds, tableAliases)
      : "unknown";
    return `array<${type}>`;
  }
  if (["histogram"].includes(name)) {
    const inner = firstAggregateExpression(aggregate);
    const type = inner
      ? inferAggregateExpressionType(inner, schema, binds, tableAliases)
      : "unknown";
    return `map<${type}, integer>`;
  }
  if (name === "numeric_histogram") {
    const args = functionArguments(aggregate);
    const value = args[1] ?? args[0];
    const type = isRecord(value)
      ? inferAggregateExpressionType(value, schema, binds, tableAliases)
      : "unknown";
    return `map<${type}, decimal>`;
  }
  if (name === "approx_set") return "hyperloglog";
  if (name === "set_digest") return "setdigest";
  if (name === "map_agg" || name === "mapagg") {
    const args = functionArguments(aggregate);
    const keyType = isRecord(args[0])
      ? inferAggregateExpressionType(args[0], schema, binds, tableAliases)
      : "unknown";
    const valueType = isRecord(args[1])
      ? inferAggregateExpressionType(args[1], schema, binds, tableAliases)
      : "unknown";
    return `map<${keyType}, ${valueType}>`;
  }
  if (
    ["json_agg", "json_object_agg", "json_arrayagg", "json_objectagg", "object_agg"].includes(name)
  )
    return "json";
  if (["xmlagg"].includes(name)) return "xml";
  if (
    [
      "any_value",
      "any",
      "first",
      "last",
      "first_value",
      "last_value",
      "arbitrary",
      "argmax",
      "argmin",
      "mode",
      "percentile_disc",
    ].includes(name)
  ) {
    const inner = firstAggregateExpression(aggregate);
    return inner ? inferAggregateExpressionType(inner, schema, binds, tableAliases) : undefined;
  }
  return undefined;
}

function inferAggregateExpressionType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
  tableAliases?: TableAliasMap,
): string {
  return inferColumn(expression, "aggregate", schema, binds, "generic", undefined, tableAliases)
    .type;
}

function firstAggregateExpression(aggregate: Record<string, unknown>): AstExpression | undefined {
  return firstExpression(
    [
      aggregate.this,
      ...(Array.isArray(aggregate.args) ? aggregate.args : []),
      ...(Array.isArray(aggregate.expressions) ? aggregate.expressions : []),
    ].filter(isRecord),
  );
}

function inferScalarSubqueryType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
): string | undefined {
  const subquery = getAst(expression, "subquery");
  if (!isRecord(subquery) || !isRecord(subquery.this)) return undefined;
  const items = outputItemsForStatement(subquery.this, schema);
  const select = isRecord(subquery.this.select) ? subquery.this.select : undefined;
  if (select && String(select.kind ?? "").toUpperCase() === "STRUCT" && items.length > 0) {
    const fields = items.map((item, index) => {
      const name = item.name ?? inferNameFromAst(item.expression, index + 1);
      const type = inferColumn(
        item.expression,
        name,
        item.schema ?? schema,
        binds,
        "generic",
        item.source,
        item.tableAliases,
      ).type;
      return `${name} ${type}`;
    });
    return `struct<${fields.join(", ")}>`;
  }
  const first = items[0];
  if (!first) return undefined;
  return inferColumn(
    first.expression,
    first.name ?? "subquery",
    first.schema ?? schema,
    binds,
    "generic",
    first.source,
    first.tableAliases,
  ).type;
}

function inferPredicateType(expression: AstExpression): string | undefined {
  const predicates = [
    "eq",
    "neq",
    "null_safe_eq",
    "null_safe_neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "and",
    "or",
    "not",
    "is_null",
    "is_not_null",
    "is",
    "in",
    "like",
    "ilike",
    "i_like",
    "similar_to",
    "between",
    "exists",
    "regexp_like",
    "regexp_i_like",
    "match",
    "glob",
    "is_json",
    "starts_with",
    "ends_with",
    "contains",
    "array_contains_all",
    "array_contained_by",
    "array_overlaps",
  ];
  return predicates.some((key) => isAst(expression, key)) ? "boolean" : undefined;
}

function inferJsonType(expression: AstExpression): string | undefined {
  if (
    getAst(expression, "json_object") ||
    getAst(expression, "j_s_o_n_array") ||
    getAst(expression, "json_extract")
  )
    return "json";
  if (getAst(expression, "j_s_o_n_extract")) return "json";
  if (hasAstKey(expression, "json_extract_path")) return "json";
  if (hasAstKey(expression, "json_extract_scalar")) return "text";
  if (getAst(expression, "json_value")) return "text";
  if (getAst(expression, "to_json")) return "json";
  if (getAst(expression, "json_keys")) return "json";
  if (getAst(expression, "json_array_length")) return "integer";
  if (
    getAst(expression, "json_typeof") ||
    getAst(expression, "jsonb_typeof") ||
    getAst(expression, "json_type")
  )
    return "text";

  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? "").toLowerCase();
  if (
    [
      "json_build_object",
      "json_build_array",
      "json_object",
      "json_array",
      "json_keys",
      "to_json",
    ].includes(name)
  )
    return "json";
  if (
    [
      "jsonb_build_object",
      "jsonb_build_array",
      "to_jsonb",
      "jsonb_path_query",
      "jsonb_path_query_first",
      "jsonb_path_query_array",
    ].includes(name)
  )
    return "jsonb";
  if (
    [
      "json_extract",
      "json_query",
      "json_set",
      "json_insert",
      "json_replace",
      "json_remove",
      "json_patch",
      "json_merge_patch",
      "json_array_append",
      "json_array_insert",
      "json_extract_json",
    ].includes(name)
  )
    return "json";
  if (["json_query_array"].includes(name)) return "array<json>";
  if (["json_value_array"].includes(name)) return "array<text>";
  if (
    [
      "json_extract_scalar",
      "json_value",
      "json_search",
      "get_json_object",
      "get_json_string",
      "json_tuple",
      "jsonextractstring",
      "jsonb_extract_path_text",
    ].includes(name)
  )
    return "text";
  if (["json_array_length", "jsonb_array_length", "json_length", "json_size"].includes(name))
    return "integer";
  if (["jsonextractint", "jsonextractuint"].includes(name)) return "integer";
  if (["jsonextractfloat"].includes(name)) return "decimal";
  if (["jsonhas", "json_valid", "jsonb_path_exists", "json_array_contains"].includes(name))
    return "boolean";
  if (["json_typeof", "jsonb_typeof", "json_type"].includes(name)) return "text";
  return undefined;
}

function hasAstKey(value: unknown, key: string): boolean {
  if (!isRecord(value)) return false;
  if (isRecord(value[key])) return true;
  return Object.values(value).some((entry) => {
    if (Array.isArray(entry)) return entry.some((item) => hasAstKey(item, key));
    return hasAstKey(entry, key);
  });
}

function inferTemporalFunctionType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
): string | undefined {
  if (getAst(expression, "interval")) return "interval";
  const arithmetic = getAst(expression, "add") ?? getAst(expression, "sub");
  if (isRecord(arithmetic)) {
    const leftType = isRecord(arithmetic.left)
      ? inferColumn(arithmetic.left, "temporal_left", schema, binds, "generic").type
      : undefined;
    const rightType = isRecord(arithmetic.right)
      ? inferColumn(arithmetic.right, "temporal_right", schema, binds, "generic").type
      : undefined;
    if (leftType && rightType) {
      if (isTemporalType(leftType) && rightType === "interval") return leftType;
      if (leftType === "interval" && isTemporalType(rightType)) return rightType;
      if (leftType === "interval" && rightType === "interval") return "interval";
      if (isTemporalType(leftType) && isTemporalType(rightType) && getAst(expression, "sub"))
        return "integer";
    }
  }
  if (getAst(expression, "extract")) return "integer";
  if (getAst(expression, "at_time_zone")) return "datetimeoffset";
  if (
    getAst(expression, "day") ||
    getAst(expression, "month") ||
    getAst(expression, "year") ||
    getAst(expression, "quarter") ||
    getAst(expression, "weekofyear") ||
    getAst(expression, "week_of_year")
  )
    return "integer";
  if (getAst(expression, "date_diff")) return "integer";
  if (getAst(expression, "last_day")) return "date";
  if (getAst(expression, "next_day")) return "date";
  if (getAst(expression, "add_months")) return "date";
  if (getAst(expression, "months_between")) return "decimal";
  if (
    getAst(expression, "epoch") ||
    getAst(expression, "epoch_ms") ||
    getAst(expression, "epoch_us") ||
    getAst(expression, "epoch_ns")
  )
    return "integer";

  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? "").toLowerCase();
  if (
    [
      "date_add",
      "date_sub",
      "timestamp_add",
      "timestamp_sub",
      "datetime_add",
      "datetime_sub",
      "add_months",
      "dateadd",
      "timeadd",
      "timestampadd",
      "adddays",
      "addmonths",
      "addyears",
      "subtractdays",
      "subtractmonths",
      "subtractyears",
    ].includes(name)
  ) {
    const valueType = functionArguments(fn)
      .map((arg) => inferColumn(arg, "temporal", schema, binds, "generic").type)
      .find(isTemporalType);
    if (valueType) return valueType;
    if (name.startsWith("timestamp")) return "timestamp";
    if (name.startsWith("datetime")) return "datetime";
    if (name.startsWith("time")) return "time";
    return "date";
  }
  if (
    [
      "date_trunc",
      "timestamp_trunc",
      "datetime_trunc",
      "datetrunc",
      "tostartofday",
      "tostartofhour",
      "tostartofminute",
      "tostartofweek",
      "tostartofmonth",
      "tostartofyear",
      "trunc",
    ].includes(name)
  ) {
    const args = functionArguments(fn);
    const value = args[1] ?? args[0];
    if (value) {
      const type = inferColumn(value, "temporal", schema, binds, "generic").type;
      if (/date/i.test(type) && !/time|timestamp|datetime/i.test(type)) return "date";
      if (/time/i.test(type) && !/timestamp|datetime/i.test(type)) return "time";
    }
    return name === "date_trunc" || name === "timestamp_trunc" ? "timestamp" : "datetime";
  }
  if (["time_floor", "time_ceil", "time_shift"].includes(name)) return "timestamp";
  if (name === "time_parse") return "timestamp";
  if (name === "time_format") return "text";
  if (name === "time_extract") return "integer";
  if (
    name === "date_part" ||
    name === "datepart" ||
    name === "extract" ||
    /^to(?:year|month|day|hour|minute|second|unixtimestamp)/i.test(name)
  )
    return "integer";
  if (["quarter", "weekofyear"].includes(name)) return "integer";
  if (name === "datename") return "text";
  if (["datediff", "date_diff", "timestampdiff", "timestamp_diff"].includes(name)) return "integer";
  if (
    ["unix_seconds", "unix_millis", "unix_micros", "unix_timestamp", "time_to_sec"].includes(name)
  )
    return "integer";
  if (["epoch", "epoch_ms", "epoch_us", "epoch_ns"].includes(name)) return "integer";
  if (name === "numtodsinterval") return "interval day(9) to second(9)";
  if (name === "numtoyminterval") return "interval year(9) to month";
  if (["make_interval", "justify_interval", "justify_days", "justify_hours"].includes(name))
    return "interval";
  if (name === "date_bin") {
    const args = functionArguments(fn);
    const value = args[1] ?? args[0];
    if (value) {
      const type = inferColumn(value, "temporal", schema, binds, "generic").type;
      if (isTemporalType(type)) return type;
    }
    return "timestamp";
  }
  if (
    [
      "make_date",
      "date_from_parts",
      "parse_date",
      "to_date",
      "str_to_date",
      "ts_or_ds_to_date",
      "last_day",
      "last_day_of_month",
      "eomonth",
      "curdate",
      "utc_date",
      "today",
      "yesterday",
      "next_day",
    ].includes(name)
  )
    return "date";
  if (
    [
      "make_time",
      "time_from_parts",
      "parse_time",
      "to_time",
      "curtime",
      "utc_time",
      "sec_to_time",
    ].includes(name)
  )
    return "time";
  if (
    [
      "make_timestamp",
      "timestamp_from_parts",
      "datetime_from_parts",
      "parse_timestamp",
      "to_timestamp",
      "from_unixtime",
      "tumble_start",
      "tumble_end",
      "hop_start",
      "hop_end",
    ].includes(name)
  )
    return "timestamp";
  if (["parse_datetime", "to_datetime"].includes(name)) return "datetime";
  if (
    [
      "clock_timestamp",
      "statement_timestamp",
      "transaction_timestamp",
      "current_timestamp",
      "pg_postmaster_start_time",
      "getdate",
      "sysdatetime",
      "sysutcdatetime",
      "sysdate",
      "systimestamp",
    ].includes(name)
  )
    return "timestamp";
  return undefined;
}

function isTemporalType(type: string): boolean {
  return /^(date|time|timestamp|datetime)$/i.test(type);
}

function inferGeospatialFunctionType(
  expression: AstExpression,
  dialect = "generic",
): string | undefined {
  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? "").toLowerCase();
  const configuredType =
    getDialectConfig(dialect).scalarFunctionTypes[name] ??
    getDialectConfig("generic").scalarFunctionTypes[name];
  if (configuredType && /^st_|^(?:to_)?geography|geometry$/i.test(name)) return configuredType;
  if (
    [
      "st_geogpoint",
      "st_geogfromtext",
      "st_geogfromgeojson",
      "st_geogfromwkb",
      "to_geography",
    ].includes(name)
  )
    return "geography";
  if (
    [
      "st_point",
      "st_makepoint",
      "st_makeenvelope",
      "to_geometry",
      "st_geomfromtext",
      "st_geometryfromtext",
      "st_geomfromgeojson",
      "st_geomfromwkb",
      "st_setsrid",
      "st_transform",
      "st_buffer",
      "st_centroid",
      "st_union",
      "st_intersection",
      "st_difference",
      "st_envelope",
      "st_boundary",
    ].includes(name)
  )
    return "geometry";
  if (["st_astext", "st_aswkt", "st_asgeojson", "st_geohash"].includes(name)) return "text";
  if (["st_asbinary", "st_aswkb"].includes(name)) return "bytes";
  if (
    [
      "st_area",
      "st_distance",
      "st_length",
      "st_perimeter",
      "st_x",
      "st_y",
      "st_z",
      "st_azimuth",
    ].includes(name)
  )
    return "decimal";
  if (["st_srid", "st_npoints", "st_ndims", "st_dimension"].includes(name)) return "integer";
  if (
    [
      "st_contains",
      "st_coveredby",
      "st_covers",
      "st_crosses",
      "st_disjoint",
      "st_dwithin",
      "st_equals",
      "st_intersects",
      "st_overlaps",
      "st_touches",
      "st_within",
      "st_isclosed",
      "st_isempty",
      "st_isvalid",
    ].includes(name)
  )
    return "boolean";
  return undefined;
}

function inferIdentifierHashRandomType(
  expression: AstExpression,
  dialect = "generic",
): string | undefined {
  if (isAst(expression, "random") || isAst(expression, "rand")) return "decimal";
  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? "").toLowerCase();
  if (["uuid", "uuid_string", "gen_random_uuid"].includes(name)) return "uuid";
  if (["encode", "md5", "password", "sha", "sha1", "hex", "to_hex"].includes(name)) return "text";
  if (["sha224", "sha256", "sha384", "sha512", "digest", "gen_random_bytes", "hmac"].includes(name))
    return "bytes";
  if (["random", "rand"].includes(name)) return "decimal";
  return undefined;
}

function inferConditionalType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
  dialect = "generic",
): string | undefined {
  const coalesceExpression = getAst(expression, "coalesce") ?? getAst(expression, "nullif");
  if (isRecord(coalesceExpression)) {
    return (
      bindFirstArgumentType(coalesceExpression, binds) ??
      commonArgumentType(functionArguments(coalesceExpression), schema, binds, dialect)
    );
  }

  const caseExpression = getAst(expression, "case");
  if (isRecord(caseExpression)) {
    const branches = (Array.isArray(caseExpression.whens) ? caseExpression.whens : []).flatMap(
      (when) => (Array.isArray(when) && isRecord(when[1]) ? [when[1]] : []),
    );
    if (isRecord(caseExpression.else_)) branches.push(caseExpression.else_);
    return commonArgumentType(branches, schema, binds, dialect);
  }

  const ifExpression = getAst(expression, "if_func");
  if (isRecord(ifExpression)) {
    const branches = [ifExpression.true_value, ifExpression.false_value].filter(isRecord);
    return commonArgumentType(branches, schema, binds, dialect);
  }

  const nvl2Expression = getAst(expression, "nvl2");
  if (isRecord(nvl2Expression)) {
    const branches = [nvl2Expression.true_value, nvl2Expression.false_value].filter(isRecord);
    return commonArgumentType(branches, schema, binds, dialect);
  }

  const genericFunction = getAst(expression, "function");
  if (isRecord(genericFunction) && String(genericFunction.name ?? "").toLowerCase() === "choose") {
    return commonArgumentType(functionArguments(genericFunction).slice(1), schema, binds, dialect);
  }
  if (isRecord(genericFunction) && String(genericFunction.name ?? "").toLowerCase() === "multiif") {
    const args = functionArguments(genericFunction);
    const branches = args.filter((_, index) => index % 2 === 1 || index === args.length - 1);
    return commonArgumentType(branches, schema, binds, dialect);
  }
  if (isRecord(genericFunction) && String(genericFunction.name ?? "").toLowerCase() === "choose") {
    return commonArgumentType(functionArguments(genericFunction).slice(1), schema, binds, dialect);
  }

  return undefined;
}

function inferConstructorType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
): string | undefined {
  const array = getAst(expression, "array_func");
  if (isRecord(array) && Array.isArray(array.expressions)) {
    const type = commonArgumentType(array.expressions.filter(isRecord), schema, binds) ?? "unknown";
    return `array<${type}>`;
  }

  const tuple = getAst(expression, "tuple");
  if (isRecord(tuple) && Array.isArray(tuple.expressions)) {
    const fields = tuple.expressions.filter(isRecord).map((arg, index) => {
      const name = inferNameFromAst(arg, index + 1);
      const type = inferColumn(arg, name, schema, binds, "generic").type;
      return `${name} ${type}`;
    });
    return fields.length > 0 ? `record<${fields.join(", ")}>` : undefined;
  }

  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? "").toLowerCase();
  const args = functionArguments(fn);
  if (name === "array") {
    const subquery = args.find((arg) => isRecord(arg.select));
    if (subquery) {
      const items = outputItemsForStatement(subquery, schema);
      const first = items[0];
      if (first) {
        const type = inferColumn(
          first.expression,
          first.name ?? "array",
          first.schema ?? schema,
          binds,
          "generic",
          first.source,
          first.tableAliases,
        ).type;
        return `array<${type}>`;
      }
    }
    const type = commonArgumentType(args, schema, binds) ?? "unknown";
    return `array<${type}>`;
  }
  if (name === "generate_array") {
    const type = commonArgumentType(args, schema, binds) ?? "integer";
    return `array<${type}>`;
  }
  if (name === "generate_date_array") return "array<date>";
  if (name === "generate_timestamp_array") return "array<timestamp>";
  if (["list_value", "array_value"].includes(name)) {
    const type = commonArgumentType(args, schema, binds) ?? "unknown";
    return `array<${type}>`;
  }
  if (["array_construct", "array_construct_compact"].includes(name)) {
    const type = commonArgumentType(args, schema, binds) ?? "variant";
    return `array<${type}>`;
  }
  if (["object_construct", "object_construct_keep_null"].includes(name)) return "object";
  const higherOrderType = inferHigherOrderArrayFunctionType(name, args, schema, binds);
  if (higherOrderType) return higherOrderType;
  if (name === "map") {
    const keys = args.filter((_, index) => index % 2 === 0);
    const values = args.filter((_, index) => index % 2 === 1);
    const keyType = commonArgumentType(keys, schema, binds) ?? "unknown";
    const valueType = commonArgumentType(values, schema, binds) ?? "unknown";
    return `map<${keyType}, ${valueType}>`;
  }
  if (name === "named_struct") {
    const fields = namedStructFields(args, schema, binds);
    return fields.length > 0 ? `struct<${fields.join(", ")}>` : undefined;
  }
  if (name === "struct") {
    const fields = args.map((arg, index) => {
      const unwrapped = unwrapAlias(arg);
      const fieldName = unwrapped.name ?? inferNameFromAst(unwrapped.expression, index + 1);
      const type = inferColumn(unwrapped.expression, fieldName, schema, binds, "generic").type;
      return `${fieldName} ${type}`;
    });
    return fields.length > 0 ? `struct<${fields.join(", ")}>` : undefined;
  }
  if (name === "struct_pack") {
    const fields = namedArgumentStructFields(args, schema, binds);
    return fields.length > 0 ? `struct<${fields.join(", ")}>` : undefined;
  }
  return undefined;
}

function namedStructFields(
  args: AstExpression[],
  schema: ValidationSchema,
  binds: Binds | undefined,
): string[] {
  const fields: string[] = [];
  for (let index = 0; index + 1 < args.length; index += 2) {
    const name = literalString(args[index]) ?? `field_${index / 2 + 1}`;
    const value = args[index + 1];
    const type = inferColumn(value, name, schema, binds, "generic").type;
    fields.push(`${cleanIdentifier(name)} ${type}`);
  }
  return fields;
}

function structFieldsFromSchemaString(schema: string): string[] {
  return splitTopLevel(schema, ",").flatMap((part) => {
    const match = part.trim().match(/^([`"']?[\w$]+[`"']?)\s+(.+)$/);
    if (!match) return [];
    const name = cleanIdentifier(match[1]);
    const type = dataTypeFromRawColumnSpec(match[2]) ?? "unknown";
    return name ? [`${name} ${type}`] : [];
  });
}

function inferHigherOrderArrayFunctionType(
  name: string,
  args: AstExpression[],
  schema: ValidationSchema,
  binds: Binds | undefined,
): string | undefined {
  if (
    ![
      "transform",
      "list_transform",
      "list_apply",
      "array_transform",
      "arraymap",
      "filter",
      "array_filter",
      "list_filter",
      "arrayfilter",
      "exists",
      "forall",
      "any_match",
      "all_match",
      "none_match",
      "reduce",
      "aggregate",
      "array_reduce",
    ].includes(name)
  )
    return undefined;

  const lambdaFirst = ["arraymap", "arrayfilter"].includes(name);
  const arrayExpression = lambdaFirst ? args[1] : args[0];
  const arrayType = arrayExpression
    ? inferColumn(arrayExpression, "lambda_array", schema, binds, "generic").type
    : undefined;
  const elementType = arrayType ? arrayElementType(arrayType) : undefined;
  if (["filter", "array_filter", "list_filter", "arrayfilter"].includes(name)) return arrayType;
  if (["exists", "forall", "any_match", "all_match", "none_match"].includes(name)) return "boolean";
  if (["reduce", "aggregate", "array_reduce"].includes(name)) {
    const initialState = args[1];
    if (initialState && !isRecord(initialState.lambda))
      return inferColumn(initialState, "lambda_state", schema, binds, "generic").type;
    return elementType;
  }
  const lambda = args.find((arg) => isRecord(arg.lambda))?.lambda;
  const body = isRecord(lambda) && isRecord(lambda.body) ? lambda.body : undefined;
  const parameters =
    isRecord(lambda) && Array.isArray(lambda.parameters)
      ? lambda.parameters
          .map(identifierName)
          .filter((parameter): parameter is string => Boolean(parameter))
      : [];
  const bodyType = body
    ? inferLambdaBodyType(
        body,
        new Map(parameters.map((parameter) => [parameter.toLowerCase(), elementType ?? "unknown"])),
        schema,
        binds,
      )
    : undefined;
  return `array<${bodyType ?? elementType ?? "unknown"}>`;
}

function inferLambdaBodyType(
  expression: AstExpression,
  parameters: Map<string, string>,
  schema: ValidationSchema,
  binds: Binds | undefined,
): string | undefined {
  const column = getAst(expression, "column");
  const columnName = isRecord(column) ? identifierName(column.name)?.toLowerCase() : undefined;
  if (columnName && parameters.has(columnName)) return parameters.get(columnName);
  if (
    getAst(expression, "lower") ||
    getAst(expression, "upper") ||
    getAst(expression, "trim") ||
    getAst(expression, "initcap")
  )
    return "text";
  if (
    getAst(expression, "length") ||
    getAst(expression, "char_length") ||
    getAst(expression, "cardinality")
  )
    return "integer";
  if (getAst(expression, "array_contains")) return "boolean";
  const predicate = inferPredicateType(expression);
  if (predicate) return predicate;
  const arithmetic =
    getAst(expression, "add") ??
    getAst(expression, "sub") ??
    getAst(expression, "mul") ??
    getAst(expression, "div") ??
    getAst(expression, "int_div") ??
    getAst(expression, "mod");
  if (isRecord(arithmetic)) {
    const types = [arithmetic.left, arithmetic.right, arithmetic.this, arithmetic.expression]
      .filter(isRecord)
      .map(
        (part) =>
          inferLambdaBodyType(part, parameters, schema, binds) ??
          inferColumn(part, "lambda_arg", schema, binds, "generic").type,
      );
    if (types.some((type) => /decimal|numeric|real|double|float/i.test(type))) return "decimal";
    if (types.some((type) => /int|number|bigint|smallint/i.test(type))) return "integer";
  }
  return inferColumn(expression, "lambda_body", schema, binds, "generic").type;
}

function namedArgumentStructFields(
  args: AstExpression[],
  schema: ValidationSchema,
  binds: Binds | undefined,
): string[] {
  return args.flatMap((arg, index) => {
    const namedArgument = isRecord(arg.named_argument) ? arg.named_argument : undefined;
    const name = identifierName(namedArgument?.name) ?? `field_${index + 1}`;
    const value = isRecord(namedArgument?.value) ? namedArgument.value : undefined;
    if (!value) return [];
    const type = inferColumn(value, name, schema, binds, "generic").type;
    return [`${cleanIdentifier(name)} ${type}`];
  });
}

function inferScalarFunctionType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
  dialect = "generic",
): string | undefined {
  if (
    getAst(expression, "lower") ||
    getAst(expression, "upper") ||
    getAst(expression, "trim") ||
    getAst(expression, "initcap")
  )
    return "text";
  if (getAst(expression, "substring") || getAst(expression, "substr")) return "text";
  if (getAst(expression, "overlay")) return "text";
  if (
    getAst(expression, "length") ||
    getAst(expression, "char_length") ||
    getAst(expression, "bit_length") ||
    getAst(expression, "octet_length") ||
    getAst(expression, "str_position")
  )
    return "integer";
  if (isAst(expression, "random") || isAst(expression, "rand")) return "decimal";
  if (getAst(expression, "degrees") || getAst(expression, "radians")) return "decimal";
  if (getAst(expression, "cardinality")) return "integer";
  if (getAst(expression, "array_length")) return "integer";
  if (getAst(expression, "array_size")) return "integer";
  if (getAst(expression, "array_position")) return "integer";
  if (getAst(expression, "array_contains")) return "boolean";
  if (getAst(expression, "to_number")) return "decimal";
  if (getAst(expression, "json_query") || getAst(expression, "parse_json")) return "json";
  if (getAst(expression, "typeof")) return "text";
  const nvl = getAst(expression, "nvl");
  if (isRecord(nvl))
    return commonArgumentType([nvl.this, nvl.expression].filter(isRecord), schema, binds);

  const mapType = inferMapFunctionType(expression, schema, binds);
  if (mapType) return mapType;

  const arrayAppend = getAst(expression, "array_append");
  if (isRecord(arrayAppend)) {
    return firstArrayArgumentType(
      [arrayAppend.this, arrayAppend.expression].filter(isRecord),
      schema,
      binds,
    );
  }
  const arrayPrepend = getAst(expression, "array_prepend");
  if (isRecord(arrayPrepend)) {
    return firstArrayArgumentType(
      [arrayPrepend.this, arrayPrepend.expression].filter(isRecord),
      schema,
      binds,
    );
  }
  const arrayDistinct = getAst(expression, "array_distinct");
  if (isRecord(arrayDistinct)) {
    return firstArrayArgumentType([arrayDistinct.this].filter(isRecord), schema, binds);
  }
  const arrayRemove = getAst(expression, "array_remove");
  if (isRecord(arrayRemove)) {
    return firstArrayArgumentType(
      [arrayRemove.this, arrayRemove.expression].filter(isRecord),
      schema,
      binds,
    );
  }
  const arrayReverse = getAst(expression, "array_reverse");
  if (isRecord(arrayReverse)) {
    return firstArrayArgumentType([arrayReverse.this].filter(isRecord), schema, binds);
  }
  const arrayCompact = getAst(expression, "array_compact");
  if (isRecord(arrayCompact)) {
    return firstArrayArgumentType([arrayCompact.this].filter(isRecord), schema, binds);
  }
  const arrayIntersect = getAst(expression, "array_intersect");
  if (isRecord(arrayIntersect)) {
    return firstArrayArgumentType(functionArguments(arrayIntersect), schema, binds);
  }
  const arrayUnion = getAst(expression, "array_union");
  if (isRecord(arrayUnion)) {
    return firstArrayArgumentType(
      [arrayUnion.this, arrayUnion.expression].filter(isRecord),
      schema,
      binds,
    );
  }
  const arrayExcept = getAst(expression, "array_except");
  if (isRecord(arrayExcept)) {
    return firstArrayArgumentType(
      [arrayExcept.this, arrayExcept.expression].filter(isRecord),
      schema,
      binds,
    );
  }

  const numericValue =
    getAst(expression, "abs") ??
    getAst(expression, "round") ??
    getAst(expression, "ceil") ??
    getAst(expression, "ceiling") ??
    getAst(expression, "floor");
  if (isRecord(numericValue)) {
    const inner = firstExpression(
      [numericValue.this, ...(Array.isArray(numericValue.args) ? numericValue.args : [])].filter(
        Boolean,
      ),
    );
    if (inner) return inferColumn(inner, "scalar", schema, binds, "generic").type;
    return "decimal";
  }

  const coalesce = getAst(expression, "coalesce") ?? getAst(expression, "nullif");
  if (isRecord(coalesce))
    return (
      bindFirstArgumentType(coalesce, binds) ??
      commonArgumentType(functionArguments(coalesce), schema, binds)
    );

  const genericFunction = getAst(expression, "function");
  if (!isRecord(genericFunction)) return undefined;
  const name = String(genericFunction.name ?? "").toLowerCase();
  const configuredType =
    getDialectConfig(dialect).scalarFunctionTypes[name] ??
    getDialectConfig("generic").scalarFunctionTypes[name];
  if (configuredType) return configuredType;
  if (["nextval", "currval", "lastval", "setval"].includes(name)) return "bigint";
  if (name === "try") {
    const arg = functionArguments(genericFunction)[0];
    return arg ? inferColumn(arg, "scalar", schema, binds, "generic").type : undefined;
  }
  if (
    [
      "lower",
      "upper",
      "lowerutf8",
      "upperutf8",
      "reverse",
      "initcap",
      "trim",
      "ltrim",
      "rtrim",
      "substring",
      "substr",
      "substring_index",
      "stuff",
      "lpad",
      "rpad",
      "chr",
      "code_points_to_string",
      "elt",
      "left",
      "right",
      "repeat",
      "overlay",
      "replace",
      "otranslate",
      "oreplace",
      "regexp_replace",
      "regexp_extract",
      "regexp_substr",
      "convert_from",
      "replaceall",
      "replaceregexpall",
      "replaceregexpone",
      "split_part",
      "concat",
      "concat_ws",
      "to_char",
      "time_to_str",
      "date_format",
      "format_date",
      "pg_typeof",
      "quote_ident",
      "quote_literal",
      "quote_nullable",
      "inet_ntoa",
      "to_json_string",
      "json_value",
      "json_extract_string",
      "get_json_string",
      "tidb_version",
      "stringify_json",
      "from_utf8",
      "typeof",
      "system$typeof",
      "sha2",
      "json_unquote",
      "json_pretty",
      "to_base64",
      "check_json",
      "tostring",
      "format",
      "bin",
      "json_type",
      "format_datetime",
      "formatdatetime",
      "soundex",
      "space",
      "to_varchar",
      "inet6_ntoa",
      "make_set",
      "export_set",
      "classifier",
      "base64_encode",
      "base64_decode_string",
      "decompress_string",
      "parse_url",
      "arraystringconcat",
      "current_catalog",
      "current_schema",
      "inet_client_addr",
      "current_query",
      "current_database",
      "current_user",
      "current_warehouse",
      "current_version",
      "current_account",
      "current_region",
      "current_role",
      "database",
      "schema",
      "user",
      "suser_name",
      "system_user",
      "last_query_id",
      "obj_description",
      "col_description",
      "pg_get_expr",
      "currentdatabase",
      "currentuser",
      "version",
      "db_name",
      "host_name",
      "app_name",
      "stats",
      "quote",
      "sqlite_version",
      "sqlite_source_id",
      "fts5_get_locale",
      "fts5_insttoken",
      "printf",
      "highlight",
      "snippet",
      "dump",
      "conv",
      "url_extract_host",
      "url_extract_protocol",
      "url_extract_path",
      "url_extract_query",
      "url_extract_fragment",
      "url_encode",
      "bytearray_substring",
      "json_type",
      "jsontype",
      "to_clob",
      "rawtohex",
      "object_name",
      "schema_name",
    ].includes(name)
  )
    return "text";
  if (
    [
      "length",
      "char_length",
      "character_length",
      "bit_length",
      "byte_length",
      "octet_length",
      "ascii",
      "codepoint",
      "instr",
      "locate",
      "strpos",
      "position",
      "charindex",
      "size",
      "match_number",
      "array_position",
      "array_size",
      "array_ndims",
      "array_upper",
      "array_lower",
      "field",
      "find_in_set",
      "inet_aton",
      "inet_client_port",
      "datalength",
      "width_bucket",
      "num_nonnulls",
      "num_nulls",
      "crc32",
      "farm_fingerprint",
      "cityhash64",
      "siphash64",
      "checksum",
      "levenshtein",
      "editdistance",
      "bit_count",
      "bitcount",
      "bitmap_count",
      "bitmap_union_count",
      "hll_cardinality",
      "jsonlength",
      "connection_id",
      "last_insert_id",
      "changes",
      "total_changes",
      "last_insert_rowid",
      "pg_backend_pid",
      "inet_server_port",
      "txid_current",
      "binary_checksum",
      "patindex",
      "monotonically_increasing_id",
      "ora_hash",
      "json_storage_size",
      "day",
      "dayofmonth",
      "month",
      "year",
      "quarter",
      "week",
      "weekofyear",
      "hour",
      "minute",
      "second",
      "db_id",
      "object_id",
      "isdate",
      "isnumeric",
      "hashamp",
      "hashbucket",
      "index",
    ].includes(name)
  )
    return "integer";
  if (name === "matchinfo") return "bytes";
  if (name === "offsets") return "text";
  if (name === "bm25") return "decimal";
  if (["regexp_count"].includes(name)) return "integer";
  if (["regexp_instr", "regexp_position"].includes(name)) return "integer";
  if (
    [
      "regexp",
      "regexp_full_match",
      "regexp_contains",
      "regexp_like",
      "rlike",
      "match",
      "prefix",
      "suffix",
      "starts_with",
      "ends_with",
      "startswith",
      "endswith",
      "json_contains",
      "json_valid",
      "json_array_contains",
      "is_null_value",
      "is_inf",
      "is_nan",
      "isfinite",
      "is_ipv4",
      "is_ipv6",
      "contains",
      "has",
      "list_has",
      "list_has_all",
      "list_has_any",
      "array_contains_all",
      "array_contained_by",
      "array_overlaps",
      "empty",
      "notempty",
    ].includes(name)
  )
    return "boolean";
  if (
    [
      "regexp_matches",
      "regexp_match",
      "split",
      "str_split",
      "string_to_array",
      "regexp_split",
      "regexp_extract_all",
      "parse_ident",
    ].includes(name)
  )
    return "array<text>";
  if (["regexp_split_to_array"].includes(name)) return "array<text>";
  if (name === "regexp_split_to_table") return "text";
  if (name === "array_dims") return "text";
  if (["to_tsvector", "setweight"].includes(name)) return "tsvector";
  if (["to_tsquery", "plainto_tsquery", "phraseto_tsquery", "websearch_to_tsquery"].includes(name))
    return "tsquery";
  if (name === "object_keys") return "array<text>";
  if (name === "to_code_points") return "array<integer>";
  if (
    [
      "uuid",
      "uuid_string",
      "gen_random_uuid",
      "generate_uuid",
      "generateuuidv4",
      "newid",
      "newsequentialid",
    ].includes(name)
  )
    return "uuid";
  if (["md5", "sha", "sha1", "hex", "to_hex"].includes(name)) return "text";
  if (name === "decode") {
    const args = functionArguments(genericFunction);
    if (args.length > 2)
      return commonArgumentType(
        [...args.slice(2).filter((_, index) => index % 2 === 0), args.at(-1)].filter(isRecord),
        schema,
        binds,
      );
    return "bytes";
  }
  if (
    [
      "sha224",
      "sha256",
      "sha384",
      "sha512",
      "md5_binary",
      "sha2_binary",
      "to_binary",
      "convert_to",
      "uuid_to_bin",
      "to_utf8",
      "from_base64",
      "unhex",
      "hextoraw",
      "inet6_aton",
      "aes_encrypt",
      "aes_decrypt",
      "base64_decode_binary",
      "compress",
      "decompress_binary",
      "zeroblob",
      "sys_guid",
    ].includes(name)
  )
    return "bytes";
  if (["random", "rand"].includes(name)) return "decimal";
  if (
    [
      "array_length",
      "array_size",
      "cardinality",
      "array_sum",
      "hash",
      "list_position",
      "list_unique",
      "xxhash64",
    ].includes(name)
  )
    return "integer";
  if (["array_contains", "list_contains"].includes(name)) return "boolean";
  if (name === "array_join") return "text";
  if (name === "arrayjoin") {
    const type = firstArrayArgumentType(functionArguments(genericFunction), schema, binds);
    return type ? (arrayElementType(type) ?? type) : undefined;
  }
  if (name === "flatten") {
    const type = firstArrayArgumentType(functionArguments(genericFunction), schema, binds);
    return type ? (arrayElementType(type) ?? type) : undefined;
  }
  if (name === "array_flatten") {
    const type = firstArrayArgumentType(functionArguments(genericFunction), schema, binds);
    const element = type ? arrayElementType(type) : undefined;
    return element && /^array\s*</i.test(element) ? element : type;
  }
  if (
    [
      "array_compact",
      "array_intersect",
      "array_union",
      "array_except",
      "arraycompact",
      "arrayintersect",
      "arrayexcept",
      "list_slice",
      "list_reverse",
      "list_concat",
      "list_resize",
      "list_distinct",
      "list_sort",
      "list_select",
      "array_pop_back",
      "array_pop_front",
      "array_push_back",
      "array_push_front",
    ].includes(name)
  ) {
    return firstArrayArgumentType(functionArguments(genericFunction), schema, binds);
  }
  if (name === "list_grade_up") {
    return "array<integer>";
  }
  if (name === "array_zip") {
    const fields = functionArguments(genericFunction).map((arg, index) => {
      const arrayType = inferColumn(arg, `array_zip_${index + 1}`, schema, binds, "generic").type;
      return `field_${index + 1} ${arrayElementType(arrayType) ?? "unknown"}`;
    });
    return fields.length > 0 ? `array<struct<${fields.join(", ")}>>` : "array<struct<>>";
  }
  if (["array_all", "array_any"].includes(name)) return "boolean";
  if (["array_first", "array_last", "list_extract", "array_extract"].includes(name)) {
    const type = firstArrayArgumentType(functionArguments(genericFunction), schema, binds);
    return type ? (arrayElementType(type) ?? type) : undefined;
  }
  if (["list_value", "array_value"].includes(name)) {
    const type = commonArgumentType(functionArguments(genericFunction), schema, binds) ?? "unknown";
    return `array<${type}>`;
  }
  if (name === "from_json") {
    const schema = literalString(functionArguments(genericFunction)[1]);
    const fields = schema ? structFieldsFromSchemaString(schema) : [];
    return fields.length > 0 ? `struct<${fields.join(", ")}>` : "json";
  }
  if (name === "struct_pack") {
    const fields = namedArgumentStructFields(functionArguments(genericFunction), schema, binds);
    return fields.length > 0 ? `struct<${fields.join(", ")}>` : undefined;
  }
  if (name === "array_to_string") return "text";
  if (
    [
      "array_cat",
      "array_concat",
      "array_slice",
      "array_distinct",
      "array_prepend",
      "array_append",
      "array_remove",
      "array_replace",
      "array_reverse",
      "array_sort",
      "arraycat",
      "arrayconcat",
      "arrayslice",
      "arraydistinct",
      "arrayreverse",
    ].includes(name)
  ) {
    return firstArrayArgumentType(functionArguments(genericFunction), schema, binds);
  }
  if (["current_date"].includes(name)) return "date";
  if (["current_time"].includes(name)) return "time";
  if (
    [
      "current_timestamp",
      "now",
      "localtimestamp",
      "utc_timestamp",
      "pg_postmaster_start_time",
      "timestamp_seconds",
      "timestamp_millis",
      "timestamp_micros",
      "date_parse",
    ].includes(name)
  )
    return "timestamp";
  if (name === "julianday") return "decimal";
  if (name === "unixepoch") return sqliteUnixepochType(genericFunction);
  if (name === "mz_now") return "mz_timestamp";
  if (name === "current_datetime") return "datetime";
  if (name === "timestamp") return "timestamp";
  if (name === "todatetime") return "timestamp";
  if (name === "datetime") return "datetime";
  if (name === "time") return "time";
  if (name === "age") return "interval";
  if (["to_bitmap", "hll_hash"].includes(name)) return name === "to_bitmap" ? "bitmap" : "hll";
  if (name === "varbinary_to_uint256") return "decimal";
  if (name === "scope_identity") return "integer";
  if (name === "isnumeric") return "integer";
  if (["grouping", "grouping_id", "groupingid"].includes(name)) return "integer";
  if (name === "convert" || name === "try_convert") {
    return convertFunctionResultType(genericFunction, dialect);
  }
  if (
    [
      "abs",
      "round",
      "ceil",
      "ceiling",
      "floor",
      "degrees",
      "radians",
      "truncate",
      "safe_add",
      "safe_subtract",
      "safe_multiply",
      "pmod",
      "div",
      "mod",
    ].includes(name)
  )
    return commonArgumentType(functionArguments(genericFunction), schema, binds) ?? "decimal";
  if (["safe_divide", "ieee_divide", "cbrt"].includes(name)) return "decimal";
  if (["factorial"].includes(name)) return "integer";
  if (
    [
      "to_number",
      "try_to_number",
      "to_decimal",
      "try_to_decimal",
      "try_to_decfloat",
      "zeroifnull",
      "nullifzero",
    ].includes(name)
  )
    return "decimal";
  if (/^to(?:u?int|integer|bigint|smallint)/i.test(name)) return "integer";
  if (/^to(?:float|double|decimal)/i.test(name)) return "decimal";
  if (name === "tobool") return "boolean";
  if (name === "to_boolean") return "boolean";
  if (name === "try_to_boolean") return "boolean";
  if (name === "touuid") return "uuid";
  if (name === "todate") return "date";
  if (name === "try_base64_decode_string") return "text";
  if (name === "try_base64_decode_binary") return "bytes";
  if (name === "check_xml") return "text";
  if (
    [
      "row_to_json",
      "json_query",
      "parse_json",
      "json_set",
      "json_insert",
      "json_replace",
      "json_remove",
      "json_patch",
      "json_strip_nulls",
      "json_merge_patch",
      "json_merge_preserve",
      "json_array_append",
      "json_array_insert",
    ].includes(name)
  )
    return "json";
  if (name === "json_modify") return "text";
  if (name === "json_query_array") return "array<json>";
  if (name === "json_value_array") return "array<text>";
  if (name === "get") return "variant";
  if (name === "to_regclass") return "regclass";
  if (name === "to_variant") return "variant";
  if (name === "to_object") return "object";
  if (name === "to_array") return "array<variant>";
  if (name === "as_array") return "array<variant>";
  if (name === "as_object") return "object";
  if (name === "as_varchar") return "text";
  if (name === "object_insert") return "object";
  if (["cosine_distance", "euclidean_distance", "manhattan_distance"].includes(name))
    return "decimal";
  if (name === "generate_embedding") return "vector";
  if (name === "ai_classify") return "object";
  if (["ai_agg", "ml_translate"].includes(name)) return "text";
  if (["ml_forecast", "vector_search"].includes(name)) return "variant";
  if (
    [
      "sqrt",
      "power",
      "pow",
      "exp",
      "ln",
      "log",
      "log10",
      "sin",
      "cos",
      "tan",
      "asin",
      "acos",
      "atan",
      "atan2",
      "radians",
      "degrees",
      "pi",
      "ratio_to_report",
    ].includes(name)
  )
    return "decimal";
  if (["months_between"].includes(name)) return "decimal";
  if (["sign"].includes(name)) return "integer";
  if (["coalesce", "ifnull", "isnull", "nvl", "nullif", "greatest", "least"].includes(name)) {
    return (
      bindFirstArgumentType(genericFunction, binds) ??
      commonArgumentType(functionArguments(genericFunction), schema, binds)
    );
  }
  if (name === "nvl2") {
    const args = functionArguments(genericFunction);
    return commonArgumentType(args.slice(1, 3), schema, binds);
  }
  if (name === "multiif") {
    const args = functionArguments(genericFunction);
    const branches = args.filter((_, index) => index % 2 === 1 || index === args.length - 1);
    return commonArgumentType(branches, schema, binds);
  }
  return undefined;
}

function bindFirstArgumentType(
  functionNode: Record<string, unknown>,
  binds: Binds | undefined,
): string | undefined {
  const first = functionArguments(functionNode)[0];
  return isRecord(first) ? inferBindType(first, binds) : undefined;
}

function sqliteUnixepochType(functionNode: Record<string, unknown>): "integer" | "decimal" {
  const hasSubsecondModifier = functionArguments(functionNode)
    .map(literalString)
    .some((value) => (value ? ["subsec", "subsecond"].includes(value.toLowerCase()) : false));
  return hasSubsecondModifier ? "decimal" : "integer";
}

function inferBindSensitiveFunctionType(
  expression: AstExpression,
  binds: Binds | undefined,
): string | undefined {
  const coalesce = getAst(expression, "coalesce") ?? getAst(expression, "nullif");
  if (isRecord(coalesce)) return bindFirstArgumentType(coalesce, binds);
  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? "").toLowerCase();
  return ["coalesce", "ifnull", "nvl", "nullif", "greatest", "least"].includes(name)
    ? bindFirstArgumentType(fn, binds)
    : undefined;
}

function inferMapFunctionType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
): string | undefined {
  const mapFromArrays = getAst(expression, "map_from_arrays");
  if (isRecord(mapFromArrays)) {
    const keyArray = isRecord(mapFromArrays.this)
      ? inferColumn(mapFromArrays.this, "map_keys", schema, binds, "generic").type
      : undefined;
    const valueArray = isRecord(mapFromArrays.expression)
      ? inferColumn(mapFromArrays.expression, "map_values", schema, binds, "generic").type
      : undefined;
    const keyType = keyArray ? arrayElementType(keyArray) : undefined;
    const valueType = valueArray ? arrayElementType(valueArray) : undefined;
    return keyType && valueType ? `map<${keyType}, ${valueType}>` : undefined;
  }

  const keys = getAst(expression, "map_keys");
  if (isRecord(keys)) {
    const types = mapArgumentTypes(keys.this, schema, binds);
    return types ? `array<${types[0]}>` : undefined;
  }
  const values = getAst(expression, "map_values");
  if (isRecord(values)) {
    const types = mapArgumentTypes(values.this, schema, binds);
    return types ? `array<${types[1]}>` : undefined;
  }
  const element = getAst(expression, "element_at");
  if (isRecord(element)) {
    const types = mapArgumentTypes(element.this, schema, binds);
    if (types) return types[1];
    const arrayType = isRecord(element.this)
      ? inferColumn(element.this, "element_at", schema, binds, "generic").type
      : undefined;
    return arrayType ? arrayElementType(arrayType) : undefined;
  }
  const subscript = getAst(expression, "subscript");
  if (isRecord(subscript)) {
    const types = mapArgumentTypes(subscript.this, schema, binds);
    if (types) return types[1];
  }
  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? "").toLowerCase();
  if (["map_keys", "mapkeys"].includes(name)) {
    const types = mapArgumentTypes(functionArguments(fn)[0], schema, binds);
    return types ? `array<${types[0]}>` : undefined;
  }
  if (["map_values", "mapvalues"].includes(name)) {
    const types = mapArgumentTypes(functionArguments(fn)[0], schema, binds);
    return types ? `array<${types[1]}>` : undefined;
  }
  if (["element_at", "map_extract"].includes(name)) {
    const first = functionArguments(fn)[0];
    const types = mapArgumentTypes(first, schema, binds);
    if (types) return types[1];
    if (isRecord(first)) {
      const arrayType = inferColumn(first, "element_at", schema, binds, "generic").type;
      return arrayElementType(arrayType);
    }
  }
  if (name === "map_contains" || name === "mapcontains") {
    return "boolean";
  }
  if (name === "map_entries") {
    const types = mapArgumentTypes(functionArguments(fn)[0], schema, binds);
    return types ? `array<struct<key ${types[0]}, value ${types[1]}>>` : undefined;
  }
  if (
    [
      "map_concat",
      "map_cat",
      "map_delete",
      "map_insert",
      "map_pick",
      "map_filter",
      "transform_values",
    ].includes(name)
  ) {
    return functionArguments(fn)
      .map((arg) => inferColumn(arg, "map_func_arg", schema, binds, "generic").type)
      .find((type) => /^map\s*</i.test(type));
  }
  if (name === "map_from_arrays") {
    const args = functionArguments(fn);
    const keyArray = args[0]
      ? inferColumn(args[0], "map_keys", schema, binds, "generic").type
      : undefined;
    const valueArray = args[1]
      ? inferColumn(args[1], "map_values", schema, binds, "generic").type
      : undefined;
    const keyType = keyArray ? arrayElementType(keyArray) : undefined;
    const valueType = valueArray ? arrayElementType(valueArray) : undefined;
    return keyType && valueType ? `map<${keyType}, ${valueType}>` : undefined;
  }
  return undefined;
}

function mapArgumentTypes(
  expression: unknown,
  schema: ValidationSchema,
  binds: Binds | undefined,
): [string, string] | undefined {
  if (!isRecord(expression)) return undefined;
  const type = inferColumn(expression, "map_arg", schema, binds, "generic").type;
  return type === "unknown" ? undefined : mapKeyValueTypes(type);
}

function firstArrayArgumentType(
  args: AstExpression[],
  schema: ValidationSchema,
  binds: Binds | undefined,
): string | undefined {
  return args
    .map((arg) => inferColumn(arg, "array_arg", schema, binds, "generic").type)
    .find((type) => arrayElementType(type) || /^array\s*</i.test(type));
}

function functionArguments(functionNode: Record<string, unknown>): AstExpression[] {
  return [
    ...(isRecord(functionNode.this) ? [functionNode.this] : []),
    ...(Array.isArray(functionNode.args) ? functionNode.args.filter(isRecord) : []),
    ...(Array.isArray(functionNode.expressions) ? functionNode.expressions.filter(isRecord) : []),
  ];
}

function commonArgumentType(
  args: AstExpression[],
  schema: ValidationSchema,
  binds: Binds | undefined,
  dialect = "generic",
): string | undefined {
  const types = args
    .map(
      (arg, index) =>
        inferCastType(arg, dialect) ??
        inferColumn(arg, `arg_${index + 1}`, schema, binds, dialect).type,
    )
    .filter((type) => type !== "unknown");
  const nonNullTypes = types.filter((type) => type !== "null");
  if (types.length !== nonNullTypes.length && nonNullTypes.length === 1) {
    return adjustCastResultType(nonNullTypes[0], dialect);
  }
  const dialectCommon = commonTypeFromTypesForDialect(nonNullTypes, dialect);
  if (dialectCommon) return dialectCommon;
  return commonTypeFromTypes(types);
}

function commonTypeFromTypesForDialect(types: string[], dialect: string): string | undefined {
  if (types.length < 2) return undefined;
  const policy = getDialectConfig(dialect).commonTypes;
  if (types.some((type) => isTextLikeType(type))) {
    const textTypes = types.filter(isTextLikeType);
    const maxLength = maxTypeLength(textTypes);
    if (policy.text === "mysqlMaxVarchar" && maxLength) return `varchar(${maxLength})`;
    if (policy.text === "firstText" && textTypes[0]) return textTypes[0];
    if (policy.text === "varchar") return "varchar";
  }
  const decimal = types.map(decimalTypeParts).find(Boolean);
  if (decimal && types.some(isIntegerLikeType)) {
    if (policy.decimalInteger === "mysqlScalePlus20")
      return `decimal(${20 + decimal.scale},${decimal.scale})`;
    if (policy.decimalInteger === "tsqlScalePlus10")
      return `decimal(${10 + decimal.scale},${decimal.scale})`;
    if (policy.decimalInteger === "decimal") return "decimal";
    if (policy.decimalInteger === "firstType") return types[0] ?? "number";
  }
  return undefined;
}

function isTextLikeType(type: string): boolean {
  return /^(?:n?char|n?varchar|varchar2|nvarchar2|text|string)(?:\(|$)/i.test(type);
}

function maxTypeLength(types: string[]): number | undefined {
  const lengths = types
    .map((type) => /^(?:n?char|n?varchar|varchar2|nvarchar2)\((\d+)\)$/i.exec(type)?.[1])
    .filter((value): value is string => Boolean(value))
    .map(Number);
  return lengths.length > 0 ? Math.max(...lengths) : undefined;
}

function commonTypeFromTypes(types: string[]): string | undefined {
  if (types.length === 0) return undefined;
  if (types.some((type) => /text|char|string|varchar/i.test(type))) return "text";
  if (types.some((type) => /timestamp|datetime/i.test(type))) return "timestamp";
  if (types.some((type) => /^date$/i.test(type))) return "date";
  if (types.some((type) => /decimal|numeric|real|double|float/i.test(type))) return "decimal";
  if (types.some((type) => /int|number|bigint|smallint/i.test(type))) return "integer";
  if (types.some((type) => /bool/i.test(type))) return "boolean";
  return types[0];
}

function inferWindowFunctionType(
  expression: AstExpression,
  schema: ValidationSchema,
  binds: Binds | undefined,
  dialect = "generic",
): string | undefined {
  const windowFunction = getAst(expression, "window_function");
  if (!isRecord(windowFunction) || !isRecord(windowFunction.this)) return undefined;
  const inner = windowFunction.this;
  if (
    isAst(inner, "row_number") ||
    isAst(inner, "rank") ||
    isAst(inner, "dense_rank") ||
    isAst(inner, "ntile") ||
    isAst(inner, "n_tile")
  ) {
    const name = Object.keys(getDialectConfig(dialect).windowFunctionTypes).find((key) =>
      isAst(inner, key),
    );
    return name ? getDialectConfig(dialect).windowFunctionTypes[name] : "integer";
  }
  if (isAst(inner, "percent_rank") || isAst(inner, "cume_dist")) {
    const name = Object.keys(getDialectConfig(dialect).windowFunctionTypes).find((key) =>
      isAst(inner, key),
    );
    return name ? getDialectConfig(dialect).windowFunctionTypes[name] : "decimal";
  }
  const valueFunction =
    getAst(inner, "lag") ??
    getAst(inner, "lead") ??
    getAst(inner, "first_value") ??
    getAst(inner, "last_value") ??
    getAst(inner, "nth_value");
  if (isRecord(valueFunction) && isRecord(valueFunction.this)) {
    return inferColumn(valueFunction.this, "window_value", schema, binds, "generic").type;
  }
  const genericFunction = getAst(inner, "function");
  if (isRecord(genericFunction)) {
    const name = String(genericFunction.name ?? "").toLowerCase();
    if (["laginframe", "leadinframe"].includes(name)) {
      const firstArg = functionArguments(genericFunction)[0];
      return firstArg
        ? inferColumn(firstArg, "window_value", schema, binds, "generic").type
        : undefined;
    }
  }
  return inferExpressionType(inner, schema, binds);
}

function adjustAnnotatedTypeForExpression(
  type: string | undefined,
  expression: AstExpression,
  dialect: string,
): string | undefined {
  if (!type) return undefined;
  const arithmeticType = adjustArithmeticResultType(type, expression, dialect);
  if (arithmeticType) return arithmeticType;
  const cast =
    getAst(expression, "cast") ?? getAst(expression, "try_cast") ?? getAst(expression, "safe_cast");
  const coalesce = getAst(expression, "coalesce") ?? getAst(expression, "nullif");
  const fn = getAst(expression, "function");
  const isCoalesceFunction =
    isRecord(fn) &&
    ["coalesce", "ifnull", "nvl", "nullif"].includes(String(fn.name ?? "").toLowerCase());
  if (!isRecord(cast) && !isRecord(coalesce) && !isCoalesceFunction) return type;
  return adjustCastResultType(type, dialect);
}

function inferCastType(expression: AstExpression, dialect: string): string | undefined {
  const cast =
    getAst(expression, "cast") ?? getAst(expression, "try_cast") ?? getAst(expression, "safe_cast");
  const type = isRecord(cast) ? dataTypeToString(cast.to) : undefined;
  return adjustCastResultType(type, dialect);
}

function adjustCastResultType(type: string | undefined, dialect: string): string | undefined {
  if (!type || getDialectConfig(dialect).cast.adjustment !== "mysqlCharBinaryLength") return type;
  const match = /^(char|character|binary)\((\d+)\)$/i.exec(type);
  if (!match) return type;
  return match[1]?.toLowerCase() === "binary" ? `varbinary(${match[2]})` : `varchar(${match[2]})`;
}

function adjustArithmeticResultType(
  type: string,
  expression: AstExpression,
  dialect: string,
): string | undefined {
  const arithmetic = getAst(expression, "add") ?? getAst(expression, "sub");
  if (!isRecord(arithmetic)) return undefined;
  const parts = [arithmetic.left, arithmetic.right, arithmetic.this, arithmetic.expression].filter(
    isRecord,
  );
  const types = parts
    .map((part) => inferCastType(part, dialect) ?? inferLiteralType(part))
    .filter((partType): partType is string => Boolean(partType));
  const decimal = types.map(decimalTypeParts).find(Boolean);
  const policy = getDialectConfig(dialect).arithmetic;
  if (
    policy.allNumberType &&
    types.length > 0 &&
    types.every((partType) => /^(?:number|decimal|numeric)(?:\(\d+,\d+\))?$/i.test(partType))
  )
    return policy.allNumberType;
  if (!decimal || !types.some((partType) => isIntegerLikeType(partType))) return undefined;
  if (policy.decimalInteger === "mysqlScalePlus21")
    return `decimal(${21 + decimal.scale},${decimal.scale})`;
  if (policy.decimalInteger === "tsqlDuckdbPrecision")
    return `decimal(${Math.max(10, decimal.precision - decimal.scale) + decimal.scale + 1},${decimal.scale})`;
  if (policy.decimalInteger === "decimal") return "decimal";
  return type;
}

function decimalTypeParts(type: string): { precision: number; scale: number } | undefined {
  const match = /^(?:decimal|numeric|number)\((\d+),(\d+)\)$/i.exec(type);
  if (!match) return undefined;
  return { precision: Number(match[1]), scale: Number(match[2]) };
}

function isIntegerLikeType(type: string): boolean {
  return /^(?:integer|int|signed|bigint|smallint|tinyint|number\(\d+,0\))$/i.test(type);
}

function inferLiteralType(expression: AstExpression, dialect = "generic"): string | undefined {
  const literal = getAst(expression, "literal");
  if (isRecord(literal)) {
    const literalType = String(literal.literal_type ?? "");
    const value = String(literal.value ?? "");
    if (literalType === "string")
      return getDialectConfig(dialect).literalTypes.string === "varcharLength"
        ? `varchar(${value.length})`
        : "text";
    if (literalType === "boolean") return "boolean";
    if (literalType === "number") return value.includes(".") ? "decimal" : "integer";
    if (literalType === "date") return "date";
    if (literalType === "time") return "time";
    if (literalType === "timestamp") return "timestamp";
    if (literalType === "interval") return "interval";
    if (literalType === "null") return "null";
  }
  if (isAst(expression, "null")) return "null";
  return undefined;
}

function inferBindType(expression: AstExpression, binds: Binds | undefined): string | undefined {
  if (!binds) return undefined;
  const placeholder = getAst(expression, "placeholder") ?? getAst(expression, "parameter");
  if (!isRecord(placeholder)) return undefined;
  if (Array.isArray(binds)) {
    const index = typeof placeholder.index === "number" ? placeholder.index : 1;
    const type = positionalBindType(binds, index);
    return type ? normalizeDataTypeName(type) : undefined;
  }
  const name = typeof placeholder.name === "string" ? placeholder.name : undefined;
  const type = name ? namedBindType(binds, name) : undefined;
  return type ? normalizeDataTypeName(type) : undefined;
}

function findSchemaColumn(
  expression: AstExpression,
  schema: ValidationSchema,
  tableAliases?: TableAliasMap,
): { table: SchemaTable; column: SchemaColumn; nullable?: boolean } | undefined {
  const dotColumn = dotAsColumnRef(expression);
  const columnRef = dotColumn ?? getAst(expression, "column");
  if (!isRecord(columnRef)) return undefined;
  const columnName = identifierName(columnRef.name)?.toLowerCase();
  const tableQualifier = identifierName(columnRef.table)?.toLowerCase();
  const relation = tableQualifier ? tableAliases?.get(tableQualifier) : undefined;
  const tableName = tableQualifier
    ? (relation?.tableName.toLowerCase() ?? tableQualifier)
    : undefined;
  const tableSchema = relation?.schemaName?.toLowerCase();
  if (!columnName) return undefined;
  const scopedTableNames = tableName
    ? []
    : [...new Set([...(tableAliases?.values() ?? [])].map((relation) => relation.tableName))].map(
        (name) => name.toLowerCase(),
      );
  const scopedSchemas = tableName
    ? []
    : [
        ...new Set(
          [...(tableAliases?.values() ?? [])]
            .map((relation) => relation.schemaName)
            .filter((name): name is string => Boolean(name)),
        ),
      ].map((name) => name.toLowerCase());

  for (const table of schema.tables) {
    if (tableName && table.name.toLowerCase() !== tableName) continue;
    if (tableSchema && table.schema?.toLowerCase() !== tableSchema) continue;
    if (tableName && !tableSchema && table.schema) continue;
    if (
      !tableName &&
      scopedTableNames.length > 0 &&
      !scopedTableNames.includes(table.name.toLowerCase())
    )
      continue;
    if (!tableName && scopedTableNames.length > 0 && table.schema && scopedSchemas.length === 0)
      continue;
    if (
      !tableName &&
      scopedSchemas.length > 0 &&
      table.schema &&
      !scopedSchemas.includes(table.schema.toLowerCase())
    )
      continue;
    const visibleIndex =
      relation?.visibleColumnNames.findIndex((name) => name.toLowerCase() === columnName) ?? -1;
    const resolvedColumnName =
      visibleIndex >= 0 ? table.columns[visibleIndex]?.name.toLowerCase() : columnName;
    const column = table.columns.find(
      (candidate) => candidate.name.toLowerCase() === resolvedColumnName,
    );
    if (column) return { table, column, nullable: relation?.nullable ? true : column.nullable };
  }
  return undefined;
}

function dotAsColumnRef(expression: AstExpression): Record<string, unknown> | undefined {
  const dot = getAst(expression, "dot");
  if (!isRecord(dot)) return undefined;
  const leftColumn = isRecord(dot.this) ? getAst(dot.this, "column") : undefined;
  const fieldName = identifierName(dot.field);
  if (!isRecord(leftColumn) || !fieldName) return undefined;
  const schemaName = identifierName(leftColumn.table);
  const tableName = identifierName(leftColumn.name);
  if (!schemaName || !tableName) return undefined;
  return {
    name: { name: fieldName },
    table: { name: `${schemaName}.${tableName}` },
  };
}

function inferNestedColumn(
  expression: AstExpression,
  schema: ValidationSchema,
  tableAliases?: TableAliasMap,
): { type: string; nullable?: boolean; source: string } | undefined {
  const jsonScalar = inferJsonScalarNestedColumn(expression, schema, tableAliases);
  if (jsonScalar) return jsonScalar;

  const path = nestedAccessPath(expression, schema, tableAliases);
  if (!path) return undefined;
  const type = typeAtPath(path.base.column.type, path.steps);
  if (!type) return undefined;
  return {
    type,
    nullable: path.base.column.nullable,
    source: [
      path.base.source,
      ...path.steps.filter((step) => step.kind === "field").map((step) => step.name),
    ].join("."),
  };
}

function inferJsonScalarNestedColumn(
  expression: AstExpression,
  schema: ValidationSchema,
  tableAliases?: TableAliasMap,
): { type: string; nullable?: boolean; source: string } | undefined {
  const jsonScalar = getAst(expression, "json_extract_scalar");
  if (!isRecord(jsonScalar)) return undefined;
  const base = nestedBaseColumn(jsonScalar.this, schema, tableAliases);
  const path = literalString(jsonScalar.path);
  return {
    type: "text",
    nullable: base?.column.nullable,
    source: base && path ? `${base.source}.${path}` : (base?.source ?? "json"),
  };
}

function nestedAccessPath(
  expression: unknown,
  schema: ValidationSchema,
  tableAliases?: TableAliasMap,
): { base: NestedBaseColumn; steps: NestedPathStep[] } | undefined {
  const dot = getAst(expression, "dot");
  if (isRecord(dot)) {
    const parent = nestedAccessPath(dot.this, schema, tableAliases);
    const field = identifierName(dot.field);
    if (parent && field)
      return { base: parent.base, steps: [...parent.steps, { kind: "field", name: field }] };
    return undefined;
  }

  const subscript = getAst(expression, "subscript");
  if (isRecord(subscript)) {
    const parent = nestedAccessPath(subscript.this, schema, tableAliases);
    const field = literalString(subscript.index);
    if (parent && field && !isNumericString(field))
      return { base: parent.base, steps: [...parent.steps, { kind: "field", name: field }] };
    if (parent) return { base: parent.base, steps: [...parent.steps, { kind: "element" }] };
    return undefined;
  }

  const base = nestedBaseColumn(expression, schema, tableAliases);
  if (base) return { base, steps: [] };

  const column = getAst(expression, "column");
  if (isRecord(column)) {
    const qualifier = identifierName(column.table);
    const field = identifierName(column.name);
    if (qualifier && field) {
      const structBase = resolveVisibleColumn(qualifier, schema, tableAliases);
      if (structBase && fieldType(structBase.column.type, field)) {
        return { base: structBase, steps: [{ kind: "field", name: field }] };
      }
    }
  }

  return undefined;
}

function nestedBaseColumn(
  expression: unknown,
  schema: ValidationSchema,
  tableAliases?: TableAliasMap,
): NestedBaseColumn | undefined {
  const column = getAst(expression, "column");
  if (!isRecord(column)) return undefined;
  const columnName = identifierName(column.name);
  const tableName = identifierName(column.table);
  if (!columnName) return undefined;
  return resolveVisibleColumn(columnName, schema, tableAliases, tableName);
}

function resolveVisibleColumn(
  columnName: string,
  schema: ValidationSchema,
  tableAliases?: TableAliasMap,
  tableQualifier?: string,
): NestedBaseColumn | undefined {
  const expression = tableQualifier
    ? { column: { name: { name: columnName }, table: { name: tableQualifier } } }
    : { column: { name: { name: columnName } } };
  const resolved = findSchemaColumn(expression, schema, tableAliases);
  if (!resolved) return undefined;
  return {
    table: resolved.table,
    column: resolved.column,
    source: schemaColumnSource(resolved.table, resolved.column.name),
  };
}

function typeAtPath(type: string, steps: NestedPathStep[]): string | undefined {
  return steps.reduce<string | undefined>((current, step) => {
    if (!current) return undefined;
    if (step.kind === "element") return arrayElementType(current) ?? mapKeyValueTypes(current)?.[1];
    if (/^(?:json|jsonb)$/i.test(current)) return current.toLowerCase();
    if (/^(?:variant|object)$/i.test(current)) return current.toLowerCase();
    return fieldType(current, step.name);
  }, type);
}

function fieldType(type: string, fieldName: string): string | undefined {
  const fields = structFields(type);
  return fields.find((field) => field.name.toLowerCase() === fieldName.toLowerCase())?.type;
}

function arrayElementType(type: string): string | undefined {
  const trimmed = type.trim();
  const arrayMatch = /^array\s*<([\s\S]+)>$/i.exec(trimmed);
  if (arrayMatch) return arrayMatch[1].trim();
  const suffixMatch = /^(.+)\[\]$/.exec(trimmed);
  if (suffixMatch) return suffixMatch[1].trim();
  return undefined;
}

function mapKeyValueTypes(type: string): [string, string] | undefined {
  const match = /^map\s*<([\s\S]+)>$/i.exec(type.trim());
  if (!match) return undefined;
  const parts = splitTopLevel(match[1], ",").map((part) => part.trim());
  return parts.length >= 2 && parts[0] && parts[1] ? [parts[0], parts[1]] : undefined;
}

function structFields(type: string): Array<{ name: string; type: string }> {
  const match = /^(?:struct|record|row)\s*<([\s\S]+)>$/i.exec(type.trim());
  if (!match) return [];
  return splitTopLevel(match[1], ",").flatMap((part) => {
    const trimmed = part.trim();
    const colon = splitField(trimmed, ":");
    const space = colon ?? splitField(trimmed, " ");
    if (!space) return [];
    return [{ name: cleanIdentifier(space[0]), type: space[1].trim() }];
  });
}

function splitField(input: string, separator: ":" | " "): [string, string] | undefined {
  let depth = 0;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === "<" || char === "(") depth += 1;
    if (char === ">" || char === ")") depth -= 1;
    if (depth === 0 && (separator === ":" ? char === ":" : /\s/.test(char))) {
      const left = input.slice(0, index).trim();
      const right = input.slice(index + 1).trim();
      if (left && right) return [left, right];
    }
  }
  return undefined;
}

function literalString(expression: unknown): string | undefined {
  const literal = getAst(expression, "literal");
  if (!isRecord(literal)) return undefined;
  return typeof literal.value === "string" ? literal.value : undefined;
}

function numericLiteralValue(expression: unknown): number | undefined {
  const literal = getAst(expression, "literal");
  if (!isRecord(literal) || literal.literal_type !== "number") return undefined;
  const value = Number(literal.value);
  return Number.isFinite(value) ? value : undefined;
}

function convertFunctionResultType(
  functionNode: Record<string, unknown>,
  dialect: string,
): string | undefined {
  const args = functionArguments(functionNode);
  if (args.length === 0) return undefined;
  if (isDialectFamily(dialect, "mysql")) {
    return convertTypeFromAst(args[1]) ?? convertTypeFromAst(args[0]);
  }
  return convertTypeFromAst(args[0]) ?? convertTypeFromAst(args[1]);
}

function convertTypeFromAst(node: unknown): string | undefined {
  if (!isRecord(node)) return undefined;
  const directType = dataTypeToString(node.data_type ?? node);
  if (directType) return directType;

  const fn = getAst(node, "function");
  if (isRecord(fn)) {
    const name = String(fn.name ?? "").toLowerCase();
    const fnArgs = functionArguments(fn);
    if (["decimal", "dec", "numeric", "number"].includes(name)) {
      const precision = numericLiteralValue(fnArgs[0]);
      const scale = numericLiteralValue(fnArgs[1]);
      if (precision !== undefined) {
        return scale !== undefined ? `decimal(${precision},${scale})` : `decimal(${precision})`;
      }
      return "decimal";
    }
    if (["char", "varchar", "binary", "varbinary", "nchar", "nvarchar"].includes(name)) {
      const length = numericLiteralValue(fnArgs[0]);
      return length !== undefined ? `${name}(${length})` : name;
    }
    return name;
  }

  const literal = getAst(node, "literal");
  if (isRecord(literal) && literal.literal_type === "string") {
    return String(literal.value ?? "").toLowerCase();
  }
  return undefined;
}

function isNumericString(value: string): boolean {
  return /^\d+$/.test(value);
}

function inferNamedBindFromColumn(
  expression: AstExpression,
  binds: Binds | undefined,
): string | undefined {
  if (!binds) return undefined;
  const column = getAst(expression, "column");
  if (!isRecord(column)) return undefined;
  const rawName = identifierName(column.name);
  if (Array.isArray(binds)) {
    const index = rawName?.match(/^\$(\d+)$/)?.[1] ?? rawName?.match(/^@P(\d+)$/i)?.[1];
    const type = index ? positionalBindType(binds, Number(index)) : undefined;
    return type ? normalizeDataTypeName(type) : undefined;
  }
  const name = rawName?.match(/^[@$]([A-Za-z_]\w*)$/)?.[1];
  const type = name ? namedBindType(binds, name) : undefined;
  return type ? normalizeDataTypeName(type) : undefined;
}

function extractOutputItems(
  parsedAst: unknown,
  schema: ValidationSchema,
  dialect = "generic",
): OutputItem[] {
  return extractResultSets(parsedAst, schema, dialect).flat();
}

function extractResultSets(
  parsedAst: unknown,
  schema: ValidationSchema,
  dialect = "generic",
): OutputItem[][] {
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  const context = statementContextFromSchema(schema);
  let currentSchema = schema;
  return statements.map((statement) => {
    const items = outputItemsForStatement(statement, currentSchema, context, dialect);
    rememberPreparedStatement(statement, context);
    rememberFunctionDefinition(statement, context);
    rememberRawScalarMacroDefinition(statement, currentSchema, context, dialect);
    rememberProcedureDefinition(statement, currentSchema, context, dialect);
    rememberTypeDefinition(statement, context);
    forgetPreparedStatement(statement, context);
    forgetRoutineDefinition(statement, context);
    currentSchema = schemaAfterStatement(statement, currentSchema, context);
    return items;
  });
}

function summarizeStatements(
  parsedAst: unknown,
  resultSets: Array<{ index: number; columns: DescribeColumn[] }>,
  dialect: string,
): StatementSummary[] {
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  return statements.map((statement, index) => {
    const resultSet = resultSets.find((candidate) => candidate.index === index + 1);
    const kind = statementKind(statement);
    if (resultSet && resultSet.columns.length > 0) {
      return { index: index + 1, kind, resultKind: "static" };
    }
    const resultKind = resultKindForStatement(statement, dialect);
    return {
      index: index + 1,
      kind,
      resultKind,
      message: messageForResultKind(kind, resultKind),
    };
  });
}

function diagnosticsForStatements(
  statements: StatementSummary[],
  includeNoResultStatements: boolean,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const summaries = includeNoResultStatements
    ? statements.filter((statement) => statement.resultKind !== "static")
    : statements.filter((statement) => !["static", "none"].includes(statement.resultKind));

  for (const summary of summaries) {
    const message = summary.message ?? messageForResultKind(summary.kind, summary.resultKind);
    diagnostics.push({
      code: diagnosticCodeForResultKind(summary.resultKind),
      message,
      severity: summary.resultKind === "none" ? "info" : "warning",
    });
  }

  if (diagnostics.length === 0 && includeNoResultStatements) {
    diagnostics.push({
      code: "SQLDESC_UNKNOWN_RESULT_SHAPE",
      message: "SQL parsed successfully but does not expose result-set columns.",
      severity: "warning",
    });
  }

  return diagnostics;
}

function statementKind(statement: unknown): string {
  if (!isRecord(statement)) return "unknown";
  return Object.keys(statement)[0] ?? "unknown";
}

function resultKindForStatement(statement: unknown, dialect: string): StatementResultKind {
  if (!isRecord(statement)) return "unknown";
  if (isNoResultExpressionCommand(statement)) return "none";
  if (isRuntimeExpressionCommand(statement)) return "runtime";
  if (isRecord(statement.show) || isDescribeMetadataStatement(statement)) return "metadata";
  if (isRecord(statement.pragma)) return "metadata";
  if (isRecord(statement.summarize)) return "metadata";
  if (isRecord(statement.copy) && isNoResultCopy(statement.copy)) return "none";
  if (isNoResultCommandStatement(statement)) return "none";
  if (isStaticCommandStatement(statement, dialect)) return "static";
  if (isStaticExecuteStatement(statement, dialect)) return "static";
  if (isRecord(statement.execute) || isRecord(statement.copy)) return "runtime";
  if (isRuntimeCommandStatement(statement)) return "runtime";
  if (
    isRecord(statement.select) ||
    isRecord(statement.values) ||
    isRecord(statement.union) ||
    isRecord(statement.intersect) ||
    isRecord(statement.except) ||
    isRecord(statement.pivot) ||
    isRecord(statement.put) ||
    isWatchExpressionStatement(statement)
  )
    return "unknown";
  if (isNoResultStatement(statement)) return "none";
  return "none";
}

function isRuntimeCommandStatement(statement: Record<string, unknown>): boolean {
  if (!isRecord(statement.command)) return false;
  const command = String(statement.command.this ?? "").toLowerCase();
  return /^(call|execute|exec|copy)\b/.test(command);
}

function isStaticCommandStatement(statement: Record<string, unknown>, dialect: string): boolean {
  if (!isRecord(statement.command)) return false;
  const command = String(statement.command.this ?? "").toLowerCase();
  return isStaticCommandText(command, dialect);
}

function isStaticCommandText(command: string, dialect: string): boolean {
  if (staticProcedureColumns(commandProcedureName(command), dialect).length > 0) return true;
  return (
    /^begin\s+select\b/.test(command) ||
    /^(?:optimize|repair|check|checksum)\s+table\b/.test(command) ||
    /^(?:list|ls)\s+@/.test(command) ||
    /^get\s+@/.test(command) ||
    /^(?:remove|rm)\s+@/.test(command) ||
    /^exists\s+(?:table|database|view|dictionary)\b/.test(command) ||
    /^explain\b/.test(command) ||
    /^show\s+(?:clusters|users|roles|grants|settings|dictionaries|functions|databases|schemas|tables|views|materialized\s+views|columns|indexes|variables|catalogs|current\s+namespace|engines|table|create\s+(?:table|database|dictionary|view)|processlist)\b/.test(
      command,
    ) ||
    /^list\s+(?:file|jar|archive)\b/.test(command) ||
    /^(?:describe|desc)\s+table\b/.test(command) ||
    /^help\s+(?:table|database|column)\b/.test(command)
  );
}

function isStaticExecuteStatement(statement: Record<string, unknown>, dialect: string): boolean {
  return isRecord(statement.execute) && staticExecuteColumns(statement.execute, dialect).length > 0;
}

function isNoResultCommandStatement(statement: Record<string, unknown>): boolean {
  if (!isRecord(statement.command)) return false;
  const command = String(statement.command.this ?? "").toLowerCase();
  return /^(lock|vacuum|msck|repair|refresh|discard|cluster|reindex|reset)\b/.test(command);
}

function isNoResultStatement(statement: Record<string, unknown>): boolean {
  return [
    "insert",
    "update",
    "delete",
    "merge",
    "create_table",
    "create_view",
    "drop_table",
    "undrop",
    "drop_view",
    "alter_table",
    "alter_view",
    "create_type",
    "drop_type",
    "drop_namespace",
    "create_synonym",
    "create_index",
    "drop_index",
    "alter_index",
    "create_schema",
    "drop_schema",
    "create_database",
    "drop_database",
    "create_sequence",
    "drop_sequence",
    "alter_sequence",
    "create_function",
    "create_procedure",
    "create_trigger",
    "create_task",
    "drop_function",
    "drop_procedure",
    "drop_trigger",
    "comment",
    "grant",
    "revoke",
    "raw",
    "prepare",
    "transaction",
    "commit",
    "rollback",
    "use",
    "set_statement",
    "analyze",
    "refresh",
    "truncate",
    "truncate_table",
    "locking_statement",
    "command",
    "kill",
    "declare",
    "declare_item",
    "attach",
    "detach",
    "install",
    "cache",
    "uncache",
    "load_data",
    "clone",
    "sequence_properties",
    "query_band",
  ].some((key) => isRecord(statement[key]));
}

function isNoResultCopy(copy: Record<string, unknown>): boolean {
  return copy.kind === true && copy.is_into !== true;
}

function isNoResultExpressionCommand(statement: Record<string, unknown>): boolean {
  const fn = isRecord(statement.function)
    ? String(statement.function.name ?? "").toLowerCase()
    : undefined;
  if (fn && ["raiserror"].includes(fn)) return true;
  if (isDfsExpressionCommand(statement)) return true;
  const keyword = topLevelExpressionKeyword(statement);
  return keyword
    ? [
        "checkpoint",
        "listen",
        "notify",
        "unlisten",
        "savepoint",
        "reindex",
        "cluster",
        "flush",
      ].includes(keyword)
    : false;
}

function isRuntimeExpressionCommand(statement: Record<string, unknown>): boolean {
  return topLevelExpressionKeyword(statement) === "dbcc";
}

function isDfsExpressionCommand(statement: Record<string, unknown>): boolean {
  const sub = isRecord(statement.sub) ? statement.sub : undefined;
  const leftColumn = sub && isRecord(sub.left) ? getAst(sub.left, "column") : undefined;
  return isRecord(leftColumn) && identifierName(leftColumn.name)?.toLowerCase() === "dfs";
}

function topLevelExpressionKeyword(statement: Record<string, unknown>): string | undefined {
  const column = isRecord(statement.column) ? statement.column : undefined;
  const alias = isRecord(statement.alias) ? statement.alias : undefined;
  const aliasColumn =
    alias && isRecord(alias.this) && isRecord(alias.this.column) ? alias.this.column : undefined;
  return identifierName(column?.name ?? aliasColumn?.name)?.toLowerCase();
}

function isWatchExpressionStatement(statement: Record<string, unknown>): boolean {
  const alias = isRecord(statement.alias) ? statement.alias : undefined;
  if (!alias || !isRecord(alias.this) || !isRecord(alias.this.column)) return false;
  return (
    identifierName(alias.this.column.name)?.toLowerCase() === "watch" &&
    Boolean(identifierName(alias.alias))
  );
}

function isTopLevelExpressionStatement(statement: Record<string, unknown>): boolean {
  const statementKeys = [
    "select",
    "values",
    "union",
    "intersect",
    "except",
    "pivot",
    "show",
    "summarize",
    "pragma",
    "copy",
    "execute",
    "export",
    "prepare",
    "command",
    "describe",
    "insert",
    "update",
    "delete",
    "merge",
    "create_table",
    "create_view",
    "alter_table",
    "alter_view",
    "drop_table",
    "drop_view",
    "drop_index",
    "drop_schema",
    "drop_database",
    "drop_sequence",
    "drop_type",
    "drop_namespace",
    "drop_function",
    "drop_procedure",
    "drop_trigger",
    "raw",
    "analyze",
    "attach",
    "cache",
    "comment",
    "commit",
    "create_database",
    "create_function",
    "create_index",
    "create_procedure",
    "create_schema",
    "create_sequence",
    "create_synonym",
    "create_task",
    "create_trigger",
    "create_type",
    "declare",
    "detach",
    "install",
    "grant",
    "refresh",
    "revoke",
    "rollback",
    "set_statement",
    "transaction",
    "truncate",
    "uncache",
    "use",
  ];
  if (statementKeys.some((key) => statementHasKey(statement, key))) return false;
  return [
    "alias",
    "array_func",
    "boolean",
    "case",
    "column",
    "coalesce",
    "add",
    "between",
    "bitwise_and",
    "bitwise_left_shift",
    "bitwise_or",
    "bitwise_right_shift",
    "bitwise_xor",
    "cast",
    "concat",
    "sub",
    "mul",
    "div",
    "eq",
    "exists",
    "extract",
    "function",
    "gt",
    "gte",
    "if_func",
    "i_like",
    "in",
    "is",
    "is_null",
    "is_not_null",
    "like",
    "literal",
    "lt",
    "lte",
    "mod",
    "neg",
    "not",
    "null_safe_eq",
    "null_safe_neq",
    "null",
    "paren",
    "power",
    "try_cast",
    "safe_cast",
    "similar_to",
    "subquery",
  ].some((key) => statementHasKey(statement, key));
}

function statementHasKey(statement: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(statement, key);
}

function isDescribeMetadataStatement(statement: Record<string, unknown>): boolean {
  if (!isRecord(statement.describe)) return false;
  return true;
}

function messageForResultKind(kind: string, resultKind: StatementResultKind): string {
  if (resultKind === "metadata") {
    return `${kind.toUpperCase()} parses successfully, but its result-set shape is dialect-specific metadata and cannot be inferred statically.`;
  }
  if (resultKind === "runtime") {
    return `${kind.toUpperCase()} parses successfully, but its result-set shape depends on runtime database behavior.`;
  }
  if (resultKind === "none") {
    return `${kind.toUpperCase()} parses successfully and does not expose result-set columns.`;
  }
  return `${kind.toUpperCase()} parses successfully, but no statically inferable result-set columns were found.`;
}

function diagnosticCodeForResultKind(resultKind: StatementResultKind): string {
  if (resultKind === "metadata") return "SQLDESC_METADATA_RESULT_SHAPE";
  if (resultKind === "runtime") return "SQLDESC_RUNTIME_RESULT_SHAPE";
  if (resultKind === "none") return "SQLDESC_NO_RESULT_COLUMNS";
  return "SQLDESC_UNKNOWN_RESULT_SHAPE";
}

function suppressResolvedNestedDiagnostics(
  diagnostics: Diagnostic[],
  columns: DescribeColumn[],
): Diagnostic[] {
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(
      /Unknown table or alias '([^']+)' referenced by column '([^']+)'/,
    );
    if (!match) return true;
    const [, qualifier, column] = match;
    const qualifiedColumn = `${qualifier}.${column}`.toLowerCase();
    return !columns.some((resultColumn) => {
      const source = resultColumn.source?.toLowerCase();
      return source === qualifiedColumn || source?.endsWith(`.${qualifiedColumn}`);
    });
  });
}

function suppressExpandedStarDiagnostics(
  diagnostics: Diagnostic[],
  resultSets: Array<{ index: number; columns: DescribeColumn[] }>,
): Diagnostic[] {
  if (!resultSets.some((resultSet) => resultSet.columns.length > 0)) return diagnostics;
  return diagnostics.filter((diagnostic) => diagnostic.code !== "W001");
}

function suppressNamedFunctionArgumentDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
): Diagnostic[] {
  const names = namedFunctionArgumentNames(parsedAst);
  if (names.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown column '([^']+)'/);
    return !match || !names.has(match[1].toLowerCase());
  });
}

function suppressKnownTableFunctionArgumentDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
  dialect: string,
): Diagnostic[] {
  const names = knownTableFunctionArgumentNames(parsedAst, dialect);
  if (names.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown column '([^']+)'/);
    return !match || !names.has(match[1].toLowerCase());
  });
}

function suppressVirtualTableArgumentDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
  schema: ValidationSchema,
  dialect: string,
): Diagnostic[] {
  const names = virtualTableArgumentNames(parsedAst, schema, dialect);
  if (names.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown column '([^']+)'(?: in table '([^']+)')?/);
    if (!match) return true;
    const column = match[1].toLowerCase();
    const table = match[2]?.toLowerCase();
    return !names.has(column) || Boolean(table && table !== column);
  });
}

function suppressConfiguredRowidDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
  dialect: string,
): Diagnostic[] {
  if (
    !getDialectConfig(dialect).diagnosticRules.suppressSqliteRowid ||
    !hasConfiguredRowidColumn(parsedAst)
  )
    return diagnostics;
  return diagnostics.filter(
    (diagnostic) => !/Unknown column '(?:rowid|_rowid_|oid)'/i.test(diagnostic.message),
  );
}

function suppressWholeRowFunctionDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
  schema: ValidationSchema,
): Diagnostic[] {
  const names = wholeRowFunctionArgumentNames(parsedAst);
  if (names.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown column '([^']+)' in table '([^']+)'/);
    if (!match) return true;
    const [, columnName, tableName] = match;
    const normalizedColumn = columnName.toLowerCase();
    const normalizedTable = tableName.toLowerCase();
    if (!names.has(normalizedColumn)) return true;
    return !schema.tables.some(
      (table) =>
        table.name.toLowerCase() === normalizedTable &&
        table.name.toLowerCase() === normalizedColumn,
    );
  });
}

function suppressConfiguredCurrentUserDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
  dialect: string,
): Diagnostic[] {
  if (
    !getDialectConfig(dialect).diagnosticRules.suppressOracleCurrentUser ||
    !hasUnqualifiedCurrentUserColumn(parsedAst)
  )
    return diagnostics;
  return diagnostics.filter(
    (diagnostic) => !/Unknown column 'user'(?: in table 'dual')?/i.test(diagnostic.message),
  );
}

function suppressCurrentTemporalIdentifierDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
): Diagnostic[] {
  const names = currentTemporalIdentifierNames(parsedAst);
  if (names.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown column '([^']+)'/);
    return !match || !names.has(match[1].toLowerCase());
  });
}

function suppressConfiguredDiagnosticPatterns(
  diagnostics: Diagnostic[],
  dialect: string,
): Diagnostic[] {
  const patterns = getDialectConfig(dialect).diagnosticRules.suppressDiagnosticPatterns ?? [];
  if (patterns.length === 0) return diagnostics;
  const regexes = patterns.map((pattern) => new RegExp(pattern, "i"));
  return diagnostics.filter(
    (diagnostic) => !regexes.some((regex) => regex.test(diagnostic.message)),
  );
}

function hasUnqualifiedCurrentUserColumn(value: unknown): boolean {
  let found = false;
  visitAst(value, (node) => {
    if (found || !isRecord(node.column)) return;
    found =
      !identifierName(node.column.table) &&
      identifierName(node.column.name)?.toLowerCase() === "user";
  });
  return found;
}

function currentTemporalIdentifierNames(value: unknown): Set<string> {
  const names = new Set<string>();
  visitAst(value, (node) => {
    if (!isRecord(node.column)) return;
    const name = identifierName(node.column.name)?.toLowerCase();
    if (
      !identifierName(node.column.table) &&
      name &&
      ["current_date", "current_time", "current_timestamp", "localtimestamp"].includes(name)
    ) {
      names.add(name);
    }
  });
  return names;
}

function namedFunctionArgumentNames(value: unknown): Set<string> {
  const names = new Set<string>();
  visitAst(value, (node) => {
    if (!isRecord(node.function) || !Array.isArray(node.function.args)) return;
    for (const arg of node.function.args) {
      const eq = isRecord(arg) ? getAst(arg, "eq") : undefined;
      const leftColumn = isRecord(eq) && isRecord(eq.left) ? getAst(eq.left, "column") : undefined;
      const name = isRecord(leftColumn) ? identifierName(leftColumn.name) : undefined;
      if (name) names.add(name.toLowerCase());
    }
  });
  return names;
}

function wholeRowFunctionArgumentNames(value: unknown): Set<string> {
  const names = new Set<string>();
  visitAst(value, (node) => {
    if (!isRecord(node.function)) return;
    const functionName = String(node.function.name ?? "").toLowerCase();
    if (!["row_to_json", "to_json", "to_jsonb"].includes(functionName)) return;
    for (const arg of functionArguments(node.function)) {
      const column = isRecord(arg) ? getAst(arg, "column") : undefined;
      if (!isRecord(column)) continue;
      const name = identifierName(column.name);
      if (name && !identifierName(column.table)) names.add(name.toLowerCase());
    }
  });
  return names;
}

function knownTableFunctionArgumentNames(value: unknown, dialect: string): Set<string> {
  const knownFunctions = new Set(
    getDialectConfig(dialect).diagnosticRules.knownTableFunctionArgumentNames,
  );
  if (knownFunctions.size === 0) return new Set();
  const names = new Set<string>();
  visitAst(value, (node) => {
    if (!isRecord(node.function)) return;
    const functionName = String(node.function.name ?? "").toLowerCase();
    if (!knownFunctions.has(functionName)) return;
    const formatArg = functionArguments(node.function)[1];
    const column = isRecord(formatArg) ? getAst(formatArg, "column") : undefined;
    const name =
      isRecord(column) && !identifierName(column.table) ? identifierName(column.name) : undefined;
    if (name) names.add(name.toLowerCase());
  });
  return names;
}

function virtualTableArgumentNames(
  value: unknown,
  schema: ValidationSchema,
  dialect: string,
): Set<string> {
  const knownFunctions = new Set(
    getDialectConfig(dialect).diagnosticRules.virtualTableArgumentNames,
  );
  if (knownFunctions.size === 0) return new Set();
  const names = new Set<string>();
  visitAst(value, (node) => {
    if (!isRecord(node.function)) return;
    const functionName = String(node.function.name ?? "").toLowerCase();
    if (!knownFunctions.has(functionName)) return;
    const firstArg = functionArguments(node.function)[0];
    const column = isRecord(firstArg) ? getAst(firstArg, "column") : undefined;
    const name =
      isRecord(column) && !identifierName(column.table) ? identifierName(column.name) : undefined;
    if (name && schema.tables.some((table) => table.name.toLowerCase() === name.toLowerCase()))
      names.add(name.toLowerCase());
  });
  return names;
}

function hasConfiguredRowidColumn(value: unknown): boolean {
  let found = false;
  visitAst(value, (node) => {
    if (found || !isRecord(node.column)) return;
    found = ["rowid", "_rowid_", "oid"].includes(
      identifierName(node.column.name)?.toLowerCase() ?? "",
    );
  });
  return found;
}

function visitAst(value: unknown, visitor: (node: Record<string, unknown>) => void): void {
  if (Array.isArray(value)) {
    value.forEach((item) => visitAst(item, visitor));
    return;
  }
  if (!isRecord(value)) return;
  visitor(value);
  Object.values(value).forEach((item) => visitAst(item, visitor));
}

function suppressResolvedColumnDiagnostics(
  diagnostics: Diagnostic[],
  columns: DescribeColumn[],
): Diagnostic[] {
  const resolvedColumnNames = new Set(
    columns.flatMap((column) => (column.source && column.name ? [column.name.toLowerCase()] : [])),
  );
  if (resolvedColumnNames.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown column '([^']+)'/);
    return !match || !resolvedColumnNames.has(match[1].toLowerCase());
  });
}

function suppressResolvedSourceDiagnostics(
  diagnostics: Diagnostic[],
  columns: DescribeColumn[],
): Diagnostic[] {
  const resolvedSources = new Set(
    columns.flatMap((column) => {
      const parts = column.source?.toLowerCase().split(".") ?? [];
      if (parts.length < 2) return [];
      const unqualified = parts.at(-2);
      const qualified = parts.length >= 3 ? `${parts.at(-3)}.${parts.at(-2)}` : undefined;
      return [unqualified, qualified].filter((source): source is string => Boolean(source));
    }),
  );
  if (resolvedSources.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown table '([^']+)'/);
    if (!match) return true;
    const table = match[1].toLowerCase();
    const unqualified = table.split(".").at(-1);
    return !resolvedSources.has(table) && !(unqualified && resolvedSources.has(unqualified));
  });
}

function suppressResolvedOrderingDiagnostics(
  diagnostics: Diagnostic[],
  resultSets: Array<{ index: number; columns: DescribeColumn[] }>,
): Diagnostic[] {
  if (!resultSets.some((resultSet) => resultSet.columns.length > 0)) return diagnostics;
  return diagnostics.filter((diagnostic) => diagnostic.code !== "W003");
}

function suppressKnownSchemaDiagnostics(
  diagnostics: Diagnostic[],
  schema: ValidationSchema,
): Diagnostic[] {
  return diagnostics.filter((diagnostic) => {
    const tableColumn = diagnostic.message.match(/Unknown column '([^']+)' in table '([^']+)'/);
    if (tableColumn) {
      const [, columnName, tableName] = tableColumn;
      return !schemaHasColumn(schema, tableName, columnName);
    }
    return true;
  });
}

function suppressResolvedInsertValueDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
): Diagnostic[] {
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  if (!statements.some(hasBalancedInsertValues)) return diagnostics;
  return diagnostics.filter(
    (diagnostic) =>
      !/^INSERT row \d+ has \d+ values but target has \d+ columns$/i.test(diagnostic.message),
  );
}

function suppressSetOperationTypeDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
  schema: ValidationSchema,
): Diagnostic[] {
  const compatibleColumns = compatibleSetOperationColumns(parsedAst, schema);
  if (compatibleColumns.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(
      /^(UNION|EXCEPT|INTERSECT) column (\d+) has incompatible types:/i,
    );
    if (!match) return true;
    return !compatibleColumns.has(`${match[1].toLowerCase()}:${match[2]}`);
  });
}

function suppressCompatibleComparisonDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
  schema: ValidationSchema,
): Diagnostic[] {
  if (!allComparisonsAreCompatible(parsedAst, schema)) return diagnostics;
  return diagnostics.filter(
    (diagnostic) => !/^Incompatible comparison between .+ and .+$/i.test(diagnostic.message),
  );
}

function suppressTemporalUnitDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
): Diagnostic[] {
  const units = temporalUnitArgumentNames(parsedAst);
  if (units.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown column '([^']+)'/);
    return !match || !units.has(match[1].toLowerCase());
  });
}

function temporalUnitArgumentNames(value: unknown): Set<string> {
  const units = new Set<string>();
  visitAst(value, (node) => {
    if (!isRecord(node.function)) return;
    const name = String(node.function.name ?? "").toLowerCase();
    if (
      ![
        "dateadd",
        "date_add",
        "date_sub",
        "datediff",
        "date_diff",
        "timestampdiff",
        "timestamp_diff",
        "timestampadd",
      ].includes(name)
    )
      return;
    for (const arg of functionArguments(node.function)) {
      const column = isRecord(arg) ? getAst(arg, "column") : undefined;
      const unit =
        isRecord(column) && !identifierName(column.table)
          ? identifierName(column.name)?.toLowerCase()
          : undefined;
      if (
        unit &&
        [
          "year",
          "quarter",
          "month",
          "week",
          "day",
          "hour",
          "minute",
          "second",
          "millisecond",
          "microsecond",
        ].includes(unit)
      )
        units.add(unit);
    }
  });
  return units;
}

function allComparisonsAreCompatible(parsedAst: unknown, schema: ValidationSchema): boolean {
  const comparisons: Array<[AstExpression, AstExpression]> = [];
  const comparisonSchema = schemaWithTableAliases(parsedAst, schema);
  visitAst(parsedAst, (node) => {
    for (const key of ["eq", "neq", "gt", "gte", "lt", "lte", "null_safe_eq", "null_safe_neq"]) {
      const comparison = isRecord(node[key]) ? node[key] : undefined;
      if (comparison && isRecord(comparison.left) && isRecord(comparison.right))
        comparisons.push([comparison.left, comparison.right]);
    }
  });
  return (
    comparisons.length > 0 &&
    comparisons.every(([left, right]) => {
      if (!isColumnLikeExpression(left) || !isColumnLikeExpression(right)) return true;
      const leftType = inferColumn(
        left,
        "comparison_left",
        comparisonSchema,
        undefined,
        "generic",
      ).type;
      const rightType = inferColumn(
        right,
        "comparison_right",
        comparisonSchema,
        undefined,
        "generic",
      ).type;
      return areSetOperationTypesCompatible(leftType, rightType);
    })
  );
}

function isColumnLikeExpression(expression: AstExpression): boolean {
  return isRecord(getAst(expression, "column")) || isRecord(dotAsColumnRef(expression));
}

function schemaWithBuiltinMetadata(schema: ValidationSchema, dialect: string): ValidationSchema {
  const unqualifiedSchemaTables = new Set(
    schema.tables.filter((table) => !table.schema).map((table) => table.name.toLowerCase()),
  );
  return mergeSchemas(schema, {
    tables: getDialectConfig(dialect)
      .metadata.builtinSchemaTables.filter(
        (table) => !table.schema || !unqualifiedSchemaTables.has(table.name.toLowerCase()),
      )
      .map((table) => ({
        ...table,
        columns: table.columns.map((column) => ({ ...column })),
      })),
  });
}

function schemaWithTableAliases(parsedAst: unknown, schema: ValidationSchema): ValidationSchema {
  const tables = [...schema.tables];
  const byName = new Map(
    schema.tables.map((table) => [schemaTableName(table).toLowerCase(), table]),
  );
  for (const tableRef of tableReferences(parsedAst)) {
    const alias = identifierName(tableRef.alias);
    if (!alias) continue;
    const tableName = relationTableName({ table: tableRef });
    if (!tableName) continue;
    const schemaName = identifierName(tableRef.schema);
    const qualified = schemaName ? `${schemaName}.${tableName}` : tableName;
    const source = byName.get(qualified.toLowerCase()) ?? byName.get(tableName.toLowerCase());
    if (source && !tables.some((table) => table.name.toLowerCase() === alias.toLowerCase())) {
      tables.push({ ...source, schema: undefined, name: alias });
    }
  }
  return { tables };
}

function tableReferences(value: unknown): Array<Record<string, unknown>> {
  const tables: Array<Record<string, unknown>> = [];
  visitAst(value, (node) => {
    if (isRecord(node.table)) tables.push(node.table);
  });
  return tables;
}

function compatibleSetOperationColumns(parsedAst: unknown, schema: ValidationSchema): Set<string> {
  const columns = new Set<string>();
  visitAst(parsedAst, (node) => {
    for (const kind of ["union", "except", "intersect"]) {
      const setOperation = isRecord(node[kind]) ? node[kind] : undefined;
      if (!setOperation) continue;
      const left = outputItemsForStatement(setOperation.left, schema, emptyStatementContext());
      const right = outputItemsForStatement(setOperation.right, schema, emptyStatementContext());
      left.forEach((item, index) => {
        const rightItem = right[index];
        if (!rightItem) return;
        const leftType = inferColumn(
          item.expression,
          item.name ?? "set_left",
          item.schema ?? schema,
          undefined,
          "generic",
          item.source,
          item.tableAliases,
        ).type;
        const rightType = inferColumn(
          rightItem.expression,
          rightItem.name ?? "set_right",
          rightItem.schema ?? schema,
          undefined,
          "generic",
          rightItem.source,
          rightItem.tableAliases,
        ).type;
        if (areSetOperationTypesCompatible(leftType, rightType))
          columns.add(`${kind}:${index + 1}`);
      });
    }
  });
  return columns;
}

function areSetOperationTypesCompatible(left: string, right: string): boolean {
  if (left === "unknown" || right === "unknown") return false;
  if (left.toLowerCase() === right.toLowerCase()) return true;
  if (isNumericType(left) && isNumericType(right)) return true;
  return false;
}

function isNumericType(type: string): boolean {
  return /(?:decimal|numeric|real|double|float|int|number|bigint|smallint)/i.test(type);
}

function hasBalancedInsertValues(statement: unknown): boolean {
  if (!isRecord(statement) || !isRecord(statement.insert)) return false;
  const columns = Array.isArray(statement.insert.columns) ? statement.insert.columns : [];
  const values = Array.isArray(statement.insert.values) ? statement.insert.values : [];
  return (
    columns.length > 0 &&
    values.length > 0 &&
    values.every((row) => Array.isArray(row) && row.length === columns.length)
  );
}

function schemaHasColumn(schema: ValidationSchema, tableName: string, columnName: string): boolean {
  const parts = tableName.toLowerCase().split(".");
  const unqualified = parts.at(-1);
  const schemaName = parts.length >= 2 ? parts.at(-2) : undefined;
  return schema.tables.some((table) => {
    if (table.name.toLowerCase() !== unqualified) return false;
    if (schemaName && table.schema?.toLowerCase() !== schemaName) return false;
    return table.columns.some((column) => column.name.toLowerCase() === columnName.toLowerCase());
  });
}

function suppressStaticStatementDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
  resultSets: Array<{ index: number; columns: DescribeColumn[] }>,
  dialect: string,
): Diagnostic[] {
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  const staticStatementIndexes = new Set(
    resultSets
      .filter((resultSet) => resultSet.columns.length > 0)
      .map((resultSet) => resultSet.index),
  );
  const hasStaticExport = statements.some(
    (statement, index) =>
      staticStatementIndexes.has(index + 1) && isRecord(statement) && isRecord(statement.export),
  );
  const hasStaticBareProcedure = statements.some(
    (statement, index) =>
      staticStatementIndexes.has(index + 1) &&
      staticBareProcedureColumns(statement, dialect).length > 0,
  );
  const hasStaticMetadata = statements.some((statement, index) => {
    if (!staticStatementIndexes.has(index + 1) || !isRecord(statement)) return false;
    return (
      isDescribeMetadataStatement(statement) ||
      isRecord(statement.show) ||
      isStaticCommandStatement(statement, dialect)
    );
  });
  const hasStaticExecute = statements.some(
    (statement, index) =>
      staticStatementIndexes.has(index + 1) && isRecord(statement) && isRecord(statement.execute),
  );
  const hasStaticWatch = statements.some(
    (statement, index) =>
      staticStatementIndexes.has(index + 1) &&
      isRecord(statement) &&
      isWatchExpressionStatement(statement),
  );
  if (
    !hasStaticExport &&
    !hasStaticBareProcedure &&
    !hasStaticMetadata &&
    !hasStaticExecute &&
    !hasStaticWatch
  )
    return diagnostics;
  return diagnostics.filter((diagnostic) => {
    if ((hasStaticExport || hasStaticBareProcedure || hasStaticWatch) && diagnostic.code === "E004")
      return false;
    if (
      (hasStaticMetadata || hasStaticExecute) &&
      (diagnostic.code === "E004" || diagnostic.code === "E200" || diagnostic.code === "E201")
    )
      return false;
    return true;
  });
}

function suppressResolvedPreparedDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
  resultSets: Array<{ index: number; columns: DescribeColumn[] }>,
): Diagnostic[] {
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  const resolvedExecuteNames = new Set(
    statements.flatMap((statement, index) => {
      if (!isRecord(statement) || !isRecord(statement.execute)) return [];
      if (
        !resultSets.some(
          (resultSet) => resultSet.index === index + 1 && resultSet.columns.length > 0,
        )
      )
        return [];
      const name = executeName(statement.execute);
      return name ? [name.toLowerCase()] : [];
    }),
  );
  if (resolvedExecuteNames.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown table '([^']+)'/);
    return !match || !resolvedExecuteNames.has(match[1].toLowerCase());
  });
}

function suppressRuntimeOnlyDiagnostics(
  diagnostics: Diagnostic[],
  statements: StatementSummary[],
): Diagnostic[] {
  if (!statements.some((statement) => statement.resultKind === "runtime")) return diagnostics;
  if (
    statements.some(
      (statement) => statement.resultKind === "static" || statement.resultKind === "unknown",
    )
  )
    return diagnostics;
  return diagnostics.filter((diagnostic) => {
    if (diagnostic.code === "E200" || diagnostic.code === "E004") return false;
    if (/Invalid expression|Unexpected token/i.test(diagnostic.message)) return false;
    if (/Unknown table|Unknown column|Unknown table or alias/i.test(diagnostic.message))
      return false;
    return true;
  });
}

function suppressNonShapeValidationDiagnostics(
  diagnostics: Diagnostic[],
  resultSets: Array<{ index: number; columns: DescribeColumn[] }>,
): Diagnostic[] {
  if (resultSets.length === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => diagnostic.code !== "W004");
}

function suppressNoResultParseDiagnostics(
  diagnostics: Diagnostic[],
  statements: StatementSummary[],
): Diagnostic[] {
  if (!statements.some((statement) => statement.resultKind === "none")) return diagnostics;
  return diagnostics.filter(
    (diagnostic) => !/Invalid expression|Unexpected token/i.test(diagnostic.message),
  );
}

function outputItemsForStatement(
  statement: unknown,
  schema: ValidationSchema,
  context: StatementContext = emptyStatementContext(),
  dialect = "generic",
): OutputItem[] {
  if (!isRecord(statement)) return [];
  if (isRecord(statement.select)) {
    const serialized = outputItemsFromSerializedSelect(statement.select, dialect);
    if (serialized.length > 0) return serialized;
    const schemaWithFunctions = mergeSchemas(
      { tables: [...context.tableFunctions.values()] },
      schema,
    );
    const localSchema = mergeSchemas(
      schemaFromCtes(statement.select.with, schemaWithFunctions, dialect),
      schemaWithFunctions,
    );
    const scopedSchema = mergeSchemas(
      schemaFromDerivedTables(statement.select, localSchema, dialect),
      localSchema,
    );
    return outputItemsFromExpressions(
      statement.select.expressions,
      scopedSchema,
      statement.select,
      context,
      dialect,
    );
  }
  if (isRecord(statement.values)) return outputItemsFromValues(statement.values, schema);
  if (isRecord(statement.union))
    return outputItemsFromSetOperation(statement.union, schema, context, dialect);
  if (isRecord(statement.intersect))
    return outputItemsFromSetOperation(statement.intersect, schema, context, dialect);
  if (isRecord(statement.except))
    return outputItemsFromSetOperation(statement.except, schema, context, dialect);
  if (isRecord(statement.pivot)) return outputItemsFromPivot(statement.pivot, schema);
  if (isRecord(statement.create_view))
    return outputItemsFromCreateView(statement.create_view, schema, context, dialect);
  if (isRecord(statement.create_table))
    return outputItemsFromCreateTable(statement.create_table, schema, context, dialect);
  if (isRecord(statement.execute))
    return outputItemsFromExecute(statement.execute, schema, context, dialect);
  if (isRecord(statement.describe))
    return outputItemsFromDescribe(statement.describe, schema, context, dialect);
  if (isRecord(statement.show)) return outputItemsFromShow(statement.show, dialect);
  if (isRecord(statement.summarize)) return outputItemsFromSummarize();
  if (isRecord(statement.pragma)) return outputItemsFromPragma(statement.pragma);
  if (isRecord(statement.analyze)) return outputItemsFromAnalyze(statement.analyze);
  if (isRecord(statement.put)) return outputItemsFromPut();
  if (isNoResultCommandStatement(statement)) return [];
  if (isRecord(statement.command))
    return outputItemsFromCommand(statement.command, schema, context, dialect);
  if (isRecord(statement.copy)) return outputItemsFromCopy(statement.copy, schema, context);
  if (isRecord(statement.export)) return outputItemsFromExport(statement.export, schema, context);
  if (isRecord(statement.insert)) return outputItemsFromReturning(statement.insert, schema);
  if (isRecord(statement.update)) return outputItemsFromReturning(statement.update, schema);
  if (isRecord(statement.delete)) return outputItemsFromReturning(statement.delete, schema);
  if (isRecord(statement.merge)) return outputItemsFromMerge(statement.merge, schema);
  if (isNoResultExpressionCommand(statement)) return [];
  if (isRuntimeExpressionCommand(statement)) return [];
  if (isWatchExpressionStatement(statement))
    return outputItemsFromWatchExpression(statement, schema);
  {
    const bareProcedureColumns = staticBareProcedureColumns(statement, dialect);
    if (bareProcedureColumns.length > 0) return bareProcedureColumns;
  }
  if (isTopLevelExpressionStatement(statement))
    return outputItemsFromExpressions([statement], schema);

  return [];
}

function schemaFromDefinitionStatement(
  statement: unknown,
  schema: ValidationSchema,
  context: StatementContext,
): ValidationSchema {
  if (!isRecord(statement)) return { tables: [] };
  if (isRecord(statement.create_view)) {
    const table = tableFromCreateViewDefinition(statement.create_view, schema, context);
    return table ? { tables: [table] } : { tables: [] };
  }
  if (isRecord(statement.create_table)) {
    const table = tableFromCreateTableDefinition(statement.create_table, schema, context);
    return table ? { tables: [table] } : { tables: [] };
  }
  if (isRecord(statement.create_synonym)) {
    const table = tableFromCreateSynonymDefinition(statement.create_synonym, schema);
    return table ? { tables: [table] } : { tables: [] };
  }
  return { tables: [] };
}

function schemaAfterStatement(
  statement: unknown,
  schema: ValidationSchema,
  context: StatementContext,
): ValidationSchema {
  if (isRecord(statement) && isRecord(statement.alter_table))
    return schemaAfterAlterTable(statement.alter_table, schema);
  if (isRecord(statement) && isRecord(statement.alter_view))
    return schemaAfterAlterView(statement.alter_view, schema);
  if (isRecord(statement) && isRecord(statement.raw))
    return schemaAfterRawStatement(statement.raw, schema, context);
  if (isRecord(statement) && isRecord(statement.drop_table))
    return schemaAfterDropTable(statement.drop_table, schema);
  if (isRecord(statement) && isRecord(statement.drop_view))
    return schemaAfterDropView(statement.drop_view, schema);
  if (isRecord(statement) && isRecord(statement.drop_schema))
    return schemaAfterDropSchema(statement.drop_schema, schema);
  if (isRecord(statement) && isRecord(statement.drop_database))
    return schemaAfterDropSchema(statement.drop_database, schema);
  if (isRecord(statement) && isRecord(statement.drop_namespace))
    return schemaAfterDropSchema(statement.drop_namespace, schema);
  if (isRecord(statement) && isRecord(statement.select))
    return schemaAfterSelectInto(statement.select, schema, context);
  const defined = schemaFromDefinitionStatement(statement, schema, context);
  return mergeSchemas(defined, schema);
}

function schemaAfterSelectInto(
  select: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
): ValidationSchema {
  if (!isRecord(select.into) || !isRecord(select.into.this) || !isRecord(select.into.this.table))
    return schema;
  const name = relationNameFromRef(select.into.this.table);
  if (!name) return schema;
  const items = outputItemsForStatement({ select }, schema, context);
  const table: SchemaTable = {
    name,
    columns: columnsFromOutputItems(items, [], schema),
  };
  return mergeSchemas({ tables: [table] }, schema);
}

function schemaAfterDropTable(
  dropTable: Record<string, unknown>,
  schema: ValidationSchema,
): ValidationSchema {
  const names = Array.isArray(dropTable.names) ? dropTable.names : [];
  return dropSchemaRelations(schema, names);
}

function schemaAfterDropView(
  dropView: Record<string, unknown>,
  schema: ValidationSchema,
): ValidationSchema {
  return dropSchemaRelations(schema, [dropView.name]);
}

function schemaAfterDropSchema(
  dropSchema: Record<string, unknown>,
  schema: ValidationSchema,
): ValidationSchema {
  const name = identifierName(dropSchema.name);
  if (!name) return schema;
  return {
    tables: schema.tables.filter((table) => table.schema?.toLowerCase() !== name.toLowerCase()),
  };
}

function schemaAfterRawStatement(
  raw: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
): ValidationSchema {
  const sql = typeof raw.sql === "string" ? raw.sql : "";
  const rawTable = tableFromRawCreateTable(sql);
  if (rawTable) return mergeSchemas({ tables: [rawTable] }, schema);
  const rawView = tableFromRawCreateView(sql, schema, context);
  if (rawView) return mergeSchemas({ tables: [rawView] }, schema);
  const rawTableMacro = tableFromRawCreateTableMacro(sql, schema, context);
  if (rawTableMacro) return mergeSchemas({ tables: [rawTableMacro] }, schema);
  const alterMaterializedViewRename = sql.match(
    /^alter\s+materialized\s+view\s+(.+?)\s+rename\s+to\s+(.+?)\s*$/i,
  );
  if (alterMaterializedViewRename) {
    const oldRef = relationRefFromSqlName(alterMaterializedViewRename[1]);
    const newRef = relationRefFromSqlName(alterMaterializedViewRename[2]);
    const oldName = oldRef.name;
    const newName = newRef.name;
    if (!oldName || !newName) return schema;
    return {
      tables: schema.tables.map((table) => {
        if (table.name.toLowerCase() !== oldName.toLowerCase()) return table;
        if (oldRef.schema && table.schema?.toLowerCase() !== oldRef.schema.toLowerCase())
          return table;
        return {
          ...table,
          name: newName,
          ...(newRef.schema ? { schema: newRef.schema } : {}),
        };
      }),
    };
  }
  const alterSchemaRename = sql.match(
    /^alter\s+(?:schema|database)\s+(.+?)\s+rename\s+to\s+(.+?)\s*$/i,
  );
  if (alterSchemaRename) {
    const oldName = cleanIdentifier(alterSchemaRename[1].trim());
    const newName = cleanIdentifier(alterSchemaRename[2].trim());
    if (!oldName || !newName) return schema;
    return {
      tables: schema.tables.map((table) =>
        table.schema?.toLowerCase() === oldName.toLowerCase()
          ? { ...table, schema: newName }
          : table,
      ),
    };
  }
  return schema;
}

function relationRefFromSqlName(name: string): { schema?: string; name?: string } {
  const parts = name
    .split(".")
    .map((part) => cleanIdentifier(part.trim()))
    .filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { name: parts[0] };
  return { schema: parts.at(-2), name: parts.at(-1) };
}

function schemaAfterAlterView(
  alterView: Record<string, unknown>,
  schema: ValidationSchema,
): ValidationSchema {
  const viewName = relationNameFromRef(alterView.name);
  if (!viewName || !Array.isArray(alterView.actions)) return schema;
  const schemaName = isRecord(alterView.name) ? identifierName(alterView.name.schema) : undefined;
  return {
    tables: schema.tables.map((table) => {
      if (table.name.toLowerCase() !== viewName.toLowerCase()) return table;
      if (schemaName && table.schema?.toLowerCase() !== schemaName.toLowerCase()) return table;
      return applyAlterViewActions(table, alterView.actions as unknown[]);
    }),
  };
}

function applyAlterViewActions(table: SchemaTable, actions: unknown[]): SchemaTable {
  return actions.reduce<SchemaTable>(
    (current, action) => {
      if (!isRecord(action)) return current;
      if (isRecord(action.Rename)) return renameAlterTable(current, action.Rename);
      return current;
    },
    { ...table, columns: [...table.columns] },
  );
}

function dropSchemaRelations(schema: ValidationSchema, refs: unknown[]): ValidationSchema {
  const names = refs.flatMap((ref) => {
    const name = relationNameFromRef(ref);
    const schemaName = isRecord(ref) ? identifierName(ref.schema) : undefined;
    return name ? [{ name: name.toLowerCase(), schema: schemaName?.toLowerCase() }] : [];
  });
  if (names.length === 0) return schema;
  return {
    tables: schema.tables.filter(
      (table) =>
        !names.some((target) => {
          if (table.name.toLowerCase() !== target.name) return false;
          if (target.schema && table.schema?.toLowerCase() !== target.schema) return false;
          return true;
        }),
    ),
  };
}

function schemaAfterAlterTable(
  alterTable: Record<string, unknown>,
  schema: ValidationSchema,
): ValidationSchema {
  const tableName = relationNameFromRef(alterTable.name);
  if (!tableName || !Array.isArray(alterTable.actions)) return schema;
  const actions = alterTable.actions;
  const schemaName = isRecord(alterTable.name) ? identifierName(alterTable.name.schema) : undefined;
  let found = false;
  const tables = schema.tables.map((table) => {
    if (table.name.toLowerCase() !== tableName.toLowerCase()) return table;
    if (schemaName && table.schema?.toLowerCase() !== schemaName.toLowerCase()) return table;
    found = true;
    return applyAlterActions(table, actions);
  });
  if (!found) {
    const created = applyAlterActions(
      { name: tableName, ...(schemaName ? { schema: schemaName } : {}), columns: [] },
      actions,
    );
    return { tables: [created, ...schema.tables] };
  }
  return { tables };
}

function applyAlterActions(table: SchemaTable, actions: unknown[]): SchemaTable {
  return actions.reduce<SchemaTable>(
    (current, action) => {
      if (!isRecord(action)) return current;
      if (isRecord(action.RenameTable)) return renameAlterTable(current, action.RenameTable);
      if (isRecord(action.AddColumn)) return addAlterColumn(current, action.AddColumn.column);
      if (isRecord(action.AddColumns)) return addAlterColumns(current, action.AddColumns.columns);
      if (isRecord(action.DropColumn)) return dropAlterColumn(current, action.DropColumn.name);
      if (isRecord(action.RenameColumn))
        return renameAlterColumn(
          current,
          action.RenameColumn.old_name,
          action.RenameColumn.new_name,
        );
      if (isRecord(action.ChangeColumn)) return changeAlterColumn(current, action.ChangeColumn);
      if (isRecord(action.AlterColumn)) return alterColumn(current, action.AlterColumn);
      if (isRecord(action.AddConstraint)) return addAlterConstraint(current, action.AddConstraint);
      if (isRecord(action.Raw)) return applyRawAlterAction(current, action.Raw);
      return current;
    },
    { ...table, columns: [...table.columns] },
  );
}

function tableFromRawCreateTable(sql: string): SchemaTable | undefined {
  const parsed = parseCreateTables(sql, "generic");
  if (parsed[0]) return parsed[0];
  const virtual = tableFromRawCreateVirtualTable(sql);
  if (virtual) return virtual;
  const create = sql.match(
    /^create\s+(?:global\s+temporary\s+|temporary\s+|temp\s+)?table\s+(.+?)\s*\(([\s\S]*)\)(?:\s+[\s\S]*)?$/i,
  );
  if (!create) return undefined;
  const ref = relationRefFromSqlName(create[1]);
  if (!ref.name) return undefined;
  const columns = splitTopLevel(create[2], ",")
    .map(rawSchemaColumn)
    .filter((column): column is SchemaColumn => Boolean(column));
  return columns.length > 0
    ? { name: ref.name, ...(ref.schema ? { schema: ref.schema } : {}), columns }
    : undefined;
}

function tableFromRawCreateVirtualTable(sql: string): SchemaTable | undefined {
  const create = sql.match(
    /^create\s+virtual\s+table\s+(.+?)\s+using\s+(\w+)\s*\(([\s\S]*)\)(?:\s*[\s\S]*)?$/i,
  );
  if (!create) return undefined;
  const ref = relationRefFromSqlName(create[1]);
  const moduleName = create[2].toLowerCase();
  if (!ref.name || !["fts3", "fts4", "fts5"].includes(moduleName)) return undefined;
  const columns = splitTopLevel(create[3], ",").flatMap((part) => {
    const trimmed = part.trim();
    if (!trimmed || /=/.test(trimmed)) return [];
    const name = cleanIdentifier(trimmed.split(/\s+/)[0] ?? "");
    return name ? [{ name, type: "text" }] : [];
  });
  return columns.length > 0
    ? { name: ref.name, ...(ref.schema ? { schema: ref.schema } : {}), columns }
    : undefined;
}

function tableFromRawCreateView(
  sql: string,
  schema: ValidationSchema,
  context: StatementContext,
): SchemaTable | undefined {
  const create = sql.match(
    /^create\s+(?:or\s+replace\s+)?(?:recursive\s+)?(?:global\s+temporary\s+|temporary\s+|temp\s+)?(?:materialized\s+)?view\s+(.+?)\s+as\s+([\s\S]+)$/i,
  );
  if (!create) return undefined;
  const header = create[1].trim();
  const query = create[2].trim();
  const headerMatch = header.match(/^(.+?)(?:\s*\(([\s\S]*)\))?$/);
  const ref = relationRefFromSqlName(headerMatch?.[1] ?? header);
  if (!ref.name) return undefined;
  const explicitColumns = headerMatch?.[2]
    ? splitTopLevel(headerMatch[2], ",").map((column) => ({
        name: { name: cleanIdentifier(column.trim()) },
      }))
    : [];
  try {
    const fallbackDialect = getDialectConfig().parserFallbacks.createView;
    const parsed = parse(query, fallbackDialect as never) as PolyglotParseResult;
    if (!parsed.success) return undefined;
    const statements = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];
    const statement = statements.find(isRecord);
    if (!statement) return undefined;
    const items = outputItemsForStatement(statement, schema, context, fallbackDialect);
    const columns = columnsFromOutputItems(items, explicitColumns, schema);
    return columns.length > 0
      ? { name: ref.name, ...(ref.schema ? { schema: ref.schema } : {}), columns }
      : undefined;
  } catch {
    return undefined;
  }
}

function tableFromRawCreateTableMacro(
  sql: string,
  schema: ValidationSchema,
  context: StatementContext,
): SchemaTable | undefined {
  const create = sql.match(
    /^create\s+(?:or\s+replace\s+)?macro\s+(.+?)\s*\([^)]*\)\s+as\s+table\s+([\s\S]+)$/i,
  );
  if (!create) return undefined;
  const name = cleanIdentifier(create[1].trim());
  if (!name) return undefined;
  const query = create[2].trim();
  try {
    const fallbackDialect = getDialectConfig().parserFallbacks.tableMacro;
    const parsed = parse(query, fallbackDialect as never) as PolyglotParseResult;
    if (!parsed.success) return undefined;
    const statements = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];
    const statement = statements.find(isRecord);
    if (!statement) return undefined;
    const items = outputItemsForStatement(statement, schema, context, fallbackDialect);
    const columns = columnsFromOutputItems(items, [], schema);
    return columns.length > 0 ? { name, columns } : undefined;
  } catch {
    return undefined;
  }
}

function rawSchemaColumn(spec: string): SchemaColumn | undefined {
  const trimmed = spec.trim();
  if (!trimmed || /^(?:constraint|primary|unique|foreign|check)\b/i.test(trimmed)) return undefined;
  const match = trimmed.match(/^("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/);
  if (!match) return undefined;
  const name = cleanIdentifier(match[1]);
  const type = dataTypeFromRawColumnSpec(match[2]) ?? "unknown";
  return {
    name,
    type,
    nullable: /\bnot\s+null\b/i.test(match[2]) ? false : undefined,
    primaryKey: /\bprimary\s+key\b/i.test(match[2]),
    unique: /\bunique\b/i.test(match[2]),
  };
}

function renameAlterTable(table: SchemaTable, tableRef: unknown): SchemaTable {
  const name = relationNameFromRef(tableRef);
  const schemaName = isRecord(tableRef) ? identifierName(tableRef.schema) : undefined;
  if (!name) return table;
  return { ...table, name, ...(schemaName ? { schema: schemaName } : {}) };
}

function addAlterColumn(table: SchemaTable, columnDefinition: unknown): SchemaTable {
  const column = schemaColumnFromDefinition(columnDefinition);
  if (!column) return table;
  const columns = table.columns.filter(
    (existing) => existing.name.toLowerCase() !== column.name.toLowerCase(),
  );
  return { ...table, columns: [...columns, column] };
}

function addAlterColumns(table: SchemaTable, columnDefinitions: unknown): SchemaTable {
  const columns = Array.isArray(columnDefinitions)
    ? columnDefinitions
        .map((column) => schemaColumnFromDefinition(column))
        .filter((column): column is SchemaColumn => Boolean(column))
    : [];
  return columns.reduce((current, column) => {
    const existing = current.columns.filter(
      (candidate) => candidate.name.toLowerCase() !== column.name.toLowerCase(),
    );
    return { ...current, columns: [...existing, column] };
  }, table);
}

function changeAlterColumn(table: SchemaTable, changeColumn: Record<string, unknown>): SchemaTable {
  const oldName = identifierName(changeColumn.old_name);
  const newName = identifierName(changeColumn.new_name);
  if (!oldName || !newName) return table;
  const type = dataTypeToString(changeColumn.data_type);
  return {
    ...table,
    columns: table.columns.map((column) =>
      column.name.toLowerCase() === oldName.toLowerCase()
        ? { ...column, name: newName, ...(type ? { type } : {}) }
        : column,
    ),
  };
}

function alterColumn(table: SchemaTable, alterColumn: Record<string, unknown>): SchemaTable {
  const name = identifierName(alterColumn.name);
  if (!name) return table;
  const action = alterColumn.action;
  return {
    ...table,
    columns: table.columns.map((column) => {
      if (column.name.toLowerCase() !== name.toLowerCase()) return column;
      if (action === "SetNotNull") return { ...column, nullable: false };
      if (action === "DropNotNull") return { ...column, nullable: true };
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
      columns: table.columns.map((column) =>
        columns.some((name) => name.toLowerCase() === column.name.toLowerCase())
          ? { ...column, primaryKey: true, nullable: false }
          : column,
      ),
    };
  }
  if (
    isRecord(constraint.Index) &&
    String(constraint.Index.kind ?? "").toLowerCase() === "unique"
  ) {
    const columns = constraintColumns(constraint.Index);
    return {
      ...table,
      ...(columns.length > 0 ? { uniqueKeys: [...(table.uniqueKeys ?? []), columns] } : {}),
      columns: table.columns.map((column) =>
        columns.length === 1 && columns[0]?.toLowerCase() === column.name.toLowerCase()
          ? { ...column, unique: true }
          : column,
      ),
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
  const sql = typeof raw.sql === "string" ? raw.sql : "";
  const modifyColumn = sql.match(
    /^modify\s+(?:column\s+)?("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/i,
  );
  if (modifyColumn) {
    const columnName = cleanIdentifier(modifyColumn[1]);
    const type = dataTypeFromRawColumnSpec(modifyColumn[2]);
    return {
      ...table,
      columns: table.columns.map((column) =>
        column.name.toLowerCase() === columnName.toLowerCase()
          ? { ...column, ...(type ? { type } : {}) }
          : column,
      ),
    };
  }
  const setSchema = sql.match(/^set\s+schema\s+(.+)$/i);
  if (setSchema) return { ...table, schema: cleanIdentifier(setSchema[1].trim()) };
  return table;
}

function dataTypeFromRawColumnSpec(spec: string): string | undefined {
  const enumOrSet = spec.trim().match(/^(enum|set)\s*\(([^)]*)\)/i);
  if (enumOrSet) return `${enumOrSet[1].toLowerCase()}(${enumOrSet[2].replace(/\s+/g, "")})`;
  const type = spec.trim().split(/\s+/)[0];
  return type ? normalizeDataTypeName(cleanIdentifier(type)) : undefined;
}

function dropAlterColumn(table: SchemaTable, columnName: unknown): SchemaTable {
  const name = identifierName(columnName);
  if (!name) return table;
  return {
    ...table,
    columns: table.columns.filter((column) => column.name.toLowerCase() !== name.toLowerCase()),
  };
}

function renameAlterColumn(
  table: SchemaTable,
  oldColumnName: unknown,
  newColumnName: unknown,
): SchemaTable {
  const oldName = identifierName(oldColumnName);
  const newName = identifierName(newColumnName);
  if (!oldName || !newName) return table;
  return {
    ...table,
    columns: table.columns.map((column) =>
      column.name.toLowerCase() === oldName.toLowerCase() ? { ...column, name: newName } : column,
    ),
  };
}

function tableFromCreateViewDefinition(
  createView: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
): SchemaTable | undefined {
  const name = relationNameFromRef(createView.name);
  if (!name || !isRecord(createView.query)) return undefined;
  const schemaName = relationSchemaFromRef(createView.name);
  const explicitColumns = definitionColumns(createView);
  const items = outputItemsForStatement(createView.query, schema, context);
  return {
    name,
    ...(schemaName ? { schema: schemaName } : {}),
    columns: columnsFromOutputItems(items, explicitColumns, schema),
  };
}

function tableFromCreateTableDefinition(
  createTable: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
): SchemaTable | undefined {
  const name = relationNameFromRef(createTable.name);
  if (!name) return undefined;
  const schemaName = relationSchemaFromRef(createTable.name);
  if (isRecord(createTable.as_select)) {
    const items = outputItemsForStatement(createTable.as_select, schema, context);
    const explicitColumns = Array.isArray(createTable.columns) ? createTable.columns : [];
    return {
      name,
      ...(schemaName ? { schema: schemaName } : {}),
      columns: columnsFromOutputItems(items, explicitColumns, schema),
    };
  }
  const copied = copiedTableColumns(createTable, schema);
  const explicitColumns = Array.isArray(createTable.columns)
    ? createTable.columns
        .map((column) => schemaColumnFromDefinition(column, context))
        .filter((column): column is SchemaColumn => column !== undefined)
    : [];
  if (copied)
    return {
      name,
      ...(schemaName ? { schema: schemaName } : {}),
      columns: mergeSchemaColumns(copied, explicitColumns),
    };
  const columns = explicitColumns;
  return columns.length > 0
    ? { name, ...(schemaName ? { schema: schemaName } : {}), columns }
    : undefined;
}

function mergeSchemaColumns(
  baseColumns: SchemaColumn[],
  extraColumns: SchemaColumn[],
): SchemaColumn[] {
  const columns = baseColumns.map((column) => ({ ...column }));
  for (const column of extraColumns) {
    const existingIndex = columns.findIndex(
      (candidate) => candidate.name.toLowerCase() === column.name.toLowerCase(),
    );
    if (existingIndex >= 0) {
      columns[existingIndex] = column;
    } else {
      columns.push(column);
    }
  }
  return columns;
}

function tableFromCreateSynonymDefinition(
  createSynonym: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaTable | undefined {
  const name = relationNameFromRef(createSynonym.name);
  const targetName = relationNameFromRef(createSynonym.target);
  if (!name || !targetName) return undefined;
  const schemaName = relationSchemaFromRef(createSynonym.name);
  const targetSchema = relationSchemaFromRef(createSynonym.target);
  const target = schema.tables.find((table) => {
    if (table.name.toLowerCase() !== targetName.toLowerCase()) return false;
    if (targetSchema && table.schema && table.schema.toLowerCase() !== targetSchema.toLowerCase())
      return false;
    return true;
  });
  if (!target) return undefined;
  return {
    name,
    ...(schemaName ? { schema: schemaName } : {}),
    columns: target.columns.map((column) => ({ ...column })),
    ...(target.primaryKey ? { primaryKey: [...target.primaryKey] } : {}),
    ...(target.uniqueKeys ? { uniqueKeys: target.uniqueKeys.map((key) => [...key]) } : {}),
    ...(target.foreignKeys ? { foreignKeys: [...target.foreignKeys] } : {}),
  };
}

function copiedTableColumns(
  createTable: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaColumn[] | undefined {
  const sourceRef = isRecord(createTable.clone_source)
    ? createTable.clone_source
    : likeTableSource(createTable);
  if (!sourceRef) return undefined;
  const sourceName = relationNameFromRef(sourceRef)?.toLowerCase();
  const sourceSchema = isRecord(sourceRef)
    ? identifierName(sourceRef.schema)?.toLowerCase()
    : undefined;
  if (!sourceName) return undefined;
  const source = schema.tables.find((table) => {
    if (table.name.toLowerCase() !== sourceName) return false;
    if (sourceSchema && table.schema?.toLowerCase() !== sourceSchema) return false;
    return true;
  });
  return source ? source.columns.map((column) => ({ ...column })) : undefined;
}

function likeTableSource(
  createTable: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!Array.isArray(createTable.constraints)) return undefined;
  for (const constraint of createTable.constraints) {
    const like = isRecord(constraint) && isRecord(constraint.Like) ? constraint.Like : undefined;
    if (like && isRecord(like.source)) return like.source;
  }
  return undefined;
}

function relationNameFromRef(ref: unknown): string | undefined {
  return isRecord(ref) ? identifierName(ref.name) : undefined;
}

function relationSchemaFromRef(ref: unknown): string | undefined {
  return isRecord(ref) ? identifierName(ref.schema) : undefined;
}

function schemaColumnFromDefinition(
  column: unknown,
  context?: StatementContext,
): SchemaColumn | undefined {
  if (!isRecord(column)) return undefined;
  const name = identifierName(column.name);
  if (!name) return undefined;
  if (
    name.toLowerCase() === "period" &&
    dataTypeToString(column.data_type)?.toLowerCase() === "for system_time"
  )
    return undefined;
  return {
    name,
    type: dataTypeToStringWithAliases(column.data_type, context) ?? "unknown",
    nullable: typeof column.nullable === "boolean" ? column.nullable : undefined,
    primaryKey: column.primary_key === true,
    unique: column.unique === true,
  };
}

function rememberPreparedStatement(statement: unknown, context: StatementContext): void {
  if (!isRecord(statement) || !isRecord(statement.prepare)) return;
  const name = identifierName(statement.prepare.name);
  if (name && isRecord(statement.prepare.statement))
    context.prepared.set(name.toLowerCase(), statement.prepare.statement);
}

function rememberFunctionDefinition(statement: unknown, context: StatementContext): void {
  if (!isRecord(statement) || !isRecord(statement.create_function)) return;
  const createFunction = statement.create_function;
  const name = relationNameFromRef(createFunction.name);
  if (!name) return;
  const schema = relationSchemaFromRef(createFunction.name);
  const type =
    dataTypeToString(createFunction.return_type) ??
    inferCreateFunctionBodyReturnType(createFunction);
  if (type) {
    context.functionReturnTypes.set(name.toLowerCase(), type);
    if (schema)
      context.functionReturnTypes.set(`${schema.toLowerCase()}.${name.toLowerCase()}`, type);
  }
  const table = tableFromCreateFunctionReturnTable(name, createFunction);
  if (table) context.tableFunctions.set(name.toLowerCase(), table);
}

function inferCreateFunctionBodyReturnType(
  createFunction: Record<string, unknown>,
): string | undefined {
  const returnExpression = createFunctionReturnExpression(createFunction);
  if (!returnExpression) return undefined;
  const parameterColumns = Array.isArray(createFunction.parameters)
    ? createFunction.parameters.flatMap((parameter): SchemaColumn[] => {
        if (!isRecord(parameter)) return [];
        const name = identifierName(parameter.name);
        if (!name) return [];
        return [{ name, type: dataTypeToString(parameter.data_type) ?? "unknown" }];
      })
    : [];
  return inferColumn(
    returnExpression,
    "return",
    { tables: [{ name: "__function_parameters", columns: parameterColumns }] },
    undefined,
    "generic",
  ).type;
}

function createFunctionReturnExpression(
  createFunction: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const body = isRecord(createFunction.body) ? createFunction.body : undefined;
  if (!body) return undefined;
  if (isRecord(body.Return)) return body.Return;
  if (isRecord(body.Expression)) return body.Expression;
  return undefined;
}

function rememberRawScalarMacroDefinition(
  statement: unknown,
  schema: ValidationSchema,
  context: StatementContext,
  dialect = "generic",
): void {
  if (!isRecord(statement) || !isRecord(statement.raw)) return;
  const sql = typeof statement.raw.sql === "string" ? statement.raw.sql : "";
  const definition = rawScalarMacroDefinition(sql);
  if (!definition) return;
  const type = inferRawScalarMacroReturnType(definition, schema, context, dialect);
  if (type) context.functionReturnTypes.set(definition.name.toLowerCase(), type);
}

function rawScalarMacroDefinition(
  sql: string,
): { name: string; parameters: string[]; expression: string } | undefined {
  const create = sql.match(
    /^create\s+(?:or\s+replace\s+)?macro\s+([`"[\]\w$]+)\s*\(([^)]*)\)\s+as\s+(?!table\b)([\s\S]+)$/i,
  );
  if (!create) return undefined;
  const name = cleanIdentifier(create[1]);
  const expression = create[3]?.trim();
  if (!name || !expression) return undefined;
  return {
    name,
    parameters: splitTopLevel(create[2] ?? "", ",")
      .map((parameter) => cleanIdentifier(parameter.trim().split(/\s+/)[0] ?? ""))
      .filter(Boolean),
    expression,
  };
}

function inferRawScalarMacroReturnType(
  definition: { parameters: string[]; expression: string },
  schema: ValidationSchema,
  context: StatementContext,
  dialect: string,
): string | undefined {
  const parameterColumns = definition.parameters.map((name) => ({ name, type: "unknown" }));
  const parameterSchema = mergeSchemas(
    { tables: [{ name: "__macro_parameters", columns: parameterColumns }] },
    schema,
  );
  try {
    const parsed = parse(
      `select ${definition.expression} as __sqldesc_macro_return from __macro_parameters`,
      dialect as never,
    ) as PolyglotParseResult;
    if (!parsed.success) return undefined;
    const statements = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];
    const statement = statements.find(isRecord);
    if (!statement) return undefined;
    const item = outputItemsForStatement(statement, parameterSchema, context, dialect)[0];
    if (!item) return undefined;
    const inferred = inferColumn(
      item.expression,
      item.name ?? "return",
      item.schema ?? parameterSchema,
      undefined,
      dialect,
      item.source,
      item.tableAliases,
      item.functionReturnTypes,
    );
    return inferred.type === "unknown" ? undefined : inferred.type;
  } catch {
    return undefined;
  }
}

function rememberProcedureDefinition(
  statement: unknown,
  schema: ValidationSchema,
  context: StatementContext,
  dialect = "generic",
): void {
  if (!isRecord(statement) || !isRecord(statement.create_procedure)) return;
  const createProcedure = statement.create_procedure;
  const name = relationNameFromRef(createProcedure.name);
  if (!name) return;
  const items = outputItemsFromProcedureDefinition(createProcedure, schema, context, dialect);
  if (items.length > 0) context.procedureResultSets.set(name.toLowerCase(), items);
}

function outputItemsFromProcedureDefinition(
  createProcedure: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
  dialect = "generic",
): OutputItem[] {
  const returnColumns = tableColumnsFromProcedureReturnType(createProcedure.return_type);
  if (returnColumns.length > 0)
    return staticColumns(returnColumns.map((column) => [column.name, column.type]));
  const body = isRecord(createProcedure.body) ? createProcedure.body : undefined;
  if (body && isRecord(body.Expression)) {
    const literal = getAst(body.Expression, "literal");
    if (
      isRecord(literal) &&
      literal.literal_type === "dollar_string" &&
      typeof literal.value === "string"
    ) {
      return outputItemsFromProcedureSql(literal.value, schema, context, dialect);
    }
    return outputItemsForStatement(body.Expression, schema, context, dialect);
  }
  const rawBlock = body && typeof body.RawBlock === "string" ? body.RawBlock : undefined;
  return rawBlock ? outputItemsFromProcedureSql(rawBlock, schema, context, dialect) : [];
}

function outputItemsFromProcedureSql(
  sql: string,
  schema: ValidationSchema,
  context: StatementContext,
  dialect = "generic",
): OutputItem[] {
  const body = sql
    .trim()
    .replace(/^begin\b/i, "")
    .replace(/\bend\s*$/i, "")
    .trim();
  if (!/\bselect\b/i.test(body)) return [];
  try {
    const parsed = parse(body, dialect as never) as PolyglotParseResult;
    if (!parsed.success) return [];
    const statements = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];
    for (const statement of statements) {
      const items = outputItemsForStatement(statement, schema, context, dialect);
      if (items.length > 0) return items;
    }
  } catch {
    return [];
  }
  return [];
}

function tableColumnsFromProcedureReturnType(returnType: unknown): SchemaColumn[] {
  if (!isRecord(returnType)) return [];
  const custom =
    returnType.data_type === "custom" && typeof returnType.name === "string"
      ? returnType.name
      : undefined;
  const match = custom?.match(/^table\s*\(([\s\S]*)\)$/i);
  return columnsFromSchemaString(match?.[1]);
}

function cloneOutputItems(items: OutputItem[]): OutputItem[] {
  return items.map((item) => ({ ...item }));
}

function tableFromCreateFunctionReturnTable(
  name: string,
  createFunction: Record<string, unknown>,
): SchemaTable | undefined {
  const body =
    typeof createFunction.returns_table_body === "string"
      ? createFunction.returns_table_body
      : undefined;
  if (!body) return undefined;
  const match = body.match(/^table\s*\(([\s\S]*)\)$/i);
  const columns = columnsFromSchemaString(match?.[1]);
  return columns.length > 0 ? { name, columns } : undefined;
}

function rememberTypeDefinition(statement: unknown, context: StatementContext): void {
  if (!isRecord(statement) || !isRecord(statement.create_type)) return;
  const name = relationNameFromRef(statement.create_type.name);
  const type = typeFromCreateTypeDefinition(statement.create_type.definition);
  if (name && type) context.typeAliases.set(name.toLowerCase(), type);
}

function typeFromCreateTypeDefinition(definition: unknown): string | undefined {
  if (!isRecord(definition)) return undefined;
  const domain = isRecord(definition.Domain) ? definition.Domain : undefined;
  if (domain) return dataTypeToString(domain.base_type);
  if (Array.isArray(definition.Enum)) return "text";
  if (Array.isArray(definition.Composite)) {
    const fields = definition.Composite.flatMap((field) => {
      if (!isRecord(field)) return [];
      const name = identifierName(field.name);
      const type = dataTypeToString(field.data_type) ?? "unknown";
      return name ? [`${name} ${type}`] : [];
    });
    return `struct<${fields.join(", ")}>`;
  }
  return undefined;
}

function dataTypeToStringWithAliases(
  dataType: unknown,
  context?: StatementContext,
): string | undefined {
  const type = dataTypeToString(dataType);
  if (!type || !context) return type;
  return context.typeAliases.get(type.toLowerCase()) ?? type;
}

function forgetPreparedStatement(statement: unknown, context: StatementContext): void {
  if (!isRecord(statement) || !isRecord(statement.command)) return;
  const command = String(statement.command.this ?? "").trim();
  const match = command.match(/^deallocate(?:\s+prepare)?(?:\s+(.+))?$/i);
  if (!match) return;
  const name = match[1]?.trim();
  if (!name || /^all$/i.test(name)) {
    context.prepared.clear();
    return;
  }
  context.prepared.delete(cleanIdentifier(name).toLowerCase());
}

function forgetRoutineDefinition(statement: unknown, context: StatementContext): void {
  if (!isRecord(statement)) return;
  if (isRecord(statement.drop_function)) {
    deleteRoutineKeys(context.functionReturnTypes, routineDropKeys(statement.drop_function.name));
  }
  if (isRecord(statement.drop_procedure)) {
    deleteRoutineKeys(context.procedureResultSets, routineDropKeys(statement.drop_procedure.name));
  }
}

function routineDropKeys(nameRef: unknown): string[] {
  const name = relationNameFromRef(nameRef)?.toLowerCase();
  if (!name) return [];
  const schema = isRecord(nameRef) ? identifierName(nameRef.schema)?.toLowerCase() : undefined;
  return schema ? [`${schema}.${name}`, name] : [name];
}

function deleteRoutineKeys<T>(map: Map<string, T>, keys: string[]): void {
  for (const key of keys) {
    map.delete(key);
    if (!key.includes(".")) {
      for (const existing of [...map.keys()]) {
        if (existing.endsWith(`.${key}`)) map.delete(existing);
      }
    }
  }
}

function outputItemsFromExecute(
  execute: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
  dialect = "generic",
): OutputItem[] {
  const staticColumns = staticExecuteColumns(execute, dialect);
  if (staticColumns.length > 0) return staticColumns;
  const name = executeName(execute);
  const prepared = name ? context.prepared.get(name.toLowerCase()) : undefined;
  if (prepared) return outputItemsForStatement(prepared, schema, context, dialect);
  const procedure = name ? context.procedureResultSets.get(name.toLowerCase()) : undefined;
  return procedure ? cloneOutputItems(procedure) : [];
}

function staticExecuteColumns(execute: Record<string, unknown>, dialect: string): OutputItem[] {
  const declaredColumns = executeResultSetColumns(execute);
  if (declaredColumns.length > 0) return declaredColumns;

  const name = executeName(execute)?.toLowerCase();
  return staticProcedureColumns(name, dialect);
}

function staticBareProcedureColumns(statement: unknown, dialect: string): OutputItem[] {
  if (!isRecord(statement)) return [];
  const column = getAst(statement, "column");
  if (isRecord(column) && !identifierName(column.table)) {
    const procedure = identifierName(column.name)?.toLowerCase();
    const columns = staticProcedureColumns(procedure, dialect);
    if (columns.length > 0) return columns;
  }
  const alias = getAst(statement, "alias");
  if (!isRecord(alias)) return [];
  const procedure = identifierName(alias.this)?.toLowerCase();
  return staticProcedureColumns(procedure, dialect);
}

function staticProcedureColumns(name: string | undefined, dialect: string): OutputItem[] {
  const columns = procedureResultColumnConfigs(name, dialect);
  return columns ? staticConfigColumns(columns) : [];
}

function executeResultSetColumns(execute: Record<string, unknown>): OutputItem[] {
  const suffix = typeof execute.suffix === "string" ? execute.suffix : undefined;
  if (!suffix) return [];
  const match = suffix.match(/\bwith\s+result\s+sets\s*\(\s*\((.*)\)\s*\)\s*$/i);
  if (!match) return [];
  return splitTopLevel(match[1], ",").flatMap((part) => {
    const definition = part.trim();
    const column = definition.match(/^([`"[\]\w@$#]+)\s+(.+)$/);
    if (!column) return [];
    const name = cleanIdentifier(column[1].replace(/^\[/, "").replace(/\]$/, ""));
    const type = dataTypeFromRawColumnSpec(column[2]) ?? "unknown";
    return name ? staticColumns([[name, type]]) : [];
  });
}

function commandProcedureName(command: string | undefined): string | undefined {
  if (!command) return undefined;
  const match = command.trim().match(/^(?:call|exec(?:ute)?)\s+([^\s(;]+)/i);
  return match ? cleanIdentifier(match[1]).toLowerCase() : undefined;
}

function outputItemsFromDescribe(
  describe: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
  dialect = "generic",
): OutputItem[] {
  const target = isRecord(describe.target) ? describe.target : undefined;
  if (String(describe.kind ?? "").toLowerCase() === "function")
    return describeFunctionColumns(dialect);
  if (!target) return [];
  const styled = describeStyleColumns(String(describe.style ?? "").toLowerCase());
  if (styled.length > 0) return styled;
  const describeTable = describeTableColumns(describe, target);
  if (describeTable.length > 0) return describeTable;
  const snowflakeObject = snowflakeDescribeObjectColumns(target, dialect);
  if (snowflakeObject.length > 0) return snowflakeObject;
  const genericObject = describeObjectColumns(target);
  if (genericObject.length > 0) return genericObject;
  if (isRecord(target.table)) {
    const tableName = identifierName(target.table.name)?.toLowerCase();
    const configuredDescribeTable = getDialectConfig(dialect).metadata.describeTableResultColumns;
    if (
      configuredDescribeTable &&
      tableName &&
      !["database", "schema", "namespace", "catalog", "extended", "formatted"].includes(tableName)
    ) {
      return staticConfigColumns(configuredDescribeTable);
    }
  }
  if (isRecord(target.table)) return outputItemsFromDescribedTable(target.table, schema);
  if (isResultProducingQuery(target)) return explainColumns(dialect);
  return outputItemsForStatement(target, schema, context, dialect);
}

function describeTableColumns(
  describe: Record<string, unknown>,
  target: Record<string, unknown>,
): OutputItem[] {
  if (String(describe.kind ?? "").toLowerCase() !== "table" || !isRecord(target.table)) return [];
  const targetName = identifierName(target.table.name)?.toLowerCase();
  if (!["extended", "formatted"].includes(targetName ?? "")) return [];
  return staticColumns([
    ["col_name", "text"],
    ["data_type", "text"],
    ["comment", "text"],
  ]);
}

function describeStyleColumns(style: string): OutputItem[] {
  if (style === "detail") {
    return staticColumns([
      ["format", "text"],
      ["id", "text"],
      ["name", "text"],
      ["description", "text"],
      ["location", "text"],
      ["createdAt", "timestamp"],
      ["lastModified", "timestamp"],
      ["partitionColumns", "array<text>"],
      ["numFiles", "integer"],
      ["sizeInBytes", "integer"],
      ["properties", "map<text, text>"],
    ]);
  }
  if (style === "history") {
    return staticColumns([
      ["version", "integer"],
      ["timestamp", "timestamp"],
      ["userId", "text"],
      ["userName", "text"],
      ["operation", "text"],
      ["operationParameters", "map<text, text>"],
      ["job", "text"],
      ["notebook", "text"],
      ["clusterId", "text"],
      ["readVersion", "integer"],
      ["isolationLevel", "text"],
      ["isBlindAppend", "boolean"],
      ["operationMetrics", "map<text, text>"],
    ]);
  }
  return [];
}

function describeObjectColumns(target: Record<string, unknown>): OutputItem[] {
  if (!isRecord(target.table)) return [];
  const name = identifierName(target.table.name)?.toLowerCase();
  if (name === "catalog") {
    return staticColumns([
      ["info_name", "text"],
      ["info_value", "text"],
    ]);
  }
  if (name === "database" || name === "schema" || name === "namespace") {
    return staticColumns([
      ["database_description_item", "text"],
      ["database_description_value", "text"],
    ]);
  }
  return [];
}

function snowflakeDescribeObjectColumns(
  target: Record<string, unknown>,
  dialect: string,
): OutputItem[] {
  if (!isRecord(target.table)) return [];
  const configuredColumns = getDialectConfig(dialect).metadata.snowflakeDescribeObjectColumns;
  if (Object.keys(configuredColumns).length === 0) return [];
  const name = identifierName(target.table.name)?.toLowerCase();
  const columns = name ? configuredColumns[name] : undefined;
  return columns ? staticConfigColumns(columns) : [];
}

function describeFunctionColumns(dialect: string): OutputItem[] {
  return staticConfigColumns(getDialectConfig(dialect).metadata.describeFunctionColumns);
}

function explainColumns(dialect: string): OutputItem[] {
  return staticConfigColumns(getDialectConfig(dialect).metadata.explainColumns);
}

function isResultProducingQuery(statement: Record<string, unknown>): boolean {
  return ["select", "values", "union", "intersect", "except"].some((key) =>
    isRecord(statement[key]),
  );
}

function outputItemsFromShow(show: Record<string, unknown>, dialect = "generic"): OutputItem[] {
  const subject = String(show.this ?? "").toLowerCase();
  const configuredShowColumns = commandResultColumnConfigs(`show ${subject}`, dialect);
  if (configuredShowColumns) return staticConfigColumns(configuredShowColumns);
  const normalizedSubject = subject.replace(/^(?:global|session|full)\s+/, "");
  if (subject === "tables" || subject === "views" || subject === "full tables") {
    const configuredTablesColumns =
      subject === "tables" ? getDialectConfig(dialect).metadata.showTablesColumns : undefined;
    if (configuredTablesColumns) return staticConfigColumns(configuredTablesColumns);
    return staticColumns([
      [subject === "views" ? "View" : "Table", "text"],
      ...(subject === "full tables"
        ? ([["Table_type", "text"]] satisfies Array<[string, string]>)
        : []),
    ]);
  }
  if (subject === "databases" || subject === "schemas") {
    const configuredDatabasesColumns =
      subject === "databases"
        ? getDialectConfig(dialect).metadata.showDatabasesColumns
        : undefined;
    if (configuredDatabasesColumns) return staticConfigColumns(configuredDatabasesColumns);
    return staticColumns([[subject === "schemas" ? "Schema" : "Database", "text"]]);
  }
  if (normalizedSubject === "variables" || normalizedSubject === "status") {
    return staticColumns([
      ["Variable_name", "text"],
      ["Value", "text"],
    ]);
  }
  if (subject === "all") {
    return staticColumns([
      ["name", "text"],
      ["setting", "text"],
      ["description", "text"],
    ]);
  }
  if (subject === "transaction isolation level") {
    return staticColumns([["transaction_isolation", "text"]]);
  }
  if (subject === "catalogs") {
    return staticColumns([["Catalog", "text"]]);
  }
  if (subject === "current namespace" || subject === "namespaces") {
    const configuredNamespaceColumns =
      subject === "current namespace"
        ? getDialectConfig(dialect).metadata.showCurrentNamespaceColumns
        : getDialectConfig(dialect).metadata.showNamespacesColumns;
    if (configuredNamespaceColumns) return staticConfigColumns(configuredNamespaceColumns);
    return staticColumns([["namespace", "text"]]);
  }
  if (subject === "authors" || subject === "contributors") {
    return staticColumns([
      ["Name", "text"],
      ["Location", "text"],
      ["Comment", "text"],
    ]);
  }
  if (subject.startsWith("table ") || subject === "all tables") {
    const columns = getDialectConfig(dialect).metadata.showTableListingColumns;
    return columns ? staticConfigColumns(columns) : [];
  }
  if (subject === "warnings" || subject === "errors") {
    return staticColumns([
      ["Level", "text"],
      ["Code", "integer"],
      ["Message", "text"],
    ]);
  }
  if (subject === "grants") {
    if (isDialectFamily(dialect, "mysql")) {
      return staticColumns([["Grants", "text"]]);
    }
    return staticColumns([
      ["created_on", "timestamp"],
      ["privilege", "text"],
      ["granted_on", "text"],
      ["name", "text"],
      ["granted_to", "text"],
      ["grantee_name", "text"],
      ["grant_option", "boolean"],
      ["granted_by", "text"],
    ]);
  }
  if (subject === "future grants") return outputItemsFromShow({ this: "grants" }, dialect);
  if (subject === "engines") {
    return staticColumns([
      ["Engine", "text"],
      ["Support", "text"],
      ["Comment", "text"],
      ["Transactions", "text"],
      ["XA", "text"],
      ["Savepoints", "text"],
    ]);
  }
  if (subject === "storage engines") {
    return outputItemsFromShow({ this: "engines" }, dialect);
  }
  if (subject === "engine" || subject.startsWith("engine ")) {
    return staticColumns([
      ["Type", "text"],
      ["Name", "text"],
      ["Status", "text"],
    ]);
  }
  if (normalizedSubject === "processlist") {
    return staticColumns([
      ["Id", "integer"],
      ["User", "text"],
      ["Host", "text"],
      ["db", "text"],
      ["Command", "text"],
      ["Time", "integer"],
      ["State", "text"],
      ["Info", "text"],
    ]);
  }
  if (subject === "privileges") {
    return staticColumns([
      ["Privilege", "text"],
      ["Context", "text"],
      ["Comment", "text"],
    ]);
  }
  if (
    subject === "character set" ||
    subject === "character sets" ||
    subject === "charset" ||
    subject === "charsets"
  ) {
    return staticColumns([
      ["Charset", "text"],
      ["Description", "text"],
      ["Default collation", "text"],
      ["Maxlen", "integer"],
    ]);
  }
  if (subject === "collation" || subject === "collations") {
    return staticColumns([
      ["Collation", "text"],
      ["Charset", "text"],
      ["Id", "integer"],
      ["Default", "text"],
      ["Compiled", "text"],
      ["Sortlen", "integer"],
    ]);
  }
  if (subject === "table status") {
    return staticColumns([
      ["Name", "text"],
      ["Engine", "text"],
      ["Version", "integer"],
      ["Row_format", "text"],
      ["Rows", "integer"],
      ["Avg_row_length", "integer"],
      ["Data_length", "integer"],
      ["Max_data_length", "integer"],
      ["Index_length", "integer"],
      ["Data_free", "integer"],
      ["Auto_increment", "integer"],
      ["Create_time", "timestamp"],
      ["Update_time", "timestamp"],
      ["Check_time", "timestamp"],
      ["Collation", "text"],
      ["Checksum", "integer"],
      ["Create_options", "text"],
      ["Comment", "text"],
    ]);
  }
  if (subject === "open tables") {
    return staticColumns([
      ["Database", "text"],
      ["Table", "text"],
      ["In_use", "integer"],
      ["Name_locked", "integer"],
    ]);
  }
  if (subject === "triggers") {
    return staticColumns([
      ["Trigger", "text"],
      ["Event", "text"],
      ["Table", "text"],
      ["Statement", "text"],
      ["Timing", "text"],
      ["Created", "timestamp"],
      ["sql_mode", "text"],
      ["Definer", "text"],
      ["character_set_client", "text"],
      ["collation_connection", "text"],
      ["Database Collation", "text"],
    ]);
  }
  if (subject === "events") {
    return staticColumns([
      ["Db", "text"],
      ["Name", "text"],
      ["Definer", "text"],
      ["Time zone", "text"],
      ["Type", "text"],
      ["Execute at", "timestamp"],
      ["Interval value", "text"],
      ["Interval field", "text"],
      ["Starts", "timestamp"],
      ["Ends", "timestamp"],
      ["Status", "text"],
      ["Originator", "integer"],
      ["character_set_client", "text"],
      ["collation_connection", "text"],
      ["Database Collation", "text"],
    ]);
  }
  if (subject.startsWith("procedure code") || subject.startsWith("function code")) {
    return staticColumns([
      ["Pos", "integer"],
      ["Instruction", "text"],
    ]);
  }
  if (subject === "plugins") {
    return staticColumns([
      ["Name", "text"],
      ["Status", "text"],
      ["Type", "text"],
      ["Library", "text"],
      ["License", "text"],
    ]);
  }
  if (subject === "function status" || subject === "procedure status") {
    return staticColumns([
      ["Db", "text"],
      ["Name", "text"],
      ["Type", "text"],
      ["Definer", "text"],
      ["Modified", "timestamp"],
      ["Created", "timestamp"],
      ["Security_type", "text"],
      ["Comment", "text"],
      ["character_set_client", "text"],
      ["collation_connection", "text"],
      ["Database Collation", "text"],
    ]);
  }
  if (subject === "binary logs" || subject === "binlogs") {
    return staticColumns([
      ["Log_name", "text"],
      ["File_size", "integer"],
      ["Encrypted", "text"],
    ]);
  }
  if (subject === "master status" || subject === "binary log status") {
    return staticColumns([
      ["File", "text"],
      ["Position", "integer"],
      ["Binlog_Do_DB", "text"],
      ["Binlog_Ignore_DB", "text"],
      ["Executed_Gtid_Set", "text"],
    ]);
  }
  if (subject === "master logs") {
    return outputItemsFromShow({ this: "binary logs" }, dialect);
  }
  if (subject === "relaylog events" || subject === "binlog events") {
    return staticColumns([
      ["Log_name", "text"],
      ["Pos", "integer"],
      ["Event_type", "text"],
      ["Server_id", "integer"],
      ["End_log_pos", "integer"],
      ["Info", "text"],
    ]);
  }
  if (subject === "slave status" || subject === "replica status") {
    return staticColumns([
      ["Slave_IO_State", "text"],
      ["Master_Host", "text"],
      ["Master_User", "text"],
      ["Master_Port", "integer"],
      ["Connect_Retry", "integer"],
      ["Master_Log_File", "text"],
      ["Read_Master_Log_Pos", "integer"],
      ["Relay_Log_File", "text"],
      ["Relay_Log_Pos", "integer"],
      ["Relay_Master_Log_File", "text"],
      ["Slave_IO_Running", "text"],
      ["Slave_SQL_Running", "text"],
      ["Last_Errno", "integer"],
      ["Last_Error", "text"],
      ["Seconds_Behind_Master", "integer"],
    ]);
  }
  if (subject === "replicas") {
    return staticColumns([
      ["Server_Id", "integer"],
      ["Host", "text"],
      ["Port", "integer"],
      ["Source_Id", "integer"],
      ["Replica_UUID", "text"],
    ]);
  }
  if (subject === "slave hosts" || subject === "replica hosts") {
    return staticColumns([
      ["Server_id", "integer"],
      ["Host", "text"],
      ["Port", "integer"],
      ["Master_id", "integer"],
      ["Slave_UUID", "text"],
    ]);
  }
  if (subject === "profiles") {
    return staticColumns([
      ["Query_ID", "integer"],
      ["Duration", "decimal"],
      ["Query", "text"],
    ]);
  }
  if (subject === "profile") {
    return staticColumns([
      ["Status", "text"],
      ["Duration", "decimal"],
    ]);
  }
  if (subject.startsWith("profile ")) return outputItemsFromShow({ this: "profile" }, dialect);
  if (subject === "parameters") {
    return staticColumns([
      ["key", "text"],
      ["value", "text"],
      ["default", "text"],
      ["level", "text"],
      ["description", "text"],
      ["type", "text"],
    ]);
  }
  if (subject === "warehouses") {
    return staticColumns([
      ["name", "text"],
      ["state", "text"],
      ["type", "text"],
      ["size", "text"],
      ["min_cluster_count", "integer"],
      ["max_cluster_count", "integer"],
      ["started_clusters", "integer"],
      ["running", "integer"],
      ["queued", "integer"],
      ["is_default", "boolean"],
      ["is_current", "boolean"],
      ["auto_suspend", "integer"],
      ["auto_resume", "boolean"],
    ]);
  }
  if (subject === "compute pools") {
    return staticColumns([
      ["name", "text"],
      ["state", "text"],
      ["min_nodes", "integer"],
      ["max_nodes", "integer"],
      ["instance_family", "text"],
      ["num_services", "integer"],
      ["num_jobs", "integer"],
      ["auto_resume", "boolean"],
      ["auto_suspend_secs", "integer"],
      ["comment", "text"],
    ]);
  }
  if (subject === "stages") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["url", "text"],
      ["has_credentials", "boolean"],
      ["has_encryption_key", "boolean"],
      ["owner", "text"],
      ["comment", "text"],
      ["region", "text"],
      ["type", "text"],
    ]);
  }
  if (subject === "external tables") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["owner", "text"],
      ["comment", "text"],
      ["location", "text"],
      ["file_format_name", "text"],
    ]);
  }
  if (subject === "sequences") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["next_value", "integer"],
      ["interval", "integer"],
      ["owner", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "materialized views") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["cluster_by", "text"],
      ["rows", "integer"],
      ["bytes", "integer"],
      ["owner", "text"],
      ["comment", "text"],
    ]);
  }
  if (["masking policies", "row access policies", "network policies"].includes(subject)) {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["owner", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "resource monitors") {
    return staticColumns([
      ["name", "text"],
      ["credit_quota", "decimal"],
      ["used_credits", "decimal"],
      ["remaining_credits", "decimal"],
      ["level", "text"],
      ["frequency", "text"],
    ]);
  }
  if (subject === "transactions") {
    return staticColumns([
      ["id", "integer"],
      ["user", "text"],
      ["session", "integer"],
      ["started_on", "timestamp"],
      ["state", "text"],
    ]);
  }
  if (subject === "locks") {
    return staticColumns([
      ["resource", "text"],
      ["type", "text"],
      ["transaction", "integer"],
      ["status", "text"],
      ["acquired_on", "timestamp"],
    ]);
  }
  if (subject === "constraints") {
    return staticColumns([
      ["table_name", "text"],
      ["constraint_name", "text"],
      ["constraint_type", "text"],
      ["details", "text"],
      ["validated", "boolean"],
    ]);
  }
  if (subject === "jobs") {
    return staticColumns([
      ["job_id", "integer"],
      ["job_type", "text"],
      ["description", "text"],
      ["statement", "text"],
      ["user_name", "text"],
      ["status", "text"],
      ["created", "timestamp"],
      ["finished", "timestamp"],
      ["fraction_completed", "decimal"],
    ]);
  }
  if (subject === "clusters") {
    return staticColumns([
      ["name", "text"],
      ["replicas", "integer"],
      ["size", "text"],
      ["availability_zones", "text"],
      ["managed", "boolean"],
    ]);
  }
  if (subject === "sources" || subject === "sinks") {
    return staticColumns([
      ["name", "text"],
      ["schema", "text"],
      ["type", "text"],
      ["owner", "text"],
      ["cluster", "text"],
    ]);
  }
  if (subject === "pipelines") {
    return staticColumns([
      ["Database", "text"],
      ["Pipeline", "text"],
      ["State", "text"],
      ["Source_Type", "text"],
      ["Config_JSON", "text"],
    ]);
  }
  if (subject === "files") {
    return staticColumns([
      ["name", "text"],
      ["isDirectory", "boolean"],
      ["isFile", "boolean"],
      ["length", "integer"],
      ["owner", "text"],
      ["group", "text"],
      ["permissions", "text"],
      ["accessTime", "timestamp"],
      ["modificationTime", "timestamp"],
    ]);
  }
  if (subject === "primary keys" || subject === "imported keys" || subject === "unique keys") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["table_name", "text"],
      ["column_name", "text"],
      ["key_sequence", "integer"],
      ["constraint_name", "text"],
    ]);
  }
  if (subject === "stats") {
    return staticColumns([
      ["column_name", "text"],
      ["data_size", "integer"],
      ["distinct_values_count", "integer"],
      ["nulls_fraction", "decimal"],
      ["row_count", "integer"],
      ["low_value", "text"],
      ["high_value", "text"],
    ]);
  }
  if (subject === "file formats") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["type", "text"],
      ["owner", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "pipes") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["definition", "text"],
      ["owner", "text"],
      ["notification_channel", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "image repositories") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["repository_url", "text"],
      ["owner", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "network rules") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["type", "text"],
      ["mode", "text"],
      ["value_list", "text"],
      ["owner", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "secrets") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["secret_type", "text"],
      ["owner", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "roles") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["is_default", "boolean"],
      ["is_current", "boolean"],
      ["is_inherited", "boolean"],
      ["assigned_to_users", "integer"],
      ["granted_to_roles", "integer"],
      ["granted_roles", "integer"],
      ["owner", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "users") {
    return staticColumns([
      ["name", "text"],
      ["created_on", "timestamp"],
      ["login_name", "text"],
      ["display_name", "text"],
      ["first_name", "text"],
      ["last_name", "text"],
      ["email", "text"],
      ["mins_to_unlock", "integer"],
      ["days_to_expiry", "integer"],
      ["comment", "text"],
    ]);
  }
  if (subject === "shares") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["kind", "text"],
      ["name", "text"],
      ["database_name", "text"],
      ["to", "text"],
      ["owner", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "integrations") {
    return staticColumns([
      ["name", "text"],
      ["type", "text"],
      ["category", "text"],
      ["enabled", "boolean"],
      ["comment", "text"],
      ["created_on", "timestamp"],
    ]);
  }
  if (subject === "streams") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["owner", "text"],
      ["table_name", "text"],
      ["source_type", "text"],
      ["base_tables", "text"],
      ["type", "text"],
      ["stale", "boolean"],
      ["mode", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "dynamic tables") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["cluster_by", "text"],
      ["rows", "integer"],
      ["bytes", "integer"],
      ["owner", "text"],
      ["target_lag", "text"],
      ["warehouse", "text"],
      ["scheduling_state", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "notebooks" || subject === "alerts") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["owner", "text"],
      ["comment", "text"],
    ]);
  }
  if (subject === "tasks") {
    return staticColumns([
      ["created_on", "timestamp"],
      ["name", "text"],
      ["id", "text"],
      ["database_name", "text"],
      ["schema_name", "text"],
      ["owner", "text"],
      ["comment", "text"],
      ["warehouse", "text"],
      ["schedule", "text"],
      ["state", "text"],
      ["definition", "text"],
      ["condition", "text"],
    ]);
  }
  if (subject === "functions" || subject === "procedures") {
    const configuredFunctionsColumns =
      subject === "functions" ? getDialectConfig(dialect).metadata.showFunctionsColumns : undefined;
    if (configuredFunctionsColumns) return staticConfigColumns(configuredFunctionsColumns);
    return staticColumns([
      [subject === "functions" ? "Function" : "Procedure", "text"],
      ["Type", "text"],
      ["Definer", "text"],
      ["Modified", "timestamp"],
      ["Created", "timestamp"],
      ["Security_type", "text"],
      ["Comment", "text"],
    ]);
  }
  if (subject === "columns" || subject === "full columns") {
    const configuredColumns = getDialectConfig(dialect).metadata.showColumnsColumns;
    if (configuredColumns) return staticConfigColumns(configuredColumns);
    return staticColumns([
      ["Field", "text"],
      ["Type", "text"],
      ["Null", "text"],
      ["Key", "text"],
      ["Default", "text"],
      ["Extra", "text"],
      ...(subject === "full columns"
        ? ([
            ["Collation", "text"],
            ["Privileges", "text"],
            ["Comment", "text"],
          ] satisfies Array<[string, string]>)
        : []),
    ]);
  }
  if (subject === "index" || subject === "indexes" || subject === "keys") {
    return staticColumns([
      ["Table", "text"],
      ["Non_unique", "integer"],
      ["Key_name", "text"],
      ["Seq_in_index", "integer"],
      ["Column_name", "text"],
      ["Collation", "text"],
      ["Cardinality", "integer"],
      ["Sub_part", "integer"],
      ["Packed", "text"],
      ["Null", "text"],
      ["Index_type", "text"],
      ["Comment", "text"],
      ["Index_comment", "text"],
    ]);
  }
  if (subject.startsWith("create schema")) {
    if (isDialectFamily(dialect, "mysql")) {
      return staticColumns([
        ["Database", "text"],
        ["Create Database", "text"],
      ]);
    }
    return staticColumns([["Create Schema", "text"]]);
  }
  if (subject.startsWith("create database") && isDialectFamily(dialect, "mysql")) {
    return staticColumns([
      ["Database", "text"],
      ["Create Database", "text"],
    ]);
  }
  if (subject.startsWith("create table") || subject.startsWith("create view")) {
    return staticColumns([
      ["Table", "text"],
      [
        showCreateStatementColumnName(
          subject.match(/^create\s+(table|view|schema)/)?.[0] ?? subject,
        ),
        "text",
      ],
    ]);
  }
  if (/^create\s+(?:database|event|function|procedure|trigger|user)\b/.test(subject)) {
    const createSubject =
      subject.match(/^create\s+(database|event|function|procedure|trigger|user)\b/)?.[0] ?? subject;
    return staticColumns([
      ["Object", "text"],
      [showCreateStatementColumnName(createSubject), "text"],
    ]);
  }
  if (subject === "partitions" || subject.startsWith("partitions ")) {
    return staticColumns([["partition", "text"]]);
  }
  if (subject === "tblproperties" || subject.startsWith("tblproperties ")) {
    return staticColumns([
      ["key", "text"],
      ["value", "text"],
    ]);
  }
  if (/^[a-z_][a-z0-9_]*$/i.test(subject)) {
    return staticColumns([[subject, "text"]]);
  }
  return [];
}

function outputItemsFromSummarize(): OutputItem[] {
  return staticColumns([
    ["column_name", "text"],
    ["column_type", "text"],
    ["min", "text"],
    ["max", "text"],
    ["approx_unique", "integer"],
    ["avg", "text"],
    ["std", "text"],
    ["q25", "text"],
    ["q50", "text"],
    ["q75", "text"],
    ["count", "integer"],
    ["null_percentage", "decimal"],
  ]);
}

function outputItemsFromAnalyze(analyze: Record<string, unknown>): OutputItem[] {
  return String(analyze.kind ?? "").toLowerCase() === "table" || isRecord(analyze.this)
    ? tableMaintenanceStatusColumns()
    : [];
}

function outputItemsFromCommand(
  command: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
  dialect: string,
): OutputItem[] {
  const text = String(command.this ?? "").toLowerCase();
  const immediate = outputItemsFromExecuteImmediateCommand(command, schema, context, dialect);
  if (immediate.length > 0) return immediate;
  const blockStart = outputItemsFromBeginSelectCommand(command, schema, context, dialect);
  if (blockStart.length > 0) return blockStart;
  const procedure = context.procedureResultSets.get(commandProcedureName(text) ?? "");
  if (procedure) return cloneOutputItems(procedure);
  const procedureColumns = staticProcedureColumns(commandProcedureName(text), dialect);
  if (procedureColumns.length > 0) return procedureColumns;
  if (/^(optimize|repair|check|checksum)\s+table\b/.test(text))
    return tableMaintenanceStatusColumns();
  const configuredCommandColumns = commandResultColumns(text, dialect);
  if (configuredCommandColumns.length > 0) return configuredCommandColumns;
  if (/^exists\s+(?:table|database|view|dictionary)\b/.test(text))
    return staticColumns([["result", "boolean"]]);
  if (/^explain\b/.test(text)) return explainColumns(dialect);
  if (/^show\s+engines\b/.test(text))
    return staticColumns([
      ["name", "text"],
      ["value", "text"],
      ["comment", "text"],
    ]);
  if (/^show\s+functions\b/.test(text)) {
    const configuredColumns = getDialectConfig(dialect).metadata.showFunctionsColumns;
    if (configuredColumns) return staticConfigColumns(configuredColumns);
    return staticColumns([["name", "text"]]);
  }
  if (/^show\s+databases\b/.test(text)) return outputItemsFromShow({ this: "databases" });
  if (/^show\s+schemas\b/.test(text)) return outputItemsFromShow({ this: "schemas" });
  if (/^show\s+tables\b/.test(text)) return outputItemsFromShow({ this: "tables" });
  if (/^show\s+views\b/.test(text)) return outputItemsFromShow({ this: "views" });
  if (/^show\s+materialized\s+views\b/.test(text))
    return outputItemsFromShow({ this: "materialized views" });
  if (/^show\s+table\b/.test(text)) return outputItemsFromShow({ this: "tables" });
  if (/^show\s+columns\b/.test(text)) return outputItemsFromShow({ this: "columns" });
  if (/^show\s+indexes\b/.test(text)) return outputItemsFromShow({ this: "indexes" });
  if (/^show\s+variables\b/.test(text)) return outputItemsFromShow({ this: "variables" });
  if (/^show\s+catalogs\b/.test(text)) return outputItemsFromShow({ this: "catalogs" });
  if (/^show\s+current\s+namespace\b/.test(text))
    return outputItemsFromShow({ this: "current namespace" });
  if (/^show\s+create\s+(?:table|database|dictionary|view)\b/.test(text)) {
    return staticColumns([["statement", "text"]]);
  }
  if (/^show\s+named\s+collections\b/.test(text)) {
    return staticColumns([
      ["name", "text"],
      ["collection", "text"],
    ]);
  }
  if (/^show\s+row\s+polic(?:y|ies)\b/.test(text)) {
    return staticColumns([
      ["name", "text"],
      ["short_name", "text"],
      ["database", "text"],
      ["table", "text"],
      ["condition", "text"],
    ]);
  }
  if (/^show\s+quotas\b/.test(text)) {
    return staticColumns([
      ["name", "text"],
      ["id", "uuid"],
      ["storage", "text"],
      ["keys", "text"],
    ]);
  }
  if (/^show\s+quota\s+usage\b/.test(text)) {
    return staticColumns([
      ["quota_name", "text"],
      ["duration", "text"],
      ["queries", "integer"],
      ["errors", "integer"],
      ["result_rows", "integer"],
      ["read_rows", "integer"],
    ]);
  }
  if (/^show\s+access\b/.test(text)) return staticColumns([["ACCESS", "text"]]);
  if (/^show\s+privileges\b/.test(text)) {
    return staticColumns([
      ["privilege", "text"],
      ["parent_group", "text"],
      ["description", "text"],
    ]);
  }
  if (/^show\s+processlist\b/.test(text)) {
    return staticColumns([
      ["user", "text"],
      ["address", "text"],
      ["elapsed", "integer"],
      ["read_rows", "integer"],
      ["read_bytes", "integer"],
      ["total_rows_approx", "integer"],
      ["memory_usage", "integer"],
      ["query", "text"],
      ["query_id", "text"],
    ]);
  }
  if (/^(?:describe|desc)(?:\s+table)?\s+\S+/.test(text)) {
    return staticColumns([
      ["name", "text"],
      ["type", "text"],
      ["default_type", "text"],
      ["default_expression", "text"],
      ["comment", "text"],
      ["codec_expression", "text"],
      ["ttl_expression", "text"],
    ]);
  }
  if (/^help\s+table\b/.test(text)) {
    return staticColumns([
      ["Column Name", "text"],
      ["Type", "text"],
      ["Nullable", "text"],
      ["Format", "text"],
      ["Title", "text"],
      ["Max Length", "integer"],
      ["Decimal Total Digits", "integer"],
      ["Decimal Fractional Digits", "integer"],
    ]);
  }
  if (/^help\s+database\b/.test(text)) {
    return staticColumns([
      ["Database Name", "text"],
      ["Owner Name", "text"],
      ["Account Name", "text"],
      ["Protection Type", "text"],
      ["Journal Flag", "text"],
      ["Perm Space", "integer"],
      ["Spool Space", "integer"],
      ["Temp Space", "integer"],
    ]);
  }
  if (/^help\s+column\b/.test(text)) {
    return staticColumns([
      ["Column Name", "text"],
      ["Type", "text"],
      ["Nullable", "text"],
      ["Format", "text"],
      ["Title", "text"],
      ["Max Length", "integer"],
      ["Decimal Total Digits", "integer"],
      ["Decimal Fractional Digits", "integer"],
    ]);
  }
  return [];
}

function outputItemsFromExecuteImmediateCommand(
  command: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
  dialect: string,
): OutputItem[] {
  const sql = executeImmediateSql(String(command.this ?? ""));
  if (!sql) return [];
  try {
    const parsed = parse(sql, dialect as never) as PolyglotParseResult;
    if (!parsed.success) return [];
    const statements = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];
    const statement = statements.find(isRecord);
    return statement ? outputItemsForStatement(statement, schema, context, dialect) : [];
  } catch {
    return [];
  }
}

function outputItemsFromBeginSelectCommand(
  command: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
  dialect: string,
): OutputItem[] {
  const sql = String(command.this ?? "")
    .trim()
    .replace(/^begin\s+/i, "");
  if (!/^select\b/i.test(sql)) return [];
  try {
    const parsed = parse(sql, dialect as never) as PolyglotParseResult;
    if (!parsed.success) return [];
    const statements = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];
    const statement = statements.find(isRecord);
    return statement ? outputItemsForStatement(statement, schema, context, dialect) : [];
  } catch {
    return [];
  }
}

function executeImmediateSql(command: string): string | undefined {
  const match = command.match(/^execute\s+immediate\s+'((?:''|[^'])*)'/i);
  return match ? match[1].replace(/''/g, "'") : undefined;
}

function outputItemsFromPut(): OutputItem[] {
  return staticColumns([
    ["source", "text"],
    ["target", "text"],
    ["source_size", "integer"],
    ["target_size", "integer"],
    ["source_compression", "text"],
    ["target_compression", "text"],
    ["status", "text"],
    ["message", "text"],
  ]);
}

function tableMaintenanceStatusColumns(): OutputItem[] {
  return staticColumns([
    ["Table", "text"],
    ["Op", "text"],
    ["Msg_type", "text"],
    ["Msg_text", "text"],
  ]);
}

function showCreateStatementColumnName(subject: string): string {
  if (subject === "create database") return "Create Database";
  if (subject === "create event") return "Create Event";
  if (subject === "create function") return "Create Function";
  if (subject === "create procedure") return "Create Procedure";
  if (subject === "create schema") return "Create Schema";
  if (subject === "create trigger") return "Create Trigger";
  if (subject === "create user") return "Create User";
  return subject === "create view" ? "Create View" : "Create Table";
}

function outputItemsFromPragma(pragma: Record<string, unknown>): OutputItem[] {
  const name = identifierName(pragma.name)?.toLowerCase();
  if (name === "table_info") {
    return staticColumns([
      ["cid", "integer"],
      ["name", "text"],
      ["type", "text"],
      ["notnull", "integer"],
      ["dflt_value", "text"],
      ["pk", "integer"],
    ]);
  }
  if (name === "table_xinfo") {
    return staticColumns([
      ["cid", "integer"],
      ["name", "text"],
      ["type", "text"],
      ["notnull", "integer"],
      ["dflt_value", "text"],
      ["pk", "integer"],
      ["hidden", "integer"],
    ]);
  }
  if (name === "index_list") {
    return staticColumns([
      ["seq", "integer"],
      ["name", "text"],
      ["unique", "integer"],
      ["origin", "text"],
      ["partial", "integer"],
    ]);
  }
  if (name === "index_info") {
    return staticColumns([
      ["seqno", "integer"],
      ["cid", "integer"],
      ["name", "text"],
    ]);
  }
  if (name === "index_xinfo") {
    return staticColumns([
      ["seqno", "integer"],
      ["cid", "integer"],
      ["name", "text"],
      ["desc", "integer"],
      ["coll", "text"],
      ["key", "integer"],
    ]);
  }
  if (name === "database_list") {
    return staticColumns([
      ["seq", "integer"],
      ["name", "text"],
      ["file", "text"],
    ]);
  }
  if (name === "show_tables") {
    return staticColumns([["name", "text"]]);
  }
  if (name === "version") {
    return staticColumns([
      ["library_version", "text"],
      ["source_id", "text"],
      ["codename", "text"],
    ]);
  }
  if (name === "database_size") {
    return staticColumns([
      ["database_name", "text"],
      ["database_size", "text"],
      ["block_size", "integer"],
      ["total_blocks", "integer"],
      ["used_blocks", "integer"],
      ["free_blocks", "integer"],
      ["wal_size", "text"],
      ["memory_usage", "text"],
      ["memory_limit", "text"],
    ]);
  }
  if (name === "storage_info") {
    return staticColumns([
      ["row_group_id", "integer"],
      ["column_name", "text"],
      ["column_id", "integer"],
      ["column_path", "text"],
      ["segment_id", "integer"],
      ["segment_type", "text"],
      ["start", "integer"],
      ["count", "integer"],
      ["compression", "text"],
      ["stats", "text"],
      ["has_updates", "boolean"],
      ["persistent", "boolean"],
      ["block_id", "integer"],
      ["block_offset", "integer"],
    ]);
  }
  if (name === "platform") {
    return staticColumns([["platform", "text"]]);
  }
  if (name === "user_agent") {
    return staticColumns([["user_agent", "text"]]);
  }
  if (name === "show") {
    return staticColumns([
      ["name", "text"],
      ["value", "text"],
    ]);
  }
  if (name === "enable_profile" || name === "enable_profiling") {
    return staticColumns([["enable_profile", "text"]]);
  }
  if (name === "foreign_key_list") {
    return staticColumns([
      ["id", "integer"],
      ["seq", "integer"],
      ["table", "text"],
      ["from", "text"],
      ["to", "text"],
      ["on_update", "text"],
      ["on_delete", "text"],
      ["match", "text"],
    ]);
  }
  if (name === "foreign_key_check") {
    return staticColumns([
      ["table", "text"],
      ["rowid", "integer"],
      ["parent", "text"],
      ["fkid", "integer"],
    ]);
  }
  if (name === "table_list") {
    return staticColumns([
      ["schema", "text"],
      ["name", "text"],
      ["type", "text"],
      ["ncol", "integer"],
      ["wr", "integer"],
      ["strict", "integer"],
    ]);
  }
  if (name === "function_list") {
    return staticColumns([
      ["name", "text"],
      ["builtin", "integer"],
      ["type", "text"],
      ["enc", "text"],
      ["narg", "integer"],
      ["flags", "integer"],
    ]);
  }
  if (name === "functions") {
    return staticColumns([
      ["name", "text"],
      ["type", "text"],
      ["parameters", "array<text>"],
      ["varargs", "text"],
      ["return_type", "text"],
      ["side_effects", "boolean"],
    ]);
  }
  if (name === "module_list") {
    return staticColumns([["name", "text"]]);
  }
  if (name === "collations") {
    return staticColumns([["collname", "text"]]);
  }
  if (name === "compile_options") {
    return staticColumns([["compile_options", "text"]]);
  }
  if (name === "collation_list") {
    return staticColumns([
      ["seq", "integer"],
      ["name", "text"],
    ]);
  }
  if (name === "pragma_list") {
    return staticColumns([["name", "text"]]);
  }
  if (name === "quick_check" || name === "integrity_check") {
    return staticColumns([[name, "text"]]);
  }
  if (name === "wal_checkpoint") {
    return staticColumns([
      ["busy", "integer"],
      ["log", "integer"],
      ["checkpointed", "integer"],
    ]);
  }
  if (name === "stats") {
    return staticColumns([
      ["table", "text"],
      ["index", "text"],
      ["width", "integer"],
      ["height", "integer"],
    ]);
  }
  if (name === "optimize") {
    return staticColumns([["optimize", "text"]]);
  }
  if (
    [
      "journal_mode",
      "locking_mode",
      "synchronous",
      "encoding",
      "auto_vacuum",
      "temp_store",
    ].includes(name ?? "")
  ) {
    return staticColumns([[name ?? "value", "text"]]);
  }
  if (
    [
      "cache_size",
      "page_size",
      "page_count",
      "freelist_count",
      "schema_version",
      "user_version",
      "application_id",
      "busy_timeout",
      "wal_autocheckpoint",
      "threads",
    ].includes(name ?? "")
  ) {
    return staticColumns([[name ?? "value", "integer"]]);
  }
  if (
    [
      "foreign_keys",
      "defer_foreign_keys",
      "ignore_check_constraints",
      "recursive_triggers",
      "reverse_unordered_selects",
      "read_uncommitted",
      "query_only",
    ].includes(name ?? "")
  ) {
    return staticColumns([[name ?? "value", "boolean"]]);
  }
  return [];
}

function commandResultColumns(command: string, dialect: string): OutputItem[] {
  const columns = commandResultColumnConfigs(command, dialect);
  return columns ? staticConfigColumns(columns) : [];
}

function outputItemsFromSerializedSelect(
  select: Record<string, unknown>,
  dialect: string,
): OutputItem[] {
  const serializedSelect = getDialectConfig(dialect).serializedSelect;
  if (Array.isArray(select.for_json) && select.for_json.length > 0) {
    return serializedSelect.forJson ? staticColumns([["", serializedSelect.forJson]]) : [];
  }
  if (Array.isArray(select.for_xml) && select.for_xml.length > 0) {
    return serializedSelect.forXml ? staticColumns([["", serializedSelect.forXml]]) : [];
  }
  return [];
}

function staticColumns(columns: Array<[name: string, type: string]>): OutputItem[] {
  return columns.map(([name, type]) => ({
    expression: {
      cast: {
        this: { null: null },
        to: { data_type: type },
      },
    },
    name,
    source: "metadata",
  }));
}

function staticConfigColumns(columns: readonly ConfigColumn[]): OutputItem[] {
  return staticColumns(columns.map((column) => [column.name, column.type]));
}

function outputItemsFromCopy(
  copy: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
): OutputItem[] {
  if (isNoResultCopy(copy)) return [];
  const direct = outputItemsFromCopySource(copy.this, schema, context);
  if (direct.length > 0) return direct;
  const fileSources = Array.isArray(copy.files) ? copy.files : [];
  for (const source of fileSources) {
    const items = outputItemsFromCopySource(source, schema, context);
    if (items.length > 0) return items;
  }
  return [];
}

function outputItemsFromExport(
  exportStatement: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
): OutputItem[] {
  return isRecord(exportStatement.this)
    ? outputItemsForStatement(exportStatement.this, schema, context)
    : [];
}

function outputItemsFromCopySource(
  source: unknown,
  schema: ValidationSchema,
  context: StatementContext,
): OutputItem[] {
  if (!isRecord(source)) return [];
  if (isRecord(source.subquery) && isRecord(source.subquery.this))
    return outputItemsForStatement(source.subquery.this, schema, context);
  if (
    isRecord(source.select) ||
    isRecord(source.values) ||
    isRecord(source.union) ||
    isRecord(source.intersect) ||
    isRecord(source.except)
  ) {
    return outputItemsForStatement(source, schema, context);
  }
  if (isRecord(source.table)) return outputItemsFromDescribedTable(source.table, schema);
  if (isRecord(source.column)) {
    const tableName = identifierName(source.column.name);
    if (tableName) return outputItemsFromDescribedTable({ name: { name: tableName } }, schema);
  }
  return [];
}

function outputItemsFromDescribedTable(
  tableRef: Record<string, unknown>,
  schema: ValidationSchema,
): OutputItem[] {
  const tableName = identifierName(tableRef.name)?.toLowerCase();
  const schemaName = identifierName(tableRef.schema)?.toLowerCase();
  if (!tableName) return [];
  const table = schema.tables.find((candidate) => {
    if (candidate.name.toLowerCase() !== tableName) return false;
    if (schemaName && candidate.schema?.toLowerCase() !== schemaName) return false;
    return true;
  });
  if (!table) return [];
  return table.columns.map((column) => ({
    expression: { column: { name: { name: column.name }, table: { name: table.name } } },
    name: column.name,
    source: schemaColumnSource(table, column.name),
    schema,
    tableAliases: new Map([
      [
        table.name.toLowerCase(),
        {
          tableName: table.name,
          ...(table.schema ? { schemaName: table.schema } : {}),
          visibleColumnNames: [],
        },
      ],
    ]),
  }));
}

function outputItemsFromWatchExpression(
  statement: Record<string, unknown>,
  schema: ValidationSchema,
): OutputItem[] {
  const alias = isRecord(statement.alias) ? statement.alias : undefined;
  const tableName = alias ? identifierName(alias.alias) : undefined;
  return tableName ? outputItemsFromDescribedTable({ name: { name: tableName } }, schema) : [];
}

function executeName(execute: Record<string, unknown>): string | undefined {
  const table = isRecord(execute.this) ? getAst(execute.this, "table") : undefined;
  if (isRecord(table)) return identifierName(table.name);
  return identifierName(execute.this);
}

function outputItemsFromCreateView(
  createView: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
  dialect = "generic",
): OutputItem[] {
  if (!isRecord(createView.query)) return [];
  return applyDefinitionColumnNames(
    outputItemsForStatement(createView.query, schema, context, dialect),
    definitionColumns(createView),
  );
}

function outputItemsFromCreateTable(
  createTable: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
  dialect = "generic",
): OutputItem[] {
  if (!isRecord(createTable.as_select)) return [];
  return applyDefinitionColumnNames(
    outputItemsForStatement(createTable.as_select, schema, context, dialect),
    createTable.columns,
  );
}

function applyDefinitionColumnNames(items: OutputItem[], columnDefinitions: unknown): OutputItem[] {
  const columns = Array.isArray(columnDefinitions) ? columnDefinitions : [];
  if (columns.length === 0) return items;
  return items.map((item, index) => ({
    ...item,
    name: columnDefinitionName(columns[index]) ?? item.name,
  }));
}

function columnDefinitionName(column: unknown): string | undefined {
  if (isRecord(column) && isRecord(column.column_def))
    return columnDefinitionName(column.column_def);
  return isRecord(column)
    ? (identifierName(column.name) ?? identifierName(column))
    : identifierName(column);
}

function definitionColumns(definition: Record<string, unknown>): unknown[] {
  if (Array.isArray(definition.columns) && definition.columns.length > 0) return definition.columns;
  if (isRecord(definition.schema) && Array.isArray(definition.schema.expressions))
    return definition.schema.expressions;
  return [];
}

function normalizedValuesRowExpressions(row: unknown): AstExpression[] {
  if (!isRecord(row) || !Array.isArray(row.expressions)) return [];
  const rowExpressions = row.expressions.filter(isRecord);
  if (rowExpressions.length === 1) {
    const rowFunction = getAst(rowExpressions[0], "function");
    if (isRecord(rowFunction) && String(rowFunction.name ?? "").toLowerCase() === "row") {
      return functionArguments(rowFunction).filter(isRecord);
    }
  }
  return rowExpressions;
}

function outputItemsFromValues(
  values: Record<string, unknown>,
  schema: ValidationSchema,
): OutputItem[] {
  const rows = Array.isArray(values.expressions) ? values.expressions : [];
  const firstRow = rows.find(isRecord);
  const expressions = firstRow ? normalizedValuesRowExpressions(firstRow) : [];
  const aliases = Array.isArray(values.column_aliases) ? values.column_aliases : [];
  return expressions.filter(isRecord).map((expression, index) => ({
    expression: valuesColumnExpression(rows, index, expression, schema),
    name: identifierName(aliases[index]) ?? `column_${index + 1}`,
  }));
}

function valuesColumnExpression(
  rows: unknown[],
  index: number,
  fallback: AstExpression,
  schema: ValidationSchema,
): AstExpression {
  const columnExpressions = rows.flatMap((row) => {
    const expression = normalizedValuesRowExpressions(row)[index];
    return expression && isRecord(expression) ? [expression] : [];
  });
  const type = commonArgumentType(columnExpressions, schema, undefined);
  return type
    ? {
        cast: {
          this: { null: null },
          to: { data_type: type },
        },
      }
    : fallback;
}

function outputItemsFromSetOperation(
  setOperation: Record<string, unknown>,
  schema: ValidationSchema,
  context: StatementContext,
  dialect: string,
): OutputItem[] {
  const left = outputItemsForStatement(setOperation.left, schema, context, dialect);
  const right = outputItemsForStatement(setOperation.right, schema, context, dialect);
  return left.map((item, index) => {
    const rightItem = right[index];
    const type = commonResultType(
      [item, rightItem].filter((candidate): candidate is OutputItem => Boolean(candidate)),
      schema,
      dialect,
    );
    return {
      ...item,
      expression: type ? typedNullExpression(type) : item.expression,
    };
  });
}

function commonResultType(
  items: OutputItem[],
  fallbackSchema: ValidationSchema,
  dialect = "generic",
): string | undefined {
  const types = items
    .map(
      (item) =>
        inferCastType(item.expression, dialect) ??
        inferColumn(
          item.expression,
          item.name ?? "set_column",
          item.schema ?? fallbackSchema,
          undefined,
          dialect,
          item.source,
          item.tableAliases,
        ).type,
    )
    .filter((type) => type !== "unknown");
  const nonNullTypes = types.filter((type) => type !== "null");
  const resultDecimalInteger = getDialectConfig(dialect).commonTypes.resultDecimalInteger;
  if (
    resultDecimalInteger &&
    nonNullTypes.some(decimalTypeParts) &&
    nonNullTypes.some(isIntegerLikeType)
  )
    return resultDecimalInteger;
  const dialectCommon = commonTypeFromTypesForDialect(nonNullTypes, dialect);
  if (dialectCommon) return dialectCommon;
  return commonTypeFromTypes(types);
}

function outputItemsFromPivot(
  pivot: Record<string, unknown>,
  schema: ValidationSchema,
): OutputItem[] {
  const table = pivot.unpivot
    ? tableFromUnpivot(topLevelUnpivotShape(pivot), schema)
    : tableFromPivot(topLevelPivotShape(pivot), schema);
  if (!table) return [];
  return table.columns.map((column) => ({
    name: column.name,
    source: `${table.name}.${column.name}`,
    expression: {
      column: {
        name: { name: column.name },
        table: { name: table.name },
      },
    },
    schema: { tables: [table] },
  }));
}

function topLevelPivotShape(pivot: Record<string, unknown>): Record<string, unknown> {
  return {
    ...pivot,
    this: topLevelPivotSource(pivot.this),
    expressions: Array.isArray(pivot.using) ? pivot.using : pivot.expressions,
    fields:
      Array.isArray(pivot.fields) && pivot.fields.length > 0
        ? pivot.fields
        : [
            {
              in: {
                this: firstRecord(pivot.expressions),
                expressions: [],
              },
            },
          ],
  };
}

function topLevelUnpivotShape(pivot: Record<string, unknown>): Record<string, unknown> {
  const into =
    isRecord(pivot.into) && isRecord(pivot.into.unpivot_columns)
      ? pivot.into.unpivot_columns
      : undefined;
  return {
    ...pivot,
    this: topLevelPivotSource(pivot.this),
    columns: pivot.expressions,
    name_column: into?.this,
    value_column: Array.isArray(into?.expressions) ? into.expressions[0] : undefined,
  };
}

function topLevelPivotSource(source: unknown): unknown {
  if (isRecord(source) && isRecord(source.column)) {
    const name = identifierName(source.column.name);
    return name ? { table: { name: { name } } } : source;
  }
  return source;
}

function firstRecord(values: unknown): Record<string, unknown> | undefined {
  return Array.isArray(values) ? values.find(isRecord) : undefined;
}

function typedNullExpression(type: string): AstExpression {
  return {
    cast: {
      this: { null: null },
      to: { data_type: type },
    },
  };
}

function schemaFromCtes(
  withClause: unknown,
  baseSchema: ValidationSchema,
  dialect = "generic",
): ValidationSchema {
  if (!isRecord(withClause) || !Array.isArray(withClause.ctes)) return { tables: [] };

  const tables: SchemaTable[] = [];
  for (const cte of withClause.ctes) {
    if (!isRecord(cte)) continue;
    const name = identifierName(cte.alias);
    if (!name) continue;
    const explicitColumns = Array.isArray(cte.columns) ? cte.columns : [];
    const items = outputItemsForStatement(
      cte.this,
      mergeSchemas(baseSchema, { tables }),
      emptyStatementContext(),
      dialect,
    );
    tables.push({
      name,
      columns: columnsFromOutputItems(items, explicitColumns, mergeSchemas(baseSchema, { tables })),
    });
  }
  return { tables };
}

function schemaFromDerivedTables(
  owner: Record<string, unknown>,
  baseSchema: ValidationSchema,
  dialect = "generic",
): ValidationSchema {
  const tables: SchemaTable[] = [];
  if (Array.isArray(owner.lateral_views)) {
    tables.push(
      ...owner.lateral_views
        .filter(isRecord)
        .flatMap((lateralView) =>
          lateralViewAlias(lateralView, mergeSchemas({ tables }, baseSchema)),
        ),
    );
  }
  for (const source of relationSourcesFromOwner(owner)) {
    const pivotTable = pivotOrUnpivotAlias(source, mergeSchemas({ tables }, baseSchema));
    if (pivotTable) {
      tables.push(pivotTable);
      continue;
    }
    const subquery = isRecord(source.subquery) ? source.subquery : undefined;
    if (subquery) {
      const name = identifierName(subquery.alias);
      if (!name) continue;
      const explicitColumns = Array.isArray(subquery.column_aliases) ? subquery.column_aliases : [];
      const items = outputItemsForStatement(
        subquery.this,
        mergeSchemas(baseSchema, { tables }),
        emptyStatementContext(),
        dialect,
      );
      tables.push({
        name,
        columns: columnsFromOutputItems(
          items,
          explicitColumns,
          mergeSchemas(baseSchema, { tables }),
        ),
      });
      continue;
    }
    const tableFunction = tableFunctionAlias(source, mergeSchemas({ tables }, baseSchema), dialect);
    if (
      tableFunction &&
      !tables.some((table) => table.name.toLowerCase() === tableFunction.name.toLowerCase())
    ) {
      tables.push(tableFunction);
      continue;
    }
    const openJsonTable = openJsonAlias(source);
    if (
      openJsonTable &&
      !tables.some((table) => table.name.toLowerCase() === openJsonTable.name.toLowerCase())
    ) {
      tables.push(openJsonTable);
      continue;
    }
    const jsonTable = jsonTableAlias(source);
    if (
      jsonTable &&
      !tables.some((table) => table.name.toLowerCase() === jsonTable.name.toLowerCase())
    ) {
      tables.push(jsonTable);
      continue;
    }
    const xmlTable = xmlTableAlias(source);
    if (
      xmlTable &&
      !tables.some((table) => table.name.toLowerCase() === xmlTable.name.toLowerCase())
    ) {
      tables.push(xmlTable);
      continue;
    }
    const matchRecognizeTable = matchRecognizeAlias(source, mergeSchemas({ tables }, baseSchema));
    if (
      matchRecognizeTable &&
      !tables.some((table) => table.name.toLowerCase() === matchRecognizeTable.name.toLowerCase())
    ) {
      tables.push(matchRecognizeTable);
    }
  }
  return { tables };
}

function pivotOrUnpivotAlias(
  source: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaTable | undefined {
  const pivot = isRecord(source.pivot) ? source.pivot : undefined;
  const unpivot = isRecord(source.unpivot) ? source.unpivot : undefined;
  if (pivot) return tableFromPivot(pivot, schema);
  if (unpivot) return tableFromUnpivot(unpivot, schema);
  return undefined;
}

function tableFromPivot(
  pivot: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaTable | undefined {
  const base = sourceTableForTransform(pivot, schema);
  const name = identifierName(pivot.alias) ?? base?.name;
  if (!base || !name) return undefined;
  const pivotColumnNames = pivotFieldColumns(pivot);
  const aggregateInputNames = Array.isArray(pivot.expressions)
    ? pivot.expressions.flatMap(referencedColumnNames)
    : [];
  const suppressed = new Set(
    [...pivotColumnNames, ...aggregateInputNames].map((column) => column.toLowerCase()),
  );
  const groupingColumns = base.columns.filter(
    (column) => !suppressed.has(column.name.toLowerCase()),
  );
  const pivotValueNames = pivotValueColumnNames(pivot);
  const aggregateType = firstAggregateType(pivot, schema) ?? "unknown";
  return {
    name,
    columns: [
      ...groupingColumns,
      ...pivotValueNames.map((columnName) => ({
        name: columnName,
        type: aggregateType,
      })),
    ],
  };
}

function tableFromUnpivot(
  unpivot: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaTable | undefined {
  const base = sourceTableForTransform(unpivot, schema);
  const name = identifierName(unpivot.alias) ?? base?.name;
  const valueColumn = identifierName(unpivot.value_column);
  const nameColumn = identifierName(unpivot.name_column);
  if (!base || !name || !valueColumn || !nameColumn) return undefined;
  const inputNames = Array.isArray(unpivot.columns)
    ? unpivot.columns.flatMap(referencedColumnNames)
    : [];
  const suppressed = new Set(inputNames.map((column) => column.toLowerCase()));
  const valueType =
    inputNames
      .map(
        (columnName) =>
          base.columns.find((column) => column.name.toLowerCase() === columnName.toLowerCase())
            ?.type,
      )
      .find((type): type is string => Boolean(type)) ?? "unknown";
  return {
    name,
    columns: [
      ...base.columns.filter((column) => !suppressed.has(column.name.toLowerCase())),
      { name: nameColumn, type: "text" },
      { name: valueColumn, type: valueType },
    ],
  };
}

function sourceTableForTransform(
  transform: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaTable | undefined {
  const source = isRecord(transform.this) ? transform.this : undefined;
  const tableName = relationTableName(source ?? {});
  if (!tableName) return undefined;
  return schema.tables.find((table) => table.name.toLowerCase() === tableName.toLowerCase());
}

function pivotFieldColumns(pivot: Record<string, unknown>): string[] {
  if (!Array.isArray(pivot.fields)) return [];
  return pivot.fields.flatMap((field) =>
    isRecord(field) && isRecord(field.in) ? referencedColumnNames(field.in.this) : [],
  );
}

function pivotValueColumnNames(pivot: Record<string, unknown>): string[] {
  if (!Array.isArray(pivot.fields)) return [];
  return pivot.fields.flatMap((field) => {
    const expressions =
      isRecord(field) && isRecord(field.in) && Array.isArray(field.in.expressions)
        ? field.in.expressions
        : [];
    return expressions.map(pivotValueName).filter((name): name is string => Boolean(name));
  });
}

function pivotValueName(expression: unknown): string | undefined {
  const literal = isRecord(expression) ? expression.literal : undefined;
  if (isRecord(literal)) return cleanIdentifier(String(literal.value ?? ""));
  const column = isRecord(expression) ? expression.column : undefined;
  if (isRecord(column)) return identifierName(column.name);
  return undefined;
}

function firstAggregateType(
  pivot: Record<string, unknown>,
  schema: ValidationSchema,
): string | undefined {
  const expression = Array.isArray(pivot.expressions)
    ? pivot.expressions.find(isRecord)
    : undefined;
  return expression ? inferExpressionType(expression, schema, undefined) : undefined;
}

function referencedColumnNames(expression: unknown): string[] {
  if (!isRecord(expression)) return [];
  const column = getAst(expression, "column");
  if (isRecord(column)) {
    const name = identifierName(column.name);
    return name ? [name] : [];
  }
  return Object.values(expression).flatMap((value) =>
    Array.isArray(value) ? value.flatMap(referencedColumnNames) : referencedColumnNames(value),
  );
}

function lateralViewAlias(
  lateralView: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaTable[] {
  const name = identifierName(lateralView.table_alias);
  const columnAliases = Array.isArray(lateralView.column_aliases)
    ? lateralView.column_aliases
        .map(identifierName)
        .filter((columnName): columnName is string => Boolean(columnName))
    : [];
  if (!name || columnAliases.length === 0) return [];
  const columnTypes = lateralViewColumnTypes(lateralView.this, schema);
  return [
    {
      name,
      columns: columnAliases.map((columnName, index) => ({
        name: columnName,
        type: columnTypes[index] ?? columnTypes[0] ?? "unknown",
      })),
    },
  ];
}

function lateralViewColumnTypes(expression: unknown, schema: ValidationSchema): string[] {
  if (!isRecord(expression)) return [];
  const explode = getAst(expression, "explode");
  if (isRecord(explode)) return explodeColumnTypes(explode.this, schema);
  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return [];
  const name = String(fn.name ?? "").toLowerCase();
  if (name === "explode" || name === "explode_outer")
    return explodeColumnTypes(firstExpression(functionArguments(fn)), schema);
  if (name === "posexplode" || name === "posexplode_outer") {
    const exploded = explodeColumnTypes(firstExpression(functionArguments(fn)), schema);
    return ["integer", ...exploded];
  }
  return [];
}

function explodeColumnTypes(expression: unknown, schema: ValidationSchema): string[] {
  if (!isRecord(expression)) return ["unknown"];
  const elementType = unnestElementType(expression, schema);
  if (elementType) return [elementType];
  const column = inferColumn(expression, "explode", schema, undefined, "generic");
  if (column.type === "unknown") return ["unknown"];
  const mapTypes = mapKeyValueTypes(column.type);
  if (mapTypes) return mapTypes;
  return [arrayElementType(column.type) ?? column.type];
}

function tableFunctionAlias(
  source: Record<string, unknown>,
  schema: ValidationSchema,
  dialect = "generic",
): SchemaTable | undefined {
  const alias = isRecord(source.alias) ? source.alias : undefined;
  const lateral = isRecord(source.lateral) ? source.lateral : undefined;
  if (lateral) return lateralFunctionAlias(lateral, schema);
  const tupleTable = tableFunctionTupleAlias(source, schema);
  if (tupleTable) return tupleTable;
  const direct = tableFromDirectTableFunction(source, schema, dialect);
  if (direct) return direct;
  if (
    !alias ||
    !(isRecord(alias.this) && (isRecord(alias.this.function) || isRecord(alias.this.unnest)))
  )
    return undefined;
  const name = identifierName(alias.alias);
  const explicitColumnAliases = Array.isArray(alias.column_aliases)
    ? alias.column_aliases
        .map(identifierName)
        .filter((columnName): columnName is string => Boolean(columnName))
    : [];
  if (name) {
    const functionName = aliasFunctionName(alias.this);
    const schemaTable = functionName
      ? schema.tables.find((table) => table.name.toLowerCase() === functionName.toLowerCase())
      : undefined;
    if (schemaTable) {
      const aliasedTable = { ...schemaTable, name };
      return explicitColumnAliases.length > 0
        ? applyTableColumnAliases(aliasedTable, explicitColumnAliases)
        : aliasedTable;
    }
    const knownTable = tableFromKnownTableFunction(alias.this, name, schema, dialect);
    if (knownTable)
      return explicitColumnAliases.length > 0
        ? applyTableColumnAliases(knownTable, explicitColumnAliases)
        : knownTable;
  }
  const columnAliases =
    explicitColumnAliases.length > 0 ? explicitColumnAliases : name ? [name] : [];
  if (!name || columnAliases.length === 0) return undefined;
  const columnTypes = tableFunctionColumnTypes(alias.this, schema);
  return {
    name,
    columns: columnAliases.map((columnName, index) => ({
      name: columnName,
      type: columnTypes[index] ?? columnTypes[0] ?? "unknown",
    })),
  };
}

function aliasFunctionName(expression: unknown): string | undefined {
  const fn = getAst(expression, "function");
  return isRecord(fn) ? unqualifiedFunctionName(fn) : undefined;
}

function applyTableColumnAliases(table: SchemaTable, columnAliases: string[]): SchemaTable {
  return {
    ...table,
    columns: table.columns.map((column, index) => ({
      ...column,
      name: columnAliases[index] ?? column.name,
    })),
  };
}

function tableFunctionTupleAlias(
  source: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaTable | undefined {
  const expressions =
    isRecord(source.tuple) && Array.isArray(source.tuple.expressions)
      ? source.tuple.expressions
      : [];
  const fn = expressions.find(
    (expression) => isRecord(expression) && isRecord(expression.function),
  );
  const tableAlias = expressions.find(
    (expression) => isRecord(expression) && isRecord(expression.table_alias),
  );
  if (!isRecord(fn) || !isRecord(tableAlias) || !isRecord(tableAlias.table_alias)) return undefined;
  const aliasName = identifierName(tableAlias.table_alias.this);
  if (!aliasName) return undefined;
  const definitions = Array.isArray(tableAlias.table_alias.columns)
    ? tableAlias.table_alias.columns
    : [];
  const columns = definitions.flatMap((definition) => {
    const columnDef =
      isRecord(definition) && isRecord(definition.column_def) ? definition.column_def : undefined;
    const name = columnDef ? identifierName(columnDef.name) : undefined;
    if (!columnDef || !name) return [];
    return [{ name, type: dataTypeToString(columnDef.data_type) ?? "unknown" }];
  });
  if (columns.length > 0) return { name: aliasName, columns };
  const functionName = isRecord(fn.function) ? String(fn.function.name ?? "").toLowerCase() : "";
  return {
    name: aliasName,
    columns: [{ name: aliasName, type: tableFunctionDefaultType(functionName, fn, schema) }],
  };
}

function tableFromDirectTableFunction(
  source: Record<string, unknown>,
  schema: ValidationSchema,
  dialect = "generic",
): SchemaTable | undefined {
  if (isRecord(source.function)) {
    const name = String(source.function.name ?? "").toLowerCase();
    const known = tableFromKnownTableFunction(source, name, schema, dialect);
    if (known) return known;
    const schemaTable = schema.tables.find((table) => table.name.toLowerCase() === name);
    if (schemaTable) return schemaTable;
    return { name, columns: [{ name, type: tableFunctionDefaultType(name, source, schema) }] };
  }
  if (isRecord(source.unnest)) {
    const unnest = source.unnest;
    const aliasName = identifierName(unnest.alias);
    const offsetAlias = identifierName(unnest.offset_alias);
    const tableName = aliasName ?? "unnest";
    const structColumns = unnestStructColumns(unnest, schema);
    if (structColumns.length > 0)
      return { name: tableName, columns: withOrdinalityColumn(structColumns, offsetAlias, unnest) };
    const columnTypes = tableFunctionColumnTypes(source, schema);
    return {
      name: tableName,
      columns:
        columnTypes.length > 0
          ? columnTypes.map((type, index) => ({
              name: unnestColumnName(index, aliasName, offsetAlias, unnest),
              type,
            }))
          : [{ name: aliasName ?? "unnest", type: "unknown" }],
    };
  }
  return undefined;
}

function unnestColumnName(
  index: number,
  aliasName: string | undefined,
  offsetAlias: string | undefined,
  unnest: Record<string, unknown>,
): string {
  const typeCount = tableFunctionColumnTypes({ unnest }, { tables: [] }).length;
  if (offsetAlias && unnest.with_ordinality === true && index === typeCount - 1) return offsetAlias;
  if (index === 0) return aliasName ?? "unnest";
  return `unnest_${index + 1}`;
}

function withOrdinalityColumn(
  columns: SchemaColumn[],
  offsetAlias: string | undefined,
  unnest: Record<string, unknown>,
): SchemaColumn[] {
  return unnest.with_ordinality === true
    ? [...columns, { name: offsetAlias ?? "ordinality", type: "integer" }]
    : columns;
}

function tableFromKnownTableFunction(
  expression: unknown,
  alias: string,
  schema: ValidationSchema,
  dialect = "generic",
): SchemaTable | undefined {
  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return undefined;
  const name = unqualifiedFunctionName(fn);
  if (name === "table") {
    const firstArg = functionArguments(fn).find(isRecord);
    const handlers = new Set(getDialectConfig(dialect).dynamicTableFunctions.enabledHandlers);
    const dbmsXplan = handlers.has("oracleDbmsXplan")
      ? oracleDbmsXplanTable(firstArg, alias)
      : undefined;
    if (dbmsXplan) return dbmsXplan;
    const collectionType = handlers.has("oracleCollection")
      ? oracleCollectionTableType(firstArg)
      : undefined;
    if (collectionType) return { name: alias, columns: [{ name: alias, type: collectionType }] };
    const wrapped = isRecord(firstArg)
      ? tableFromKnownTableFunction(firstArg, alias, schema, dialect)
      : undefined;
    if (wrapped) return wrapped;
  }
  const handlers = new Set(getDialectConfig(dialect).dynamicTableFunctions.enabledHandlers);
  if (handlers.has("stack") && name === "stack") return stackTable(fn, alias, schema);
  if (name === "json_populate_record" || name === "jsonb_populate_record") {
    const firstArg = functionArguments(fn)[0];
    const cast = isRecord(firstArg) ? getAst(firstArg, "cast") : undefined;
    const target =
      isRecord(cast) && isRecord(cast.to)
        ? cleanIdentifier(String(cast.to.name ?? cast.to.data_type ?? ""))
        : undefined;
    const table = target
      ? schema.tables.find((candidate) => candidate.name.toLowerCase() === target.toLowerCase())
      : undefined;
    if (table) return { ...table, name: alias };
  }
  if (
    (handlers.has("generateSeries") && name === "generate_series") ||
    (handlers.has("range") && name === "range")
  ) {
    const type = commonArgumentType(functionArguments(fn), { tables: [] }, undefined);
    const policy = getDialectConfig(dialect).dynamicTableFunctions;
    const configuredColumnName =
      name === "generate_series" ? policy.generateSeriesColumn : policy.rangeColumn;
    const columnName = configuredColumnName === "$alias" ? alias : configuredColumnName;
    return {
      name: alias,
      columns: [
        { name: columnName, type: type && /date|time|timestamp/i.test(type) ? type : "integer" },
      ],
    };
  }
  if (handlers.has("sqliteFts5Vocab") && name === "fts5vocab")
    return sqliteFts5VocabTable(fn, alias);
  if (handlers.has("sqlitePragma") && name.startsWith("pragma_"))
    return sqlitePragmaFunctionTable(name, alias);
  if (handlers.has("numbers") && (name === "numbers" || name === "numbers_mt"))
    return { name: alias, columns: [{ name: alias, type: "integer" }] };
  if (
    handlers.has("clickhouseRemote") &&
    ["remote", "remotesecure", "cluster", "clusterallreplicas"].includes(name)
  ) {
    const tableName = remoteTableFunctionTableName(functionArguments(fn));
    const table = tableName
      ? schema.tables.find((candidate) => candidate.name.toLowerCase() === tableName.toLowerCase())
      : undefined;
    if (table) return { ...table, name: alias };
  }
  if (handlers.has("sequence") && name === "sequence") {
    const type = commonArgumentType(functionArguments(fn), { tables: [] }, undefined) ?? "integer";
    return { name: alias, columns: [{ name: alias, type }] };
  }
  if (handlers.has("generateArray") && name === "generate_array") {
    const type = commonArgumentType(functionArguments(fn), { tables: [] }, undefined) ?? "integer";
    return { name: alias, columns: [{ name: alias, type }] };
  }
  if (
    handlers.has("fileColumns") &&
    [
      "read_csv",
      "read_csv_auto",
      "read_json",
      "read_json_auto",
      "read_ndjson",
      "read_ndjson_auto",
      "read_parquet",
      "read_xlsx",
    ].includes(name)
  ) {
    const columns = tableFunctionColumnsArgument(fn);
    if (columns.length > 0) return { name: alias, columns };
  }
  if (
    handlers.has("schemaStringTableFunctions") &&
    ["file", "url", "s3", "s3cluster", "hdfs", "azureblobstorage", "generaterandom"].includes(name)
  ) {
    const columns = columnsFromSchemaString(lastSchemaLikeLiteral(functionArguments(fn)));
    if (columns.length > 0) return { name: alias, columns };
  }
  if (
    handlers.has("externalConnection") &&
    ["mysql", "postgresql", "odbc", "jdbc"].includes(name)
  ) {
    const args = functionArguments(fn);
    const tableName =
      name === "mysql" || name === "postgresql"
        ? stringLiteralValue(args[2])
        : lastStringLiteral(args);
    const table = tableName
      ? schema.tables.find((candidate) => candidate.name.toLowerCase() === tableName.toLowerCase())
      : undefined;
    if (table) return { ...table, name: alias };
  }
  if (handlers.has("embeddedSql") && (name === "openquery" || name === "openrowset")) {
    const queryTable = tableFromEmbeddedSqlTableFunction(fn, alias, schema);
    if (queryTable) return queryTable;
  }
  return configuredTableFunction(name, alias, dialect);
}

function configuredTableFunction(
  name: string,
  alias: string,
  dialect: string,
): SchemaTable | undefined {
  const columns =
    getDialectConfig(dialect).tableFunctions[name] ??
    getDialectConfig("generic").tableFunctions[name];
  if (!columns) return undefined;
  return {
    name: alias,
    columns: columns.map((column) => ({
      name: column.name === "$alias" ? alias : column.name,
      type: column.type,
      ...(column.nullable === undefined ? {} : { nullable: column.nullable }),
    })),
  };
}

function remoteTableFunctionTableName(args: AstExpression[]): string | undefined {
  const tableArg = args[2] ?? args.at(-1);
  if (!tableArg) return undefined;
  const column = isRecord(tableArg) ? getAst(tableArg, "column") : undefined;
  return (
    stringLiteralValue(tableArg) ?? (isRecord(column) ? identifierName(column.name) : undefined)
  );
}

function stackTable(
  fn: Record<string, unknown>,
  alias: string,
  schema: ValidationSchema,
): SchemaTable {
  const args = functionArguments(fn);
  const rowCount = numericLiteralValue(args[0]) ?? 1;
  const values = args.slice(1);
  const columnCount = Math.max(1, Math.ceil(values.length / Math.max(1, rowCount)));
  return {
    name: alias,
    columns: Array.from({ length: columnCount }, (_, index) => {
      const columnValues = values.filter((_, valueIndex) => valueIndex % columnCount === index);
      return {
        name: `col${index}`,
        type: commonArgumentType(columnValues, schema, undefined) ?? "unknown",
      };
    }),
  };
}

function tableFunctionColumnsArgument(fn: Record<string, unknown>): SchemaColumn[] {
  for (const arg of functionArguments(fn)) {
    const eq = getAst(arg, "eq");
    if (!isRecord(eq)) continue;
    const name = isRecord(eq.left)
      ? identifierName(
          getAst(eq.left, "column") && (getAst(eq.left, "column") as Record<string, unknown>).name,
        )
      : undefined;
    if (name?.toLowerCase() !== "columns") continue;
    const columns = columnsFromMapLiteral(eq.right);
    if (columns.length > 0) return columns;
  }
  return [];
}

function columnsFromMapLiteral(expression: unknown): SchemaColumn[] {
  const map = isRecord(expression) ? getAst(expression, "map_func") : undefined;
  if (!isRecord(map) || !Array.isArray(map.keys) || !Array.isArray(map.values)) return [];
  const keys = map.keys;
  const values = map.values;
  return keys.flatMap((key, index) => {
    const name = literalString(key);
    const typeSpec = literalString(values[index]);
    if (!name || !typeSpec) return [];
    return [{ name, type: dataTypeFromRawColumnSpec(typeSpec) ?? "unknown" }];
  });
}

function columnsFromSchemaString(spec: string | undefined): SchemaColumn[] {
  if (!spec) return [];
  return splitTopLevel(spec, ",").flatMap((part) => {
    const match = part.trim().match(/^([`"']?[\w$]+[`"']?)\s+(.+)$/);
    if (!match) return [];
    const name = cleanIdentifier(match[1]);
    const type = dataTypeFromRawColumnSpec(match[2]) ?? "unknown";
    return name ? [{ name, type }] : [];
  });
}

function lastSchemaLikeLiteral(args: AstExpression[]): string | undefined {
  for (let index = args.length - 1; index >= 0; index -= 1) {
    const value = literalString(args[index]);
    if (value && /\w+\s+\w+/.test(value)) return value;
  }
  return undefined;
}

function tableFromEmbeddedSqlTableFunction(
  fn: Record<string, unknown>,
  alias: string,
  schema: ValidationSchema,
): SchemaTable | undefined {
  const literals = functionArguments(fn).map(stringLiteralValue);
  let sql: string | undefined;
  for (let index = literals.length - 1; index >= 0; index -= 1) {
    const value = literals[index];
    if (value !== undefined && /^(?:with|select|values)\b/i.test(value.trim())) {
      sql = value;
      break;
    }
  }
  if (!sql) return undefined;
  try {
    const fallbackDialect = getDialectConfig().parserFallbacks.embeddedSqlTableFunction;
    const parsed = parse(sql, fallbackDialect as never) as PolyglotParseResult;
    if (!parsed.success) return undefined;
    const statements = Array.isArray(parsed.ast) ? parsed.ast : [parsed.ast];
    const statement = statements.find(isRecord);
    if (!statement) return undefined;
    const items = outputItemsForStatement(
      statement,
      schema,
      emptyStatementContext(),
      fallbackDialect,
    );
    const columns = columnsFromOutputItems(items, [], schema);
    return columns.length > 0 ? { name: alias, columns } : undefined;
  } catch {
    return undefined;
  }
}

function stringLiteralValue(expression: unknown): string | undefined {
  const literal = isRecord(expression) ? expression.literal : undefined;
  return isRecord(literal) && literal.literal_type === "string"
    ? String(literal.value ?? "")
    : undefined;
}

function lastStringLiteral(expressions: unknown[]): string | undefined {
  for (let index = expressions.length - 1; index >= 0; index -= 1) {
    const value = stringLiteralValue(expressions[index]);
    if (value) return value;
  }
  return undefined;
}

function unqualifiedFunctionName(fn: Record<string, unknown>): string {
  return (
    String(fn.name ?? "")
      .toLowerCase()
      .split(".")
      .at(-1) ?? ""
  );
}

function tableFunctionDefaultType(
  functionName: string,
  expression: unknown,
  schema: ValidationSchema,
): string {
  if (functionName === "regexp_matches") return "array<text>";
  if (functionName === "string_split") return "text";
  if (functionName === "generate_series" || functionName === "range") {
    const fn = getAst(expression, "function");
    const type = isRecord(fn)
      ? commonArgumentType(functionArguments(fn), schema, undefined)
      : undefined;
    return type && /date|time|timestamp/i.test(type) ? type : "integer";
  }
  return "unknown";
}

function sqliteFts5VocabTable(fn: Record<string, unknown>, alias: string): SchemaTable {
  const mode = stringLiteralValue(functionArguments(fn)[1])?.toLowerCase();
  const common = [
    { name: "term", type: "text" },
    { name: "doc", type: "integer" },
    { name: "cnt", type: "integer" },
  ];
  if (mode === "col") {
    return {
      name: alias,
      columns: [
        { name: "term", type: "text" },
        { name: "col", type: "text" },
        { name: "doc", type: "integer" },
        { name: "cnt", type: "integer" },
      ],
    };
  }
  if (mode === "instance") {
    return {
      name: alias,
      columns: [
        { name: "term", type: "text" },
        { name: "doc", type: "integer" },
        { name: "col", type: "text" },
        { name: "offset", type: "integer" },
      ],
    };
  }
  return { name: alias, columns: common };
}

function sqlitePragmaFunctionTable(name: string, alias: string): SchemaTable | undefined {
  const pragmaName = name.replace(/^pragma_/, "");
  const items = outputItemsFromPragma({ name: { name: pragmaName } });
  if (items.length === 0) return undefined;
  return {
    name: alias,
    columns: columnsFromOutputItems(items, [], { tables: [] }),
  };
}

function oracleCollectionTableType(expression: unknown): string | undefined {
  const methodCall =
    isRecord(expression) && isRecord(expression.method_call) ? expression.method_call : undefined;
  if (!methodCall) return undefined;
  const method = identifierName(methodCall.method)?.toLowerCase();
  if (!method) return undefined;
  if (/numberlist$/.test(method)) return "number";
  if (/varchar2list$/.test(method) || /varcharlist$/.test(method)) return "text";
  if (/datelist$/.test(method)) return "date";
  return undefined;
}

function oracleDbmsXplanTable(expression: unknown, alias: string): SchemaTable | undefined {
  const column = isRecord(expression) ? getAst(expression, "column") : undefined;
  if (!isRecord(column)) return undefined;
  const packageName = identifierName(column.table)?.toLowerCase();
  const memberName = identifierName(column.name)?.toLowerCase();
  if (packageName !== "dbms_xplan" || !memberName?.startsWith("display")) return undefined;
  return { name: alias, columns: [{ name: "plan_table_output", type: "text" }] };
}

function openJsonAlias(source: Record<string, unknown>): SchemaTable | undefined {
  const openJson = isRecord(source.open_j_s_o_n)
    ? source.open_j_s_o_n
    : isRecord(source.alias) &&
        isRecord(source.alias.this) &&
        isRecord(source.alias.this.open_j_s_o_n)
      ? source.alias.this.open_j_s_o_n
      : undefined;
  if (!openJson) return undefined;
  const name = isRecord(source.alias)
    ? (identifierName(source.alias.alias) ?? "openjson")
    : "openjson";
  const columns = openJsonColumns(openJson);
  return { name, columns: columns.length > 0 ? columns : defaultOpenJsonColumns() };
}

function openJsonColumns(openJson: Record<string, unknown>): SchemaColumn[] {
  const expressions = Array.isArray(openJson.expressions) ? openJson.expressions : [];
  return expressions.flatMap((expression) => {
    const definition =
      isRecord(expression) && isRecord(expression.open_j_s_o_n_column_def)
        ? expression.open_j_s_o_n_column_def
        : undefined;
    const name = definition ? identifierName(definition.this) : undefined;
    if (!definition || !name) return [];
    return [
      {
        name,
        type: dataTypeToString(definition.data_type) ?? (definition.as_json ? "json" : "unknown"),
      },
    ];
  });
}

function defaultOpenJsonColumns(): SchemaColumn[] {
  return [
    { name: "key", type: "text" },
    { name: "value", type: "text" },
    { name: "type", type: "integer" },
  ];
}

function jsonTableAlias(source: Record<string, unknown>): SchemaTable | undefined {
  const alias = isRecord(source.alias) ? source.alias : undefined;
  const jsonTable = isRecord(source.j_s_o_n_table)
    ? source.j_s_o_n_table
    : alias && isRecord(alias.this) && isRecord(alias.this.j_s_o_n_table)
      ? alias.this.j_s_o_n_table
      : undefined;
  const name = alias ? identifierName(alias.alias) : "json_table";
  if (!jsonTable || !name) return undefined;
  const columns = jsonTableColumns(jsonTable);
  return columns.length > 0 ? { name, columns } : undefined;
}

function xmlTableAlias(source: Record<string, unknown>): SchemaTable | undefined {
  const alias = isRecord(source.alias) ? source.alias : undefined;
  const xmlTable = isRecord(source.x_m_l_table)
    ? source.x_m_l_table
    : alias && isRecord(alias.this) && isRecord(alias.this.x_m_l_table)
      ? alias.this.x_m_l_table
      : undefined;
  const name = alias ? identifierName(alias.alias) : "xmltable";
  if (!xmlTable || !name) return undefined;
  const columns = Array.isArray(xmlTable.columns)
    ? xmlTable.columns.flatMap((column) => {
        const definition =
          isRecord(column) && isRecord(column.column_def) ? column.column_def : undefined;
        const columnName = definition ? identifierName(definition.name) : undefined;
        if (!definition || !columnName) return [];
        return [
          {
            name: columnName,
            type: dataTypeToString(definition.data_type) ?? "unknown",
            nullable: typeof definition.nullable === "boolean" ? definition.nullable : undefined,
          },
        ];
      })
    : [];
  return columns.length > 0 ? { name, columns } : undefined;
}

function jsonTableColumns(jsonTable: Record<string, unknown>): SchemaColumn[] {
  const schema =
    isRecord(jsonTable.schema) && isRecord(jsonTable.schema.j_s_o_n_schema)
      ? jsonTable.schema.j_s_o_n_schema
      : isRecord(jsonTable.j_s_o_n_schema)
        ? jsonTable.j_s_o_n_schema
        : undefined;
  const expressions = schema && Array.isArray(schema.expressions) ? schema.expressions : [];
  return expressions.flatMap(jsonTableColumn);
}

function jsonTableColumn(expression: unknown): SchemaColumn[] {
  if (!isRecord(expression) || !isRecord(expression.j_s_o_n_column_def)) return [];
  const definition = expression.j_s_o_n_column_def;
  if (isRecord(definition.nested_schema)) return jsonTableColumns(definition.nested_schema);
  const name = identifierName(definition.this);
  if (!name) return [];
  return [
    {
      name,
      type: definition.ordinality ? "integer" : jsonColumnType(definition.kind),
    },
  ];
}

function jsonColumnType(kind: unknown): string {
  if (typeof kind !== "string" || kind.length === 0) return "unknown";
  return normalizeDataTypeName(kind);
}

function matchRecognizeAlias(
  source: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaTable | undefined {
  const matchRecognize = isRecord(source.match_recognize) ? source.match_recognize : undefined;
  if (!matchRecognize) return undefined;
  const base = sourceTableForTransform(matchRecognize, schema);
  const name = identifierName(matchRecognize.alias) ?? base?.name;
  if (!base || !name) return undefined;
  return {
    name,
    columns: [...base.columns, ...matchRecognizeMeasureColumns(matchRecognize, schema)],
  };
}

function matchRecognizeMeasureColumns(
  matchRecognize: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaColumn[] {
  const measures = Array.isArray(matchRecognize.measures) ? matchRecognize.measures : [];
  return measures.flatMap((measure) => {
    const expression = isRecord(measure) ? measure.this : undefined;
    if (!isRecord(expression)) return [];
    const output = unwrapAlias(expression);
    const name = output.name ?? inferNameFromAst(output.expression, 1);
    const inferred = inferColumn(output.expression, name, schema, undefined, "generic");
    return [{ name, type: inferred.type, nullable: inferred.nullable }];
  });
}

function lateralFunctionAlias(
  lateral: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaTable | undefined {
  const name = identifierName(lateral.alias);
  const columnAliases = Array.isArray(lateral.column_aliases)
    ? lateral.column_aliases
        .map(identifierName)
        .filter((columnName): columnName is string => Boolean(columnName))
    : [];
  if (!name) return undefined;
  const flatten = flattenFunctionColumns(lateral.this, name);
  if (flatten) return flatten;
  if (columnAliases.length === 0) return undefined;
  const columnTypes = tableFunctionColumnTypes(lateral.this, schema);
  return {
    name,
    columns: columnAliases.map((columnName, index) => ({
      name: columnName,
      type: columnTypes[index] ?? columnTypes[0] ?? "unknown",
    })),
  };
}

function flattenFunctionColumns(expression: unknown, name: string): SchemaTable | undefined {
  const fn = getAst(expression, "function");
  if (!isRecord(fn) || String(fn.name ?? "").toLowerCase() !== "flatten") return undefined;
  return flattenTable(name);
}

function flattenTable(name: string): SchemaTable {
  return {
    name,
    columns: [
      { name: "seq", type: "integer" },
      { name: "key", type: "text" },
      { name: "path", type: "text" },
      { name: "index", type: "integer" },
      { name: "value", type: "variant" },
      { name: "this", type: "variant" },
    ],
  };
}

function tableFunctionColumnTypes(expression: unknown, schema: ValidationSchema): string[] {
  if (!isRecord(expression)) return [];
  const unnest = getAst(expression, "unnest");
  if (isRecord(unnest)) {
    const mapEntryTypes = unnestMapEntryTypes(unnest, schema);
    if (mapEntryTypes)
      return unnest.with_ordinality === true ? [...mapEntryTypes, "integer"] : mapEntryTypes;
    const arrayInputs = [
      ...(isRecord(unnest.this) ? [unnest.this] : []),
      ...(Array.isArray(unnest.expressions) ? unnest.expressions.filter(isRecord) : []),
    ];
    const elementTypes = arrayInputs.map((input) => unnestElementType(input, schema) ?? "unknown");
    return unnest.with_ordinality === true ? [...elementTypes, "integer"] : elementTypes;
  }
  const fn = getAst(expression, "function");
  if (!isRecord(fn)) return [];
  const name = String(fn.name ?? "").toLowerCase();
  if (name === "generate_series" || name === "range") {
    const type = commonArgumentType(functionArguments(fn), schema, undefined);
    if (type && /date|time|timestamp/i.test(type)) return [type];
    return ["integer"];
  }
  if (
    name === "explode" ||
    name === "explode_outer" ||
    name === "inline" ||
    name === "inline_outer"
  ) {
    const type = firstArrayArgumentType(functionArguments(fn), schema, undefined);
    return [type ? (arrayElementType(type) ?? type) : "unknown"];
  }
  if (name === "posexplode" || name === "posexplode_outer") {
    const type = firstArrayArgumentType(functionArguments(fn), schema, undefined);
    return ["integer", type ? (arrayElementType(type) ?? type) : "unknown"];
  }
  return [];
}

function unnestMapEntryTypes(
  unnest: Record<string, unknown>,
  schema: ValidationSchema,
): string[] | undefined {
  const inputs = [
    ...(isRecord(unnest.this) ? [unnest.this] : []),
    ...(Array.isArray(unnest.expressions) ? unnest.expressions.filter(isRecord) : []),
  ];
  const input = inputs.find(isRecord);
  if (!input) return undefined;
  const fn = getAst(input, "function");
  if (isRecord(fn) && String(fn.name ?? "").toLowerCase() === "map") {
    const args = functionArguments(fn);
    const keyType =
      arrayElementType(inferColumn(args[0], "map_keys", schema, undefined, "generic").type) ??
      "unknown";
    const valueType =
      arrayElementType(inferColumn(args[1], "map_values", schema, undefined, "generic").type) ??
      "unknown";
    return [keyType, valueType];
  }
  const type = inferColumn(input, "unnest_map", schema, undefined, "generic").type;
  const mapTypes = mapKeyValueTypes(type);
  return mapTypes ? [...mapTypes] : undefined;
}

function unnestStructColumns(
  unnest: Record<string, unknown>,
  schema: ValidationSchema,
): SchemaColumn[] {
  const inputs = [
    ...(isRecord(unnest.this) ? [unnest.this] : []),
    ...(Array.isArray(unnest.expressions) ? unnest.expressions.filter(isRecord) : []),
  ];
  for (const input of inputs) {
    const array = getAst(input, "array_func");
    const expressions =
      isRecord(array) && Array.isArray(array.expressions) ? array.expressions.filter(isRecord) : [];
    const first = expressions.find(isRecord);
    if (!first) continue;
    const struct = getAst(first, "function");
    if (!isRecord(struct) || String(struct.name ?? "").toLowerCase() !== "struct") continue;
    const columns = functionArguments(struct).flatMap((arg, index) => {
      const unwrapped = unwrapAlias(arg);
      const name = unwrapped.name ?? inferNameFromAst(unwrapped.expression, index + 1);
      const inferred = inferColumn(unwrapped.expression, name, schema, undefined, "generic");
      return [{ name, type: inferred.type, nullable: inferred.nullable }];
    });
    if (columns.length > 0) return columns;
  }
  return [];
}

function unnestElementType(expression: unknown, schema: ValidationSchema): string | undefined {
  if (!isRecord(expression)) return undefined;
  const array = getAst(expression, "array_func");
  if (isRecord(array) && Array.isArray(array.expressions)) {
    return commonArgumentType(array.expressions.filter(isRecord), schema, undefined);
  }
  const fn = getAst(expression, "function");
  if (isRecord(fn) && String(fn.name ?? "").toLowerCase() === "array") {
    return commonArgumentType(functionArguments(fn), schema, undefined);
  }
  if (isRecord(fn) && String(fn.name ?? "").toLowerCase() === "sequence") {
    return commonArgumentType(functionArguments(fn), schema, undefined) ?? "integer";
  }
  const column = inferColumn(expression, "unnest", schema, undefined, "generic");
  if (column.type !== "unknown") return arrayElementType(column.type);
  return undefined;
}

function columnsFromOutputItems(
  items: OutputItem[],
  explicitColumns: unknown[],
  schema: ValidationSchema,
): SchemaColumn[] {
  return items.map((item, index) => {
    const inferred = inferColumn(
      item.expression,
      item.name ?? `column_${index + 1}`,
      item.schema ?? schema,
      undefined,
      "generic",
      item.source,
      item.tableAliases,
      item.functionReturnTypes,
    );
    return {
      name: columnDefinitionName(explicitColumns[index]) ?? item.name ?? `column_${index + 1}`,
      type: inferred.type,
      nullable: inferred.nullable,
    };
  });
}

function outputItemsFromReturning(
  statement: Record<string, unknown>,
  schema: ValidationSchema,
): OutputItem[] {
  const returning = Array.isArray(statement.returning) ? statement.returning : [];
  const output = outputItemsFromOutputClause(statement.output, schema, statement);
  return [...outputItemsFromExpressions(returning, schema, statement), ...output];
}

function outputItemsFromMerge(
  merge: Record<string, unknown>,
  schema: ValidationSchema,
): OutputItem[] {
  const returning =
    isRecord(merge.returning) &&
    isRecord(merge.returning.returning) &&
    Array.isArray(merge.returning.returning.expressions)
      ? merge.returning.returning.expressions
      : [];
  if (returning.length === 0) return [];
  return outputItemsFromExpressions(returning, schema, mergeOwner(merge));
}

function mergeOwner(merge: Record<string, unknown>): Record<string, unknown> {
  const target = mergeTargetRelation(merge.this);
  const using = isRecord(merge.using) ? [merge.using] : [];
  return {
    ...(target.table ? { table: target.table } : {}),
    ...(target.alias ? { alias: target.alias } : {}),
    ...(using.length > 0 ? { using } : {}),
  };
}

function mergeTargetRelation(target: unknown): { table?: unknown; alias?: unknown } {
  if (isRecord(target) && isRecord(target.table)) return { table: target.table };
  const alias = isRecord(target) && isRecord(target.alias) ? target.alias : undefined;
  if (alias && isRecord(alias.this) && isRecord(alias.this.table))
    return { table: alias.this.table, alias };
  return {};
}

function outputItemsFromOutputClause(
  output: unknown,
  schema: ValidationSchema,
  owner: Record<string, unknown>,
): OutputItem[] {
  if (!isRecord(output)) return [];
  const expressions = Array.isArray(output.expressions)
    ? output.expressions
    : Array.isArray(output.columns)
      ? output.columns
      : [];
  return outputItemsFromExpressions(expressions, schema, owner);
}

function outputItemsFromExpressions(
  expressions: unknown,
  schema: ValidationSchema,
  owner?: Record<string, unknown>,
  context?: StatementContext,
  dialect?: string,
): OutputItem[] {
  if (!Array.isArray(expressions)) return [];
  const expanded: OutputItem[] = [];
  const tableAliases = tableAliasesFromOwner(owner);
  for (const expression of expressions) {
    if (!isRecord(expression)) continue;
    const unwrapped = unwrapAlias(expression, dialect);
    const star = getAst(unwrapped.expression, "star");
    if (isRecord(star)) {
      expanded.push(...expandStar(star, schema, owner, tableAliases, dialect));
      continue;
    }
    expanded.push({
      ...unwrapped,
      schema,
      tableAliases,
      functionReturnTypes: context?.functionReturnTypes,
    });
  }
  return expanded;
}

function unwrapAlias(expression: AstExpression, dialect?: string): OutputItem {
  const alias = getAst(expression, "alias");
  if (isRecord(alias) && isRecord(alias.this)) {
    return {
      expression: alias.this,
      name: identifierName(alias.alias),
    };
  }
  if (isRecord(expression.this) && isRecord(expression.alias)) {
    return {
      expression: expression.this,
      name: identifierName(expression.alias),
    };
  }
  if (getAst(expression, "column") || getAst(expression, "dot") || getAst(expression, "star")) {
    return { expression, name: inferNameFromAst(expression, 0) };
  }
  if (!dialect) return { expression, name: inferNameFromAst(expression, 0) };
  const generated = generatedExpressionName(expression, dialect);
  return {
    expression,
    name: generated === undefined ? inferNameFromAst(expression, 0) : generated,
  };
}

function selectHasLimit(owner?: Record<string, unknown>): boolean {
  if (!owner) return false;
  if (owner.limit != null) return true;
  if (owner.fetch != null) return true;
  if (isRecord(owner.top)) return true;
  return false;
}

function hasStarModifiers(star: Record<string, unknown>): boolean {
  if (Array.isArray(star.except) && star.except.length > 0) return true;
  if (Array.isArray(star.rename) && star.rename.length > 0) return true;
  if (Array.isArray(star.replace) && star.replace.length > 0) return true;
  return false;
}

function matchingSelectStarProfile(
  dialect: string | undefined,
  owner: Record<string, unknown> | undefined,
  star: Record<string, unknown>,
  tables: SchemaTable[],
): DialectSelectStarProfileConfig | undefined {
  if (!dialect || tables.length !== 1 || hasStarModifiers(star)) return undefined;
  const profiles = getDialectConfig(dialect).selectStar.profiles;
  if (!profiles?.length) return undefined;
  const tableQualifier = identifierName(star.table)?.toLowerCase();
  if (tableQualifier && tableQualifier !== tables[0].name.toLowerCase()) return undefined;

  for (const profile of profiles) {
    if (profile.when === "withLimit" && !selectHasLimit(owner)) continue;
    if (profile.when === "withoutLimit" && selectHasLimit(owner)) continue;
    return profile;
  }
  return undefined;
}

function outputItemsFromSelectStarProfile(
  profile: DialectSelectStarProfileConfig,
  schema: ValidationSchema,
  tableAliases: TableAliasMap,
): OutputItem[] {
  return profile.columns.map((column) => ({
    expression: selectStarProfileExpression(column),
    name: column.name,
    source: column.source,
    type: column.type,
    schema,
    tableAliases,
  }));
}

function selectStarProfileExpression(
  column: DialectSelectStarColumnConfig,
): AstExpression {
  const sourceMatch = column.source.match(/^([^.]+)\.([^.]+)$/);
  if (sourceMatch) {
    const [, tableName, columnName] = sourceMatch;
    return {
      column: { name: { name: columnName }, table: { name: tableName } },
    };
  }
  return { literal: { value: null, literal_type: "null" } };
}

function expandStar(
  star: Record<string, unknown>,
  schema: ValidationSchema,
  owner?: Record<string, unknown>,
  tableAliases = tableAliasesFromOwner(owner),
  dialect?: string,
): OutputItem[] {
  const tableQualifier = identifierName(star.table)?.toLowerCase();
  const relation = tableQualifier ? tableAliases.get(tableQualifier) : undefined;
  const tableName = tableQualifier
    ? (relation?.tableName.toLowerCase() ?? tableQualifier)
    : undefined;
  const schemaName = relation?.schemaName?.toLowerCase();
  const fromTableNames = [
    ...new Set([...tableAliases.values()].map((entry) => entry.tableName)),
  ].map((name) => name.toLowerCase());
  const fromSchemaNames = [
    ...new Set(
      [...tableAliases.values()]
        .map((entry) => entry.schemaName)
        .filter((name): name is string => Boolean(name)),
    ),
  ].map((name) => name.toLowerCase());
  const tables = uniqueTablesByName(
    schema.tables.filter((table) => {
      if (tableName) {
        if (table.name.toLowerCase() !== tableName) return false;
        if (schemaName) return table.schema?.toLowerCase() === schemaName;
        return !table.schema;
      }
      if (schemaName && table.schema?.toLowerCase() !== schemaName) return false;
      if (fromTableNames.length > 0 && !fromTableNames.includes(table.name.toLowerCase()))
        return false;
      if (fromTableNames.length > 0 && table.schema && fromSchemaNames.length === 0) return false;
      if (
        fromSchemaNames.length > 0 &&
        (!table.schema || !fromSchemaNames.includes(table.schema.toLowerCase()))
      )
        return false;
      return true;
    }),
  );

  const profile = matchingSelectStarProfile(dialect, owner, star, tables);
  if (profile) {
    return outputItemsFromSelectStarProfile(profile, schema, tableAliases);
  }

  const except = new Set(
    (Array.isArray(star.except) ? star.except : [])
      .map(identifierName)
      .filter((name): name is string => Boolean(name))
      .map((name) => name.toLowerCase()),
  );
  const renames = new Map(
    (Array.isArray(star.rename) ? star.rename : [])
      .filter(Array.isArray)
      .map((pair) => [identifierName(pair[0])?.toLowerCase(), identifierName(pair[1])] as const)
      .filter((pair): pair is readonly [string, string] => Boolean(pair[0] && pair[1])),
  );
  const replacements = new Map(
    (Array.isArray(star.replace) ? star.replace : [])
      .filter(isRecord)
      .map((expression) => {
        const unwrapped = unwrapAlias(expression);
        return [unwrapped.name?.toLowerCase(), unwrapped.expression] as const;
      })
      .filter((pair): pair is readonly [string, AstExpression] => Boolean(pair[0])),
  );

  const suppressed = tableQualifier
    ? new Map<string, Set<string>>()
    : suppressedStarColumnsByTable(owner, schema);

  return tables.flatMap((table) =>
    table.columns
      .filter((column) => !isStarColumnExcepted(except, column.name, table, tableAliases))
      .filter((column) => !suppressed.get(table.name.toLowerCase())?.has(column.name.toLowerCase()))
      .map((column, index) => {
        const visibleName = relation?.visibleColumnNames[index] ?? column.name;
        const replacement =
          replacements.get(visibleName.toLowerCase()) ??
          replacements.get(column.name.toLowerCase());
        return {
          expression: replacement ?? {
            column: { name: { name: column.name }, table: { name: table.name } },
          },
          name:
            renames.get(visibleName.toLowerCase()) ??
            renames.get(column.name.toLowerCase()) ??
            visibleName,
          source: replacement ? "replace" : schemaColumnSource(table, column.name),
          schema,
          tableAliases,
        };
      }),
  );
}

function uniqueTablesByName(tables: SchemaTable[]): SchemaTable[] {
  const seen = new Set<string>();
  return tables.filter((table) => {
    const key = `${table.schema?.toLowerCase() ?? ""}.${table.name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isStarColumnExcepted(
  except: Set<string>,
  columnName: string,
  table: SchemaTable,
  tableAliases: TableAliasMap,
): boolean {
  const column = columnName.toLowerCase();
  if (except.has(column)) return true;
  const tableName = table.name.toLowerCase();
  const schemaName = table.schema?.toLowerCase();
  if (except.has(`${tableName}.${column}`)) return true;
  if (schemaName && except.has(`${schemaName}.${tableName}.${column}`)) return true;
  for (const [qualifier, relation] of tableAliases) {
    if (relation.tableName.toLowerCase() !== tableName) continue;
    if (schemaName && relation.schemaName && relation.schemaName.toLowerCase() !== schemaName)
      continue;
    if (except.has(`${qualifier}.${column}`)) return true;
  }
  return false;
}

function suppressedStarColumnsByTable(
  owner: Record<string, unknown> | undefined,
  schema: ValidationSchema,
): Map<string, Set<string>> {
  const suppressed = new Map<string, Set<string>>();
  if (!owner || !Array.isArray(owner.joins)) return suppressed;
  for (const join of owner.joins) {
    if (!isRecord(join) || !isRecord(join.this)) continue;
    const table = relationTableName(join.this);
    if (!table) continue;
    const usingColumns = Array.isArray(join.using)
      ? join.using.map(identifierName).filter((name): name is string => Boolean(name))
      : [];
    const naturalColumns =
      join.kind === "Natural" ? commonColumnsForNaturalJoin(owner, join.this, schema) : [];
    const columns = [...usingColumns, ...naturalColumns].map((name) => name.toLowerCase());
    if (columns.length === 0) continue;
    suppressed.set(table.toLowerCase(), new Set(columns));
  }
  return suppressed;
}

function commonColumnsForNaturalJoin(
  owner: Record<string, unknown>,
  rightSource: Record<string, unknown>,
  schema: ValidationSchema,
): string[] {
  const leftTables = relationSourcesFromOwner({ ...owner, joins: [] })
    .map(relationTableName)
    .filter((name): name is string => Boolean(name));
  const rightTable = relationTableName(rightSource);
  if (!rightTable) return [];
  const leftColumnNames = new Set(
    schema.tables
      .filter((table) =>
        leftTables.map((name) => name.toLowerCase()).includes(table.name.toLowerCase()),
      )
      .flatMap((table) => table.columns.map((column) => column.name.toLowerCase())),
  );
  return (
    schema.tables
      .find((table) => table.name.toLowerCase() === rightTable.toLowerCase())
      ?.columns.map((column) => column.name)
      .filter((name) => leftColumnNames.has(name.toLowerCase())) ?? []
  );
}

function relationTableName(source: Record<string, unknown>): string | undefined {
  return sourceRelationName(source);
}

function relationSchemaName(source: Record<string, unknown>): string | undefined {
  const table = isRecord(source.table) ? source.table : undefined;
  return table ? identifierName(table.schema) : undefined;
}

function tableAliasesFromOwner(owner?: Record<string, unknown>): TableAliasMap {
  const aliases: TableAliasMap = new Map();
  for (const source of relationSourcesFromOwner(owner)) {
    addTableAlias(aliases, source);
  }
  return aliases;
}

function relationSourcesFromOwner(owner?: Record<string, unknown>): Record<string, unknown>[] {
  const from =
    isRecord(owner?.from) && Array.isArray(owner.from.expressions) ? owner.from.expressions : [];
  const fromClause =
    isRecord(owner?.from_clause) && Array.isArray(owner.from_clause.expressions)
      ? owner.from_clause.expressions
      : [];
  const joins = Array.isArray(owner?.joins) ? owner.joins : [];
  const fromJoins = Array.isArray(owner?.from_joins) ? owner.from_joins : [];
  const using = Array.isArray(owner?.using) ? owner.using : [];
  const lateralViews = Array.isArray(owner?.lateral_views) ? owner.lateral_views : [];
  const baseNullable = joins.some(
    (join) => isRecord(join) && ["Right", "Full"].includes(String(join.kind ?? "")),
  );
  const sources = [...from, ...fromClause]
    .filter(isRecord)
    .map((source) => (baseNullable ? { ...source, nullableRelation: true } : source));
  if (isRecord(owner?.table)) {
    sources.unshift({
      table: owner.table,
      ...(isRecord(owner.alias) ? { alias: owner.alias } : {}),
    });
    sources.unshift({ table: owner.table, alias: { name: "inserted" } });
    sources.unshift({ table: owner.table, alias: { name: "deleted" } });
    sources.unshift({ table: owner.table, alias: { name: "excluded" } });
    sources.unshift({ table: owner.table, alias: { name: "old" } });
    sources.unshift({ table: owner.table, alias: { name: "new" } });
  }
  for (const join of joins) {
    if (isRecord(join) && isRecord(join.this)) {
      const joinNullable = ["Left", "Full"].includes(String(join.kind ?? ""));
      sources.push(joinNullable ? { ...join.this, nullableRelation: true } : join.this);
    }
  }
  for (const join of fromJoins) {
    if (isRecord(join) && isRecord(join.this)) sources.push(join.this);
  }
  for (const source of using) {
    if (isRecord(source)) sources.push({ table: source });
  }
  for (const lateralView of lateralViews) {
    if (isRecord(lateralView))
      sources.push({
        lateral: {
          alias: lateralView.table_alias,
          column_aliases: lateralView.column_aliases,
        },
      });
  }
  return sources;
}

function addTableAlias(aliases: TableAliasMap, source?: Record<string, unknown>): void {
  if (!source) return;
  const table = isRecord(source.table) ? source.table : undefined;
  const subquery = isRecord(source.subquery) ? source.subquery : undefined;
  const lateral = isRecord(source.lateral) ? source.lateral : undefined;
  const pivot = isRecord(source.pivot) ? source.pivot : undefined;
  const unpivot = isRecord(source.unpivot) ? source.unpivot : undefined;
  const matchRecognize = isRecord(source.match_recognize) ? source.match_recognize : undefined;
  const openJson = isRecord(source.open_j_s_o_n) ? source.open_j_s_o_n : undefined;
  const jsonTable = isRecord(source.j_s_o_n_table) ? source.j_s_o_n_table : undefined;
  const xmlTable = isRecord(source.x_m_l_table) ? source.x_m_l_table : undefined;
  const fn = isRecord(source.function) ? source.function : undefined;
  const unnest = isRecord(source.unnest) ? source.unnest : undefined;
  const tupleAlias = tupleTableAliasName(source);
  const aliasNode =
    isRecord(source?.alias) && isRecord(source.alias.this) ? source.alias : undefined;
  const tableName = sourceRelationName(source);
  if (!tableName) return;
  const schemaName = table ? identifierName(table.schema) : undefined;
  const columnAliases = table
    ? columnAliasesFromRelation(table)
    : subquery
      ? columnAliasesFromRelation(subquery)
      : lateral
        ? columnAliasesFromRelation(lateral)
        : pivot
          ? columnAliasesFromRelation(pivot)
          : unpivot
            ? columnAliasesFromRelation(unpivot)
            : matchRecognize
              ? columnAliasesFromRelation(matchRecognize)
              : openJson || jsonTable || xmlTable || tupleAlias || fn || unnest
                ? emptyRelationColumnAliases()
                : aliasNode
                  ? columnAliasesFromRelation(aliasNode)
                  : emptyRelationColumnAliases();
  const entry = {
    tableName,
    ...(schemaName ? { schemaName } : {}),
    ...(source?.nullableRelation === true ? { nullable: true } : {}),
    ...columnAliases,
  };
  aliases.set(tableName.toLowerCase(), entry);
  if (schemaName) aliases.set(`${schemaName}.${tableName}`.toLowerCase(), entry);
  const sourceAlias = aliasNode ? identifierName(aliasNode.alias) : identifierName(source?.alias);
  const alias =
    sourceAlias ??
    (table
      ? identifierName(table.alias)
      : subquery
        ? identifierName(subquery.alias)
        : lateral
          ? identifierName(lateral.alias)
          : pivot
            ? identifierName(pivot.alias)
            : unpivot
              ? identifierName(unpivot.alias)
              : matchRecognize
                ? identifierName(matchRecognize.alias)
                : undefined);
  if (alias) aliases.set(alias.toLowerCase(), entry);
}

function sourceRelationName(source: Record<string, unknown>): string | undefined {
  const table = isRecord(source.table) ? source.table : undefined;
  if (table) return identifierName(table.name);
  const subquery = isRecord(source.subquery) ? source.subquery : undefined;
  if (subquery) return identifierName(subquery.alias);
  const lateral = isRecord(source.lateral) ? source.lateral : undefined;
  if (lateral) return identifierName(lateral.alias);
  const pivot = isRecord(source.pivot) ? source.pivot : undefined;
  if (pivot)
    return identifierName(pivot.alias) ?? relationTableName(isRecord(pivot.this) ? pivot.this : {});
  const unpivot = isRecord(source.unpivot) ? source.unpivot : undefined;
  if (unpivot)
    return (
      identifierName(unpivot.alias) ?? relationTableName(isRecord(unpivot.this) ? unpivot.this : {})
    );
  const matchRecognize = isRecord(source.match_recognize) ? source.match_recognize : undefined;
  if (matchRecognize)
    return (
      identifierName(matchRecognize.alias) ??
      relationTableName(isRecord(matchRecognize.this) ? matchRecognize.this : {})
    );
  if (isRecord(source.open_j_s_o_n)) return "openjson";
  if (isRecord(source.j_s_o_n_table)) return "json_table";
  if (isRecord(source.x_m_l_table)) return "xmltable";
  const tupleAlias = tupleTableAliasName(source);
  if (tupleAlias) return tupleAlias;
  const fn = isRecord(source.function) ? source.function : undefined;
  if (fn) return String(fn.name ?? "").toLowerCase();
  if (isRecord(source.unnest)) return identifierName(source.unnest.alias) ?? "unnest";
  const aliasNode =
    isRecord(source.alias) && isRecord(source.alias.this) ? source.alias : undefined;
  return aliasNode ? identifierName(aliasNode.alias) : undefined;
}

function tupleTableAliasName(source: Record<string, unknown>): string | undefined {
  const expressions =
    isRecord(source.tuple) && Array.isArray(source.tuple.expressions)
      ? source.tuple.expressions
      : [];
  const tableAlias = expressions.find(
    (expression) => isRecord(expression) && isRecord(expression.table_alias),
  );
  return isRecord(tableAlias) && isRecord(tableAlias.table_alias)
    ? identifierName(tableAlias.table_alias.this)
    : undefined;
}

function columnAliasesFromRelation(
  relation: Record<string, unknown>,
): Omit<TableAliasEntry, "tableName"> {
  const aliases = Array.isArray(relation.column_aliases)
    ? relation.column_aliases.map(identifierName).filter((name): name is string => Boolean(name))
    : [];
  if (aliases.length === 0) return emptyRelationColumnAliases();
  const visibleColumnNames: string[] = [];
  for (const [index, alias] of aliases.entries()) {
    visibleColumnNames[index] = alias;
  }
  return { visibleColumnNames };
}

function emptyRelationColumnAliases(): Omit<TableAliasEntry, "tableName"> {
  return { visibleColumnNames: [] };
}

function schemaTableName(table: SchemaTable): string {
  return table.schema ? `${table.schema}.${table.name}` : table.name;
}

function schemaColumnSource(table: SchemaTable, columnName: string): string {
  return `${schemaTableName(table)}.${columnName}`;
}

function inferNameFromAst(expression: AstExpression, index: number): string {
  const alias = getAst(expression, "alias");
  if (isRecord(alias)) return identifierName(alias.alias) ?? `column_${index || 1}`;
  const dot = getAst(expression, "dot");
  if (isRecord(dot)) return identifierName(dot.field) ?? `column_${index || 1}`;
  const column = getAst(expression, "column");
  if (isRecord(column)) return identifierName(column.name) ?? `column_${index || 1}`;
  const names = safeColumnNames(expression);
  if (names.length === 1) return cleanIdentifier(names[0]);
  if (isAst(expression, "star")) return "*";
  return `column_${index || 1}`;
}

function generatedExpressionName(expression: AstExpression, dialect: string): string | undefined {
  const policy = getDialectConfig(dialect).generatedNames;
  const count = getAst(expression, "count");
  if (isRecord(count) && count.star === true) {
    return policy.countStar;
  }
  const add = getAst(expression, "add");
  if (isRecord(add)) {
    const left = simpleGeneratedExpressionPart(add.left, dialect);
    const right = simpleGeneratedExpressionPart(add.right, dialect);
    if (left && right) {
      if (policy.add === "empty") return "";
      if (policy.add === "postgresColumn") return "?column?";
      if (policy.add === "duckdbParenthesized") return `(${left} + ${right})`;
      if (policy.add === "oracleUpperCompact")
        return `${left.toUpperCase()}+${right.toUpperCase()}`;
      return `${left}+${right}`;
    }
  }
  const upper = getAst(expression, "upper");
  if (isRecord(upper) && isRecord(upper.this)) {
    const arg = simpleGeneratedExpressionPart(upper.this, dialect);
    if (arg) {
      if (policy.upper === "empty") return "";
      if (policy.upper === "postgresFunction") return "upper";
      if (policy.upper === "oracleUpperCall") return `UPPER(${arg.toUpperCase()})`;
      if (policy.upper === "duckdbQuotedCall") return `upper("${arg}")`;
      return `upper(${arg})`;
    }
  }
  return policy.fallback;
}

function simpleGeneratedExpressionPart(expression: unknown, dialect: string): string | undefined {
  const column = getAst(expression, "column");
  if (isRecord(column)) return identifierName(column.name);
  const literal = getAst(expression, "literal");
  if (isRecord(literal) && typeof literal.value === "string") return literal.value;
  return undefined;
}

function firstExpression(values: unknown[]): AstExpression | undefined {
  return values.find(isRecord);
}

function getAst(expression: unknown, key: string): unknown {
  return isRecord(expression) ? expression[key] : undefined;
}

function containsAstKey(expression: unknown, key: string): boolean {
  if (!expression || typeof expression !== "object") return false;
  if (Array.isArray(expression)) return expression.some((item) => containsAstKey(item, key));
  if (isRecord(expression) && key in expression) return true;
  return Object.values(expression).some((value) => containsAstKey(value, key));
}

function isAst(expression: unknown, key: string): boolean {
  return isRecord(expression) && key in expression;
}

function identifierName(identifier: unknown): string | undefined {
  if (!identifier) return undefined;
  if (typeof identifier === "string") return cleanIdentifier(identifier);
  if (isRecord(identifier) && typeof identifier.name === "string")
    return cleanIdentifier(identifier.name);
  if (isRecord(identifier) && isRecord(identifier.column))
    return identifierName(identifier.column.name);
  if (isRecord(identifier) && isRecord(identifier.var) && typeof identifier.var.this === "string")
    return cleanIdentifier(identifier.var.this);
  if (isRecord(identifier) && isRecord(identifier.identifier))
    return identifierName(identifier.identifier);
  return undefined;
}

function safeColumnNames(expression: AstExpression): string[] {
  try {
    return ast.getColumnNames(expression as never).map(String);
  } catch {
    return [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toPolyglotSchema(schema: ValidationSchema): PolyglotSchema {
  return {
    tables: schema.tables.map((table) => ({
      ...table,
      columns: table.columns.map((column) => ({
        ...column,
        type: column.type,
      })),
    })),
  };
}

function toDiagnostic(input: PolyglotDiagnostic, severity?: Diagnostic["severity"]): Diagnostic {
  return {
    code: input.code,
    message: input.message ?? String(input),
    severity: severity ?? input.severity,
    line: input.line,
    column: input.column,
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

interface PolyglotParseResult {
  success: boolean;
  ast?: unknown;
  error?: string;
}

interface PolyglotGenerateResult {
  success: boolean;
  sql?: string | string[];
  error?: string | null;
}

interface PolyglotDiagnostic {
  code?: string;
  message?: string;
  severity?: Diagnostic["severity"];
  line?: number;
  column?: number;
}

interface PolyglotValidationResult {
  errors?: PolyglotDiagnostic[];
  warnings?: PolyglotDiagnostic[];
}

interface PolyglotAnnotateResult {
  success: boolean;
  ast?: unknown[];
  error?: string;
}

interface PolyglotSchema {
  tables: Array<{
    name: string;
    schema?: string;
    columns: Array<{
      name: string;
      type: string;
      nullable?: boolean;
      primaryKey?: boolean;
      unique?: boolean;
    }>;
  }>;
}

function dataTypeToString(dataType: unknown): string | undefined {
  if (!dataType || typeof dataType !== "object") return undefined;
  const record = dataType as Record<string, unknown>;
  if (record.data_type === "nullable" || record.data_type === "low_cardinality") {
    return dataTypeToString(record.inner) ?? dataTypeToString(record.value) ?? "unknown";
  }
  if (record.data_type === "struct" && Array.isArray(record.fields)) {
    const fields = record.fields.flatMap((field) => {
      if (!field || typeof field !== "object") return [];
      const fieldRecord = field as Record<string, unknown>;
      const name = identifierName(fieldRecord.name);
      const type = dataTypeToString(fieldRecord.data_type) ?? "unknown";
      return name ? [`${name} ${type}`] : [];
    });
    return `struct<${fields.join(", ")}>`;
  }
  if (record.data_type === "array") {
    return `array<${dataTypeToString(record.element_type) ?? "unknown"}>`;
  }
  if (record.data_type === "map") {
    return `map<${dataTypeToString(record.key_type) ?? "unknown"}, ${dataTypeToString(record.value_type) ?? "unknown"}>`;
  }
  const value =
    record.data_type === "custom" && typeof record.name === "string"
      ? record.name
      : (record.data_type ?? record.type ?? record.name);
  if (value === "timestamp" && record.timezone === true && typeof record.precision === "number")
    return `timestamptz(${record.precision})`;
  if (value === "timestamp" && record.timezone === true) return "timestamptz";
  if (typeof value === "string") {
    const normalizedValue = value.toLowerCase().replace(/\s+/g, "");
    if (
      typeof record.length === "number" &&
      [
        "char",
        "character",
        "varchar",
        "var_char",
        "varchar2",
        "nvarchar",
        "nvarchar2",
        "nchar",
        "raw",
        "binary",
        "varbinary",
        "var_binary",
      ].includes(normalizedValue)
    ) {
      return `${normalizedValue === "var_char" || normalizedValue === "var_binary" ? normalizedValue.replace("_", "") : normalizedValue}(${record.length})`;
    }
    if (
      typeof record.precision === "number" &&
      [
        "decimal",
        "dec",
        "numeric",
        "number",
        "timestamp",
        "time",
        "datetime",
        "datetime2",
      ].includes(normalizedValue)
    ) {
      return `${normalizedValue}(${record.precision}${typeof record.scale === "number" ? `,${record.scale}` : ""})`;
    }
  }
  return typeof value === "string" ? normalizeDataTypeName(value) : undefined;
}

function normalizeDataTypeName(value: string): string {
  return normalizeTypeName(value);
}

function emptyStatementContext(): StatementContext {
  return {
    prepared: new Map(),
    functionReturnTypes: new Map(),
    tableFunctions: new Map(),
    procedureResultSets: new Map(),
    typeAliases: new Map(),
  };
}

function statementContextFromSchema(schema: ValidationSchema): StatementContext {
  const context = emptyStatementContext();
  for (const fn of schema.functions ?? []) {
    for (const key of schemaFunctionKeys(fn)) {
      context.functionReturnTypes.set(key, fn.returnType);
    }
  }
  for (const procedure of schema.procedures ?? []) {
    for (const key of schemaProcedureKeys(procedure)) {
      context.procedureResultSets.set(
        key,
        staticColumns(procedure.columns.map((column) => [column.name, column.type])),
      );
    }
  }
  return context;
}

function schemaFunctionKeys(fn: SchemaFunction): string[] {
  const name = fn.name.toLowerCase();
  const schema = fn.schema?.toLowerCase();
  return schema ? [`${schema}.${name}`, name] : [name];
}

function schemaProcedureKeys(procedure: SchemaProcedure): string[] {
  const name = procedure.name.toLowerCase();
  const schema = procedure.schema?.toLowerCase();
  return schema ? [`${schema}.${name}`, name] : [name];
}
