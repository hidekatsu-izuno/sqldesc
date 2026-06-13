import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { getDialects } from '@polyglot-sql/sdk';
import {
  describeQuery,
  getSupportedDialects,
  normalizeJdbcBindTypes,
  normalizeDialect,
  sqlTypeToJdbcType,
  displayTypeName,
} from '../dist/index.js';
import { dialectConfigs } from '../dist/dialects/index.js';

describe('dialect configuration registry', () => {
  it('has an independent config file for every polyglot-sql dialect', async () => {
    const sdkDialects = getDialects().map(String).sort();
    const configuredDialects = dialectConfigs.map((config) => config.name).sort();
    assert.deepStrictEqual(configuredDialects, sdkDialects);
    assert.deepStrictEqual(getSupportedDialects(), sdkDialects);

    const files = (await readdir(path.resolve('src/dialects')))
      .filter((file) => file.endsWith('.ts') && file !== 'index.ts' && file !== 'types.ts')
      .map((file) => file.replace(/\.ts$/, ''))
      .sort();
    assert.deepStrictEqual(files, sdkDialects);
  });

  it('keeps dialect files self-contained', async () => {
    for (const config of dialectConfigs) {
      const file = path.resolve('src/dialects', `${config.name}.ts`);
      const source = await readFile(file, 'utf8');
      assert.match(source, new RegExp(`name:\\s*'${config.name}'`));
      assert.ok(Object.keys(config.jdbcTypeMap).length > 0);
      assert.strictEqual(config.jdbcTypeMap.VARCHAR, 'text');
      assert.strictEqual(config.jdbcTypeMap.NULL, 'unknown');
      assert.ok(Object.keys(config.displayTypes).length > 0);
      assert.ok(config.displayTypes.integer);
      assert.ok(config.outputTypeOverrides);
      assert.ok(Object.keys(config.scalarFunctionTypes).length > 0);
      assert.strictEqual(config.scalarFunctionTypes.gen_random_uuid, 'uuid');
      assert.strictEqual(config.scalarFunctionTypes.st_distance, 'decimal');
      assert.ok(Object.keys(config.tableFunctions).length > 0);
      assert.deepStrictEqual(config.tableFunctions.json_each?.[0], { name: 'key', type: 'text' });
      assert.ok(config.aggregate.countType);
      assert.ok(config.commonTypes.text);
      assert.ok(config.cast.adjustment);
      assert.ok(config.arithmetic.decimalInteger);
      assert.strictEqual(config.windowFunctionTypes.percent_rank, 'decimal');
      const imports = [...source.matchAll(/^import\s+(?:type\s+)?[^;]+from\s+'([^']+)'/gm)].map((match) => match[1]);
      assert.deepStrictEqual(imports, ['./types.js']);
      const exports = [...source.matchAll(/^export\s+/gm)];
      assert.strictEqual(exports.length, 1);
      assert.match(source, /export const dialectConfig = /);
    }
  });

  it('preserves alias normalization and type display behavior', () => {
    assert.strictEqual(normalizeDialect('postgres'), 'postgresql');
    assert.strictEqual(normalizeDialect('pg'), 'postgresql');
    assert.strictEqual(normalizeDialect('sqlite3'), 'sqlite');
    assert.strictEqual(normalizeDialect('mssql'), 'tsql');
    assert.strictEqual(normalizeDialect('sqlserver'), 'tsql');
    assert.strictEqual(normalizeDialect('bq'), 'bigquery');
    assert.strictEqual(displayTypeName('text', 'tsql'), 'nvarchar(max)');
    assert.strictEqual(sqlTypeToJdbcType('jsonb', 'postgres'), 'OTHER');
    assert.strictEqual(normalizeJdbcBindTypes({
      mode: 'positional',
      binds: [{ index: 1, type: 'jdbc:JAVA_OBJECT' }],
    }, 'postgres').binds[0]?.type, 'json');
  });

  it('keeps output type override data in dialect configs', () => {
    const mysql = dialectConfigs.find((config) => config.name === 'mysql');
    const duckdb = dialectConfigs.find((config) => config.name === 'duckdb');
    assert.strictEqual(mysql?.outputTypeOverrides.concat_text, 'varchar(5)');
    assert.strictEqual(mysql?.outputTypeOverrides.enum_value, "enum('a','b')");
    assert.strictEqual(duckdb?.outputTypeOverrides['/^avg_/'], 'double');
  });

  it('keeps fixed table function schemas in dialect configs', async () => {
    const postgres = dialectConfigs.find((config) => config.name === 'postgresql');
    assert.strictEqual(postgres?.tableFunctions.pg_get_keywords?.[0]?.name, 'word');
    assert.strictEqual(postgres?.tableFunctions.current_setting?.[0]?.name, '$alias');

    const result = await describeQuery({
      dialect: 'postgres',
      sql: 'select * from pg_catalog.pg_get_keywords() as k',
    });
    assert.deepStrictEqual(result.columns.slice(0, 2).map((column) => [column.name, column.type]), [
      ['word', 'text'],
      ['catcode', 'text'],
    ]);
  });

  it('keeps type inference policies in dialect configs', () => {
    const mysql = dialectConfigs.find((config) => config.name === 'mysql');
    const trino = dialectConfigs.find((config) => config.name === 'trino');
    const oracle = dialectConfigs.find((config) => config.name === 'oracle');
    assert.strictEqual(mysql?.aggregate.avgDecimal, 'mysqlPlus4');
    assert.strictEqual(mysql?.cast.adjustment, 'mysqlCharBinaryLength');
    assert.strictEqual(trino?.windowFunctionTypes.row_number, 'bigint');
    assert.strictEqual(oracle?.arithmetic.allNumberType, 'decimal');
  });

  it('uses scalar function type maps from dialect configs', async () => {
    const result = await describeQuery({
      dialect: 'postgres',
      sql: "select gen_random_uuid() as id, st_distance(geom, geom) as distance, json_query_array(data, '$.x') as items from users",
      schema: {
        tables: [{
          name: 'users',
          columns: [
            { name: 'geom', type: 'geometry' },
            { name: 'data', type: 'json' },
          ],
        }],
      },
    });
    assert.deepStrictEqual(result.columns.map((column) => [column.name, column.type]), [
      ['id', 'uuid'],
      ['distance', 'numeric'],
      ['items', 'array<json>'],
    ]);
  });

  it('describes a trivial query for every configured dialect', async () => {
    for (const config of dialectConfigs) {
      const result = await describeQuery({ dialect: config.name, sql: 'select 1 as x' });
      assert.strictEqual(result.columns[0]?.name, 'x');
    }
  });
});
