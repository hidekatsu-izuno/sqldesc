import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mkdtemp, writeFile } from 'node:fs/promises';

import { tmpdir } from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
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
    assert.partialDeepStrictEqual(json.columns, [{ index: 1, name: 'n', type: 'integer' }]);
    assert.partialDeepStrictEqual(json.binds, { mode: 'positional', binds: [{ index: 1, type: 'int' }] });
  });

  it('prefers a SQL file over inline SQL', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sqldesc-cli-'));
    const sqlFile = path.join(dir, 'query.sql');
    await writeFile(sqlFile, 'select 2 as file_value', 'utf8');

    const result = await runCli([sqlFile, '--sql', 'select 1 as inline_value', '--json']);

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns[0], { name: 'file_value', type: 'integer' });
  });

  it('reads SQL from stdin when no file or inline SQL is provided', async () => {
    const result = await runCli(['--json'], 'select 1 as stdin_value');

    assert.strictEqual(result.code, 0);
    const json = JSON.parse(result.stdout);
    assert.partialDeepStrictEqual(json.columns[0], { name: 'stdin_value', type: 'integer' });
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
      { name: 'id', type: 'integer', source: 'users.id' },
      { name: 'name', type: 'text', source: 'users.name' },
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
      { name: 'id', type: 'decimal', source: 't.id' },
      { name: 'name', type: 'text', source: 't.name' },
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
    assert.partialDeepStrictEqual(json.columns, [{ name: 'label', type: 'text' }]);
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

  it('prints a text table by default', async () => {
    const result = await runCli(['--sql', 'select 1 as one']);

    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.includes('one'));
    assert.ok(result.stdout.includes('integer'));
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
