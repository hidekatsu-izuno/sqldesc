#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseTestDocFile } from "../dist/doc-test/parser.js";

const prefix = "sqldesc-teradata";
const clientImage = "docker.io/teradata/python-teradatasql:latest";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const probePath = path.join(scriptDir, "teradata-sql-probe.py");
const port = process.env.TERADATA_PORT ?? "1025";
const user = process.env.TERADATA_USER ?? "dbc";
const password = process.env.TERADATA_PASSWORD ?? "dbc";

function windowsHostFromWsl() {
  const result = run("grep", ["nameserver", "/etc/resolv.conf"]);
  const line = result.stdout.trim().split("\n")[0] ?? "";
  const nameserver = line.split(/\s+/)[1];
  return nameserver || null;
}

function candidateHosts() {
  if (process.env.TERADATA_HOST) return [process.env.TERADATA_HOST];
  const hosts = ["127.0.0.1"];
  const winHost = windowsHostFromWsl();
  if (winHost && !hosts.includes(winHost)) hosts.push(winHost);
  return hosts;
}

let host = candidateHosts()[0];

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

function teradataReachableAt(targetHost) {
  const probe = docker([
    "run",
    "--rm",
    "--network",
    "host",
    clientImage,
    "python",
    "-c",
    `import teradatasql; teradatasql.connect(host=${JSON.stringify(targetHost)}, user=${JSON.stringify(user)}, password=${JSON.stringify(password)}, logmech="TD2", dbs_port=${JSON.stringify(port)}).close()`,
  ]);
  return probe.status === 0;
}

function resolveTeradataHost() {
  for (const candidate of candidateHosts()) {
    if (teradataReachableAt(candidate)) return candidate;
  }
  return null;
}

function teradataVersion() {
  const result = docker([
    "run",
    "--rm",
    "--network",
    "host",
    clientImage,
    "python",
    "-c",
    `import teradatasql
conn = teradatasql.connect(host=${JSON.stringify(host)}, user=${JSON.stringify(user)}, password=${JSON.stringify(password)}, logmech="TD2", dbs_port=${JSON.stringify(port)})
cur = conn.cursor()
cur.execute("SELECT InfoData FROM DBC.DBCInfoV WHERE InfoKey = 'VERSION'")
print(cur.fetchone()[0])
cur.close()
conn.close()`,
  ]);
  return result.stdout.trim() || "unknown";
}

function runTeradataBatch(queries) {
  const workDir = mkdtempSync(path.join(os.tmpdir(), "sqldesc-teradata-"));
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
    clientImage,
    "python",
    "/tmp/probe.py",
    host,
    port,
    user,
    password,
    "/tmp/queries.json",
  ]);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "teradata probe failed");
  }
  const line = result.stdout
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("["));
  if (!line) {
    throw new Error(`no JSON output from teradata probe:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(line);
}

function printReport(results) {
  const counts = {
    "teradata-match": 0,
    "teradata-mismatch": 0,
    "teradata-error": 0,
  };
  for (const result of results) counts[result.status] += 1;

  console.log("Teradata Docker verification for docs/test/teradata.md");
  console.log(
    `teradata-match=${counts["teradata-match"]}, teradata-mismatch=${counts["teradata-mismatch"]}, ` +
      `teradata-error=${counts["teradata-error"]}`,
  );

  for (const result of results) {
    if (result.status === "teradata-match") continue;
    console.log(`\n[${result.status}] ${result.id} ${result.title}`);
    if (result.error) console.log(`  error: ${result.error}`);
    console.log(`  expected: ${result.expected.join(", ")}`);
    console.log(`  actual: ${result.actual.join(", ")}`);
  }
}

async function main() {
  const skipDocker = process.argv.includes("--skip-docker");
  if (!skipDocker) {
    docker(["rm", "-f", prefix]);
    host = resolveTeradataHost();
    if (!host) {
      const tried = candidateHosts().join(", ");
      throw new Error(
        `Teradata is not reachable at ${tried}:${port}.\n` +
          "Teradata Vantage has no official database Docker image. Import and start Vantage Express with:\n" +
          "  node scripts/setup-vantage-express-vbox.mjs /path/to/VantageExpress.ova\n" +
          "Or set TERADATA_HOST / TERADATA_PORT / TERADATA_USER / TERADATA_PASSWORD.\n" +
          `Client image: ${clientImage}`,
      );
    }
    console.log(`Using ${clientImage} against ${host}:${port} (Teradata ${teradataVersion()})`);
  }

  const build = run("npm", ["run", "build"], { cwd: process.cwd() });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);

  const docTest = run("node", ["scripts/run-doc-test.mjs", "docs/test/teradata.md"], {
    cwd: process.cwd(),
  });
  console.log(docTest.stdout.trim());
  if (docTest.status !== 0) {
    process.stderr.write(docTest.stderr);
    process.exitCode = 1;
    return;
  }

  if (skipDocker) return;

  const doc = await parseTestDocFile(path.resolve("docs/test/teradata.md"));
  const queries = doc.cases
    .filter((testCase) => testCase.then.kind === "columns" && testCase.when.sql)
    .map((testCase) => ({ id: testCase.id, sql: testCase.when.sql }));

  const batch = runTeradataBatch(queries);
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
        status: "teradata-error",
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
        status: "teradata-error",
        expected,
        actual: [],
        error: actualEntry.error,
      });
      continue;
    }
    const actual = (actualEntry.columns ?? []).map((column) => column.name);
    const status =
      actual.length === expected.length && actual.every((name, index) => name === expected[index])
        ? "teradata-match"
        : "teradata-mismatch";
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
    (result) => result.status === "teradata-mismatch" || result.status === "teradata-error",
  );
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
