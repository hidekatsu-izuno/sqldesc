#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseTestDocFile } from "../dist/doc-test/parser.js";

const prefix = "sqldesc-starrocks";
const starrocksImage = "docker.io/starrocks/allin1-ubuntu:latest";
const pythonImage = "docker.io/library/python:3-slim";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const probePath = path.join(scriptDir, "starrocks-sql-probe.py");
const starrocksPort = 9030;

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

async function waitStarRocks(attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    const result = docker([
      "exec",
      prefix,
      "mysql",
      "-h127.0.0.1",
      `-P${starrocksPort}`,
      "-uroot",
      "-e",
      "SELECT 1",
    ]);
    if (result.status === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("StarRocks did not become ready");
}

function starrocksVersion() {
  const result = docker([
    "exec",
    prefix,
    "mysql",
    "-h127.0.0.1",
    `-P${starrocksPort}`,
    "-uroot",
    "-N",
    "-e",
    "SELECT current_version()",
  ]);
  const line = result.stdout
    .trim()
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => /^\d+\.\d+\.\d+/.test(entry));
  return line ?? "unknown";
}

function setupDocker() {
  docker(["rm", "-f", prefix]);
  docker([
    "run",
    "-d",
    "--name",
    prefix,
    "-p",
    `127.0.0.1:${starrocksPort}:${starrocksPort}`,
    "-p",
    "127.0.0.1:8030:8030",
    starrocksImage,
  ]);
}

function runStarRocksBatch(queries) {
  const workDir = mkdtempSync(path.join(os.tmpdir(), "sqldesc-starrocks-"));
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
    "pip install -q pymysql && python /tmp/probe.py 127.0.0.1 9030 /tmp/queries.json",
  ]);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "starrocks probe failed");
  }
  const line = result.stdout
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("["));
  if (!line) {
    throw new Error(`no JSON output from starrocks probe:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(line);
}

function printReport(results) {
  const counts = {
    "starrocks-match": 0,
    "starrocks-mismatch": 0,
    "starrocks-error": 0,
  };
  for (const result of results) counts[result.status] += 1;

  console.log("StarRocks Docker verification for docs/test/starrocks.md");
  console.log(
    `starrocks-match=${counts["starrocks-match"]}, starrocks-mismatch=${counts["starrocks-mismatch"]}, ` +
      `starrocks-error=${counts["starrocks-error"]}`,
  );

  for (const result of results) {
    if (result.status === "starrocks-match") continue;
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
    await waitStarRocks();
    console.log(`Using ${starrocksImage} (StarRocks ${starrocksVersion()})`);
  }

  const build = run("npm", ["run", "build"], { cwd: process.cwd() });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);

  const docTest = run("node", ["scripts/run-doc-test.mjs", "docs/test/starrocks.md"], {
    cwd: process.cwd(),
  });
  console.log(docTest.stdout.trim());
  if (docTest.status !== 0) {
    process.stderr.write(docTest.stderr);
    process.exitCode = 1;
    return;
  }

  const doc = await parseTestDocFile(path.resolve("docs/test/starrocks.md"));
  const queries = doc.cases
    .filter((testCase) => testCase.then.kind === "columns" && testCase.when.sql)
    .map((testCase) => ({ id: testCase.id, sql: testCase.when.sql }));

  const batch = runStarRocksBatch(queries);
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
        status: "starrocks-error",
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
        status: "starrocks-error",
        expected,
        actual: [],
        error: actualEntry.error,
      });
      continue;
    }
    const actual = (actualEntry.columns ?? []).map((column) => column.name);
    const status =
      actual.length === expected.length && actual.every((name, index) => name === expected[index])
        ? "starrocks-match"
        : "starrocks-mismatch";
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
    (result) => result.status === "starrocks-mismatch" || result.status === "starrocks-error",
  );
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
