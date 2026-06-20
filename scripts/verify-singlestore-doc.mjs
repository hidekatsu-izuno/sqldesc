#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseTestDocFile } from "../dist/doc-test/parser.js";

const prefix = "sqldesc-singlestore";
const singlestoreImage = "ghcr.io/singlestore-labs/singlestoredb-dev:latest";
const pythonImage = "docker.io/library/python:3-slim";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const probePath = path.join(scriptDir, "singlestore-sql-probe.py");
const singlestorePort = 3306;
const rootPassword = process.env.SINGLESTORE_ROOT_PASSWORD ?? "sqldesc";

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

async function waitSingleStore(attempts = 120) {
  for (let i = 0; i < attempts; i += 1) {
    if (singlestoreReachable()) return;
    if (i === 0 || (i + 1) % 6 === 0) {
      process.stdout.write(`Waiting for SingleStore on 127.0.0.1:${singlestorePort}...\n`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw new Error("SingleStore did not become ready");
}

function singlestoreVersion() {
  const result = docker([
    "run",
    "--rm",
    "--network",
    "host",
    "-e",
    `SINGLESTORE_PASSWORD=${rootPassword}`,
    pythonImage,
    "bash",
    "-lc",
    `pip install -q pymysql && python -c "import os, pymysql; c=pymysql.connect(host='127.0.0.1', port=${singlestorePort}, user='root', password=os.environ['SINGLESTORE_PASSWORD']); cur=c.cursor(); cur.execute('SELECT @@memsql_version'); print(cur.fetchone()[0]); cur.close(); c.close()"`,
  ]);
  const line = result.stdout
    .trim()
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => /\d+\.\d+/.test(entry));
  return line ?? "unknown";
}

function singlestoreReachable() {
  const mysql = docker([
    "run",
    "--rm",
    "--network",
    "host",
    "-e",
    `SINGLESTORE_PASSWORD=${rootPassword}`,
    pythonImage,
    "bash",
    "-lc",
    `pip install -q pymysql && python -c "import os, pymysql; c=pymysql.connect(host='127.0.0.1', port=${singlestorePort}, user='root', password=os.environ['SINGLESTORE_PASSWORD']); c.cursor().execute('SELECT 1'); c.close()"`,
  ]);
  return mysql.status === 0;
}

function setupDocker() {
  const running = docker(["ps", "-q", "-f", `name=${prefix}`]).stdout.trim();
  if (running) return;
  docker(["rm", "-f", prefix]);
  docker([
    "run",
    "-d",
    "--name",
    prefix,
    "-e",
    `ROOT_PASSWORD=${rootPassword}`,
    "-p",
    `127.0.0.1:${singlestorePort}:${singlestorePort}`,
    singlestoreImage,
  ]);
}

function runSingleStoreBatch(queries) {
  const workDir = mkdtempSync(path.join(os.tmpdir(), "sqldesc-singlestore-"));
  const queriesPath = path.join(workDir, "queries.json");
  writeFileSync(queriesPath, JSON.stringify(queries), "utf8");
  const result = docker([
    "run",
    "--rm",
    "--network",
    "host",
    "-e",
    `SINGLESTORE_PASSWORD=${rootPassword}`,
    "-v",
    `${probePath}:/tmp/probe.py:ro`,
    "-v",
    `${queriesPath}:/tmp/queries.json:ro`,
    pythonImage,
    "bash",
    "-lc",
    `pip install -q pymysql && python /tmp/probe.py 127.0.0.1 ${singlestorePort} "$SINGLESTORE_PASSWORD" /tmp/queries.json`,
  ]);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "singlestore probe failed");
  }
  const line = result.stdout
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("["));
  if (!line) {
    throw new Error(`no JSON output from singlestore probe:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(line);
}

function printReport(results) {
  const counts = {
    "singlestore-match": 0,
    "singlestore-mismatch": 0,
    "singlestore-error": 0,
  };
  for (const result of results) counts[result.status] += 1;

  console.log("SingleStore Docker verification for docs/test/singlestore.md");
  console.log(
    `singlestore-match=${counts["singlestore-match"]}, singlestore-mismatch=${counts["singlestore-mismatch"]}, ` +
      `singlestore-error=${counts["singlestore-error"]}`,
  );

  for (const result of results) {
    if (result.status === "singlestore-match") continue;
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
    await waitSingleStore();
    console.log(`Using ${singlestoreImage} (SingleStore ${singlestoreVersion()})`);
  }

  const build = run("npm", ["run", "build"], { cwd: process.cwd() });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);

  const docTest = run("node", ["scripts/run-doc-test.mjs", "docs/test/singlestore.md"], {
    cwd: process.cwd(),
  });
  console.log(docTest.stdout.trim());
  if (docTest.status !== 0) {
    process.stderr.write(docTest.stderr);
    process.exitCode = 1;
    return;
  }

  if (skipDocker) return;

  const doc = await parseTestDocFile(path.resolve("docs/test/singlestore.md"));
  const queries = doc.cases
    .filter((testCase) => testCase.then.kind === "columns" && testCase.when.sql)
    .map((testCase) => ({ id: testCase.id, sql: testCase.when.sql }));

  const batch = runSingleStoreBatch(queries);
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
        status: "singlestore-error",
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
        status: "singlestore-error",
        expected,
        actual: [],
        error: actualEntry.error,
      });
      continue;
    }
    const actual = (actualEntry.columns ?? []).map((column) => column.name);
    const status =
      actual.length === expected.length && actual.every((name, index) => name === expected[index])
        ? "singlestore-match"
        : "singlestore-mismatch";
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
    (result) => result.status === "singlestore-mismatch" || result.status === "singlestore-error",
  );
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exitCode = 1;
});
