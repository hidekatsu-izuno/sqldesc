import { getDialects } from '@polyglot-sql/sdk';

const DIALECT_ALIASES: Record<string, string> = {
  bq: 'bigquery',
  cockroach: 'cockroachdb',
  googlebigquery: 'bigquery',
  memsql: 'singlestore',
  mssql: 'tsql',
  pg: 'postgresql',
  pgsql: 'postgresql',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  singlestoredb: 'singlestore',
  sqlserver: 'tsql',
  sqlite3: 'sqlite',
  transactsql: 'tsql',
  tsql: 'tsql',
};

export function normalizeDialect(dialect?: string): string {
  const trimmed = dialect?.trim();
  if (!trimmed) return 'generic';
  const normalizedKey = trimmed.toLowerCase().replace(/[-_\s]+/g, '');
  return DIALECT_ALIASES[normalizedKey] ?? trimmed.toLowerCase();
}

export function getSupportedDialects(): string[] {
  return [...getDialects().map(String)].sort();
}

export function isSupportedDialect(dialect?: string): boolean {
  const normalized = normalizeDialect(dialect);
  return getSupportedDialects().includes(normalized);
}

export function assertSupportedDialect(dialect?: string): string {
  const normalized = normalizeDialect(dialect);
  if (!isSupportedDialect(normalized)) {
    throw new Error(`Unsupported SQL dialect "${dialect ?? normalized}". Run "sqldesc --dialects" to list supported dialects.`);
  }
  return normalized;
}
