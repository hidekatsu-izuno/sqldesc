#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { Command } from 'commander';
import { table } from 'table';
import { describeQuery } from './describe.js';

type CliIo = {
  cwd: string;
  stdin: NodeJS.ReadStream;
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.WriteStream;
};

export async function main(argv = process.argv.slice(2), io: CliIo = {
  cwd: process.cwd(),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
}): Promise<number> {
  const program = createProgram();
  program.configureOutput({
    writeOut: (text) => {
      io.stdout.write(text);
    },
    writeErr: (text) => {
      io.stderr.write(text);
    },
  });
  program.exitOverride();

  try {
    program.parse(argv, { from: 'user' });
  } catch (error) {
    if (error instanceof Error) {
      io.stderr.write(`${error.message}\n`);
    } else {
      io.stderr.write(`${String(error)}\n`);
    }
    return 1;
  }

  const options = program.opts<{
    sql?: string;
    schema?: string[];
    binds?: string;
    dialect: string;
    json?: boolean;
  }>();
  const [file] = program.args;

  try {
    const sql = await readSql(file, options.sql, io.stdin);
    const result = await describeQuery({
      sql,
      dialect: options.dialect,
      binds: options.binds,
      schemaPatterns: options.schema,
      cwd: io.cwd,
    });

    if (options.json) {
      io.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      io.stdout.write(`${formatResultSets(result.resultSets)}\n`);
      for (const warning of result.warnings) {
        io.stderr.write(`warning: ${warning}\n`);
      }
      for (const diagnostic of result.diagnostics) {
        const prefix = diagnostic.severity ?? 'diagnostic';
        io.stderr.write(`${prefix}: ${diagnostic.code ? `${diagnostic.code}: ` : ''}${diagnostic.message}\n`);
      }
    }
    return 0;
  } catch (error) {
    io.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

function createProgram(): Command {
  return new Command()
    .name('sqldesc')
    .description('Infer SQL result-set columns from SQL, bind types, and schema files.')
    .argument('[file]', 'SQL file to describe')
    .option('--sql <sql>', 'SQL text to describe')
    .option('--schema <pattern...>', 'Schema SQL glob pattern(s)')
    .option('--binds <spec>', 'Bind types, e.g. "int,text" or "id=int,name=text"')
    .option('--dialect <dialect>', 'SQL dialect', 'generic')
    .option('--json', 'Print JSON output');
}

async function readSql(file?: string, inlineSql?: string, stdin: NodeJS.ReadStream = process.stdin): Promise<string> {
  if (file) return readFile(file, 'utf8');
  if (inlineSql) return inlineSql;
  if (!stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of stdin) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf8');
  }
  throw new Error('No SQL input. Provide a file, --sql, or stdin.');
}

function formatResultSets(resultSets: Array<{ index: number; columns: Array<{ index: number; name: string; type: string; nullable?: boolean; confidence: string; source?: string; note?: string }> }>): string {
  if (resultSets.length === 0) {
    return formatTable([]);
  }
  if (resultSets.length === 1) {
    return formatTable(resultSets[0].columns);
  }
  return resultSets.map((resultSet) => `Result set ${resultSet.index}\n${formatTable(resultSet.columns)}`).join('\n');
}

function formatTable(columns: Array<{ index: number; name: string; type: string; nullable?: boolean; confidence: string; source?: string; note?: string }>): string {
  return table([
    ['index', 'name', 'type', 'nullable', 'confidence', 'source', 'note'],
    ...columns.map((column) => [
      String(column.index),
      column.name,
      column.type,
      column.nullable === undefined ? '' : String(column.nullable),
      column.confidence,
      column.source ?? '',
      column.note ?? '',
    ]),
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await main();
}
