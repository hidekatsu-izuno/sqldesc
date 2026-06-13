import { getDialectConfig, normalizeDialect } from './dialect.js';
import { mapBindTypes } from './binds.js';
import { createSqlType } from './sql-type.js';
import type { Binds } from './types.js';

type Quote = "'" | '"' | '`' | '[';

export function transformJdbcSql(sql: string, dialect?: string): string {
  const normalizedDialect = normalizeDialect(dialect);
  return transformParameterMarkers(transformEscapes(sql, normalizedDialect), normalizedDialect);
}

export function normalizeJdbcBindTypes(binds: Binds | undefined, dialect?: string): Binds | undefined {
  const normalizedDialect = normalizeDialect(dialect);
  return mapBindTypes(binds, (type) => jdbcBindType(type, normalizedDialect));
}

export function sqlTypeToJdbcType(type: string, dialect?: string): string {
  return createSqlType(type, dialect).toJdbcType();
}

function jdbcBindType(type: string, dialect: string): string {
  const jdbcType = jdbcTypeName(type);
  return jdbcType ? sqlTypeForJdbcType(jdbcType, dialect) : type;
}

function jdbcTypeName(type: string): string | undefined {
  const trimmed = type.trim();
  const match = trimmed.match(/^jdbc\s*:\s*(?:(?:java\.sql\.)?types\.)?([A-Za-z_][\w]*)$/i);
  return match ? match[1].toUpperCase() : undefined;
}

function sqlTypeForJdbcType(type: string, dialect: string): string {
  return getDialectConfig(dialect).jdbcTypeMap[type] ?? 'unknown';
}

function transformEscapes(sql: string, dialect: string): string {
  let out = '';
  for (let index = 0; index < sql.length;) {
    const char = sql[index];
    if (char === "'") {
      const end = copyQuoted(sql, index, "'");
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '"') {
      const end = copyQuoted(sql, index, '"');
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '`') {
      const end = copyQuoted(sql, index, '`');
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '[') {
      const end = copyQuoted(sql, index, '[');
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '-' && sql[index + 1] === '-') {
      const end = consumeLineComment(sql, index);
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '#') {
      const end = consumeLineComment(sql, index);
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '/' && sql[index + 1] === '*') {
      const end = consumeBlockComment(sql, index);
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '{') {
      const end = findJdbcEscapeEnd(sql, index);
      if (end !== -1) {
        out += convertJdbcEscape(sql.slice(index + 1, end), dialect);
        index = end + 1;
        continue;
      }
    }
    out += char;
    index++;
  }
  return out;
}

function convertJdbcEscape(rawContent: string, dialect: string): string {
  const content = transformEscapes(rawContent.trim(), dialect);
  if (/^fn\b/i.test(content)) {
    return convertJdbcFunction(content.replace(/^fn\b/i, '').trim(), dialect);
  }
  const dateMatch = content.match(/^d\s+('(?:''|[^'])*')$/i);
  if (dateMatch) return temporalLiteral('date', dateMatch[1] ?? "''", dialect);
  const timeMatch = content.match(/^t\s+('(?:''|[^'])*')$/i);
  if (timeMatch) return temporalLiteral('time', timeMatch[1] ?? "''", dialect);
  const timestampMatch = content.match(/^ts\s+('(?:''|[^'])*')$/i);
  if (timestampMatch) return temporalLiteral('timestamp', timestampMatch[1] ?? "''", dialect);
  if (/^escape\b/i.test(content)) {
    return `ESCAPE ${content.replace(/^escape\b/i, '').trim()}`;
  }
  if (/^oj\b/i.test(content)) {
    return content.replace(/^oj\b/i, '').trim();
  }
  if (/^\?\s*=\s*call\b/i.test(content)) {
    return convertFunctionCall(content.replace(/^\?\s*=\s*call\b/i, '').trim(), dialect);
  }
  if (/^call\b/i.test(content)) {
    return `CALL ${content.replace(/^call\b/i, '').trim()}`;
  }
  return `{${content}}`;
}

function convertJdbcFunction(expression: string, dialect: string): string {
  const call = splitFunctionCall(expression);
  if (!call) return expression;
  const name = call.name.toLowerCase();
  const args = call.args.map((arg) => transformEscapes(arg.trim(), dialect));

  if (name === 'ucase') return unary('upper', args, expression);
  if (name === 'lcase') return unary('lower', args, expression);
  if (name === 'ifnull') return binary(getDialectConfig(dialect).jdbcEscape.ifnullFunction, args, expression);
  if (name === 'now') return zeroArg('current_timestamp', args, expression);
  if (name === 'curdate') return zeroArg(currentDateExpression(dialect), args, expression);
  if (name === 'curtime') return zeroArg(currentTimeExpression(dialect), args, expression);
  if (name === 'convert') return convertJdbcConvert(args, dialect, expression);
  return `${call.name}(${args.join(', ')})`;
}

function convertJdbcConvert(args: string[], dialect: string, fallback: string): string {
  if (args.length !== 2) return fallback;
  const type = jdbcConvertType(args[1] ?? '', dialect);
  return `CAST(${args[0]} AS ${type})`;
}

function jdbcConvertType(type: string, dialect: string): string {
  const normalized = type.trim().replace(/^SQL_/i, '').toUpperCase();
  return sqlTypeForJdbcType(normalized, dialect) ?? type.trim();
}

function temporalLiteral(kind: 'date' | 'time' | 'timestamp', value: string, dialect: string): string {
  const style = getDialectConfig(dialect).jdbcEscape.temporalLiteral;
  if (style === 'cast') {
    const type = kind === 'timestamp' ? 'datetime2' : kind;
    return `CAST(${value} AS ${type})`;
  }
  if (style === 'raw') {
    return value;
  }
  return `${kind.toUpperCase()} ${value}`;
}

function convertFunctionCall(target: string, dialect: string): string {
  const call = splitFunctionCall(target);
  if (!call) return `SELECT ${target}`;
  if (getDialectConfig(dialect).jdbcEscape.executeCall) return `EXEC ${target}`;
  return `SELECT ${call.name}(${call.args.join(', ')})`;
}

function currentDateExpression(dialect: string): string {
  return getDialectConfig(dialect).jdbcEscape.currentDateExpression;
}

function currentTimeExpression(dialect: string): string {
  return getDialectConfig(dialect).jdbcEscape.currentTimeExpression;
}

function unary(name: string, args: string[], fallback: string): string {
  return args.length === 1 ? `${name}(${args[0]})` : fallback;
}

function binary(name: string, args: string[], fallback: string): string {
  return args.length === 2 ? `${name}(${args[0]}, ${args[1]})` : fallback;
}

function zeroArg(expression: string, args: string[], fallback: string): string {
  return args.length === 0 ? expression : fallback;
}

function splitFunctionCall(expression: string): { name: string; args: string[] } | undefined {
  const match = expression.match(/^([A-Za-z_][\w.$]*)\s*\(([\s\S]*)\)$/);
  if (!match) return undefined;
  return {
    name: match[1] ?? '',
    args: splitArgs(match[2] ?? ''),
  };
}

function splitArgs(args: string): string[] {
  const result: string[] = [];
  let start = 0;
  let depth = 0;
  for (let index = 0; index < args.length;) {
    const char = args[index];
    if (char === "'") {
      index = copyQuoted(args, index, "'");
      continue;
    }
    if (char === '"') {
      index = copyQuoted(args, index, '"');
      continue;
    }
    if (char === '(' || char === '{') depth++;
    if (char === ')' || char === '}') depth = Math.max(0, depth - 1);
    if (char === ',' && depth === 0) {
      result.push(args.slice(start, index).trim());
      start = index + 1;
    }
    index++;
  }
  const tail = args.slice(start).trim();
  return tail ? [...result, tail] : result;
}

function findJdbcEscapeEnd(sql: string, start: number): number {
  let depth = 0;
  for (let index = start; index < sql.length;) {
    const char = sql[index];
    if (char === "'") {
      index = copyQuoted(sql, index, "'");
      continue;
    }
    if (char === '"') {
      index = copyQuoted(sql, index, '"');
      continue;
    }
    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) return index;
    }
    index++;
  }
  return -1;
}

function transformParameterMarkers(sql: string, dialect: string): string {
  let out = '';
  let bindIndex = 0;
  for (let index = 0; index < sql.length;) {
    const char = sql[index];
    if (char === "'") {
      const end = copyQuoted(sql, index, "'");
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '"') {
      const end = copyQuoted(sql, index, '"');
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '`') {
      const end = copyQuoted(sql, index, '`');
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '[') {
      const end = copyQuoted(sql, index, '[');
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '-' && sql[index + 1] === '-') {
      const end = consumeLineComment(sql, index);
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '#') {
      const end = consumeLineComment(sql, index);
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '/' && sql[index + 1] === '*') {
      const end = consumeBlockComment(sql, index);
      out += sql.slice(index, end);
      index = end;
      continue;
    }
    if (char === '?') {
      if (sql[index + 1] === '?') {
        out += '?';
        index += 2;
        continue;
      }
      bindIndex++;
      out += parameterMarker(bindIndex, dialect);
      index++;
      continue;
    }
    out += char;
    index++;
  }
  return out;
}

function parameterMarker(index: number, dialect: string): string {
  const style = getDialectConfig(dialect).jdbcParameterMarker;
  if (style === 'postgresOrdinal') return `$${index}`;
  if (style === 'oracleOrdinal') return `:${index}`;
  if (style === 'tsqlOrdinal') return `@P${index}`;
  return '?';
}

function copyQuoted(sql: string, start: number, quote: Quote): number {
  const endQuote = quote === '[' ? ']' : quote;
  for (let index = start + 1; index < sql.length; index++) {
    const char = sql[index];
    if (char !== endQuote) continue;
    if (sql[index + 1] === endQuote) {
      index++;
      continue;
    }
    return index + 1;
  }
  return sql.length;
}

function consumeLineComment(sql: string, start: number): number {
  const newline = sql.slice(start).search(/[\r\n]/);
  return newline === -1 ? sql.length : start + newline;
}

function consumeBlockComment(sql: string, start: number): number {
  const end = sql.indexOf('*/', start + 2);
  return end === -1 ? sql.length : end + 2;
}
