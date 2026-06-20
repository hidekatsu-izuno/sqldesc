#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseTestDocFile } from "../dist/doc-test/parser.js";

const prefix = "sqldesc-risingwave";
const risingwaveImage = "docker.io/risingwavelabs/risingwave:latest";
const pythonImage = "docker.io/library/python:3-slim";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const probePath = path.join(scriptDir, "risingwave-sql-probe.py");
const risingwavePort = 4566;
const database = process.env.RISINGWAVE_DATABASE ?? "dev";
const user = process.env.RISINGWAVE_USER ?? "root";

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

function risingwaveReachable() {
  const probe = docker([
    "run",
    "--rm",
    "--network",
    "host",
    pythonImage,
    "bash",
    "-lc",
    `pip install -q psycopg2-binary && python -c "import psycopg2; c=psycopg2.connect(host='127.0.0.1', port=${risingwavePort}, dbname='${database}', user='${user}'); c.cursor().execute('SELECT 1'); c.close()"`,
  ]);
  return probe.status === 0;
}

async function waitRisingWave(attempts = 90) {
  for (let i = 0; i < attempts; i += 1) {
    if (risingwaveReachable()) return;
    if (i === 0 || (i + 1) % 6 === 0) {
      process.stdout.write(`Waiting for RisingWave on 127.0.0.1:${risingwavePort}...\n`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw new Error("RisingWave did not become ready");
}

function risingwaveVersion() {
  const result = docker([
    "run",
    "--rm",
    "--network",
    "host",
    pythonImage,
    "bash",
    "-lc",
    `pip install -q psycopg2-binary && python -c "import psycopg2; c=psycopg2.connect(host='127.0.0.1', port=${risingwavePort}, dbname='${database}', user='${user}'); cur=c.cursor(); cur.execute('SELECT version()'); print(cur.fetchone()[0]); cur.close(); c.close()"`,
  ]);
  const line = result.stdout
    .trim()
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => /RisingWave/i.test(entry));
  const match = line?.match(/RisingWave-([\d.]+)/i);
  return match?.[1] ?? line ?? "unknown";
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
    `127.0.0.1:${risingwavePort}:4566`,
    "-p",
    "127.0.0.1:5691:5691",
    risingwaveImage,
    "single_node",
  ]);
}

function runRisingWaveBatch(queries) {
  const workDir = mkdtempSync(path.join(os.tmpdir(), "sqldesc-risingwave-"));
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
    `pip install -q psycopg2-binary && python /tmp/probe.py 127.0.0.1 ${risingwavePort} ${database} ${user} /tmp/queries.json`,
  ]);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "risingwave probe failed");
  }
  const line = result.stdout
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("["));
  if (!line) {
    throw new Error(`no JSON output from risingwave probe:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(line);
}

function printReport(results) {
  const counts = {
    "risingwave-match": 0,
    "risingwave-mismatch": 0,
    "risingwave-error": 0,
  };
  for (const result of results) counts[result.status] += 1;

  console.log("RisingWave Docker verification for docs/test/risingwave.md");
  console.log(
    `risingwave-match=${counts["risingwave-match"]}, risingwave-mismatch=${counts["risingwave-mismatch"]}, ` +
      `risingwave-error=${counts["risingwave-error"]}`,
  );

  for (const result of results) {
    if (result.status === "risingwave-match") continue;
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
    await waitRisingWave();
    console.log(`Using ${risingwaveImage} (RisingWave ${risingwaveVersion()})`);
  }

  const build = run("npm", ["run", "build"], { cwd: process.cwd() });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);

  const docTest = run("node", ["scripts/run-doc-test.mjs", "docs/test/risingwave.md"], {
    cwd: process.cwd(),
  });
  console.log(docTest.stdout.trim());
  if (docTest.status !== 0) {
    process.stderr.write(docTest.stderr);
    process.exitCode = 1;
    return;
  }

  if (skipDocker) return;

  const doc = await parseTestDocFile(path.resolve("docs/test/risingwave.md"));
  const queries = doc.cases
    .filter((testCase) => testCase.then.kind === "columns" && testCase.when.sql)
    .map((testCase) => ({ id: testCase.id, sql: testCase.when.sql }));

  const batch = runRisingWaveBatch(queries);
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
        status: "risingwave-error",
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
        status: "risingwave-error",
        expected,
        actual: [],
        error: actualEntry.error,
      });
      continue;
    }
    const actual = (actualEntry.columns ?? []).map((column) => column.name);
    const status =
      actual.length === expected.length && actual.every((name, index) => name === expected[index])
        ? "risingwave-match"
        : "risingwave-mismatch";
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
    (result) => result.status === "risingwave-mismatch" || result.status === "risingwave-error",
  );
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exitCode = 1;
});
