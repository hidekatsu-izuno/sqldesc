# sqldesc

Infer SQL result-set columns from SQL text, bind variable types, and optional
schema SQL files.

`sqldesc` is both a command-line tool and a TypeScript library. It uses
`@polyglot-sql/sdk` for SQL parsing, type annotation, and schema-aware
validation, then combines that with schema metadata for practical result column
descriptions.

The package accepts every dialect name exposed by `@polyglot-sql/sdk` and keeps
a representative cross-dialect coverage suite for SQL that Polyglot can parse.
When a result shape is inherently runtime dependent, `sqldesc` reports that
state explicitly instead of rejecting the SQL.

## Demo

A browser demo is published at [https://hidekatsu-izuno.github.io/sqldesc/](https://hidekatsu-izuno.github.io/sqldesc/).
It runs `sqldesc` in the browser via WebAssembly and lets you try SQL, bind
types, optional schema DDL, and JDBC mode without installing anything.

## Install

```sh
npm install
npm run build
```

## CLI

```sh
sqldesc query.sql --schema "schemas/**/*.sql" --binds "int,text"
sqldesc query.sql --schema "schemas/**/*.sql" --binds "id=int,name=text" --json
sqldesc --sql "select id from users where name = ?" --binds "text"
```

SQL input priority is:

1. positional SQL file
2. `--sql`
3. stdin

Options:

- `--schema <pattern...>`: one or more glob patterns for SQL schema files
- `--binds <spec>`: positional bind types like `int,text`, or named bind types
  like `id=int,name=text`
- `--dialect <name>`: SQL dialect, default `generic`; all dialect names
  reported by `@polyglot-sql/sdk` are accepted, with common aliases such as
  `sqlite3`, `sqlserver`, and `bq`
- `--dialects`: print supported dialect names and exit
- `--json`: emit structured JSON instead of a text table

Unsupported dialect names fail before parsing SQL and point to `sqldesc
--dialects` for the current list.

## Library

```ts
import { describeQuery, loadSchema, parseBinds } from 'sqldesc';

const schema = await loadSchema(['schemas/**/*.sql']);
const result = await describeQuery({
  sql: 'select id, name from users where id = ?',
  binds: ['int'],
  schema,
});

console.log(result.columns);
console.log(result.resultSets);
```

Exports:

- `describeQuery(input)`
- `parseBinds(spec)` — CLI-oriented helper that parses `"int,text"` or `"id=int,name=text"` into `Binds`
- `loadSchema(patterns, options)`
- `getSupportedDialects()`
- `isSupportedDialect(name)`
- `assertSupportedDialect(name)`
- TypeScript result and schema types

`DescribeResult.columns` contains the first result set for simple usage.
`DescribeResult.resultSets` contains every result set discovered in
multi-statement SQL. `DescribeResult.statements` records each parsed statement's
result-shape classification: statically described, no result columns, runtime
dependent, metadata dependent, or unknown. Result column `source` values include
schema-qualified table names when schema metadata provides them.
In CLI JSON mode these `statements`, `warnings`, and `diagnostics` fields are
emitted unchanged, so automation can distinguish no-result SQL from
runtime-dependent or metadata-dependent result shapes.

## Specification

The detailed behavior specification is maintained in [SPEC.md](SPEC.md). It is
intended for maintainers and LLM agents that need to understand or extend the
current implementation.
