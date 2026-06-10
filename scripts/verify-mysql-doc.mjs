#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { parseTestDocFile } from '../dist/doc-test/parser.js';

const DOC = 'docs/test/mysql.md';
const CONTAINER = process.env.MYSQL_CONTAINER ?? 'sqldesc-mysql';
const PASSWORD = process.env.MYSQL_ROOT_PASSWORD ?? 'sqldesc_test';
const DB = process.env.MYSQL_DATABASE ?? 'sqldesc';

const PREPARE1_DDL = `
DROP TABLE IF EXISTS orders, users, active_users, departments, documents;
DROP VIEW IF EXISTS active;
DROP TABLE IF EXISTS backup_users, backup;
DROP PROCEDURE IF EXISTS p;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT, dept VARCHAR(50), data JSON, tags JSON,
  created_at DATETIME, d DATE,
  status ENUM('active', 'inactive') DEFAULT 'active'
);
CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL, amount DECIMAL(10, 2) NOT NULL
);
CREATE TABLE active_users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL
);
CREATE TABLE departments (dept VARCHAR(50) PRIMARY KEY, budget INT NOT NULL);
CREATE TABLE documents (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200), body TEXT,
  FULLTEXT KEY ft_body (body)
);
INSERT INTO users (name, age, dept, data, tags, created_at, d)
VALUES ('alice', 30, 'eng', JSON_OBJECT('name','alice','items',JSON_ARRAY(JSON_OBJECT('n','x'))), JSON_ARRAY('a'), NOW(), '2024-01-01'),
       ('bob', 17, 'eng', JSON_OBJECT('name','bob'), JSON_ARRAY('b'), NOW(), '2024-01-02');
INSERT INTO orders (user_id, amount) VALUES (1, 100.50), (1, 200.00);
INSERT INTO active_users (name) VALUES ('carol');
INSERT INTO departments (dept, budget) VALUES ('eng', 1000);
INSERT INTO documents (title, body) VALUES ('doc', 'mysql database tutorial');
`;

const PREPARE3_DDL = `
CREATE DATABASE IF NOT EXISTS mydb;
DROP TABLE IF EXISTS mydb.users;
CREATE TABLE mydb.users (id INT NOT NULL, name VARCHAR(100) NOT NULL, age INT, dept VARCHAR(50));
`;

const CLEANUP_NONE = `
DROP PROCEDURE IF EXISTS p;
DROP TABLE IF EXISTS t;
DROP TEMPORARY TABLE IF EXISTS tmp_ids;
`;

function mysql(sql, { allowInterrupted = false } = {}) {
  try {
    execFileSync('docker', [
      'exec', '-i', CONTAINER, 'mysql', '-uroot', `-p${PASSWORD}`, '--batch', DB,
    ], { encoding: 'utf8', input: sql, stdio: ['pipe', 'pipe', 'pipe'] });
    return { ok: true, stderr: '' };
  } catch (error) {
    const stderr = error.stderr?.toString?.() ?? error.message;
    if (allowInterrupted && /ERROR 1317/.test(stderr)) return { ok: true, stderr };
    return { ok: false, stderr };
  }
}

function wrapProcedureSql(sql) {
  if (!/CREATE\s+PROCEDURE/i.test(sql)) return sql;
  const body = sql.replace(/;\s*CALL\s+/i, ';;\nCALL ');
  return `DELIMITER //\n${body}//\nDELIMITER ;\n`;
}

function substituteBinds(sql) {
  return sql.replace(/\?/g, "'test'");
}

function splitStatements(sql) {
  return sql.split(';').map((s) => s.trim()).filter(Boolean);
}

async function main() {
  const doc = await parseTestDocFile(DOC);
  const failures = [];
  let passed = 0;

  for (const testCase of doc.cases) {
    if (testCase.when.kind !== 'sql' || !testCase.when.sql) continue;

    const sqlRaw = substituteBinds(testCase.when.sql);
    const statements = splitStatements(sqlRaw);
    const parts = [];

    if (!testCase.given.prepare?.length) parts.push(CLEANUP_NONE);
    if (testCase.given.prepare?.includes('Prepare-1')) parts.push(PREPARE1_DDL);
    if (testCase.given.prepare?.includes('Prepare-2') || testCase.given.prepare?.includes('Prepare-3')) {
      parts.push(PREPARE3_DDL);
    }

    if (testCase.then.kind === 'error') {
      parts.push(sqlRaw);
      const result = mysql(parts.join('\n'));
      if (result.ok) failures.push({ id: testCase.id, title: testCase.title, error: 'expected syntax error' });
      else passed += 1;
      continue;
    }

    if (testCase.then.target === 'last' && statements.length > 1) {
      parts.push(`${statements.slice(0, -1).join(';\n')};`);
      parts.push(`${statements[statements.length - 1]};`);
    } else {
      parts.push(sqlRaw.endsWith(';') ? sqlRaw : `${sqlRaw};`);
    }

    const execSql = wrapProcedureSql(parts.join('\n'));
    const result = mysql(execSql, { allowInterrupted: /KILL\s+CONNECTION/i.test(sqlRaw) });
    if (!result.ok) {
      const err = result.stderr.match(/ERROR \d+ \([^)]+\): ([^\n]+)/)?.[1] ?? result.stderr.trim();
      failures.push({ id: testCase.id, title: testCase.title, error: err, sql: sqlRaw.slice(0, 200) });
    } else {
      passed += 1;
    }
  }

  console.log(`MySQL verification: ${passed} passed, ${failures.length} failed / ${doc.cases.length} cases`);
  for (const f of failures) {
    console.error(`FAIL [${f.id}] ${f.title}`);
    console.error(`  ${f.error}`);
    if (f.sql) console.error(`  SQL: ${f.sql}`);
  }
  process.exitCode = failures.length > 0 ? 1 : 0;
}

main();
