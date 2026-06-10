import type { DescribeResult } from 'sqldesc';
import { describeQuery, getSupportedDialects, parseCreateTables } from 'sqldesc';

export { getSupportedDialects };
export type { DescribeResult };

export interface AnalyzeInput {
  sql: string;
  dialect: string;
  binds: string;
  jdbc: boolean;
  schemaSql: string;
}

export async function analyzeSql(input: AnalyzeInput): Promise<DescribeResult> {
  const schema = input.schemaSql.trim()
    ? { tables: parseCreateTables(input.schemaSql, input.dialect) }
    : undefined;

  return describeQuery({
    sql: input.sql,
    dialect: input.dialect,
    binds: input.binds.trim() || undefined,
    jdbc: input.jdbc || undefined,
    schema,
  });
}
