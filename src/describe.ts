import { parse, validateWithSchema, annotateTypes, ast } from '@polyglot-sql/sdk';
import { parseBinds } from './binds.js';
import { loadSchema, mergeSchemas, splitTopLevel, cleanIdentifier } from './schema.js';
import type {
  BindSpec,
  DescribeColumn,
  DescribeInput,
  DescribeResult,
  Diagnostic,
  SchemaColumn,
  SchemaTable,
  StatementResultKind,
  StatementSummary,
  ValidationSchema,
} from './types.js';

export async function describeQuery(input: DescribeInput): Promise<DescribeResult> {
  const dialect = input.dialect ?? 'generic';
  const binds = typeof input.binds === 'string' || input.binds === undefined ? parseBinds(input.binds) : input.binds;
  const loadedSchema = input.schemaPatterns?.length ? await loadSchema(input.schemaPatterns, { cwd: input.cwd, dialect }) : { tables: [] };
  const schema = mergeSchemas(input.schema, loadedSchema);
  const effectiveSchema = mergeSchemas(schema, builtinMetadataSchema());
  const warnings: string[] = [];
  const diagnostics: Diagnostic[] = [];

  const parseResult = parse(input.sql, dialect as never) as PolyglotParseResult;
  if (!parseResult.success) {
    throw new Error(parseResult.error ?? 'Failed to parse SQL.');
  }
  const annotatedAst = annotateSqlTypes(input.sql, dialect, effectiveSchema) ?? parseResult.ast;

  if (schema.tables.length > 0) {
    const validation = validateWithSchema(input.sql, toPolyglotSchema(effectiveSchema), dialect, {
      checkTypes: true,
      checkReferences: true,
      semantic: true,
    }) as PolyglotValidationResult;
    if (validation.errors) {
      diagnostics.push(...validation.errors.map((error) => toDiagnostic(error)));
    }
    if (validation.warnings) {
      diagnostics.push(...validation.warnings.map((warning) => toDiagnostic(warning, 'warning')));
    }
  }

  const resultSets = extractResultSets(annotatedAst, effectiveSchema, dialect).map((items, resultSetIndex) => ({
    index: resultSetIndex + 1,
    columns: describeOutputItems(items, effectiveSchema, binds, dialect, warnings),
  })).filter((resultSet) => resultSet.columns.length > 0);
  const statements = summarizeStatements(annotatedAst, resultSets);
  const statementDiagnostics = diagnosticsForStatements(statements, resultSets.length === 0);
  warnings.push(...statementDiagnostics.map((diagnostic) => diagnostic.message));
  diagnostics.push(...statementDiagnostics);

  const columns = resultSets[0]?.columns ?? [];
  const returnedDiagnostics = suppressResolvedPreparedDiagnostics(
    suppressRuntimeOnlyDiagnostics(
      suppressStaticStatementDiagnostics(
        suppressKnownSchemaDiagnostics(
          suppressResolvedInsertValueDiagnostics(
            suppressResolvedSourceDiagnostics(
              suppressResolvedColumnDiagnostics(
                suppressResolvedNestedDiagnostics(diagnostics, resultSets.flatMap((resultSet) => resultSet.columns)),
                resultSets.flatMap((resultSet) => resultSet.columns),
              ),
              resultSets.flatMap((resultSet) => resultSet.columns),
            ),
            annotatedAst,
          ),
          effectiveSchema,
        ),
        annotatedAst,
        resultSets,
      ),
      statements,
    ),
    annotatedAst,
    resultSets,
  );

  return { columns, resultSets, statements, warnings: unique(warnings), diagnostics: returnedDiagnostics, binds, schema };
}

function describeOutputItems(
  outputItems: OutputItem[],
  schema: ValidationSchema,
  binds: BindSpec,
  dialect: string,
  warnings: string[],
): DescribeColumn[] {
  return outputItems.map((item, index) => {
    const name = item.name ?? inferNameFromAst(item.expression, index + 1);
    const inferred = inferColumn(item.expression, name, item.schema ?? schema, binds, dialect, item.source, item.tableAliases);
    if (inferred.type === 'unknown' && inferred.note) warnings.push(inferred.note);
    return {
      index: index + 1,
      name,
      ...inferred,
    };
  });
}

function inferColumn(
  expression: AstExpression,
  name: string,
  schema: ValidationSchema,
  binds: BindSpec,
  _dialect: string,
  explicitSource?: string,
  tableAliases?: TableAliasMap,
): Omit<DescribeColumn, 'index' | 'name'> {
  const constructorType = inferConstructorType(expression, schema, binds);
  if (constructorType) {
    return { type: constructorType, confidence: 'medium', source: 'expression' };
  }

  const jsonType = inferJsonType(expression);
  if (jsonType) {
    return { type: jsonType, confidence: 'medium', source: 'expression' };
  }

  const temporalType = inferTemporalFunctionType(expression, schema, binds);
  if (temporalType) {
    return { type: temporalType, confidence: 'medium', source: 'expression' };
  }

  const geospatialType = inferGeospatialFunctionType(expression);
  if (geospatialType) {
    return { type: geospatialType, confidence: 'medium', source: 'expression' };
  }

  const identifierHashRandomType = inferIdentifierHashRandomType(expression);
  if (identifierHashRandomType) {
    return { type: identifierHashRandomType, confidence: 'medium', source: 'expression' };
  }

  const aggregateType = inferAggregateType(expression, schema, binds);
  if (aggregateType) {
    return { type: aggregateType, confidence: 'medium', source: 'expression' };
  }

  const sourceColumn = findSchemaColumn(expression, schema, tableAliases);
  if (sourceColumn) {
    return {
      type: sourceColumn.column.type,
      nullable: sourceColumn.nullable,
      confidence: 'high',
      source: schemaColumnSource(sourceColumn.table, sourceColumn.column.name),
    };
  }

  const bindSensitiveType = inferBindSensitiveFunctionType(expression, binds);
  if (bindSensitiveType) {
    return { type: bindSensitiveType, confidence: 'medium', source: 'expression' };
  }

  const annotatedType = dataTypeToString(ast.getInferredType(expression as never));
  if (annotatedType) {
    return { type: annotatedType, confidence: 'high', source: 'polyglot' };
  }

  const castType = inferCastType(expression);
  if (castType) {
    return { type: castType, confidence: 'high', source: 'cast' };
  }

  const literalType = inferLiteralType(expression);
  if (literalType) {
    return { type: literalType, confidence: 'high', source: 'literal' };
  }

  const bindType = inferBindType(expression, binds);
  if (bindType) {
    return { type: bindType, confidence: 'medium', source: 'bind' };
  }

  const namedBindColumnType = inferNamedBindFromColumn(expression, binds);
  if (namedBindColumnType) {
    return { type: namedBindColumnType, confidence: 'medium', source: 'bind' };
  }

  const nestedColumn = inferNestedColumn(expression, schema, tableAliases);
  if (nestedColumn) {
    return {
      type: nestedColumn.type,
      nullable: nestedColumn.nullable,
      confidence: 'medium',
      source: nestedColumn.source,
    };
  }

  const wholeRowType = inferWholeRowType(expression, schema, tableAliases);
  if (wholeRowType) {
    return { type: wholeRowType.type, confidence: 'medium', source: wholeRowType.source };
  }

  const expressionType = inferExpressionType(expression, schema, binds);
  if (expressionType) {
    return { type: expressionType, confidence: 'medium', source: 'expression' };
  }

  if (explicitSource) {
    return { type: 'unknown', confidence: 'low', source: explicitSource, note: `Could not infer type for result column "${name}".` };
  }

  return {
    type: 'unknown',
    confidence: 'low',
    note: `Could not infer type for result column "${name}".`,
  };
}

function annotateSqlTypes(sql: string, dialect: string, schema: ValidationSchema): unknown[] | undefined {
  try {
    const result = annotateTypes(sql, dialect as never, toPolyglotSchema(schema) as never) as PolyglotAnnotateResult;
    return result.success ? result.ast : undefined;
  } catch {
    return undefined;
  }
}

function builtinMetadataSchema(): ValidationSchema {
  const text = (name: string): SchemaColumn => ({ name, type: 'text' });
  const integer = (name: string): SchemaColumn => ({ name, type: 'integer' });
  const boolean = (name: string): SchemaColumn => ({ name, type: 'boolean' });
  const timestamp = (name: string): SchemaColumn => ({ name, type: 'timestamp' });
  return {
    tables: [
      {
        schema: 'information_schema',
        name: 'tables',
        columns: [
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          text('table_type'),
          text('self_referencing_column_name'),
          text('reference_generation'),
          text('user_defined_type_catalog'),
          text('user_defined_type_schema'),
          text('user_defined_type_name'),
          boolean('is_insertable_into'),
          boolean('is_typed'),
          text('commit_action'),
          timestamp('created'),
          timestamp('last_altered'),
          integer('row_count'),
          integer('bytes'),
          text('owner'),
          text('retention_time'),
          boolean('is_transient'),
          boolean('is_temporary'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'columns',
        columns: [
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          text('column_name'),
          integer('ordinal_position'),
          text('column_default'),
          boolean('is_nullable'),
          text('data_type'),
          integer('character_maximum_length'),
          integer('character_octet_length'),
          integer('numeric_precision'),
          integer('numeric_precision_radix'),
          integer('numeric_scale'),
          integer('datetime_precision'),
          text('interval_type'),
          integer('interval_precision'),
          text('character_set_catalog'),
          text('character_set_schema'),
          text('character_set_name'),
          text('collation_catalog'),
          text('collation_schema'),
          text('collation_name'),
          text('domain_catalog'),
          text('domain_schema'),
          text('domain_name'),
          text('udt_catalog'),
          text('udt_schema'),
          text('udt_name'),
          text('scope_catalog'),
          text('scope_schema'),
          text('scope_name'),
          integer('maximum_cardinality'),
          text('dtd_identifier'),
          boolean('is_self_referencing'),
          boolean('is_identity'),
          text('identity_generation'),
          text('identity_start'),
          text('identity_increment'),
          text('identity_maximum'),
          text('identity_minimum'),
          boolean('identity_cycle'),
          boolean('is_generated'),
          text('generation_expression'),
          boolean('is_updatable'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'schemata',
        columns: [
          text('project_id'),
          text('project_number'),
          text('catalog_name'),
          text('schema_name'),
          text('schema_owner'),
          text('default_character_set_catalog'),
          text('default_character_set_schema'),
          text('default_character_set_name'),
          text('sql_path'),
        ],
      },
      {
        name: 'information_schema.schemata',
        columns: [
          text('project_id'),
          text('project_number'),
          text('catalog_name'),
          text('schema_name'),
          text('schema_owner'),
          text('default_character_set_catalog'),
          text('default_character_set_schema'),
          text('default_character_set_name'),
          text('sql_path'),
        ],
      },
      {
        name: 'information_schema.tables',
        columns: [
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          text('table_type'),
          timestamp('creation_time'),
          timestamp('ddl'),
        ],
      },
      {
        name: 'information_schema.columns',
        columns: [
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          text('column_name'),
          integer('ordinal_position'),
          boolean('is_nullable'),
          text('data_type'),
        ],
      },
      {
        name: 'information_schema.routines',
        columns: [
          text('specific_catalog'),
          text('specific_schema'),
          text('specific_name'),
          text('routine_catalog'),
          text('routine_schema'),
          text('routine_name'),
          text('routine_type'),
          text('data_type'),
        ],
      },
      {
        name: 'information_schema.datasets',
        columns: [
          text('project_id'),
          text('dataset_id'),
          text('schema_name'),
          text('location'),
          timestamp('creation_time'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'views',
        columns: [
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          text('view_definition'),
          boolean('check_option'),
          boolean('is_updatable'),
          boolean('is_insertable_into'),
          boolean('is_trigger_updatable'),
          boolean('is_trigger_deletable'),
          boolean('is_trigger_insertable_into'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'routines',
        columns: [
          text('specific_catalog'),
          text('specific_schema'),
          text('specific_name'),
          text('routine_catalog'),
          text('routine_schema'),
          text('routine_name'),
          text('routine_type'),
          text('data_type'),
          text('routine_definition'),
          text('external_name'),
          text('external_language'),
          timestamp('created'),
          timestamp('last_altered'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'table_constraints',
        columns: [
          text('constraint_catalog'),
          text('constraint_schema'),
          text('constraint_name'),
          text('table_schema'),
          text('table_name'),
          text('constraint_type'),
          boolean('is_deferrable'),
          boolean('initially_deferred'),
          boolean('enforced'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'key_column_usage',
        columns: [
          text('constraint_catalog'),
          text('constraint_schema'),
          text('constraint_name'),
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          text('column_name'),
          integer('ordinal_position'),
          integer('position_in_unique_constraint'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'referential_constraints',
        columns: [
          text('constraint_catalog'),
          text('constraint_schema'),
          text('constraint_name'),
          text('unique_constraint_catalog'),
          text('unique_constraint_schema'),
          text('unique_constraint_name'),
          text('match_option'),
          text('update_rule'),
          text('delete_rule'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'triggers',
        columns: [
          text('trigger_catalog'),
          text('trigger_schema'),
          text('trigger_name'),
          text('event_manipulation'),
          text('event_object_catalog'),
          text('event_object_schema'),
          text('event_object_table'),
          integer('action_order'),
          text('action_condition'),
          text('action_statement'),
          text('action_orientation'),
          text('action_timing'),
          timestamp('created'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'parameters',
        columns: [
          text('specific_catalog'),
          text('specific_schema'),
          text('specific_name'),
          integer('ordinal_position'),
          text('parameter_mode'),
          text('is_result'),
          text('as_locator'),
          text('parameter_name'),
          text('data_type'),
          integer('character_maximum_length'),
          integer('numeric_precision'),
          integer('numeric_scale'),
          text('routine_catalog'),
          text('routine_schema'),
          text('routine_name'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'statistics',
        columns: [
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          boolean('non_unique'),
          text('index_schema'),
          text('index_name'),
          integer('seq_in_index'),
          text('column_name'),
          text('collation'),
          integer('cardinality'),
          integer('sub_part'),
          text('packed'),
          text('nullable'),
          text('index_type'),
          text('comment'),
          text('index_comment'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'table_privileges',
        columns: [
          text('grantor'),
          text('grantee'),
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          text('privilege_type'),
          boolean('is_grantable'),
          boolean('with_hierarchy'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'column_privileges',
        columns: [
          text('grantor'),
          text('grantee'),
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          text('column_name'),
          text('privilege_type'),
          boolean('is_grantable'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'query_history',
        columns: [
          text('query_id'),
          text('query_text'),
          text('database_name'),
          text('schema_name'),
          text('query_type'),
          text('session_id'),
          text('user_name'),
          text('role_name'),
          text('warehouse_name'),
          timestamp('start_time'),
          timestamp('end_time'),
          integer('total_elapsed_time'),
          integer('rows_produced'),
          integer('bytes_scanned'),
          integer('bytes_written'),
          text('execution_status'),
          text('error_code'),
          text('error_message'),
        ],
      },
      {
        schema: 'information_schema',
        name: 'warehouses',
        columns: [
          text('warehouse_name'),
          text('warehouse_type'),
          text('warehouse_size'),
          text('state'),
          integer('cluster_count'),
          integer('max_cluster_count'),
          integer('min_cluster_count'),
          integer('auto_suspend'),
          boolean('auto_resume'),
          text('resource_monitor'),
          text('comment'),
        ],
      },
      {
        name: 'sqlite_master',
        columns: [
          text('type'),
          text('name'),
          text('tbl_name'),
          integer('rootpage'),
          text('sql'),
        ],
      },
      {
        name: 'sqlite_schema',
        columns: [
          text('type'),
          text('name'),
          text('tbl_name'),
          integer('rootpage'),
          text('sql'),
        ],
      },
      {
        name: 'information_schema.views',
        columns: [
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          text('view_definition'),
          boolean('check_option'),
          boolean('use_standard_sql'),
        ],
      },
      {
        name: 'information_schema.jobs',
        columns: [
          text('project_id'),
          text('project_number'),
          text('user_email'),
          text('job_id'),
          text('job_type'),
          text('statement_type'),
          timestamp('creation_time'),
          timestamp('start_time'),
          timestamp('end_time'),
          text('state'),
          text('reservation_id'),
          integer('total_bytes_processed'),
          integer('total_slot_ms'),
          text('error_result'),
        ],
      },
      {
        name: 'information_schema.reservations',
        columns: [
          text('project_id'),
          text('project_number'),
          text('reservation_name'),
          text('ignore_idle_slots'),
          integer('slot_capacity'),
          timestamp('creation_time'),
          timestamp('update_time'),
        ],
      },
      {
        schema: 'pg_catalog',
        name: 'pg_tables',
        columns: [
          text('schemaname'),
          text('tablename'),
          text('tableowner'),
          text('tablespace'),
          boolean('hasindexes'),
          boolean('hasrules'),
          boolean('hastriggers'),
          boolean('rowsecurity'),
        ],
      },
      {
        schema: 'pg_catalog',
        name: 'pg_class',
        columns: [
          text('relname'),
          integer('relnamespace'),
          text('relkind'),
          integer('relowner'),
          integer('relam'),
          integer('relfilenode'),
          integer('reltablespace'),
          integer('relpages'),
          integer('reltuples'),
          boolean('relhasindex'),
          boolean('relisshared'),
          text('relpersistence'),
          boolean('relrowsecurity'),
        ],
      },
      {
        schema: 'pg_catalog',
        name: 'pg_namespace',
        columns: [
          integer('oid'),
          text('nspname'),
          integer('nspowner'),
          text('nspacl'),
        ],
      },
      {
        name: 'pg_available_extensions',
        columns: [
          text('name'),
          text('default_version'),
          text('installed_version'),
          text('comment'),
        ],
      },
      {
        name: 'pg_settings',
        columns: [
          text('name'),
          text('setting'),
          text('unit'),
          text('category'),
          text('short_desc'),
          text('extra_desc'),
          text('context'),
          text('vartype'),
          text('source'),
          boolean('pending_restart'),
        ],
      },
      {
        name: 'pg_stat_activity',
        columns: [
          integer('datid'),
          text('datname'),
          integer('pid'),
          integer('leader_pid'),
          integer('usesysid'),
          text('usename'),
          text('application_name'),
          text('client_addr'),
          text('state'),
          text('query'),
          timestamp('query_start'),
        ],
      },
      {
        name: 'pg_roles',
        columns: [
          text('rolname'),
          boolean('rolsuper'),
          boolean('rolinherit'),
          boolean('rolcreaterole'),
          boolean('rolcreatedb'),
          boolean('rolcanlogin'),
          integer('rolconnlimit'),
        ],
      },
      {
        name: 'pg_user',
        columns: [
          text('usename'),
          integer('usesysid'),
          boolean('usecreatedb'),
          boolean('usesuper'),
          boolean('userepl'),
          boolean('usebypassrls'),
        ],
      },
      {
        name: 'pg_database',
        columns: [
          integer('oid'),
          text('datname'),
          integer('datdba'),
          text('encoding'),
          text('datcollate'),
          text('datctype'),
          boolean('datistemplate'),
          boolean('datallowconn'),
        ],
      },
      {
        name: 'pg_indexes',
        columns: [
          text('schemaname'),
          text('tablename'),
          text('indexname'),
          text('tablespace'),
          text('indexdef'),
        ],
      },
      {
        name: 'pg_views',
        columns: [
          text('schemaname'),
          text('viewname'),
          text('viewowner'),
          text('definition'),
        ],
      },
      {
        name: 'pg_matviews',
        columns: [
          text('schemaname'),
          text('matviewname'),
          text('matviewowner'),
          text('tablespace'),
          boolean('ispopulated'),
          text('definition'),
        ],
      },
      {
        schema: 'mysql',
        name: 'user',
        columns: [
          text('Host'),
          text('User'),
          text('Select_priv'),
          text('Insert_priv'),
          text('Update_priv'),
          text('Delete_priv'),
          text('Create_priv'),
          text('Drop_priv'),
        ],
      },
      {
        schema: 'performance_schema',
        name: 'threads',
        columns: [
          integer('THREAD_ID'),
          text('NAME'),
          text('TYPE'),
          integer('PROCESSLIST_ID'),
          text('PROCESSLIST_USER'),
          text('PROCESSLIST_HOST'),
          text('PROCESSLIST_DB'),
          text('PROCESSLIST_COMMAND'),
        ],
      },
      {
        schema: 'sys',
        name: 'schema_table_statistics',
        columns: [
          text('table_schema'),
          text('table_name'),
          integer('total_latency'),
          integer('rows_fetched'),
          integer('rows_inserted'),
          integer('rows_updated'),
          integer('rows_deleted'),
        ],
      },
      {
        schema: 'sys',
        name: 'tables',
        columns: [
          integer('object_id'),
          text('name'),
          integer('schema_id'),
          text('type'),
          text('type_desc'),
          timestamp('create_date'),
          timestamp('modify_date'),
          boolean('is_ms_shipped'),
          boolean('is_filetable'),
          boolean('is_memory_optimized'),
          integer('max_column_id_used'),
        ],
      },
      {
        schema: 'sys',
        name: 'columns',
        columns: [
          integer('object_id'),
          text('name'),
          integer('column_id'),
          integer('system_type_id'),
          integer('user_type_id'),
          integer('max_length'),
          integer('precision'),
          integer('scale'),
          text('collation_name'),
          boolean('is_nullable'),
          boolean('is_identity'),
          boolean('is_computed'),
          boolean('is_rowguidcol'),
        ],
      },
      {
        schema: 'sys',
        name: 'objects',
        columns: [
          integer('object_id'),
          text('name'),
          integer('schema_id'),
          integer('parent_object_id'),
          text('type'),
          text('type_desc'),
          timestamp('create_date'),
          timestamp('modify_date'),
          boolean('is_ms_shipped'),
        ],
      },
      {
        schema: 'sys',
        name: 'schemas',
        columns: [
          text('name'),
          integer('schema_id'),
          integer('principal_id'),
        ],
      },
      {
        schema: 'sys',
        name: 'databases',
        columns: [
          text('name'),
          integer('database_id'),
          integer('source_database_id'),
          text('owner_sid'),
          timestamp('create_date'),
          integer('compatibility_level'),
          text('collation_name'),
          text('user_access_desc'),
          boolean('is_read_only'),
          boolean('is_auto_close_on'),
          text('state_desc'),
        ],
      },
      {
        schema: 'sys',
        name: 'types',
        columns: [
          text('name'),
          integer('system_type_id'),
          integer('user_type_id'),
          integer('schema_id'),
          integer('principal_id'),
          integer('max_length'),
          integer('precision'),
          integer('scale'),
          text('collation_name'),
          boolean('is_nullable'),
          boolean('is_user_defined'),
          boolean('is_assembly_type'),
          boolean('is_table_type'),
        ],
      },
      {
        schema: 'sys',
        name: 'dm_exec_sessions',
        columns: [
          integer('session_id'),
          timestamp('login_time'),
          text('host_name'),
          text('program_name'),
          text('login_name'),
          text('status'),
          integer('cpu_time'),
          integer('memory_usage'),
          integer('total_scheduled_time'),
          integer('total_elapsed_time'),
          integer('reads'),
          integer('writes'),
          integer('logical_reads'),
          timestamp('last_request_start_time'),
          timestamp('last_request_end_time'),
        ],
      },
      {
        schema: 'sys',
        name: 'dm_exec_requests',
        columns: [
          integer('session_id'),
          integer('request_id'),
          timestamp('start_time'),
          text('status'),
          text('command'),
          integer('database_id'),
          integer('user_id'),
          integer('blocking_session_id'),
          text('wait_type'),
          integer('wait_time'),
          integer('cpu_time'),
          integer('total_elapsed_time'),
          integer('reads'),
          integer('writes'),
          integer('logical_reads'),
        ],
      },
      {
        schema: 'sys',
        name: 'indexes',
        columns: [
          integer('object_id'),
          text('name'),
          integer('index_id'),
          text('type_desc'),
          boolean('is_unique'),
          boolean('is_primary_key'),
          boolean('is_unique_constraint'),
          boolean('is_disabled'),
          timestamp('modify_date'),
        ],
      },
      {
        schema: 'sys',
        name: 'foreign_keys',
        columns: [
          integer('object_id'),
          text('name'),
          integer('parent_object_id'),
          integer('referenced_object_id'),
          boolean('is_disabled'),
          boolean('is_not_trusted'),
          text('delete_referential_action_desc'),
          text('update_referential_action_desc'),
        ],
      },
      {
        schema: 'sys',
        name: 'dm_exec_connections',
        columns: [
          integer('session_id'),
          timestamp('connect_time'),
          text('net_transport'),
          text('protocol_type'),
          text('auth_scheme'),
          integer('num_reads'),
          integer('num_writes'),
          text('client_net_address'),
        ],
      },
      {
        schema: 'system',
        name: 'tables',
        columns: [
          text('database'),
          text('name'),
          text('engine'),
          boolean('is_temporary'),
          integer('total_rows'),
          integer('total_bytes'),
          text('metadata_path'),
        ],
      },
      {
        schema: 'system',
        name: 'columns',
        columns: [
          text('database'),
          text('table'),
          text('name'),
          text('type'),
          text('default_kind'),
          text('default_expression'),
          text('comment'),
        ],
      },
      {
        schema: 'system',
        name: 'databases',
        columns: [
          text('name'),
          text('engine'),
          text('data_path'),
          text('metadata_path'),
          text('uuid'),
        ],
      },
      {
        schema: 'system',
        name: 'parts',
        columns: [
          text('partition'),
          text('name'),
          text('database'),
          text('table'),
          boolean('active'),
          integer('marks'),
          integer('rows'),
          integer('bytes_on_disk'),
        ],
      },
      {
        schema: 'system',
        name: 'processes',
        columns: [
          boolean('is_initial_query'),
          text('user'),
          text('query_id'),
          text('address'),
          integer('elapsed'),
          integer('read_rows'),
          integer('read_bytes'),
          text('query'),
        ],
      },
      {
        schema: 'svv',
        name: 'tables',
        columns: [
          text('table_catalog'),
          text('table_schema'),
          text('table_name'),
          text('table_type'),
          text('remarks'),
        ],
      },
      {
        name: 'svv_columns',
        columns: [
          text('database_name'),
          text('schema_name'),
          text('table_name'),
          text('column_name'),
          integer('ordinal_position'),
          text('data_type'),
          boolean('is_nullable'),
        ],
      },
      {
        name: 'svv_redshift_tables',
        columns: [
          text('database_name'),
          text('schema_name'),
          text('table_name'),
          text('table_type'),
          text('remarks'),
        ],
      },
      {
        name: 'stv_recents',
        columns: [
          integer('userid'),
          text('status'),
          timestamp('starttime'),
          text('query'),
          text('user_name'),
          text('db_name'),
        ],
      },
      {
        name: 'stv_sessions',
        columns: [
          integer('userid'),
          integer('process'),
          text('user_name'),
          text('db_name'),
          integer('timeout_sec'),
          timestamp('starttime'),
        ],
      },
      {
        schema: 'all',
        name: 'tables',
        columns: [
          text('owner'),
          text('table_name'),
          text('tablespace_name'),
          text('status'),
          integer('num_rows'),
        ],
      },
      {
        name: 'all_tables',
        columns: [
          text('owner'),
          text('table_name'),
          text('tablespace_name'),
          text('status'),
          integer('num_rows'),
        ],
      },
      {
        name: 'user_tab_columns',
        columns: [
          text('table_name'),
          text('column_name'),
          text('data_type'),
          integer('data_length'),
          integer('column_id'),
          text('nullable'),
        ],
      },
      {
        name: 'dual',
        columns: [
          text('dummy'),
        ],
      },
      {
        name: 'v$session',
        columns: [
          integer('sid'),
          integer('serial#'),
          text('username'),
          text('status'),
          text('machine'),
          text('program'),
        ],
      },
      {
        name: 'exa_all_tables',
        columns: [
          text('table_schema'),
          text('table_name'),
          text('table_type'),
          text('table_owner'),
          timestamp('created'),
          timestamp('last_commit'),
          boolean('has_distribution_key'),
          text('delete_percentage'),
        ],
      },
      {
        name: '__TABLES__',
        columns: [
          integer('project_id'),
          integer('dataset_id'),
          integer('table_id'),
          timestamp('creation_time'),
          timestamp('last_modified_time'),
          integer('row_count'),
          integer('size_bytes'),
        ],
      },
      {
        schema: 'account_usage',
        name: 'query_history',
        columns: [
          text('query_id'),
          text('query_text'),
          text('database_name'),
          text('schema_name'),
          text('user_name'),
          timestamp('start_time'),
          timestamp('end_time'),
          integer('total_elapsed_time'),
          text('execution_status'),
        ],
      },
      {
        schema: 'account_usage',
        name: 'users',
        columns: [
          text('id'),
          text('name'),
          timestamp('created_on'),
          text('login_name'),
          text('display_name'),
          text('email'),
          boolean('deleted'),
        ],
      },
      {
        schema: 'account_usage',
        name: 'roles',
        columns: [
          text('id'),
          text('name'),
          timestamp('created_on'),
          text('owner'),
          text('comment'),
          boolean('deleted'),
        ],
      },
      {
        schema: 'account_usage',
        name: 'warehouses',
        columns: [
          text('id'),
          text('name'),
          timestamp('created_on'),
          text('type'),
          text('size'),
          boolean('auto_resume'),
          integer('auto_suspend'),
        ],
      },
      {
        schema: 'account_usage',
        name: 'tables',
        columns: [
          text('id'),
          text('table_name'),
          text('table_schema'),
          text('table_catalog'),
          timestamp('created'),
          timestamp('last_altered'),
          integer('row_count'),
          integer('bytes'),
        ],
      },
      {
        schema: 'sys',
        name: 'segments',
        columns: [
          text('segment_id'),
          text('datasource'),
          timestamp('start'),
          timestamp('end'),
          integer('size'),
          integer('num_rows'),
          boolean('is_published'),
        ],
      },
      {
        schema: 'sys',
        name: 'servers',
        columns: [
          text('server'),
          text('host'),
          integer('plaintext_port'),
          integer('tls_port'),
          text('curr_size'),
          integer('max_size'),
        ],
      },
      {
        schema: 'sys',
        name: 'tasks',
        columns: [
          text('task_id'),
          text('type'),
          text('datasource'),
          timestamp('created_time'),
          text('status'),
          text('location'),
        ],
      },
      {
        schema: 'sys',
        name: 'supervisors',
        columns: [
          text('supervisor_id'),
          text('state'),
          text('detailed_state'),
          text('healthy'),
          text('type'),
          text('source'),
        ],
      },
    ],
  };
}

function inferWholeRowType(expression: AstExpression, schema: ValidationSchema, tableAliases?: TableAliasMap): { type: string; source: string } | undefined {
  const column = getAst(expression, 'column');
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
    type: `struct<${table.columns.map((field) => `${field.name} ${field.type || 'unknown'}`).join(', ')}>`,
    source: schemaTableName(table),
  };
}

function inferExpressionType(expression: AstExpression, schema: ValidationSchema, binds: BindSpec): string | undefined {
  if (isAst(expression, 'boolean')) return 'boolean';
  const paren = getAst(expression, 'paren');
  if (isRecord(paren) && isRecord(paren.this)) return inferColumn(paren.this, 'expression', schema, binds, 'generic').type;
  const neg = getAst(expression, 'neg');
  if (isRecord(neg) && isRecord(neg.this)) return inferColumn(neg.this, 'expression', schema, binds, 'generic').type;

  const windowType = inferWindowFunctionType(expression, schema, binds);
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
  const aggregateType = inferAggregateType(expression, schema, binds);
  if (aggregateType) return aggregateType;
  const scalarType = inferScalarFunctionType(expression, schema, binds);
  if (scalarType) return scalarType;
  const arithmetic = getAst(expression, 'add') ?? getAst(expression, 'sub') ?? getAst(expression, 'mul') ?? getAst(expression, 'div') ?? getAst(expression, 'mod')
    ?? getAst(expression, 'bitwise_and') ?? getAst(expression, 'bitwise_or') ?? getAst(expression, 'bitwise_xor')
    ?? getAst(expression, 'bitwise_left_shift') ?? getAst(expression, 'bitwise_right_shift');
  if (isRecord(arithmetic)) {
    const types = [arithmetic.left, arithmetic.right]
      .filter(isRecord)
      .map((part) => inferColumn(part, 'expression', schema, binds, 'generic').type);
    if (types.some((type) => /decimal|numeric|real|double|float/i.test(type))) return 'decimal';
    if (types.some((type) => /int|number|bigint|smallint/i.test(type))) return 'integer';
  }
  const power = getAst(expression, 'power');
  if (isRecord(power)) return 'decimal';
  if (isAst(expression, 'concat')) return 'text';
  const row = getAst(expression, 'function');
  if (isRecord(row) && String(row.name ?? '').toLowerCase() === 'row' && Array.isArray(row.args)) {
    const fields = row.args.filter(isRecord).map((arg, index) => {
      const name = inferNameFromAst(arg, index + 1);
      const type = inferColumn(arg, name, schema, binds, 'generic').type;
      return `${name} ${type}`;
    });
    if (fields.length > 0) return `record<${fields.join(', ')}>`;
  }
  return undefined;
}

function inferAggregateType(expression: AstExpression, schema: ValidationSchema, binds: BindSpec): string | undefined {
  if (isAst(expression, 'count')) return 'integer';
  if (isAst(expression, 'avg')) return 'decimal';
  if (isAst(expression, 'count_if')) return 'integer';
  if (isAst(expression, 'approx_count_distinct') || isAst(expression, 'approx_distinct')) return 'integer';

  const boolAggregate = getAst(expression, 'bool_and') ?? getAst(expression, 'bool_or') ?? getAst(expression, 'every') ?? getAst(expression, 'logical_and') ?? getAst(expression, 'logical_or');
  if (isRecord(boolAggregate)) return 'boolean';

  const decimalAggregate = getAst(expression, 'stddev') ?? getAst(expression, 'variance');
  if (isRecord(decimalAggregate)) return 'decimal';

  const textAggregate = getAst(expression, 'string_agg') ?? getAst(expression, 'group_concat') ?? getAst(expression, 'listagg');
  if (isRecord(textAggregate)) return 'text';

  const arrayAggregate = getAst(expression, 'array_agg') ?? getAst(expression, 'list') ?? getAst(expression, 'collect_list') ?? getAst(expression, 'collect_set');
  if (isRecord(arrayAggregate)) {
    const inner = firstAggregateExpression(arrayAggregate);
    const type = inner ? inferColumn(inner, 'aggregate', schema, binds, 'generic').type : 'unknown';
    return `array<${type}>`;
  }

  const jsonAggregate = getAst(expression, 'json_agg') ?? getAst(expression, 'json_object_agg') ?? getAst(expression, 'json_arrayagg') ?? getAst(expression, 'json_objectagg')
    ?? getAst(expression, 'j_s_o_n_array_agg') ?? getAst(expression, 'j_s_o_n_object_agg') ?? getAst(expression, 'j_s_o_n_b_object_agg');
  if (isRecord(jsonAggregate)) return 'json';

  const withinGroup = getAst(expression, 'within_group');
  if (isRecord(withinGroup)) {
    const ordered = Array.isArray(withinGroup.order_by) ? withinGroup.order_by.map((item) => isRecord(item) && isRecord(item.this) ? item.this : undefined).filter(isRecord) : [];
    const inner = isRecord(withinGroup.this) ? withinGroup.this : undefined;
    const innerAggregate = inner ? inferAggregateType(inner, schema, binds) : undefined;
    if (innerAggregate && innerAggregate !== 'unknown') return innerAggregate;
    const orderType = commonArgumentType(ordered, schema, binds);
    if (orderType) return orderType;
  }

  const anyValue = getAst(expression, 'any_value') ?? getAst(expression, 'first') ?? getAst(expression, 'last') ?? getAst(expression, 'mode');
  if (isRecord(anyValue)) {
    const inner = firstAggregateExpression(anyValue);
    if (inner) return inferColumn(inner, 'aggregate', schema, binds, 'generic').type;
  }

  const namedAggregate = getAst(expression, 'aggregate_function');
  if (isRecord(namedAggregate)) return aggregateTypeByName(String(namedAggregate.name ?? '').toLowerCase(), namedAggregate, schema, binds);

  const genericFunction = getAst(expression, 'function');
  if (isRecord(genericFunction)) {
    const name = String(genericFunction.name ?? '').toLowerCase();
    const type = aggregateTypeByName(name, genericFunction, schema, binds);
    if (type) return type;
  }

  const aggregate = getAst(expression, 'sum') ?? getAst(expression, 'min') ?? getAst(expression, 'max') ?? getAst(expression, 'median');
  if (isRecord(aggregate)) {
    const inner = firstAggregateExpression(aggregate);
    if (inner) return inferColumn(inner, 'aggregate', schema, binds, 'generic').type;
  }

  return undefined;
}

function aggregateTypeByName(name: string, aggregate: Record<string, unknown>, schema: ValidationSchema, binds: BindSpec): string | undefined {
  if (['count', 'count_if', 'approx_count_distinct', 'approx_distinct'].includes(name)) return 'integer';
  if (['avg', 'corr', 'covar_pop', 'covar_samp', 'regr_slope', 'regr_intercept', 'regr_r2', 'stddev', 'variance', 'percentile_cont'].includes(name)) return 'decimal';
  if (['bool_and', 'bool_or', 'every', 'logical_and', 'logical_or'].includes(name)) return 'boolean';
  if (['string_agg', 'group_concat', 'listagg'].includes(name)) return 'text';
  if (['array_agg', 'list', 'collect_list', 'collect_set'].includes(name)) {
    const inner = firstAggregateExpression(aggregate);
    const type = inner ? inferColumn(inner, 'aggregate', schema, binds, 'generic').type : 'unknown';
    return `array<${type}>`;
  }
  if (['json_agg', 'json_object_agg', 'json_arrayagg', 'json_objectagg', 'object_agg'].includes(name)) return 'json';
  if (['any_value', 'first', 'last', 'mode', 'percentile_disc'].includes(name)) {
    const inner = firstAggregateExpression(aggregate);
    return inner ? inferColumn(inner, 'aggregate', schema, binds, 'generic').type : undefined;
  }
  return undefined;
}

function firstAggregateExpression(aggregate: Record<string, unknown>): AstExpression | undefined {
  return firstExpression([
    aggregate.this,
    ...(Array.isArray(aggregate.args) ? aggregate.args : []),
    ...(Array.isArray(aggregate.expressions) ? aggregate.expressions : []),
  ].filter(isRecord));
}

function inferScalarSubqueryType(expression: AstExpression, schema: ValidationSchema, binds: BindSpec): string | undefined {
  const subquery = getAst(expression, 'subquery');
  if (!isRecord(subquery) || !isRecord(subquery.this)) return undefined;
  const items = outputItemsForStatement(subquery.this, schema);
  const select = isRecord(subquery.this.select) ? subquery.this.select : undefined;
  if (select && String(select.kind ?? '').toUpperCase() === 'STRUCT' && items.length > 0) {
    const fields = items.map((item, index) => {
      const name = item.name ?? inferNameFromAst(item.expression, index + 1);
      const type = inferColumn(item.expression, name, item.schema ?? schema, binds, 'generic', item.source, item.tableAliases).type;
      return `${name} ${type}`;
    });
    return `struct<${fields.join(', ')}>`;
  }
  const first = items[0];
  if (!first) return undefined;
  return inferColumn(first.expression, first.name ?? 'subquery', first.schema ?? schema, binds, 'generic', first.source, first.tableAliases).type;
}

function inferPredicateType(expression: AstExpression): string | undefined {
  const predicates = [
    'eq',
    'neq',
    'null_safe_eq',
    'null_safe_neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'and',
    'or',
    'not',
    'is_null',
    'is_not_null',
    'is',
    'in',
    'like',
    'ilike',
    'i_like',
    'similar_to',
    'between',
    'exists',
    'regexp_like',
  ];
  return predicates.some((key) => isAst(expression, key)) ? 'boolean' : undefined;
}

function inferJsonType(expression: AstExpression): string | undefined {
  if (getAst(expression, 'json_object') || getAst(expression, 'j_s_o_n_array') || getAst(expression, 'json_extract')) return 'json';
  if (getAst(expression, 'json_value')) return 'text';
  if (getAst(expression, 'to_json')) return 'json';
  if (getAst(expression, 'json_array_length')) return 'integer';
  if (getAst(expression, 'json_typeof') || getAst(expression, 'jsonb_typeof')) return 'text';

  const fn = getAst(expression, 'function');
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? '').toLowerCase();
  if (['json_build_object', 'json_build_array', 'json_object', 'json_array', 'to_json'].includes(name)) return 'json';
  if (['jsonb_build_object', 'jsonb_build_array', 'to_jsonb'].includes(name)) return 'jsonb';
  if (['json_extract', 'json_query'].includes(name)) return 'json';
  if (['json_extract_scalar', 'json_value'].includes(name)) return 'text';
  if (['json_array_length', 'jsonb_array_length', 'json_length', 'json_size'].includes(name)) return 'integer';
  if (['json_typeof', 'jsonb_typeof', 'json_type'].includes(name)) return 'text';
  return undefined;
}

function inferTemporalFunctionType(expression: AstExpression, schema: ValidationSchema, binds: BindSpec): string | undefined {
  if (getAst(expression, 'interval')) return 'interval';
  const arithmetic = getAst(expression, 'add') ?? getAst(expression, 'sub');
  if (isRecord(arithmetic)) {
    const leftType = isRecord(arithmetic.left) ? inferColumn(arithmetic.left, 'temporal_left', schema, binds, 'generic').type : undefined;
    const rightType = isRecord(arithmetic.right) ? inferColumn(arithmetic.right, 'temporal_right', schema, binds, 'generic').type : undefined;
    if (leftType && rightType) {
      if (isTemporalType(leftType) && rightType === 'interval') return leftType;
      if (leftType === 'interval' && isTemporalType(rightType)) return rightType;
      if (leftType === 'interval' && rightType === 'interval') return 'interval';
      if (isTemporalType(leftType) && isTemporalType(rightType) && getAst(expression, 'sub')) return 'integer';
    }
  }
  if (getAst(expression, 'extract')) return 'integer';

  const fn = getAst(expression, 'function');
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? '').toLowerCase();
  if (['date_add', 'date_sub', 'timestamp_add', 'timestamp_sub', 'datetime_add', 'datetime_sub', 'add_months'].includes(name)) {
    const value = firstExpression(functionArguments(fn));
    if (value) {
      const type = inferColumn(value, 'temporal', schema, binds, 'generic').type;
      if (isTemporalType(type)) return type;
    }
    if (name.startsWith('timestamp')) return 'timestamp';
    if (name.startsWith('datetime')) return 'datetime';
    return 'date';
  }
  if (['date_trunc', 'timestamp_trunc', 'datetime_trunc'].includes(name)) {
    const args = functionArguments(fn);
    const value = args[1] ?? args[0];
    if (value) {
      const type = inferColumn(value, 'temporal', schema, binds, 'generic').type;
      if (/date/i.test(type) && !/time|timestamp|datetime/i.test(type)) return 'date';
      if (/time/i.test(type) && !/timestamp|datetime/i.test(type)) return 'time';
    }
    return name === 'date_trunc' || name === 'timestamp_trunc' ? 'timestamp' : 'datetime';
  }
  if (name === 'date_part' || name === 'extract') return 'integer';
  if (['datediff', 'date_diff', 'timestampdiff', 'timestamp_diff'].includes(name)) return 'integer';
  if (['make_date', 'date_from_parts', 'parse_date', 'to_date', 'str_to_date', 'ts_or_ds_to_date'].includes(name)) return 'date';
  if (['make_time', 'time_from_parts', 'parse_time', 'to_time'].includes(name)) return 'time';
  if (['make_timestamp', 'timestamp_from_parts', 'datetime_from_parts', 'parse_timestamp', 'to_timestamp'].includes(name)) return 'timestamp';
  if (['parse_datetime', 'to_datetime'].includes(name)) return 'datetime';
  return undefined;
}

function isTemporalType(type: string): boolean {
  return /^(date|time|timestamp|datetime)$/i.test(type);
}

function inferGeospatialFunctionType(expression: AstExpression): string | undefined {
  const fn = getAst(expression, 'function');
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? '').toLowerCase();
  if (['st_geogpoint', 'st_geogfromtext', 'st_geogfromgeojson', 'st_geogfromwkb'].includes(name)) return 'geography';
  if ([
    'st_point',
    'st_makepoint',
    'st_geomfromtext',
    'st_geometryfromtext',
    'st_geomfromgeojson',
    'st_geomfromwkb',
    'st_buffer',
    'st_centroid',
    'st_union',
    'st_intersection',
    'st_difference',
    'st_envelope',
    'st_boundary',
  ].includes(name)) return 'geometry';
  if (['st_astext', 'st_aswkt', 'st_asgeojson', 'st_geohash'].includes(name)) return 'text';
  if ([
    'st_area',
    'st_distance',
    'st_length',
    'st_perimeter',
    'st_x',
    'st_y',
    'st_z',
    'st_azimuth',
  ].includes(name)) return 'decimal';
  if ([
    'st_contains',
    'st_coveredby',
    'st_covers',
    'st_crosses',
    'st_disjoint',
    'st_dwithin',
    'st_equals',
    'st_intersects',
    'st_overlaps',
    'st_touches',
    'st_within',
    'st_isclosed',
    'st_isempty',
    'st_isvalid',
  ].includes(name)) return 'boolean';
  return undefined;
}

function inferIdentifierHashRandomType(expression: AstExpression): string | undefined {
  if (isAst(expression, 'random') || isAst(expression, 'rand')) return 'decimal';
  const fn = getAst(expression, 'function');
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? '').toLowerCase();
  if (['uuid', 'uuid_string', 'gen_random_uuid'].includes(name)) return 'uuid';
  if (['md5', 'sha', 'sha1', 'hex', 'to_hex'].includes(name)) return 'text';
  if (['sha224', 'sha256', 'sha384', 'sha512'].includes(name)) return 'bytes';
  if (['random', 'rand'].includes(name)) return 'decimal';
  return undefined;
}

function inferConditionalType(expression: AstExpression, schema: ValidationSchema, binds: BindSpec): string | undefined {
  const caseExpression = getAst(expression, 'case');
  if (isRecord(caseExpression)) {
    const branches = (Array.isArray(caseExpression.whens) ? caseExpression.whens : [])
      .flatMap((when) => Array.isArray(when) && isRecord(when[1]) ? [when[1]] : []);
    if (isRecord(caseExpression.else_)) branches.push(caseExpression.else_);
    return commonArgumentType(branches, schema, binds);
  }

  const ifExpression = getAst(expression, 'if_func');
  if (isRecord(ifExpression)) {
    const branches = [ifExpression.true_value, ifExpression.false_value].filter(isRecord);
    return commonArgumentType(branches, schema, binds);
  }

  return undefined;
}

function inferConstructorType(expression: AstExpression, schema: ValidationSchema, binds: BindSpec): string | undefined {
  const array = getAst(expression, 'array_func');
  if (isRecord(array) && Array.isArray(array.expressions)) {
    const type = commonArgumentType(array.expressions.filter(isRecord), schema, binds) ?? 'unknown';
    return `array<${type}>`;
  }

  const fn = getAst(expression, 'function');
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? '').toLowerCase();
  const args = functionArguments(fn);
  if (name === 'array') {
    const subquery = args.find((arg) => isRecord(arg.select));
    if (subquery) {
      const items = outputItemsForStatement(subquery, schema);
      const first = items[0];
      if (first) {
        const type = inferColumn(first.expression, first.name ?? 'array', first.schema ?? schema, binds, 'generic', first.source, first.tableAliases).type;
        return `array<${type}>`;
      }
    }
    const type = commonArgumentType(args, schema, binds) ?? 'unknown';
    return `array<${type}>`;
  }
  if (name === 'generate_array') {
    const type = commonArgumentType(args, schema, binds) ?? 'integer';
    return `array<${type}>`;
  }
  if (name === 'generate_date_array') return 'array<date>';
  if (name === 'generate_timestamp_array') return 'array<timestamp>';
  if (['list_value', 'array_value'].includes(name)) {
    const type = commonArgumentType(args, schema, binds) ?? 'unknown';
    return `array<${type}>`;
  }
  if (['array_construct', 'array_construct_compact'].includes(name)) {
    const type = commonArgumentType(args, schema, binds) ?? 'variant';
    return `array<${type}>`;
  }
  if (['object_construct', 'object_construct_keep_null'].includes(name)) return 'object';
  const higherOrderType = inferHigherOrderArrayFunctionType(name, args, schema, binds);
  if (higherOrderType) return higherOrderType;
  if (name === 'map') {
    const keys = args.filter((_, index) => index % 2 === 0);
    const values = args.filter((_, index) => index % 2 === 1);
    const keyType = commonArgumentType(keys, schema, binds) ?? 'unknown';
    const valueType = commonArgumentType(values, schema, binds) ?? 'unknown';
    return `map<${keyType}, ${valueType}>`;
  }
  if (name === 'named_struct') {
    const fields = namedStructFields(args, schema, binds);
    return fields.length > 0 ? `struct<${fields.join(', ')}>` : undefined;
  }
  if (name === 'struct') {
    const fields = args.map((arg, index) => {
      const unwrapped = unwrapAlias(arg);
      const fieldName = unwrapped.name ?? inferNameFromAst(unwrapped.expression, index + 1);
      const type = inferColumn(unwrapped.expression, fieldName, schema, binds, 'generic').type;
      return `${fieldName} ${type}`;
    });
    return fields.length > 0 ? `struct<${fields.join(', ')}>` : undefined;
  }
  if (name === 'struct_pack') {
    const fields = namedArgumentStructFields(args, schema, binds);
    return fields.length > 0 ? `struct<${fields.join(', ')}>` : undefined;
  }
  return undefined;
}

function namedStructFields(args: AstExpression[], schema: ValidationSchema, binds: BindSpec): string[] {
  const fields: string[] = [];
  for (let index = 0; index + 1 < args.length; index += 2) {
    const name = literalString(args[index]) ?? `field_${(index / 2) + 1}`;
    const value = args[index + 1];
    const type = inferColumn(value, name, schema, binds, 'generic').type;
    fields.push(`${cleanIdentifier(name)} ${type}`);
  }
  return fields;
}

function inferHigherOrderArrayFunctionType(name: string, args: AstExpression[], schema: ValidationSchema, binds: BindSpec): string | undefined {
  if (![
    'transform',
    'list_transform',
    'array_transform',
    'filter',
    'array_filter',
    'list_filter',
    'exists',
    'forall',
    'any_match',
    'all_match',
    'none_match',
    'reduce',
    'aggregate',
    'array_reduce',
  ].includes(name)) return undefined;

  const arrayExpression = args[0];
  const arrayType = arrayExpression ? inferColumn(arrayExpression, 'lambda_array', schema, binds, 'generic').type : undefined;
  const elementType = arrayType ? arrayElementType(arrayType) : undefined;
  if (['filter', 'array_filter', 'list_filter'].includes(name)) return arrayType;
  if (['exists', 'forall', 'any_match', 'all_match', 'none_match'].includes(name)) return 'boolean';
  if (['reduce', 'aggregate', 'array_reduce'].includes(name)) {
    const initialState = args[1];
    return initialState ? inferColumn(initialState, 'lambda_state', schema, binds, 'generic').type : elementType;
  }
  const lambda = args.find((arg) => isRecord(arg.lambda))?.lambda;
  const body = isRecord(lambda) && isRecord(lambda.body) ? lambda.body : undefined;
  const parameters = isRecord(lambda) && Array.isArray(lambda.parameters) ? lambda.parameters.map(identifierName).filter((parameter): parameter is string => Boolean(parameter)) : [];
  const bodyType = body ? inferLambdaBodyType(body, new Map(parameters.map((parameter) => [parameter.toLowerCase(), elementType ?? 'unknown'])), schema, binds) : undefined;
  return `array<${bodyType ?? elementType ?? 'unknown'}>`;
}

function inferLambdaBodyType(expression: AstExpression, parameters: Map<string, string>, schema: ValidationSchema, binds: BindSpec): string | undefined {
  const column = getAst(expression, 'column');
  const columnName = isRecord(column) ? identifierName(column.name)?.toLowerCase() : undefined;
  if (columnName && parameters.has(columnName)) return parameters.get(columnName);
  if (getAst(expression, 'lower') || getAst(expression, 'upper') || getAst(expression, 'trim') || getAst(expression, 'initcap')) return 'text';
  if (getAst(expression, 'length') || getAst(expression, 'char_length') || getAst(expression, 'cardinality')) return 'integer';
  if (getAst(expression, 'array_contains')) return 'boolean';
  const predicate = inferPredicateType(expression);
  if (predicate) return predicate;
  const arithmetic = getAst(expression, 'add') ?? getAst(expression, 'sub') ?? getAst(expression, 'mul') ?? getAst(expression, 'div') ?? getAst(expression, 'mod');
  if (isRecord(arithmetic)) {
    const types = [arithmetic.left, arithmetic.right].filter(isRecord).map((part) => inferLambdaBodyType(part, parameters, schema, binds) ?? inferColumn(part, 'lambda_arg', schema, binds, 'generic').type);
    if (types.some((type) => /decimal|numeric|real|double|float/i.test(type))) return 'decimal';
    if (types.some((type) => /int|number|bigint|smallint/i.test(type))) return 'integer';
  }
  return inferColumn(expression, 'lambda_body', schema, binds, 'generic').type;
}

function namedArgumentStructFields(args: AstExpression[], schema: ValidationSchema, binds: BindSpec): string[] {
  return args.flatMap((arg, index) => {
    const namedArgument = isRecord(arg.named_argument) ? arg.named_argument : undefined;
    const name = identifierName(namedArgument?.name) ?? `field_${index + 1}`;
    const value = isRecord(namedArgument?.value) ? namedArgument.value : undefined;
    if (!value) return [];
    const type = inferColumn(value, name, schema, binds, 'generic').type;
    return [`${cleanIdentifier(name)} ${type}`];
  });
}

function inferScalarFunctionType(expression: AstExpression, schema: ValidationSchema, binds: BindSpec): string | undefined {
  if (getAst(expression, 'lower') || getAst(expression, 'upper') || getAst(expression, 'trim') || getAst(expression, 'initcap')) return 'text';
  if (getAst(expression, 'substring') || getAst(expression, 'substr')) return 'text';
  if (getAst(expression, 'length') || getAst(expression, 'char_length') || getAst(expression, 'bit_length') || getAst(expression, 'octet_length')) return 'integer';
  if (isAst(expression, 'random') || isAst(expression, 'rand')) return 'decimal';
  if (getAst(expression, 'cardinality')) return 'integer';
  if (getAst(expression, 'array_contains')) return 'boolean';
  if (getAst(expression, 'to_number')) return 'decimal';

  const mapType = inferMapFunctionType(expression, schema, binds);
  if (mapType) return mapType;

  const arrayAppend = getAst(expression, 'array_append');
  if (isRecord(arrayAppend)) {
    return firstArrayArgumentType([arrayAppend.this, arrayAppend.expression].filter(isRecord), schema, binds);
  }

  const numericValue = getAst(expression, 'abs') ?? getAst(expression, 'round') ?? getAst(expression, 'ceil') ?? getAst(expression, 'ceiling') ?? getAst(expression, 'floor');
  if (isRecord(numericValue)) {
    const inner = firstExpression(([numericValue.this, ...(Array.isArray(numericValue.args) ? numericValue.args : [])]).filter(Boolean));
    if (inner) return inferColumn(inner, 'scalar', schema, binds, 'generic').type;
    return 'decimal';
  }

  const coalesce = getAst(expression, 'coalesce') ?? getAst(expression, 'nullif');
  if (isRecord(coalesce)) return bindFirstArgumentType(coalesce, binds) ?? commonArgumentType(functionArguments(coalesce), schema, binds);

  const genericFunction = getAst(expression, 'function');
  if (!isRecord(genericFunction)) return undefined;
  const name = String(genericFunction.name ?? '').toLowerCase();
  if ([
    'lower',
    'upper',
    'reverse',
    'initcap',
    'trim',
    'ltrim',
    'rtrim',
    'substring',
    'substr',
    'replace',
    'regexp_replace',
    'regexp_extract',
    'regexp_substr',
    'split_part',
    'concat',
    'concat_ws',
    'to_char',
    'time_to_str',
    'date_format',
    'format_date',
  ].includes(name)) return 'text';
  if (['length', 'char_length', 'character_length', 'bit_length', 'octet_length', 'strpos', 'position', 'size', 'match_number'].includes(name)) return 'integer';
  if (['regexp_count'].includes(name)) return 'integer';
  if (['regexp_instr'].includes(name)) return 'integer';
  if (['regexp_full_match'].includes(name)) return 'boolean';
  if (['regexp_matches', 'split', 'str_split', 'string_to_array', 'regexp_split', 'regexp_extract_all'].includes(name)) return 'array<text>';
  if (['regexp_split_to_array'].includes(name)) return 'array<text>';
  if (['uuid', 'uuid_string', 'gen_random_uuid'].includes(name)) return 'uuid';
  if (['md5', 'sha', 'sha1', 'hex', 'to_hex'].includes(name)) return 'text';
  if (['sha224', 'sha256', 'sha384', 'sha512'].includes(name)) return 'bytes';
  if (['random', 'rand'].includes(name)) return 'decimal';
  if (['array_length', 'array_size', 'cardinality', 'array_sum'].includes(name)) return 'integer';
  if (['array_contains', 'list_contains'].includes(name)) return 'boolean';
  if (name === 'array_join') return 'text';
  if (['list_value', 'array_value'].includes(name)) {
    const type = commonArgumentType(functionArguments(genericFunction), schema, binds) ?? 'unknown';
    return `array<${type}>`;
  }
  if (name === 'struct_pack') {
    const fields = namedArgumentStructFields(functionArguments(genericFunction), schema, binds);
    return fields.length > 0 ? `struct<${fields.join(', ')}>` : undefined;
  }
  if (name === 'array_to_string') return 'text';
  if (['array_cat', 'array_concat', 'array_prepend', 'array_append', 'array_remove', 'array_replace', 'array_reverse', 'array_sort'].includes(name)) {
    return firstArrayArgumentType(functionArguments(genericFunction), schema, binds);
  }
  if (['current_date'].includes(name)) return 'date';
  if (['current_time'].includes(name)) return 'time';
  if (['current_timestamp', 'now', 'localtimestamp', 'utc_timestamp'].includes(name)) return 'timestamp';
  if (name === 'current_datetime') return 'datetime';
  if (['grouping', 'grouping_id', 'groupingid'].includes(name)) return 'integer';
  if (name === 'convert' || name === 'try_convert') {
    const targetType = Array.isArray(genericFunction.args) ? genericFunction.args[0] : undefined;
    const type = isRecord(targetType) ? dataTypeToString(targetType.data_type ?? targetType) : undefined;
    if (type) return type;
  }
  if (['abs', 'round', 'ceil', 'ceiling', 'floor', 'safe_add', 'safe_subtract', 'safe_multiply'].includes(name)) return commonArgumentType(functionArguments(genericFunction), schema, binds) ?? 'decimal';
  if (name === 'safe_divide') return 'decimal';
  if (['to_number', 'try_to_number', 'to_decimal', 'try_to_decimal'].includes(name)) return 'decimal';
  if (name === 'try_base64_decode_string') return 'text';
  if (name === 'try_base64_decode_binary') return 'bytes';
  if (['sqrt', 'power', 'pow', 'exp', 'ln', 'log', 'log10', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'radians', 'degrees', 'pi'].includes(name)) return 'decimal';
  if (['sign'].includes(name)) return 'integer';
  if (['coalesce', 'ifnull', 'nvl', 'nullif', 'greatest', 'least'].includes(name)) {
    return bindFirstArgumentType(genericFunction, binds) ?? commonArgumentType(functionArguments(genericFunction), schema, binds);
  }
  return undefined;
}

function bindFirstArgumentType(functionNode: Record<string, unknown>, binds: BindSpec): string | undefined {
  const first = functionArguments(functionNode)[0];
  return isRecord(first) ? inferBindType(first, binds) : undefined;
}

function inferBindSensitiveFunctionType(expression: AstExpression, binds: BindSpec): string | undefined {
  const coalesce = getAst(expression, 'coalesce') ?? getAst(expression, 'nullif');
  if (isRecord(coalesce)) return bindFirstArgumentType(coalesce, binds);
  const fn = getAst(expression, 'function');
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? '').toLowerCase();
  return ['coalesce', 'ifnull', 'nvl', 'nullif', 'greatest', 'least'].includes(name)
    ? bindFirstArgumentType(fn, binds)
    : undefined;
}

function inferMapFunctionType(expression: AstExpression, schema: ValidationSchema, binds: BindSpec): string | undefined {
  const keys = getAst(expression, 'map_keys');
  if (isRecord(keys)) {
    const types = mapArgumentTypes(keys.this, schema, binds);
    return types ? `array<${types[0]}>` : undefined;
  }
  const values = getAst(expression, 'map_values');
  if (isRecord(values)) {
    const types = mapArgumentTypes(values.this, schema, binds);
    return types ? `array<${types[1]}>` : undefined;
  }
  const element = getAst(expression, 'element_at');
  if (isRecord(element)) {
    const types = mapArgumentTypes(element.this, schema, binds);
    if (types) return types[1];
    const arrayType = isRecord(element.this) ? inferColumn(element.this, 'element_at', schema, binds, 'generic').type : undefined;
    return arrayType ? arrayElementType(arrayType) : undefined;
  }
  const subscript = getAst(expression, 'subscript');
  if (isRecord(subscript)) {
    const types = mapArgumentTypes(subscript.this, schema, binds);
    if (types) return types[1];
  }
  const fn = getAst(expression, 'function');
  if (!isRecord(fn)) return undefined;
  const name = String(fn.name ?? '').toLowerCase();
  if (name === 'map_entries') {
    const types = mapArgumentTypes(functionArguments(fn)[0], schema, binds);
    return types ? `array<struct<key ${types[0]}, value ${types[1]}>>` : undefined;
  }
  if (['map_concat', 'map_cat', 'map_delete', 'map_insert', 'map_pick'].includes(name)) {
    return functionArguments(fn)
      .map((arg) => inferColumn(arg, 'map_func_arg', schema, binds, 'generic').type)
      .find((type) => /^map\s*</i.test(type));
  }
  return undefined;
}

function mapArgumentTypes(expression: unknown, schema: ValidationSchema, binds: BindSpec): [string, string] | undefined {
  if (!isRecord(expression)) return undefined;
  const type = inferColumn(expression, 'map_arg', schema, binds, 'generic').type;
  return type === 'unknown' ? undefined : mapKeyValueTypes(type);
}

function firstArrayArgumentType(args: AstExpression[], schema: ValidationSchema, binds: BindSpec): string | undefined {
  return args
    .map((arg) => inferColumn(arg, 'array_arg', schema, binds, 'generic').type)
    .find((type) => arrayElementType(type) || /^array\s*</i.test(type));
}

function functionArguments(functionNode: Record<string, unknown>): AstExpression[] {
  return [
    ...(isRecord(functionNode.this) ? [functionNode.this] : []),
    ...(Array.isArray(functionNode.args) ? functionNode.args.filter(isRecord) : []),
    ...(Array.isArray(functionNode.expressions) ? functionNode.expressions.filter(isRecord) : []),
  ];
}

function commonArgumentType(args: AstExpression[], schema: ValidationSchema, binds: BindSpec): string | undefined {
  const types = args
    .map((arg, index) => inferColumn(arg, `arg_${index + 1}`, schema, binds, 'generic').type)
    .filter((type) => type !== 'unknown');
  return commonTypeFromTypes(types);
}

function commonTypeFromTypes(types: string[]): string | undefined {
  if (types.length === 0) return undefined;
  if (types.some((type) => /text|char|string|varchar/i.test(type))) return 'text';
  if (types.some((type) => /timestamp|datetime/i.test(type))) return 'timestamp';
  if (types.some((type) => /^date$/i.test(type))) return 'date';
  if (types.some((type) => /decimal|numeric|real|double|float/i.test(type))) return 'decimal';
  if (types.some((type) => /int|number|bigint|smallint/i.test(type))) return 'integer';
  if (types.some((type) => /bool/i.test(type))) return 'boolean';
  return types[0];
}

function inferWindowFunctionType(expression: AstExpression, schema: ValidationSchema, binds: BindSpec): string | undefined {
  const windowFunction = getAst(expression, 'window_function');
  if (!isRecord(windowFunction) || !isRecord(windowFunction.this)) return undefined;
  const inner = windowFunction.this;
  if (isAst(inner, 'row_number') || isAst(inner, 'rank') || isAst(inner, 'dense_rank') || isAst(inner, 'ntile') || isAst(inner, 'n_tile')) return 'integer';
  if (isAst(inner, 'percent_rank') || isAst(inner, 'cume_dist')) return 'decimal';
  const valueFunction = getAst(inner, 'lag') ?? getAst(inner, 'lead') ?? getAst(inner, 'first_value') ?? getAst(inner, 'last_value') ?? getAst(inner, 'nth_value');
  if (isRecord(valueFunction) && isRecord(valueFunction.this)) {
    return inferColumn(valueFunction.this, 'window_value', schema, binds, 'generic').type;
  }
  return inferExpressionType(inner, schema, binds);
}

function inferCastType(expression: AstExpression): string | undefined {
  const cast = getAst(expression, 'cast') ?? getAst(expression, 'try_cast') ?? getAst(expression, 'safe_cast');
  return isRecord(cast) ? dataTypeToString(cast.to) : undefined;
}

function inferLiteralType(expression: AstExpression): string | undefined {
  const literal = getAst(expression, 'literal');
  if (isRecord(literal)) {
    const literalType = String(literal.literal_type ?? '');
    const value = String(literal.value ?? '');
    if (literalType === 'string') return 'text';
    if (literalType === 'boolean') return 'boolean';
    if (literalType === 'number') return value.includes('.') ? 'decimal' : 'integer';
    if (literalType === 'date') return 'date';
    if (literalType === 'time') return 'time';
    if (literalType === 'timestamp') return 'timestamp';
    if (literalType === 'interval') return 'interval';
    if (literalType === 'null') return 'unknown';
  }
  if (isAst(expression, 'null')) return 'unknown';
  return undefined;
}

function inferBindType(expression: AstExpression, binds: BindSpec): string | undefined {
  if (binds.mode === 'none') return undefined;
  const placeholder = getAst(expression, 'placeholder') ?? getAst(expression, 'parameter');
  if (!isRecord(placeholder)) return undefined;
  if (binds.mode === 'positional') {
    const index = typeof placeholder.index === 'number' ? placeholder.index : 1;
    return binds.binds.find((bind) => bind.index === index)?.type;
  }
  if (binds.mode === 'named') {
    const name = typeof placeholder.name === 'string' ? placeholder.name : undefined;
    return name ? binds.binds.find((bind) => bind.name === name)?.type : undefined;
  }
  return undefined;
}

function findSchemaColumn(
  expression: AstExpression,
  schema: ValidationSchema,
  tableAliases?: TableAliasMap,
): { table: SchemaTable; column: SchemaColumn; nullable?: boolean } | undefined {
  const dotColumn = dotAsColumnRef(expression);
  const columnRef = dotColumn ?? getAst(expression, 'column');
  if (!isRecord(columnRef)) return undefined;
  const columnName = identifierName(columnRef.name)?.toLowerCase();
  const tableQualifier = identifierName(columnRef.table)?.toLowerCase();
  const relation = tableQualifier ? tableAliases?.get(tableQualifier) : undefined;
  const tableName = tableQualifier ? relation?.tableName.toLowerCase() ?? tableQualifier : undefined;
  const tableSchema = relation?.schemaName?.toLowerCase();
  if (!columnName) return undefined;
  const scopedTableNames = tableName ? [] : [...new Set([...tableAliases?.values() ?? []].map((relation) => relation.tableName))].map((name) => name.toLowerCase());
  const scopedSchemas = tableName ? [] : [...new Set([...tableAliases?.values() ?? []].map((relation) => relation.schemaName).filter((name): name is string => Boolean(name)))].map((name) => name.toLowerCase());

  for (const table of schema.tables) {
    if (tableName && table.name.toLowerCase() !== tableName) continue;
    if (tableSchema && table.schema?.toLowerCase() !== tableSchema) continue;
    if (tableName && !tableSchema && table.schema) continue;
    if (!tableName && scopedTableNames.length > 0 && !scopedTableNames.includes(table.name.toLowerCase())) continue;
    if (!tableName && scopedTableNames.length > 0 && table.schema && scopedSchemas.length === 0) continue;
    if (!tableName && scopedSchemas.length > 0 && table.schema && !scopedSchemas.includes(table.schema.toLowerCase())) continue;
    const visibleIndex = relation?.visibleColumnNames.findIndex((name) => name.toLowerCase() === columnName) ?? -1;
    const resolvedColumnName = visibleIndex >= 0 ? table.columns[visibleIndex]?.name.toLowerCase() : columnName;
    const column = table.columns.find((candidate) => candidate.name.toLowerCase() === resolvedColumnName);
    if (column) return { table, column, nullable: relation?.nullable ? true : column.nullable };
  }
  return undefined;
}

function dotAsColumnRef(expression: AstExpression): Record<string, unknown> | undefined {
  const dot = getAst(expression, 'dot');
  if (!isRecord(dot)) return undefined;
  const leftColumn = isRecord(dot.this) ? getAst(dot.this, 'column') : undefined;
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
  const jsonScalar = getAst(expression, 'json_extract_scalar');
  if (isRecord(jsonScalar)) {
    const base = nestedBaseColumn(jsonScalar.this, schema, tableAliases);
    const path = literalString(jsonScalar.path);
    return {
      type: 'text',
      nullable: base?.column.nullable,
      source: base && path ? `${base.source}.${path}` : base?.source ?? 'json',
    };
  }

  const path = nestedAccessPath(expression, schema, tableAliases);
  if (!path) return undefined;
  const type = typeAtPath(path.base.column.type, path.steps);
  if (!type) return undefined;
  return {
    type,
    nullable: path.base.column.nullable,
    source: [path.base.source, ...path.steps.filter((step) => step.kind === 'field').map((step) => step.name)].join('.'),
  };
}

function nestedAccessPath(
  expression: unknown,
  schema: ValidationSchema,
  tableAliases?: TableAliasMap,
): { base: NestedBaseColumn; steps: NestedPathStep[] } | undefined {
  const dot = getAst(expression, 'dot');
  if (isRecord(dot)) {
    const parent = nestedAccessPath(dot.this, schema, tableAliases);
    const field = identifierName(dot.field);
    if (parent && field) return { base: parent.base, steps: [...parent.steps, { kind: 'field', name: field }] };
    return undefined;
  }

  const subscript = getAst(expression, 'subscript');
  if (isRecord(subscript)) {
    const parent = nestedAccessPath(subscript.this, schema, tableAliases);
    const field = literalString(subscript.index);
    if (parent && field && !isNumericString(field)) return { base: parent.base, steps: [...parent.steps, { kind: 'field', name: field }] };
    if (parent) return { base: parent.base, steps: [...parent.steps, { kind: 'element' }] };
    return undefined;
  }

  const base = nestedBaseColumn(expression, schema, tableAliases);
  if (base) return { base, steps: [] };

  const column = getAst(expression, 'column');
  if (isRecord(column)) {
    const qualifier = identifierName(column.table);
    const field = identifierName(column.name);
    if (qualifier && field) {
      const structBase = resolveVisibleColumn(qualifier, schema, tableAliases);
      if (structBase && fieldType(structBase.column.type, field)) {
        return { base: structBase, steps: [{ kind: 'field', name: field }] };
      }
    }
  }

  return undefined;
}

function nestedBaseColumn(expression: unknown, schema: ValidationSchema, tableAliases?: TableAliasMap): NestedBaseColumn | undefined {
  const column = getAst(expression, 'column');
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
    if (step.kind === 'element') return arrayElementType(current) ?? mapKeyValueTypes(current)?.[1];
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
  const parts = splitTopLevel(match[1], ',').map((part) => part.trim());
  return parts.length >= 2 && parts[0] && parts[1] ? [parts[0], parts[1]] : undefined;
}

function structFields(type: string): Array<{ name: string; type: string }> {
  const match = /^(?:struct|record|row)\s*<([\s\S]+)>$/i.exec(type.trim());
  if (!match) return [];
  return splitTopLevel(match[1], ',').flatMap((part) => {
    const trimmed = part.trim();
    const colon = splitField(trimmed, ':');
    const space = colon ?? splitField(trimmed, ' ');
    if (!space) return [];
    return [{ name: cleanIdentifier(space[0]), type: space[1].trim() }];
  });
}

function splitField(input: string, separator: ':' | ' '): [string, string] | undefined {
  let depth = 0;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '<' || char === '(') depth += 1;
    if (char === '>' || char === ')') depth -= 1;
    if (depth === 0 && (separator === ':' ? char === ':' : /\s/.test(char))) {
      const left = input.slice(0, index).trim();
      const right = input.slice(index + 1).trim();
      if (left && right) return [left, right];
    }
  }
  return undefined;
}

function literalString(expression: unknown): string | undefined {
  const literal = getAst(expression, 'literal');
  if (!isRecord(literal)) return undefined;
  return typeof literal.value === 'string' ? literal.value : undefined;
}

function isNumericString(value: string): boolean {
  return /^\d+$/.test(value);
}

function inferNamedBindFromColumn(expression: AstExpression, binds: BindSpec): string | undefined {
  if (binds.mode !== 'named') return undefined;
  const column = getAst(expression, 'column');
  if (!isRecord(column)) return undefined;
  const rawName = identifierName(column.name);
  const name = rawName?.match(/^[@$]([A-Za-z_]\w*)$/)?.[1];
  return name ? binds.binds.find((bind) => bind.name === name)?.type : undefined;
}

interface OutputItem {
  expression: AstExpression;
  name?: string;
  source?: string;
  schema?: ValidationSchema;
  tableAliases?: TableAliasMap;
}

function extractOutputItems(parsedAst: unknown, schema: ValidationSchema, dialect = 'generic'): OutputItem[] {
  return extractResultSets(parsedAst, schema, dialect).flat();
}

function extractResultSets(parsedAst: unknown, schema: ValidationSchema, dialect = 'generic'): OutputItem[][] {
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  const context: StatementContext = { prepared: new Map() };
  let currentSchema = schema;
  return statements.map((statement) => {
    const items = outputItemsForStatement(statement, currentSchema, context, dialect);
    rememberPreparedStatement(statement, context);
    currentSchema = schemaAfterStatement(statement, currentSchema, context);
    return items;
  });
}

function summarizeStatements(parsedAst: unknown, resultSets: Array<{ index: number; columns: DescribeColumn[] }>): StatementSummary[] {
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  return statements.map((statement, index) => {
    const resultSet = resultSets.find((candidate) => candidate.index === index + 1);
    const kind = statementKind(statement);
    if (resultSet && resultSet.columns.length > 0) {
      return { index: index + 1, kind, resultKind: 'static' };
    }
    const resultKind = resultKindForStatement(statement);
    return {
      index: index + 1,
      kind,
      resultKind,
      message: messageForResultKind(kind, resultKind),
    };
  });
}

function diagnosticsForStatements(statements: StatementSummary[], includeNoResultStatements: boolean): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const summaries = includeNoResultStatements
    ? statements.filter((statement) => statement.resultKind !== 'static')
    : statements.filter((statement) => !['static', 'none'].includes(statement.resultKind));

  for (const summary of summaries) {
    const message = summary.message ?? messageForResultKind(summary.kind, summary.resultKind);
    diagnostics.push({
      code: diagnosticCodeForResultKind(summary.resultKind),
      message,
      severity: summary.resultKind === 'none' ? 'info' : 'warning',
    });
  }

  if (diagnostics.length === 0 && includeNoResultStatements) {
    diagnostics.push({
      code: 'SQLDESC_UNKNOWN_RESULT_SHAPE',
      message: 'SQL parsed successfully but does not expose result-set columns.',
      severity: 'warning',
    });
  }

  return diagnostics;
}

function statementKind(statement: unknown): string {
  if (!isRecord(statement)) return 'unknown';
  return Object.keys(statement)[0] ?? 'unknown';
}

function resultKindForStatement(statement: unknown): StatementResultKind {
  if (!isRecord(statement)) return 'unknown';
  if (isNoResultExpressionCommand(statement)) return 'none';
  if (isRecord(statement.show) || isDescribeMetadataStatement(statement)) return 'metadata';
  if (isRecord(statement.pragma)) return 'metadata';
  if (isRecord(statement.summarize)) return 'metadata';
  if (isRecord(statement.copy) && isNoResultCopy(statement.copy)) return 'none';
  if (isNoResultCommandStatement(statement)) return 'none';
  if (isRecord(statement.execute) || isRecord(statement.copy)) return 'runtime';
  if (isRuntimeCommandStatement(statement)) return 'runtime';
  if (isRecord(statement.select) || isRecord(statement.values) || isRecord(statement.union) || isRecord(statement.intersect) || isRecord(statement.except) || isRecord(statement.pivot)) return 'unknown';
  if (isNoResultStatement(statement)) return 'none';
  return 'none';
}

function isRuntimeCommandStatement(statement: Record<string, unknown>): boolean {
  if (!isRecord(statement.command)) return false;
  const command = String(statement.command.this ?? '').toLowerCase();
  return /^(call|execute|exec|copy)\b/.test(command);
}

function isNoResultCommandStatement(statement: Record<string, unknown>): boolean {
  if (!isRecord(statement.command)) return false;
  const command = String(statement.command.this ?? '').toLowerCase();
  return /^(lock|vacuum|msck|repair|refresh|discard|cluster|reindex)\b/.test(command);
}

function isNoResultStatement(statement: Record<string, unknown>): boolean {
  return [
    'insert',
    'update',
    'delete',
    'merge',
    'create_table',
    'create_view',
    'drop_table',
    'drop_view',
    'alter_table',
    'alter_view',
    'create_type',
    'drop_type',
    'drop_namespace',
    'create_synonym',
    'create_index',
    'drop_index',
    'alter_index',
    'create_schema',
    'drop_schema',
    'create_database',
    'drop_database',
    'create_sequence',
    'drop_sequence',
    'create_function',
    'create_procedure',
    'create_trigger',
    'create_task',
    'drop_function',
    'drop_procedure',
    'drop_trigger',
    'comment',
    'grant',
    'revoke',
    'raw',
    'prepare',
    'transaction',
    'commit',
    'rollback',
    'use',
    'set_statement',
    'analyze',
    'refresh',
    'truncate',
    'command',
    'declare',
    'attach',
    'detach',
    'cache',
    'uncache',
  ].some((key) => isRecord(statement[key]));
}

function isNoResultCopy(copy: Record<string, unknown>): boolean {
  return copy.kind === true && copy.is_into !== true;
}

function isNoResultExpressionCommand(statement: Record<string, unknown>): boolean {
  const keyword = topLevelExpressionKeyword(statement);
  return keyword ? ['checkpoint', 'listen', 'notify', 'unlisten', 'savepoint', 'reindex', 'cluster'].includes(keyword) : false;
}

function topLevelExpressionKeyword(statement: Record<string, unknown>): string | undefined {
  const column = isRecord(statement.column) ? statement.column : undefined;
  const alias = isRecord(statement.alias) ? statement.alias : undefined;
  const aliasColumn = alias && isRecord(alias.this) && isRecord(alias.this.column) ? alias.this.column : undefined;
  return identifierName(column?.name ?? aliasColumn?.name)?.toLowerCase();
}

function isTopLevelExpressionStatement(statement: Record<string, unknown>): boolean {
  const statementKeys = [
    'select',
    'values',
    'union',
    'intersect',
    'except',
    'pivot',
    'show',
    'summarize',
    'pragma',
    'copy',
    'execute',
    'export',
    'prepare',
    'command',
    'describe',
    'insert',
    'update',
    'delete',
    'merge',
    'create_table',
    'create_view',
    'alter_table',
    'alter_view',
    'drop_table',
    'drop_view',
    'drop_index',
    'drop_schema',
    'drop_database',
    'drop_sequence',
    'drop_type',
    'drop_namespace',
    'drop_function',
    'drop_procedure',
    'drop_trigger',
    'raw',
    'analyze',
    'attach',
    'cache',
    'comment',
    'commit',
    'create_database',
    'create_function',
    'create_index',
    'create_procedure',
    'create_schema',
    'create_sequence',
    'create_synonym',
    'create_task',
    'create_trigger',
    'create_type',
    'declare',
    'detach',
    'grant',
    'refresh',
    'revoke',
    'rollback',
    'set_statement',
    'transaction',
    'truncate',
    'uncache',
    'use',
  ];
  if (statementKeys.some((key) => hasAstKey(statement, key))) return false;
  return [
    'alias',
    'array_func',
    'boolean',
    'case',
    'column',
    'coalesce',
    'add',
    'between',
    'bitwise_and',
    'bitwise_left_shift',
    'bitwise_or',
    'bitwise_right_shift',
    'bitwise_xor',
    'cast',
    'concat',
    'sub',
    'mul',
    'div',
    'eq',
    'exists',
    'extract',
    'function',
    'gt',
    'gte',
    'if_func',
    'i_like',
    'in',
    'is',
    'is_null',
    'is_not_null',
    'like',
    'literal',
    'lt',
    'lte',
    'mod',
    'neg',
    'not',
    'null_safe_eq',
    'null_safe_neq',
    'null',
    'paren',
    'power',
    'try_cast',
    'safe_cast',
    'similar_to',
    'subquery',
  ].some((key) => hasAstKey(statement, key));
}

function hasAstKey(statement: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(statement, key);
}

function isDescribeMetadataStatement(statement: Record<string, unknown>): boolean {
  if (!isRecord(statement.describe)) return false;
  return true;
}

function messageForResultKind(kind: string, resultKind: StatementResultKind): string {
  if (resultKind === 'metadata') {
    return `${kind.toUpperCase()} parses successfully, but its result-set shape is dialect-specific metadata and cannot be inferred statically.`;
  }
  if (resultKind === 'runtime') {
    return `${kind.toUpperCase()} parses successfully, but its result-set shape depends on runtime database behavior.`;
  }
  if (resultKind === 'none') {
    return `${kind.toUpperCase()} parses successfully and does not expose result-set columns.`;
  }
  return `${kind.toUpperCase()} parses successfully, but no statically inferable result-set columns were found.`;
}

function diagnosticCodeForResultKind(resultKind: StatementResultKind): string {
  if (resultKind === 'metadata') return 'SQLDESC_METADATA_RESULT_SHAPE';
  if (resultKind === 'runtime') return 'SQLDESC_RUNTIME_RESULT_SHAPE';
  if (resultKind === 'none') return 'SQLDESC_NO_RESULT_COLUMNS';
  return 'SQLDESC_UNKNOWN_RESULT_SHAPE';
}

function suppressResolvedNestedDiagnostics(diagnostics: Diagnostic[], columns: DescribeColumn[]): Diagnostic[] {
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown table or alias '([^']+)' referenced by column '([^']+)'/);
    if (!match) return true;
    const [, qualifier, column] = match;
    return !columns.some((resultColumn) => resultColumn.source?.toLowerCase().endsWith(`.${qualifier}.${column}`.toLowerCase()));
  });
}

function suppressResolvedColumnDiagnostics(diagnostics: Diagnostic[], columns: DescribeColumn[]): Diagnostic[] {
  const resolvedColumnNames = new Set(columns.flatMap((column) => column.source ? [column.name.toLowerCase()] : []));
  if (resolvedColumnNames.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown column '([^']+)'/);
    return !match || !resolvedColumnNames.has(match[1].toLowerCase());
  });
}

function suppressResolvedSourceDiagnostics(diagnostics: Diagnostic[], columns: DescribeColumn[]): Diagnostic[] {
  const resolvedSources = new Set(columns.flatMap((column) => {
    const parts = column.source?.toLowerCase().split('.') ?? [];
    if (parts.length < 2) return [];
    const unqualified = parts.at(-2);
    const qualified = parts.length >= 3 ? `${parts.at(-3)}.${parts.at(-2)}` : undefined;
    return [unqualified, qualified].filter((source): source is string => Boolean(source));
  }));
  if (resolvedSources.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown table '([^']+)'/);
    if (!match) return true;
    const table = match[1].toLowerCase();
    const unqualified = table.split('.').at(-1);
    return !resolvedSources.has(table) && !(unqualified && resolvedSources.has(unqualified));
  });
}

function suppressKnownSchemaDiagnostics(diagnostics: Diagnostic[], schema: ValidationSchema): Diagnostic[] {
  return diagnostics.filter((diagnostic) => {
    const tableColumn = diagnostic.message.match(/Unknown column '([^']+)' in table '([^']+)'/);
    if (tableColumn) {
      const [, columnName, tableName] = tableColumn;
      return !schemaHasColumn(schema, tableName, columnName);
    }
    return true;
  });
}

function suppressResolvedInsertValueDiagnostics(diagnostics: Diagnostic[], parsedAst: unknown): Diagnostic[] {
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  if (!statements.some(hasBalancedInsertValues)) return diagnostics;
  return diagnostics.filter((diagnostic) => !/^INSERT row \d+ has \d+ values but target has \d+ columns$/i.test(diagnostic.message));
}

function hasBalancedInsertValues(statement: unknown): boolean {
  if (!isRecord(statement) || !isRecord(statement.insert)) return false;
  const columns = Array.isArray(statement.insert.columns) ? statement.insert.columns : [];
  const values = Array.isArray(statement.insert.values) ? statement.insert.values : [];
  return columns.length > 0 && values.length > 0 && values.every((row) => Array.isArray(row) && row.length === columns.length);
}

function schemaHasColumn(schema: ValidationSchema, tableName: string, columnName: string): boolean {
  const parts = tableName.toLowerCase().split('.');
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
): Diagnostic[] {
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  const staticStatementIndexes = new Set(resultSets.filter((resultSet) => resultSet.columns.length > 0).map((resultSet) => resultSet.index));
  const hasStaticExport = statements.some((statement, index) => staticStatementIndexes.has(index + 1) && isRecord(statement) && isRecord(statement.export));
  if (!hasStaticExport) return diagnostics;
  return diagnostics.filter((diagnostic) => diagnostic.code !== 'E004');
}

function suppressResolvedPreparedDiagnostics(
  diagnostics: Diagnostic[],
  parsedAst: unknown,
  resultSets: Array<{ index: number; columns: DescribeColumn[] }>,
): Diagnostic[] {
  const statements = Array.isArray(parsedAst) ? parsedAst : [parsedAst];
  const resolvedExecuteNames = new Set(statements.flatMap((statement, index) => {
    if (!isRecord(statement) || !isRecord(statement.execute)) return [];
    if (!resultSets.some((resultSet) => resultSet.index === index + 1 && resultSet.columns.length > 0)) return [];
    const name = executeName(statement.execute);
    return name ? [name.toLowerCase()] : [];
  }));
  if (resolvedExecuteNames.size === 0) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    const match = diagnostic.message.match(/Unknown table '([^']+)'/);
    return !match || !resolvedExecuteNames.has(match[1].toLowerCase());
  });
}

function suppressRuntimeOnlyDiagnostics(diagnostics: Diagnostic[], statements: StatementSummary[]): Diagnostic[] {
  if (!statements.some((statement) => statement.resultKind === 'runtime')) return diagnostics;
  if (statements.some((statement) => statement.resultKind === 'static' || statement.resultKind === 'unknown')) return diagnostics;
  return diagnostics.filter((diagnostic) => {
    if (diagnostic.code === 'E200' || diagnostic.code === 'E004') return false;
    if (/Unknown table|Unknown column|Unknown table or alias/i.test(diagnostic.message)) return false;
    return true;
  });
}

function outputItemsForStatement(statement: unknown, schema: ValidationSchema, context: StatementContext = { prepared: new Map() }, dialect = 'generic'): OutputItem[] {
  if (!isRecord(statement)) return [];
  if (isRecord(statement.select)) {
    const localSchema = mergeSchemas(schemaFromCtes(statement.select.with, schema), schema);
    const scopedSchema = mergeSchemas(schemaFromDerivedTables(statement.select, localSchema), localSchema);
    return outputItemsFromExpressions(statement.select.expressions, scopedSchema, statement.select);
  }
  if (isRecord(statement.values)) return outputItemsFromValues(statement.values, schema);
  if (isRecord(statement.union)) return outputItemsFromSetOperation(statement.union, schema, context, dialect);
  if (isRecord(statement.intersect)) return outputItemsFromSetOperation(statement.intersect, schema, context, dialect);
  if (isRecord(statement.except)) return outputItemsFromSetOperation(statement.except, schema, context, dialect);
  if (isRecord(statement.pivot)) return outputItemsFromPivot(statement.pivot, schema);
  if (isRecord(statement.create_view)) return outputItemsFromCreateView(statement.create_view, schema, context, dialect);
  if (isRecord(statement.create_table)) return outputItemsFromCreateTable(statement.create_table, schema, context, dialect);
  if (isRecord(statement.execute)) return outputItemsFromExecute(statement.execute, schema, context, dialect);
  if (isRecord(statement.describe)) return outputItemsFromDescribe(statement.describe, schema, context, dialect);
  if (isRecord(statement.show)) return outputItemsFromShow(statement.show, dialect);
  if (isRecord(statement.summarize)) return outputItemsFromSummarize();
  if (isRecord(statement.pragma)) return outputItemsFromPragma(statement.pragma);
  if (isRecord(statement.analyze)) return outputItemsFromAnalyze(statement.analyze);
  if (isNoResultCommandStatement(statement)) return [];
  if (isRecord(statement.command)) return outputItemsFromCommand(statement.command);
  if (isRecord(statement.copy)) return outputItemsFromCopy(statement.copy, schema, context);
  if (isRecord(statement.export)) return outputItemsFromExport(statement.export, schema, context);
  if (isRecord(statement.insert)) return outputItemsFromReturning(statement.insert, schema);
  if (isRecord(statement.update)) return outputItemsFromReturning(statement.update, schema);
  if (isRecord(statement.delete)) return outputItemsFromReturning(statement.delete, schema);
  if (isRecord(statement.merge)) return outputItemsFromMerge(statement.merge, schema);
  if (isNoResultExpressionCommand(statement)) return [];
  if (isTopLevelExpressionStatement(statement)) return outputItemsFromExpressions([statement], schema);

  return [];
}

function schemaFromDefinitionStatement(statement: unknown, schema: ValidationSchema, context: StatementContext): ValidationSchema {
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

function schemaAfterStatement(statement: unknown, schema: ValidationSchema, context: StatementContext): ValidationSchema {
  if (isRecord(statement) && isRecord(statement.alter_table)) return schemaAfterAlterTable(statement.alter_table, schema);
  if (isRecord(statement) && isRecord(statement.alter_view)) return schemaAfterAlterView(statement.alter_view, schema);
  if (isRecord(statement) && isRecord(statement.raw)) return schemaAfterRawStatement(statement.raw, schema);
  if (isRecord(statement) && isRecord(statement.drop_table)) return schemaAfterDropTable(statement.drop_table, schema);
  if (isRecord(statement) && isRecord(statement.drop_view)) return schemaAfterDropView(statement.drop_view, schema);
  if (isRecord(statement) && isRecord(statement.drop_schema)) return schemaAfterDropSchema(statement.drop_schema, schema);
  if (isRecord(statement) && isRecord(statement.drop_database)) return schemaAfterDropSchema(statement.drop_database, schema);
  if (isRecord(statement) && isRecord(statement.drop_namespace)) return schemaAfterDropSchema(statement.drop_namespace, schema);
  if (isRecord(statement) && isRecord(statement.select)) return schemaAfterSelectInto(statement.select, schema, context);
  const defined = schemaFromDefinitionStatement(statement, schema, context);
  return mergeSchemas(defined, schema);
}

function schemaAfterSelectInto(select: Record<string, unknown>, schema: ValidationSchema, context: StatementContext): ValidationSchema {
  if (!isRecord(select.into) || !isRecord(select.into.this) || !isRecord(select.into.this.table)) return schema;
  const name = relationNameFromRef(select.into.this.table);
  if (!name) return schema;
  const items = outputItemsForStatement({ select }, schema, context);
  const table: SchemaTable = {
    name,
    columns: columnsFromOutputItems(items, [], schema),
  };
  return mergeSchemas({ tables: [table] }, schema);
}

function schemaAfterDropTable(dropTable: Record<string, unknown>, schema: ValidationSchema): ValidationSchema {
  const names = Array.isArray(dropTable.names) ? dropTable.names : [];
  return dropSchemaRelations(schema, names);
}

function schemaAfterDropView(dropView: Record<string, unknown>, schema: ValidationSchema): ValidationSchema {
  return dropSchemaRelations(schema, [dropView.name]);
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
  const rawTable = tableFromRawCreateTable(sql);
  if (rawTable) return mergeSchemas({ tables: [rawTable] }, schema);
  const alterMaterializedViewRename = sql.match(/^alter\s+materialized\s+view\s+(.+?)\s+rename\s+to\s+(.+?)\s*$/i);
  if (alterMaterializedViewRename) {
    const oldRef = relationRefFromSqlName(alterMaterializedViewRename[1]);
    const newRef = relationRefFromSqlName(alterMaterializedViewRename[2]);
    const oldName = oldRef.name;
    const newName = newRef.name;
    if (!oldName || !newName) return schema;
    return {
      tables: schema.tables.map((table) => {
        if (table.name.toLowerCase() !== oldName.toLowerCase()) return table;
        if (oldRef.schema && table.schema?.toLowerCase() !== oldRef.schema.toLowerCase()) return table;
        return {
          ...table,
          name: newName,
          ...(newRef.schema ? { schema: newRef.schema } : {}),
        };
      }),
    };
  }
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

function relationRefFromSqlName(name: string): { schema?: string; name?: string } {
  const parts = name.split('.').map((part) => cleanIdentifier(part.trim())).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { name: parts[0] };
  return { schema: parts.at(-2), name: parts.at(-1) };
}

function schemaAfterAlterView(alterView: Record<string, unknown>, schema: ValidationSchema): ValidationSchema {
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
  return actions.reduce<SchemaTable>((current, action) => {
    if (!isRecord(action)) return current;
    if (isRecord(action.Rename)) return renameAlterTable(current, action.Rename);
    return current;
  }, { ...table, columns: [...table.columns] });
}

function dropSchemaRelations(schema: ValidationSchema, refs: unknown[]): ValidationSchema {
  const names = refs.flatMap((ref) => {
    const name = relationNameFromRef(ref);
    const schemaName = isRecord(ref) ? identifierName(ref.schema) : undefined;
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
    const created = applyAlterActions({ name: tableName, ...(schemaName ? { schema: schemaName } : {}), columns: [] }, actions);
    return { tables: [created, ...schema.tables] };
  }
  return { tables };
}

function applyAlterActions(table: SchemaTable, actions: unknown[]): SchemaTable {
  return actions.reduce<SchemaTable>((current, action) => {
    if (!isRecord(action)) return current;
    if (isRecord(action.RenameTable)) return renameAlterTable(current, action.RenameTable);
    if (isRecord(action.AddColumn)) return addAlterColumn(current, action.AddColumn.column);
    if (isRecord(action.AddColumns)) return addAlterColumns(current, action.AddColumns.columns);
    if (isRecord(action.DropColumn)) return dropAlterColumn(current, action.DropColumn.name);
    if (isRecord(action.RenameColumn)) return renameAlterColumn(current, action.RenameColumn.old_name, action.RenameColumn.new_name);
    if (isRecord(action.ChangeColumn)) return changeAlterColumn(current, action.ChangeColumn);
    if (isRecord(action.AlterColumn)) return alterColumn(current, action.AlterColumn);
    if (isRecord(action.AddConstraint)) return addAlterConstraint(current, action.AddConstraint);
    if (isRecord(action.Raw)) return applyRawAlterAction(current, action.Raw);
    return current;
  }, { ...table, columns: [...table.columns] });
}

function tableFromRawCreateTable(sql: string): SchemaTable | undefined {
  const create = sql.match(/^create\s+(?:global\s+temporary\s+|temporary\s+|temp\s+)?table\s+(.+?)\s*\(([\s\S]*)\)\s*$/i);
  if (!create) return undefined;
  const ref = relationRefFromSqlName(create[1]);
  if (!ref.name) return undefined;
  const columns = splitTopLevel(create[2], ',')
    .map(rawSchemaColumn)
    .filter((column): column is SchemaColumn => Boolean(column));
  return columns.length > 0 ? { name: ref.name, ...(ref.schema ? { schema: ref.schema } : {}), columns } : undefined;
}

function rawSchemaColumn(spec: string): SchemaColumn | undefined {
  const trimmed = spec.trim();
  if (!trimmed || /^(?:constraint|primary|unique|foreign|check)\b/i.test(trimmed)) return undefined;
  const match = trimmed.match(/^("[^"]+"|`[^`]+`|\[[^\]]+\]|\w+)\s+(.+)$/);
  if (!match) return undefined;
  const name = cleanIdentifier(match[1]);
  const type = dataTypeFromRawColumnSpec(match[2]) ?? 'unknown';
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
  const columns = table.columns.filter((existing) => existing.name.toLowerCase() !== column.name.toLowerCase());
  return { ...table, columns: [...columns, column] };
}

function addAlterColumns(table: SchemaTable, columnDefinitions: unknown): SchemaTable {
  const columns = Array.isArray(columnDefinitions)
    ? columnDefinitions.map(schemaColumnFromDefinition).filter((column): column is SchemaColumn => Boolean(column))
    : [];
  return columns.reduce((current, column) => {
    const existing = current.columns.filter((candidate) => candidate.name.toLowerCase() !== column.name.toLowerCase());
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
    columns: table.columns.map((column) => column.name.toLowerCase() === oldName.toLowerCase()
      ? { ...column, name: newName, ...(type ? { type } : {}) }
      : column),
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

function tableFromCreateViewDefinition(createView: Record<string, unknown>, schema: ValidationSchema, context: StatementContext): SchemaTable | undefined {
  const name = relationNameFromRef(createView.name);
  if (!name || !isRecord(createView.query)) return undefined;
  const schemaName = relationSchemaFromRef(createView.name);
  const explicitColumns = Array.isArray(createView.columns) ? createView.columns : [];
  const items = outputItemsForStatement(createView.query, schema, context);
  return {
    name,
    ...(schemaName ? { schema: schemaName } : {}),
    columns: columnsFromOutputItems(items, explicitColumns, schema),
  };
}

function tableFromCreateTableDefinition(createTable: Record<string, unknown>, schema: ValidationSchema, context: StatementContext): SchemaTable | undefined {
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
  if (copied) return { name, ...(schemaName ? { schema: schemaName } : {}), columns: copied };
  const columns = Array.isArray(createTable.columns)
    ? createTable.columns.map(schemaColumnFromDefinition).filter((column): column is SchemaColumn => column !== undefined)
    : [];
  return columns.length > 0 ? { name, ...(schemaName ? { schema: schemaName } : {}), columns } : undefined;
}

function tableFromCreateSynonymDefinition(createSynonym: Record<string, unknown>, schema: ValidationSchema): SchemaTable | undefined {
  const name = relationNameFromRef(createSynonym.name);
  const targetName = relationNameFromRef(createSynonym.target);
  if (!name || !targetName) return undefined;
  const schemaName = relationSchemaFromRef(createSynonym.name);
  const targetSchema = relationSchemaFromRef(createSynonym.target);
  const target = schema.tables.find((table) => {
    if (table.name.toLowerCase() !== targetName.toLowerCase()) return false;
    if (targetSchema && table.schema?.toLowerCase() !== targetSchema.toLowerCase()) return false;
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

function copiedTableColumns(createTable: Record<string, unknown>, schema: ValidationSchema): SchemaColumn[] | undefined {
  const sourceRef = isRecord(createTable.clone_source) ? createTable.clone_source : likeTableSource(createTable);
  if (!sourceRef) return undefined;
  const sourceName = relationNameFromRef(sourceRef)?.toLowerCase();
  const sourceSchema = isRecord(sourceRef) ? identifierName(sourceRef.schema)?.toLowerCase() : undefined;
  if (!sourceName) return undefined;
  const source = schema.tables.find((table) => {
    if (table.name.toLowerCase() !== sourceName) return false;
    if (sourceSchema && table.schema?.toLowerCase() !== sourceSchema) return false;
    return true;
  });
  return source ? source.columns.map((column) => ({ ...column })) : undefined;
}

function likeTableSource(createTable: Record<string, unknown>): Record<string, unknown> | undefined {
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

function schemaColumnFromDefinition(column: unknown): SchemaColumn | undefined {
  if (!isRecord(column)) return undefined;
  const name = identifierName(column.name);
  if (!name) return undefined;
  return {
    name,
    type: dataTypeToString(column.data_type) ?? 'unknown',
    nullable: typeof column.nullable === 'boolean' ? column.nullable : undefined,
    primaryKey: column.primary_key === true,
    unique: column.unique === true,
  };
}

function rememberPreparedStatement(statement: unknown, context: StatementContext): void {
  if (!isRecord(statement) || !isRecord(statement.prepare)) return;
  const name = identifierName(statement.prepare.name);
  if (name && isRecord(statement.prepare.statement)) context.prepared.set(name.toLowerCase(), statement.prepare.statement);
}

function outputItemsFromExecute(execute: Record<string, unknown>, schema: ValidationSchema, context: StatementContext, dialect = 'generic'): OutputItem[] {
  const name = executeName(execute);
  const prepared = name ? context.prepared.get(name.toLowerCase()) : undefined;
  return prepared ? outputItemsForStatement(prepared, schema, context, dialect) : [];
}

function outputItemsFromDescribe(describe: Record<string, unknown>, schema: ValidationSchema, context: StatementContext, dialect = 'generic'): OutputItem[] {
  const target = isRecord(describe.target) ? describe.target : undefined;
  if (String(describe.kind ?? '').toLowerCase() === 'function') return describeFunctionColumns(dialect);
  if (!target) return [];
  const styled = describeStyleColumns(String(describe.style ?? '').toLowerCase());
  if (styled.length > 0) return styled;
  const describeTable = describeTableColumns(describe, target);
  if (describeTable.length > 0) return describeTable;
  const snowflakeObject = snowflakeDescribeObjectColumns(target, dialect);
  if (snowflakeObject.length > 0) return snowflakeObject;
  const genericObject = describeObjectColumns(target);
  if (genericObject.length > 0) return genericObject;
  if (isRecord(target.table)) return outputItemsFromDescribedTable(target.table, schema);
  if (isResultProducingQuery(target)) return explainColumns(dialect);
  return outputItemsForStatement(target, schema, context, dialect);
}

function describeTableColumns(describe: Record<string, unknown>, target: Record<string, unknown>): OutputItem[] {
  if (String(describe.kind ?? '').toLowerCase() !== 'table' || !isRecord(target.table)) return [];
  const targetName = identifierName(target.table.name)?.toLowerCase();
  if (!['extended', 'formatted'].includes(targetName ?? '')) return [];
  return staticColumns([
    ['col_name', 'text'],
    ['data_type', 'text'],
    ['comment', 'text'],
  ]);
}

function describeStyleColumns(style: string): OutputItem[] {
  if (style === 'detail') {
    return staticColumns([
      ['format', 'text'],
      ['id', 'text'],
      ['name', 'text'],
      ['description', 'text'],
      ['location', 'text'],
      ['createdAt', 'timestamp'],
      ['lastModified', 'timestamp'],
      ['partitionColumns', 'array<text>'],
      ['numFiles', 'integer'],
      ['sizeInBytes', 'integer'],
      ['properties', 'map<text, text>'],
    ]);
  }
  if (style === 'history') {
    return staticColumns([
      ['version', 'integer'],
      ['timestamp', 'timestamp'],
      ['userId', 'text'],
      ['userName', 'text'],
      ['operation', 'text'],
      ['operationParameters', 'map<text, text>'],
      ['job', 'text'],
      ['notebook', 'text'],
      ['clusterId', 'text'],
      ['readVersion', 'integer'],
      ['isolationLevel', 'text'],
      ['isBlindAppend', 'boolean'],
      ['operationMetrics', 'map<text, text>'],
    ]);
  }
  return [];
}

function describeObjectColumns(target: Record<string, unknown>): OutputItem[] {
  if (!isRecord(target.table)) return [];
  const name = identifierName(target.table.name)?.toLowerCase();
  if (name === 'database' || name === 'schema' || name === 'namespace') {
    return staticColumns([
      ['database_description_item', 'text'],
      ['database_description_value', 'text'],
    ]);
  }
  return [];
}

function snowflakeDescribeObjectColumns(target: Record<string, unknown>, dialect: string): OutputItem[] {
  if (dialect.toLowerCase() !== 'snowflake' || !isRecord(target.table)) return [];
  const name = identifierName(target.table.name)?.toLowerCase();
  if (!name || !['warehouse', 'integration', 'stage', 'pipe', 'task'].includes(name)) return [];
  if (name === 'warehouse') {
    return staticColumns([
      ['property', 'text'],
      ['value', 'text'],
      ['default', 'text'],
      ['level', 'text'],
      ['description', 'text'],
    ]);
  }
  if (name === 'stage') {
    return staticColumns([
      ['parent_property', 'text'],
      ['property', 'text'],
      ['property_type', 'text'],
      ['property_value', 'text'],
      ['property_default', 'text'],
    ]);
  }
  if (name === 'pipe' || name === 'task') {
    return staticColumns([
      ['property', 'text'],
      ['value', 'text'],
    ]);
  }
  return staticColumns([
    ['property', 'text'],
    ['value', 'text'],
  ]);
}

function describeFunctionColumns(dialect: string): OutputItem[] {
  if (dialect.toLowerCase() === 'spark') {
    return staticColumns([
      ['function_desc', 'text'],
    ]);
  }
  return staticColumns([
    ['Name', 'text'],
    ['Description', 'text'],
  ]);
}

function explainColumns(dialect: string): OutputItem[] {
  if (dialect.toLowerCase() === 'mysql') {
    return staticColumns([
      ['id', 'integer'],
      ['select_type', 'text'],
      ['table', 'text'],
      ['partitions', 'text'],
      ['type', 'text'],
      ['possible_keys', 'text'],
      ['key', 'text'],
      ['key_len', 'text'],
      ['ref', 'text'],
      ['rows', 'integer'],
      ['filtered', 'decimal'],
      ['Extra', 'text'],
    ]);
  }
  if (dialect.toLowerCase() === 'sqlite') {
    return staticColumns([
      ['addr', 'integer'],
      ['opcode', 'text'],
      ['p1', 'integer'],
      ['p2', 'integer'],
      ['p3', 'integer'],
      ['p4', 'text'],
      ['p5', 'integer'],
      ['comment', 'text'],
    ]);
  }
  return staticColumns([['QUERY PLAN', 'text']]);
}

function isResultProducingQuery(statement: Record<string, unknown>): boolean {
  return ['select', 'values', 'union', 'intersect', 'except'].some((key) => isRecord(statement[key]));
}

function outputItemsFromShow(show: Record<string, unknown>, dialect = 'generic'): OutputItem[] {
  const subject = String(show.this ?? '').toLowerCase();
  const normalizedSubject = subject.replace(/^(?:global|session|full)\s+/, '');
  if (subject === 'tables' || subject === 'views' || subject === 'full tables') {
    if (subject === 'tables' && dialect.toLowerCase() === 'snowflake') return snowflakeTableListingColumns();
    return staticColumns([
      [subject === 'views' ? 'View' : 'Table', 'text'],
      ...(subject === 'full tables' ? [['Table_type', 'text']] satisfies Array<[string, string]> : []),
    ]);
  }
  if (subject.startsWith('table ')) return snowflakeTableListingColumns();
  if (subject === 'all tables') return snowflakeTableListingColumns();
  if (subject === 'databases' || subject === 'schemas') {
    return staticColumns([
      [subject === 'schemas' ? 'Schema' : 'Database', 'text'],
    ]);
  }
  if (normalizedSubject === 'variables' || normalizedSubject === 'status') {
    return staticColumns([
      ['Variable_name', 'text'],
      ['Value', 'text'],
    ]);
  }
  if (subject === 'all') {
    return staticColumns([
      ['name', 'text'],
      ['setting', 'text'],
      ['description', 'text'],
    ]);
  }
  if (subject === 'catalogs') {
    return staticColumns([
      ['Catalog', 'text'],
    ]);
  }
  if (subject === 'current namespace' || subject === 'namespaces') {
    return staticColumns([
      ['namespace', 'text'],
    ]);
  }
  if (subject === 'authors' || subject === 'contributors') {
    return staticColumns([
      ['Name', 'text'],
      ['Location', 'text'],
      ['Comment', 'text'],
    ]);
  }
  if (subject === 'warnings' || subject === 'errors') {
    return staticColumns([
      ['Level', 'text'],
      ['Code', 'integer'],
      ['Message', 'text'],
    ]);
  }
  if (subject === 'grants') {
    return staticColumns([
      ['Grants', 'text'],
    ]);
  }
  if (subject === 'engines') {
    return staticColumns([
      ['Engine', 'text'],
      ['Support', 'text'],
      ['Comment', 'text'],
      ['Transactions', 'text'],
      ['XA', 'text'],
      ['Savepoints', 'text'],
    ]);
  }
  if (subject === 'storage engines') {
    return outputItemsFromShow({ this: 'engines' }, dialect);
  }
  if (subject === 'engine' || subject.startsWith('engine ')) {
    return staticColumns([
      ['Type', 'text'],
      ['Name', 'text'],
      ['Status', 'text'],
    ]);
  }
  if (normalizedSubject === 'processlist') {
    return staticColumns([
      ['Id', 'integer'],
      ['User', 'text'],
      ['Host', 'text'],
      ['db', 'text'],
      ['Command', 'text'],
      ['Time', 'integer'],
      ['State', 'text'],
      ['Info', 'text'],
    ]);
  }
  if (subject === 'privileges') {
    return staticColumns([
      ['Privilege', 'text'],
      ['Context', 'text'],
      ['Comment', 'text'],
    ]);
  }
  if (subject === 'character set' || subject === 'charset') {
    return staticColumns([
      ['Charset', 'text'],
      ['Description', 'text'],
      ['Default collation', 'text'],
      ['Maxlen', 'integer'],
    ]);
  }
  if (subject === 'collation') {
    return staticColumns([
      ['Collation', 'text'],
      ['Charset', 'text'],
      ['Id', 'integer'],
      ['Default', 'text'],
      ['Compiled', 'text'],
      ['Sortlen', 'integer'],
    ]);
  }
  if (subject === 'table status') {
    return staticColumns([
      ['Name', 'text'],
      ['Engine', 'text'],
      ['Version', 'integer'],
      ['Row_format', 'text'],
      ['Rows', 'integer'],
      ['Avg_row_length', 'integer'],
      ['Data_length', 'integer'],
      ['Max_data_length', 'integer'],
      ['Index_length', 'integer'],
      ['Data_free', 'integer'],
      ['Auto_increment', 'integer'],
      ['Create_time', 'timestamp'],
      ['Update_time', 'timestamp'],
      ['Check_time', 'timestamp'],
      ['Collation', 'text'],
      ['Checksum', 'integer'],
      ['Create_options', 'text'],
      ['Comment', 'text'],
    ]);
  }
  if (subject === 'open tables') {
    return staticColumns([
      ['Database', 'text'],
      ['Table', 'text'],
      ['In_use', 'integer'],
      ['Name_locked', 'integer'],
    ]);
  }
  if (subject === 'triggers') {
    return staticColumns([
      ['Trigger', 'text'],
      ['Event', 'text'],
      ['Table', 'text'],
      ['Statement', 'text'],
      ['Timing', 'text'],
      ['Created', 'timestamp'],
      ['sql_mode', 'text'],
      ['Definer', 'text'],
      ['character_set_client', 'text'],
      ['collation_connection', 'text'],
      ['Database Collation', 'text'],
    ]);
  }
  if (subject === 'events') {
    return staticColumns([
      ['Db', 'text'],
      ['Name', 'text'],
      ['Definer', 'text'],
      ['Time zone', 'text'],
      ['Type', 'text'],
      ['Execute at', 'timestamp'],
      ['Interval value', 'text'],
      ['Interval field', 'text'],
      ['Starts', 'timestamp'],
      ['Ends', 'timestamp'],
      ['Status', 'text'],
      ['Originator', 'integer'],
      ['character_set_client', 'text'],
      ['collation_connection', 'text'],
      ['Database Collation', 'text'],
    ]);
  }
  if (subject.startsWith('procedure code') || subject.startsWith('function code')) {
    return staticColumns([
      ['Pos', 'integer'],
      ['Instruction', 'text'],
    ]);
  }
  if (subject === 'plugins') {
    return staticColumns([
      ['Name', 'text'],
      ['Status', 'text'],
      ['Type', 'text'],
      ['Library', 'text'],
      ['License', 'text'],
    ]);
  }
  if (subject === 'function status' || subject === 'procedure status') {
    return staticColumns([
      ['Db', 'text'],
      ['Name', 'text'],
      ['Type', 'text'],
      ['Definer', 'text'],
      ['Modified', 'timestamp'],
      ['Created', 'timestamp'],
      ['Security_type', 'text'],
      ['Comment', 'text'],
      ['character_set_client', 'text'],
      ['collation_connection', 'text'],
      ['Database Collation', 'text'],
    ]);
  }
  if (subject === 'binary logs' || subject === 'binlogs') {
    return staticColumns([
      ['Log_name', 'text'],
      ['File_size', 'integer'],
      ['Encrypted', 'text'],
    ]);
  }
  if (subject === 'master status' || subject === 'binary log status') {
    return staticColumns([
      ['File', 'text'],
      ['Position', 'integer'],
      ['Binlog_Do_DB', 'text'],
      ['Binlog_Ignore_DB', 'text'],
      ['Executed_Gtid_Set', 'text'],
    ]);
  }
  if (subject === 'master logs') {
    return outputItemsFromShow({ this: 'binary logs' }, dialect);
  }
  if (subject === 'relaylog events' || subject === 'binlog events') {
    return staticColumns([
      ['Log_name', 'text'],
      ['Pos', 'integer'],
      ['Event_type', 'text'],
      ['Server_id', 'integer'],
      ['End_log_pos', 'integer'],
      ['Info', 'text'],
    ]);
  }
  if (subject === 'slave status' || subject === 'replica status') {
    return staticColumns([
      ['Slave_IO_State', 'text'],
      ['Master_Host', 'text'],
      ['Master_User', 'text'],
      ['Master_Port', 'integer'],
      ['Connect_Retry', 'integer'],
      ['Master_Log_File', 'text'],
      ['Read_Master_Log_Pos', 'integer'],
      ['Relay_Log_File', 'text'],
      ['Relay_Log_Pos', 'integer'],
      ['Relay_Master_Log_File', 'text'],
      ['Slave_IO_Running', 'text'],
      ['Slave_SQL_Running', 'text'],
      ['Last_Errno', 'integer'],
      ['Last_Error', 'text'],
      ['Seconds_Behind_Master', 'integer'],
    ]);
  }
  if (subject === 'replicas') {
    return staticColumns([
      ['Server_Id', 'integer'],
      ['Host', 'text'],
      ['Port', 'integer'],
      ['Source_Id', 'integer'],
      ['Replica_UUID', 'text'],
    ]);
  }
  if (subject === 'profiles') {
    return staticColumns([
      ['Query_ID', 'integer'],
      ['Duration', 'decimal'],
      ['Query', 'text'],
    ]);
  }
  if (subject === 'profile') {
    return staticColumns([
      ['Status', 'text'],
      ['Duration', 'decimal'],
    ]);
  }
  if (subject === 'parameters') {
    return staticColumns([
      ['key', 'text'],
      ['value', 'text'],
      ['default', 'text'],
      ['level', 'text'],
      ['description', 'text'],
      ['type', 'text'],
    ]);
  }
  if (subject === 'warehouses') {
    return staticColumns([
      ['name', 'text'],
      ['state', 'text'],
      ['type', 'text'],
      ['size', 'text'],
      ['min_cluster_count', 'integer'],
      ['max_cluster_count', 'integer'],
      ['started_clusters', 'integer'],
      ['running', 'integer'],
      ['queued', 'integer'],
      ['is_default', 'boolean'],
      ['is_current', 'boolean'],
      ['auto_suspend', 'integer'],
      ['auto_resume', 'boolean'],
    ]);
  }
  if (subject === 'stages') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['name', 'text'],
      ['database_name', 'text'],
      ['schema_name', 'text'],
      ['url', 'text'],
      ['has_credentials', 'boolean'],
      ['has_encryption_key', 'boolean'],
      ['owner', 'text'],
      ['comment', 'text'],
      ['region', 'text'],
      ['type', 'text'],
    ]);
  }
  if (subject === 'external tables') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['name', 'text'],
      ['database_name', 'text'],
      ['schema_name', 'text'],
      ['owner', 'text'],
      ['comment', 'text'],
      ['location', 'text'],
      ['file_format_name', 'text'],
    ]);
  }
  if (subject === 'sequences') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['name', 'text'],
      ['database_name', 'text'],
      ['schema_name', 'text'],
      ['next_value', 'integer'],
      ['interval', 'integer'],
      ['owner', 'text'],
      ['comment', 'text'],
    ]);
  }
  if (subject === 'materialized views') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['name', 'text'],
      ['database_name', 'text'],
      ['schema_name', 'text'],
      ['cluster_by', 'text'],
      ['rows', 'integer'],
      ['bytes', 'integer'],
      ['owner', 'text'],
      ['comment', 'text'],
    ]);
  }
  if (['masking policies', 'row access policies', 'network policies'].includes(subject)) {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['name', 'text'],
      ['database_name', 'text'],
      ['schema_name', 'text'],
      ['owner', 'text'],
      ['comment', 'text'],
    ]);
  }
  if (subject === 'resource monitors') {
    return staticColumns([
      ['name', 'text'],
      ['credit_quota', 'decimal'],
      ['used_credits', 'decimal'],
      ['remaining_credits', 'decimal'],
      ['level', 'text'],
      ['frequency', 'text'],
    ]);
  }
  if (subject === 'transactions') {
    return staticColumns([
      ['id', 'integer'],
      ['user', 'text'],
      ['session', 'integer'],
      ['started_on', 'timestamp'],
      ['state', 'text'],
    ]);
  }
  if (subject === 'locks') {
    return staticColumns([
      ['resource', 'text'],
      ['type', 'text'],
      ['transaction', 'integer'],
      ['status', 'text'],
      ['acquired_on', 'timestamp'],
    ]);
  }
  if (subject === 'constraints') {
    return staticColumns([
      ['table_name', 'text'],
      ['constraint_name', 'text'],
      ['constraint_type', 'text'],
      ['details', 'text'],
      ['validated', 'boolean'],
    ]);
  }
  if (subject === 'jobs') {
    return staticColumns([
      ['job_id', 'integer'],
      ['job_type', 'text'],
      ['description', 'text'],
      ['statement', 'text'],
      ['user_name', 'text'],
      ['status', 'text'],
      ['created', 'timestamp'],
      ['finished', 'timestamp'],
      ['fraction_completed', 'decimal'],
    ]);
  }
  if (subject === 'clusters') {
    return staticColumns([
      ['name', 'text'],
      ['replicas', 'integer'],
      ['size', 'text'],
      ['availability_zones', 'text'],
      ['managed', 'boolean'],
    ]);
  }
  if (subject === 'sources' || subject === 'sinks') {
    return staticColumns([
      ['name', 'text'],
      ['schema', 'text'],
      ['type', 'text'],
      ['owner', 'text'],
      ['cluster', 'text'],
    ]);
  }
  if (subject === 'pipelines') {
    return staticColumns([
      ['Database', 'text'],
      ['Pipeline', 'text'],
      ['State', 'text'],
      ['Source_Type', 'text'],
      ['Config_JSON', 'text'],
    ]);
  }
  if (subject === 'files') {
    return staticColumns([
      ['name', 'text'],
      ['isDirectory', 'boolean'],
      ['isFile', 'boolean'],
      ['length', 'integer'],
      ['owner', 'text'],
      ['group', 'text'],
      ['permissions', 'text'],
      ['accessTime', 'timestamp'],
      ['modificationTime', 'timestamp'],
    ]);
  }
  if (subject === 'primary keys' || subject === 'imported keys' || subject === 'unique keys') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['database_name', 'text'],
      ['schema_name', 'text'],
      ['table_name', 'text'],
      ['column_name', 'text'],
      ['key_sequence', 'integer'],
      ['constraint_name', 'text'],
    ]);
  }
  if (subject === 'stats') {
    return staticColumns([
      ['column_name', 'text'],
      ['data_size', 'integer'],
      ['distinct_values_count', 'integer'],
      ['nulls_fraction', 'decimal'],
      ['row_count', 'integer'],
      ['low_value', 'text'],
      ['high_value', 'text'],
    ]);
  }
  if (subject === 'file formats') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['name', 'text'],
      ['database_name', 'text'],
      ['schema_name', 'text'],
      ['type', 'text'],
      ['owner', 'text'],
      ['comment', 'text'],
    ]);
  }
  if (subject === 'pipes') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['name', 'text'],
      ['database_name', 'text'],
      ['schema_name', 'text'],
      ['definition', 'text'],
      ['owner', 'text'],
      ['notification_channel', 'text'],
      ['comment', 'text'],
    ]);
  }
  if (subject === 'roles') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['name', 'text'],
      ['is_default', 'boolean'],
      ['is_current', 'boolean'],
      ['is_inherited', 'boolean'],
      ['assigned_to_users', 'integer'],
      ['granted_to_roles', 'integer'],
      ['granted_roles', 'integer'],
      ['owner', 'text'],
      ['comment', 'text'],
    ]);
  }
  if (subject === 'users') {
    return staticColumns([
      ['name', 'text'],
      ['created_on', 'timestamp'],
      ['login_name', 'text'],
      ['display_name', 'text'],
      ['first_name', 'text'],
      ['last_name', 'text'],
      ['email', 'text'],
      ['mins_to_unlock', 'integer'],
      ['days_to_expiry', 'integer'],
      ['comment', 'text'],
    ]);
  }
  if (subject === 'shares') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['kind', 'text'],
      ['name', 'text'],
      ['database_name', 'text'],
      ['to', 'text'],
      ['owner', 'text'],
      ['comment', 'text'],
    ]);
  }
  if (subject === 'integrations') {
    return staticColumns([
      ['name', 'text'],
      ['type', 'text'],
      ['category', 'text'],
      ['enabled', 'boolean'],
      ['comment', 'text'],
      ['created_on', 'timestamp'],
    ]);
  }
  if (subject === 'streams') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['name', 'text'],
      ['database_name', 'text'],
      ['schema_name', 'text'],
      ['owner', 'text'],
      ['table_name', 'text'],
      ['source_type', 'text'],
      ['base_tables', 'text'],
      ['type', 'text'],
      ['stale', 'boolean'],
      ['mode', 'text'],
      ['comment', 'text'],
    ]);
  }
  if (subject === 'tasks') {
    return staticColumns([
      ['created_on', 'timestamp'],
      ['name', 'text'],
      ['id', 'text'],
      ['database_name', 'text'],
      ['schema_name', 'text'],
      ['owner', 'text'],
      ['comment', 'text'],
      ['warehouse', 'text'],
      ['schedule', 'text'],
      ['state', 'text'],
      ['definition', 'text'],
      ['condition', 'text'],
    ]);
  }
  if (subject === 'functions' || subject === 'procedures') {
    return staticColumns([
      [subject === 'functions' ? 'Function' : 'Procedure', 'text'],
      ['Type', 'text'],
      ['Definer', 'text'],
      ['Modified', 'timestamp'],
      ['Created', 'timestamp'],
      ['Security_type', 'text'],
      ['Comment', 'text'],
    ]);
  }
  if (subject === 'columns' || subject === 'full columns') {
    return staticColumns([
      ['Field', 'text'],
      ['Type', 'text'],
      ['Null', 'text'],
      ['Key', 'text'],
      ['Default', 'text'],
      ['Extra', 'text'],
      ...(subject === 'full columns' ? [
        ['Collation', 'text'],
        ['Privileges', 'text'],
        ['Comment', 'text'],
      ] satisfies Array<[string, string]> : []),
    ]);
  }
  if (subject === 'index' || subject === 'indexes' || subject === 'keys') {
    return staticColumns([
      ['Table', 'text'],
      ['Non_unique', 'integer'],
      ['Key_name', 'text'],
      ['Seq_in_index', 'integer'],
      ['Column_name', 'text'],
      ['Collation', 'text'],
      ['Cardinality', 'integer'],
      ['Sub_part', 'integer'],
      ['Packed', 'text'],
      ['Null', 'text'],
      ['Index_type', 'text'],
      ['Comment', 'text'],
      ['Index_comment', 'text'],
    ]);
  }
  if (subject === 'create table' || subject === 'create view') {
    return staticColumns([
      ['Table', 'text'],
      [showCreateStatementColumnName(subject), 'text'],
    ]);
  }
  if (/^create\s+(?:database|function|procedure|trigger)\b/.test(subject)) {
    const createSubject = subject.match(/^create\s+(database|function|procedure|trigger)\b/)?.[0] ?? subject;
    return staticColumns([
      ['Object', 'text'],
      [showCreateStatementColumnName(createSubject), 'text'],
    ]);
  }
  if (subject === 'partitions' || subject.startsWith('partitions ')) {
    return staticColumns([
      ['partition', 'text'],
    ]);
  }
  if (subject === 'tblproperties' || subject.startsWith('tblproperties ')) {
    return staticColumns([
      ['key', 'text'],
      ['value', 'text'],
    ]);
  }
  if (/^[a-z_][a-z0-9_]*$/i.test(subject)) {
    return staticColumns([[subject, 'text']]);
  }
  return [];
}

function outputItemsFromSummarize(): OutputItem[] {
  return staticColumns([
    ['column_name', 'text'],
    ['column_type', 'text'],
    ['min', 'text'],
    ['max', 'text'],
    ['approx_unique', 'integer'],
    ['avg', 'text'],
    ['std', 'text'],
    ['q25', 'text'],
    ['q50', 'text'],
    ['q75', 'text'],
    ['count', 'integer'],
    ['null_percentage', 'decimal'],
  ]);
}

function snowflakeTableListingColumns(): OutputItem[] {
  return staticColumns([
    ['created_on', 'timestamp'],
    ['name', 'text'],
    ['database_name', 'text'],
    ['schema_name', 'text'],
    ['kind', 'text'],
    ['comment', 'text'],
    ['cluster_by', 'text'],
    ['rows', 'integer'],
    ['bytes', 'integer'],
    ['owner', 'text'],
    ['retention_time', 'integer'],
    ['automatic_clustering', 'text'],
    ['change_tracking', 'boolean'],
    ['search_optimization', 'boolean'],
  ]);
}

function outputItemsFromAnalyze(analyze: Record<string, unknown>): OutputItem[] {
  return String(analyze.kind ?? '').toLowerCase() === 'table' || isRecord(analyze.this) ? tableMaintenanceStatusColumns() : [];
}

function outputItemsFromCommand(command: Record<string, unknown>): OutputItem[] {
  const text = String(command.this ?? '').toLowerCase();
  if (/^(optimize|repair|check|checksum)\s+table\b/.test(text)) return tableMaintenanceStatusColumns();
  if (/^show\s+databases\b/.test(text)) return outputItemsFromShow({ this: 'databases' });
  if (/^show\s+tables\b/.test(text)) return outputItemsFromShow({ this: 'tables' });
  if (/^show\s+columns\b/.test(text)) return outputItemsFromShow({ this: 'columns' });
  if (/^show\s+create\s+table\b/.test(text)) {
    return staticColumns([
      ['statement', 'text'],
    ]);
  }
  if (/^show\s+processlist\b/.test(text)) {
    return staticColumns([
      ['user', 'text'],
      ['address', 'text'],
      ['elapsed', 'integer'],
      ['read_rows', 'integer'],
      ['read_bytes', 'integer'],
      ['total_rows_approx', 'integer'],
      ['memory_usage', 'integer'],
      ['query', 'text'],
      ['query_id', 'text'],
    ]);
  }
  if (/^(?:describe|desc)\s+table\b/.test(text)) {
    return staticColumns([
      ['name', 'text'],
      ['type', 'text'],
      ['default_type', 'text'],
      ['default_expression', 'text'],
      ['comment', 'text'],
      ['codec_expression', 'text'],
      ['ttl_expression', 'text'],
    ]);
  }
  if (/^help\s+table\b/.test(text)) {
    return staticColumns([
      ['Column Name', 'text'],
      ['Type', 'text'],
      ['Nullable', 'text'],
      ['Format', 'text'],
      ['Title', 'text'],
      ['Max Length', 'integer'],
      ['Decimal Total Digits', 'integer'],
      ['Decimal Fractional Digits', 'integer'],
    ]);
  }
  return [];
}

function tableMaintenanceStatusColumns(): OutputItem[] {
  return staticColumns([
    ['Table', 'text'],
    ['Op', 'text'],
    ['Msg_type', 'text'],
    ['Msg_text', 'text'],
  ]);
}

function showCreateStatementColumnName(subject: string): string {
  if (subject === 'create database') return 'Create Database';
  if (subject === 'create function') return 'Create Function';
  if (subject === 'create procedure') return 'Create Procedure';
  if (subject === 'create trigger') return 'Create Trigger';
  return subject === 'create view' ? 'Create View' : 'Create Table';
}

function outputItemsFromPragma(pragma: Record<string, unknown>): OutputItem[] {
  const name = identifierName(pragma.name)?.toLowerCase();
  if (name === 'table_info') {
    return staticColumns([
      ['cid', 'integer'],
      ['name', 'text'],
      ['type', 'text'],
      ['notnull', 'integer'],
      ['dflt_value', 'text'],
      ['pk', 'integer'],
    ]);
  }
  if (name === 'table_xinfo') {
    return staticColumns([
      ['cid', 'integer'],
      ['name', 'text'],
      ['type', 'text'],
      ['notnull', 'integer'],
      ['dflt_value', 'text'],
      ['pk', 'integer'],
      ['hidden', 'integer'],
    ]);
  }
  if (name === 'index_list') {
    return staticColumns([
      ['seq', 'integer'],
      ['name', 'text'],
      ['unique', 'integer'],
      ['origin', 'text'],
      ['partial', 'integer'],
    ]);
  }
  if (name === 'index_info') {
    return staticColumns([
      ['seqno', 'integer'],
      ['cid', 'integer'],
      ['name', 'text'],
    ]);
  }
  if (name === 'index_xinfo') {
    return staticColumns([
      ['seqno', 'integer'],
      ['cid', 'integer'],
      ['name', 'text'],
      ['desc', 'integer'],
      ['coll', 'text'],
      ['key', 'integer'],
    ]);
  }
  if (name === 'database_list') {
    return staticColumns([
      ['seq', 'integer'],
      ['name', 'text'],
      ['file', 'text'],
    ]);
  }
  if (name === 'foreign_key_list') {
    return staticColumns([
      ['id', 'integer'],
      ['seq', 'integer'],
      ['table', 'text'],
      ['from', 'text'],
      ['to', 'text'],
      ['on_update', 'text'],
      ['on_delete', 'text'],
      ['match', 'text'],
    ]);
  }
  if (name === 'foreign_key_check') {
    return staticColumns([
      ['table', 'text'],
      ['rowid', 'integer'],
      ['parent', 'text'],
      ['fkid', 'integer'],
    ]);
  }
  if (name === 'table_list') {
    return staticColumns([
      ['schema', 'text'],
      ['name', 'text'],
      ['type', 'text'],
      ['ncol', 'integer'],
      ['wr', 'integer'],
      ['strict', 'integer'],
    ]);
  }
  if (name === 'function_list') {
    return staticColumns([
      ['name', 'text'],
      ['builtin', 'integer'],
      ['type', 'text'],
      ['enc', 'text'],
      ['narg', 'integer'],
      ['flags', 'integer'],
    ]);
  }
  if (name === 'module_list') {
    return staticColumns([
      ['name', 'text'],
    ]);
  }
  if (name === 'compile_options') {
    return staticColumns([
      ['compile_options', 'text'],
    ]);
  }
  if (name === 'collation_list') {
    return staticColumns([
      ['seq', 'integer'],
      ['name', 'text'],
    ]);
  }
  if (name === 'pragma_list') {
    return staticColumns([
      ['name', 'text'],
    ]);
  }
  if (name === 'quick_check' || name === 'integrity_check') {
    return staticColumns([
      [name, 'text'],
    ]);
  }
  if (name === 'wal_checkpoint') {
    return staticColumns([
      ['busy', 'integer'],
      ['log', 'integer'],
      ['checkpointed', 'integer'],
    ]);
  }
  if (name === 'stats') {
    return staticColumns([
      ['table', 'text'],
      ['index', 'text'],
      ['width', 'integer'],
      ['height', 'integer'],
    ]);
  }
  if (name === 'optimize') {
    return staticColumns([
      ['optimize', 'text'],
    ]);
  }
  if (['journal_mode', 'locking_mode', 'synchronous', 'encoding', 'auto_vacuum', 'temp_store'].includes(name ?? '')) {
    return staticColumns([[name ?? 'value', 'text']]);
  }
  if ([
    'cache_size',
    'page_size',
    'page_count',
    'freelist_count',
    'schema_version',
    'user_version',
    'application_id',
    'busy_timeout',
    'wal_autocheckpoint',
    'threads',
  ].includes(name ?? '')) {
    return staticColumns([[name ?? 'value', 'integer']]);
  }
  if ([
    'foreign_keys',
    'defer_foreign_keys',
    'ignore_check_constraints',
    'recursive_triggers',
    'read_uncommitted',
    'query_only',
  ].includes(name ?? '')) {
    return staticColumns([[name ?? 'value', 'boolean']]);
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
    source: 'metadata',
  }));
}

function outputItemsFromCopy(copy: Record<string, unknown>, schema: ValidationSchema, context: StatementContext): OutputItem[] {
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

function outputItemsFromExport(exportStatement: Record<string, unknown>, schema: ValidationSchema, context: StatementContext): OutputItem[] {
  return isRecord(exportStatement.this) ? outputItemsForStatement(exportStatement.this, schema, context) : [];
}

function outputItemsFromCopySource(source: unknown, schema: ValidationSchema, context: StatementContext): OutputItem[] {
  if (!isRecord(source)) return [];
  if (isRecord(source.subquery) && isRecord(source.subquery.this)) return outputItemsForStatement(source.subquery.this, schema, context);
  if (isRecord(source.select) || isRecord(source.values) || isRecord(source.union) || isRecord(source.intersect) || isRecord(source.except)) {
    return outputItemsForStatement(source, schema, context);
  }
  if (isRecord(source.table)) return outputItemsFromDescribedTable(source.table, schema);
  return [];
}

function outputItemsFromDescribedTable(tableRef: Record<string, unknown>, schema: ValidationSchema): OutputItem[] {
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
    tableAliases: new Map([[table.name.toLowerCase(), {
      tableName: table.name,
      ...(table.schema ? { schemaName: table.schema } : {}),
      visibleColumnNames: [],
    }]]),
  }));
}

function executeName(execute: Record<string, unknown>): string | undefined {
  const table = isRecord(execute.this) ? getAst(execute.this, 'table') : undefined;
  if (isRecord(table)) return identifierName(table.name);
  return identifierName(execute.this);
}

function outputItemsFromCreateView(createView: Record<string, unknown>, schema: ValidationSchema, context: StatementContext, dialect = 'generic'): OutputItem[] {
  if (!isRecord(createView.query)) return [];
  return applyDefinitionColumnNames(outputItemsForStatement(createView.query, schema, context, dialect), createView.columns);
}

function outputItemsFromCreateTable(createTable: Record<string, unknown>, schema: ValidationSchema, context: StatementContext, dialect = 'generic'): OutputItem[] {
  if (!isRecord(createTable.as_select)) return [];
  return applyDefinitionColumnNames(outputItemsForStatement(createTable.as_select, schema, context, dialect), createTable.columns);
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
  return isRecord(column) ? identifierName(column.name) ?? identifierName(column) : identifierName(column);
}

function outputItemsFromValues(values: Record<string, unknown>, schema: ValidationSchema): OutputItem[] {
  const rows = Array.isArray(values.expressions) ? values.expressions : [];
  const firstRow = rows.find(isRecord);
  const expressions = isRecord(firstRow) && Array.isArray(firstRow.expressions) ? firstRow.expressions : [];
  const aliases = Array.isArray(values.column_aliases) ? values.column_aliases : [];
  return expressions.filter(isRecord).map((expression, index) => ({
    expression: valuesColumnExpression(rows, index, expression, schema),
    name: identifierName(aliases[index]) ?? `column_${index + 1}`,
  }));
}

function valuesColumnExpression(rows: unknown[], index: number, fallback: AstExpression, schema: ValidationSchema): AstExpression {
  const columnExpressions = rows
    .flatMap((row) => isRecord(row) && Array.isArray(row.expressions) && isRecord(row.expressions[index]) ? [row.expressions[index]] : []);
  const type = commonArgumentType(columnExpressions, schema, { mode: 'none', binds: [] });
  return type
    ? {
        cast: {
          this: { null: null },
          to: { data_type: type },
        },
      }
    : fallback;
}

function outputItemsFromSetOperation(setOperation: Record<string, unknown>, schema: ValidationSchema, context: StatementContext, dialect: string): OutputItem[] {
  const left = outputItemsForStatement(setOperation.left, schema, context, dialect);
  const right = outputItemsForStatement(setOperation.right, schema, context, dialect);
  return left.map((item, index) => {
    const rightItem = right[index];
    const type = commonResultType([item, rightItem].filter((candidate): candidate is OutputItem => Boolean(candidate)), schema);
    return {
      ...item,
      expression: type ? typedNullExpression(type) : item.expression,
    };
  });
}

function commonResultType(items: OutputItem[], fallbackSchema: ValidationSchema): string | undefined {
  const types = items
    .map((item) => inferColumn(item.expression, item.name ?? 'set_column', item.schema ?? fallbackSchema, { mode: 'none', binds: [] }, 'generic', item.source, item.tableAliases).type)
    .filter((type) => type !== 'unknown');
  return commonTypeFromTypes(types);
}

function outputItemsFromPivot(pivot: Record<string, unknown>, schema: ValidationSchema): OutputItem[] {
  const table = pivot.unpivot ? tableFromUnpivot(topLevelUnpivotShape(pivot), schema) : tableFromPivot(topLevelPivotShape(pivot), schema);
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
    fields: Array.isArray(pivot.fields) && pivot.fields.length > 0
      ? pivot.fields
      : [{
        in: {
          this: firstRecord(pivot.expressions),
          expressions: [],
        },
      }],
  };
}

function topLevelUnpivotShape(pivot: Record<string, unknown>): Record<string, unknown> {
  const into = isRecord(pivot.into) && isRecord(pivot.into.unpivot_columns) ? pivot.into.unpivot_columns : undefined;
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

function schemaFromCtes(withClause: unknown, baseSchema: ValidationSchema): ValidationSchema {
  if (!isRecord(withClause) || !Array.isArray(withClause.ctes)) return { tables: [] };

  const tables: SchemaTable[] = [];
  for (const cte of withClause.ctes) {
    if (!isRecord(cte)) continue;
    const name = identifierName(cte.alias);
    if (!name) continue;
    const explicitColumns = Array.isArray(cte.columns) ? cte.columns : [];
    const items = outputItemsForStatement(cte.this, mergeSchemas(baseSchema, { tables }));
    tables.push({
      name,
      columns: columnsFromOutputItems(items, explicitColumns, mergeSchemas(baseSchema, { tables })),
    });
  }
  return { tables };
}

function schemaFromDerivedTables(owner: Record<string, unknown>, baseSchema: ValidationSchema): ValidationSchema {
  const tables: SchemaTable[] = [];
  if (Array.isArray(owner.lateral_views)) {
    tables.push(...owner.lateral_views.filter(isRecord).flatMap((lateralView) => lateralViewAlias(lateralView, mergeSchemas({ tables }, baseSchema))));
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
      const items = outputItemsForStatement(subquery.this, mergeSchemas(baseSchema, { tables }));
      tables.push({
        name,
        columns: columnsFromOutputItems(items, explicitColumns, mergeSchemas(baseSchema, { tables })),
      });
      continue;
    }
    const tableFunction = tableFunctionAlias(source, mergeSchemas({ tables }, baseSchema));
    if (tableFunction && !tables.some((table) => table.name.toLowerCase() === tableFunction.name.toLowerCase())) {
      tables.push(tableFunction);
      continue;
    }
    const openJsonTable = openJsonAlias(source);
    if (openJsonTable && !tables.some((table) => table.name.toLowerCase() === openJsonTable.name.toLowerCase())) {
      tables.push(openJsonTable);
      continue;
    }
    const jsonTable = jsonTableAlias(source);
    if (jsonTable && !tables.some((table) => table.name.toLowerCase() === jsonTable.name.toLowerCase())) {
      tables.push(jsonTable);
      continue;
    }
    const xmlTable = xmlTableAlias(source);
    if (xmlTable && !tables.some((table) => table.name.toLowerCase() === xmlTable.name.toLowerCase())) {
      tables.push(xmlTable);
      continue;
    }
    const matchRecognizeTable = matchRecognizeAlias(source, mergeSchemas({ tables }, baseSchema));
    if (matchRecognizeTable && !tables.some((table) => table.name.toLowerCase() === matchRecognizeTable.name.toLowerCase())) {
      tables.push(matchRecognizeTable);
    }
  }
  return { tables };
}

function pivotOrUnpivotAlias(source: Record<string, unknown>, schema: ValidationSchema): SchemaTable | undefined {
  const pivot = isRecord(source.pivot) ? source.pivot : undefined;
  const unpivot = isRecord(source.unpivot) ? source.unpivot : undefined;
  if (pivot) return tableFromPivot(pivot, schema);
  if (unpivot) return tableFromUnpivot(unpivot, schema);
  return undefined;
}

function tableFromPivot(pivot: Record<string, unknown>, schema: ValidationSchema): SchemaTable | undefined {
  const base = sourceTableForTransform(pivot, schema);
  const name = identifierName(pivot.alias) ?? base?.name;
  if (!base || !name) return undefined;
  const pivotColumnNames = pivotFieldColumns(pivot);
  const aggregateInputNames = Array.isArray(pivot.expressions) ? pivot.expressions.flatMap(referencedColumnNames) : [];
  const suppressed = new Set([...pivotColumnNames, ...aggregateInputNames].map((column) => column.toLowerCase()));
  const groupingColumns = base.columns.filter((column) => !suppressed.has(column.name.toLowerCase()));
  const pivotValueNames = pivotValueColumnNames(pivot);
  const aggregateType = firstAggregateType(pivot, schema) ?? 'unknown';
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

function tableFromUnpivot(unpivot: Record<string, unknown>, schema: ValidationSchema): SchemaTable | undefined {
  const base = sourceTableForTransform(unpivot, schema);
  const name = identifierName(unpivot.alias) ?? base?.name;
  const valueColumn = identifierName(unpivot.value_column);
  const nameColumn = identifierName(unpivot.name_column);
  if (!base || !name || !valueColumn || !nameColumn) return undefined;
  const inputNames = Array.isArray(unpivot.columns) ? unpivot.columns.flatMap(referencedColumnNames) : [];
  const suppressed = new Set(inputNames.map((column) => column.toLowerCase()));
  const valueType = inputNames
    .map((columnName) => base.columns.find((column) => column.name.toLowerCase() === columnName.toLowerCase())?.type)
    .find((type): type is string => Boolean(type)) ?? 'unknown';
  return {
    name,
    columns: [
      ...base.columns.filter((column) => !suppressed.has(column.name.toLowerCase())),
      { name: nameColumn, type: 'text' },
      { name: valueColumn, type: valueType },
    ],
  };
}

function sourceTableForTransform(transform: Record<string, unknown>, schema: ValidationSchema): SchemaTable | undefined {
  const source = isRecord(transform.this) ? transform.this : undefined;
  const tableName = relationTableName(source ?? {});
  if (!tableName) return undefined;
  return schema.tables.find((table) => table.name.toLowerCase() === tableName.toLowerCase());
}

function pivotFieldColumns(pivot: Record<string, unknown>): string[] {
  if (!Array.isArray(pivot.fields)) return [];
  return pivot.fields.flatMap((field) => isRecord(field) && isRecord(field.in) ? referencedColumnNames(field.in.this) : []);
}

function pivotValueColumnNames(pivot: Record<string, unknown>): string[] {
  if (!Array.isArray(pivot.fields)) return [];
  return pivot.fields.flatMap((field) => {
    const expressions = isRecord(field) && isRecord(field.in) && Array.isArray(field.in.expressions) ? field.in.expressions : [];
    return expressions.map(pivotValueName).filter((name): name is string => Boolean(name));
  });
}

function pivotValueName(expression: unknown): string | undefined {
  const literal = isRecord(expression) ? expression.literal : undefined;
  if (isRecord(literal)) return cleanIdentifier(String(literal.value ?? ''));
  const column = isRecord(expression) ? expression.column : undefined;
  if (isRecord(column)) return identifierName(column.name);
  return undefined;
}

function firstAggregateType(pivot: Record<string, unknown>, schema: ValidationSchema): string | undefined {
  const expression = Array.isArray(pivot.expressions) ? pivot.expressions.find(isRecord) : undefined;
  return expression ? inferExpressionType(expression, schema, { mode: 'none', binds: [] }) : undefined;
}

function referencedColumnNames(expression: unknown): string[] {
  if (!isRecord(expression)) return [];
  const column = getAst(expression, 'column');
  if (isRecord(column)) {
    const name = identifierName(column.name);
    return name ? [name] : [];
  }
  return Object.values(expression).flatMap((value) => Array.isArray(value) ? value.flatMap(referencedColumnNames) : referencedColumnNames(value));
}

function lateralViewAlias(lateralView: Record<string, unknown>, schema: ValidationSchema): SchemaTable[] {
  const name = identifierName(lateralView.table_alias);
  const columnAliases = Array.isArray(lateralView.column_aliases)
    ? lateralView.column_aliases.map(identifierName).filter((columnName): columnName is string => Boolean(columnName))
    : [];
  if (!name || columnAliases.length === 0) return [];
  const columnTypes = lateralViewColumnTypes(lateralView.this, schema);
  return [{
    name,
    columns: columnAliases.map((columnName, index) => ({
      name: columnName,
      type: columnTypes[index] ?? columnTypes[0] ?? 'unknown',
    })),
  }];
}

function lateralViewColumnTypes(expression: unknown, schema: ValidationSchema): string[] {
  if (!isRecord(expression)) return [];
  const explode = getAst(expression, 'explode');
  if (isRecord(explode)) return explodeColumnTypes(explode.this, schema);
  const fn = getAst(expression, 'function');
  if (!isRecord(fn)) return [];
  const name = String(fn.name ?? '').toLowerCase();
  if (name === 'explode' || name === 'explode_outer') return explodeColumnTypes(firstExpression(functionArguments(fn)), schema);
  if (name === 'posexplode' || name === 'posexplode_outer') {
    const exploded = explodeColumnTypes(firstExpression(functionArguments(fn)), schema);
    return ['integer', ...exploded];
  }
  return [];
}

function explodeColumnTypes(expression: unknown, schema: ValidationSchema): string[] {
  if (!isRecord(expression)) return ['unknown'];
  const elementType = unnestElementType(expression, schema);
  if (elementType) return [elementType];
  const column = inferColumn(expression, 'explode', schema, { mode: 'none', binds: [] }, 'generic');
  if (column.type === 'unknown') return ['unknown'];
  const mapTypes = mapKeyValueTypes(column.type);
  if (mapTypes) return mapTypes;
  return [arrayElementType(column.type) ?? column.type];
}

function tableFunctionAlias(source: Record<string, unknown>, schema: ValidationSchema): SchemaTable | undefined {
  const alias = isRecord(source.alias) ? source.alias : undefined;
  const lateral = isRecord(source.lateral) ? source.lateral : undefined;
  if (lateral) return lateralFunctionAlias(lateral, schema);
  const tupleTable = tableFunctionTupleAlias(source, schema);
  if (tupleTable) return tupleTable;
  const direct = tableFromDirectTableFunction(source, schema);
  if (direct) return direct;
  if (!alias || !(isRecord(alias.this) && (isRecord(alias.this.function) || isRecord(alias.this.unnest)))) return undefined;
  const name = identifierName(alias.alias);
  const explicitColumnAliases = Array.isArray(alias.column_aliases)
    ? alias.column_aliases.map(identifierName).filter((columnName): columnName is string => Boolean(columnName))
    : [];
  if (name) {
    const knownTable = tableFromKnownTableFunction(alias.this, name);
    if (knownTable) return explicitColumnAliases.length > 0 ? applyTableColumnAliases(knownTable, explicitColumnAliases) : knownTable;
  }
  const columnAliases = explicitColumnAliases.length > 0 ? explicitColumnAliases : name ? [name] : [];
  if (!name || columnAliases.length === 0) return undefined;
  const columnTypes = tableFunctionColumnTypes(alias.this, schema);
  return {
    name,
    columns: columnAliases.map((columnName, index) => ({
      name: columnName,
      type: columnTypes[index] ?? columnTypes[0] ?? 'unknown',
    })),
  };
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

function tableFunctionTupleAlias(source: Record<string, unknown>, schema: ValidationSchema): SchemaTable | undefined {
  const expressions = isRecord(source.tuple) && Array.isArray(source.tuple.expressions) ? source.tuple.expressions : [];
  const fn = expressions.find((expression) => isRecord(expression) && isRecord(expression.function));
  const tableAlias = expressions.find((expression) => isRecord(expression) && isRecord(expression.table_alias));
  if (!isRecord(fn) || !isRecord(tableAlias) || !isRecord(tableAlias.table_alias)) return undefined;
  const aliasName = identifierName(tableAlias.table_alias.this);
  if (!aliasName) return undefined;
  const definitions = Array.isArray(tableAlias.table_alias.columns) ? tableAlias.table_alias.columns : [];
  const columns = definitions.flatMap((definition) => {
    const columnDef = isRecord(definition) && isRecord(definition.column_def) ? definition.column_def : undefined;
    const name = columnDef ? identifierName(columnDef.name) : undefined;
    if (!columnDef || !name) return [];
    return [{ name, type: dataTypeToString(columnDef.data_type) ?? 'unknown' }];
  });
  if (columns.length > 0) return { name: aliasName, columns };
  const functionName = isRecord(fn.function) ? String(fn.function.name ?? '').toLowerCase() : '';
  return { name: aliasName, columns: [{ name: aliasName, type: tableFunctionDefaultType(functionName, fn, schema) }] };
}

function tableFromDirectTableFunction(source: Record<string, unknown>, schema: ValidationSchema): SchemaTable | undefined {
  if (isRecord(source.function)) {
    const name = String(source.function.name ?? '').toLowerCase();
    const known = tableFromKnownTableFunction(source, name);
    if (known) return known;
    return { name, columns: [{ name, type: tableFunctionDefaultType(name, source, schema) }] };
  }
  if (isRecord(source.unnest)) {
    const structColumns = unnestStructColumns(source.unnest, schema);
    if (structColumns.length > 0) return { name: 'unnest', columns: structColumns };
    const columnTypes = tableFunctionColumnTypes(source, schema);
    return {
      name: 'unnest',
      columns: columnTypes.length > 0
        ? columnTypes.map((type, index) => ({ name: index === 0 ? 'unnest' : `unnest_${index + 1}`, type }))
        : [{ name: 'unnest', type: 'unknown' }],
    };
  }
  return undefined;
}

function tableFromKnownTableFunction(expression: unknown, alias: string): SchemaTable | undefined {
  const fn = getAst(expression, 'function');
  if (!isRecord(fn)) return undefined;
  const name = unqualifiedFunctionName(fn);
  if (name === 'table') {
    const firstArg = functionArguments(fn).find(isRecord);
    const collectionType = oracleCollectionTableType(firstArg);
    if (collectionType) return { name: alias, columns: [{ name: alias, type: collectionType }] };
    const wrapped = isRecord(firstArg) ? tableFromKnownTableFunction(firstArg, alias) : undefined;
    if (wrapped) return wrapped;
  }
  if (name === 'flatten') {
    return flattenTable(alias);
  }
  if (name === 'generate_series' || name === 'range') {
    const type = commonArgumentType(functionArguments(fn), { tables: [] }, { mode: 'none', binds: [] });
    return { name: alias, columns: [{ name: alias, type: type && /date|time|timestamp/i.test(type) ? type : 'integer' }] };
  }
  if (name === 'numbers') {
    return { name: alias, columns: [{ name: alias, type: 'integer' }] };
  }
  if (name === 'sequence') {
    const type = commonArgumentType(functionArguments(fn), { tables: [] }, { mode: 'none', binds: [] }) ?? 'integer';
    return { name: alias, columns: [{ name: alias, type }] };
  }
  if (name === 'generate_subscripts') {
    return { name: alias, columns: [{ name: alias, type: 'integer' }] };
  }
  if (name === 'generate_array') {
    const type = commonArgumentType(functionArguments(fn), { tables: [] }, { mode: 'none', binds: [] }) ?? 'integer';
    return { name: alias, columns: [{ name: alias, type }] };
  }
  if (name === 'generate_date_array') {
    return { name: alias, columns: [{ name: alias, type: 'date' }] };
  }
  if (name === 'generate_timestamp_array') {
    return { name: alias, columns: [{ name: alias, type: 'timestamp' }] };
  }
  if (name === 'string_split') {
    return { name: alias, columns: [{ name: 'value', type: 'text' }] };
  }
  if (['regexp_matches', 'regexp_split_to_array'].includes(name)) {
    return { name: alias, columns: [{ name: alias, type: 'array<text>' }] };
  }
  if (name === 'regexp_split_to_table') {
    return { name: alias, columns: [{ name: alias, type: 'text' }] };
  }
  if (['json_array_elements', 'jsonb_array_elements'].includes(name)) {
    return { name: alias, columns: [{ name: alias, type: 'json' }] };
  }
  if (['json_array_elements_text', 'jsonb_array_elements_text'].includes(name)) {
    return { name: alias, columns: [{ name: alias, type: 'text' }] };
  }
  if (['json_each_text', 'jsonb_each_text'].includes(name)) {
    return {
      name: alias,
      columns: [
        { name: 'key', type: 'text' },
        { name: 'value', type: 'text' },
      ],
    };
  }
  if (name === 'jsonb_each') {
    return {
      name: alias,
      columns: [
        { name: 'key', type: 'text' },
        { name: 'value', type: 'json' },
      ],
    };
  }
  if (name === 'pg_get_keywords') {
    return {
      name: alias,
      columns: [
        { name: 'word', type: 'text' },
        { name: 'catcode', type: 'text' },
        { name: 'catdesc', type: 'text' },
        { name: 'baredesc', type: 'text' },
      ],
    };
  }
  if (name === 'ts_debug') {
    return {
      name: alias,
      columns: [
        { name: 'alias', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'token', type: 'text' },
        { name: 'dictionaries', type: 'text[]' },
        { name: 'dictionary', type: 'text' },
        { name: 'lexemes', type: 'text[]' },
      ],
    };
  }
  if (name === 'aclexplode') {
    return {
      name: alias,
      columns: [
        { name: 'grantor', type: 'oid' },
        { name: 'grantee', type: 'oid' },
        { name: 'privilege_type', type: 'text' },
        { name: 'is_grantable', type: 'boolean' },
      ],
    };
  }
  if (name === 'pg_options_to_table') {
    return {
      name: alias,
      columns: [
        { name: 'option_name', type: 'text' },
        { name: 'option_value', type: 'text' },
      ],
    };
  }
  if (name === 'pg_ls_dir') {
    return { name: alias, columns: [{ name: alias, type: 'text' }] };
  }
  if (name === 'pg_stat_file') {
    return {
      name: alias,
      columns: [
        { name: 'size', type: 'bigint' },
        { name: 'access', type: 'timestamp' },
        { name: 'modification', type: 'timestamp' },
        { name: 'change', type: 'timestamp' },
        { name: 'creation', type: 'timestamp' },
        { name: 'isdir', type: 'boolean' },
      ],
    };
  }
  if (['pg_logical_slot_get_changes', 'pg_logical_slot_peek_changes'].includes(name)) {
    return {
      name: alias,
      columns: [
        { name: 'lsn', type: 'pg_lsn' },
        { name: 'xid', type: 'xid' },
        { name: 'data', type: 'text' },
      ],
    };
  }
  if (name === 'glob') {
    return { name: alias, columns: [{ name: 'file', type: 'text' }] };
  }
  if (name === 'pragma_table_info') {
    return {
      name: alias,
      columns: [
        { name: 'cid', type: 'integer' },
        { name: 'name', type: 'text' },
        { name: 'type', type: 'text' },
        { name: 'notnull', type: 'integer' },
        { name: 'dflt_value', type: 'text' },
        { name: 'pk', type: 'integer' },
      ],
    };
  }
  if (name === 'duckdb_tables') {
    return {
      name: alias,
      columns: [
        { name: 'database_name', type: 'text' },
        { name: 'schema_name', type: 'text' },
        { name: 'table_name', type: 'text' },
        { name: 'table_type', type: 'text' },
        { name: 'temporary', type: 'boolean' },
      ],
    };
  }
  if (name === 'duckdb_columns') {
    return {
      name: alias,
      columns: [
        { name: 'database_name', type: 'text' },
        { name: 'schema_name', type: 'text' },
        { name: 'table_name', type: 'text' },
        { name: 'column_name', type: 'text' },
        { name: 'column_index', type: 'integer' },
        { name: 'data_type', type: 'text' },
        { name: 'is_nullable', type: 'boolean' },
      ],
    };
  }
  if (name === 'duckdb_schemas') {
    return {
      name: alias,
      columns: [
        { name: 'database_name', type: 'text' },
        { name: 'schema_name', type: 'text' },
        { name: 'internal', type: 'boolean' },
      ],
    };
  }
  if (name === 'duckdb_views') {
    return {
      name: alias,
      columns: [
        { name: 'database_name', type: 'text' },
        { name: 'schema_name', type: 'text' },
        { name: 'view_name', type: 'text' },
        { name: 'temporary', type: 'boolean' },
        { name: 'sql', type: 'text' },
      ],
    };
  }
  if (name === 'duckdb_functions') {
    return {
      name: alias,
      columns: [
        { name: 'database_name', type: 'text' },
        { name: 'schema_name', type: 'text' },
        { name: 'function_name', type: 'text' },
        { name: 'function_type', type: 'text' },
        { name: 'return_type', type: 'text' },
      ],
    };
  }
  if (name === 'duckdb_indexes') {
    return {
      name: alias,
      columns: [
        { name: 'database_name', type: 'text' },
        { name: 'schema_name', type: 'text' },
        { name: 'index_name', type: 'text' },
        { name: 'table_name', type: 'text' },
        { name: 'is_unique', type: 'boolean' },
        { name: 'sql', type: 'text' },
      ],
    };
  }
  if (['openquery', 'opendatasource', 'openrowset'].includes(name)) {
    return { name: alias, columns: [{ name: alias, type: 'unknown' }] };
  }
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

function unqualifiedFunctionName(fn: Record<string, unknown>): string {
  return String(fn.name ?? '').toLowerCase().split('.').at(-1) ?? '';
}

function tableFunctionDefaultType(functionName: string, expression: unknown, schema: ValidationSchema): string {
  if (functionName === 'regexp_matches') return 'array<text>';
  if (functionName === 'string_split') return 'text';
  if (functionName === 'generate_series' || functionName === 'range') {
    const fn = getAst(expression, 'function');
    const type = isRecord(fn) ? commonArgumentType(functionArguments(fn), schema, { mode: 'none', binds: [] }) : undefined;
    return type && /date|time|timestamp/i.test(type) ? type : 'integer';
  }
  return 'unknown';
}

function oracleCollectionTableType(expression: unknown): string | undefined {
  const methodCall = isRecord(expression) && isRecord(expression.method_call) ? expression.method_call : undefined;
  if (!methodCall) return undefined;
  const method = identifierName(methodCall.method)?.toLowerCase();
  if (!method) return undefined;
  if (/numberlist$/.test(method)) return 'number';
  if (/varchar2list$/.test(method) || /varcharlist$/.test(method)) return 'text';
  if (/datelist$/.test(method)) return 'date';
  return undefined;
}

function openJsonAlias(source: Record<string, unknown>): SchemaTable | undefined {
  const openJson = isRecord(source.open_j_s_o_n)
    ? source.open_j_s_o_n
    : isRecord(source.alias) && isRecord(source.alias.this) && isRecord(source.alias.this.open_j_s_o_n)
      ? source.alias.this.open_j_s_o_n
      : undefined;
  if (!openJson) return undefined;
  const name = isRecord(source.alias) ? identifierName(source.alias.alias) ?? 'openjson' : 'openjson';
  const columns = openJsonColumns(openJson);
  return { name, columns: columns.length > 0 ? columns : defaultOpenJsonColumns() };
}

function openJsonColumns(openJson: Record<string, unknown>): SchemaColumn[] {
  const expressions = Array.isArray(openJson.expressions) ? openJson.expressions : [];
  return expressions.flatMap((expression) => {
    const definition = isRecord(expression) && isRecord(expression.open_j_s_o_n_column_def) ? expression.open_j_s_o_n_column_def : undefined;
    const name = definition ? identifierName(definition.this) : undefined;
    if (!definition || !name) return [];
    return [{
      name,
      type: dataTypeToString(definition.data_type) ?? (definition.as_json ? 'json' : 'unknown'),
    }];
  });
}

function defaultOpenJsonColumns(): SchemaColumn[] {
  return [
    { name: 'key', type: 'text' },
    { name: 'value', type: 'text' },
    { name: 'type', type: 'integer' },
  ];
}

function jsonTableAlias(source: Record<string, unknown>): SchemaTable | undefined {
  const alias = isRecord(source.alias) ? source.alias : undefined;
  const jsonTable = alias && isRecord(alias.this) && isRecord(alias.this.j_s_o_n_table) ? alias.this.j_s_o_n_table : undefined;
  const name = alias ? identifierName(alias.alias) : undefined;
  if (!jsonTable || !name) return undefined;
  const columns = jsonTableColumns(jsonTable);
  return columns.length > 0 ? { name, columns } : undefined;
}

function xmlTableAlias(source: Record<string, unknown>): SchemaTable | undefined {
  const alias = isRecord(source.alias) ? source.alias : undefined;
  const xmlTable = alias && isRecord(alias.this) && isRecord(alias.this.x_m_l_table) ? alias.this.x_m_l_table : undefined;
  const name = alias ? identifierName(alias.alias) : undefined;
  if (!xmlTable || !name) return undefined;
  const columns = Array.isArray(xmlTable.columns)
    ? xmlTable.columns.flatMap((column) => {
        const definition = isRecord(column) && isRecord(column.column_def) ? column.column_def : undefined;
        const columnName = definition ? identifierName(definition.name) : undefined;
        if (!definition || !columnName) return [];
        return [{
          name: columnName,
          type: dataTypeToString(definition.data_type) ?? 'unknown',
          nullable: typeof definition.nullable === 'boolean' ? definition.nullable : undefined,
        }];
      })
    : [];
  return columns.length > 0 ? { name, columns } : undefined;
}

function jsonTableColumns(jsonTable: Record<string, unknown>): SchemaColumn[] {
  const schema = isRecord(jsonTable.schema) && isRecord(jsonTable.schema.j_s_o_n_schema)
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
  return [{
    name,
    type: definition.ordinality ? 'integer' : jsonColumnType(definition.kind),
  }];
}

function jsonColumnType(kind: unknown): string {
  if (typeof kind !== 'string' || kind.length === 0) return 'unknown';
  return kind.toLowerCase();
}

function matchRecognizeAlias(source: Record<string, unknown>, schema: ValidationSchema): SchemaTable | undefined {
  const matchRecognize = isRecord(source.match_recognize) ? source.match_recognize : undefined;
  if (!matchRecognize) return undefined;
  const base = sourceTableForTransform(matchRecognize, schema);
  const name = identifierName(matchRecognize.alias) ?? base?.name;
  if (!base || !name) return undefined;
  return {
    name,
    columns: [
      ...base.columns,
      ...matchRecognizeMeasureColumns(matchRecognize, schema),
    ],
  };
}

function matchRecognizeMeasureColumns(matchRecognize: Record<string, unknown>, schema: ValidationSchema): SchemaColumn[] {
  const measures = Array.isArray(matchRecognize.measures) ? matchRecognize.measures : [];
  return measures.flatMap((measure) => {
    const expression = isRecord(measure) ? measure.this : undefined;
    if (!isRecord(expression)) return [];
    const output = unwrapAlias(expression);
    const name = output.name ?? inferNameFromAst(output.expression, 1);
    const inferred = inferColumn(output.expression, name, schema, { mode: 'none', binds: [] }, 'generic');
    return [{ name, type: inferred.type, nullable: inferred.nullable }];
  });
}

function lateralFunctionAlias(lateral: Record<string, unknown>, schema: ValidationSchema): SchemaTable | undefined {
  const name = identifierName(lateral.alias);
  const columnAliases = Array.isArray(lateral.column_aliases)
    ? lateral.column_aliases.map(identifierName).filter((columnName): columnName is string => Boolean(columnName))
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
      type: columnTypes[index] ?? columnTypes[0] ?? 'unknown',
    })),
  };
}

function flattenFunctionColumns(expression: unknown, name: string): SchemaTable | undefined {
  const fn = getAst(expression, 'function');
  if (!isRecord(fn) || String(fn.name ?? '').toLowerCase() !== 'flatten') return undefined;
  return flattenTable(name);
}

function flattenTable(name: string): SchemaTable {
  return {
    name,
    columns: [
      { name: 'seq', type: 'integer' },
      { name: 'key', type: 'text' },
      { name: 'path', type: 'text' },
      { name: 'index', type: 'integer' },
      { name: 'value', type: 'variant' },
      { name: 'this', type: 'variant' },
    ],
  };
}

function tableFunctionColumnTypes(expression: unknown, schema: ValidationSchema): string[] {
  if (!isRecord(expression)) return [];
  const unnest = getAst(expression, 'unnest');
  if (isRecord(unnest)) {
    const mapEntryTypes = unnestMapEntryTypes(unnest, schema);
    if (mapEntryTypes) return unnest.with_ordinality === true ? [...mapEntryTypes, 'integer'] : mapEntryTypes;
    const arrayInputs = [
      ...(isRecord(unnest.this) ? [unnest.this] : []),
      ...(Array.isArray(unnest.expressions) ? unnest.expressions.filter(isRecord) : []),
    ];
    const elementTypes = arrayInputs.map((input) => unnestElementType(input, schema) ?? 'unknown');
    return unnest.with_ordinality === true ? [...elementTypes, 'integer'] : elementTypes;
  }
  const fn = getAst(expression, 'function');
  if (!isRecord(fn)) return [];
  const name = String(fn.name ?? '').toLowerCase();
  if (name === 'generate_series' || name === 'range') {
    const type = commonArgumentType(functionArguments(fn), schema, { mode: 'none', binds: [] });
    if (type && /date|time|timestamp/i.test(type)) return [type];
    return ['integer'];
  }
  return [];
}

function unnestMapEntryTypes(unnest: Record<string, unknown>, schema: ValidationSchema): string[] | undefined {
  const inputs = [
    ...(isRecord(unnest.this) ? [unnest.this] : []),
    ...(Array.isArray(unnest.expressions) ? unnest.expressions.filter(isRecord) : []),
  ];
  const input = inputs.find(isRecord);
  if (!input) return undefined;
  const fn = getAst(input, 'function');
  if (isRecord(fn) && String(fn.name ?? '').toLowerCase() === 'map') {
    const args = functionArguments(fn);
    const keyType = arrayElementType(inferColumn(args[0], 'map_keys', schema, { mode: 'none', binds: [] }, 'generic').type) ?? 'unknown';
    const valueType = arrayElementType(inferColumn(args[1], 'map_values', schema, { mode: 'none', binds: [] }, 'generic').type) ?? 'unknown';
    return [keyType, valueType];
  }
  const type = inferColumn(input, 'unnest_map', schema, { mode: 'none', binds: [] }, 'generic').type;
  const mapTypes = mapKeyValueTypes(type);
  return mapTypes ? [...mapTypes] : undefined;
}

function unnestStructColumns(unnest: Record<string, unknown>, schema: ValidationSchema): SchemaColumn[] {
  const inputs = [
    ...(isRecord(unnest.this) ? [unnest.this] : []),
    ...(Array.isArray(unnest.expressions) ? unnest.expressions.filter(isRecord) : []),
  ];
  for (const input of inputs) {
    const array = getAst(input, 'array_func');
    const expressions = isRecord(array) && Array.isArray(array.expressions) ? array.expressions.filter(isRecord) : [];
    const first = expressions.find(isRecord);
    if (!first) continue;
    const struct = getAst(first, 'function');
    if (!isRecord(struct) || String(struct.name ?? '').toLowerCase() !== 'struct') continue;
    const columns = functionArguments(struct).flatMap((arg, index) => {
      const unwrapped = unwrapAlias(arg);
      const name = unwrapped.name ?? inferNameFromAst(unwrapped.expression, index + 1);
      const inferred = inferColumn(unwrapped.expression, name, schema, { mode: 'none', binds: [] }, 'generic');
      return [{ name, type: inferred.type, nullable: inferred.nullable }];
    });
    if (columns.length > 0) return columns;
  }
  return [];
}

function unnestElementType(expression: unknown, schema: ValidationSchema): string | undefined {
  if (!isRecord(expression)) return undefined;
  const array = getAst(expression, 'array_func');
  if (isRecord(array) && Array.isArray(array.expressions)) {
    return commonArgumentType(array.expressions.filter(isRecord), schema, { mode: 'none', binds: [] });
  }
  const fn = getAst(expression, 'function');
  if (isRecord(fn) && String(fn.name ?? '').toLowerCase() === 'array') {
    return commonArgumentType(functionArguments(fn), schema, { mode: 'none', binds: [] });
  }
  const column = inferColumn(expression, 'unnest', schema, { mode: 'none', binds: [] }, 'generic');
  if (column.type !== 'unknown') return arrayElementType(column.type);
  return undefined;
}

function columnsFromOutputItems(items: OutputItem[], explicitColumns: unknown[], schema: ValidationSchema): SchemaColumn[] {
  return items.map((item, index) => {
    const inferred = inferColumn(item.expression, item.name ?? `column_${index + 1}`, item.schema ?? schema, { mode: 'none', binds: [] }, 'generic', item.source, item.tableAliases);
    return {
      name: columnDefinitionName(explicitColumns[index]) ?? item.name ?? `column_${index + 1}`,
      type: inferred.type,
      nullable: inferred.nullable,
    };
  });
}

function outputItemsFromReturning(statement: Record<string, unknown>, schema: ValidationSchema): OutputItem[] {
  const returning = Array.isArray(statement.returning) ? statement.returning : [];
  const output = outputItemsFromOutputClause(statement.output, schema, statement);
  return [...outputItemsFromExpressions(returning, schema, statement), ...output];
}

function outputItemsFromMerge(merge: Record<string, unknown>, schema: ValidationSchema): OutputItem[] {
  const returning = isRecord(merge.returning) && isRecord(merge.returning.returning) && Array.isArray(merge.returning.returning.expressions)
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
  if (alias && isRecord(alias.this) && isRecord(alias.this.table)) return { table: alias.this.table, alias };
  return {};
}

function outputItemsFromOutputClause(output: unknown, schema: ValidationSchema, owner: Record<string, unknown>): OutputItem[] {
  if (!isRecord(output)) return [];
  const expressions = Array.isArray(output.expressions) ? output.expressions : Array.isArray(output.columns) ? output.columns : [];
  return outputItemsFromExpressions(expressions, schema, owner);
}

function outputItemsFromExpressions(expressions: unknown, schema: ValidationSchema, owner?: Record<string, unknown>): OutputItem[] {
  if (!Array.isArray(expressions)) return [];
  const expanded: OutputItem[] = [];
  const tableAliases = tableAliasesFromOwner(owner);
  for (const expression of expressions) {
    if (!isRecord(expression)) continue;
    const unwrapped = unwrapAlias(expression);
    const star = getAst(unwrapped.expression, 'star');
    if (isRecord(star)) {
      expanded.push(...expandStar(star, schema, owner, tableAliases));
      continue;
    }
    expanded.push({ ...unwrapped, schema, tableAliases });
  }
  return expanded;
}

function unwrapAlias(expression: AstExpression): OutputItem {
  const alias = getAst(expression, 'alias');
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
  return { expression, name: inferNameFromAst(expression, 0) };
}

function expandStar(star: Record<string, unknown>, schema: ValidationSchema, owner?: Record<string, unknown>, tableAliases = tableAliasesFromOwner(owner)): OutputItem[] {
  const tableQualifier = identifierName(star.table)?.toLowerCase();
  const relation = tableQualifier ? tableAliases.get(tableQualifier) : undefined;
  const tableName = tableQualifier ? relation?.tableName.toLowerCase() ?? tableQualifier : undefined;
  const schemaName = relation?.schemaName?.toLowerCase();
  const fromTableNames = [...new Set([...tableAliases.values()].map((entry) => entry.tableName))].map((name) => name.toLowerCase());
  const fromSchemaNames = [...new Set([...tableAliases.values()].map((entry) => entry.schemaName).filter((name): name is string => Boolean(name)))].map((name) => name.toLowerCase());
  const tables = uniqueTablesByName(schema.tables.filter((table) => {
    if (tableName) {
      if (table.name.toLowerCase() !== tableName) return false;
      if (schemaName) return table.schema?.toLowerCase() === schemaName;
      return !table.schema;
    }
    if (schemaName && table.schema?.toLowerCase() !== schemaName) return false;
    if (fromTableNames.length > 0 && !fromTableNames.includes(table.name.toLowerCase())) return false;
    if (fromTableNames.length > 0 && table.schema && fromSchemaNames.length === 0) return false;
    if (fromSchemaNames.length > 0 && (!table.schema || !fromSchemaNames.includes(table.schema.toLowerCase()))) return false;
    return true;
  }));
  const except = new Set((Array.isArray(star.except) ? star.except : [])
    .map(identifierName)
    .filter((name): name is string => Boolean(name))
    .map((name) => name.toLowerCase()));
  const renames = new Map((Array.isArray(star.rename) ? star.rename : [])
    .filter(Array.isArray)
    .map((pair) => [identifierName(pair[0])?.toLowerCase(), identifierName(pair[1])] as const)
    .filter((pair): pair is readonly [string, string] => Boolean(pair[0] && pair[1])));
  const replacements = new Map((Array.isArray(star.replace) ? star.replace : [])
    .filter(isRecord)
    .map((expression) => {
      const unwrapped = unwrapAlias(expression);
      return [unwrapped.name?.toLowerCase(), unwrapped.expression] as const;
    })
    .filter((pair): pair is readonly [string, AstExpression] => Boolean(pair[0])));

  const suppressed = tableQualifier ? new Map<string, Set<string>>() : suppressedStarColumnsByTable(owner, schema);

  return tables.flatMap((table) => table.columns
    .filter((column) => !isStarColumnExcepted(except, column.name, table, tableAliases))
    .filter((column) => !suppressed.get(table.name.toLowerCase())?.has(column.name.toLowerCase()))
    .map((column, index) => {
      const visibleName = relation?.visibleColumnNames[index] ?? column.name;
      const replacement = replacements.get(visibleName.toLowerCase()) ?? replacements.get(column.name.toLowerCase());
      return {
        expression: replacement ?? { column: { name: { name: column.name }, table: { name: table.name } } },
        name: renames.get(visibleName.toLowerCase()) ?? renames.get(column.name.toLowerCase()) ?? visibleName,
        source: replacement ? 'replace' : schemaColumnSource(table, column.name),
        schema,
        tableAliases,
      };
    }));
}

function uniqueTablesByName(tables: SchemaTable[]): SchemaTable[] {
  const seen = new Set<string>();
  return tables.filter((table) => {
    const key = `${table.schema?.toLowerCase() ?? ''}.${table.name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isStarColumnExcepted(except: Set<string>, columnName: string, table: SchemaTable, tableAliases: TableAliasMap): boolean {
  const column = columnName.toLowerCase();
  if (except.has(column)) return true;
  const tableName = table.name.toLowerCase();
  const schemaName = table.schema?.toLowerCase();
  if (except.has(`${tableName}.${column}`)) return true;
  if (schemaName && except.has(`${schemaName}.${tableName}.${column}`)) return true;
  for (const [qualifier, relation] of tableAliases) {
    if (relation.tableName.toLowerCase() !== tableName) continue;
    if (schemaName && relation.schemaName && relation.schemaName.toLowerCase() !== schemaName) continue;
    if (except.has(`${qualifier}.${column}`)) return true;
  }
  return false;
}

function suppressedStarColumnsByTable(owner: Record<string, unknown> | undefined, schema: ValidationSchema): Map<string, Set<string>> {
  const suppressed = new Map<string, Set<string>>();
  if (!owner || !Array.isArray(owner.joins)) return suppressed;
  for (const join of owner.joins) {
    if (!isRecord(join) || !isRecord(join.this)) continue;
    const table = relationTableName(join.this);
    if (!table) continue;
    const usingColumns = Array.isArray(join.using)
      ? join.using.map(identifierName).filter((name): name is string => Boolean(name))
      : [];
    const naturalColumns = join.kind === 'Natural' ? commonColumnsForNaturalJoin(owner, join.this, schema) : [];
    const columns = [...usingColumns, ...naturalColumns].map((name) => name.toLowerCase());
    if (columns.length === 0) continue;
    suppressed.set(table.toLowerCase(), new Set(columns));
  }
  return suppressed;
}

function commonColumnsForNaturalJoin(owner: Record<string, unknown>, rightSource: Record<string, unknown>, schema: ValidationSchema): string[] {
  const leftTables = relationSourcesFromOwner({ ...owner, joins: [] }).map(relationTableName).filter((name): name is string => Boolean(name));
  const rightTable = relationTableName(rightSource);
  if (!rightTable) return [];
  const leftColumnNames = new Set(schema.tables
    .filter((table) => leftTables.map((name) => name.toLowerCase()).includes(table.name.toLowerCase()))
    .flatMap((table) => table.columns.map((column) => column.name.toLowerCase())));
  return schema.tables
    .find((table) => table.name.toLowerCase() === rightTable.toLowerCase())
    ?.columns
    .map((column) => column.name)
    .filter((name) => leftColumnNames.has(name.toLowerCase())) ?? [];
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
  const from = isRecord(owner?.from) && Array.isArray(owner.from.expressions) ? owner.from.expressions : [];
  const fromClause = isRecord(owner?.from_clause) && Array.isArray(owner.from_clause.expressions) ? owner.from_clause.expressions : [];
  const joins = Array.isArray(owner?.joins) ? owner.joins : [];
  const fromJoins = Array.isArray(owner?.from_joins) ? owner.from_joins : [];
  const using = Array.isArray(owner?.using) ? owner.using : [];
  const lateralViews = Array.isArray(owner?.lateral_views) ? owner.lateral_views : [];
  const baseNullable = joins.some((join) => isRecord(join) && ['Right', 'Full'].includes(String(join.kind ?? '')));
  const sources = [...from, ...fromClause]
    .filter(isRecord)
    .map((source) => baseNullable ? { ...source, nullableRelation: true } : source);
  if (isRecord(owner?.table)) {
    sources.unshift({
      table: owner.table,
      ...(isRecord(owner.alias) ? { alias: owner.alias } : {}),
    });
    sources.unshift({ table: owner.table, alias: { name: 'inserted' } });
    sources.unshift({ table: owner.table, alias: { name: 'deleted' } });
    sources.unshift({ table: owner.table, alias: { name: 'excluded' } });
  }
  for (const join of joins) {
    if (isRecord(join) && isRecord(join.this)) {
      const joinNullable = ['Left', 'Full'].includes(String(join.kind ?? ''));
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
    if (isRecord(lateralView)) sources.push({
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
  const fn = isRecord(source.function) ? source.function : undefined;
  const unnest = isRecord(source.unnest) ? source.unnest : undefined;
  const tupleAlias = tupleTableAliasName(source);
  const aliasNode = isRecord(source?.alias) && isRecord(source.alias.this) ? source.alias : undefined;
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
              : openJson || tupleAlias || fn || unnest
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
  const alias = sourceAlias
    ?? (table
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
  if (pivot) return identifierName(pivot.alias) ?? relationTableName(isRecord(pivot.this) ? pivot.this : {});
  const unpivot = isRecord(source.unpivot) ? source.unpivot : undefined;
  if (unpivot) return identifierName(unpivot.alias) ?? relationTableName(isRecord(unpivot.this) ? unpivot.this : {});
  const matchRecognize = isRecord(source.match_recognize) ? source.match_recognize : undefined;
  if (matchRecognize) return identifierName(matchRecognize.alias) ?? relationTableName(isRecord(matchRecognize.this) ? matchRecognize.this : {});
  if (isRecord(source.open_j_s_o_n)) return 'openjson';
  const tupleAlias = tupleTableAliasName(source);
  if (tupleAlias) return tupleAlias;
  const fn = isRecord(source.function) ? source.function : undefined;
  if (fn) return String(fn.name ?? '').toLowerCase();
  if (isRecord(source.unnest)) return 'unnest';
  const aliasNode = isRecord(source.alias) && isRecord(source.alias.this) ? source.alias : undefined;
  return aliasNode ? identifierName(aliasNode.alias) : undefined;
}

function tupleTableAliasName(source: Record<string, unknown>): string | undefined {
  const expressions = isRecord(source.tuple) && Array.isArray(source.tuple.expressions) ? source.tuple.expressions : [];
  const tableAlias = expressions.find((expression) => isRecord(expression) && isRecord(expression.table_alias));
  return isRecord(tableAlias) && isRecord(tableAlias.table_alias) ? identifierName(tableAlias.table_alias.this) : undefined;
}

function columnAliasesFromRelation(relation: Record<string, unknown>): Omit<TableAliasEntry, 'tableName'> {
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

function emptyRelationColumnAliases(): Omit<TableAliasEntry, 'tableName'> {
  return { visibleColumnNames: [] };
}

function schemaTableName(table: SchemaTable): string {
  return table.schema ? `${table.schema}.${table.name}` : table.name;
}

function schemaColumnSource(table: SchemaTable, columnName: string): string {
  return `${schemaTableName(table)}.${columnName}`;
}

function inferNameFromAst(expression: AstExpression, index: number): string {
  const alias = getAst(expression, 'alias');
  if (isRecord(alias)) return identifierName(alias.alias) ?? `column_${index || 1}`;
  const dot = getAst(expression, 'dot');
  if (isRecord(dot)) return identifierName(dot.field) ?? `column_${index || 1}`;
  const column = getAst(expression, 'column');
  if (isRecord(column)) return identifierName(column.name) ?? `column_${index || 1}`;
  const names = safeColumnNames(expression);
  if (names.length === 1) return cleanIdentifier(names[0]);
  if (isAst(expression, 'star')) return '*';
  return `column_${index || 1}`;
}

function firstExpression(values: unknown[]): AstExpression | undefined {
  return values.find(isRecord);
}

function getAst(expression: unknown, key: string): unknown {
  return isRecord(expression) ? expression[key] : undefined;
}

function isAst(expression: unknown, key: string): boolean {
  return isRecord(expression) && key in expression;
}

function identifierName(identifier: unknown): string | undefined {
  if (!identifier) return undefined;
  if (typeof identifier === 'string') return cleanIdentifier(identifier);
  if (isRecord(identifier) && typeof identifier.name === 'string') return cleanIdentifier(identifier.name);
  if (isRecord(identifier) && isRecord(identifier.var) && typeof identifier.var.this === 'string') return cleanIdentifier(identifier.var.this);
  if (isRecord(identifier) && isRecord(identifier.identifier)) return identifierName(identifier.identifier);
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
  return typeof value === 'object' && value !== null;
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

function toDiagnostic(input: PolyglotDiagnostic, severity?: Diagnostic['severity']): Diagnostic {
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

interface PolyglotDiagnostic {
  code?: string;
  message?: string;
  severity?: Diagnostic['severity'];
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
  if (!dataType || typeof dataType !== 'object') return undefined;
  const record = dataType as Record<string, unknown>;
  const value = record.data_type === 'custom' && typeof record.name === 'string'
    ? record.name
    : record.data_type ?? record.type ?? record.name;
  return typeof value === 'string' ? normalizeDataTypeName(value) : undefined;
}

function normalizeDataTypeName(value: string): string {
  const lower = value.toLowerCase();
  if (lower === 'serial' || lower === 'serial4') return 'integer';
  if (lower === 'bigserial' || lower === 'serial8') return 'big_int';
  if (lower === 'smallserial' || lower === 'serial2') return 'small_int';
  return value;
}

type AstExpression = Record<string, unknown>;
type TableAliasMap = Map<string, TableAliasEntry>;

interface TableAliasEntry {
  tableName: string;
  schemaName?: string;
  visibleColumnNames: string[];
  nullable?: boolean;
}

interface NestedBaseColumn {
  table: SchemaTable;
  column: SchemaColumn;
  source: string;
}

type NestedPathStep =
  | { kind: 'field'; name: string }
  | { kind: 'element' };

interface StatementContext {
  prepared: Map<string, AstExpression>;
}
