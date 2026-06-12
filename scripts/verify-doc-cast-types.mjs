import { spawnSync } from 'node:child_process';

const prefix = 'sqldesc-doc-cast';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function docker(args, options) {
  return run('docker', args, options);
}

function printSection(name, result) {
  console.log(`\n## ${name}`);
  console.log((result.stdout || result.stderr).trim() || '(no output)');
  if (result.status !== 0) {
    throw new Error(`${name} failed`);
  }
}

function cleanup() {
  for (const name of [
    `${prefix}-pg`,
    `${prefix}-mysql`,
    `${prefix}-mssql`,
    `${prefix}-oracle`,
  ]) {
    docker(['rm', '-f', name]);
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

function verifySqlite() {
  const sql = `
select
  typeof(cast('1' as integer)) as i,
  typeof(cast('1.5' as numeric)) as n,
  typeof(cast(1 as text)) as t,
  typeof(cast('abc' as blob)) as b;
`;
  printSection('sqlite cast runtime types', docker(['run', '--rm', '-i', 'nouchka/sqlite3:latest'], { input: sql }));
}

function verifyDuckdb() {
  const sql = `
describe select
  cast('x' as varchar) as v,
  cast(1.23 as decimal(8,2)) as d,
  cast('2020-01-01 00:00:00' as timestamp) as ts,
  cast('00000000-0000-0000-0000-000000000000' as uuid) as u,
  cast('abc' as blob) as b;
`;
  printSection('duckdb cast metadata', docker(['run', '--rm', '-i', 'duckdb/duckdb:latest'], { input: sql }));
}

async function verifyPostgres() {
  const name = `${prefix}-pg`;
  docker(['run', '-d', '--name', name, '-e', 'POSTGRES_PASSWORD=pass', 'postgres:16']);
  await waitUntil('postgres', 30, () => docker(['exec', name, 'pg_isready', '-U', 'postgres']));
  const sql = `
drop view if exists v_cast_probe;
create view v_cast_probe as select
  cast('x' as varchar(12)) as v12,
  cast(1.23 as numeric(8,2)) as n82,
  cast('2020-01-01 00:00:00' as timestamp(3)) as ts3,
  cast('2020-01-01 00:00:00+00' as timestamptz) as tstz;
select column_name, data_type, character_maximum_length, numeric_precision, numeric_scale, datetime_precision
from information_schema.columns
where table_name = 'v_cast_probe'
order by ordinal_position;
`;
  printSection('postgres cast metadata', docker(['exec', '-i', name, 'psql', '-U', 'postgres', '-At', '-F', '|', '-c', sql]));
}

async function verifyMysql() {
  const name = `${prefix}-mysql`;
  docker(['run', '-d', '--name', name, '-e', 'MYSQL_ALLOW_EMPTY_PASSWORD=yes', 'mysql:8.4']);
  await waitUntil('mysql', 45, () => docker(['exec', name, 'mysqladmin', 'ping', '-h127.0.0.1', '-uroot']));
  const sql = `
create database if not exists sqldesc;
use sqldesc;
drop view if exists v_cast_probe;
create view v_cast_probe as select
  cast('x' as char(12)) as c12,
  cast(1.23 as decimal(8,2)) as d82,
  cast('2020-01-01 00:00:00.123' as datetime(3)) as dt3,
  cast('ab' as binary(4)) as b4;
select column_name, column_type, data_type, character_maximum_length, numeric_precision, numeric_scale, datetime_precision
from information_schema.columns
where table_schema = 'sqldesc' and table_name = 'v_cast_probe'
order by ordinal_position;
`;
  printSection('mysql cast metadata', docker(['exec', '-i', name, 'mysql', '-h127.0.0.1', '-uroot', '-N', '-B'], { input: sql }));
}

async function verifySqlServer() {
  const name = `${prefix}-mssql`;
  docker(['run', '-d', '--name', name, '-e', 'ACCEPT_EULA=Y', '-e', 'MSSQL_SA_PASSWORD=Str0ngPass!234', 'mcr.microsoft.com/mssql/server:2022-latest']);
  await waitUntil('sqlserver', 45, () => docker(['exec', name, '/opt/mssql-tools18/bin/sqlcmd', '-S', 'localhost', '-U', 'sa', '-P', 'Str0ngPass!234', '-C', '-Q', 'select 1']));
  const sql = `
set nocount on;
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(N''x'' as nvarchar(12)) as n12, cast(1.23 as decimal(8,2)) as d82, cast(''2020-01-01T00:00:00.123'' as datetime2(3)) as dt3, convert(varbinary(4), 171) as b4',
  null,
  0
);
`;
  printSection('sqlserver cast metadata', docker(['exec', '-i', name, '/opt/mssql-tools18/bin/sqlcmd', '-S', 'localhost', '-U', 'sa', '-P', 'Str0ngPass!234', '-C', '-W', '-h', '-1'], { input: sql }));
}

async function verifyOracle() {
  const name = `${prefix}-oracle`;
  docker(['run', '-d', '--name', name, '-e', 'ORACLE_PASSWORD=pass', 'gvenzl/oracle-xe:21-slim']);
  await waitUntil('oracle', 90, () => docker(['exec', name, 'healthcheck.sh']));
  const setup = `
whenever sqlerror continue
drop user sqldesc cascade;
whenever sqlerror exit sql.sqlcode
create user sqldesc identified by pass quota unlimited on users;
grant connect, resource to sqldesc;
grant create view to sqldesc;
exit
`;
  docker(['exec', '-i', name, 'sqlplus', '-s', 'system/pass@//localhost/XEPDB1'], { input: setup });
  const sql = `
set heading off feedback off pagesize 200 linesize 200 trimspool on
create or replace view v_cast_probe as select
  cast('x' as varchar2(12)) v12,
  cast(1.23 as number(8,2)) n82,
  cast(timestamp '2020-01-01 00:00:00.123' as timestamp(3)) ts3,
  cast(hextoraw('AB') as raw(4)) r4
from dual;
select column_name || '|' || data_type || '|' || data_length || '|' || data_precision || '|' || data_scale
from user_tab_columns
where table_name = 'V_CAST_PROBE'
order by column_id;
exit
`;
  printSection('oracle cast metadata', docker(['exec', '-i', name, 'sqlplus', '-s', 'sqldesc/pass@//localhost/XEPDB1'], { input: sql }));
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
