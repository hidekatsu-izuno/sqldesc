#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { runTestDocFile, runTestDocFiles } from '../dist/doc-test/index.js';

function usage() {
  process.stderr.write(`Usage: run-doc-test.mjs [options] [file.md ...]

Run sqldesc-test/v1 markdown test cases directly from .md files.

Options:
  --all           Run all docs/test/*.md (default when no files given)
  -h, --help      Show this help

Examples:
  node scripts/run-doc-test.mjs docs/test/postgresql.md
  node scripts/run-doc-test.mjs docs/test/sqlite.md docs/test/postgresql.md
  npm run test:doc:file -- docs/test/postgresql.md
`);
}

async function defaultDocFiles() {
  const dir = path.resolve('docs/test');
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

async function main(argv = process.argv.slice(2)) {
  if (argv.includes('-h') || argv.includes('--help')) {
    usage();
    return 0;
  }

  const runAll = argv.includes('--all');
  const files = argv.filter((arg) => !arg.startsWith('-'));

  const targets = files.length > 0
    ? files.map((file) => path.resolve(file))
    : runAll || argv.length === 0
      ? await defaultDocFiles()
      : [];

  if (targets.length === 0) {
    process.stderr.write('No markdown files to test.\n');
    usage();
    return 1;
  }

  const reports = await runTestDocFiles(targets);
  let hasVerifiedFailure = false;

  for (const report of reports) {
    const rel = path.relative(process.cwd(), report.filePath) || report.filePath;
    process.stdout.write(
      `${rel}: ${report.passed} passed, ${report.failed} failed, `
      + `${report.skipped} skipped, ${report.verified} verified / ${report.total}\n`,
    );

    if (report.verifiedFailures.length > 0) {
      hasVerifiedFailure = true;
      for (const failure of report.verifiedFailures) {
        process.stderr.write(`  FAIL ${failure.caseId}: ${failure.message}\n`);
      }
    } else if (report.failures.length > 0) {
      for (const failure of report.failures.slice(0, 5)) {
        process.stdout.write(`  note ${failure.caseId}: ${failure.message}\n`);
      }
    }
  }

  return hasVerifiedFailure ? 1 : 0;
}

process.exitCode = await main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  return 1;
});
