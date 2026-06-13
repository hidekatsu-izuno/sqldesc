import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { describeQuery, normalizeJdbcBindTypes, transformJdbcSql } from "../dist/index.js";

describe("JDBC SQL transformation", () => {
  it("translates PostgreSQL JDBC parameter markers and escapes", () => {
    const sql = transformJdbcSql(
      "select {d '2024-01-02'} as d, {fn UCASE(name)} as n from users where id = ? and note = 'keep ?' and marker = ??",
      "postgres",
    );

    assert.strictEqual(
      sql,
      "select DATE '2024-01-02' as d, upper(name) as n from users where id = $1 and note = 'keep ?' and marker = ?",
    );
  });

  it("translates SQL Server JDBC parameter markers and temporal escapes", () => {
    const sql = transformJdbcSql(
      "select {ts '2024-01-02 03:04:05'} as ts from users where name like ? {escape '\\\\'}",
      "sqlserver",
    );

    assert.strictEqual(
      sql,
      "select CAST('2024-01-02 03:04:05' AS datetime2) as ts from users where name like @P1 ESCAPE '\\\\'",
    );
  });

  it("keeps MySQL positional markers and unwraps function escapes", () => {
    const sql = transformJdbcSql(
      "select {fn CONVERT(?, SQL_VARCHAR)} as label, {fn IFNULL(name, 'x')} as name",
      "mysql",
    );

    assert.strictEqual(sql, "select CAST(? AS text) as label, coalesce(name, 'x') as name");
  });

  it("uses transformed SQL in describeQuery when jdbc is enabled", async () => {
    const result = await describeQuery({
      sql: "select {fn UCASE(?)} as label, {d '2024-01-02'} as created_on",
      dialect: "postgres",
      binds: ["text"],
      jdbc: true,
    });

    assert.deepStrictEqual(
      result.columns.map((column) => [column.name, column.type]),
      [
        ["label", "text"],
        ["created_on", "date"],
      ],
    );
    assert.deepStrictEqual(result.warnings, []);
  });

  it("uses SQL Server JDBC positional bind markers for type inference", async () => {
    const result = await describeQuery({
      sql: "select ? as label",
      dialect: "sqlserver",
      binds: ["text"],
      jdbc: true,
    });

    assert.deepStrictEqual(
      result.columns.map((column) => [column.name, column.type, column.source]),
      [["label", "nvarchar(max)", "bind"]],
    );
    assert.deepStrictEqual(result.warnings, []);
  });

  it("normalizes java.sql.Types bind names only when JDBC mode is enabled", async () => {
    const postgresResult = await describeQuery({
      sql: "select ? as values",
      dialect: "postgres",
      binds: ["jdbc:ARRAY"],
      jdbc: true,
    });
    assert.deepStrictEqual(postgresResult.binds, ["array<variant>"]);
    assert.deepStrictEqual(
      postgresResult.columns.map((column) => [column.name, column.type, column.source]),
      [["values", "array<variant>", "bind"]],
    );

    const mysqlResult = await describeQuery({
      sql: "select ? as payload",
      dialect: "mysql",
      binds: ["jdbc:ARRAY"],
      jdbc: true,
    });
    assert.deepStrictEqual(
      mysqlResult.columns.map((column) => [column.name, column.type, column.source]),
      [["payload", "json", "bind"]],
    );

    const sqlServerResult = await describeQuery({
      sql: "select ? as label",
      dialect: "sqlserver",
      binds: ["jdbc:java.sql.Types.NVARCHAR"],
      jdbc: true,
    });
    assert.deepStrictEqual(
      sqlServerResult.columns.map((column) => [column.name, column.type, column.source]),
      [["label", "nvarchar(max)", "bind"]],
    );

    const oracleResult = await describeQuery({
      sql: "select ? as n from dual",
      dialect: "oracle",
      binds: ["jdbc:INTEGER"],
      jdbc: true,
    });
    assert.deepStrictEqual(
      oracleResult.columns.map((column) => [column.name, column.type, column.source]),
      [["n", "number", "bind"]],
    );

    const plainResult = await describeQuery({
      sql: "select ? as raw_type",
      dialect: "postgres",
      binds: ["jdbc:ARRAY"],
    });
    assert.deepStrictEqual(
      plainResult.columns.map((column) => [column.name, column.type, column.source]),
      [["raw_type", "jdbc:array", "bind"]],
    );
  });

  it("normalizes named JDBC bind types through the library helper", () => {
    assert.deepStrictEqual(
      normalizeJdbcBindTypes(
        {
          id: "jdbc:Types.BIGINT",
          payload: "jdbc:OTHER",
        },
        "postgres",
      ),
      {
        id: "bigint",
        payload: "json",
      },
    );
  });
});
