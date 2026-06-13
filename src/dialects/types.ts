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
export type JdbcParameterMarkerStyle = 'question' | 'postgresOrdinal' | 'oracleOrdinal' | 'tsqlOrdinal';
export type LiteralStringTypePolicy = 'text' | 'varcharLength';
export type JdbcTemporalLiteralStyle = 'standard' | 'raw' | 'cast';

export interface IncludeDirectiveConfig {
  readonly kind: 'oracle' | 'postgresql' | 'mysql' | 'tsql' | 'dot';
}

export interface DialectMetadataConfig {
  readonly sqliteRowidColumns?: readonly string[];
  readonly oracleCurrentUserColumn?: boolean;
  readonly describeFunctionColumns: readonly DialectTableFunctionColumnConfig[];
  readonly explainColumns: readonly DialectTableFunctionColumnConfig[];
  readonly snowflakeDescribeObjectColumns: Readonly<Record<string, readonly DialectTableFunctionColumnConfig[]>>;
  readonly showTablesColumns?: readonly DialectTableFunctionColumnConfig[];
  readonly showTableListingColumns?: readonly DialectTableFunctionColumnConfig[];
  readonly commandResultColumns: readonly DialectCommandResultConfig[];
}

export interface DialectDiagnosticRulesConfig {
  readonly suppressSqliteRowid?: boolean;
  readonly suppressOracleCurrentUser?: boolean;
  readonly knownTableFunctionArgumentNames: readonly string[];
  readonly virtualTableArgumentNames: readonly string[];
}

export interface DialectTableFunctionColumnConfig {
  readonly name: string;
  readonly type: string;
  readonly nullable?: boolean;
}

export interface DialectCommandResultConfig {
  readonly pattern: string;
  readonly columns: readonly DialectTableFunctionColumnConfig[];
}

export type AvgDecimalPolicy = 'default' | 'mysqlPlus4' | 'tsqlScaleAtLeast6';
export type AvgDefaultPolicy = 'integerPreserving' | string;
export type SumDecimalPolicy = 'input' | 'mysqlPlus22' | 'decimal38' | 'numeric' | 'number';
export type CommonTextTypePolicy = 'none' | 'mysqlMaxVarchar' | 'firstText' | 'varchar';
export type CommonDecimalIntegerPolicy = 'none' | 'mysqlScalePlus20' | 'tsqlScalePlus10' | 'decimal' | 'firstType';
export type CastAdjustmentPolicy = 'none' | 'mysqlCharBinaryLength';
export type ArithmeticDecimalPolicy = 'none' | 'mysqlScalePlus21' | 'tsqlDuckdbPrecision' | 'decimal';
export type GeneratedAddNameStyle = 'empty' | 'postgresColumn' | 'duckdbParenthesized' | 'oracleUpperCompact' | 'compact';
export type GeneratedUpperNameStyle = 'empty' | 'postgresFunction' | 'oracleUpperCall' | 'duckdbQuotedCall' | 'call';

export interface DialectAggregateConfig {
  readonly countType: string;
  readonly avgDefault: AvgDefaultPolicy;
  readonly avgDecimal: AvgDecimalPolicy;
  readonly sumDecimal: SumDecimalPolicy;
}

export interface DialectCommonTypeConfig {
  readonly text: CommonTextTypePolicy;
  readonly decimalInteger: CommonDecimalIntegerPolicy;
  readonly resultDecimalInteger?: string;
}

export interface DialectCastConfig {
  readonly adjustment: CastAdjustmentPolicy;
}

export interface DialectArithmeticConfig {
  readonly allNumberType?: string;
  readonly decimalInteger: ArithmeticDecimalPolicy;
}

export interface DialectGeneratedNamesConfig {
  readonly fallback?: string;
  readonly countStar: string;
  readonly add: GeneratedAddNameStyle;
  readonly upper: GeneratedUpperNameStyle;
}

export interface DialectLiteralTypesConfig {
  readonly string: LiteralStringTypePolicy;
}

export interface DialectDynamicTableFunctionConfig {
  readonly generateSeriesColumn: string;
  readonly rangeColumn: string;
  readonly enabledHandlers: readonly string[];
}

export interface DialectSerializedSelectConfig {
  readonly forJson?: string;
  readonly forXml?: string;
}

export interface DialectJdbcEscapeConfig {
  readonly ifnullFunction: string;
  readonly temporalLiteral: JdbcTemporalLiteralStyle;
  readonly executeCall: boolean;
  readonly currentDateExpression: string;
  readonly currentTimeExpression: string;
}

export interface DialectParserFallbackConfig {
  readonly createView: string;
  readonly tableMacro: string;
  readonly embeddedSqlTableFunction: string;
}

export interface DialectConfig {
  readonly name: string;
  readonly aliases: readonly string[];
  readonly family: string;
  readonly typeFamily: TypeFamily;
  readonly displayTypes: Readonly<Record<string, string>>;
  readonly jdbcTypeMap: Readonly<Record<string, string>>;
  readonly scalarFunctionTypes: Readonly<Record<string, string>>;
  readonly scalarFunctionTypePatterns: Readonly<Record<string, string>>;
  readonly tableFunctions: Readonly<Record<string, readonly DialectTableFunctionColumnConfig[]>>;
  readonly aggregate: DialectAggregateConfig;
  readonly commonTypes: DialectCommonTypeConfig;
  readonly cast: DialectCastConfig;
  readonly arithmetic: DialectArithmeticConfig;
  readonly windowFunctionTypes: Readonly<Record<string, string>>;
  readonly specialParameterTypes: Readonly<Record<string, string>>;
  readonly specialColumnTypes: Readonly<Record<string, string>>;
  readonly qualifiedSpecialColumnTypes: Readonly<Record<string, string>>;
  readonly pseudoColumnTypes: Readonly<Record<string, string>>;
  readonly generatedNames: DialectGeneratedNamesConfig;
  readonly scriptPreprocessor: ScriptPreprocessor;
  readonly includeDirectives: readonly IncludeDirectiveConfig[];
  readonly complexTypeStyle: ComplexTypeStyle;
  readonly jdbcEscapeStyle: JdbcEscapeStyle;
  readonly jdbcEscape: DialectJdbcEscapeConfig;
  readonly jdbcParameterMarker: JdbcParameterMarkerStyle;
  readonly parserFallbacks: DialectParserFallbackConfig;
  readonly parameterizedTypeFormats: Readonly<Record<string, string>>;
  readonly literalTypes: DialectLiteralTypesConfig;
  readonly dynamicTableFunctions: DialectDynamicTableFunctionConfig;
  readonly serializedSelect: DialectSerializedSelectConfig;
  readonly outputTypeOverrides: Readonly<Record<string, string>>;
  readonly metadata: DialectMetadataConfig;
  readonly diagnosticRules: DialectDiagnosticRulesConfig;
}
