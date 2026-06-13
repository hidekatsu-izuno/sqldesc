import { execFileSync, spawnSync } from "node:child_process";

const prefix = "sqldesc-type-check";

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

function printSection(name, text) {
  console.log(`\n## ${name}`);
  console.log(text.trim() || "(no output)");
}

function cleanup() {
  for (const name of [`${prefix}-pg`, `${prefix}-mysql`, `${prefix}-mssql`, `${prefix}-oracle`]) {
    docker(["rm", "-f", name]);
  }
}

async function waitUntil(label, attempts, fn) {
  for (let i = 0; i < attempts; i += 1) {
    const result = fn();
    if (result.status === 0) return result;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`${label} did not become ready`);
}

async function verifyPostgres() {
  const name = `${prefix}-pg`;
  docker(["run", "-d", "--name", name, "-e", "POSTGRES_PASSWORD=pass", "postgres:16"]);
  await waitUntil("postgres", 30, () => docker(["exec", name, "pg_isready", "-U", "postgres"]));
  const sql = `
create table users(id integer, name text, age integer, dept text, amount numeric(10,2), data jsonb, created_at timestamp, d date, b bytea, u uuid);
insert into users(id,name,age,dept,amount,data,created_at,d,b,u) values (1,'a',2,'d',3.14,'{}','2020-01-01','2020-01-02','\\\\x00','00000000-0000-0000-0000-000000000000');
select
  pg_typeof(id)::text as id,
  pg_typeof(name)::text as name,
  pg_typeof(amount)::text as amount,
  pg_typeof(data)::text as data,
  pg_typeof(created_at)::text as created_at,
  pg_typeof(d)::text as d,
  pg_typeof(b)::text as b,
  pg_typeof(u)::text as u,
  pg_typeof(count(*))::text as cnt,
  pg_typeof(avg(age))::text as avg_age,
  pg_typeof(upper(name))::text as upper_name
from users group by id,name,amount,data,created_at,d,b,u;
`;
  const result = docker([
    "exec",
    "-i",
    name,
    "psql",
    "-U",
    "postgres",
    "-At",
    "-F",
    ",",
    "-c",
    sql,
  ]);
  printSection("postgres:16", result.stdout || result.stderr);
}

async function verifyMysql() {
  const name = `${prefix}-mysql`;
  docker(["run", "-d", "--name", name, "-e", "MYSQL_ALLOW_EMPTY_PASSWORD=yes", "mysql:8.4"]);
  await waitUntil("mysql", 45, () =>
    docker(["exec", name, "mysqladmin", "ping", "-h127.0.0.1", "-uroot"]),
  );
  const sql = `
create database if not exists sqldesc;
use sqldesc;
drop table if exists users;
create table users(id int, name varchar(20), age int, dept varchar(20), amount decimal(10,2), data json, created_at datetime, d date, b varbinary(20), u char(36));
drop view if exists v_type_probe;
create view v_type_probe as select id, name, amount, data, created_at, d, b, u, count(*) cnt, avg(age) avg_age, upper(name) upper_name from users group by id,name,amount,data,created_at,d,b,u;
select column_name, column_type, data_type from information_schema.columns where table_schema='sqldesc' and table_name='v_type_probe' order by ordinal_position;
`;
  const result = docker(["exec", "-i", name, "mysql", "-h127.0.0.1", "-uroot", "-N", "-B"], {
    input: sql,
  });
  printSection("mysql:8.4", result.stdout || result.stderr);
}

function verifySqlite() {
  const sql = `
create table users(id integer, name text, age integer, dept text, amount real, data text, created_at text, d text, b blob, u text);
create view v_type_probe as select id, name, amount, data, created_at, d, b, u, count(*) cnt, avg(age) avg_age, upper(name) upper_name from users group by id,name,amount,data,created_at,d,b,u;
pragma table_xinfo(v_type_probe);
`;
  const result = docker(["run", "--rm", "-i", "nouchka/sqlite3:latest"], { input: sql });
  printSection("sqlite", result.stdout || result.stderr);
}

function verifyDuckdb() {
  const sql = `
create table users(id integer, name varchar, age integer, dept varchar, amount decimal(10,2), data json, created_at timestamp, d date, b blob, u uuid);
describe select id, name, amount, data, created_at, d, b, u, count(*) cnt, avg(age) avg_age, upper(name) upper_name from users group by id,name,amount,data,created_at,d,b,u;
`;
  const result = docker(["run", "--rm", "-i", "duckdb/duckdb:latest"], { input: sql });
  printSection("duckdb", result.stdout || result.stderr);
}

async function verifySqlServer() {
  const name = `${prefix}-mssql`;
  docker([
    "run",
    "-d",
    "--name",
    name,
    "-e",
    "ACCEPT_EULA=Y",
    "-e",
    "MSSQL_SA_PASSWORD=Str0ngPass!234",
    "mcr.microsoft.com/mssql/server:2022-latest",
  ]);
  await waitUntil("sqlserver", 45, () =>
    docker([
      "exec",
      name,
      "/opt/mssql-tools18/bin/sqlcmd",
      "-S",
      "localhost",
      "-U",
      "sa",
      "-P",
      "Str0ngPass!234",
      "-C",
      "-Q",
      "select 1",
    ]),
  );
  const sql = `
set nocount on;
drop table if exists dbo.users;
create table dbo.users(id int, name nvarchar(max), age int, dept nvarchar(max), amount decimal(10,2), data nvarchar(max), created_at datetime2, d date, b varbinary(max), u uniqueidentifier);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(N'select id, name, amount, data, created_at, d, b, u, count(*) cnt, avg(age) avg_age, upper(name) upper_name from dbo.users group by id,name,amount,data,created_at,d,b,u', null, 0);
`;
  const result = docker(
    [
      "exec",
      "-i",
      name,
      "/opt/mssql-tools18/bin/sqlcmd",
      "-S",
      "localhost",
      "-U",
      "sa",
      "-P",
      "Str0ngPass!234",
      "-C",
      "-W",
      "-h",
      "-1",
    ],
    { input: sql },
  );
  printSection("mssql/server:2022-latest", result.stdout || result.stderr);
}

async function verifyOracle() {
  const name = `${prefix}-oracle`;
  docker(["run", "-d", "--name", name, "-e", "ORACLE_PASSWORD=pass", "gvenzl/oracle-xe:21-slim"]);
  await waitUntil("oracle", 90, () => docker(["exec", name, "healthcheck.sh"]));
  const setup = `
whenever sqlerror continue
drop user sqldesc cascade;
whenever sqlerror exit sql.sqlcode
create user sqldesc identified by pass quota unlimited on users;
grant connect, resource to sqldesc;
grant create view to sqldesc;
exit
`;
  docker(["exec", "-i", name, "sqlplus", "-s", "system/pass@//localhost/XEPDB1"], { input: setup });
  const sql = `
set heading off feedback off pagesize 200 linesize 200 trimspool on
create table users(id number(10), name varchar2(255), age number(10), dept varchar2(255), amount number(10,2), data json, created_at timestamp, d date, b raw(255), u raw(16));
create or replace view v_type_probe as select id, name, amount, data, created_at, d, b, u from users;
create or replace view v_expr_probe as select count(*) cnt, avg(age) avg_age, upper(name) upper_name from users group by name;
select table_name || '.' || column_name || ',' || data_type || case when data_type in ('VARCHAR2','RAW') then '(' || data_length || ')' when data_type = 'NUMBER' and data_precision is not null then '(' || data_precision || case when data_scale is not null then ',' || data_scale end || ')' else '' end from user_tab_columns where table_name in ('V_TYPE_PROBE','V_EXPR_PROBE') order by table_name, column_id;
exit
`;
  const result = docker(["exec", "-i", name, "sqlplus", "-s", "sqldesc/pass@//localhost/XEPDB1"], {
    input: sql,
  });
  printSection("oracle-xe:21-slim", result.stdout || result.stderr);
}

cleanup();
try {
  verifySqlite();
  verifyDuckdb();
  await verifyPostgres();
  await verifyMysql();
  await verifySqlServer();
  await verifyOracle();
} finally {
  cleanup();
}
