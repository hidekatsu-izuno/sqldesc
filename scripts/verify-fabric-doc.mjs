#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseTestDocFile } from "../dist/doc-test/parser.js";

const prefix = "sqldesc-fabric";
const fabricImage = "mcr.microsoft.com/mssql/server:2022-latest";
const pythonImage = "docker.io/library/python:3-slim";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const probePath = path.join(scriptDir, "fabric-sql-probe.py");
const fabricPort = 1433;
const saPassword = process.env.FABRIC_SA_PASSWORD ?? "Str0ngPass!234";

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

function fabricReachable() {
  const probe = docker([
    "run",
    "--rm",
    "--network",
    "host",
    "-e",
    `FABRIC_SA_PASSWORD=${saPassword}`,
    pythonImage,
    "bash",
    "-lc",
    `pip install -q pymssql && python -c "import os, pymssql; c=pymssql.connect(host='127.0.0.1', port=${fabricPort}, user='sa', password=os.environ['FABRIC_SA_PASSWORD']); c.cursor().execute('SELECT 1'); c.close()"`,
  ]);
  return probe.status === 0;
}

async function waitFabric(attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    if (fabricReachable()) return;
    if (i === 0 || (i + 1) % 6 === 0) {
      process.stdout.write(`Waiting for SQL Server on 127.0.0.1:${fabricPort}...\n`);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("SQL Server did not become ready");
}

function fabricVersion() {
  const result = docker([
    "run",
    "--rm",
    "--network",
    "host",
    "-e",
    `FABRIC_SA_PASSWORD=${saPassword}`,
    pythonImage,
    "bash",
    "-lc",
    `pip install -q pymssql && python -c "import os, pymssql; c=pymssql.connect(host='127.0.0.1', port=${fabricPort}, user='sa', password=os.environ['FABRIC_SA_PASSWORD']); cur=c.cursor(); cur.execute('SELECT @@VERSION'); print(cur.fetchone()[0].split(chr(10))[0]); cur.close(); c.close()"`,
  ]);
  const line = result.stdout
    .trim()
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => /Microsoft SQL Server/i.test(entry));
  const match = line?.match(/SQL Server (\d{4})/i);
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
    "-e",
    "ACCEPT_EULA=Y",
    "-e",
    `MSSQL_SA_PASSWORD=${saPassword}`,
    "-p",
    `127.0.0.1:${fabricPort}:${fabricPort}`,
    fabricImage,
  ]);
}

function runFabricBatch(queries) {
  const workDir = mkdtempSync(path.join(os.tmpdir(), "sqldesc-fabric-"));
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
    `pip install -q pymssql && python /tmp/probe.py 127.0.0.1 ${fabricPort} ${JSON.stringify(saPassword)} /tmp/queries.json`,
  ]);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "fabric probe failed");
  }
  const line = result.stdout
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("["));
  if (!line) {
    throw new Error(`no JSON output from fabric probe:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(line);
}

function normalizeFabricColumnName(name) {
  if (/^JSON_[0-9A-F-]+$/i.test(name)) return "";
  if (/^XML_[0-9A-F-]+$/i.test(name)) return "";
  return name;
}

function columnsMatch(expected, actual) {
  const normalizedActual = actual.map(normalizeFabricColumnName);
  return (
    normalizedActual.length === expected.length &&
    normalizedActual.every((name, index) => name === expected[index])
  );
}

function printReport(results) {
  const counts = {
    "fabric-match": 0,
    "fabric-mismatch": 0,
    "fabric-error": 0,
  };
  for (const result of results) counts[result.status] += 1;

  console.log("Fabric SQL Docker verification for docs/test/fabric.md");
  console.log(
    `fabric-match=${counts["fabric-match"]}, fabric-mismatch=${counts["fabric-mismatch"]}, ` +
      `fabric-error=${counts["fabric-error"]}`,
  );

  for (const result of results) {
    if (result.status === "fabric-match") continue;
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
    await waitFabric();
    console.log(`Using ${fabricImage} as Fabric SQL stand-in (SQL Server ${fabricVersion()})`);
  }

  const build = run("npm", ["run", "build"], { cwd: process.cwd() });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);

  const docTest = run("node", ["scripts/run-doc-test.mjs", "docs/test/fabric.md"], {
    cwd: process.cwd(),
  });
  console.log(docTest.stdout.trim());
  if (docTest.status !== 0) {
    process.stderr.write(docTest.stderr);
    process.exitCode = 1;
    return;
  }

  if (skipDocker) return;

  const doc = await parseTestDocFile(path.resolve("docs/test/fabric.md"));
  const queries = doc.cases
    .filter((testCase) => testCase.then.kind === "columns" && testCase.when.sql)
    .map((testCase) => ({ id: testCase.id, sql: testCase.when.sql }));

  const batch = runFabricBatch(queries);
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
        status: "fabric-error",
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
        status: "fabric-error",
        expected,
        actual: [],
        error: actualEntry.error,
      });
      continue;
    }
    const actual = (actualEntry.columns ?? []).map((column) => column.name);
    const status = columnsMatch(expected, actual) ? "fabric-match" : "fabric-mismatch";
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
    (result) => result.status === "fabric-mismatch" || result.status === "fabric-error",
  );
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exitCode = 1;
});
