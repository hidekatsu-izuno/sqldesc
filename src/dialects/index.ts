import { dialectConfig as athena } from "./athena.js";
import { dialectConfig as bigquery } from "./bigquery.js";
import { dialectConfig as clickhouse } from "./clickhouse.js";
import { dialectConfig as cockroachdb } from "./cockroachdb.js";
import { dialectConfig as databricks } from "./databricks.js";
import { dialectConfig as datafusion } from "./datafusion.js";
import { dialectConfig as doris } from "./doris.js";
import { dialectConfig as dremio } from "./dremio.js";
import { dialectConfig as drill } from "./drill.js";
import { dialectConfig as druid } from "./druid.js";
import { dialectConfig as duckdb } from "./duckdb.js";
import { dialectConfig as dune } from "./dune.js";
import { dialectConfig as exasol } from "./exasol.js";
import { dialectConfig as fabric } from "./fabric.js";
import { dialectConfig as generic } from "./generic.js";
import { dialectConfig as hive } from "./hive.js";
import { dialectConfig as materialize } from "./materialize.js";
import { dialectConfig as mysql } from "./mysql.js";
import { dialectConfig as oracle } from "./oracle.js";
import { dialectConfig as postgresql } from "./postgresql.js";
import { dialectConfig as presto } from "./presto.js";
import { dialectConfig as redshift } from "./redshift.js";
import { dialectConfig as risingwave } from "./risingwave.js";
import { dialectConfig as singlestore } from "./singlestore.js";
import { dialectConfig as snowflake } from "./snowflake.js";
import { dialectConfig as solr } from "./solr.js";
import { dialectConfig as spark } from "./spark.js";
import { dialectConfig as sqlite } from "./sqlite.js";
import { dialectConfig as starrocks } from "./starrocks.js";
import { dialectConfig as tableau } from "./tableau.js";
import { dialectConfig as teradata } from "./teradata.js";
import { dialectConfig as tidb } from "./tidb.js";
import { dialectConfig as trino } from "./trino.js";
import { dialectConfig as tsql } from "./tsql.js";
import type { DialectConfig } from "../types.js";

export const dialectConfigs = [
  athena,
  bigquery,
  clickhouse,
  cockroachdb,
  databricks,
  datafusion,
  doris,
  dremio,
  drill,
  druid,
  duckdb,
  dune,
  exasol,
  fabric,
  generic,
  hive,
  materialize,
  mysql,
  oracle,
  postgresql,
  presto,
  redshift,
  risingwave,
  singlestore,
  snowflake,
  solr,
  spark,
  sqlite,
  starrocks,
  tableau,
  teradata,
  tidb,
  trino,
  tsql,
] satisfies readonly DialectConfig[];

export const dialectConfigByName = new Map(dialectConfigs.map((config) => [config.name, config]));

export const dialectAliasByKey = new Map(
  dialectConfigs.flatMap((config) =>
    config.aliases.map((alias) => [dialectAliasKey(alias), config.name] as const),
  ),
);

export function dialectAliasKey(value: string): string {
  return value.toLowerCase().replace(/[-_\s]+/g, "");
}

export type { DialectConfig } from "../types.js";
