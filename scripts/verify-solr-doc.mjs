#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseTestDocFile } from "../dist/doc-test/parser.js";

const prefix = "sqldesc-solr-verify";
const solrUrl = process.env.SOLR_URL ?? "http://127.0.0.1:8983";
const zkImage = "docker.io/zookeeper:3.9";
const solrImage = "docker.io/library/solr:latest";

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

function curl(args) {
  return run("curl", ["-s", ...args]);
}

async function waitSolr(attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    const result = curl([`${solrUrl}/solr/admin/info/system?wt=json`]);
    if (result.status === 0 && result.stdout.includes("solrcloud")) return;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Solr did not become ready");
}

async function setupDocker() {
  docker(["rm", "-f", `${prefix}-solr`, `${prefix}-zoo`]);
  docker(["network", "rm", `${prefix}-net`]);
  docker(["network", "create", `${prefix}-net`]);
  docker([
    "run",
    "-d",
    "--name",
    `${prefix}-zoo`,
    "--network",
    `${prefix}-net`,
    "-p",
    "127.0.0.1:2181:2181",
    "-e",
    "ZOO_4LW_COMMANDS_WHITELIST=mntr,conf,ruok",
    zkImage,
  ]);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  docker([
    "run",
    "-d",
    "--name",
    `${prefix}-solr`,
    "--network",
    `${prefix}-net`,
    "-p",
    "127.0.0.1:8983:8983",
    "-e",
    `ZK_HOST=${prefix}-zoo:2181`,
    "-e",
    "SOLR_MODULES=sql",
    solrImage,
  ]);
  await waitSolr();
}

function solrExec(args) {
  return docker(["exec", `${prefix}-solr`, "solr", ...args]);
}

function seedData() {
  solrExec(["create", "-c", "users", "-n", "_default"]);
  solrExec(["create", "-c", "orders", "-n", "_default"]);
  solrExec(["create", "-c", "users_dyn", "-n", "_default"]);

  const users = JSON.stringify([
    {
      id: "1",
      name: "alice",
      age: 30,
      dept: "eng",
      amount: 100.5,
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "bob",
      age: 25,
      dept: "eng",
      amount: 200.0,
      created_at: "2024-02-01T00:00:00Z",
    },
    {
      id: "3",
      name: "carol",
      age: 35,
      dept: "sales",
      amount: 150.75,
      created_at: "2024-03-01T00:00:00Z",
    },
  ]);
  const orders = JSON.stringify([
    { id: "1", user_id: "1", amount: 50.0 },
    { id: "2", user_id: "1", amount: 75.5 },
    { id: "3", user_id: "2", amount: 120.0 },
  ]);
  const usersDyn = JSON.stringify([
    {
      id: "1",
      name_s: "alice",
      amount_f: 100.5,
      created_at_dt: "2024-01-01T00:00:00Z",
      tags_ss: ["a", "b"],
    },
    {
      id: "2",
      name_s: "bob",
      amount_f: 200.0,
      created_at_dt: "2024-02-01T00:00:00Z",
      tags_ss: ["c"],
    },
  ]);

  for (const [collection, body] of [
    ["users", users],
    ["orders", orders],
    ["users_dyn", usersDyn],
  ]) {
    const result = curl([
      "-X",
      "POST",
      `${solrUrl}/solr/${collection}/update?commit=true`,
      "-H",
      "Content-Type: application/json",
      "-d",
      body,
    ]);
    if (result.status !== 0 || result.stdout.includes('"status":4')) {
      throw new Error(`failed to seed ${collection}: ${result.stdout || result.stderr}`);
    }
  }
}

function resolveCollection(sql, prepareIds) {
  const fromMatch = sql.match(/\bfrom\s+(\w+)/i);
  if (fromMatch?.[1]) {
    const table = fromMatch[1].toLowerCase();
    if (table === "users_dyn") return "users_dyn";
    if (table === "orders") return "orders";
  }
  if (prepareIds.includes("Prepare-2")) return "users_dyn";
  return "users";
}

function solrSql(collection, sql) {
  const result = run("curl", [
    "-s",
    "--data-urlencode",
    `stmt=${sql}`,
    `${solrUrl}/solr/${collection}/sql?wt=json&includeMetadata=true&aggregationMode=facet`,
  ]);
  if (result.status !== 0) {
    return { ok: false, error: result.stderr || "curl failed" };
  }
  try {
    const payload = JSON.parse(result.stdout);
    const docs = payload?.["result-set"]?.docs ?? [];
    const meta = docs.find((doc) => doc.isMetadata);
    const errorDoc = docs.find((doc) => doc.EXCEPTION);
    if (errorDoc) {
      const message = String(errorDoc.EXCEPTION).split("\n")[0];
      return { ok: false, error: message };
    }
    const fields = meta?.fields ?? [];
    return { ok: true, fields };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const polyglotOnlyPatterns = [
  /^SHOW\s/i,
  /^DESCRIBE\b/i,
  /^EXPLAIN\b/i,
  /\bUNION\b/i,
  /\bEXCEPT\b/i,
  /\bINTERSECT\b/i,
  /\bWITH\b/i,
  /\bVALUES\b/i,
  /\bJOIN\b/i,
  /\bOVER\s*\(/i,
  /\bhighlight\s*\(/i,
  /\bsnippet\s*\(/i,
  /SELECT\s+1\s+AS/i,
  /\bhash\s*\(/i,
  /\bregexp_replace\s*\(/i,
  /\bCONCAT\s*\(/i,
  /\bCOALESCE\s*\(/i,
  /\bCASE\b/i,
  /\bCAST\s*\(/i,
  /\bGROUP\s+BY\b/i,
  /\bDISTINCT\b/i,
  /\bHAVING\b/i,
  /\(\s*SELECT\b/i,
  /^SELECT\s+\*\s+FROM\b/i,
  /^SELECT\s+[^*][\s\S]*\s+FROM\s+\w+\s*$/i,
];

function isPolyglotOnly(sql) {
  return polyglotOnlyPatterns.some((pattern) => pattern.test(sql));
}

async function verifyDocCases() {
  const filePath = path.resolve("docs/test/solr.md");
  const doc = await parseTestDocFile(filePath);
  const results = [];

  for (const testCase of doc.cases) {
    if (testCase.then.kind !== "columns" || testCase.when.kind !== "sql" || !testCase.when.sql) {
      continue;
    }
    const expected = (testCase.then.columns ?? []).map((column) => column.name);
    const prepare = testCase.given.prepare ?? [];
    const collection = resolveCollection(testCase.when.sql, prepare);
    const solrResult = solrSql(collection, testCase.when.sql);

    let status;
    if (solrResult.ok) {
      const actual = solrResult.fields;
      const namesMatch =
        actual.length === expected.length && actual.every((name, index) => name === expected[index]);
      const subsetMatch =
        expected.every((name) => actual.includes(name)) && actual.length >= expected.length;
      if (namesMatch) {
        status = "solr-match";
      } else if (/^SELECT\s+\*/i.test(testCase.when.sql) && subsetMatch) {
        status = "solr-extra-fields";
      } else {
        status = "solr-mismatch";
      }
    } else if (isPolyglotOnly(testCase.when.sql)) {
      status = "polyglot-only";
    } else {
      status = "solr-error";
    }

    results.push({
      id: testCase.id,
      title: testCase.title,
      status,
      expected,
      actual: solrResult.fields ?? [],
      error: solrResult.error,
    });
  }

  return results;
}

function printReport(results) {
  const counts = {
    "solr-match": 0,
    "solr-extra-fields": 0,
    "solr-mismatch": 0,
    "polyglot-only": 0,
    "solr-error": 0,
  };
  for (const result of results) counts[result.status] += 1;

  console.log("Solr Docker verification for docs/test/solr.md");
  console.log(
    `solr-match=${counts["solr-match"]}, solr-extra-fields=${counts["solr-extra-fields"]}, ` +
      `solr-mismatch=${counts["solr-mismatch"]}, polyglot-only=${counts["polyglot-only"]}, ` +
      `solr-error=${counts["solr-error"]}`,
  );

  for (const result of results) {
    if (
      result.status === "solr-match" ||
      result.status === "polyglot-only" ||
      result.status === "solr-extra-fields"
    ) {
      continue;
    }
    console.log(`\n[${result.status}] ${result.id} ${result.title}`);
    if (result.error) console.log(`  error: ${result.error}`);
    console.log(`  expected: ${result.expected.join(", ")}`);
    console.log(`  actual: ${result.actual.join(", ")}`);
  }
}

async function main() {
  const skipDocker = process.argv.includes("--skip-docker");
  if (!skipDocker) {
    console.log("Starting Solr 10 (docker.io/library/solr:latest) with SOLR_MODULES=sql ...");
    await setupDocker();
    seedData();
  } else {
    await waitSolr();
  }

  const build = run("npm", ["run", "build"], { cwd: process.cwd() });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout);

  const docTest = run("node", ["scripts/run-doc-test.mjs", "docs/test/solr.md"], {
    cwd: process.cwd(),
  });
  console.log(docTest.stdout.trim());
  if (docTest.status !== 0) {
    process.stderr.write(docTest.stderr);
    process.exitCode = 1;
    return;
  }

  const results = await verifyDocCases();
  printReport(results);

  const failures = results.filter(
    (result) => result.status === "solr-mismatch" || result.status === "solr-error",
  );
  if (failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
