import { getDialectConfig, normalizeDialect } from './dialect.js';
import type { DialectConfig, TypeFamily } from './dialects/types.js';

export interface SqlType {
  readonly nativeType: string;
  readonly normalizedType: string;
  toNativeType(): string;
  toJdbcType(): string;
}

const JDBC_TYPE_BY_NORMALIZED: Record<string, string> = {
  integer: 'INTEGER',
  bigint: 'BIGINT',
  bignumeric: 'DECIMAL',
  decimal: 'DECIMAL',
  double: 'DOUBLE',
  boolean: 'BOOLEAN',
  text: 'VARCHAR',
  clob: 'CLOB',
  nclob: 'NCLOB',
  bytes: 'VARBINARY',
  blob: 'BLOB',
  json: 'OTHER',
  jsonb: 'OTHER',
  xml: 'SQLXML',
  date: 'DATE',
  time: 'TIME',
  timestamp: 'TIMESTAMP',
  timestamptz: 'TIMESTAMP_WITH_TIMEZONE',
  datetime: 'TIMESTAMP',
  datetime2: 'TIMESTAMP',
  interval: 'OTHER',
  uuid: 'OTHER',
  geography: 'OTHER',
  geometry: 'OTHER',
  variant: 'OTHER',
  object: 'JAVA_OBJECT',
  unknown: 'NULL',
};

export function createSqlType(type: string, dialect?: string): SqlType {
  const config = getDialectConfig(normalizeDialect(dialect));
  const normalizedType = normalizeTypeName(type);
  const nativeType = displayByDialect(normalizedType, config);
  return {
    nativeType,
    normalizedType,
    toNativeType: () => nativeType,
    toJdbcType: () => jdbcTypeForNormalizedType(normalizedType),
  };
}

export function normalizeTypeName(value: string): string {
  const lower = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (/^interval day\(\d+\) to second\(\d+\)$/.test(lower)) return lower;
  if (/^interval year\(\d+\) to month$/.test(lower)) return lower;
  const timestampWithLocalTimeZone = /^timestamp\s*\(([^)]+)\)\s+with\s+local\s+time\s+zone$/.exec(lower);
  if (timestampWithLocalTimeZone?.[1]) return `timestampltz(${timestampWithLocalTimeZone[1].trim()})`;
  const timestampWithTimeZone = /^timestamp\s*\(([^)]+)\)\s+with\s+time\s+zone$/.exec(lower);
  if (timestampWithTimeZone?.[1]) return `timestamptz(${timestampWithTimeZone[1].trim()})`;
  const parameterized = parseParameterizedType(lower);
  if (parameterized) return parameterized;
  const unparameterized = lower.replace(/\s*\([^)]*\)/g, '');
  const compact = unparameterized.replace(/\s+/g, '');
  if (compact === 'serial' || compact === 'serial4') return 'integer';
  if (compact === 'bigserial' || compact === 'serial8') return 'bigint';
  if (compact === 'smallserial' || compact === 'serial2') return 'integer';
  if (['int', 'int2', 'int4', 'int16', 'int32', 'integer', 'smallint', 'tinyint', 'small_int', 'tiny_int', 'uint8', 'uint16', 'uint32'].includes(compact)) return 'integer';
  if (['int8', 'int64', 'bigint', 'big_int', 'uint64'].includes(compact)) return 'bigint';
  if (compact === 'bignumeric' || compact === 'big_numeric') return 'bignumeric';
  if (['decimal', 'dec', 'numeric', 'number'].includes(compact)) return 'decimal';
  if (['double', 'doubleprecision', 'float8'].includes(compact)) return 'double';
  if (['float', 'float4', 'real'].includes(compact)) return 'decimal';
  if (['bool', 'boolean', 'bit'].includes(compact)) return 'boolean';
  if (['char', 'nchar', 'varchar', 'varchar2', 'var_char', 'nvarchar', 'nvarchar2', 'nvar_char', 'character', 'string', 'text'].includes(compact)) return 'text';
  if (compact === 'clob') return 'clob';
  if (compact === 'nclob') return 'nclob';
  if (['binary', 'varbinary', 'var_binary', 'bytea', 'bytes'].includes(compact)) return 'bytes';
  if (compact === 'blob') return 'blob';
  if (compact === 'json_b') return 'jsonb';
  if (compact === 'datetime2') return 'datetime2';
  if (compact === 'timestamptz' || compact === 'timestampwithtimezone') return 'timestamptz';
  if (compact === 'timestampwithlocaltimezone' || compact === 'timestampltz') return 'timestampltz';
  if (['timestamp_s', 'timestamp_ms', 'timestamp_ns'].includes(compact)) return compact;
  if (compact === 'timestampntz' || compact.startsWith('timestamp')) return 'timestamp';
  if (compact === 'array') return 'array<variant>';
  if (compact === 'uniqueidentifier') return 'uuid';
  if (['variant', 'object', 'json', 'jsonb', 'date', 'time', 'datetime', 'datetime2', 'interval', 'uuid', 'geography', 'geometry'].includes(compact)) return compact;
  return unparameterized;
}

export function displayTypeName(type: string, dialect?: string): string {
  return createSqlType(type, dialect).toNativeType();
}

export function toJdbcType(type: string, dialect?: string): string {
  return createSqlType(type, dialect).toJdbcType();
}

export function dialectTypeFamily(dialect: string): TypeFamily {
  return getDialectConfig(dialect).typeFamily;
}

function jdbcTypeForNormalizedType(normalizedType: string): string {
  if (normalizedType.startsWith('array<')) return 'ARRAY';
  if (normalizedType.startsWith('map<')) return 'JAVA_OBJECT';
  if (normalizedType.startsWith('struct<')) return 'STRUCT';
  const parameterized = /^([a-z_][\w]*)\(/.exec(normalizedType);
  if (parameterized) {
    const base = normalizeTypeName(parameterized[1] ?? '');
    return JDBC_TYPE_BY_NORMALIZED[base] ?? 'OTHER';
  }
  return JDBC_TYPE_BY_NORMALIZED[normalizedType] ?? 'OTHER';
}

function displayByDialect(normalized: string, config: DialectConfig): string {
  if (normalized === 'unknown') return 'unknown';
  if (normalized.startsWith('array<')) return displayComplexType(normalized, config);
  if (normalized.startsWith('map<')) return displayComplexType(normalized, config);
  if (normalized.startsWith('struct<')) return displayComplexType(normalized, config);

  const parameterized = /^([a-z_][\w]*)\(([^)]*)\)$/.exec(normalized);
  if (parameterized) {
    const [, base, args] = parameterized;
    if (['decimal', 'dec', 'numeric', 'number'].includes(base)) {
      if (config.typeFamily === 'postgresql') return `numeric(${args})`;
      if (config.typeFamily === 'oracle') return `number(${args})`;
      return `decimal(${args})`;
    }
    if (base === 'datetime2' && config.typeFamily === 'tsql') return `datetime2(${args})`;
    if (base === 'timestamptz' && (config.typeFamily === 'postgresql' || config.typeFamily === 'oracle')) return `timestamp(${args}) with time zone`;
    if (base === 'timestampltz' && config.typeFamily === 'oracle') return `timestamp(${args}) with local time zone`;
    return normalized;
  }

  return config.displayTypes[normalized] ?? normalized;
}

function displayComplexType(type: string, config: DialectConfig): string {
  if (config.complexTypeStyle === 'trino') return displayTrinoComplexType(type, config);
  return type;
}

function displayTrinoComplexType(type: string, config: DialectConfig): string {
  const arrayMatch = /^array<([\s\S]+)>$/.exec(type);
  if (arrayMatch?.[1]) return `array(${displayTrinoTypeArgument(arrayMatch[1], config)})`;
  const mapMatch = /^map<([\s\S]+)>$/.exec(type);
  if (mapMatch?.[1]) {
    const args = splitTopLevel(mapMatch[1], ',');
    return `map(${args.map((arg) => displayTrinoTypeArgument(arg, config)).join(', ')})`;
  }
  const structMatch = /^struct<([\s\S]+)>$/.exec(type);
  if (structMatch?.[1]) return `row(${structMatch[1]})`;
  return type;
}

function displayTrinoTypeArgument(type: string, config: DialectConfig): string {
  const normalized = normalizeTypeName(type);
  if (normalized.startsWith('array<') || normalized.startsWith('map<') || normalized.startsWith('struct<')) {
    return displayTrinoComplexType(normalized, config);
  }
  return config.displayTypes[normalized] ?? normalized;
}

function parseParameterizedType(value: string): string | undefined {
  const match = /^([a-z_][\w\s]*)\s*\(([\s\S]*)\)$/i.exec(value.trim());
  if (!match) return undefined;
  const name = match[1].replace(/\s+/g, '').toLowerCase();
  const args = splitTopLevel(match[2], ',');
  if (name === 'nullable' || name === 'lowcardinality') return args[0] ? normalizeTypeName(args[0]) : 'unknown';
  if (['char', 'character', 'varchar', 'varchar2', 'nvarchar', 'nvarchar2', 'nchar', 'raw', 'binary', 'varbinary', 'var_binary', 'bit', 'decimal', 'dec', 'numeric', 'number', 'datetime', 'datetime2', 'datetimeoffset', 'time', 'timestamp', 'timestamptz'].includes(name)) {
    return `${name === 'var_binary' ? 'varbinary' : name}(${args.map((arg) => arg.trim()).join(',')})`;
  }
  if (name === 'varbit' || name === 'bitvarying') return `bit varying(${args.map((arg) => arg.trim()).join(',')})`;
  if (name === 'enum' || name === 'set') return `${name}(${args.map((arg) => arg.trim()).join(',')})`;
  if (name === 'array' || name === 'list') return `array<${args[0] ? normalizeTypeName(args[0]) : 'unknown'}>`;
  if (name === 'map' && args.length >= 2) return `map<${normalizeTypeName(args[0])}, ${normalizeTypeName(args[1])}>`;
  if (name === 'tuple' || name === 'row') return `struct<${args.map((arg, index) => fieldFromTypeArgument(arg, index)).map((field) => `${field.name} ${field.type}`).join(', ')}>`;
  if (name === 'nested') return `array<struct<${args.map((arg, index) => fieldFromTypeArgument(arg, index)).map((field) => `${field.name} ${field.type}`).join(', ')}>>`;
  return undefined;
}

function fieldFromTypeArgument(argument: string, index: number): { name: string; type: string } {
  const trimmed = argument.trim();
  const match = /^("[^"]+"|`[^`]+`|\[[^\]]+\]|[a-z_][\w$]*)\s+([\s\S]+)$/i.exec(trimmed);
  if (!match) return { name: `field_${index + 1}`, type: normalizeTypeName(trimmed) };
  return {
    name: cleanIdentifier(match[1]),
    type: normalizeTypeName(match[2]),
  };
}

function splitTopLevel(value: string, separator: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let quote: string | undefined;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index] ?? '';
    if (quote) {
      current += char;
      if (char === quote) quote = undefined;
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      current += char;
      continue;
    }
    if (char === '(' || char === '<') depth += 1;
    if (char === ')' || char === '>') depth = Math.max(0, depth - 1);
    if (char === separator && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current.trim());
  return parts;
}

function cleanIdentifier(value: string | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith('`') && trimmed.endsWith('`'))
    || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
