#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import Table from 'easy-table';
import { describeQuery } from './describe.js';
import { resolveSchemaGlobPatterns } from './schema.js';

type CliIo = {
  cwd: string;
  stdin: NodeJS.ReadStream;
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.WriteStream;
};

const CLI_OPTIONS = {
  sql: { type: 'string' as const },
  schema: { type: 'string' as const, multiple: true },
  binds: { type: 'string' as const },
  dialect: { type: 'string' as const, default: 'generic' },
  json: { type: 'boolean' as const },
  help: { type: 'boolean' as const, short: 'h' },
};

type ParsedCliOptions = {
  sql?: string;
  schema?: string[];
  binds?: string;
  dialect: string;
  json?: boolean;
  help?: boolean;
};

export async function main(argv = process.argv.slice(2), io: CliIo = {
  cwd: process.cwd(),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
}): Promise<number> {
  let values: ParsedCliOptions;
  let file: string | undefined;
  try {
    const parsed = parseArgs({
      args: argv,
      options: CLI_OPTIONS,
      allowPositionals: true,
    });
    values = {
      ...parsed.values,
      schema: schemaPatternsFromOption(parsed.values.schema),
    };
    file = parsed.positionals[0];
  } catch (error) {
    if (error instanceof Error) {
      io.stderr.write(`${error.message}\n`);
    } else {
      io.stderr.write(`${String(error)}\n`);
    }
    return 1;
  }

  if (values.help) {
    io.stdout.write(formatUsage());
    return 0;
  }

  try {
    const sql = await readSql(file, values.sql, io.stdin);
    const schemaFiles = values.schema?.length
      ? await resolveSchemaGlobPatterns(values.schema, io.cwd)
      : undefined;
    const result = await describeQuery({
      sql,
      dialect: values.dialect,
      binds: values.binds,
      schemaFiles,
      cwd: io.cwd,
    });

    if (values.json) {
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

function schemaPatternsFromOption(schema: string | string[] | undefined): string[] | undefined {
  if (schema === undefined) return undefined;
  return Array.isArray(schema) ? schema : [schema];
}

function formatUsage(): string {
  return `Usage: sqldesc [options] [file]

Infer SQL result-set columns from SQL, bind types, and schema files.

Arguments:
  file                  SQL file to describe

Options:
  --sql <sql>           SQL text to describe
  --schema <pattern>    Schema SQL glob pattern (repeatable)
  --binds <spec>        Bind types, e.g. "int,text" or "id=int,name=text"
  --dialect <dialect>   SQL dialect (default: "generic")
  --json                Print JSON output
  -h, --help            Show this help message
`;
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
  return Table.print(columns.map((column) => ({
    index: String(column.index),
    name: column.name,
    type: column.type,
    nullable: column.nullable === undefined ? '' : String(column.nullable),
    confidence: column.confidence,
    source: column.source ?? '',
    note: column.note ?? '',
  })));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await main();
}
