# sqldesc Specification

This document describes the external contract and design direction for
`sqldesc`. It intentionally avoids long lists of parser-specific cases. Those
details can change during refactoring and belong in tests, not in the core
specification.

## Goal

`sqldesc` infers SQL result-set metadata without connecting to a database.

Given SQL text, optional bind types, a SQL dialect, and optional schema
metadata, it returns:

- result-set columns
- column names, types, nullability, and sources when known
- statement result-shape classification
- warnings and diagnostics for unresolved or runtime-dependent behavior

The tool must favor useful static information over hard failure. If SQL parses
but some shape or type cannot be known statically, return the known parts and
report the uncertainty explicitly.

## Public Surfaces

`sqldesc` is both a CLI and a TypeScript library.

The CLI accepts SQL from a file, `--sql`, or stdin, in that priority order. It
accepts schema glob patterns, bind type specs, dialect names, JDBC translation,
and JSON output.

The library entry point is `describeQuery(input)`. The stable input shape is:

```ts
interface DescribeInput {
  sql: string;
  dialect?: string;
  jdbc?: boolean;
  binds?: string | BindSpec;
  schema?: ValidationSchema;
}
```

The stable output shape is:

```ts
interface DescribeResult {
  columns: DescribeColumn[];
  resultSets: Array<{ index: number; columns: DescribeColumn[] }>;
  statements: StatementSummary[];
  warnings: string[];
  diagnostics: Diagnostic[];
  binds: BindSpec;
  schema: ValidationSchema;
}
```

`columns` is the first result set for convenience. `resultSets` is the complete
set of statically discovered result sets.

CLI JSON output should mirror the library result closely enough that automation
can make the same decisions from either surface.

## Dialect Contract

`sqldesc` accepts every dialect name exposed by `@polyglot-sql/sdk`, plus a
small set of user-facing aliases such as `postgres`, `pg`, `sqlserver`,
`sqlite3`, and `bq`.

Alias normalization must happen before dialect validation. Unsupported dialects
must fail before SQL parsing and should point users to `sqldesc --dialects`.

Dialect names returned by Polyglot are treated as first-class dialects, even
when they share a family internally. For example, `redshift`, `cockroachdb`,
`trino`, and `tidb` are not local aliases if Polyglot reports them as supported
dialects.

## Result Shape Classification

Every parsed statement should be classified into one of these result kinds:

- `static`: result columns are statically described
- `none`: the statement has no result columns
- `runtime`: the statement may return columns, but the shape depends on runtime
  database state or execution
- `metadata`: the statement returns dialect metadata whose shape is not
  statically modeled for that case
- `unknown`: the statement parsed, but no static shape could be inferred

This classification is part of the external contract. Refactoring should not
collapse runtime-dependent, metadata-dependent, no-result, and unknown cases
into a single generic failure.

## Diagnostics

Diagnostics and warnings are part of normal output, not exceptional control
flow. They should be structured enough for automation to distinguish:

- unsupported dialects
- parse failures
- validation warnings
- no-result statements
- runtime-dependent result shapes
- metadata-dependent result shapes
- unresolved references or unknown types

Unsupported dialects and SQL that cannot be parsed should throw or exit
non-zero. Parsed SQL with partially unknown static information should usually
return a result with warnings/diagnostics.

## Type Model

Type handling should carry both:

- a database-native/display type
- an internal normalized type

The normalized type is used for inference and cross-dialect reasoning. The
native/display type is what users see in result columns and should match the
selected dialect's conventions where practical.

Examples:

| Dialect | Native/display type | Internal normalized type |
|---------|---------------------|--------------------------|
| PostgreSQL | `text` | `text` |
| Generic SQL | `VARCHAR(255)` | `text` |
| Trino | `varchar` | `text` |
| BigQuery | `string` | `text` |
| SQL Server | `nvarchar(max)` | `text` |
| Trino | `array(integer)` | `array<integer>` |
| BigQuery | `array<int64>` | `array<integer>` |

Do not use one global display spelling for all dialects. For example, Trino
should expose Trino-style `varchar`, `timestamp(3)`, `array(integer)`, and
`map(varchar, integer)`, while the internal inference engine may still carry
`text`, `timestamp`, `array<integer>`, and `map<text, integer>`.

Type inference should preserve precision, scale, array element types, map
key/value types, struct fields, nullability, and schema-qualified sources when
the information is available. When it is not available, use `unknown` with an
appropriate warning rather than inventing false precision.

## Schema Model

Schema metadata is a stable external input:

```ts
interface ValidationSchema {
  tables: SchemaTable[];
  functions?: SchemaFunction[];
  procedures?: SchemaProcedure[];
}
```

Schema tables carry table name, optional schema name, columns, keys, and
foreign-key metadata when available. Schema columns carry name, type,
nullability, and key flags.

Schema can come from:

- direct JSON-like metadata
- SQL schema files
- CLI schema glob patterns
- schema changes discovered earlier in the same multi-statement SQL input

Schema loading should use the selected dialect. It should prefer Polyglot AST
metadata over ad hoc text parsing when the AST contains the required
information.

## Static Inference Contract

The core promise is static result-shape inference for SQL constructs whose
columns can be known without executing the query. This includes ordinary query
projection, schema-backed table projection, view-like definitions, common DML
returning/output clauses, derived relations, set operations, and table-valued
sources when their output columns are explicit or inferable.

The exact list of supported SQL spellings is intentionally test-driven. Do not
encode exhaustive syntax inventories in this spec. When adding support for a
dialect feature, document it with focused tests or an executable doc-test.

Projection-preserving syntax should not change the result shape merely because
it wraps or filters a query. Examples include ordering, limiting, sampling, and
dialect-specific projection filters. The implementation may use parser-specific
logic to recognize these, but the external rule is that such clauses preserve
the projected columns.

Multi-statement analysis should carry forward statically known schema effects
when doing so is deterministic, such as a table or view created earlier and
referenced later. It must not pretend to know effects that depend on runtime
database state.

## Sources And Lineage Hints

Column `source` values are hints, not a full lineage graph. They should be
stable and useful:

- table columns should prefer `table.column` or `schema.table.column`
- literals should use `literal`
- computed expressions should use `expression`
- casts should use `cast`
- bind-derived columns should use `bind`
- parser-provided type information may use `polyglot`

Do not expose transient internal AST paths as sources.

## Runtime Boundaries

`sqldesc` must not require a live database for normal operation. It may be
validated against real databases in tests or development, but database access is
not part of the runtime contract.

Statements whose result shape depends on database state or execution should be
classified as `runtime` unless a schema or earlier statement gives enough
static information to describe them.

Dialect metadata statements should be modeled only when their result shape is
stable and useful. Otherwise classify them as `metadata`.

No-result statements should be accepted and classified as `none` when they
parse successfully.

## JDBC Translation

When `jdbc` is enabled, JDBC parameter markers and JDBC escape syntax are
translated before parsing and describing. Bind metadata returned in the result
must correspond to the translated SQL shape while preserving the user's bind
intent.

## Documentation And Tests

README.md should stay concise and link here for detailed behavior.

Executable dialect documents live in `docs/test/*.md`. They are the preferred
place to record concrete dialect examples and compatibility findings. For
example, when real Trino behavior is verified in a container, the durable result
should be a doc-test and focused unit tests, not a long prose list in this file.

Use this document for contracts and design principles. Use tests for exact SQL
cases, parser quirks, and regression coverage.
