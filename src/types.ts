export type BindMode = 'positional' | 'named';

export interface PositionalBind {
  index: number;
  type: string;
}

export interface NamedBind {
  name: string;
  type: string;
}

export type BindSpec =
  | { mode: 'none'; binds: [] }
  | { mode: 'positional'; binds: PositionalBind[] }
  | { mode: 'named'; binds: NamedBind[] };

export interface SchemaLoadOptions {
  cwd?: string;
  dialect?: string;
}

export interface SchemaColumn {
  name: string;
  type: string;
  nullable?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
}

export interface SchemaTable {
  name: string;
  schema?: string;
  columns: SchemaColumn[];
  primaryKey?: string[];
  uniqueKeys?: string[][];
  foreignKeys?: unknown[];
}

export interface SchemaFunction {
  name: string;
  schema?: string;
  returnType: string;
}

export interface SchemaProcedure {
  name: string;
  schema?: string;
  columns: SchemaColumn[];
}

export interface ValidationSchema {
  tables: SchemaTable[];
  functions?: SchemaFunction[];
  procedures?: SchemaProcedure[];
}

export interface DescribeInput {
  sql: string;
  dialect?: string;
  jdbc?: boolean;
  binds?: string | BindSpec;
  schema?: ValidationSchema;
  schemaPatterns?: string[];
  schemaFiles?: string[];
  cwd?: string;
}

export interface Diagnostic {
  code?: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  line?: number;
  column?: number;
}

export interface DescribeColumn {
  index: number;
  name: string;
  type: string;
  nullable?: boolean;
  source?: string;
  note?: string;
}

export interface DescribeResult {
  columns: DescribeColumn[];
  resultSets: Array<{
    index: number;
    columns: DescribeColumn[];
  }>;
  statements: StatementSummary[];
  warnings: string[];
  diagnostics: Diagnostic[];
  binds: BindSpec;
  schema: ValidationSchema;
}

export type StatementResultKind = 'static' | 'none' | 'runtime' | 'metadata' | 'unknown';

export interface StatementSummary {
  index: number;
  kind: string;
  resultKind: StatementResultKind;
  message?: string;
}

export type AstExpression = Record<string, unknown>;
export type TableAliasMap = Map<string, TableAliasEntry>;

export type ColumnInference = Omit<DescribeColumn, 'index' | 'name'> & {
  confidence?: 'high' | 'medium' | 'low';
};

export interface OutputItem {
  expression: AstExpression;
  name?: string;
  source?: string;
  schema?: ValidationSchema;
  tableAliases?: TableAliasMap;
  functionReturnTypes?: Map<string, string>;
}

export interface TableAliasEntry {
  tableName: string;
  schemaName?: string;
  visibleColumnNames: string[];
  nullable?: boolean;
}

export interface NestedBaseColumn {
  table: SchemaTable;
  column: SchemaColumn;
  source: string;
}

export type NestedPathStep =
  | { kind: 'field'; name: string }
  | { kind: 'element' };

export interface StatementContext {
  prepared: Map<string, AstExpression>;
  functionReturnTypes: Map<string, string>;
  tableFunctions: Map<string, SchemaTable>;
  procedureResultSets: Map<string, OutputItem[]>;
  typeAliases: Map<string, string>;
}
