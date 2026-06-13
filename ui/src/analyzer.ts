import type {
  DescribeColumn,
  DescribeResult,
  StatementResultKind,
  StatementSummary,
} from "sqldesc";
import {
  describeQuery,
  getSupportedDialects,
  parseBinds,
  parseCreateTables,
  sqlTypeToJdbcType,
} from "sqldesc";

export { getSupportedDialects };
export type { DescribeColumn, DescribeResult, StatementResultKind, StatementSummary };

export interface AnalyzeColumn extends DescribeColumn {
  jdbcType?: string;
}

export interface AnalyzeResult extends Omit<DescribeResult, "columns" | "resultSets"> {
  jdbcEnabled: boolean;
  columns: AnalyzeColumn[];
  resultSets: Array<{ index: number; columns: AnalyzeColumn[] }>;
}

export interface AnalyzeInput {
  sql: string;
  dialect: string;
  binds: string;
  jdbc: boolean;
  schemaSql: string;
}

function enrichWithJdbcTypes(
  result: DescribeResult,
  dialect: string,
  jdbc: boolean,
): AnalyzeResult {
  const enrichColumn = (column: DescribeColumn): AnalyzeColumn =>
    jdbc ? { ...column, jdbcType: sqlTypeToJdbcType(column.type, dialect) } : column;

  return {
    ...result,
    jdbcEnabled: jdbc,
    columns: result.columns.map(enrichColumn),
    resultSets: result.resultSets.map((resultSet) => ({
      ...resultSet,
      columns: resultSet.columns.map(enrichColumn),
    })),
  };
}

export async function analyzeSql(input: AnalyzeInput): Promise<AnalyzeResult> {
  const schema = input.schemaSql.trim()
    ? { tables: parseCreateTables(input.schemaSql, input.dialect) }
    : undefined;

  const result = await describeQuery({
    sql: input.sql,
    dialect: input.dialect,
    binds: parseBinds(input.binds.trim() || undefined),
    jdbc: input.jdbc || undefined,
    schema,
  });

  return enrichWithJdbcTypes(result, input.dialect, input.jdbc);
}
