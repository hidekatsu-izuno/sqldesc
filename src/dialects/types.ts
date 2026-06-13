export type TypeFamily =
  | 'postgresql'
  | 'mysql'
  | 'sqlite'
  | 'tsql'
  | 'oracle'
  | 'duckdb'
  | 'bigquery'
  | 'trino'
  | 'snowflake'
  | 'hive'
  | 'clickhouse'
  | 'generic';

export type ScriptPreprocessor = 'none' | 'psql' | 'sqlplus' | 'mysqlDelimiter' | 'tsqlGo' | 'dotCommand';

export type ComplexTypeStyle = 'angle' | 'trino';

export type JdbcEscapeStyle = 'standard' | 'mysql' | 'tsql';

export interface IncludeDirectiveConfig {
  readonly kind: 'oracle' | 'postgresql' | 'mysql' | 'tsql' | 'dot';
}

export interface DialectMetadataConfig {
  readonly sqliteRowidColumns?: readonly string[];
  readonly oracleCurrentUserColumn?: boolean;
}

export interface DialectDiagnosticRulesConfig {
  readonly suppressSqliteRowid?: boolean;
  readonly suppressOracleCurrentUser?: boolean;
}

export interface DialectConfig {
  readonly name: string;
  readonly aliases: readonly string[];
  readonly family: string;
  readonly typeFamily: TypeFamily;
  readonly displayTypes: Readonly<Record<string, string>>;
  readonly jdbcTypeMap: Readonly<Record<string, string>>;
  readonly scalarFunctionTypes: Readonly<Record<string, string>>;
  readonly scriptPreprocessor: ScriptPreprocessor;
  readonly includeDirectives: readonly IncludeDirectiveConfig[];
  readonly complexTypeStyle: ComplexTypeStyle;
  readonly jdbcEscapeStyle: JdbcEscapeStyle;
  readonly outputTypeOverrides: Readonly<Record<string, string>>;
  readonly metadata: DialectMetadataConfig;
  readonly diagnosticRules: DialectDiagnosticRulesConfig;
}
