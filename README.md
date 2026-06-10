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
  binds: 'int',
  schema,
});

console.log(result.columns);
console.log(result.resultSets);
```

Exports:

- `describeQuery(input)`
- `parseBinds(spec)`
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

## Scope

Any SQL that `@polyglot-sql/sdk` can parse is accepted. Result columns are
described for statements that expose them, including `SELECT` projections,
`VALUES`, set operations such as `UNION`, projections over chained or recursive
CTEs (including explicit CTE column aliases), derived tables and derived
`VALUES` tables, scalar subqueries, row-value predicates, schema-loaded views,
joined table aliases, outer joins, `JOIN ... USING`, and `INSERT` / `UPDATE` /
`DELETE` / `MERGE` `RETURNING` or SQL Server-style `OUTPUT` clauses. BigQuery-style star
modifiers such as `EXCEPT`, `RENAME`, and `REPLACE` are reflected where the
parser exposes them, including qualified `EXCEPT` names. DML result clauses
support target-table stars, target aliases, and `inserted` / `deleted` pseudo
tables where the parser exposes them. Table column aliases and `USING` /
`NATURAL` join star-shape rules are reflected where schema information is
available. Projection-preserving modifiers such as PostgreSQL `DISTINCT ON`,
BigQuery/Snowflake `QUALIFY`, SQL Server `TOP`, and SQL `FETCH FIRST` keep the
SELECT result shape. Aggregate extensions such as `ROLLUP`, `CUBE`, and
`GROUPING SETS` keep projection types, and `GROUPING(...)` / `GROUPING_ID(...)`
are inferred as integer flags. Schema-backed `PIVOT` and `UNPIVOT` sources are
reflected for static `IN (...)` column lists. Sampling and temporal table
modifiers keep the source table shape. Derived `VALUES` tables with explicit column aliases are
described from their first row. Table-valued functions, `UNNEST`, lateral function joins,
and Hive/Spark-style `LATERAL VIEW` clauses with explicit column aliases are
described with generated columns. `UNNEST` over array literals, multiple arrays,
or schema-backed array columns and `generate_series` / `range` expose inferred
element types; `WITH ORDINALITY` adds an integer ordinal column. Spark/Hive
`LATERAL VIEW explode(...)` and `posexplode(...)` infer array element and map
key/value types when schema metadata is available. Other table-valued functions
use `unknown` types when no schema/type annotation is available. `UNNEST(...) AS
value_alias` is treated as a generated value column when no separate column
alias is present. Whole-row table or alias
projections are represented as `struct<...>` when schema metadata is available,
and constructor expressions such as `ROW(...)`, `ARRAY[...]`, Spark `array(...)`
/ `map(...)` / `named_struct(...)`, and BigQuery `STRUCT(...)` are represented
as `record<...>`, `array<...>`, `map<...>`, or `struct<...>`. Array/list scalar
functions such as `array_length`, `cardinality`, `array_append`,
`array_concat`, and `array_to_string` infer integer, array, or text result
types where clear. Map/object scalar functions such as `map_keys`, `map_values`,
`element_at`, map subscripts, and `map_entries` infer key/value-derived result
types from `map<...>` schema metadata. Common window
functions such as `ROW_NUMBER`, `RANK`, `LAG`, and `LEAD` have fallback type
inference when Polyglot does not annotate them directly. Common scalar
functions with clear return types, including string case/length/search functions
such as `LOWER`, `UPPER`, `TRIM`, `SUBSTRING`, `POSITION`, and `OVERLAY`,
regex/split functions such as `regexp_extract`, `regexp_count`, and `split`,
numeric/math functions such as `ABS`, `SQRT`, `POWER`, and `SIGN`,
`COALESCE`/`NULLIF`/`IFNULL`/`NVL`-style functions, and current date/time or
timestamp functions, also have conservative fallback inference. Aggregate
functions such as `count`, `avg`, `bool_or`, `string_agg`, `array_agg`, SQLite
`total`, and JSON aggregates infer integer, decimal, boolean, text, array, or
JSON result types where clear. Temporal functions such as `date_trunc`,
`extract`, `date_part`, `datediff`, and
`make_date` / `make_timestamp` infer date/time/timestamp or integer result
types where clear. Conversion functions such as `TRY_CAST`, `SAFE_CAST`,
`CONVERT`, `TRY_CONVERT`, `parse_date`, and `to_timestamp` use their explicit or
well-known target types. Geospatial functions such as `ST_GEOGPOINT`,
`ST_POINT`, `ST_ASGEOJSON`, `ST_DISTANCE`, and `ST_CONTAINS` infer geography,
geometry, text, numeric, or boolean result types where clear. Identifier, hash,
and random functions such as `uuid`, `gen_random_uuid`, `md5`, `sha256`, and
`random` infer uuid, text/bytes, or decimal result types. Conditional
expressions such as `CASE`, `IF`, and `IFF` infer their result type from branch
values when possible. Predicate projections such as comparisons, `IN`, `LIKE`,
`MATCH`, `REGEXP`, `GLOB`, `IS DISTINCT FROM`, `EXISTS`, and null checks are
reported as `boolean`. JSON constructors and
extractors such as `JSON_OBJECT`, `JSON_ARRAY`, PostgreSQL `json_build_object`,
`to_json`, `json_extract`, `json_value`, SQLite `json_patch`, and
`json_replace` are inferred as `json`, `jsonb`, or `text` where their
scalar/object behavior is clear. SQLite FTS helper functions such as
`highlight`, `snippet`, `bm25`, `offsets`, and `matchinfo` have fixed fallback
types. Nested field and element access can be inferred from schema type strings such as
`struct<name text>`, `array<struct<city text>>`, and `integer[]`; JSON scalar
operator extraction is reported as `text`.
`CREATE VIEW ... AS SELECT` and `CREATE TABLE ... AS SELECT` statements expose
the defined query shape directly, including explicit definition column names.
In multi-statement SQL, earlier `CREATE TABLE`, `CREATE VIEW`,
`CREATE TABLE ... AS SELECT`, `CREATE TABLE ... LIKE ...`, `CREATE TABLE ...
CLONE ...`, simple `ALTER TABLE` column changes, table renames, `SELECT ...
INTO new_table`, and `DROP TABLE` / `DROP VIEW` statements are carried forward
as local schema for later statements in the same input.
Statements that parse successfully but do not expose result columns, or whose
result shape is dialect-specific metadata such as unresolved `SHOW` /
`DESCRIBE`, return an empty column list with a warning and a structured
diagnostic. Common fixed metadata shapes such as MySQL-style `SHOW COLUMNS`,
`SHOW CREATE TABLE`, `SHOW TABLES`, `SHOW INDEXES`, `SHOW VARIABLES`, and
other common `SHOW` result sets such as warnings, engines, process lists,
character sets, collations, table status, grants, privileges, and Snowflake
parameters / warehouses / stages / file formats / pipes are described
statically. SQLite `PRAGMA table_info(...)`, `PRAGMA index_list(...)`, and
`PRAGMA foreign_key_list(...)` are also described statically. MySQL-compatible
table maintenance statements such as `ANALYZE TABLE` and `OPTIMIZE TABLE`
return their fixed status columns. `EXPLAIN SELECT ...` / `EXPLAIN ANALYZE ...`
return fixed query-plan metadata columns, with MySQL-compatible `EXPLAIN`
returning its common tabular plan columns and SQLite `EXPLAIN` returning its
bytecode columns, and
`DESCRIBE table_name` exposes schema columns when the table is available in
loaded metadata. Common catalog views such as `information_schema.tables`,
`information_schema.columns`, `information_schema.schemata`, constraints,
privileges, triggers, parameters, statistics, PostgreSQL `pg_catalog.pg_tables`
/ `pg_catalog.pg_class` / `pg_catalog.pg_namespace`, and SQL Server-style
`sys.tables` / `sys.columns` / `sys.objects` / `sys.schemas` / `sys.types`,
SQLite `sqlite_master` / `sqlite_schema`, BigQuery `INFORMATION_SCHEMA.JOBS`
/ `INFORMATION_SCHEMA.RESERVATIONS`, and Snowflake information-schema query
history / warehouses are
available as built-in metadata schemas, so ordinary `SELECT` projections and
stars over those views can be inferred even when no user schema is provided.
Known table-valued metadata helpers such as PostgreSQL `pg_get_keywords`,
SQLite `json_each` / `json_tree` / `generate_series`, Snowflake `FLATTEN` /
`INFER_SCHEMA`, DuckDB file readers with column specifications, ClickHouse
typed file/url/s3 readers, and Oracle `DBMS_XPLAN.DISPLAY` are described
statically where their shape is available from the SQL text.
`COPY` / `EXPORT` statements that expose a source table or
source query reuse that source's static column shape. Runtime-dependent
statements such as `CALL`, unresolved prepared `EXECUTE`, and unresolved `COPY`
are accepted and reported as runtime dependent when their result shape cannot be
inferred without a database. If a prepared statement is defined earlier in the
same SQL input, `EXECUTE name` reuses that prepared query's statically inferred
result shape. Transaction, session, and no-result maintenance statements such as
`BEGIN`, `COMMIT`, `ROLLBACK`, `USE`, `SET`, `ANALYZE`, `VACUUM`, `REFRESH`,
and `TRUNCATE`, plus DDL/access-control statements such as `CREATE INDEX`,
`DROP INDEX`, `CREATE/DROP SCHEMA`, `CREATE/DROP DATABASE`, `CREATE/DROP
SEQUENCE`, types/domains/namespaces, synonyms, routines, triggers, Snowflake
stage/file-format utility DDL, `COMMENT`, `GRANT`, `REVOKE`, and raw utility
statements accepted by Polyglot without a detailed AST, are accepted and
classified as no-result statements.

Ordinary `CREATE TABLE` column definitions, `CREATE TABLE ... AS SELECT`,
`CREATE TABLE ... LIKE ...`, `CREATE TABLE ... CLONE ...`, and `CREATE VIEW ...
AS SELECT` definitions, including materialized/schema-qualified view names, are
supported for schema loading.
`CREATE TABLE` parsing uses Polyglot's AST when available, so table-level keys,
foreign keys, uniqueness, schemas, nullability, and dialect-normalized type
names are preserved more reliably than with text-only parsing. Type aliases
from domains, enums, and composite types, scalar function return types,
table-valued function return columns, and procedure result columns are tracked
when Polyglot exposes enough information in the parsed schema SQL. The CLI
`--dialect` option is also used while loading schema files. Schema-qualified
references such as `public.users` or `dbo.t` are matched against loaded schema
metadata when available.
Unsupported or unresolved result types are reported as `unknown` with warnings
instead of failing the entire command.
