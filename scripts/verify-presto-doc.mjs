#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseTestDocFile } from "../dist/doc-test/parser.js";

const prefix = "sqldesc-presto";
const prestoImage = "docker.io/prestodb/presto:latest";
const pythonImage = "docker.io/library/python:3-slim";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const probePath = path.join(scriptDir, "presto-sql-probe.py");
const prestoPort = Number(process.env.PRESTO_PORT ?? 8080);
const catalog = process.env.PRESTO_CATALOG ?? "memory";
const schema = process.env.PRESTO_SCHEMA ?? "default";
const user = process.env.PRESTO_USER ?? "sqldesc";

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

function prestoReachable() {
  const probe = docker([
    "run",
    "--rm",
    "--network",
    "host",
    pythonImage,
    "bash",
    "-lc",
    `pip install -q presto-python-client && python -c "import prestodb.dbapi; c=prestodb.dbapi.connect(host='127.0.0.1', port=${prestoPort}, user='${user}', catalog='${catalog}', schema='${schema}', http_scheme='http'); cur=c.cursor(); cur.execute('SELECT 1'); cur.close(); c.close()"`,
  ]);
  return probe.status === 0;
}

async function waitPresto(attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    if (prestoReachable()) return;
    if (i === 0 || (i + 1) % 6 === 0) {
      process.stdout.write(`Waiting for Presto on 127.0.0.1:${prestoPort}...\n`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw new Error("Presto did not become ready");
}

function prestoVersion() {
  const result = docker([
    "run",
    "--rm",
    "--network",
    "host",
    pythonImage,
    "bash",
    "-lc",
    `pip install -q presto-python-client && python -c "import prestodb.dbapi; c=prestodb.dbapi.connect(host='127.0.0.1', port=${prestoPort}, user='${user}', catalog='${catalog}', schema='${schema}', http_scheme='http'); cur=c.cursor(); cur.execute('SELECT node_version FROM system.runtime.nodes LIMIT 1'); print(cur.fetchone()[0]); cur.close(); c.close()"`,
  ]);
  const line = result.stdout
    .trim()
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry && !entry.startsWith("WARNING") && !entry.startsWith("[notice]"));
  return line ?? "unknown";
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
    "-p",
    `127.0.0.1:${prestoPort}:8080`,
    prestoImage,
  ]);
}

function runPrestoBatch(queries) {
  const workDir = mkdtempSync(path.join(os.tmpdir(), "sqldesc-presto-"));
  const queriesPath = path.join(workDir, "queries.json");
  writeFileSync(queriesPath, JSON.stringify(queries), "utf8");
  const result = docker([
    "run",
    "--rm",
    "--network",
    "host",
    "-v",
    `${probePath}:/tmp/probe.py:ro`,
    "-v",
    `${queriesPath}:/tmp/queries.json:ro`,
    pythonImage,
    "bash",
    "-lc",
    `pip install -q presto-python-client && python /tmp/probe.py 127.0.0.1 ${prestoPort} ${catalog} ${schema} ${user} /tmp/queries.json`,
  ]);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "presto probe failed");
  }
  const line = result.stdout
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("["));
  if (!line) {
    throw new Error(`no JSON output from presto probe:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(line);
}

function printReport(results) {
  const counts = {
    "presto-match": 0,
    "presto-mismatch": 0,
    "presto-error": 0,
  };
  for (const result of results) counts[result.status] += 1;

  console.log("Presto Docker verification for docs/test/presto.md");
  console.log(
    `presto-match=${counts["presto-match"]}, presto-mismatch=${counts["presto-mismatch"]}, ` +
      `presto-error=${counts["presto-error"]}`,
  );

  for (const result of results) {
    if (result.status === "presto-match") continue;
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
    await waitPresto();
    console.log(`Using ${prestoImage} (Presto ${prestoVersion()})`);
  }

  const build = run("npm", ["run", "build"], { cwd: process.cwd() });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);

  const docTest = run("node", ["scripts/run-doc-test.mjs", "docs/test/presto.md"], {
    cwd: process.cwd(),
  });
  console.log(docTest.stdout.trim());
  if (docTest.status !== 0) {
    process.stderr.write(docTest.stderr);
    process.exitCode = 1;
    return;
  }

  if (skipDocker) return;

  const doc = await parseTestDocFile(path.resolve("docs/test/presto.md"));
  const queries = doc.cases
    .filter((testCase) => testCase.then.kind === "columns" && testCase.when.sql)
    .map((testCase) => ({ id: testCase.id, sql: testCase.when.sql }));

  const batch = runPrestoBatch(queries);
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
        status: "presto-error",
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
        status: "presto-error",
        expected,
        actual: [],
        error: actualEntry.error,
      });
      continue;
    }
    const actual = (actualEntry.columns ?? []).map((column) => column.name);
    const status =
      actual.length === expected.length && actual.every((name, index) => name === expected[index])
        ? "presto-match"
        : "presto-mismatch";
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
    (result) => result.status === "presto-mismatch" || result.status === "presto-error",
  );
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
