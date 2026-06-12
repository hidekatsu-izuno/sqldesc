import { spawnSync } from 'node:child_process';

const prefix = 'sqldesc-doc-cast';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function docker(args, options) {
  return run('docker', args, options);
}

function printSection(name, result) {
  console.log(`\n## ${name}`);
  console.log((result.stdout || result.stderr).trim() || '(no output)');
  if (result.status !== 0) {
    throw new Error(`${name} failed`);
  }
}

function cleanup() {
  for (const name of [
    `${prefix}-pg`,
    `${prefix}-mysql`,
    `${prefix}-mssql`,
    `${prefix}-oracle`,
  ]) {
    docker(['rm', '-f', name]);
  }
}

async function waitUntil(label, attempts, fn) {
  for (let i = 0; i < attempts; i += 1) {
    const result = fn();
    if (result.status === 0) return result;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`${label} did not become ready`);
}

function verifySqlite() {
  const sql = `
select
  typeof(cast('1' as integer)) as i,
  typeof(cast('1.5' as numeric)) as n,
  typeof(cast(1 as text)) as t,
  typeof(cast('abc' as blob)) as b;
select
  typeof(cast(null as text)) as null_text,
  typeof(coalesce(null, cast(1 as integer))) as co_i,
  typeof(cast('12:34:56.123' as text)) as tm,
  typeof(cast(1 as integer) + cast(1.25 as numeric)) as add_num;
select
  typeof(case when 1 then null else cast('x' as text) end) as case_null,
  typeof(case when 1 then cast(1 as integer) else cast(1.25 as numeric) end) as case_num,
  typeof((select null as u union all select cast('x' as text) limit 1)) as union_null,
  typeof(sum(cast(1.25 as numeric))) as sum_num,
  typeof(avg(cast(1 as integer))) as avg_int;
select
  typeof(cast('ab' as text) || cast('cde' as text)) as concat_text,
  typeof(date('2020-01-01', '+1 day')) as date_add,
  typeof(datetime('2020-01-01 00:00:00', '+1 day')) as datetime_add;
select
  typeof(cast(1.25 as numeric) * cast(2 as integer)) as mul_num,
  typeof(cast(5 as integer) / cast(2 as integer)) as div_int,
  typeof(round(cast(1.25 as numeric), 1)) as round_num,
  typeof(substr(cast('abcde' as text), 2, 3)) as substr_text,
  typeof(row_number() over ()) as rn,
  typeof(sum(cast(1.25 as numeric)) over ()) as win_sum,
  typeof(avg(cast(1 as integer)) over ()) as win_avg;
select
  typeof(coalesce(null, cast(1 as integer), cast(1.25 as numeric))) as co_num,
  typeof(coalesce(null, cast('x' as text), cast('yy' as text))) as co_text,
  typeof(nullif(cast(1.25 as numeric), cast(1 as integer))) as nullif_num,
  typeof(1) as lit_int,
  typeof(1.25) as lit_decimal,
  typeof('abc') as lit_text,
  typeof(null) as lit_null;
select
  typeof(julianday('2020-01-03') - julianday('2020-01-01')) as date_diff_days,
  typeof(julianday('2020-01-01 00:00:10') - julianday('2020-01-01 00:00:00')) as ts_diff_days,
  typeof(1 = 1) as pred_eq,
  typeof(null is null) as pred_null,
  typeof(2 between 1 and 3) as pred_between,
  typeof(2 in (1, 2, 3)) as pred_in;
select
  typeof(json_extract('{"name":"bob","items":[1,2]}', '$.items')) as json_items,
  typeof(json_extract('{"name":"bob","items":[1,2]}', '$.name')) as json_name,
  typeof(json_quote(json_extract('{"name":"bob","items":[1,2]}', '$.items'))) as json_items_text,
  typeof(json_type('{"name":"bob","items":[1,2]}', '$.items')) as json_type_name;
select
  typeof((select cast(1 as integer) as v union all select cast(1 as integer) limit 1)) as set_int,
  typeof((select cast('a' as text) as v union all select cast('bb' as text) limit 1)) as set_text,
  typeof((select date('2020-01-01') as v union all select datetime('2020-01-01 00:00:00') limit 1)) as set_temporal;
select
  typeof(cast('a' as text) || null) as concat_null,
  typeof(sum(cast(null as numeric))) as sum_null,
  typeof(avg(cast(null as integer))) as avg_null,
  typeof(count(null)) as count_null,
  typeof(min(cast(null as text))) as min_null,
  typeof(case when 1 then null else null end) as case_all_null,
  typeof(cast(5.00 as numeric) / cast(2.00 as numeric)) as div_decimal,
  typeof(cast(5.00 as numeric) / cast(2 as integer)) as div_decimal_int,
  typeof(datetime('2020-01-01 00:00:00+09:00')) as tz_text;
select
  typeof(coalesce(null, null, cast(1 as integer))) as co_null_typed,
  typeof(case when 0 then null when 0 then null else cast('x' as text) end) as case_nulls_typed,
  typeof(nullif(null, cast(1 as integer))) as nullif_null_typed,
  typeof(nullif(cast(1 as integer), null)) as nullif_typed_null,
  typeof(cast('a' as text) || cast('bc' as text)) as concat_widen,
  typeof(cast('' as text) || cast('x' as text)) as concat_empty,
  typeof(cast(1.25 as numeric) + cast(2 as integer)) as dec_plus_int,
  typeof(cast(1.25 as numeric) * cast(2.50 as numeric)) as dec_mul_dec,
  typeof(cast(5 as integer) % cast(2 as integer)) as mod_num,
  typeof(count(*)) as count_star,
  typeof(count(distinct cast(1 as integer))) as count_distinct,
  typeof(min(date('2020-01-01'))) as min_date,
  typeof(max(datetime('2020-01-01 00:00:00'))) as max_ts,
  typeof(date('2020-01-01', '+1 day')) as date_interval_plus,
  typeof(datetime('2020-01-01 00:00:00', '+1 day')) as ts_interval_plus,
  typeof(json_extract('{"n":1,"b":true,"s":"x","z":null}', '$.n')) as json_scalar_num,
  typeof(json_extract('{"n":1,"b":true,"s":"x","z":null}', '$.b')) as json_scalar_bool,
  typeof(json_extract('{"n":1,"b":true,"s":"x","z":null}', '$.z')) as json_scalar_null;
select
  typeof((select cast(1 as integer) intersect select cast(1 as integer))) as intersect_num,
  typeof((select cast('x' as text) except select cast('y' as text))) as except_text;
select
  typeof((select null as v union all select cast(1 as integer) limit 1)) as set_null_int,
  typeof((select null as v intersect select cast(null as text))) as intersect_null_text,
  typeof(case when 1 then cast(1 as integer) else cast('x' as text) end) as case_num_text,
  typeof(case when 1 then date('2020-01-01') else datetime('2020-01-01 00:00:00') end) as case_date_ts,
  typeof(sum(1 = 1)) as bool_sum,
  typeof(datetime('2020-01-01 00:00:00+09:00', 'utc')) as timezone_convert,
  typeof(json_extract('{"n":1,"b":true,"s":"x","z":null}', '$.s')) as json_unquote_text,
  typeof(coalesce(cast(1 as integer), cast(2 as integer))) as bind_coalesce_equiv,
  typeof(cast(cast('x' as text) as text)) as bind_cast_equiv,
  typeof(cast(1 as integer) + cast(2 as integer)) as bind_add_equiv;
select
  typeof(cast('あ' as text) collate nocase) as unicode_text,
  typeof(cast('x' as text)) as large_text,
  typeof(cast('abc' as blob)) as large_bytes,
  typeof(zeroblob(4)) as zero_blob,
  typeof(json_array(1,2)) as json_array_value,
  typeof(json_object('id',1,'name','x')) as json_object_value,
  typeof(randomblob(4)) as random_blob_value;
`;
  printSection('sqlite cast runtime types', docker(['run', '--rm', '-i', 'nouchka/sqlite3:latest'], { input: sql }));
}

function verifyDuckdb() {
  const sql = `
describe select
  cast('x' as varchar) as v,
  cast(1.23 as decimal(8,2)) as d,
  cast('2020-01-01 00:00:00' as timestamp) as ts,
  cast('00000000-0000-0000-0000-000000000000' as uuid) as u,
  cast('abc' as blob) as b;
describe select
  cast(null as varchar) as null_v,
  coalesce(null, cast('x' as varchar)) as co_v,
  cast('12:34:56.123' as time) as tm,
  interval '1 day' as iv,
  cast(1 as integer) + cast(1.25 as decimal(6,2)) as add_num;
select typeof(cast(1 as integer) + cast(1.25 as decimal(6,2))) as add_num_type;
describe select
  case when true then null else cast('x' as varchar) end as case_null,
  case when true then cast(1 as integer) else cast(1.25 as decimal(6,2)) end as case_num,
  case when true then cast('x' as char(3)) else cast('yy' as varchar) end as case_text;
describe select null::varchar as u union all select cast('x' as varchar);
select typeof(sum(cast(1.25 as decimal(6,2)))) as sum_num_type,
       typeof(avg(cast(1.25 as decimal(6,2)))) as avg_num_type,
       typeof(avg(cast(1 as integer))) as avg_int_type;
describe select
  cast('ab' as varchar) || cast('cde' as varchar) as concat_text,
  cast('2020-01-01' as date) + interval '1 day' as date_plus,
  cast('2020-01-01 00:00:00' as timestamp) + interval '1 day' as ts_plus;
describe select
  cast(1.25 as decimal(6,2)) * cast(2 as integer) as mul_num,
  cast(5 as integer) / cast(2 as integer) as div_int,
  round(cast(1.25 as decimal(6,2)), 1) as round_num,
  substring(cast('abcde' as varchar), 2, 3) as substr_text,
  row_number() over () as rn,
  sum(cast(1.25 as decimal(6,2))) over () as win_sum,
  avg(cast(1 as integer)) over () as win_avg;
describe select
  coalesce(null, cast(1 as integer), cast(1.25 as decimal(6,2))) as co_num,
  coalesce(null, cast('x' as char(3)), cast('yy' as varchar)) as co_text,
  nullif(cast(1.25 as decimal(6,2)), cast(1 as integer)) as nullif_num,
  1 as lit_int,
  1.25 as lit_decimal,
  'abc' as lit_text,
  null as lit_null,
  date '2020-01-01' as lit_date,
  timestamp '2020-01-01 00:00:00.123' as lit_ts;
describe select
  date '2020-01-03' - date '2020-01-01' as date_diff_days,
  timestamp '2020-01-01 00:00:10' - timestamp '2020-01-01 00:00:00' as ts_diff,
  1 = 1 as pred_eq,
  null is null as pred_null,
  2 between 1 and 3 as pred_between,
  2 in (1, 2, 3) as pred_in;
describe select
  json_extract('{"name":"bob","items":[1,2]}'::json, '$.items') as json_items,
  json_extract_string('{"name":"bob","items":[1,2]}'::json, '$.name') as json_name,
  json_type('{"name":"bob","items":[1,2]}'::json, '$.items') as json_type_name;
describe select cast(1 as integer) as set_num union all select cast(1 as bigint);
describe select cast('a' as char(3)) as set_text union all select cast('bb' as varchar);
describe select date '2020-01-01' as set_temporal union all select timestamp '2020-01-01 00:00:00';
describe select
  cast('a' as varchar) || null as concat_null,
  sum(cast(null as decimal(6,2))) as sum_null,
  avg(cast(null as integer)) as avg_null,
  count(null) as count_null,
  min(cast(null as varchar)) as min_null,
  case when true then null else null end as case_all_null,
  cast(5.00 as decimal(6,2)) / cast(2.00 as decimal(6,2)) as div_decimal,
  cast(5.00 as decimal(6,2)) / cast(2 as integer) as div_decimal_int,
  timestamp with time zone '2020-01-01 00:00:10+00' - timestamp with time zone '2020-01-01 00:00:00+00' as tstz_diff;
describe select
  coalesce(null, null, cast(1 as integer)) as co_null_typed,
  case when false then null when false then null else cast('x' as varchar) end as case_nulls_typed,
  nullif(null, cast(1 as integer)) as nullif_null_typed,
  nullif(cast(1 as integer), null) as nullif_typed_null,
  cast('a' as char(1)) || cast('bc' as varchar) as concat_widen,
  cast('' as varchar) || cast('x' as varchar) as concat_empty,
  cast(1.25 as decimal(6,2)) + cast(2 as integer) as dec_plus_int,
  cast(1.25 as decimal(6,2)) * cast(2.50 as decimal(6,2)) as dec_mul_dec,
  mod(cast(5 as integer), cast(2 as integer)) as mod_num,
  count(*) as count_star,
  count(distinct cast(1 as integer)) as count_distinct,
  min(date '2020-01-01') as min_date,
  max(timestamp '2020-01-01 00:00:00') as max_ts,
  date '2020-01-01' + interval '1 day' as date_interval_plus,
  timestamp '2020-01-01 00:00:00' + interval '1 day' as ts_interval_plus,
  json_extract('{"n":1,"b":true,"s":"x","z":null}'::json, '$.n') as json_scalar_num,
  json_extract('{"n":1,"b":true,"s":"x","z":null}'::json, '$.b') as json_scalar_bool,
  json_extract('{"n":1,"b":true,"s":"x","z":null}'::json, '$.z') as json_scalar_null;
describe select cast(1 as integer) as intersect_num intersect select cast(1 as bigint);
describe select cast('x' as char(3)) as except_text except select cast('y' as varchar);
describe select null::integer as set_null_int union all select cast(1 as integer);
describe select null::varchar as intersect_null_text intersect select cast(null as varchar);
describe select
  case when true then cast(1 as integer) else cast(2 as bigint) end as case_num_text,
  case when true then date '2020-01-01' else timestamp '2020-01-01 00:00:00' end as case_date_ts,
  bool_or(1 = 1) as bool_any,
  sum(case when 1 = 1 then 1 else 0 end) as bool_sum,
  timestamp '2020-01-01 00:00:00' at time zone 'Asia/Tokyo' as timezone_convert,
  json_extract_string('{"n":1,"b":true,"s":"x","z":null}'::json, '$.s') as json_unquote_text,
  coalesce(cast(1 as integer), cast(2 as integer)) as bind_coalesce_equiv,
  cast(cast('x' as varchar) as varchar) as bind_cast_equiv,
  cast(1 as integer) + cast(2 as integer) as bind_add_equiv;
describe select
  cast('あ' as varchar) as unicode_text,
  cast('x' as varchar) as large_text,
  cast('abc' as blob) as large_bytes,
  [1, 2] as int_array,
  struct_pack(id := 1, name := 'x') as struct_value,
  uuid() as uuid_value,
  1::hugeint as hugeint_value;
`;
  printSection('duckdb cast metadata', docker(['run', '--rm', '-i', 'duckdb/duckdb:latest'], { input: sql }));
}

async function verifyPostgres() {
  const name = `${prefix}-pg`;
  docker(['run', '-d', '--name', name, '-e', 'POSTGRES_PASSWORD=pass', 'postgres:16']);
  await waitUntil('postgres', 30, () => docker(['exec', name, 'pg_isready', '-U', 'postgres']));
  const sql = `
drop view if exists v_cast_probe;
drop view if exists v_edge_probe;
drop view if exists v_case_probe;
drop view if exists v_union_null_probe;
drop view if exists v_union_num_probe;
drop view if exists v_agg_probe;
drop view if exists v_concat_temporal_probe;
drop view if exists v_more_probe;
drop view if exists v_priority_literal_probe;
drop view if exists v_temporal_predicate_probe;
drop view if exists v_json_extract_probe;
drop view if exists v_set_resolution_probe;
drop view if exists v_remaining_probe;
drop view if exists v_extra_probe;
drop view if exists v_set_ops_probe;
drop view if exists v_final_probe;
drop view if exists v_final_expr_probe;
drop view if exists v_special_probe;
create view v_cast_probe as select
  cast('x' as varchar(12)) as v12,
  cast(1.23 as numeric(8,2)) as n82,
  cast('2020-01-01 00:00:00' as timestamp(3)) as ts3,
  cast('2020-01-01 00:00:00+00' as timestamptz) as tstz;
create view v_edge_probe as select
  cast(null as varchar(8)) as null_v,
  coalesce(null, cast('x' as char(4))) as co_c,
  cast('12:34:56.123' as time(3)) as tm3,
  cast('1 day' as interval) as iv,
  cast(1 as integer) + cast(1.25 as numeric(6,2)) as add_num;
create view v_case_probe as select
  case when true then null else cast('x' as varchar(5)) end as case_null,
  case when true then cast(1 as integer) else cast(1.25 as numeric(6,2)) end as case_num,
  case when true then cast('x' as char(3)) else cast('yy' as varchar(7)) end as case_text;
create view v_union_null_probe as select null::varchar(5) as u union all select cast('x' as varchar(5));
create view v_union_num_probe as select cast(1 as integer) as n union all select cast(1.25 as numeric(6,2));
create view v_agg_probe as select sum(x) as sum_num, avg(x) as avg_num, avg(i) as avg_int from (values (cast(1.25 as numeric(6,2)), cast(1 as integer))) t(x, i);
create view v_concat_temporal_probe as select
  cast('ab' as varchar(2)) || cast('cde' as varchar(3)) as concat_text,
  cast('2020-01-01' as date) + interval '1 day' as date_plus,
  cast('2020-01-01 00:00:00' as timestamp(3)) + interval '1 day' as ts_plus;
create view v_more_probe as select
  cast(1.25 as numeric(6,2)) * cast(2 as integer) as mul_num,
  cast(5 as integer) / cast(2 as integer) as div_int,
  round(cast(1.25 as numeric(6,2)), 1) as round_num,
  substring(cast('abcde' as varchar(5)) from 2 for 3) as substr_text,
  row_number() over () as rn,
  sum(cast(1.25 as numeric(6,2))) over () as win_sum,
  avg(cast(1 as integer)) over () as win_avg;
create view v_priority_literal_probe as select
  coalesce(null, cast(1 as integer), cast(1.25 as numeric(6,2))) as co_num,
  coalesce(null, cast('x' as char(3)), cast('yy' as varchar(7))) as co_text,
  nullif(cast(1.25 as numeric(6,2)), cast(1 as integer)) as nullif_num,
  1 as lit_int,
  1.25 as lit_decimal,
  'abc' as lit_text,
  null as lit_null,
  date '2020-01-01' as lit_date,
  timestamp '2020-01-01 00:00:00.123' as lit_ts;
create view v_temporal_predicate_probe as select
  date '2020-01-03' - date '2020-01-01' as date_diff_days,
  timestamp '2020-01-01 00:00:10' - timestamp '2020-01-01 00:00:00' as ts_diff,
  1 = 1 as pred_eq,
  null is null as pred_null,
  2 between 1 and 3 as pred_between,
  2 in (1, 2, 3) as pred_in;
create view v_json_extract_probe as select
  '{"name":"bob","items":[1,2]}'::jsonb -> 'items' as json_items,
  '{"name":"bob","items":[1,2]}'::jsonb ->> 'name' as json_name,
  jsonb_path_query_first('{"name":"bob","items":[1,2]}'::jsonb, '$.items') as json_path_item,
  jsonb_typeof('{"name":"bob","items":[1,2]}'::jsonb -> 'items') as json_type_name;
create view v_set_resolution_probe as
select cast(1 as integer) as set_num, cast('a' as char(3)) as set_text, date '2020-01-01' as set_temporal
union all
select cast(1 as bigint), cast('bb' as varchar(7)), timestamp '2020-01-01 00:00:00';
create view v_remaining_probe as select
  cast('a' as varchar(3)) || null as concat_null,
  sum(cast(null as numeric(6,2))) as sum_null,
  avg(cast(null as integer)) as avg_null,
  count(null) as count_null,
  min(cast(null as varchar(5))) as min_null,
  case when true then null else null end as case_all_null,
  cast(5.00 as numeric(6,2)) / cast(2.00 as numeric(6,2)) as div_decimal,
  cast(5.00 as numeric(6,2)) / cast(2 as integer) as div_decimal_int,
  timestamp with time zone '2020-01-01 00:00:10+00' - timestamp with time zone '2020-01-01 00:00:00+00' as tstz_diff;
create view v_extra_probe as select
  coalesce(null, null, cast(1 as integer)) as co_null_typed,
  case when false then null when false then null else cast('x' as varchar(5)) end as case_nulls_typed,
  nullif(null::integer, cast(1 as integer)) as nullif_null_typed,
  nullif(cast(1 as integer), null::integer) as nullif_typed_null,
  cast('a' as char(1)) || cast('bc' as varchar(4)) as concat_widen,
  cast('' as varchar(1)) || cast('x' as varchar(4)) as concat_empty,
  cast(1.25 as numeric(6,2)) + cast(2 as integer) as dec_plus_int,
  cast(1.25 as numeric(6,2)) * cast(2.50 as numeric(6,2)) as dec_mul_dec,
  mod(cast(5 as integer), cast(2 as integer)) as mod_num,
  count(*) as count_star,
  count(distinct cast(1 as integer)) as count_distinct,
  min(date '2020-01-01') as min_date,
  max(timestamp '2020-01-01 00:00:00') as max_ts,
  date '2020-01-01' + interval '1 day' as date_interval_plus,
  timestamp '2020-01-01 00:00:00' + interval '1 day' as ts_interval_plus,
  '{"n":1,"b":true,"s":"x","z":null}'::jsonb -> 'n' as json_scalar_num,
  '{"n":1,"b":true,"s":"x","z":null}'::jsonb -> 'b' as json_scalar_bool,
  '{"n":1,"b":true,"s":"x","z":null}'::jsonb -> 'z' as json_scalar_null;
create view v_set_ops_probe as
select cast(1 as integer) as intersect_num, cast('x' as char(3)) as except_text
intersect
select cast(1 as bigint), cast('x' as varchar(7))
except
select cast(2 as bigint), cast('y' as varchar(7));
create view v_final_probe as
select null::integer as set_null_int, null::varchar as intersect_null_text
union all
select cast(1 as integer), cast(null as varchar);
create view v_final_expr_probe as select
  case when true then cast(1 as integer) else cast(2 as bigint) end as case_num_text,
  case when true then date '2020-01-01' else timestamp '2020-01-01 00:00:00' end as case_date_ts,
  bool_or(1 = 1) as bool_any,
  sum(case when 1 = 1 then 1 else 0 end) as bool_sum,
  timestamp '2020-01-01 00:00:00' at time zone 'Asia/Tokyo' as timezone_convert,
  '{"n":1,"b":true,"s":"x","z":null}'::jsonb ->> 's' as json_unquote_text,
  coalesce(cast(1 as integer), cast(2 as integer)) as bind_coalesce_equiv,
  cast(cast('x' as varchar) as varchar) as bind_cast_equiv,
  cast(1 as integer) + cast(2 as integer) as bind_add_equiv;
create view v_special_probe as select
  cast('あ' as varchar(4)) collate "C" as unicode_text,
  cast('x' as text) as large_text,
  decode('AB', 'hex') as large_bytes,
  array[1, 2] as int_array,
  jsonb_build_object('id', 1, 'name', 'x') as json_object_value,
  '00000000-0000-0000-0000-000000000000'::uuid as uuid_value,
  inet '127.0.0.1' as inet_value;
select column_name, data_type, character_maximum_length, numeric_precision, numeric_scale, datetime_precision
from information_schema.columns
where table_name = 'v_cast_probe'
order by ordinal_position;
select column_name, data_type, character_maximum_length, numeric_precision, numeric_scale, datetime_precision
from information_schema.columns
where table_name = 'v_edge_probe'
order by ordinal_position;
select table_name, column_name, data_type, character_maximum_length, numeric_precision, numeric_scale, datetime_precision
from information_schema.columns
where table_name in ('v_case_probe', 'v_union_null_probe', 'v_union_num_probe', 'v_agg_probe', 'v_concat_temporal_probe', 'v_more_probe', 'v_priority_literal_probe', 'v_temporal_predicate_probe', 'v_json_extract_probe', 'v_set_resolution_probe', 'v_remaining_probe', 'v_extra_probe', 'v_set_ops_probe', 'v_final_probe', 'v_final_expr_probe', 'v_special_probe')
order by table_name, ordinal_position;
`;
  printSection('postgres cast metadata', docker(['exec', '-i', name, 'psql', '-U', 'postgres', '-At', '-F', '|', '-c', sql]));
}

async function verifyMysql() {
  const name = `${prefix}-mysql`;
  docker(['run', '-d', '--name', name, '-e', 'MYSQL_ALLOW_EMPTY_PASSWORD=yes', 'mysql:8.4']);
  await waitUntil('mysql', 45, () => docker(['exec', name, 'mysqladmin', 'ping', '-h127.0.0.1', '-uroot']));
  const sql = `
create database if not exists sqldesc;
use sqldesc;
drop view if exists v_cast_probe;
drop view if exists v_edge_probe;
drop view if exists v_case_probe;
drop view if exists v_union_null_probe;
drop view if exists v_union_num_probe;
drop view if exists v_agg_probe;
drop view if exists v_concat_temporal_probe;
drop view if exists v_more_probe;
drop view if exists v_priority_literal_probe;
drop view if exists v_temporal_predicate_probe;
drop view if exists v_json_extract_probe;
drop view if exists v_set_resolution_probe;
drop view if exists v_remaining_probe;
drop view if exists v_extra_probe;
drop view if exists v_set_ops_probe;
drop view if exists v_final_probe;
drop view if exists v_final_expr_probe;
create view v_cast_probe as select
  cast('x' as char(12)) as c12,
  cast(1.23 as decimal(8,2)) as d82,
  cast('2020-01-01 00:00:00.123' as datetime(3)) as dt3,
  cast('ab' as binary(4)) as b4;
create view v_edge_probe as select
  cast(null as char(8)) as null_v,
  coalesce(null, cast('x' as char(4))) as co_c,
  cast('12:34:56.123' as time(3)) as tm3,
  cast('2020-01-01' as date) as dt,
  cast(1 as signed) + cast(1.25 as decimal(6,2)) as add_num;
create view v_case_probe as select
  case when true then null else cast('x' as char(5)) end as case_null,
  case when true then cast(1 as signed) else cast(1.25 as decimal(6,2)) end as case_num,
  case when true then cast('x' as char(3)) else cast('yy' as char(7)) end as case_text;
create view v_union_null_probe as select cast(null as char(5)) as u union all select cast('x' as char(5));
create view v_union_num_probe as select cast(1 as signed) as n union all select cast(1.25 as decimal(6,2));
create view v_agg_probe as select sum(x) as sum_num, avg(x) as avg_num, avg(i) as avg_int from (select cast(1.25 as decimal(6,2)) x, cast(1 as signed) i) t;
create view v_concat_temporal_probe as select
  concat(cast('ab' as char(2)), cast('cde' as char(3))) as concat_text,
  date_add(cast('2020-01-01' as date), interval 1 day) as date_plus,
  timestampadd(day, 1, cast('2020-01-01 00:00:00.123' as datetime(3))) as ts_plus;
create view v_more_probe as select
  cast(1.25 as decimal(6,2)) * cast(2 as signed) as mul_num,
  cast(5 as signed) / cast(2 as signed) as div_int,
  round(cast(1.25 as decimal(6,2)), 1) as round_num,
  substring(cast('abcde' as char(5)), 2, 3) as substr_text,
  row_number() over () as rn,
  sum(cast(1.25 as decimal(6,2))) over () as win_sum,
  avg(cast(1 as signed)) over () as win_avg;
create view v_priority_literal_probe as select
  coalesce(null, cast(1 as signed), cast(1.25 as decimal(6,2))) as co_num,
  coalesce(null, cast('x' as char(3)), cast('yy' as char(7))) as co_text,
  nullif(cast(1.25 as decimal(6,2)), cast(1 as signed)) as nullif_num,
  ifnull(cast(null as char(3)), cast('x' as char(7))) as ifnull_text,
  1 as lit_int,
  1.25 as lit_decimal,
  'abc' as lit_text,
  null as lit_null,
  date '2020-01-01' as lit_date,
  timestamp '2020-01-01 00:00:00.123' as lit_ts;
create view v_temporal_predicate_probe as select
  datediff(date '2020-01-03', date '2020-01-01') as date_diff_days,
  timestampdiff(second, timestamp '2020-01-01 00:00:00', timestamp '2020-01-01 00:00:10') as ts_diff_seconds,
  1 = 1 as pred_eq,
  null is null as pred_null,
  2 between 1 and 3 as pred_between,
  2 in (1, 2, 3) as pred_in;
create view v_json_extract_probe as select
  json_extract(cast('{"name":"bob","items":[1,2]}' as json), '$.items') as json_items,
  json_unquote(json_extract(cast('{"name":"bob","items":[1,2]}' as json), '$.name')) as json_name,
  json_type(json_extract(cast('{"name":"bob","items":[1,2]}' as json), '$.items')) as json_type_name;
create view v_set_resolution_probe as
select cast(1 as signed) as set_num, cast('a' as char(3)) as set_text, date '2020-01-01' as set_temporal
union all
select cast(1 as unsigned), cast('bb' as char(7)), timestamp '2020-01-01 00:00:00';
create view v_remaining_probe as select
  concat(cast('a' as char(3)), null) as concat_null,
  sum(cast(null as decimal(6,2))) as sum_null,
  avg(cast(null as signed)) as avg_null,
  count(null) as count_null,
  min(cast(null as char(5))) as min_null,
  case when true then null else null end as case_all_null,
  cast(5.00 as decimal(6,2)) / cast(2.00 as decimal(6,2)) as div_decimal,
  cast(5.00 as decimal(6,2)) / cast(2 as signed) as div_decimal_int,
  timestampdiff(second, timestamp '2020-01-01 00:00:00+00:00', timestamp '2020-01-01 00:00:10+00:00') as tz_diff_seconds;
create view v_extra_probe as select
  coalesce(null, null, cast(1 as signed)) as co_null_typed,
  case when false then null when false then null else cast('x' as char(5)) end as case_nulls_typed,
  nullif(cast(null as signed), cast(1 as signed)) as nullif_null_typed,
  nullif(cast(1 as signed), cast(null as signed)) as nullif_typed_null,
  concat(cast('a' as char(1)), cast('bc' as char(4))) as concat_widen,
  concat(cast('' as char(1)), cast('x' as char(4))) as concat_empty,
  cast(1.25 as decimal(6,2)) + cast(2 as signed) as dec_plus_int,
  cast(1.25 as decimal(6,2)) * cast(2.50 as decimal(6,2)) as dec_mul_dec,
  mod(cast(5 as signed), cast(2 as signed)) as mod_num,
  count(*) as count_star,
  count(distinct cast(1 as signed)) as count_distinct,
  min(date '2020-01-01') as min_date,
  max(timestamp '2020-01-01 00:00:00') as max_ts,
  date_add(date '2020-01-01', interval 1 day) as date_interval_plus,
  timestampadd(day, 1, timestamp '2020-01-01 00:00:00') as ts_interval_plus,
  json_extract(cast('{"n":1,"b":true,"s":"x","z":null}' as json), '$.n') as json_scalar_num,
  json_extract(cast('{"n":1,"b":true,"s":"x","z":null}' as json), '$.b') as json_scalar_bool,
  json_extract(cast('{"n":1,"b":true,"s":"x","z":null}' as json), '$.z') as json_scalar_null;
create view v_set_ops_probe as
select cast(1 as signed) as intersect_num, cast('x' as char(3)) as except_text
intersect
select cast(1 as unsigned), cast('x' as char(7))
except
select cast(2 as unsigned), cast('y' as char(7));
create view v_final_probe as
select cast(null as signed) as set_null_int, cast(null as char(5)) as intersect_null_text
union all
select cast(1 as signed), cast(null as char(5));
create view v_final_expr_probe as select
  case when true then cast(1 as signed) else cast(2 as unsigned) end as case_num_text,
  case when true then date '2020-01-01' else timestamp '2020-01-01 00:00:00' end as case_date_ts,
  max(1 = 1) as bool_any,
  sum(1 = 1) as bool_sum,
  convert_tz(timestamp '2020-01-01 00:00:00', '+00:00', '+09:00') as timezone_convert,
  json_unquote(json_extract(cast('{"n":1,"b":true,"s":"x","z":null}' as json), '$.s')) as json_unquote_text,
  coalesce(cast(1 as signed), cast(2 as signed)) as bind_coalesce_equiv,
  cast(cast('x' as char(5)) as char(5)) as bind_cast_equiv,
  cast(1 as signed) + cast(2 as signed) as bind_add_equiv;
drop table if exists t_special_probe;
create table t_special_probe(
  unicode_text varchar(4) character set utf8mb4 collate utf8mb4_0900_ai_ci,
  large_text longtext,
  large_bytes longblob,
  enum_value enum('a','b'),
  set_value set('a','b')
);
create view v_special_probe as select
  unicode_text,
  large_text,
  large_bytes,
  enum_value,
  set_value,
  json_array(1, 2) as json_array_value,
  json_object('id', 1, 'name', 'x') as json_object_value,
  uuid() as uuid_value
from t_special_probe;
select column_name, column_type, data_type, character_maximum_length, numeric_precision, numeric_scale, datetime_precision
from information_schema.columns
where table_schema = 'sqldesc' and table_name = 'v_cast_probe'
order by ordinal_position;
select column_name, column_type, data_type, character_maximum_length, numeric_precision, numeric_scale, datetime_precision
from information_schema.columns
where table_schema = 'sqldesc' and table_name = 'v_edge_probe'
order by ordinal_position;
select table_name, column_name, column_type, data_type, character_maximum_length, numeric_precision, numeric_scale, datetime_precision
from information_schema.columns
where table_schema = 'sqldesc' and table_name in ('v_case_probe', 'v_union_null_probe', 'v_union_num_probe', 'v_agg_probe', 'v_concat_temporal_probe', 'v_more_probe', 'v_priority_literal_probe', 'v_temporal_predicate_probe', 'v_json_extract_probe', 'v_set_resolution_probe', 'v_remaining_probe', 'v_extra_probe', 'v_set_ops_probe', 'v_final_probe', 'v_final_expr_probe', 'v_special_probe')
order by table_name, ordinal_position;
`;
  printSection('mysql cast metadata', docker(['exec', '-i', name, 'mysql', '-h127.0.0.1', '-uroot', '-N', '-B'], { input: sql }));
}

async function verifySqlServer() {
  const name = `${prefix}-mssql`;
  docker(['run', '-d', '--name', name, '-e', 'ACCEPT_EULA=Y', '-e', 'MSSQL_SA_PASSWORD=Str0ngPass!234', 'mcr.microsoft.com/mssql/server:2022-latest']);
  await waitUntil('sqlserver', 45, () => docker(['exec', name, '/opt/mssql-tools18/bin/sqlcmd', '-S', 'localhost', '-U', 'sa', '-P', 'Str0ngPass!234', '-C', '-Q', 'select 1']));
  const sql = `
set nocount on;
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(N''x'' as nvarchar(12)) as n12, cast(1.23 as decimal(8,2)) as d82, cast(''2020-01-01T00:00:00.123'' as datetime2(3)) as dt3, convert(varbinary(4), 171) as b4',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(null as nvarchar(8)) as null_v, coalesce(null, cast(N''x'' as nchar(4))) as co_c, cast(''12:34:56.123'' as time(3)) as tm3, cast(''2020-01-01T00:00:00.123+09:00'' as datetimeoffset(3)) as dto3, cast(1 as int) + cast(1.25 as decimal(6,2)) as add_num',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select case when 1=1 then null else cast(N''x'' as nvarchar(5)) end as case_null, case when 1=1 then cast(1 as int) else cast(1.25 as decimal(6,2)) end as case_num, case when 1=1 then cast(N''x'' as nchar(3)) else cast(N''yy'' as nvarchar(7)) end as case_text',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(null as nvarchar(5)) as u union all select cast(N''x'' as nvarchar(5))',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(1 as int) as n union all select cast(1.25 as decimal(6,2))',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select sum(cast(1.25 as decimal(6,2))) as sum_num, avg(cast(1.25 as decimal(6,2))) as avg_num, avg(cast(1 as int)) as avg_int',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(N''ab'' as nvarchar(2)) + cast(N''cde'' as nvarchar(3)) as concat_text, dateadd(day, 1, cast(''2020-01-01'' as date)) as date_plus, dateadd(day, 1, cast(''2020-01-01T00:00:00.123'' as datetime2(3))) as ts_plus',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(1.25 as decimal(6,2)) * cast(2 as int) as mul_num, cast(5 as int) / cast(2 as int) as div_int, round(cast(1.25 as decimal(6,2)), 1) as round_num, substring(cast(N''abcde'' as nvarchar(5)), 2, 3) as substr_text, row_number() over (order by (select 1)) as rn, sum(cast(1.25 as decimal(6,2))) over () as win_sum, avg(cast(1 as int)) over () as win_avg',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select coalesce(null, cast(1 as int), cast(1.25 as decimal(6,2))) as co_num, coalesce(null, cast(N''x'' as nchar(3)), cast(N''yy'' as nvarchar(7))) as co_text, nullif(cast(1.25 as decimal(6,2)), cast(1 as int)) as nullif_num, isnull(cast(null as nchar(3)), cast(N''x'' as nvarchar(7))) as isnull_text, 1 as lit_int, 1.25 as lit_decimal, N''abc'' as lit_text, null as lit_null, cast(''2020-01-01'' as date) as lit_date, cast(''2020-01-01T00:00:00.123'' as datetime2(3)) as lit_ts',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select datediff(day, cast(''2020-01-01'' as date), cast(''2020-01-03'' as date)) as date_diff_days, datediff(second, cast(''2020-01-01T00:00:00'' as datetime2(0)), cast(''2020-01-01T00:00:10'' as datetime2(0))) as ts_diff_seconds, cast(iif(1 = 1, 1, 0) as bit) as pred_eq, cast(iif(null is null, 1, 0) as bit) as pred_null, cast(iif(2 between 1 and 3, 1, 0) as bit) as pred_between, cast(iif(2 in (1, 2, 3), 1, 0) as bit) as pred_in',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select json_query(N''{"name":"bob","items":[1,2]}'', ''$.items'') as json_items, json_value(N''{"name":"bob","items":[1,2]}'', ''$.name'') as json_name, isjson(N''{"name":"bob","items":[1,2]}'') as json_is_valid',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(1 as int) as set_num, cast(N''a'' as nchar(3)) as set_text, cast(''2020-01-01'' as date) as set_temporal union all select cast(1 as bigint), cast(N''bb'' as nvarchar(7)), cast(''2020-01-01T00:00:00'' as datetime2(0))',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(N''a'' as nvarchar(3)) + null as concat_null, concat(cast(N''a'' as nvarchar(3)), null) as concat_func_null, sum(cast(null as decimal(6,2))) as sum_null, avg(cast(null as int)) as avg_null, count(cast(null as int)) as count_null, min(cast(null as nvarchar(5))) as min_null, case when 1=1 then cast(null as int) else cast(null as int) end as case_all_null, cast(5.00 as decimal(6,2)) / cast(2.00 as decimal(6,2)) as div_decimal, cast(5.00 as decimal(6,2)) / cast(2 as int) as div_decimal_int, datediff(second, cast(''2020-01-01T00:00:00+00:00'' as datetimeoffset(0)), cast(''2020-01-01T00:00:10+00:00'' as datetimeoffset(0))) as dto_diff_seconds',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select coalesce(null, null, cast(1 as int)) as co_null_typed, case when 1=0 then null when 1=0 then null else cast(N''x'' as nvarchar(5)) end as case_nulls_typed, nullif(cast(null as int), cast(1 as int)) as nullif_null_typed, nullif(cast(1 as int), cast(null as int)) as nullif_typed_null, cast(N''a'' as nchar(1)) + cast(N''bc'' as nvarchar(4)) as concat_widen, cast(N'''' as nvarchar(1)) + cast(N''x'' as nvarchar(4)) as concat_empty, cast(1.25 as decimal(6,2)) + cast(2 as int) as dec_plus_int, cast(1.25 as decimal(6,2)) * cast(2.50 as decimal(6,2)) as dec_mul_dec, cast(5 as int) % cast(2 as int) as mod_num, count(*) as count_star, count(distinct cast(1 as int)) as count_distinct, min(cast(''2020-01-01'' as date)) as min_date, max(cast(''2020-01-01T00:00:00'' as datetime2(0))) as max_ts, dateadd(day, 1, cast(''2020-01-01'' as date)) as date_interval_plus, dateadd(day, 1, cast(''2020-01-01T00:00:00'' as datetime2(0))) as ts_interval_plus, json_value(N''{"n":1,"b":true,"s":"x","z":null}'', ''$.n'') as json_scalar_num, json_value(N''{"n":1,"b":true,"s":"x","z":null}'', ''$.b'') as json_scalar_bool, json_value(N''{"n":1,"b":true,"s":"x","z":null}'', ''$.z'') as json_scalar_null',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(1 as int) as intersect_num, cast(N''x'' as nchar(3)) as except_text intersect select cast(1 as bigint), cast(N''x'' as nvarchar(7)) except select cast(2 as bigint), cast(N''y'' as nvarchar(7))',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(null as int) as set_null_int, cast(null as nvarchar(5)) as intersect_null_text union all select cast(1 as int), cast(null as nvarchar(5))',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select case when 1=1 then cast(1 as int) else cast(2 as bigint) end as case_num_text, case when 1=1 then cast(''2020-01-01'' as datetime2(0)) else cast(''2020-01-01T00:00:00'' as datetime2(0)) end as case_date_ts, max(iif(1 = 1, 1, 0)) as bool_any, sum(iif(1 = 1, 1, 0)) as bool_sum, cast(''2020-01-01T00:00:00'' as datetime2(0)) at time zone ''Tokyo Standard Time'' as timezone_convert, json_value(N''{"n":1,"b":true,"s":"x","z":null}'', ''$.s'') as json_unquote_text, coalesce(cast(1 as int), cast(2 as int)) as bind_coalesce_equiv, cast(cast(N''x'' as nvarchar(5)) as nvarchar(5)) as bind_cast_equiv, cast(1 as int) + cast(2 as int) as bind_add_equiv',
  null,
  0
);
select name, system_type_name
from sys.dm_exec_describe_first_result_set(
  N'select cast(N''あ'' as nvarchar(4)) collate Japanese_CI_AS as unicode_text, cast(N''x'' as nvarchar(max)) as large_text, cast(0xAB as varbinary(max)) as large_bytes, json_query(N''[1,2]'') as json_array_value, cast(''<a />'' as xml) as xml_value, cast(''00000000-0000-0000-0000-000000000000'' as uniqueidentifier) as uuid_value, cast(1.23 as money) as money_value',
  null,
  0
);
`;
  printSection('sqlserver cast metadata', docker(['exec', '-i', name, '/opt/mssql-tools18/bin/sqlcmd', '-S', 'localhost', '-U', 'sa', '-P', 'Str0ngPass!234', '-C', '-W', '-h', '-1'], { input: sql }));
}

async function verifyOracle() {
  const name = `${prefix}-oracle`;
  docker(['run', '-d', '--name', name, '-e', 'ORACLE_PASSWORD=pass', 'gvenzl/oracle-xe:21-slim']);
  await waitUntil('oracle', 90, () => docker(['exec', name, 'healthcheck.sh']));
  const setup = `
whenever sqlerror continue
drop user sqldesc cascade;
whenever sqlerror exit sql.sqlcode
create user sqldesc identified by pass quota unlimited on users;
grant connect, resource to sqldesc;
grant create view to sqldesc;
exit
`;
  docker(['exec', '-i', name, 'sqlplus', '-s', 'system/pass@//localhost/XEPDB1'], { input: setup });
  const sql = `
set heading off feedback off pagesize 200 linesize 200 trimspool on
create or replace view v_cast_probe as select
  cast('x' as varchar2(12)) v12,
  cast(1.23 as number(8,2)) n82,
  cast(timestamp '2020-01-01 00:00:00.123' as timestamp(3)) ts3,
  cast(hextoraw('AB') as raw(4)) r4
from dual;
create or replace view v_edge_probe as select
  cast(null as varchar2(8)) null_v,
  coalesce(null, cast('x' as char(4))) co_c,
  cast(timestamp '2020-01-01 00:00:00.123' as timestamp(3) with time zone) tstz3,
  numtodsinterval(1, 'DAY') iv,
  cast(1 as number(6,0)) + cast(1.25 as number(6,2)) add_num
from dual;
create or replace view v_case_probe as select
  case when 1=1 then null else cast('x' as varchar2(5)) end case_null,
  case when 1=1 then cast(1 as number(6,0)) else cast(1.25 as number(6,2)) end case_num,
  case when 1=1 then cast('x' as char(3)) else cast('yy' as varchar2(7)) end case_text
from dual;
create or replace view v_union_null_probe as select cast(null as varchar2(5)) u from dual union all select cast('x' as varchar2(5)) from dual;
create or replace view v_union_num_probe as select cast(1 as number(6,0)) n from dual union all select cast(1.25 as number(6,2)) from dual;
create or replace view v_agg_probe as select sum(cast(1.25 as number(6,2))) sum_num, avg(cast(1.25 as number(6,2))) avg_num, avg(cast(1 as number(6,0))) avg_int from dual;
create or replace view v_concat_temporal_probe as select
  cast('ab' as varchar2(2)) || cast('cde' as varchar2(3)) concat_text,
  cast(date '2020-01-01' + 1 as date) date_plus,
  cast(timestamp '2020-01-01 00:00:00.123' + numtodsinterval(1, 'DAY') as timestamp(3)) ts_plus
from dual;
create or replace view v_more_probe as select
  cast(1.25 as number(6,2)) * cast(2 as number(6,0)) mul_num,
  cast(5 as number(6,0)) / cast(2 as number(6,0)) div_int,
  round(cast(1.25 as number(6,2)), 1) round_num,
  substr(cast('abcde' as varchar2(5)), 2, 3) substr_text,
  row_number() over (order by 1) rn,
  sum(cast(1.25 as number(6,2))) over () win_sum,
  avg(cast(1 as number(6,0))) over () win_avg
from dual;
create or replace view v_priority_literal_probe as select
  coalesce(null, cast(1 as number(6,0)), cast(1.25 as number(6,2))) co_num,
  coalesce(null, cast('x' as char(3)), cast('yy' as varchar2(7))) co_text,
  nullif(cast(1.25 as number(6,2)), cast(1 as number(6,0))) nullif_num,
  nvl(cast(null as char(3)), cast('x' as varchar2(7))) nvl_text,
  1 lit_int,
  1.25 lit_decimal,
  'abc' lit_text,
  null lit_null,
  date '2020-01-01' lit_date,
  timestamp '2020-01-01 00:00:00.123' lit_ts
from dual;
create or replace view v_temporal_predicate_probe as select
  date '2020-01-03' - date '2020-01-01' date_diff_days,
  timestamp '2020-01-01 00:00:10' - timestamp '2020-01-01 00:00:00' ts_diff,
  case when 1 = 1 then 1 else 0 end pred_eq,
  case when null is null then 1 else 0 end pred_null,
  case when 2 between 1 and 3 then 1 else 0 end pred_between,
  case when 2 in (1, 2, 3) then 1 else 0 end pred_in
from dual;
create or replace view v_json_extract_probe as select
  json_query('{"name":"bob","items":[1,2]}', '$.items') json_items,
  json_value('{"name":"bob","items":[1,2]}', '$.name') json_name,
  json_value('{"name":"bob","items":[1,2]}', '$.items[0]' returning number) json_first_num
from dual;
create or replace view v_set_resolution_probe as
select cast(1 as number(6,0)) set_num, cast('a' as char(3)) set_text, date '2020-01-01' set_temporal from dual
union all
select cast(1 as number(19,0)), cast('bb' as varchar2(7)), timestamp '2020-01-01 00:00:00' from dual;
create or replace view v_remaining_probe as select
  cast('a' as varchar2(3)) || null concat_null,
  sum(cast(null as number(6,2))) sum_null,
  avg(cast(null as number(6,0))) avg_null,
  count(null) count_null,
  min(cast(null as varchar2(5))) min_null,
  case when 1=1 then null else null end case_all_null,
  cast(5.00 as number(6,2)) / cast(2.00 as number(6,2)) div_decimal,
  cast(5.00 as number(6,2)) / cast(2 as number(6,0)) div_decimal_int,
  timestamp '2020-01-01 00:00:10' at time zone 'UTC' - timestamp '2020-01-01 00:00:00' at time zone 'UTC' tstz_diff
from dual;
create or replace view v_extra_probe as select
  coalesce(null, null, cast(1 as number(6,0))) co_null_typed,
  case when 1=0 then null when 1=0 then null else cast('x' as varchar2(5)) end case_nulls_typed,
  nullif(cast(null as number(6,0)), cast(1 as number(6,0))) nullif_null_typed,
  nullif(cast(1 as number(6,0)), cast(null as number(6,0))) nullif_typed_null,
  cast('a' as char(1)) || cast('bc' as varchar2(4)) concat_widen,
  cast('' as varchar2(1)) || cast('x' as varchar2(4)) concat_empty,
  cast(1.25 as number(6,2)) + cast(2 as number(6,0)) dec_plus_int,
  cast(1.25 as number(6,2)) * cast(2.50 as number(6,2)) dec_mul_dec,
  mod(cast(5 as number(6,0)), cast(2 as number(6,0))) mod_num,
  count(*) count_star,
  count(distinct cast(1 as number(6,0))) count_distinct,
  min(date '2020-01-01') min_date,
  max(timestamp '2020-01-01 00:00:00') max_ts,
  date '2020-01-01' + 1 date_interval_plus,
  timestamp '2020-01-01 00:00:00' + numtodsinterval(1, 'DAY') ts_interval_plus,
  json_value('{"n":1,"b":true,"s":"x","z":null}', '$.n' returning number) json_scalar_num,
  json_value('{"n":1,"b":true,"s":"x","z":null}', '$.b') json_scalar_bool,
  json_value('{"n":1,"b":true,"s":"x","z":null}', '$.z') json_scalar_null
from dual;
create or replace view v_set_ops_probe as
select cast(1 as number(6,0)) intersect_num, cast('x' as char(3)) minus_text from dual
intersect
select cast(1 as number(19,0)), cast('x' as varchar2(7)) from dual
minus
select cast(2 as number(19,0)), cast('y' as varchar2(7)) from dual;
create or replace view v_final_probe as
select cast(null as number(6,0)) set_null_int, cast(null as varchar2(5)) intersect_null_text from dual
union all
select cast(1 as number(6,0)), cast(null as varchar2(5)) from dual;
create or replace view v_final_expr_probe as select
  case when 1=1 then cast(1 as number(6,0)) else cast(2 as number(19,0)) end case_num_text,
  case when 1=1 then cast(date '2020-01-01' as timestamp) else timestamp '2020-01-01 00:00:00' end case_date_ts,
  max(case when 1 = 1 then 1 else 0 end) bool_any,
  sum(case when 1 = 1 then 1 else 0 end) bool_sum,
  from_tz(timestamp '2020-01-01 00:00:00', 'UTC') at time zone 'Asia/Tokyo' timezone_convert,
  json_value('{"n":1,"b":true,"s":"x","z":null}', '$.s') json_unquote_text,
  coalesce(cast(1 as number(6,0)), cast(2 as number(6,0))) bind_coalesce_equiv,
  cast(cast('x' as varchar2(5)) as varchar2(5)) bind_cast_equiv,
  cast(1 as number(6,0)) + cast(2 as number(6,0)) bind_add_equiv
from dual;
create or replace view v_special_probe as select
  cast(N'あ' as nvarchar2(4)) unicode_text,
  to_clob('x') large_text,
  to_blob(hextoraw('AB')) large_bytes,
  json_array(1, 2 returning clob) json_array_value,
  sys_guid() uuid_value,
  systimestamp timestamp_tz_value
from dual;
select column_name || '|' || data_type || '|' || data_length || '|' || data_precision || '|' || data_scale
from user_tab_columns
where table_name = 'V_CAST_PROBE'
order by column_id;
select column_name || '|' || data_type || '|' || data_length || '|' || data_precision || '|' || data_scale
from user_tab_columns
where table_name = 'V_EDGE_PROBE'
order by column_id;
select table_name || '.' || column_name || '|' || data_type || '|' || data_length || '|' || data_precision || '|' || data_scale
from user_tab_columns
where table_name in ('V_CASE_PROBE', 'V_UNION_NULL_PROBE', 'V_UNION_NUM_PROBE', 'V_AGG_PROBE', 'V_CONCAT_TEMPORAL_PROBE', 'V_MORE_PROBE', 'V_PRIORITY_LITERAL_PROBE', 'V_TEMPORAL_PREDICATE_PROBE', 'V_JSON_EXTRACT_PROBE', 'V_SET_RESOLUTION_PROBE', 'V_REMAINING_PROBE', 'V_EXTRA_PROBE', 'V_SET_OPS_PROBE', 'V_FINAL_PROBE', 'V_FINAL_EXPR_PROBE', 'V_SPECIAL_PROBE')
order by table_name, column_id;
exit
`;
  printSection('oracle cast metadata', docker(['exec', '-i', name, 'sqlplus', '-s', 'sqldesc/pass@//localhost/XEPDB1'], { input: sql }));
}

cleanup();
try {
  verifySqlite();
  verifyDuckdb();
  await verifyPostgres();
  await verifyMysql();
  await verifySqlServer();
  await verifyOracle();
} finally {
  cleanup();
}
