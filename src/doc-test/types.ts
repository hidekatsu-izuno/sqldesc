export type PrepareKind = "schema-ddl";

export interface PrepareBlock {
  id: string;
  title: string;
  kind: PrepareKind;
  dialect?: string;
  content: string;
}

export interface GivenSpec {
  prepare?: string[];
  schemaDdl?: string;
  schemaJson?: Record<string, unknown>;
  binds?: string;
  dialect?: string;
}

export type ThenKind = "columns" | "error" | "none" | "skip";

export interface ExpectedColumn {
  name: string;
  type: string;
  source?: string;
}

export interface ThenSpec {
  kind: ThenKind;
  target: "first" | "last";
  verify: boolean;
  columns?: ExpectedColumn[];
  errorMatch?: string;
  diagnostics?: string[];
  resultKind?: string;
  skipReason?: string;
}

export interface WhenSpec {
  sql?: string;
  dialect?: string;
  binds?: string;
  kind: "sql" | "cli" | "js" | "none";
}

export interface DocTestCase {
  id: string;
  title: string;
  given: GivenSpec;
  when: WhenSpec;
  then: ThenSpec;
}

export interface ParsedTestDoc {
  defaultDialect: string;
  prepares: Map<string, PrepareBlock>;
  cases: DocTestCase[];
}

export interface DocTestFailure {
  caseId: string;
  title: string;
  message: string;
}

export interface DocTestReport {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  verified: number;
  verifiedFailed: number;
  failures: DocTestFailure[];
  verifiedFailures: DocTestFailure[];
}
