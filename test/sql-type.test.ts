import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSqlType, normalizeTypeName, sqlTypeToJdbcType } from "../dist/index.js";

describe("SqlType", () => {
  it("carries native and normalized type names together", () => {
    const postgres = createSqlType("varchar(20)", "postgres");
    assert.strictEqual(postgres.normalizedType, "varchar(20)");
    assert.strictEqual(postgres.nativeType, "varchar(20)");
    assert.strictEqual(postgres.toNativeType(), "varchar(20)");
    assert.strictEqual(postgres.toJdbcType(), "VARCHAR");

    const tsql = createSqlType("text", "tsql");
    assert.strictEqual(tsql.normalizedType, "text");
    assert.strictEqual(tsql.nativeType, "nvarchar(max)");
    assert.strictEqual(tsql.toJdbcType(), "VARCHAR");
  });

  it("normalizes common database-specific aliases", () => {
    assert.strictEqual(normalizeTypeName("NUMBER(10,0)"), "number(10,0)");
    assert.strictEqual(normalizeTypeName("uniqueidentifier"), "uuid");
    assert.strictEqual(normalizeTypeName("bytea"), "bytes");
  });

  it("converts SQL types to JDBC types through the dialect implementation", () => {
    assert.strictEqual(sqlTypeToJdbcType("bigint", "postgres"), "BIGINT");
    assert.strictEqual(sqlTypeToJdbcType("jsonb", "postgres"), "OTHER");
    assert.strictEqual(sqlTypeToJdbcType("array<text>", "postgres"), "ARRAY");
    assert.strictEqual(sqlTypeToJdbcType("struct<id integer>", "generic"), "STRUCT");
  });

  it("keeps BigQuery extended native types distinct", () => {
    const bignumeric = createSqlType("BIGNUMERIC", "bigquery");
    assert.strictEqual(bignumeric.normalizedType, "bignumeric");
    assert.strictEqual(bignumeric.nativeType, "bignumeric");
    assert.strictEqual(bignumeric.toJdbcType(), "DECIMAL");

    const geography = createSqlType("GEOGRAPHY", "bigquery");
    assert.strictEqual(geography.normalizedType, "geography");
    assert.strictEqual(geography.nativeType, "geography");
    assert.strictEqual(geography.toJdbcType(), "OTHER");
  });
});
