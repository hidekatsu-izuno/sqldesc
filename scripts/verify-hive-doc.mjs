#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseTestDocFile } from "../dist/doc-test/parser.js";

const prefix = "sqldesc-hive";
const hiveImage = "docker.io/apache/hive:4.0.0";
const pythonImage = "docker.io/library/python:3.11-slim";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const probePath = path.join(scriptDir, "hive-sql-probe.py");
const hivePort = Number(process.env.HIVE_PORT ?? 10000);
const database = process.env.HIVE_DATABASE ?? "sqldesc";
const user = process.env.HIVE_USER ?? "sqldesc";

const hivePythonDeps =
  "pip install -q pyhive thrift thrift_sasl pure-sasl && " +
  "python -c \"from pyhive import hive; import thrift; import thrift_sasl\"";

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

function hiveReachable() {
  const probe = docker([
    "run",
    "--rm",
    "--network",
    "host",
    pythonImage,
    "bash",
    "-lc",
    `${hivePythonDeps} && python -c "from pyhive import hive; c=hive.Connection(host='127.0.0.1', port=${hivePort}, username='${user}', database='default'); cur=c.cursor(); cur.execute('SELECT 1'); cur.close(); c.close()"`,
  ]);
  return probe.status === 0;
}

async function waitHive(attempts = 90) {
  for (let i = 0; i < attempts; i += 1) {
    if (hiveReachable()) return;
    if (i === 0 || (i + 1) % 6 === 0) {
      process.stdout.write(`Waiting for Hive on 127.0.0.1:${hivePort}...\n`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw new Error("Hive did not become ready");
}

function hiveVersion() {
  const result = docker([
    "run",
    "--rm",
    "--network",
    "host",
    pythonImage,
    "bash",
    "-lc",
    `${hivePythonDeps} && python -c "from pyhive import hive; c=hive.Connection(host='127.0.0.1', port=${hivePort}, username='${user}', database='default'); cur=c.cursor(); cur.execute('SELECT version()'); print(cur.fetchone()[0]); cur.close(); c.close()"`,
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
    `127.0.0.1:${hivePort}:10000`,
    "-p",
    "127.0.0.1:10002:10002",
    "-e",
    "SERVICE_NAME=hiveserver2",
    hiveImage,
  ]);
}

function runHiveBatch(queries) {
  const workDir = mkdtempSync(path.join(os.tmpdir(), "sqldesc-hive-"));
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
    `${hivePythonDeps} && python /tmp/probe.py 127.0.0.1 ${hivePort} ${database} ${user} /tmp/queries.json`,
  ]);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "hive probe failed");
  }
  const line = result.stdout
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("["));
  if (!line) {
    throw new Error(`no JSON output from hive probe:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(line);
}

function printReport(results) {
  const counts = {
    "hive-match": 0,
    "hive-mismatch": 0,
    "hive-error": 0,
  };
  for (const result of results) counts[result.status] += 1;

  console.log("Hive Docker verification for docs/test/hive.md");
  console.log(
    `hive-match=${counts["hive-match"]}, hive-mismatch=${counts["hive-mismatch"]}, ` +
      `hive-error=${counts["hive-error"]}`,
  );

  for (const result of results) {
    if (result.status === "hive-match") continue;
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
    await waitHive();
    console.log(`Using ${hiveImage} (${hiveVersion()})`);
  }

  const build = run("npm", ["run", "build"], { cwd: process.cwd() });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);

  const docTest = run("node", ["scripts/run-doc-test.mjs", "docs/test/hive.md"], {
    cwd: process.cwd(),
  });
  console.log(docTest.stdout.trim());
  if (docTest.status !== 0) {
    process.stderr.write(docTest.stderr);
    process.exitCode = 1;
    return;
  }

  if (skipDocker) return;

  const doc = await parseTestDocFile(path.resolve("docs/test/hive.md"));
  const queries = doc.cases
    .filter((testCase) => testCase.then.kind === "columns" && testCase.when.sql)
    .map((testCase) => ({ id: testCase.id, sql: testCase.when.sql }));

  const batch = runHiveBatch(queries);
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
        status: "hive-error",
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
        status: "hive-error",
        expected,
        actual: [],
        error: actualEntry.error,
      });
      continue;
    }
    const actual = (actualEntry.columns ?? []).map((column) => column.name);
    const status =
      actual.length === expected.length && actual.every((name, index) => name === expected[index])
        ? "hive-match"
        : "hive-mismatch";
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
    (result) => result.status === "hive-mismatch" || result.status === "hive-error",
  );
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
