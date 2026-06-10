import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mkdtemp, writeFile } from 'node:fs/promises';

import { tmpdir } from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { getDialects } from '@polyglot-sql/sdk';
import { main } from '../dist/cli.js';

const root = process.cwd();

type CliResult = {
  code: number;
  stdout: string;
  stderr: string;
};

describe('sqldesc CLI', () => {
  it('prints JSON output for inline SQL and bind types', async () => {
    const result = await runCli(['--sql', 'select coalesce(?, 1) as n', '--binds', 'int', '--json']);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [{ index: 1, name: 'n', type: 'INTEGER' }]);
    assert.partialDeepStrictEqual(json.binds, { mode: 'positional', binds: [{ index: 1, type: 'int' }] });
  });

  it('translates JDBC SQL before describing inline SQL', async () => {
    const result = await runCli([
      '--sql',
      "select {fn UCASE(?)} as label",
      '--binds',
      'text',
      '--dialect',
      'postgres',
      '--jdbc',
      '--json',
    ]);

    assert.strictEqual(result.code, 0, result.stderr);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [{ index: 1, name: 'label', type: 'text' }]);
  });

  it('prints empty strings for dynamic result column names in JSON output', async () => {
    const result = await runCli([
      '--sql',
      'select id, name from users for json path',
      '--dialect',
      'tsql',
      '--json',
    ]);

    assert.strictEqual(result.code, 0, result.stderr);
    const json = JSON.parse(result.stdout);
    assert.deepStrictEqual(json.columns.map((column: Record<string, unknown>) => [column.name, column.type]), [
      ['', 'nvarchar(max)'],
    ]);
  });

  it('prints supported dialects without SQL input', async () => {
    const result = await runCli(['--dialects']);

    assert.strictEqual(result.code, 0);
    assert.deepStrictEqual(result.stdout.trim().split('\n'), getDialects().map(String).toSorted());
    assert.strictEqual(result.stderr, '');
  });

  it('returns a clear error for unsupported dialects', async () => {
    const result = await runCli(['--sql', 'select 1', '--dialect', 'nosuch', '--json']);

    assert.notStrictEqual(result.code, 0);
    assert.match(result.stderr, /Unsupported SQL dialect "nosuch"/);
    assert.match(result.stderr, /sqldesc --dialects/);
  });

  it('prefers a SQL file over inline SQL', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sqldesc-cli-'));
    const sqlFile = path.join(dir, 'query.sql');
    await writeFile(sqlFile, 'select 2 as file_value', 'utf8');

    const result = await runCli([sqlFile, '--sql', 'select 1 as inline_value', '--json']);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns[0], { name: 'file_value', type: 'INTEGER' });
  });

  it('reads SQL from stdin when no file or inline SQL is provided', async () => {
    const result = await runCli(['--json'], 'select 1 as stdin_value');

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns[0], { name: 'stdin_value', type: 'INTEGER' });
  });

  it('loads schema SQL from glob patterns', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sqldesc-cli-schema-'));
    await writeFile(path.join(dir, 'schema.sql'), 'create table users (id int primary key, name text not null);', 'utf8');

    const result = await runCli([
      '--sql',
      'select id, name from users',
      '--schema',
      path.join(dir, '*.sql'),
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [
      { name: 'id', type: 'INTEGER', source: 'users.id' },
      { name: 'name', type: 'VARCHAR(255)', source: 'users.name' },
    ]);
  });

  it('loads raw dialect DDL schema files through the CLI', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sqldesc-cli-oracle-schema-'));
    await writeFile(
      path.join(dir, 'schema.sql'),
      'create global temporary table t(id number, name varchar2(20)) on commit preserve rows;',
      'utf8',
    );

    const result = await runCli([
      '--sql',
      'select id, name from t',
      '--schema',
      path.join(dir, '*.sql'),
      '--dialect',
      'oracle',
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [
      { name: 'id', type: 'number', source: 't.id' },
      { name: 'name', type: 'varchar2(255)', source: 't.name' },
    ]);
    assert.deepStrictEqual(json.warnings, []);
    assert.deepStrictEqual(json.diagnostics, []);
  });

  it('loads user-defined type aliases from schema globs through the CLI', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sqldesc-cli-schema-types-'));
    await writeFile(path.join(dir, '00-types.sql'), [
      'create domain positive_int as int check (value > 0)',
      "create type mood as enum ('sad','ok','happy')",
      'create type pair as (id int, name text)',
    ].join('; '), 'utf8');
    await writeFile(path.join(dir, '10-table.sql'), 'create table t(id positive_int, m mood, p pair);', 'utf8');

    const result = await runCli([
      '--sql',
      'select id, m, p from t',
      '--schema',
      path.join(dir, '*.sql'),
      '--dialect',
      'postgres',
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [
      { name: 'id', type: 'integer', source: 't.id' },
      { name: 'm', type: 'text', source: 't.m' },
      { name: 'p', type: 'struct<id integer, name text>', source: 't.p' },
    ]);
    assert.deepStrictEqual(json.warnings, []);
    assert.deepStrictEqual(json.diagnostics, []);
  });

  it('loads table-valued function schemas through the CLI', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sqldesc-cli-table-functions-'));
    await writeFile(
      path.join(dir, 'functions.sql'),
      "create function people() returns table(id int, name text) language sql as $$ select 1, 'a' $$",
      'utf8',
    );

    const result = await runCli([
      '--sql',
      'select * from people()',
      '--schema',
      path.join(dir, '*.sql'),
      '--dialect',
      'postgres',
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [
      { name: 'id', type: 'integer', source: 'people.id' },
      { name: 'name', type: 'text', source: 'people.name' },
    ]);
    assert.deepStrictEqual(json.warnings, []);
    assert.deepStrictEqual(json.diagnostics, []);
  });

  it('loads scalar function return types through the CLI', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sqldesc-cli-scalar-functions-'));
    await writeFile(
      path.join(dir, 'schema.sql'),
      [
        'create table users (name text)',
        'create function label(x text) returns text language sql as $$ select x $$',
      ].join('; '),
      'utf8',
    );

    const result = await runCli([
      '--sql',
      'select label(name) as value from users',
      '--schema',
      path.join(dir, '*.sql'),
      '--dialect',
      'postgres',
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [
      { name: 'value', type: 'text', source: 'function' },
    ]);
    assert.deepStrictEqual(json.warnings, []);
    assert.deepStrictEqual(json.diagnostics, []);
  });

  it('loads procedure result columns through the CLI', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sqldesc-cli-procedures-'));
    await writeFile(
      path.join(dir, 'schema.sql'),
      [
        'create table users(id int, name text)',
        'create procedure p() begin select id, name from users; end',
      ].join('; '),
      'utf8',
    );

    const result = await runCli([
      '--sql',
      'call p()',
      '--schema',
      path.join(dir, '*.sql'),
      '--dialect',
      'mysql',
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [
      { name: 'id', type: 'int', source: 'cast' },
      { name: 'name', type: 'varchar(255)', source: 'cast' },
    ]);
    assert.deepStrictEqual(json.warnings, []);
    assert.deepStrictEqual(json.diagnostics, []);
  });

  it('uses named bind types for dialect-specific expressions', async () => {
    const result = await runCli([
      '--sql',
      "select iff(:flag, :label, 'x') as label",
      '--binds',
      'flag=boolean,label=text',
      '--dialect',
      'snowflake',
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [{ name: 'label', type: 'VARCHAR(255)' }]);
    assert.partialDeepStrictEqual(json.binds, {
      mode: 'named',
      binds: [
        { name: 'flag', type: 'boolean' },
        { name: 'label', type: 'text' },
      ],
    });
    assert.deepStrictEqual(json.warnings, []);
    assert.deepStrictEqual(json.diagnostics, []);
  });

  it('accepts common dialect aliases through the CLI', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sqldesc-cli-dialect-alias-'));
    await writeFile(path.join(dir, 'schema.sql'), 'create table users(id integer primary key, name text);', 'utf8');

    const result = await runCli([
      '--sql',
      'select rowid from users',
      '--schema',
      path.join(dir, '*.sql'),
      '--dialect',
      'sqlite3',
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [{ name: 'rowid', type: 'integer' }]);
    assert.deepStrictEqual(json.diagnostics, []);
  });

  it('infers column-shaped positional bind placeholders through the CLI', async () => {
    const result = await runCli([
      '--sql',
      'select $1 as v',
      '--binds',
      'integer',
      '--dialect',
      'clickhouse',
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [{ name: 'v', type: 'INTEGER', source: 'bind' }]);
    assert.deepStrictEqual(json.warnings, []);
    assert.deepStrictEqual(json.diagnostics, []);
  });

  it('prints static columns for result-producing DML through the CLI', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sqldesc-cli-dml-'));
    await writeFile(path.join(dir, 'schema.sql'), 'create table users(id int, name text);', 'utf8');

    const result = await runCli([
      '--sql',
      "insert into users(id,name) values (1,'a') returning id, name",
      '--schema',
      path.join(dir, '*.sql'),
      '--dialect',
      'postgres',
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [
      { name: 'id', type: 'integer', source: 'users.id' },
      { name: 'name', type: 'text', source: 'users.name' },
    ]);
    assert.deepStrictEqual(json.warnings, []);
    assert.deepStrictEqual(json.diagnostics, []);
  });

  it('tracks schema-producing DDL in inline SQL through the CLI', async () => {
    const result = await runCli([
      '--sql',
      'create table t(id int, name varchar(20)); select id, name from t',
      '--dialect',
      'postgres',
      '--json',
    ]);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.resultSets.at(-1).columns, [
      { name: 'id', type: 'integer', source: 't.id' },
      { name: 'name', type: 'text', source: 't.name' },
    ]);
    assert.deepStrictEqual(json.warnings, []);
    assert.deepStrictEqual(json.diagnostics, []);
  });

  it('prints multiple result sets in text output', async () => {
    const result = await runCli(['--sql', 'select 1 as one; select 2 as two']);

    assert.strictEqual(result.code, 0);
    assert.match(result.stdout, /Result set 1/);
    assert.match(result.stdout, /one/);
    assert.match(result.stdout, /Result set 2/);
    assert.match(result.stdout, /two/);
  });

  it('prints a text table by default', async () => {
    const result = await runCli(['--sql', 'select 1 as one']);

    assert.strictEqual(result.code, 0);
    assert.match(result.stdout, /^index  name  type\s+nullable  source\s+note$/m);
    assert.match(result.stdout, /^-----  ----  ----/m);
    assert.match(result.stdout, /^1\s+one\s+INTEGER\s+literal$/m);
  });

  it('pads text table columns using the widest cell', async () => {
    const result = await runCli(['--sql', "select 1 as short, 'abcdef' as very_long_column_name"]);

    assert.strictEqual(result.code, 0);
    assert.match(result.stdout, /^index  name\s+type\s+nullable  source\s+note$/m);
    assert.match(result.stdout, /^-----  ---------------------  -------/m);
    assert.match(result.stdout, /^1\s+short\s+INTEGER\s+literal$/m);
    assert.match(result.stdout, /^2\s+very_long_column_name\s+VARCHAR\(255\)\s+literal$/m);
  });

  it('returns structured diagnostics for no-result SQL in JSON output', async () => {
    const result = await runCli(['--sql', 'create table t(id int)', '--dialect', 'postgres', '--json']);

    assert.strictEqual(result.code, 0);
    assert.strictEqual(result.stderr, '');
    const json = JSON.parse(result.stdout);
    assert.deepStrictEqual(json.columns, []);
    assert.deepStrictEqual(json.resultSets, []);
    assert.partialDeepStrictEqual(json.statements, [
      { index: 1, kind: 'create_table', resultKind: 'none' },
    ]);
    assert.partialDeepStrictEqual(json.diagnostics, [
      {
        code: 'SQLDESC_NO_RESULT_COLUMNS',
        severity: 'info',
      },
    ]);
  });

  it('returns structured diagnostics for metadata-dependent SQL in JSON output', async () => {
    const result = await runCli(['--sql', 'describe missing_table; select 1 as one', '--json']);

    assert.strictEqual(result.code, 0);
    assert.strictEqual(result.stderr, '');
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns, [
      { name: 'one', type: 'INTEGER' },
    ]);
    assert.partialDeepStrictEqual(json.statements, [
      { index: 1, kind: 'describe', resultKind: 'metadata' },
      { index: 2, kind: 'select', resultKind: 'static' },
    ]);
    assert.ok(json.diagnostics.some((entry: Record<string, unknown>) => (
      entry.code === 'SQLDESC_METADATA_RESULT_SHAPE' && entry.severity === 'warning'
    )));
  });

  it('prints runtime-dependent result-shape diagnostics in text output', async () => {
    const result = await runCli(['--sql', 'call missing_proc()', '--dialect', 'mysql']);

    assert.strictEqual(result.code, 0);
    assert.match(result.stderr, /warning: SQLDESC_RUNTIME_RESULT_SHAPE: COMMAND parses successfully/);
    assert.strictEqual(
      result.stderr.match(/COMMAND parses successfully, but its result-set shape depends on runtime database behavior\./g)?.length,
      1,
    );
  });

  it('prints metadata-dependent result-shape diagnostics once in text output', async () => {
    const result = await runCli(['--sql', 'describe missing_table; select 1 as one']);

    assert.strictEqual(result.code, 0);
    assert.match(result.stdout, /one/);
    assert.match(result.stderr, /warning: SQLDESC_METADATA_RESULT_SHAPE: DESCRIBE parses successfully/);
    assert.strictEqual(
      result.stderr.match(/DESCRIBE parses successfully, but its result-set shape is dialect-specific metadata and cannot be inferred statically\./g)?.length,
      1,
    );
  });

  it('returns a clear error for mixed bind syntax', async () => {
    const result = await runCli(['--sql', 'select :id as id', '--binds', 'id=int,text', '--json']);

    assert.notStrictEqual(result.code, 0);
    assert.match(result.stderr, /Mixed bind syntax/);
  });
});

function runCli(args: string[], input?: string): Promise<CliResult> {
  const stdin = new PassThrough() as PassThrough & { isTTY?: boolean };
  stdin.isTTY = input === undefined;
  stdin.end(input);
  const stdout = new CaptureStream();
  const stderr = new CaptureStream();

  return main(args, {
    cwd: root,
    stdin: stdin as NodeJS.ReadStream,
    stdout: stdout as unknown as NodeJS.WriteStream,
    stderr: stderr as unknown as NodeJS.WriteStream,
  }).then((code) => ({ code, stdout: stdout.content, stderr: stderr.content }));
}

class CaptureStream {
  content = '';

  write(chunk: string | Uint8Array): boolean {
    this.content += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
    return true;
  }
}
