import { parseBinds } from "../binds.js";
import { describeQuery, describeUpdatableQuery } from "../describe.js";
import { parseTestDocFile } from "./parser.js";
import { parseCreateTables } from "../schema.js";
import type { DescribeColumn, ValidationSchema } from "../types.js";
import type {
  DocTestCase,
  DocTestFailure,
  DocTestReport,
  ExpectedColumn,
  GivenSpec,
  ParsedTestDoc,
  PrepareBlock,
  ThenSpec,
} from "./types.js";

export interface DocTestFileReport extends DocTestReport {
  filePath: string;
}

export async function runTestDocFile(filePath: string): Promise<DocTestFileReport> {
  const doc = await parseTestDocFile(filePath);
  const report = await runTestDoc(doc);
  return { ...report, filePath };
}

export async function runTestDocFiles(filePaths: string[]): Promise<DocTestFileReport[]> {
  const reports: DocTestFileReport[] = [];
  for (const filePath of filePaths) {
    reports.push(await runTestDocFile(filePath));
  }
  return reports;
}

export async function runTestDoc(doc: ParsedTestDoc): Promise<DocTestReport> {
  const failures: DocTestFailure[] = [];
  const verifiedFailures: DocTestFailure[] = [];
  let passed = 0;
  let skipped = 0;
  let verified = 0;

  for (const testCase of doc.cases) {
    if (testCase.then.kind === "skip" || testCase.when.kind !== "sql" || !testCase.when.sql) {
      skipped += 1;
      continue;
    }

    if (testCase.then.verify) verified += 1;

    try {
      await runSingleCase(testCase, doc);
      passed += 1;
    } catch (error) {
      const failure: DocTestFailure = {
        caseId: testCase.id,
        title: testCase.title,
        message: error instanceof Error ? error.message : String(error),
      };
      failures.push(failure);
      if (testCase.then.verify) verifiedFailures.push(failure);
    }
  }

  return {
    total: doc.cases.length,
    passed,
    failed: failures.length,
    skipped,
    verified,
    verifiedFailed: verifiedFailures.length,
    failures,
    verifiedFailures,
  };
}

async function runSingleCase(testCase: DocTestCase, doc: ParsedTestDoc): Promise<void> {
  const dialect = testCase.when.dialect ?? testCase.given.dialect ?? doc.defaultDialect;
  const binds = parseBinds(testCase.when.binds ?? testCase.given.binds);
  const schema = resolveSchema(testCase.given, doc.prepares, dialect);

  if (testCase.then.kind === "error") {
    await expectError(testCase, { dialect, binds, schema });
    return;
  }

  const result = await (testCase.when.api === "updatable" ? describeUpdatableQuery : describeQuery)({
    sql: testCase.when.sql!,
    dialect,
    binds,
    schema,
  });

  if (testCase.then.sql !== undefined) {
    const actualSql = "sql" in result && typeof result.sql === "string" ? result.sql : undefined;
    if (actualSql !== testCase.then.sql) {
      throw new Error(
        `sql: expected ${JSON.stringify(testCase.then.sql)}, got ${JSON.stringify(actualSql)}`,
      );
    }
  }

  if (testCase.then.kind === "none") {
    assertNone(
      result.columns,
      result.diagnostics?.map((d) => d.code).filter(Boolean) as string[],
      testCase.then,
    );
    return;
  }

  const actual = selectColumns(
    result.columns,
    result.resultSets.map((set) => set.columns),
    testCase.then,
  );
  assertColumns(actual, testCase.then.columns ?? [], testCase.id);
}

async function expectError(
  testCase: DocTestCase,
  input: { dialect: string; binds?: ReturnType<typeof parseBinds>; schema?: ValidationSchema },
): Promise<void> {
  try {
    await describeQuery({
      sql: testCase.when.sql!,
      dialect: input.dialect,
      binds: input.binds,
      schema: input.schema,
    });
    throw new Error("expected describeQuery to throw");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const expected = testCase.then.errorMatch ?? "Parse error";
    if (!message.includes(expected)) {
      throw new Error(
        `expected error containing ${JSON.stringify(expected)}, got ${JSON.stringify(message)}`,
      );
    }
  }
}

function resolveSchema(
  given: GivenSpec,
  prepares: Map<string, PrepareBlock>,
  dialect: string,
): ValidationSchema | undefined {
  if (given.schemaJson) {
    return given.schemaJson as unknown as ValidationSchema;
  }

  const ddlParts: string[] = [];
  const mergedTables = [];

  if (given.prepare?.length) {
    for (const prepareId of given.prepare) {
      const prepare = prepares.get(prepareId);
      if (!prepare) {
        throw new Error(`unknown prepare reference: ${prepareId}`);
      }
      ddlParts.push(prepare.content);
    }
  }
  if (given.schemaDdl) ddlParts.push(given.schemaDdl);

  if (ddlParts.length > 0) {
    mergedTables.push(...ddlParts.flatMap((ddl) => parseCreateTables(ddl, dialect)));
  }

  if (mergedTables.length === 0) return undefined;
  return { tables: mergedTables };
}

function selectColumns(
  first: DescribeColumn[],
  resultSets: DescribeColumn[][],
  then: ThenSpec,
): DescribeColumn[] {
  if (then.target === "last" && resultSets.length > 0) {
    return resultSets[resultSets.length - 1];
  }
  return first;
}

function assertNone(columns: DescribeColumn[], diagnosticCodes: string[], then: ThenSpec): void {
  if (columns.length > 0) {
    throw new Error(`expected no columns, got ${columns.map((c) => c.name).join(", ")}`);
  }
  for (const code of then.diagnostics ?? []) {
    if (!diagnosticCodes.includes(code)) {
      throw new Error(`expected diagnostic ${code}, got [${diagnosticCodes.join(", ")}]`);
    }
  }
}

function assertColumns(actual: DescribeColumn[], expected: ExpectedColumn[], caseId: string): void {
  if (actual.length !== expected.length) {
    throw new Error(
      `column count mismatch: expected ${expected.length} [${formatExpected(expected)}], ` +
        `got ${actual.length} [${formatActual(actual)}]`,
    );
  }

  for (let index = 0; index < expected.length; index += 1) {
    const exp = expected[index];
    const act = actual[index];
    if (exp.name !== act.name) {
      throw new Error(
        `column ${index + 1} name: expected ${exp.name}, got ${act.name} (${caseId})`,
      );
    }
    if (exp.type !== act.type) {
      throw new Error(`column ${exp.name} type: expected ${exp.type}, got ${act.type}`);
    }
    if (exp.source !== undefined && exp.source !== act.source) {
      throw new Error(
        `column ${exp.name} source: expected ${exp.source}, got ${act.source ?? "(none)"}`,
      );
    }
    if (exp.key !== undefined && exp.key !== (act as DescribeColumn & { key?: boolean }).key) {
      throw new Error(
        `column ${exp.name} key: expected ${exp.key}, got ${(act as DescribeColumn & { key?: boolean }).key ?? "(none)"}`,
      );
    }
  }
}

function formatExpected(columns: ExpectedColumn[]): string {
  return columns
    .map((c) => `${c.name}:${c.type}${c.source ? `@${c.source}` : ""}${c.key ? "#key" : ""}`)
    .join(", ");
}

function formatActual(columns: DescribeColumn[]): string {
  return columns
    .map(
      (c) =>
        `${c.name}:${c.type}${c.source ? `@${c.source}` : ""}${(c as DescribeColumn & { key?: boolean }).key ? "#key" : ""}`,
    )
    .join(", ");
}
