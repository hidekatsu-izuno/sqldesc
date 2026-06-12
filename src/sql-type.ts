import { normalizeDialect } from './dialect.js';

export interface SqlType {
  readonly nativeType: string;
  readonly normalizedType: string;
  toNativeType(): string;
  toJdbcType(): string;
}

type TypeFamily = 'postgresql' | 'mysql' | 'sqlite' | 'tsql' | 'oracle' | 'duckdb' | 'bigquery' | 'generic';

const JDBC_TYPE_BY_NORMALIZED: Record<string, string> = {
  integer: 'INTEGER',
  bigint: 'BIGINT',
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

export abstract class BaseSqlType implements SqlType {
  readonly nativeType: string;
  readonly normalizedType: string;

  constructor(type: string) {
    this.normalizedType = normalizeTypeName(type);
    this.nativeType = this.display(this.normalizedType);
  }

  toNativeType(): string {
    return this.nativeType;
  }

  toJdbcType(): string {
    if (this.normalizedType.startsWith('array<')) return 'ARRAY';
    if (this.normalizedType.startsWith('map<')) return 'JAVA_OBJECT';
    if (this.normalizedType.startsWith('struct<')) return 'STRUCT';
    const parameterized = /^([a-z_][\w]*)\(/.exec(this.normalizedType);
    if (parameterized) {
      const base = normalizeTypeName(parameterized[1] ?? '');
      return JDBC_TYPE_BY_NORMALIZED[base] ?? 'OTHER';
    }
    return JDBC_TYPE_BY_NORMALIZED[this.normalizedType] ?? 'OTHER';
  }

  protected abstract display(normalizedType: string): string;
}

export class GenericSqlType extends BaseSqlType {
  protected display(normalizedType: string): string {
    return displayByFamily(normalizedType, 'generic');
  }
}

export class PostgresSqlType extends BaseSqlType {
  protected display(normalizedType: string): string {
    return displayByFamily(normalizedType, 'postgresql');
  }
}

export class MySqlType extends BaseSqlType {
  protected display(normalizedType: string): string {
    return displayByFamily(normalizedType, 'mysql');
  }
}

export class SqliteSqlType extends BaseSqlType {
  protected display(normalizedType: string): string {
    return displayByFamily(normalizedType, 'sqlite');
  }
}

export class TsqlSqlType extends BaseSqlType {
  protected display(normalizedType: string): string {
    return displayByFamily(normalizedType, 'tsql');
  }
}

export class OracleSqlType extends BaseSqlType {
  protected display(normalizedType: string): string {
    return displayByFamily(normalizedType, 'oracle');
  }
}

export class DuckDbSqlType extends BaseSqlType {
  protected display(normalizedType: string): string {
    return displayByFamily(normalizedType, 'duckdb');
  }
}

export class BigQuerySqlType extends BaseSqlType {
  protected display(normalizedType: string): string {
    return displayByFamily(normalizedType, 'bigquery');
  }
}

export function createSqlType(type: string, dialect?: string): SqlType {
  const family = dialectTypeFamily(normalizeDialect(dialect));
  switch (family) {
    case 'postgresql':
      return new PostgresSqlType(type);
    case 'mysql':
      return new MySqlType(type);
    case 'sqlite':
      return new SqliteSqlType(type);
    case 'tsql':
      return new TsqlSqlType(type);
    case 'oracle':
      return new OracleSqlType(type);
    case 'duckdb':
      return new DuckDbSqlType(type);
    case 'bigquery':
      return new BigQuerySqlType(type);
    default:
      return new GenericSqlType(type);
  }
}

export function normalizeTypeName(value: string): string {
  const lower = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (/^interval day\(\d+\) to second\(\d+\)$/.test(lower)) return lower;
  if (/^interval year\(\d+\) to month$/.test(lower)) return lower;
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
  if (compact === 'timestampntz' || compact === 'timestampltz' || compact.startsWith('timestamp')) return 'timestamp';
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
  if (dialect === 'postgresql' || dialect === 'redshift' || dialect === 'cockroachdb') return 'postgresql';
  if (['mysql', 'mariadb', 'singlestore', 'tidb'].includes(dialect)) return 'mysql';
  if (dialect === 'sqlite') return 'sqlite';
  if (dialect === 'tsql') return 'tsql';
  if (dialect === 'oracle') return 'oracle';
  if (dialect === 'duckdb') return 'duckdb';
  if (dialect === 'bigquery') return 'bigquery';
  return 'generic';
}

function displayByFamily(normalized: string, family: TypeFamily): string {
  if (normalized === 'unknown') return 'unknown';
  if (normalized.startsWith('array<')) return displayComplexType(normalized, family);
  if (normalized.startsWith('map<')) return displayComplexType(normalized, family);
  if (normalized.startsWith('struct<')) return displayComplexType(normalized, family);

  const parameterized = /^([a-z_][\w]*)\(([^)]*)\)$/.exec(normalized);
  if (parameterized) {
    const [, base, args] = parameterized;
    if (['decimal', 'dec', 'numeric', 'number'].includes(base)) {
      if (family === 'postgresql') return `numeric(${args})`;
      if (family === 'oracle') return `number(${args})`;
      return `decimal(${args})`;
    }
    if (base === 'datetime2' && family === 'tsql') return `datetime2(${args})`;
    if (base === 'timestamptz' && (family === 'postgresql' || family === 'oracle')) return `timestamp(${args}) with time zone`;
    return normalized;
  }

  return DISPLAY_MAPS[family]?.[normalized] ?? normalized;
}

function displayComplexType(type: string, family: TypeFamily): string {
  if (family === 'bigquery') return type.replace(/^array</, 'array<').replace(/^struct</, 'struct<');
  return type;
}

const DISPLAY_MAPS: Record<TypeFamily, Record<string, string>> = {
  postgresql: {
    integer: 'integer',
    bigint: 'bigint',
    decimal: 'numeric',
    double: 'numeric',
    boolean: 'boolean',
    text: 'text',
    clob: 'text',
    nclob: 'text',
    bytes: 'bytea',
    blob: 'bytea',
    json: 'json',
    jsonb: 'jsonb',
    date: 'date',
    time: 'time',
    timestamp: 'timestamp without time zone',
    timestamptz: 'timestamp with time zone',
    datetime: 'timestamp',
    uuid: 'uuid',
  },
  mysql: {
    integer: 'int',
    bigint: 'bigint',
    decimal: 'decimal',
    boolean: 'tinyint(1)',
    text: 'varchar(255)',
    clob: 'longtext',
    nclob: 'longtext',
    bytes: 'varbinary(255)',
    blob: 'longblob',
    json: 'json',
    jsonb: 'json',
    date: 'date',
    time: 'time',
    timestamp: 'timestamp',
    timestamptz: 'timestamp',
    datetime: 'datetime',
    uuid: 'char(36)',
  },
  sqlite: {
    integer: 'integer',
    bigint: 'integer',
    decimal: 'real',
    double: 'real',
    boolean: 'integer',
    text: 'text',
    clob: 'text',
    nclob: 'text',
    bytes: 'blob',
    blob: 'blob',
    json: 'text',
    jsonb: 'blob',
    date: 'text',
    time: 'text',
    timestamp: 'text',
    timestamptz: 'text',
    datetime: 'text',
    uuid: 'text',
  },
  tsql: {
    integer: 'int',
    bigint: 'bigint',
    decimal: 'decimal(38, 10)',
    boolean: 'bit',
    text: 'nvarchar(max)',
    clob: 'nvarchar(max)',
    nclob: 'nvarchar(max)',
    bytes: 'varbinary(255)',
    blob: 'varbinary(max)',
    json: 'nvarchar(max)',
    jsonb: 'nvarchar(max)',
    xml: 'xml',
    date: 'date',
    time: 'time',
    timestamp: 'datetime2(7)',
    timestamptz: 'datetimeoffset',
    datetime2: 'datetime2(7)',
    datetime: 'datetime2',
    uuid: 'uniqueidentifier',
  },
  oracle: {
    integer: 'number(10)',
    bigint: 'number(19)',
    decimal: 'number',
    boolean: 'number(1)',
    text: 'varchar2(255)',
    clob: 'clob',
    nclob: 'nclob',
    bytes: 'raw(255)',
    blob: 'blob',
    json: 'json',
    jsonb: 'json',
    xml: 'xmltype',
    date: 'date',
    time: 'timestamp',
    timestamp: 'timestamp(6)',
    timestamptz: 'timestamp(6) with time zone',
    datetime: 'timestamp',
    uuid: 'raw(16)',
  },
  duckdb: {
    integer: 'integer',
    bigint: 'bigint',
    decimal: 'decimal(18, 3)',
    double: 'double',
    boolean: 'boolean',
    text: 'varchar',
    clob: 'varchar',
    nclob: 'varchar',
    bytes: 'blob',
    blob: 'blob',
    json: 'json',
    jsonb: 'json',
    date: 'date',
    time: 'time',
    timestamp: 'timestamp',
    timestamptz: 'timestamp with time zone',
    datetime: 'timestamp',
    uuid: 'uuid',
  },
  bigquery: {
    integer: 'int64',
    bigint: 'int64',
    decimal: 'numeric',
    boolean: 'bool',
    text: 'string',
    clob: 'string',
    nclob: 'string',
    bytes: 'bytes',
    blob: 'bytes',
    json: 'json',
    jsonb: 'json',
    date: 'date',
    time: 'time',
    timestamp: 'timestamp',
    timestamptz: 'timestamp',
    datetime: 'datetime',
    uuid: 'string',
  },
  generic: {
    integer: 'INTEGER',
    bigint: 'BIGINT',
    decimal: 'DECIMAL',
    double: 'DECIMAL',
    boolean: 'BOOLEAN',
    text: 'VARCHAR(255)',
    clob: 'CLOB',
    nclob: 'NCLOB',
    bytes: 'VARBINARY(255)',
    blob: 'BLOB',
    json: 'VARCHAR(4000)',
    jsonb: 'VARCHAR(4000)',
    xml: 'SQLXML',
    date: 'DATE',
    time: 'TIME',
    timestamp: 'TIMESTAMP',
    timestamptz: 'TIMESTAMP_WITH_TIMEZONE',
    datetime: 'TIMESTAMP',
    uuid: 'VARCHAR(36)',
  },
};

function parseParameterizedType(value: string): string | undefined {
  const match = /^([a-z_][\w\s]*)\s*\(([\s\S]*)\)$/i.exec(value.trim());
  if (!match) return undefined;
  const name = match[1].replace(/\s+/g, '').toLowerCase();
  const args = splitTopLevel(match[2], ',');
  if (name === 'nullable' || name === 'lowcardinality') return args[0] ? normalizeTypeName(args[0]) : 'unknown';
  if (['char', 'character', 'varchar', 'varchar2', 'nvarchar', 'nvarchar2', 'nchar', 'raw', 'binary', 'varbinary', 'var_binary', 'decimal', 'dec', 'numeric', 'number', 'datetime', 'datetime2', 'datetimeoffset', 'time', 'timestamp', 'timestamptz'].includes(name)) {
    return `${name === 'var_binary' ? 'varbinary' : name}(${args.map((arg) => arg.trim()).join(',')})`;
  }
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
