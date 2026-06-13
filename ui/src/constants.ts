export const DEFAULT_SQL = `SELECT id, name
FROM users
WHERE id = ?`;

export const DEFAULT_SCHEMA = `CREATE TABLE users (
  id INT PRIMARY KEY,
  name TEXT NOT NULL
);`;

/** Fallback dialect list shown before the WASM engine loads */
export const FALLBACK_DIALECTS = [
  'athena',
  'bigquery',
  'clickhouse',
  'cockroachdb',
  'databricks',
  'datafusion',
  'doris',
  'dremio',
  'drill',
  'druid',
  'duckdb',
  'dune',
  'exasol',
  'fabric',
  'generic',
  'hive',
  'materialize',
  'mysql',
  'oracle',
  'postgresql',
  'presto',
  'redshift',
  'risingwave',
  'singlestore',
  'snowflake',
  'solr',
  'spark',
  'sqlite',
  'starrocks',
  'tableau',
  'teradata',
  'tidb',
  'trino',
  'tsql',
];
