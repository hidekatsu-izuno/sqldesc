import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { describeQuery } from '../dist/describe.js';

import type { DescribeResult, ValidationSchema } from '../dist/types.js';

const coverageSchema: ValidationSchema = {
  tables: [
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'integer' },
        { name: 'name', type: 'text' },
        { name: 'age', type: 'integer' },
        { name: 'dept', type: 'text' },
        { name: 'a', type: 'integer' },
        { name: 'b', type: 'integer' },
        { name: 'created_at', type: 'timestamp' },
        { name: 'tags', type: 'array<text>' },
        { name: 'attrs', type: 'map<text, integer>' },
      ],
    },
  ],
};

const staticResultCases = [
  ['generic', 'select id, name from users'],
  ['generic', "select reverse(name) r, initcap(name) i, concat_ws(',', name, name) c from users"],
  ['hive', 'select id, name from users'],
  ['databricks', 'select id, name from users'],
  ['databricks', 'describe detail users'],
  ['databricks', 'describe history users'],
  ['athena', 'select id, name from users'],
  ['teradata', 'select top 5 id, name from users'],
  ['doris', 'select id, name from users'],
  ['starrocks', 'select id, name from users'],
  ['materialize', 'select id, name from users'],
  ['materialize', 'show clusters'],
  ['materialize', 'show sources'],
  ['materialize', 'show sinks'],
  ['risingwave', 'select id, name from users'],
  ['singlestore', 'select id, name from users'],
  ['singlestore', 'show pipelines'],
  ['cockroachdb', 'select id, name from users'],
  ['cockroachdb', 'show constraints from users'],
  ['cockroachdb', 'show jobs'],
  ['tidb', 'select id, name from users'],
  ['solr', 'select id, name from users'],
  ['tableau', 'select id, name from users'],
  ['dune', 'select id, name from users'],
  ['fabric', 'select top 5 id, name from users'],
  ['drill', 'select id, name from users'],
  ['drill', 'show files'],
  ['dremio', 'select id, name from users'],
  ['exasol', 'select id, name from users'],
  ['exasol', 'select * from exa_all_tables'],
  ['datafusion', 'select id, name from users'],
  ['postgres', 'select * from generate_series(1,3)'],
  ['postgres', 'select * from pg_catalog.pg_get_keywords() as k'],
  ['postgres', 'select * from pg_settings as s'],
  ['postgres', 'select * from pg_stat_activity as a'],
  ['postgres', "select * from json_each_text('{\"a\":1}') as x"],
  ['postgres', 'select * from jsonb_each(\'{"a":1}\'::jsonb) as e'],
  ['postgres', "select * from pg_logical_slot_get_changes('slot', null, null) as c"],
  ['postgres', "select * from ts_debug('english', 'a fat cat') as t"],
  ['postgres', "select * from pg_stat_file('base') as s"],
  ['postgres', "select to_char(created_at, 'YYYY') c from users"],
  ['postgres', 'select array(select id from users) a'],
  ['postgres', 'show all'],
  ['postgres', 'show search_path'],
  ['postgres', 'select stddev(age) sd, variance(age) v, mode() within group (order by age) m from users'],
  ['postgres', 'select percentile_cont(0.5) within group (order by age) p from users'],
  ['postgres', 'select json_arrayagg(name) ja, json_objectagg(name, age) jo from users'],
  ['postgres', 'select ntile(4) over(order by age) nt from users'],
  ['postgres', 'select distinct on (dept) dept, name from users order by dept, age desc'],
  ['mysql', 'show create function f'],
  ['mysql', 'show engine innodb status'],
  ['mysql', 'show full processlist'],
  ['mysql', 'show relaylog events'],
  ['mysql', "select str_to_date(name, '%Y-%m-%d') d from users"],
  ['sqlite', 'pragma wal_checkpoint'],
  ['sqlite', 'pragma foreign_key_check'],
  ['sqlite', 'pragma table_list'],
  ['sqlite', "select * from pragma_table_info('users')"],
  ['snowflake', 'describe warehouse wh'],
  ['snowflake', 'describe database db'],
  ['snowflake', 'describe schema public'],
  ['snowflake', 'show primary keys'],
  ['snowflake', 'select query_id from account_usage.query_history'],
  ['snowflake', 'select try_to_number(name) n from users'],
  ['snowflake', "select object_construct('id', id, 'name', name) o, array_construct(id, age) a from users"],
  ['snowflake', 'select try_base64_decode_string(name) s, try_base64_decode_binary(name) b from users'],
  ['snowflake', 'select object_agg(name, age) o from users'],
  ['snowflake', 'select id, row_number() over(order by age) rn from users qualify rn = 1'],
  ['bigquery', 'select * from unnest(generate_array(1,3)) as x'],
  ['bigquery', 'select (select as struct id, name) s from users'],
  ['bigquery', 'select safe_add(age, 1) a, safe_divide(age, 2) d from users'],
  ['bigquery', 'select current_datetime() dt, current_timestamp() ts, current_time() tm'],
  ['bigquery', 'select approx_count_distinct(name) acd, any_value(name) av from users'],
  ['bigquery', 'select * except(age) replace(age + 1 as id) from users'],
  ['bigquery', 'select project_id from information_schema.schemata'],
  ['bigquery', 'select table_id from __TABLES__'],
  ['tsql', 'select session_id from sys.dm_exec_requests'],
  ['tsql', "select * from string_split('a,b', ',')"],
  ['tsql', "select * from openjson('{\"a\":1}') with (a int '$.a')"],
  ['oracle', 'select sid from v$session'],
  ['oracle', 'select * from json_table(\'{\"a\":1}\', \'$\' columns (a number path \'$.a\')) jt'],
  ['oracle', "select * from table(sys.odcivarchar2list('a','b')) t"],
  ['oracle', 'select * from users match_recognize (partition by dept order by created_at measures match_number() as match_no all rows per match pattern (A+) define A as age > 0) mr'],
  ['duckdb', 'select * from duckdb_tables()'],
  ['duckdb', "select * from glob('*.csv')"],
  ['duckdb', 'select list_value(id, age) xs, struct_pack(id := id, name := name) s from users'],
  ['duckdb', 'select list_transform(tags, x -> upper(x)) t from users'],
  ['duckdb', "select regexp_extract_all(name, '[a-z]+') r, regexp_split(name, ',') s from users"],
  ['duckdb', "select regexp_full_match(name, '[a-z]+') fm, regexp_instr(name, 'a') ri from users"],
  ['duckdb', 'pivot users on dept using sum(age)'],
  ['duckdb', 'unpivot users on a,b into name k value v'],
  ['clickhouse', 'show databases'],
  ['clickhouse', 'describe table users'],
  ['clickhouse', 'show create table users'],
  ['clickhouse', 'show processlist'],
  ['clickhouse', 'select * from numbers(3)'],
  ['presto', 'select * from sequence(1,3) as t(x)'],
  ['trino', "select * from unnest(map(array['a'], array[1])) as t(k, v)"],
  ['trino', "select transform(tags, x -> upper(x)) t, filter(tags, x -> x <> 'a') f from users"],
  ['trino', 'select reduce(array[1,2], 0, (s, x) -> s + x, s -> s) r'],
  ['trino', "select any_match(tags, x -> x = 'a') a, all_match(tags, x -> x <> '') b, none_match(tags, x -> x = 'z') n from users"],
  ['trino', 'show stats for users'],
  ['spark', 'describe function abs'],
  ['spark', 'describe database default'],
  ['spark', 'describe namespace default'],
  ['spark', 'describe table extended users'],
  ['spark', 'show current namespace'],
  ['spark', 'select id, pos, tag from users lateral view posexplode(tags) e as pos, tag'],
  ['spark', "select size(tags) sz, array_contains(tags, 'x') has from users"],
  ['spark', "select transform(tags, x -> upper(x)) t from users"],
  ['spark', "select array_join(tags, ',') j, array_sort(tags) s from users"],
  ['spark', "select exists(tags, x -> x = 'a') e, forall(tags, x -> x <> '') f from users"],
  ['spark', "select map_concat(attrs, map('b',2)) m from users"],
  ['hive', 'show databases'],
  ['databricks', 'show catalogs'],
  ['athena', 'show tables'],
  ['cockroachdb', 'show databases'],
  ['materialize', 'show views'],
  ['risingwave', 'show tables'],
  ['teradata', 'help table users'],
  ['redshift', 'select table_name from svv.tables'],
  ['druid', 'select segment_id from sys.segments'],
] as const;

const noResultCases = [
  ['postgres', 'lock table users'],
  ['sqlite', 'vacuum'],
  ['spark', 'msck repair table users'],
] as const;

describe('polyglot representative SQL coverage', () => {
  for (const [dialect, sql] of staticResultCases) {
    it(`statically describes ${dialect}: ${sql}`, async () => {
      const result = await describeQuery({ dialect, sql, schema: coverageSchema });

      assert.strictEqual(result.statements[0]?.resultKind, 'static');
      assert.ok(result.columns.length > 0);
      assert.ok(result.columns.length < 80);
      assert.strictEqual(unresolvedColumnCount(result), 0);
      assert.deepStrictEqual(result.warnings, []);
    });
  }

  for (const [dialect, sql] of noResultCases) {
    it(`classifies no-result ${dialect}: ${sql}`, async () => {
      const result = await describeQuery({ dialect, sql, schema: coverageSchema });

      assert.deepStrictEqual(result.columns, []);
      assert.strictEqual(result.statements[0]?.resultKind, 'none');
    });
  }
});

function unresolvedColumnCount(result: DescribeResult): number {
  return result.columns.filter((column) => column.type === 'unknown').length;
}
