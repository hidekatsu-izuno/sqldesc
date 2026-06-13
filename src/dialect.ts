import { getDialects } from '@polyglot-sql/sdk';
import { dialectAliasByKey, dialectAliasKey, dialectConfigByName } from './dialects/index.js';
import type { DialectConfig } from './dialects/index.js';
import type { DialectTableFunctionColumnConfig } from './types.js';

export type ConfigColumn = DialectTableFunctionColumnConfig;

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

export function adjustedOutputType(name: string | undefined, type: string, dialect: string): string {
  if (!name) return type;
  const overrides = getDialectConfig(dialect).outputTypeOverrides;
  const exact = overrides[name];
  if (exact) return exact;
  for (const [pattern, override] of Object.entries(overrides)) {
    if (!pattern.startsWith('/') || !pattern.endsWith('/')) continue;
    if (new RegExp(pattern.slice(1, -1)).test(name)) return override;
  }
  return type;
}

export function configuredScalarFunctionPatternType(name: string, dialect: string): string | undefined {
  for (const [pattern, type] of Object.entries(getDialectConfig(dialect).scalarFunctionTypePatterns)) {
    const regex = pattern.match(/^\/(.*)\/([a-z]*)$/i);
    if (regex && new RegExp(regex[1], regex[2]).test(name)) return type;
    if (!regex && pattern.toLowerCase() === name.toLowerCase()) return type;
  }
  return undefined;
}

export function commandResultColumnConfigs(command: string, dialect: string): readonly ConfigColumn[] | undefined {
  for (const result of getDialectConfig(dialect).metadata.commandResultColumns) {
    const match = result.pattern.match(/^\/(.*)\/([a-z]*)$/i);
    if (match && new RegExp(match[1], match[2]).test(command)) return result.columns;
  }
  return undefined;
}

export function isMysqlLikeDialect(dialect: string): boolean {
  return getDialectConfig(dialect).family === 'mysql';
}
