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
import { describeQuery, describeUpdatableQuery, loadSchema, parseBinds } from "sqldesc";

const schema = await loadSchema(["schemas/**/*.sql"]);
const result = await describeQuery({
  sql: "select id, name from users where id = ?",
  binds: ["int"],
  schema,
});

console.log(result.columns);
console.log(result.resultSets);
```

Set `jdbc: true` when the input SQL uses JDBC syntax. In JDBC mode sqldesc
translates `?` parameter markers and JDBC escape syntax such as `{fn ...}`,
`{d '2024-01-01'}`, or `{call ...}` before parsing. Bind types are normalized
for the selected dialect while preserving positional or named bind intent.

```ts
const jdbcResult = await describeQuery({
  jdbc: true,
  dialect: "postgres",
  sql: "select * from users where id = ? and created_at >= {ts '2024-01-01 00:00:00'}",
  binds: ["jdbc:INTEGER"],
  schema,
});
```

For JDBC updatable `ResultSet` style workflows, use
`describeUpdatableQuery(input)`. It accepts the same input shape as
`describeQuery`. The query must be a single-table, statically describable
`SELECT`. If it is updatable, the result contains a rewritten SQL string that
includes key columns, plus result columns with `key: true` for the row identity
columns.

```ts
const updatable = await describeUpdatableQuery({
  dialect: "mysql",
  sql: "select name from users",
  schema,
});

console.log(updatable.sql); // SELECT name, users.id FROM users
console.log(updatable.columns);
```

For Oracle, the key column is `ROWID`. For other dialects, key columns are the
table primary key columns from schema metadata. If the key column is already
projected, it is marked with `key: true`; otherwise it is appended to the
projection. Duplicate result column names are preserved to match database
behavior. Non-updatable queries throw an `Error` with the reason.

Exports:

- `describeQuery(input)`
- `describeUpdatableQuery(input)`
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

<!--
npm run format
npm run build
npm run test
update version in README.md
git tag vX.X.X && git push origin --tags
npm publish --tag beta
npm publish

## tag remove
git tag -d vX.X.X
git push origin --delete vX.X.X
-->
