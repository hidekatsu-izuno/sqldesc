import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { parseTestDocFile } from "../dist/doc-test/parser.js";
import { runTestDocFile } from "../dist/doc-test/runner.js";

const docsTestDir = path.join(process.cwd(), "docs/test");

async function resolveDocFiles(): Promise<string[]> {
  const fromEnv = process.env.DOC_TEST_FILES?.trim();
  if (fromEnv) {
    return fromEnv
      .split(path.delimiter)
      .filter(Boolean)
      .map((file) => path.resolve(file));
  }

  const entries = await readdir(docsTestDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(docsTestDir, entry.name))
    .sort();
}

describe("docs/test/*.md", () => {
  it("executes markdown test documents", async () => {
    const files = await resolveDocFiles();
    assert.ok(files.length > 0, "expected at least one docs/test/*.md file");

    for (const filePath of files) {
      const label = path.relative(process.cwd(), filePath);
      const doc = await parseTestDocFile(filePath);
      assert.ok(doc.cases.length > 0, `${label} should contain test cases`);

      const report = await runTestDocFile(filePath);
      console.log(
        `${label}: ${report.passed} passed, ${report.failed} failed, ` +
          `${report.skipped} skipped, ${report.verified} verified / ${report.total}`,
      );

      if (report.verifiedFailures.length > 0) {
        const preview = report.verifiedFailures
          .slice(0, 10)
          .map((failure) => `  - ${failure.caseId}: ${failure.message}`)
          .join("\n");
        assert.fail(`${label}: ${report.verifiedFailed} verified case(s) failed:\n${preview}`);
      }

      assert.ok(report.passed > 0, `${label} should have passing cases`);
    }
  });
});
