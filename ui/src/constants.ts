export const DEFAULT_SQL = `SELECT id, name
FROM users
WHERE id = ?`;

export const DEFAULT_SCHEMA = `CREATE TABLE users (
  id INT PRIMARY KEY,
  name TEXT NOT NULL
);`;

/** WASM 読み込み前に dialect 選択肢を表示するためのフォールバック */
export const FALLBACK_DIALECTS = [
  'generic',
  'postgresql',
  'mysql',
  'sqlite',
  'bigquery',
  'snowflake',
  'duckdb',
  'tsql',
  'oracle',
  'clickhouse',
];
