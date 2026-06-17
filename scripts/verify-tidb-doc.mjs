#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseTestDocFile } from "../dist/doc-test/parser.js";

const prefix = "sqldesc-tidb";
const tidbImage = "docker.io/pingcap/tidb:v8.5.1";
const pythonImage = "docker.io/library/python:3-slim";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const probePath = path.join(scriptDir, "tidb-sql-probe.py");
const tidbPort = 4000;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    ...options,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function docker(args, options) {
  return run("docker", args, options);
}

async function waitTiDB(attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    const mysql = docker([
      "run",
      "--rm",
      "--network",
      `container:${prefix}`,
      pythonImage,
      "bash",
      "-lc",
      `pip install -q pymysql && python -c "import pymysql; c=pymysql.connect(host='127.0.0.1', port=${tidbPort}, user='root'); c.cursor().execute('SELECT 1'); c.close()"`,
    ]);
    if (mysql.status === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("TiDB did not become ready");
}

function tidbVersion() {
  const result = docker([
    "run",
    "--rm",
    "--network",
    `container:${prefix}`,
    pythonImage,
    "bash",
    "-lc",
    `pip install -q pymysql && python -c "import pymysql; c=pymysql.connect(host='127.0.0.1', port=${tidbPort}, user='root'); cur=c.cursor(); cur.execute('SELECT tidb_version()'); print(cur.fetchone()[0].splitlines()[0].split()[-1]); cur.close(); c.close()"`,
  ]);
  const line = result.stdout
    .trim()
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => /^v?\d+\.\d+\.\d+/.test(entry));
  return line?.replace(/^v/, "") ?? "unknown";
}

function setupDocker() {
  docker(["rm", "-f", prefix]);
  docker([
    "run",
    "-d",
    "--name",
    prefix,
    "-p",
    `127.0.0.1:${tidbPort}:${tidbPort}`,
    tidbImage,
    "-P",
    String(tidbPort),
    "--store",
    "unistore",
  ]);
}

function runTiDBBatch(queries) {
  const workDir = mkdtempSync(path.join(os.tmpdir(), "sqldesc-tidb-"));
  const queriesPath = path.join(workDir, "queries.json");
  writeFileSync(queriesPath, JSON.stringify(queries), "utf8");
  const result = docker([
    "run",
    "--rm",
    "--network",
    `container:${prefix}`,
    "-v",
    `${probePath}:/tmp/probe.py:ro`,
    "-v",
    `${queriesPath}:/tmp/queries.json:ro`,
    pythonImage,
    "bash",
    "-lc",
    `pip install -q pymysql && python /tmp/probe.py 127.0.0.1 ${tidbPort} /tmp/queries.json`,
  ]);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "tidb probe failed");
  }
  const line = result.stdout
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("["));
  if (!line) {
    throw new Error(`no JSON output from tidb probe:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(line);
}

function printReport(results) {
  const counts = {
    "tidb-match": 0,
    "tidb-mismatch": 0,
    "tidb-error": 0,
  };
  for (const result of results) counts[result.status] += 1;

  console.log("TiDB Docker verification for docs/test/tidb.md");
  console.log(
    `tidb-match=${counts["tidb-match"]}, tidb-mismatch=${counts["tidb-mismatch"]}, ` +
      `tidb-error=${counts["tidb-error"]}`,
  );

  for (const result of results) {
    if (result.status === "tidb-match") continue;
    console.log(`\n[${result.status}] ${result.id} ${result.title}`);
    if (result.error) console.log(`  error: ${result.error}`);
    console.log(`  expected: ${result.expected.join(", ")}`);
    console.log(`  actual: ${result.actual.join(", ")}`);
  }
}

async function main() {
  const skipDocker = process.argv.includes("--skip-docker");
  if (!skipDocker) {
    setupDocker();
    await waitTiDB();
    console.log(`Using ${tidbImage} (TiDB ${tidbVersion()})`);
  }

  const build = run("npm", ["run", "build"], { cwd: process.cwd() });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);

  const docTest = run("node", ["scripts/run-doc-test.mjs", "docs/test/tidb.md"], {
    cwd: process.cwd(),
  });
  console.log(docTest.stdout.trim());
  if (docTest.status !== 0) {
    process.stderr.write(docTest.stderr);
    process.exitCode = 1;
    return;
  }

  if (skipDocker) return;

  const doc = await parseTestDocFile(path.resolve("docs/test/tidb.md"));
  const queries = doc.cases
    .filter((testCase) => testCase.then.kind === "columns" && testCase.when.sql)
    .map((testCase) => ({ id: testCase.id, sql: testCase.when.sql }));

  const batch = runTiDBBatch(queries);
  const byId = new Map(batch.map((entry) => [entry.id, entry]));

  const results = [];
  for (const testCase of doc.cases) {
    if (testCase.then.kind !== "columns" || !testCase.when.sql) continue;
    const expected = (testCase.then.columns ?? []).map((column) => column.name);
    const actualEntry = byId.get(testCase.id);
    if (!actualEntry) {
      results.push({
        id: testCase.id,
        title: testCase.title,
        status: "tidb-error",
        expected,
        actual: [],
        error: "missing probe result",
      });
      continue;
    }
    if (!actualEntry.ok) {
      results.push({
        id: testCase.id,
        title: testCase.title,
        status: "tidb-error",
        expected,
        actual: [],
        error: actualEntry.error,
      });
      continue;
    }
    const actual = (actualEntry.columns ?? []).map((column) => column.name);
    const status =
      actual.length === expected.length && actual.every((name, index) => name === expected[index])
        ? "tidb-match"
        : "tidb-mismatch";
    results.push({
      id: testCase.id,
      title: testCase.title,
      status,
      expected,
      actual,
    });
  }

  printReport(results);

  const failures = results.filter(
    (result) => result.status === "tidb-mismatch" || result.status === "tidb-error",
  );
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
