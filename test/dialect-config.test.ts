import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { getDialects } from "@polyglot-sql/sdk";
import {
  describeQuery,
  getSupportedDialects,
  normalizeJdbcBindTypes,
  normalizeDialect,
  sqlTypeToJdbcType,
  displayTypeName,
} from "../dist/index.js";
import { dialectConfigs } from "../dist/dialects/index.js";

const DIALECT_CONFIG_KEY_ORDER = [
  "name",
  "aliases",
  "family",
  "typeFamily",
  "displayTypes",
  "jdbcTypeMap",
  "scalarFunctionTypes",
  "scalarFunctionTypePatterns",
  "tableFunctions",
  "aggregate",
  "commonTypes",
  "cast",
  "arithmetic",
  "windowFunctionTypes",
  "specialParameterTypes",
  "specialColumnTypes",
  "qualifiedSpecialColumnTypes",
  "pseudoColumnTypes",
  "generatedNames",
  "scriptPreprocessor",
  "includeDirectives",
  "complexTypeStyle",
  "jdbcEscapeStyle",
  "jdbcEscape",
  "jdbcParameterMarker",
  "parserFallbacks",
  "parameterizedTypeFormats",
  "literalTypes",
  "dynamicTableFunctions",
  "selectStar",
  "serializedSelect",
  "outputTypeOverrides",
  "metadata",
  "diagnosticRules",
] as const;

describe("dialect configuration registry", () => {
  it("has an independent config file for every polyglot-sql dialect", async () => {
    const sdkDialects = getDialects().map(String).sort();
    const configuredDialects = dialectConfigs.map((config) => config.name).sort();
    assert.deepStrictEqual(configuredDialects, sdkDialects);
    assert.deepStrictEqual(getSupportedDialects(), sdkDialects);

    const files = (await readdir(path.resolve("src/dialects")))
      .filter((file) => file.endsWith(".ts") && file !== "index.ts")
      .map((file) => file.replace(/\.ts$/, ""))
      .sort();
    assert.deepStrictEqual(files, sdkDialects);
  });

  it("keeps dialect files self-contained", async () => {
    for (const config of dialectConfigs) {
      const file = path.resolve("src/dialects", `${config.name}.ts`);
      const source = await readFile(file, "utf8");
      assert.match(source, new RegExp(`name:\\s*'${config.name}'`));
      assert.ok(Object.keys(config.jdbcTypeMap).length > 0);
      assert.strictEqual(config.jdbcTypeMap.VARCHAR, "text");
      assert.strictEqual(config.jdbcTypeMap.NULL, "unknown");
      assert.ok(Object.keys(config.displayTypes).length > 0);
      assert.ok(config.displayTypes.integer);
      assert.ok(config.outputTypeOverrides);
      assert.ok(Object.keys(config.scalarFunctionTypes).length > 0);
      assert.strictEqual(config.scalarFunctionTypes.gen_random_uuid, "uuid");
      assert.strictEqual(config.scalarFunctionTypes.st_distance, "decimal");
      assert.ok(config.scalarFunctionTypePatterns);
      assert.ok(config.tableFunctions);
      assert.ok(config.aggregate.countType);
      assert.ok(config.commonTypes.text);
      assert.ok(config.cast.adjustment);
      assert.ok(config.arithmetic.decimalInteger);
      assert.strictEqual(config.windowFunctionTypes.percent_rank, "decimal");
      assert.strictEqual(typeof config.generatedNames.countStar, "string");
      assert.strictEqual(config.specialColumnTypes.current_date, "date");
      assert.ok(config.qualifiedSpecialColumnTypes);
      assert.ok(config.parameterizedTypeFormats.decimal);
      assert.ok(config.jdbcEscape.ifnullFunction);
      assert.ok(config.jdbcParameterMarker);
      assert.ok(config.parserFallbacks.createView);
      assert.ok(config.literalTypes.string);
      assert.ok(config.dynamicTableFunctions.generateSeriesColumn);
      assert.ok(config.dynamicTableFunctions.enabledHandlers);
      assert.ok(config.selectStar);
      assert.ok(config.serializedSelect);
      assert.ok(config.metadata.builtinSchemaTables);
      assert.ok(config.metadata.describeFunctionColumns.length > 0);
      assert.ok(config.metadata.explainColumns.length > 0);
      assert.ok(config.metadata.showTableListingColumns?.length);
      assert.ok(config.metadata.commandResultColumns.length > 0);
      assert.deepStrictEqual(config.diagnosticRules.knownTableFunctionArgumentNames, [
        "file",
        "url",
      ]);
      assert.ok(config.diagnosticRules.virtualTableArgumentNames.includes("highlight"));
      const imports = [...source.matchAll(/^import\s+(?:type\s+)?[^;]+from\s+'([^']+)'/gm)].map(
        (match) => match[1],
      );
      assert.deepStrictEqual(imports, ["../types.js"]);
      const exports = [...source.matchAll(/^export\s+/gm)];
      assert.strictEqual(exports.length, 1);
      assert.match(source, /export const dialectConfig = /);
      const keys = [...source.matchAll(/^  ([a-zA-Z]\w*):/gm)].map((match) => match[1]);
      assert.deepStrictEqual(keys, DIALECT_CONFIG_KEY_ORDER, `${config.name} config key order`);
    }
  });

  it("preserves alias normalization and type display behavior", () => {
    assert.strictEqual(normalizeDialect("postgres"), "postgresql");
    assert.strictEqual(normalizeDialect("pg"), "postgresql");
    assert.strictEqual(normalizeDialect("sqlite3"), "sqlite");
    assert.strictEqual(normalizeDialect("mssql"), "tsql");
    assert.strictEqual(normalizeDialect("sqlserver"), "tsql");
    assert.strictEqual(normalizeDialect("bq"), "bigquery");
    assert.strictEqual(displayTypeName("text", "tsql"), "nvarchar(max)");
    assert.strictEqual(sqlTypeToJdbcType("jsonb", "postgres"), "OTHER");
    assert.strictEqual(normalizeJdbcBindTypes(["jdbc:JAVA_OBJECT"], "postgres")?.[0], "json");
  });

  it("keeps output type override data in dialect configs", () => {
    const mysql = dialectConfigs.find((config) => config.name === "mysql");
    const duckdb = dialectConfigs.find((config) => config.name === "duckdb");
    assert.strictEqual(mysql?.outputTypeOverrides.concat_text, "varchar(5)");
    assert.strictEqual(mysql?.outputTypeOverrides.enum_value, "enum('a','b')");
    assert.strictEqual(duckdb?.outputTypeOverrides["/^avg_/"], "double");
  });

  it("keeps fixed table function schemas in dialect configs", async () => {
    const postgres = dialectConfigs.find((config) => config.name === "postgresql");
    const generic = dialectConfigs.find((config) => config.name === "generic");
    const sqlite = dialectConfigs.find((config) => config.name === "sqlite");
    assert.strictEqual(postgres?.tableFunctions.pg_get_keywords?.[0]?.name, "word");
    assert.strictEqual(postgres?.tableFunctions.current_setting?.[0]?.name, "$alias");
    assert.deepStrictEqual(sqlite?.tableFunctions.json_each?.[0], { name: "key", type: "text" });
    assert.deepStrictEqual(generic?.tableFunctions, {});

    const result = await describeQuery({
      dialect: "postgres",
      sql: "select * from pg_catalog.pg_get_keywords() as k",
    });
    assert.deepStrictEqual(
      result.columns.slice(0, 2).map((column) => [column.name, column.type]),
      [
        ["word", "text"],
        ["catcode", "text"],
      ],
    );
  });

  it("keeps type inference policies in dialect configs", () => {
    const mysql = dialectConfigs.find((config) => config.name === "mysql");
    const trino = dialectConfigs.find((config) => config.name === "trino");
    const oracle = dialectConfigs.find((config) => config.name === "oracle");
    assert.strictEqual(mysql?.aggregate.avgDecimal, "mysqlPlus4");
    assert.strictEqual(mysql?.cast.adjustment, "mysqlCharBinaryLength");
    assert.strictEqual(trino?.windowFunctionTypes.row_number, "bigint");
    assert.strictEqual(oracle?.arithmetic.allNumberType, "decimal");
    assert.strictEqual(oracle?.specialColumnTypes.user, "text");
    assert.strictEqual(oracle?.qualifiedSpecialColumnTypes.nextval, "integer");
    assert.strictEqual(oracle?.commonTypes.resultDecimalInteger, "number");
    assert.strictEqual(oracle?.generatedNames.upper, "oracleUpperCall");
    const duckdb = dialectConfigs.find((config) => config.name === "duckdb");
    const tsql = dialectConfigs.find((config) => config.name === "tsql");
    assert.strictEqual(duckdb?.scalarFunctionTypePatterns["/^avg(?:_|$)/i"], "double");
    assert.strictEqual(tsql?.serializedSelect.forJson, "json");
    assert.strictEqual(tsql?.jdbcEscape.executeCall, true);
    assert.strictEqual(tsql?.jdbcEscape.currentDateExpression, "CAST(current_timestamp AS date)");
  });

  it("keeps builtin metadata schemas scoped to matching dialects", () => {
    const generic = dialectConfigs.find((config) => config.name === "generic");
    const postgres = dialectConfigs.find((config) => config.name === "postgresql");
    const oracle = dialectConfigs.find((config) => config.name === "oracle");
    const sqlite = dialectConfigs.find((config) => config.name === "sqlite");
    const names = (name: string) =>
      dialectConfigs
        .find((config) => config.name === name)
        ?.metadata.builtinSchemaTables.map(
          (table) => `${table.schema ? `${table.schema}.` : ""}${table.name}`,
        ) ?? [];
    assert.deepStrictEqual(generic?.metadata.builtinSchemaTables, []);
    assert.ok(names("postgresql").includes("pg_catalog.pg_tables"));
    assert.ok(!names("postgresql").includes("account_usage.query_history"));
    assert.ok(names("oracle").includes("all_users"));
    assert.ok(!names("oracle").includes("information_schema.jobs"));
    assert.ok(names("sqlite").includes("sqlite_master"));
    assert.ok(!names("sqlite").includes("pg_catalog.pg_tables"));
    assert.ok(names("trino").includes("information_schema.tables"));
    assert.ok(names("trino").includes("runtime.nodes"));
    assert.ok(names("datafusion").includes("information_schema.tables"));
    assert.ok(names("datafusion").includes("information_schema.df_settings"));
    assert.deepStrictEqual(names("spark"), []);
    assert.deepStrictEqual(names("solr"), []);
    assert.ok(postgres);
    assert.ok(oracle);
    assert.ok(sqlite);
  });

  it("uses scalar function type maps from dialect configs", async () => {
    const result = await describeQuery({
      dialect: "postgres",
      sql: "select gen_random_uuid() as id, st_distance(geom, geom) as distance, json_query_array(data, '$.x') as items from users",
      schema: {
        tables: [
          {
            name: "users",
            columns: [
              { name: "geom", type: "geometry" },
              { name: "data", type: "json" },
            ],
          },
        ],
      },
    });
    assert.deepStrictEqual(
      result.columns.map((column) => [column.name, column.type]),
      [
        ["id", "uuid"],
        ["distance", "numeric"],
        ["items", "array<json>"],
      ],
    );
  });

  it("describes a trivial query for every configured dialect", async () => {
    for (const config of dialectConfigs) {
      const result = await describeQuery({ dialect: config.name, sql: "select 1 as x" });
      assert.strictEqual(result.columns[0]?.name, "x");
    }
  });
});
