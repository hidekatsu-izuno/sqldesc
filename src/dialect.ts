import { getDialects } from '@polyglot-sql/sdk';
import { dialectAliasByKey, dialectAliasKey, dialectConfigByName } from './dialects/index.js';
import type { DialectConfig } from './dialects/index.js';

export function normalizeDialect(dialect?: string): string {
  const trimmed = dialect?.trim();
  if (!trimmed) return 'generic';
  const lower = trimmed.toLowerCase();
  return dialectAliasByKey.get(dialectAliasKey(trimmed)) ?? lower;
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

export function getDialectConfig(dialect?: string): DialectConfig {
  const normalized = normalizeDialect(dialect);
  return dialectConfigByName.get(normalized) ?? dialectConfigByName.get('generic')!;
}
