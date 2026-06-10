import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getDialects, parse } from '@polyglot-sql/sdk';
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
        { name: 'data', type: 'json' },
        { name: 'geom', type: 'geometry' },
        { name: 'geog', type: 'geography' },
        { name: 'a', type: 'integer' },
        { name: 'b', type: 'integer' },
        { name: 'created_at', type: 'timestamp' },
        { name: 'd', type: 'date' },
        { name: 'tags', type: 'array<text>' },
        { name: 'ints', type: 'array<integer>' },
        { name: 'attrs', type: 'map<text, integer>' },
      ],
    },
    {
      name: 'orders',
      columns: [
        { name: 'id', type: 'integer' },
        { name: 'user_id', type: 'integer' },
        { name: 'amount', type: 'decimal' },
      ],
    },
    {
      name: 'src',
      columns: [
        { name: 'id', type: 'integer' },
        { name: 'name', type: 'text' },
      ],
    },
    {
      name: 'email',
      columns: [
        { name: 'sender', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'body', type: 'text' },
        { name: 'rank', type: 'decimal' },
      ],
    },
  ],
};

const staticResultCases = [
  ['generic', 'select id, name from users'],
  ['generic', "values (1, 'a'), (2, 'b')"],
  ['generic', "select reverse(name) r, initcap(name) i, concat_ws(',', name, name) c from users"],
  ['generic', 'select u.id, o.amount from users u join orders o on o.user_id = u.id'],
  ['generic', 'select id, name from users where exists (select 1 from orders where orders.user_id = users.id)'],
  ['generic', 'call sp_who()'],
  ['hive', 'select id, name from users'],
  ['databricks', 'select id, name from users'],
  ['databricks', 'describe catalog main'],
  ['databricks', 'describe detail users'],
  ['databricks', 'describe history users'],
  ['athena', 'select id, name from users'],
  ['athena', 'show databases'],
  ['athena', 'describe users'],
  ['teradata', 'select top 5 id, name from users'],
  ['doris', 'select id, name from users'],
  ['doris', 'show columns from users'],
  ['doris', 'show partitions from users'],
  ['doris', 'show databases'],
  ['doris', 'show create table users'],
  ['doris', 'select bitmap_count(to_bitmap(age)) bc, hll_cardinality(hll_hash(name)) hc from users'],
  ['doris', "select array_size(tags) s, array_contains(tags,'x') c from users"],
  ['starrocks', 'select id, name from users'],
  ['starrocks', 'show columns from users'],
  ['starrocks', 'show partitions from users'],
  ['starrocks', 'show databases'],
  ['starrocks', 'show create table users'],
  ['starrocks', 'select bitmap_count(to_bitmap(age)) bc, hll_hash(name) hh from users'],
  ['starrocks', "select array_length(tags) al, array_contains(tags,'x') ac from users"],
  ['materialize', 'select id, name from users'],
  ['materialize', 'show clusters'],
  ['materialize', 'show materialized views'],
  ['materialize', 'show sources'],
  ['materialize', 'show sinks'],
  ['materialize', 'select mz_now() mz'],
  ['risingwave', 'select id, name from users'],
  ['risingwave', 'show materialized views'],
  ['risingwave', 'show sources'],
  ['risingwave', 'show sinks'],
  ['risingwave', 'show databases'],
  ['risingwave', 'show indexes'],
  ['risingwave', 'show views'],
  ['risingwave', 'show create table users'],
  ['risingwave', "select tumble_start(created_at, interval '1 hour') ts, tumble_end(created_at, interval '1 hour') te from users"],
  ['singlestore', 'select id, name from users'],
  ['singlestore', 'show columns from users'],
  ['singlestore', 'show indexes from users'],
  ['singlestore', 'show pipelines'],
  ['singlestore', 'show databases'],
  ['singlestore', 'show create table users'],
  ['singlestore', "select json_extract_string(data,'$.x') js, regexp_match(name,'a') rm from users"],
  ['cockroachdb', 'select id, name from users'],
  ['cockroachdb', 'show constraints from users'],
  ['cockroachdb', 'show indexes from users'],
  ['cockroachdb', 'show jobs'],
  ['tidb', 'select id, name from users'],
  ['tidb', 'show columns from users'],
  ['tidb', 'show databases'],
  ['tidb', 'show create table users'],
  ['tidb', 'show stats_meta'],
  ['tidb', 'show stats_histograms'],
  ['tidb', "select tidb_version() v, json_extract(data,'$.x') j from users"],
  ['solr', 'select id, name from users'],
  ['solr', 'show tables'],
  ['tableau', 'select id, name from users'],
  ['tableau', 'show tables'],
  ['dune', 'select id, name from users'],
  ['dune', 'show tables'],
  ['dune', 'show schemas'],
  ['dune', 'select varbinary_to_uint256(name) vu, bytearray_substring(name,1,2) bs from users'],
  ['fabric', 'select top 5 id, name from users'],
  ['fabric', 'show tables'],
  ['fabric', 'select top 5 newid() n, getdate() gd from users'],
  ['drill', 'select id, name from users'],
  ['drill', 'show files'],
  ['drill', 'describe users'],
  ['drill', 'show databases'],
  ['drill', 'show schemas'],
  ['drill', 'show tables'],
  ['drill', 'show functions'],
  ['drill', "select convert_to(name,'UTF8') ct, flatten(tags) f from users"],
  ['dremio', 'select id, name from users'],
  ['dremio', 'show schemas'],
  ['dremio', 'show tables'],
  ['dremio', 'describe users'],
  ['dremio', 'show databases'],
  ['dremio', 'show files'],
  ['dremio', 'show functions'],
  ['dremio', "select convert_from(convert_to(name,'UTF8'),'UTF8') cf from users"],
  ['exasol', 'select id, name from users'],
  ['exasol', 'select * from exa_all_tables'],
  ['exasol', 'select * from exa_all_columns'],
  ['datafusion', 'select id, name from users'],
  ['datafusion', 'show tables'],
  ['datafusion', 'describe users'],
  ['postgres', 'select * from generate_series(1,3)'],
  ['postgres', "values (1, 'a'), (2, 'b')"],
  ['postgres', 'select id from users union all select user_id from orders'],
  ['postgres', 'select id from users intersect select user_id from orders'],
  ['postgres', 'select id from users except select user_id from orders'],
  ['postgres', 'with recursive nums(n) as (values (1) union all select n + 1 from nums where n < 3) select n from nums'],
  ['postgres', "select * from (values (1,'a')) as v(id,name)"],
  ['postgres', 'select * from generate_subscripts(array[1,2],1) as s'],
  ['postgres', 'select * from unnest(array[1,2]) with ordinality as u(x,n)'],
  ['postgres', 'select * from pg_catalog.pg_get_keywords() as k'],
  ['postgres', 'select * from pg_catalog.pg_settings'],
  ['postgres', 'select * from pg_catalog.pg_stat_database'],
  ['postgres', "select * from pg_catalog.pg_options_to_table(ARRAY['fillfactor=70']) as o"],
  ['postgres', 'select * from pg_catalog.pg_stat_get_activity(null) as a'],
  ['postgres', "select * from pg_catalog.pg_get_object_address('table', ARRAY['users'], ARRAY[]::text[]) as a"],
  ['postgres', 'select * from pg_settings as s'],
  ['postgres', 'select * from pg_stat_activity as a'],
  ['postgres', 'select * from pg_catalog.pg_roles'],
  ['postgres', 'select * from pg_catalog.pg_indexes'],
  ['postgres', 'select * from pg_catalog.pg_locks'],
  ['postgres', 'select * from pg_catalog.pg_user'],
  ['postgres', 'select * from pg_catalog.pg_views'],
  ['postgres', 'select extname from pg_catalog.pg_extension'],
  ['postgres', 'select typname from pg_catalog.pg_type'],
  ['postgres', 'select proname from pg_catalog.pg_proc'],
  ['postgres', 'select conname from pg_catalog.pg_constraint'],
  ['postgres', 'select attname from pg_catalog.pg_attribute'],
  ['postgres', 'select idx_scan from pg_catalog.pg_stat_user_indexes'],
  ['postgres', 'select relname from pg_stat_user_tables'],
  ['postgres', 'select datname from pg_stat_database'],
  ['postgres', 'select relname from pg_class'],
  ['postgres', 'select nspname from pg_namespace'],
  ['postgres', "select * from current_setting('search_path') as s"],
  ['postgres', "select * from json_each_text('{\"a\":1}') as x"],
  ['postgres', 'select * from jsonb_each(\'{"a":1}\'::jsonb) as e'],
  ['postgres', "select * from json_populate_record(null::users, '{\"id\":1}') as x"],
  ['postgres', "select * from pg_logical_slot_get_changes('slot', null, null) as c"],
  ['postgres', "select * from ts_debug('english', 'a fat cat') as t"],
  ['postgres', "select * from pg_stat_file('base') as s"],
  ['postgres', "select * from pg_read_file('x') as f"],
  ['postgres', 'select * from pg_ls_waldir() as w'],
  ['postgres', 'select * from pg_ls_logdir() as l'],
  ['postgres', 'select * from pg_ls_tmpdir() as t'],
  ['postgres', 'select * from pg_stat_get_snapshot_timestamp() as ts'],
  ['postgres', 'select * from pg_timezone_names() as tz'],
  ['postgres', 'select * from pg_available_extension_versions() as e'],
  ['postgres', "select * from json_to_record('{\"id\":1,\"name\":\"a\"}') as x(id int, name text)"],
  ['postgres', "select * from jsonb_to_recordset('[{\"id\":1}]'::jsonb) as x(id int)"],
  ['postgres', "select e.key, e.value from users, json_each(data) as e"],
  ['postgres', "select * from json_object_keys('{\"a\":1}') as k"],
  ['postgres', "select elem from users, json_array_elements_text(data) as elem"],
  ['postgres', "select to_char(created_at, 'YYYY') c from users"],
  ['postgres', 'select array(select id from users) a'],
  ['postgres', "select nextval('s') n, currval('s') c, lastval() l, setval('s', 10) sv"],
  ['postgres', 'show all'],
  ['postgres', 'show search_path'],
  ['postgres', 'show transaction isolation level'],
  ['postgres', 'select stddev(age) sd, variance(age) v, mode() within group (order by age) m from users'],
  ['postgres', 'select percentile_cont(0.5) within group (order by age) p from users'],
  ['postgres', 'select json_arrayagg(name) ja, json_objectagg(name, age) jo from users'],
  ['postgres', 'select bit_and(age) ba, bit_or(age) bo, bit_xor(age) bx from users'],
  ['postgres', 'select regr_count(age, id) rc, regr_avgx(age, id) rax, regr_avgy(age, id) ray from users'],
  ['postgres', 'select ntile(4) over(order by age) nt from users'],
  ['postgres', 'select distinct on (dept) dept, name from users order by dept, age desc'],
  ['postgres', "select left(name,2) l, right(name,2) r, repeat(name,2) rp, regexp_match(name,'a') rm from users"],
  ['postgres', "select levenshtein(name,'x') l from users"],
  ['postgres', "select pg_typeof(age) pt, format('%s', name) f, to_regclass(name) tr from users"],
  ['postgres', "select overlay(name placing 'x' from 1 for 1) o, ascii(name) a, chr(age) c from users"],
  ['postgres', "select quote_nullable(name) qn, parse_ident(name) pi, regexp_split_to_table(name, ',') rst from users"],
  ['postgres', 'select width_bucket(age,0,100,10) wb, num_nonnulls(name,age) nn, num_nulls(name,age) nl from users'],
  ['postgres', "select array_dims(tags) ad, array_ndims(tags) an, jsonb_extract_path_text(data::jsonb,'x') jpt from users"],
  ['postgres', 'select array_upper(tags,1) au, array_lower(tags,1) al from users'],
  ['postgres', "select row_to_json(users) rj, jsonb_path_query(data::jsonb,'$.x') jp from users"],
  ['postgres', "select tags && array['a'] ov, tags @> array['a'] ca, tags <@ array['a','b'] cb from users"],
  ['postgres', 'select tags[1] t, tags[1:2] ts from users'],
  ['postgres', 'select (id, name) as r from users'],
  ['postgres', "select name ~* 'a' as regex_match, data #> array['x'] as value, data #>> array['x'] as text_value from users"],
  ['postgres', "select to_tsvector(name) tv, setweight(to_tsvector(name),'A') sw, websearch_to_tsquery(name) wq from users"],
  ['postgres', "select array_prepend('x',tags) ap, array_replace(tags,'x','y') ar from users"],
  ['postgres', 'select st_asbinary(geom) b, st_asgeojson(geom) gj, st_srid(geom) srid from users'],
  ['postgres', 'select st_npoints(geom) np, st_ndims(geom) nd, st_dimension(geom) dim from users'],
  ['postgres', 'select st_setsrid(geom,4326) sg, st_transform(geom,3857) tg, st_makeenvelope(0,0,1,1,4326) env from users'],
  ['postgres', "select gen_random_bytes(4) grb, digest(name,'sha256') dg, hmac(name,'k','sha256') hm from users"],
  ['postgres', "select encode(decode(name,'hex'),'base64') e from users"],
  ['postgres', "select greatest(age,1) g, least(age,2) l, make_interval(days => age) mi from users"],
  ['postgres', 'select cbrt(age) c, div(age,2) d, factorial(age) f from users'],
  ['postgres', 'select inet_client_addr() ica, inet_server_port() isp, pg_backend_pid() pid, txid_current() tx from users'],
  ['postgres', 'select inet_client_port() icp, current_query() cq, pg_postmaster_start_time() pst from users'],
  ['postgres', 'select obj_description(id) od, col_description(id, age) cdesc, pg_get_expr(name, id) pge from users'],
  ['postgres', "select date_bin('1 hour', created_at, timestamp '2020-01-01') db, justify_interval(age(created_at)) ji from users"],
  ['postgres', 'select isfinite(created_at) inf from users'],
  ['postgres', 'select clock_timestamp() ct, statement_timestamp() st, transaction_timestamp() tt, current_schema() cs from users'],
  ['postgres', "copy (select id, name from users) to '/tmp/users.csv'"],
  ['postgres', "insert into users(id,name) values (1,'a') returning id, name"],
  ['postgres', "update users set name='b' returning id, name"],
  ['postgres', "update users set name='b' returning old.name, new.name"],
  ['postgres', 'delete from users returning id'],
  ['postgres', "merge into users using src on users.id=src.id when matched then update set name=src.name returning users.*, src.name"],
  ['postgres', 'analyze users'],
  ['mysql', 'show create function f'],
  ['mysql', 'show create event e'],
  ['mysql', 'show create user u'],
  ['mysql', 'show engine innodb status'],
  ['mysql', 'show full processlist'],
  ['mysql', 'show table status'],
  ['mysql', 'show character sets'],
  ['mysql', 'show columns from users'],
  ['mysql', 'show full columns from users'],
  ['mysql', 'show indexes from users'],
  ['mysql', 'show status'],
  ['mysql', 'show global variables'],
  ['mysql', 'show collations'],
  ['mysql', 'show privileges'],
  ['mysql', 'show relaylog events'],
  ['mysql', 'show slave hosts'],
  ['mysql', 'show profile cpu'],
  ['mysql', 'call sp_columns()'],
  ['mysql', 'select * from information_schema.processlist'],
  ['mysql', 'select variable_name from performance_schema.global_variables'],
  ['mysql', 'select digest_text from performance_schema.events_statements_summary_by_digest'],
  ['mysql', 'select EVENT_NAME from information_schema.EVENTS'],
  ['mysql', "select str_to_date(name, '%Y-%m-%d') d from users"],
  ['mysql', "select json_unquote(json_extract(data, '$.x')) x, json_contains(data, '{}') c, unhex(hex(name)) b, aes_encrypt(name, 'k') e from users"],
  ['mysql', "select json_valid(data) jv, make_set(age,'a','b') ms, export_set(age,'Y','N') es from users"],
  ['mysql', "select date_format(d,'%Y') df, format(age,2) f, bin(age) b, uuid() u from users"],
  ['mysql', 'select database() db, schema() sc, user() u from users'],
  ['mysql', "select json_array(id,name) ja, json_object('id',id) jo, json_type(data) jt, json_length(data) jl from users"],
  ['mysql', "select json_set(data,'$.x',1) js, json_insert(data,'$.x',1) ji, json_remove(data,'$.x') jr, json_merge_patch(data,data) jm from users"],
  ['mysql', "select json_merge_preserve(data,data) jmp, json_pretty(data) jp, json_storage_size(data) jss from users"],
  ['mysql', "select cast(name as json) j, json_keys(data) jk, json_search(data,'one','x') js from users"],
  ['mysql', "select soundex(name) s, space(age) sp, find_in_set(name, 'a,b') f from users"],
  ['mysql', "select substring_index(name, ',', 1) si, day(d) dy, month(d) mo, year(d) yr, unix_timestamp(created_at) ut from users"],
  ['mysql', 'select date_add(d, interval 1 day) da, timestampdiff(day, created_at, created_at) td from users'],
  ['mysql', 'select curdate() cd, curtime() ct, utc_date() ud, utc_time() ut, from_unixtime(age) fu, sec_to_time(age) st, time_to_sec(curtime()) ts from users'],
  ['mysql', 'select degrees(age) d, radians(age) r, truncate(age, 1) t from users'],
  ['mysql', 'select age div 2 d from users'],
  ['mysql', 'select md5(name) m, sha1(name) s1, sha2(name,256) s2, password(name) p from users'],
  ['mysql', 'select inet6_aton(name) ia6, inet6_ntoa(inet6_aton(name)) in6 from users'],
  ['mysql', 'select bit_count(age) bc, connection_id() cid, last_insert_id() li, is_ipv4(name) ip4, is_ipv6(name) ip6 from users'],
  ['mysql', 'select stddev_pop(age) sp, var_pop(age) vp, bit_and(age) ba, bit_or(age) bo from users'],
  ['mysql', 'analyze table users'],
  ['mysql', 'optimize table users'],
  ['sqlite', 'pragma wal_checkpoint'],
  ['sqlite', 'pragma foreign_key_check'],
  ['sqlite', 'pragma table_list'],
  ['sqlite', 'pragma reverse_unordered_selects'],
  ['sqlite', "select * from pragma_table_info('users')"],
  ['sqlite', "select rowid, sender, rank from email where email match 'x'"],
  ['sqlite', "select * from email('x')"],
  ['sqlite', "select highlight(email, 1, '[', ']') h, snippet(email, 1, '[', ']', '...', 10) s, bm25(email) b from email where email match 'x'"],
  ['sqlite', "select * from fts5vocab(email, 'row')"],
  ['sqlite', "select * from fts5vocab(email, 'col')"],
  ['sqlite', "select * from fts5vocab(email, 'instance')"],
  ['sqlite', "select * from pragma_index_info('idx_users_name')"],
  ['sqlite', "select * from pragma_table_xinfo('users')"],
  ['sqlite', 'select changes() ch, total_changes() tc, last_insert_rowid() lr, sqlite_version() sv'],
  ['sqlite', "select printf('%s', name) p from users"],
  ['sqlite', 'select typeof(name) t, quote(name) q, zeroblob(age) zb from users'],
  ['sqlite', "select name glob 'a*' as glob_match from users"],
  ['sqlite', "insert into users(id,name) values (1,'a') returning id"],
  ['sqlite', "update users set name='b' returning id"],
  ['sqlite', 'delete from users returning id'],
  ['duckdb', 'pragma show_tables'],
  ['duckdb', 'pragma version'],
  ['duckdb', 'pragma database_size'],
  ['duckdb', 'pragma storage_info(users)'],
  ['duckdb', 'pragma platform'],
  ['duckdb', 'pragma user_agent'],
  ['duckdb', 'pragma show'],
  ['duckdb', 'pragma enable_profile'],
  ['duckdb', 'pragma functions'],
  ['duckdb', 'pragma collations'],
  ['snowflake', 'describe warehouse wh'],
  ['snowflake', 'describe database db'],
  ['snowflake', 'describe schema public'],
  ['snowflake', 'describe alert a'],
  ['snowflake', 'describe share sh'],
  ['snowflake', 'describe stream s'],
  ['snowflake', 'describe role r'],
  ['snowflake', 'show primary keys'],
  ['snowflake', 'show future grants'],
  ['snowflake', 'show compute pools'],
  ['snowflake', 'show image repositories'],
  ['snowflake', 'show network rules'],
  ['snowflake', 'show secrets'],
  ['snowflake', 'show dynamic tables'],
  ['snowflake', 'show notebooks'],
  ['snowflake', 'show alerts'],
  ['snowflake', 'show streams'],
  ['snowflake', 'show pipes'],
  ['snowflake', 'show warehouses'],
  ['snowflake', 'list @stage'],
  ['snowflake', 'put file://tmp/a.csv @stage'],
  ['snowflake', 'get @stage file://tmp/'],
  ['snowflake', 'remove @stage/a.csv'],
  ['snowflake', 'copy into @stage from users'],
  ['snowflake', 'copy into @stage from (select id, name from users)'],
  ['snowflake', 'select query_id from account_usage.query_history'],
  ['snowflake', 'select column_name from account_usage.columns'],
  ['snowflake', 'select database_name from account_usage.databases'],
  ['snowflake', 'select schema_name from account_usage.schemata'],
  ['snowflake', 'select privilege from account_usage.grants_to_roles'],
  ['snowflake', 'select function_name from information_schema.functions'],
  ['snowflake', 'select try_to_number(name) n from users'],
  ['snowflake', "select object_construct('id', id, 'name', name) o, array_construct(id, age) a from users"],
  ['snowflake', 'select parse_json(name) j, check_json(name) c, is_null_value(parse_json(name)) n from users'],
  ['snowflake', 'select as_array(parse_json(name)) aa, as_object(parse_json(name)) ao, as_varchar(parse_json(name)) av from users'],
  ['snowflake', 'select system$typeof(name) st, typeof(parse_json(name)) tf from users'],
  ['snowflake', 'select current_version() cv, current_account() ca, current_region() cr, current_role() role from users'],
  ['snowflake', 'select current_warehouse() cw, last_query_id() lq from users'],
  ['snowflake', "select charindex('a', name) ci, editdistance(name,'x') ed from users"],
  ['snowflake', 'select data:x j, data:x::string s from users'],
  ['snowflake', "select split(name, ',') s, array_size(split(name,',')) n, get(parse_json(name),'x') g from users"],
  ['snowflake', 'select object_keys(parse_json(name)) ok from users'],
  ['snowflake', "select object_insert(object_construct('id', id),'x',1) oi, json_array_append(data,'$.x',1) jaa, json_array_insert(data,'$.x',1) jai, json_array_contains(data,'x') jac from users"],
  ['snowflake', 'select array_flatten(array_construct(tags)) af, array_compact(tags) ac, array_intersect(tags,tags) ai, array_union(tags,tags) au, array_except(tags,tags) ae from users'],
  ['snowflake', 'select array_contains_all(tags,tags) aca, array_contained_by(tags,tags) acb, array_overlaps(tags,tags) ao from users'],
  ['snowflake', 'select array_zip(tags, array_construct(age)) az, array_all(tags, x -> x is not null) aa, array_any(tags, x -> x is not null) anyv from users'],
  ['snowflake', 'select to_varchar(age) tv, to_binary(name) tb, md5_binary(name) mb, sha2_binary(name) sb from users'],
  ['snowflake', 'select to_timestamp(name) ts, to_date(name) d, to_time(name) t, to_boolean(name) b from users'],
  ['snowflake', "select try_to_boolean(name) tb, object_construct('id', id) obj from users"],
  ['snowflake', 'select datediff(day, created_at, created_at) dd, dateadd(day, 1, created_at) da, last_day(d) ld from users'],
  ['snowflake', "select nvl2(name, age, id) n2, regexp_like(name,'a') rl from users"],
  ['snowflake', 'select nullifzero(age) nz from users'],
  ['snowflake', 'select ratio_to_report(age) over(partition by dept) rr from users'],
  ['snowflake', 'select kurtosis(age) k, skewness(age) s from users'],
  ['snowflake', 'select to_geography(name) g, to_geometry(name) gm, st_distance(geog, geog) dist from users'],
  ['snowflake', 'select cosine_distance(geom, geom) cd, euclidean_distance(geom, geom) ed, manhattan_distance(geom, geom) md from users'],
  ['snowflake', 'select hash(name) h, hash_agg(name) ha, uuid_string() u from users'],
  ['snowflake', "select try_to_decfloat(name) td, ai_agg(name, 'summarize') aa, ai_classify(name, ['a','b']) ac, ml_forecast(age) mf from users"],
  ['snowflake', 'select try_base64_decode_string(name) s, try_base64_decode_binary(name) b from users'],
  ['snowflake', 'select base64_encode(name) e, base64_decode_string(name) ds, base64_decode_binary(name) db from users'],
  ['snowflake', 'select compress(name) c, decompress_binary(name) db, decompress_string(name) ds, parse_url(name) pu, check_xml(name) cx from users'],
  ['snowflake', "select * from table(infer_schema(location=>'@mystage', file_format=>'ff'))"],
  ['snowflake', "select f.key, f.value from users, lateral flatten(input => parse_json(name)) f"],
  ['snowflake', 'select object_agg(name, age) o from users'],
  ['snowflake', 'select id, row_number() over(order by age) rn from users qualify rn = 1'],
  ['snowflake', "execute immediate 'select 1 as id'"],
  ['bigquery', 'select * from unnest(generate_array(1,3)) as x'],
  ['bigquery', "select * from generate_date_array(date '2020-01-01', date '2020-01-03') as d"],
  ['bigquery', "select * from generate_timestamp_array(timestamp '2020-01-01', timestamp '2020-01-02', interval 1 day) as ts"],
  ['bigquery', 'select tag, off from users, unnest(tags) as tag with offset as off'],
  ['bigquery', 'select (select as struct id, name) s from users'],
  ['bigquery', 'select safe_add(age, 1) a, safe_divide(age, 2) d from users'],
  ['bigquery', 'select ieee_divide(age, 2) idv, is_inf(ieee_divide(age,0)) inf, is_nan(ieee_divide(age,0)) nan from users'],
  ['bigquery', 'select current_datetime() dt, current_timestamp() ts, current_time() tm'],
  ['bigquery', 'select approx_count_distinct(name) acd, any_value(name) av from users'],
  ['bigquery', 'select approx_quantiles(age, 10) aq, array_concat_agg(tags) ac from users'],
  ['bigquery', "select json_query_array(data,'$.x') jqa, json_value_array(data,'$.x') jva from users"],
  ['bigquery', "select json_strip_nulls(data) jsn, stringify_json(data) sj from users"],
  ['bigquery', "select generate_embedding(model => 'm', content => name) ge, ai_classify(name, ['a','b']) ac from users"],
  ['bigquery', 'select generate_uuid() u, farm_fingerprint(name) f, to_base64(from_base64(name)) b from users'],
  ['bigquery', "select starts_with(name,'a') sw, ends_with(name,'z') ew, regexp_extract_all(name,'[a-z]') xs from users"],
  ['bigquery', 'select ascii(name) a, chr(age) c, code_points_to_string([65,66]) cps from users'],
  ['bigquery', "select to_code_points(name) tcp, split(name, ',') s, byte_length(name) bl from users"],
  ['bigquery', 'select date(d) dd, timestamp(created_at) ts, datetime(created_at) dt, time(created_at) tm from users'],
  ['bigquery', 'select unix_seconds(created_at) us, timestamp_seconds(age) tse from users'],
  ['bigquery', 'select array_length(tags) l, array_reverse(tags) r, array_concat(tags,tags) c from users'],
  ['bigquery', "select array_to_string(tags, ',') ats, array_first(tags) af, array_last(tags) al from users"],
  ['bigquery', "select data['x'] j, tags[offset(0)] tag from users"],
  ['bigquery', 'select * except(age) replace(age + 1 as id) from users'],
  ['bigquery', "execute immediate 'select 1 as id'"],
  ['bigquery', "export data options(uri='gs://b/x.csv') as select id, name from users"],
  ['bigquery', 'select project_id from information_schema.schemata'],
  ['bigquery', 'select job_id from information_schema.jobs_by_user'],
  ['bigquery', 'select table_id from __TABLES__'],
  ['bigquery', 'select * from __TABLES_SUMMARY__'],
  ['tsql', 'select session_id from sys.dm_exec_requests'],
  ['tsql', 'select @@spid spid, db_name() db, host_name() host, app_name() app'],
  ['tsql', 'select getdate() gd, sysdatetime() sdt, sysutcdatetime() sudt, datename(month,created_at) dn from users'],
  ['tsql', "select object_name(id) oname, schema_name(id) sname, db_id() dbid, object_id('users') oid from users"],
  ['tsql', 'select suser_name() su, system_user sy, newid() nid, newsequentialid() nsid'],
  ['tsql', "select datalength(name) dl from users"],
  ['tsql', "select isnull(name,'x') i, eomonth(d) eo from users"],
  ['tsql', "select checksum(name) cs, binary_checksum(name) bc, patindex('%a%', name) pi from users"],
  ['tsql', "select * from string_split('a,b', ',')"],
  ['tsql', "select * from openjson('{\"a\":1}') with (a int '$.a')"],
  ['tsql', "select * from openquery(server, 'select 1 as id')"],
  ['tsql', 'exec sp_help users'],
  ['tsql', 'sp_help'],
  ['tsql', 'sp_help users'],
  ['tsql', 'execute sp_who'],
  ['tsql', 'exec sp_spaceused users'],
  ['tsql', 'exec sp_tables'],
  ['tsql', 'exec sp_columns users'],
  ['tsql', 'exec sp_helpindex users'],
  ['tsql', 'exec sp_helpconstraint users'],
  ['tsql', 'exec sp_databases'],
  ['tsql', 'exec sp_server_info'],
  ['tsql', 'exec sp_helpdb'],
  ['tsql', 'exec sp_helpfile'],
  ['tsql', 'exec sp_helpfilegroup'],
  ['tsql', 'exec sp_stored_procedures'],
  ['tsql', 'exec sp_pkeys users'],
  ['tsql', 'exec sp_fkeys users'],
  ['tsql', 'exec sp_statistics users'],
  ['tsql', 'exec sp_special_columns users'],
  ['tsql', 'exec dbo.my_proc with result sets ((id int, name nvarchar(20)))'],
  ['tsql', "insert into users(id,name) output inserted.id, inserted.name values (1,'a')"],
  ['tsql', "update users set name='b' output inserted.id, deleted.name"],
  ['tsql', 'delete from users output deleted.id'],
  ['tsql', 'merge into users as t using users as s on t.id=s.id when matched then update set name=s.name output inserted.id, deleted.name'],
  ['oracle', 'select sid from v$session'],
  ['oracle', 'select username from all_users'],
  ['oracle', 'select column_name from all_tab_columns'],
  ['oracle', 'select object_name from all_objects'],
  ['oracle', 'select view_name from all_views'],
  ['oracle', 'select constraint_name from all_constraints'],
  ['oracle', 'select constraint_name from user_constraints'],
  ['oracle', 'select table_name from user_tables'],
  ['oracle', 'select object_name from user_objects'],
  ['oracle', 'select index_name from user_indexes'],
  ['oracle', 'select column_name from user_ind_columns'],
  ['oracle', 'select table_name from dba_tables'],
  ['oracle', 'select sysdate sd, systimestamp st, user u from dual'],
  ['oracle', "select sys_guid() sg, userenv('LANG') ue, ora_hash(name) oh from users"],
  ['oracle', "select decode(age,1,'one','other') d, dump(name) dumpv from users"],
  ['oracle', 'select trunc(d) tr from users'],
  ['oracle', 'select add_months(d,1) am, last_day(d) ld, months_between(d,d) mb from users'],
  ['oracle', "select numtodsinterval(age,'DAY') ndi, numtoyminterval(age,'MONTH') nym from users"],
  ['oracle', "select regexp_count(name,'a') rc, to_clob(name) tc, rawtohex(name) rh, hextoraw(name) hr from users"],
  ['oracle', 'select * from json_table(\'{\"a\":1}\', \'$\' columns (a number path \'$.a\')) jt'],
  ['oracle', "select * from xmltable('/a' columns id number path 'id')"],
  ['oracle', "select * from json_table('{}', '$' columns (id number path '$.id', name varchar2(20) path '$.name'))"],
  ['oracle', "select * from table(sys.odcivarchar2list('a','b')) t"],
  ['oracle', 'select * from users match_recognize (partition by dept order by created_at measures match_number() as match_no, classifier() as cls all rows per match pattern (A+) define A as age > 0) mr'],
  ['duckdb', 'select * from duckdb_tables()'],
  ['duckdb', 'select * from duckdb_settings()'],
  ['duckdb', 'select * from duckdb_extensions()'],
  ['duckdb', 'select * from duckdb_databases()'],
  ['duckdb', 'select * from duckdb_views()'],
  ['duckdb', 'select * from duckdb_columns()'],
  ['duckdb', 'select * from duckdb_indexes()'],
  ['duckdb', 'select * from duckdb_schemas()'],
  ['duckdb', 'select * from duckdb_constraints()'],
  ['duckdb', 'select * from duckdb_keywords()'],
  ['duckdb', 'select * from duckdb_types()'],
  ['duckdb', 'select * from duckdb_memory()'],
  ['duckdb', 'select * from duckdb_sequences()'],
  ['duckdb', "select * from glob('*.csv')"],
  ['duckdb', "select * from read_blob('x')"],
  ['duckdb', "select * from read_text('x')"],
  ['duckdb', 'select * from range(1,3) as r(i)'],
  ['duckdb', 'select * from generate_series(1,3) as g(i)'],
  ['duckdb', "select * from read_csv('x', columns={'id':'INTEGER','name':'VARCHAR'})"],
  ['duckdb', "select * from read_json('x', columns={'id':'INTEGER','name':'VARCHAR'})"],
  ['duckdb', "select * from read_ndjson('x', columns={'id':'INTEGER','name':'VARCHAR'})"],
  ['duckdb', "select * from read_xlsx('x.xlsx', columns={'id':'INTEGER','name':'VARCHAR'})"],
  ['duckdb', "select * from read_json_objects('x.json')"],
  ['duckdb', "select * from read_ndjson_objects('x.json')"],
  ['duckdb', "select * from read_parquet('x.parquet', columns={'id':'INTEGER','name':'VARCHAR'})"],
  ['duckdb', "select * from parquet_schema('x.parquet')"],
  ['duckdb', "select * from parquet_metadata('x.parquet')"],
  ['duckdb', "select * from parquet_file_metadata('x.parquet')"],
  ['duckdb', "select * from parquet_kv_metadata('x.parquet')"],
  ['duckdb', 'select list_value(id, age) xs, struct_pack(id := id, name := name) s from users'],
  ['duckdb', 'select typeof(name) t, stats(age) st, version() v from users'],
  ['duckdb', 'select list_transform(tags, x -> upper(x)) t from users'],
  ['duckdb', "select contains(tags,'a') c, list_contains(tags,'a') lc, list_extract(tags,1) le from users"],
  ['duckdb', "select list_apply(tags, x -> upper(x)) la, map_extract(attrs,'a') me, map_contains(attrs,'a') mc from users"],
  ['duckdb', "select name.lower() l, name.upper() u, tags.list_contains('a') c, tags.list_extract(1) e from users"],
  ['duckdb', "select list_has(tags,'a') lh, list_has_all(tags,tags) lha, list_has_any(tags,tags) lhan from users"],
  ['duckdb', 'select list_resize(tags, 5) lr from users'],
  ['duckdb', 'select list_distinct(tags) ld, list_sort(tags) ls, list_grade_up(tags) lgu, list_select(tags, [1]) lsel from users'],
  ['duckdb', "select array_pop_back(tags) pb, array_pop_front(tags) pf, array_push_back(tags,'x') pback, array_push_front(tags,'x') pfront from users"],
  ['duckdb', "select prefix(name,'a') p, suffix(name,'z') s, list_position(tags,'x') lp, list_unique(tags) lu from users"],
  ['duckdb', 'select mad(age) mad, sem(age) sem, skewness(age) sk, quantile_disc(age, 0.5) qd from users'],
  ['duckdb', "select array_filter(tags, x -> x <> 'a') af, array_reduce(ints, (x,y) -> x + y) ar from users"],
  ['duckdb', 'select epoch(created_at) e, epoch_ms(created_at) ems, make_date(2020,1,1) md from users'],
  ['duckdb', 'select last_day(d) ld, list_slice(tags, 1, 2) ls, list_reverse(tags) lr, list_concat(tags,tags) lc from users'],
  ['duckdb', 'select histogram(age) h, entropy(age) e, product(age) p from users'],
  ['duckdb', "select regexp_extract_all(name, '[a-z]+') r, regexp_split(name, ',') s from users"],
  ['duckdb', "select json_extract(data,'$.x') je, json_extract_string(data,'$.x') jes, json_type(data) jt from users"],
  ['duckdb', "select regexp_full_match(name, '[a-z]+') fm, regexp_instr(name, 'a') ri from users"],
  ['duckdb', 'pivot users on dept using sum(age)'],
  ['duckdb', 'unpivot users on a,b into name k value v'],
  ['clickhouse', 'show databases'],
  ['clickhouse', 'describe table users'],
  ['clickhouse', 'desc users'],
  ['clickhouse', 'show create table users'],
  ['clickhouse', 'show views'],
  ['clickhouse', 'show materialized views'],
  ['clickhouse', 'show create view v'],
  ['clickhouse', 'show create database default'],
  ['clickhouse', 'show create dictionary d'],
  ['clickhouse', 'show processlist'],
  ['clickhouse', 'show processes'],
  ['clickhouse', 'show merges'],
  ['clickhouse', 'show mutations'],
  ['clickhouse', 'show clusters'],
  ['clickhouse', 'show users'],
  ['clickhouse', 'show roles'],
  ['clickhouse', 'show grants'],
  ['clickhouse', 'show privileges'],
  ['clickhouse', 'show settings'],
  ['clickhouse', 'show variables'],
  ['clickhouse', 'show dictionaries'],
  ['clickhouse', 'show indexes from users'],
  ['clickhouse', 'show catalogs'],
  ['clickhouse', 'show current namespace'],
  ['clickhouse', 'show named collections'],
  ['clickhouse', 'show row policies'],
  ['clickhouse', 'show quotas'],
  ['clickhouse', 'show quota usage'],
  ['clickhouse', 'show access'],
  ['clickhouse', 'show engines'],
  ['clickhouse', 'show table users'],
  ['clickhouse', 'show functions'],
  ['clickhouse', 'select name from system.functions'],
  ['clickhouse', 'select query from system.query_log'],
  ['clickhouse', 'select table from system.merges'],
  ['clickhouse', 'select mutation_id from system.mutations'],
  ['clickhouse', 'select value from system.settings'],
  ['clickhouse', 'select name from information_schema.tables'],
  ['clickhouse', 'exists table users'],
  ['clickhouse', 'explain ast select id from users'],
  ['clickhouse', 'select * from numbers(3)'],
  ['clickhouse', 'select * from numbers_mt(3)'],
  ['clickhouse', 'select cityHash64(name) h, toString(age) s, toDate(name) d from users'],
  ['clickhouse', 'select version() v, currentDatabase() db, currentUser() u, sipHash64(name) sh, bitCount(age) bc from users'],
  ['clickhouse', 'select generateUUIDv4() u from users'],
  ['clickhouse', 'select toInt32(name) i, toFloat64(name) f, toUUID(name) u, toBool(age) b from users'],
  ['clickhouse', "select has(tags,'a') h, length(tags) l, arrayJoin(tags) tag from users"],
  ['clickhouse', 'select arrayConcat(tags,tags) ac, arrayDistinct(tags) ad, arraySlice(tags,1,2) aslice, arrayReverse(tags) ar from users'],
  ['clickhouse', "select mapContains(attrs,'a') mc from users"],
  ['clickhouse', "select arrayStringConcat(tags,',') asc, empty(tags) e, notEmpty(tags) ne from users"],
  ['clickhouse', 'select mapKeys(attrs) mk, mapValues(attrs) mv from users'],
  ['clickhouse', 'select quantile(age) q, quantiles(0.5,0.9)(age) qs, uniq(name) u from users'],
  ['clickhouse', 'select stddevPop(age) sp, varPop(age) vp from users'],
  ['clickhouse', 'select argMax(name, age) am, argMin(name, age) amin from users'],
  ['clickhouse', "select multiIf(age > 0, name, 'x') mi, ifNull(name,'x') n from users"],
  ['clickhouse', "select replaceRegexpAll(name,'a','b') rr, match(name,'a') m from users"],
  ['clickhouse', "select replaceAll(name,'a','b') ra, arrayMap(x -> upper(x), tags) am, arrayFilter(x -> x != 'a', tags) af from users"],
  ['clickhouse', "select JSONExtractString(name,'id') js, JSONExtractInt(name,'id') ji, JSONHas(name,'id') jh from users"],
  ['clickhouse', 'select JSONLength(name) jl, JSONType(name) jt, toDateTime(name) tdt, toUnixTimestamp(created_at) tut from users'],
  ['clickhouse', "select toStartOfDay(created_at) sd, formatDateTime(created_at,'%F') fd from users"],
  ['clickhouse', "select format_datetime(current_timestamp, 'yyyy') fy from users"],
  ['clickhouse', 'select today() t, yesterday() y, toStartOfWeek(created_at) sw, subtractDays(d,1) sd from users'],
  ['clickhouse', 'select addDays(d, 1) ad, toYear(d) y, lowerUTF8(name) l, upperUTF8(name) u from users'],
  ['clickhouse', 'select row_number() over(order by age) rn, lagInFrame(name) over(order by id) l from users'],
  ['clickhouse', 'select * from numbers(10) limit 3'],
  ['clickhouse', "select * from remote('host','db','users')"],
  ['clickhouse', "select * from file('a.csv', CSV, 'id UInt64, name String')"],
  ['clickhouse', "select * from url('http://example.com/a.csv', CSV, 'id UInt64, name String')"],
  ['clickhouse', "select * from s3('url','CSV','id UInt64, name String')"],
  ['clickhouse', "select * from generateRandom('id UInt64, name String') limit 1"],
  ['clickhouse', "select * from mysql('host','db','users','user','pass')"],
  ['clickhouse', 'optimize table users'],
  ['clickhouse', 'check table users'],
  ['clickhouse', 'watch users'],
  ['presto', 'select * from sequence(1,3) as t(x)'],
  ['trino', 'select * from unnest(sequence(1,3)) as t(x)'],
  ['trino', "select * from unnest(map(array['a'], array[1])) as t(k, v)"],
  ['trino', "select transform(tags, x -> upper(x)) t, filter(tags, x -> x <> 'a') f from users"],
  ['trino', 'select reduce(array[1,2], 0, (s, x) -> s + x, s -> s) r'],
  ['trino', "select any_match(tags, x -> x = 'a') a, all_match(tags, x -> x <> '') b, none_match(tags, x -> x = 'z') n from users"],
  ['trino', "select json_extract(data,'$.x') j, json_extract_scalar(data,'$.x') s, contains(tags,'a') c from users"],
  ['trino', 'select data is json as json_check from users'],
  ['trino', "select element_at(attrs,'a') ea, map_keys(attrs) mk, map_values(attrs) mv from users"],
  ['trino', "select map_filter(attrs, (k,v) -> v > 0) mf, transform_values(attrs, (k,v) -> v + 1) tv, map_concat(attrs, attrs) mc from users"],
  ['trino', "select tags[1] tag, data['x'] j from users"],
  ['trino', "select strpos(name,'a') sp, codepoint(name) cp, chr(age) ch, regexp_like(name,'a') rl, regexp_position(name,'a') rp from users"],
  ['trino', "select url_extract_host(name) h, url_encode(name) ue, from_utf8(to_utf8(name)) fu from users"],
  ['trino', "select url_extract_protocol(name) up, url_extract_path(name) path, json_array_length(data) jal from users"],
  ['trino', "select last_day_of_month(d) lm, lpad(name, 5, 'x') lp, rpad(name,5,'x') rp from users"],
  ['trino', 'select current_catalog cc, uuid() u from users'],
  ['trino', "select date_parse(name, '%Y-%m-%d') dp from users"],
  ['trino', 'select approx_percentile(age, 0.5) ap, arbitrary(name) ar from users'],
  ['trino', 'select approx_set(name) aset, set_digest(name) sd, numeric_histogram(10, age) nh from users'],
  ['trino', 'select checksum(name) c, geometric_mean(age) gm, map_agg(name, age) ma from users'],
  ['trino', 'show columns from users'],
  ['trino', 'show functions'],
  ['trino', 'show create schema default'],
  ['trino', 'show stats for users'],
  ['spark', 'describe function abs'],
  ['spark', 'describe database default'],
  ['spark', 'describe namespace default'],
  ['spark', 'describe table extended users'],
  ['spark', 'show current namespace'],
  ['spark', 'show functions'],
  ['spark', 'show columns from users'],
  ['spark', 'show tables'],
  ['spark', 'list file'],
  ['spark', 'select id, pos, tag from users lateral view posexplode(tags) e as pos, tag'],
  ['spark', 'select * from explode(array(1,2)) as t'],
  ['spark', "select * from stack(2, 1, 'a', 2, 'b') as t"],
  ['spark', "select size(tags) sz, array_contains(tags, 'x') has from users"],
  ['spark', "select transform(tags, x -> upper(x)) t from users"],
  ['spark', "select array_join(tags, ',') j, array_sort(tags) s from users"],
  ['spark', "select instr(name,'a') i, locate('a', name) l, soundex(name) s from users"],
  ['spark', "select last_day(d) ld, lpad(name, 5, 'x') lp, rpad(name,5,'x') rp from users"],
  ['spark', "select date_format(d,'yyyy') df, quarter(d) q, weekofyear(d) woy from users"],
  ['spark', "select from_unixtime(age) fu, next_day(d,'Mon') nd from users"],
  ['spark', "select parse_url(name,'HOST') host from users"],
  ['spark', "select nvl2(name, age, id) n2, rlike(name,'a') rl from users"],
  ['spark', "select array_position(tags,'x') ap, array_distinct(tags) ad, array_remove(tags,'x') ar from users"],
  ['spark', "select exists(tags, x -> x = 'a') e, forall(tags, x -> x <> '') f from users"],
  ['spark', "select map_concat(attrs, map('b',2)) m from users"],
  ['spark', "select map_filter(attrs, (k,v) -> v > 0) mf, transform_values(attrs, (k,v) -> v + 1) tv, map_from_arrays(tags, ints) mfa from users"],
  ['spark', "select element_at(attrs,'a') ea, map_keys(attrs) mk, map_values(attrs) mv from users"],
  ['spark', "select tags[0] tag, data['x'] j from users"],
  ['spark', "select from_json(name, 'id INT, name STRING') j, to_json(named_struct('id', id)) tj from users"],
  ['spark', "select get_json_object(name,'$.id') g, json_tuple(name,'id') jt from users"],
  ['spark', 'select collect_list(name) cl, collect_set(name) cs, percentile_approx(age, 0.5) pa from users'],
  ['spark', 'select kurtosis(age) k, skewness(age) s from users'],
  ['spark', 'select approx_percentile(age, 0.5) ap, first_value(name) fv from users group by name'],
  ['spark', 'select current_database() db, current_user() u, version() v, hash(name) h, xxhash64(name) xx from users'],
  ['spark', 'select try(name) v from users'],
  ['spark', 'select monotonically_increasing_id() mi from users'],
  ['spark', 'analyze table users compute statistics'],
  ['hive', 'show databases'],
  ['hive', 'select current_database() db, current_user() u, version() v, pmod(age,2) pm, conv(name,10,16) cv from users'],
  ['hive', 'select * from explode(array(1,2)) as t'],
  ['databricks', 'show catalogs'],
  ['databricks', 'show schemas'],
  ['databricks', 'show tables'],
  ['athena', 'show tables'],
  ['cockroachdb', 'show databases'],
  ['materialize', 'show views'],
  ['risingwave', 'show tables'],
  ['teradata', 'help table users'],
  ['teradata', 'help database db'],
  ['teradata', 'help column users.*'],
  ['redshift', 'select table_name from svv.tables'],
  ['redshift', 'select tablename from pg_catalog.svv_tables'],
  ['redshift', 'select query from stl_query'],
  ['druid', 'select segment_id from sys.segments'],
  ['druid', 'select time_floor(created_at, name) tf, time_format(created_at, name) fmt from users'],
] as const;

const noResultCases = [
  ['postgres', 'begin'],
  ['postgres', 'commit'],
  ['postgres', 'rollback'],
  ['postgres', 'savepoint s'],
  ['postgres', 'notify channel'],
  ['postgres', 'listen channel'],
  ['postgres', 'unlisten channel'],
  ['postgres', 'reset all'],
  ['postgres', 'lock table users'],
  ['postgres', 'alter sequence user_id_seq restart with 1'],
  ['postgres', 'cluster users'],
  ['postgres', 'truncate table users'],
  ['postgres', 'create index idx_users_name on users(name)'],
  ['postgres', 'drop index idx_users_name'],
  ['mysql', 'begin'],
  ['mysql', 'commit'],
  ['mysql', 'rollback'],
  ['mysql', 'flush tables'],
  ['mysql', 'kill 1'],
  ['mysql', 'truncate table users'],
  ['mysql', 'create index idx_users_name on users(name)'],
  ['mysql', 'drop index idx_users_name on users'],
  ['sqlite', 'begin'],
  ['sqlite', 'commit'],
  ['sqlite', 'rollback'],
  ['sqlite', 'savepoint s'],
  ['sqlite', 'vacuum'],
  ['sqlite', 'reindex'],
  ['sqlite', 'analyze'],
  ['sqlite', 'detach database x'],
  ['duckdb', 'begin transaction'],
  ['duckdb', 'commit'],
  ['duckdb', 'rollback'],
  ['duckdb', 'install httpfs'],
  ['duckdb', 'force checkpoint'],
  ['duckdb', 'checkpoint'],
  ['duckdb', 'create index idx_users_name on users(name)'],
  ['duckdb', 'drop index idx_users_name'],
  ['snowflake', 'begin'],
  ['snowflake', 'commit'],
  ['snowflake', 'rollback'],
  ['snowflake', 'use database db'],
  ['snowflake', 'use schema public'],
  ['snowflake', 'alter warehouse wh resume'],
  ['snowflake', 'drop table users'],
  ['snowflake', 'create stage st'],
  ['snowflake', 'undrop table users'],
  ['snowflake', 'merge into users using src on users.id=src.id when matched then update set name=src.name'],
  ['spark', 'refresh table users'],
  ['spark', 'repair table users'],
  ['spark', 'msck repair table users'],
  ['spark', 'cache table users'],
  ['spark', 'uncache table users'],
  ['spark', "load data local inpath '/tmp/x' into table users"],
  ['spark', 'dfs -ls /tmp'],
  ['clickhouse', 'drop table users'],
  ['clickhouse', 'truncate table users'],
  ['tsql', 'begin transaction'],
  ['tsql', 'commit'],
  ['tsql', 'rollback'],
  ['tsql', 'checkpoint'],
  ['tsql', 'truncate table users'],
  ['tsql', 'create index idx_users_name on users(name)'],
  ['tsql', 'drop index idx_users_name on users'],
  ['tsql', "raiserror ('x', 16, 1)"],
  ['teradata', "set query_band='app=sqldesc;' for session"],
] as const;

const schemaTrackingCases = [
  ['postgres', 'create schema app; create table app.people(id int, name text); select id, name from app.people'],
  ['postgres', "create table t(id int generated always as identity, name text default 'x', created_at timestamp not null); select id, name, created_at from t"],
  ['postgres', 'create or replace view v as select id, name from users; select name from v'],
  ['postgres', 'create materialized view mv as select id, name from users; select name from mv'],
  ['postgres', 'create table t as select id, name from users; alter table t rename to t2; select name from t2'],
  ['postgres', 'create table app.t(id int); alter schema app rename to app2; select id from app2.t'],
  ['postgres', 'create table t(id int); alter table t add column name text; select name from t'],
  ['postgres', 'create table t(id int, name text); alter table t rename column name to full_name; select full_name from t'],
  ['postgres', 'create table t(id int, name text); alter table t drop column name; select id from t'],
  ['postgres', 'create domain positive_int as int check (value > 0); create table t(id positive_int); select id from t'],
  ['postgres', "create type mood as enum ('sad','ok','happy'); create table t(m mood); select m from t"],
  ['postgres', 'create type pair as (id int, name text); create table t(p pair); select p from t'],
  ['postgres', 'create table people(id int, name text); alter table people set schema app; select id, name from app.people'],
  ['postgres', 'create table people(id int, name text); create view app_people as select id, name from people; alter view app_people rename to people_view; select name from people_view'],
  ['postgres', 'create table people(id int, name text); create synonym p for people; select name from p'],
  ['postgres', 'create function f(x int) returns int language sql as $$ select x $$; select f(age) from users'],
  ['postgres', 'create function f(x int) returns int language sql as $$ select x $$; create table t as select f(age) as v from users; select v from t'],
  ['postgres', 'create function f(x int) returns int language sql as $$ select x $$; create view v as select f(age) as n from users; select n from v'],
  ['postgres', "create function people() returns table(id int, name text) language sql as $$ select 1, 'a' $$; select id, name from people()"],
  ['postgres', "create function people() returns table(id int, name text) language sql as $$ select 1, 'a' $$; select * from people()"],
  ['mysql', 'create procedure p() begin select id, name from users; end; call p()'],
  ['bigquery', 'create function f(x int64) returns int64 as (x + 1); select f(age) from users'],
  ['snowflake', 'create function f(x number) returns number as $$ x + 1 $$; select f(age) from users'],
  ['snowflake', 'create procedure p() returns table(id number, name string) language sql as $$ select id, name from users $$; call p()'],
  ['trino', 'create function f(x integer) returns integer return x + 1; select f(age) from users'],
  ['tsql', 'create table dbo.people(id int, name varchar(20)); select name from dbo.people'],
  ['tsql', 'create procedure p as select id, name from users; exec p'],
  ['tsql', 'create table t(id int identity(1,1) primary key, name nvarchar(20) not null, amount decimal(10,2)); select id, name, amount from t'],
  ['tsql', 'create table #t(id int, name nvarchar(20)); select name from #t'],
  ['tsql', 'create synonym p for users; select name from p'],
  ['mysql', 'create temporary table t(id int, name varchar(20)); select name from t'],
  ['mysql', 'create table t(id int auto_increment primary key, name varchar(20) not null, amount decimal(10,2)); select id, name, amount from t'],
  ['mysql', 'create table t like users; select name from t'],
  ['mysql', 'create table t as select id, name from users; select name from t'],
  ['mysql', 'create view v as select id, name from users; select name from v'],
  ['mysql', 'create table t(id int, name varchar(20)); alter table t change name full_name varchar(30); select full_name from t'],
  ['sqlite', 'create table t(id int, name text); alter table t rename column name to full_name; select full_name from t'],
  ['sqlite', 'create virtual table email using fts5(sender, title, body); select sender, title from email'],
  ['bigquery', 'create table t(id int64, name string, amount numeric); select id, name, amount from t'],
  ['bigquery', 'create table t(id int64); alter table t add column name string; select name from t'],
  ['bigquery', 'create or replace table t as select id, name from users; select name from t'],
  ['bigquery', 'create view v as select id, name from users; select name from v'],
  ['snowflake', 'create or replace table t as select id, name from users; select name from t'],
  ['snowflake', 'create transient table t(id int, name string); select name from t'],
  ['snowflake', 'create table t(id int); alter table t add column name string; select name from t'],
  ['snowflake', 'create table t clone users; select name from t'],
  ['spark', 'create temporary view v as select id, name from users; select name from v'],
  ['spark', 'create table t(id int); alter table t add columns (name string); select name from t'],
  ['spark', 'create table t using parquet as select id, name from users; select name from t'],
  ['oracle', 'create global temporary table t(id number, name varchar2(20)) on commit preserve rows; select id, name from t'],
  ['oracle', 'create table t(id number, name varchar2(20)); select name from t'],
  ['oracle', 'create view v as select id, name from users; select name from v'],
  ['duckdb', 'create or replace view v as select id, name from users; select name from v'],
  ['duckdb', 'create table t(id int, name varchar); alter table t rename column name to full_name; select full_name from t'],
  ['duckdb', 'create macro people_macro() as table select id, name from users; select name from people_macro()'],
  ['duckdb', "create sequence s start 1; select nextval('s') n"],
] as const;

const returningDmlCases = [
  "insert into users(id,name) values (1,'a') returning id, name",
  "update users set name='b' returning id, name",
  'delete from users returning id, name',
  'merge into users using src on users.id=src.id when matched then update set name=src.name returning users.id, src.name',
  "insert into users(id,name) output inserted.id, inserted.name values (1,'a')",
  "update users set name='b' output inserted.id, deleted.name",
  'delete from users output deleted.id, deleted.name',
] as const;

const schemaProducingDdlCases = [
  'create table t(id int, name varchar(20)); select id, name from t',
  'create table t as select id, name from users; select id, name from t',
  'create or replace table t as select id, name from users; select id, name from t',
  'create view v as select id, name from users; select id, name from v',
  'create or replace view v as select id, name from users; select id, name from v',
  'create materialized view mv as select id, name from users; select id, name from mv',
  'create table t like users; select id, name from t',
  'create table t clone users; select id, name from t',
  'create temporary table t(id int, name varchar(20)); select id, name from t',
  'create temporary view v as select id, name from users; select id, name from v',
  'create table t(id int); alter table t add column name varchar(20); select id, name from t',
  'create table t(id int, name varchar(20)); alter table t rename column name to full_name; select full_name from t',
] as const;

const structuralSelectCases = [
  'with c as (select id, name from users) select id, name from c',
  'with c(id, label) as (select id, name from users) select id, label from c',
  'with recursive c(n) as (values (1) union all select n + 1 from c where n < 3) select n from c',
  'select id from users union all select user_id from orders',
  'select id from users intersect select user_id from orders',
  'select id from users except select user_id from orders',
  'select * from (select id, name from users) u',
  'select u.* from (select id, name from users) u',
  "select * from (values (1,'a')) as v(id,name)",
  'select users.id, orders.amount from users left join orders on orders.user_id = users.id',
  'select users.id, orders.amount from users right join orders on orders.user_id = users.id',
  'select users.id, orders.amount from users full join orders on orders.user_id = users.id',
  'select id from users join orders using (id)',
  'select id, (select amount from orders where user_id = users.id) amount from users',
  'select id, name from users where (id, name) in (select id, name from users)',
  'select dept, count(*) c, sum(age) s from users group by dept having count(*) > 0',
  'select id, row_number() over(partition by dept order by age) rn from users',
  'select id from users where id in (select user_id from orders)',
  'select id from users where exists (select 1 from orders where orders.user_id = users.id)',
  'begin select id from users; select name from users; end',
  "values (1, 'a'), (2, 'b')",
] as const;

const tableFunctionCases = [
  'select * from generate_series(1,3)',
  'select * from unnest(array[1,2]) as u(x)',
  "select * from unnest(array['a'], array[1]) as u(name, id)",
  'select * from json_each(\'{"a":1}\')',
  'select * from json_tree(\'{"a":1}\')',
  'select * from json_table(\'{"a":1}\', \'$\' columns (a int path \'$.a\')) jt',
  "select * from xmltable('/a' columns id int path 'id')",
  "select * from table(sys.odcivarchar2list('a','b')) t",
  'select * from explode(array(1,2)) as t',
  'select * from posexplode(array(1,2)) as t',
  "select * from stack(2, 1, 'a', 2, 'b') as t",
  'select * from range(1,3) as r(i)',
  "select * from read_csv('x', columns={'id':'INTEGER','name':'VARCHAR'})",
  "select * from read_json('x', columns={'id':'INTEGER','name':'VARCHAR'})",
  "select * from file('a.csv', CSV, 'id UInt64, name String')",
  "select * from url('http://example.com/a.csv', CSV, 'id UInt64, name String')",
  "select * from s3('url','CSV','id UInt64, name String')",
  "select * from generateRandom('id UInt64, name String')",
  'select * from numbers(3)',
  'select * from sequence(1,3) as t(x)',
  "select * from table(infer_schema(location=>'@mystage', file_format=>'ff'))",
  'select f.key, f.value from users, lateral flatten(input => parse_json(name)) f',
] as const;

const broadNoResultCases = [
  'begin',
  'begin transaction',
  'commit',
  'rollback',
  'savepoint s',
  'rollback to savepoint s',
  'create table t(id int, name varchar(20))',
  'drop table users',
  'truncate table users',
  'create index idx_users_name on users(name)',
  'drop index idx_users_name',
  'drop index idx_users_name on users',
  'alter table users add column nickname varchar(20)',
  'alter table users drop column name',
  'alter table users rename to people',
  'alter table users rename column name to full_name',
  "insert into users(id,name) values (1,'a')",
  "update users set name='b' where id=1",
  'delete from users where id=1',
  'vacuum',
  'analyze',
  'reindex',
  'checkpoint',
  'refresh table users',
  'cache table users',
  'uncache table users',
  'use database db',
  'use schema public',
  'set x = 1',
  'reset all',
  'listen channel',
  'notify channel',
  'unlisten channel',
  'lock table users',
  'grant select on users to role r',
  'revoke select on users from role r',
] as const;

const bindPlaceholderCases = [
  { sql: 'select ? as v', binds: 'integer' },
  { sql: 'select $1 as v', binds: 'integer' },
  { sql: 'select :id as v', binds: 'id=integer' },
  { sql: 'select @id as v', binds: 'id=integer' },
  { sql: 'select $id as v', binds: 'id=integer' },
  { sql: 'select coalesce(?, 1) as v', binds: 'integer' },
  { sql: 'select coalesce(:id, 1) as v', binds: 'id=integer' },
  { sql: 'select cast(? as varchar) as v', binds: 'integer' },
  { sql: 'select ? + 1 as v', binds: 'integer' },
  { sql: "select ? || 'x' as v", binds: 'text' },
] as const;

const expressionShapeCases = [
  'select 1 as v',
  'select 1.5 as v',
  "select 'x' as v",
  'select true as v',
  'select null as v',
  "select date '2020-01-01' as v",
  "select timestamp '2020-01-01 00:00:00' as v",
  'select current_timestamp as v',
  'select cast(1 as varchar) as v',
  "select try_cast('1' as int) as v",
  "select safe_cast('1' as int64) as v",
  'select 1 + 2 as v',
  'select 1 - 2 as v',
  'select 1 * 2 as v',
  'select 1 / 2 as v',
  'select 1 % 2 as v',
  'select 1 & 2 as v',
  'select 1 | 2 as v',
  'select 1 ^ 2 as v',
  'select 1 << 2 as v',
  'select 1 >> 2 as v',
  "select 'a' || 'b' as v",
  'select not true as v',
  'select 1 = 1 as v',
  'select 1 <> 2 as v',
  'select 1 < 2 as v',
  'select 1 between 0 and 2 as v',
  'select 1 in (1,2) as v',
  "select 'abc' like 'a%' as v",
  'select case when true then 1 else 2 end as v',
  'select coalesce(null, 1) as v',
  'select nullif(1,2) as v',
  'select ifnull(null,1) as v',
  'select nvl(null,1) as v',
  'select greatest(1,2) as v',
  'select least(1,2) as v',
  'select 1 is distinct from 2 as v',
  'select 1 is not distinct from 2 as v',
  "select extract(year from timestamp '2020-01-01 00:00:00') as v",
  "select substring('abcdef' from 1 for 2) as v",
  "select trim(' x ') as v",
  "select lower('X') as v",
  "select upper('x') as v",
  "select position('a' in 'abc') as v",
  "select overlay('abc' placing 'x' from 1 for 1) as v",
  'select cast(null as integer) as v',
  'select try_cast(null as integer) as v',
  'select current_date as v',
  'select current_time as v',
  'select localtimestamp as v',
  'select exists(select 1) as v',
  'select array_length(array[1,2], 1) as v',
  'select json_array(1,2) as v',
  "select json_object('a',1) as v",
  'select array[1,2] as v',
  "select map(array['a'], array[1]) as v",
  "select row(1, 'a') as v",
] as const;

const aggregateWindowCases = [
  'select count(*) v from users',
  'select count(distinct name) v from users',
  'select sum(age) v from users',
  'select avg(age) v from users',
  'select min(name) v from users',
  'select max(age) v from users',
  'select median(age) v from users',
  'select stddev(age) v from users',
  'select variance(age) v from users',
  'select bool_and(age > 0) v from users',
  "select string_agg(name, ',') v from users",
  'select array_agg(name) v from users',
  'select any_value(name) v from users',
  'select first_value(name) over(order by id) v from users',
  'select last_value(name) over(order by id) v from users',
  'select row_number() over(order by id) v from users',
  'select rank() over(order by id) v from users',
  'select dense_rank() over(order by id) v from users',
  'select percent_rank() over(order by id) v from users',
  'select cume_dist() over(order by id) v from users',
  'select ntile(4) over(order by id) v from users',
  'select lag(name) over(order by id) v from users',
  'select lead(age) over(order by id) v from users',
  'select grouping(dept) v from users group by rollup(dept)',
  'select grouping_id(dept) v from users group by rollup(dept)',
] as const;

const selectModifierCases = [
  'select distinct dept from users',
  'select distinct on (dept) dept, name from users order by dept, name',
  'select id, name from users order by name limit 10 offset 5',
  'select top 5 id, name from users',
  'select id, name from users fetch first 5 rows only',
  'select id, name from users tablesample bernoulli(10)',
  'select id, name from users sample (10)',
  'select id, row_number() over(order by age) rn from users qualify rn = 1',
  'select id, name from users where age > 0 order by 1',
  'select dept, count(*) c from users group by cube(dept)',
  'select dept, count(*) c from users group by rollup(dept)',
  'select dept, count(*) c from users group by grouping sets ((dept),())',
  'select * from users lateral view explode(tags) e as tag',
  'select id, tag from users, lateral unnest(tags) as t(tag)',
  'pivot users on dept using sum(age)',
  'unpivot users on a,b into name k value v',
  'select * from users match_recognize (partition by dept order by id measures match_number() as m all rows per match pattern (A+) define A as age > 0) mr',
] as const;

describe('polyglot representative SQL coverage', () => {
  it('keeps representative Polyglot statement kinds explicitly covered', () => {
    const cases = representativeSqlCases();
    const unknownKinds = new Map<string, string[]>();

    for (const [dialect, sql] of cases) {
      const parsed = parse(sql, dialect);
      if (parsed.error || !Array.isArray(parsed.ast)) continue;
      for (const statement of parsed.ast) {
        const kind = statementKind(statement);
        if (!knownStatementKinds.has(kind)) {
          const examples = unknownKinds.get(kind) ?? [];
          if (examples.length < 5) examples.push(`${dialect}: ${sql}`);
          unknownKinds.set(kind, examples);
        }
      }
    }

    assert.deepStrictEqual([...unknownKinds.entries()], []);
  });

  for (const dialect of getDialects()) {
    it(`describes a schema-backed SELECT for supported dialect: ${dialect}`, async () => {
      const result = await describeQuery({
        dialect,
        sql: 'select id, name from users',
        schema: coverageSchema,
      });

      assert.strictEqual(result.statements[0]?.resultKind, 'static');
      assert.deepStrictEqual(result.columns.map((column) => [column.name, column.type, column.source]), [
        ['id', 'integer', 'users.id'],
        ['name', 'text', 'users.name'],
      ]);
      assert.deepStrictEqual(result.warnings, []);
    });
  }

  for (const dialect of getDialects()) {
    for (const sql of ['show tables', 'show schemas'] as const) {
      it(`statically describes ${sql} for supported dialect: ${dialect}`, async () => {
        const result = await describeQuery({ dialect, sql, schema: coverageSchema });

        assert.strictEqual(result.statements[0]?.resultKind, 'static');
        assert.ok(result.columns.length > 0);
        assert.strictEqual(unresolvedColumnCount(result), 0);
        assert.deepStrictEqual(result.warnings, []);
      });
    }
  }

  for (const [dialect, sql] of staticResultCases) {
    it(`statically describes ${dialect}: ${sql}`, async () => {
      const result = await describeQuery({ dialect, sql, schema: coverageSchema });

      assert.strictEqual(result.statements[0]?.resultKind, 'static');
      assert.ok(result.columns.length > 0);
      assert.ok(result.columns.length < 80);
      assert.strictEqual(unresolvedColumnCount(result), 0);
      assert.deepStrictEqual(result.warnings, []);
      assert.deepStrictEqual(result.diagnostics, []);
    });
  }

  for (const [dialect, sql] of noResultCases) {
    it(`classifies no-result ${dialect}: ${sql}`, async () => {
      const result = await describeQuery({ dialect, sql, schema: coverageSchema });

      assert.deepStrictEqual(result.columns, []);
      assert.strictEqual(result.statements[0]?.resultKind, 'none');
    });
  }

  for (const [dialect, sql] of schemaTrackingCases) {
    it(`tracks schema changes for ${dialect}: ${sql}`, async () => {
      const result = await describeQuery({ dialect, sql, schema: coverageSchema });
      const lastStatement = result.statements.at(-1);
      const lastResultSet = result.resultSets.at(-1);

      assert.strictEqual(lastStatement?.resultKind, 'static');
      assert.ok(lastResultSet);
      assert.ok(lastResultSet.columns.length > 0);
      assert.strictEqual(unresolvedColumnCount({ ...result, columns: lastResultSet.columns }), 0);
      assert.deepStrictEqual(result.warnings, []);
    });
  }

  for (const dialect of getDialects()) {
    for (const sql of returningDmlCases) {
      it(`statically describes result-producing DML for supported dialect: ${dialect}: ${sql}`, async () => {
        const result = await describeQuery({ dialect, sql, schema: coverageSchema });

        assert.strictEqual(result.statements[0]?.resultKind, 'static');
        assert.ok(result.columns.length > 0);
        assert.strictEqual(unresolvedColumnCount(result), 0);
        assert.deepStrictEqual(result.warnings, []);
        assert.deepStrictEqual(result.diagnostics, []);
      });
    }
  }

  for (const dialect of getDialects()) {
    for (const sql of schemaProducingDdlCases) {
      it(`tracks schema-producing DDL for supported dialect: ${dialect}: ${sql}`, async () => {
        const result = await describeQuery({ dialect, sql, schema: coverageSchema });
        const lastStatement = result.statements.at(-1);
        const lastResultSet = result.resultSets.at(-1);

        assert.strictEqual(lastStatement?.resultKind, 'static');
        assert.ok(lastResultSet);
        assert.ok(lastResultSet.columns.length > 0);
        assert.strictEqual(unresolvedColumnCount({ ...result, columns: lastResultSet.columns }), 0);
        assert.deepStrictEqual(result.warnings, []);
        assert.deepStrictEqual(result.diagnostics, []);
      });
    }
  }

  for (const dialect of getDialects()) {
    for (const sql of structuralSelectCases) {
      it(`statically describes structural SELECT for supported dialect: ${dialect}: ${sql}`, async () => {
        const result = await describeQuery({ dialect, sql, schema: coverageSchema });

        assert.strictEqual(result.statements[0]?.resultKind, 'static');
        assert.ok(result.columns.length > 0);
        assert.strictEqual(unresolvedColumnCount(result), 0);
        assert.deepStrictEqual(result.warnings, []);
        assert.deepStrictEqual(result.diagnostics, []);
      });
    }
  }

  for (const dialect of getDialects()) {
    for (const sql of tableFunctionCases) {
      it(`statically describes table function for supported dialect: ${dialect}: ${sql}`, async () => {
        const parsed = parse(sql, dialect);
        if (parsed.error) return;

        const result = await describeQuery({ dialect, sql, schema: coverageSchema });
        const columns = result.resultSets.at(-1)?.columns ?? result.columns;

        assert.strictEqual(result.statements.at(-1)?.resultKind, 'static');
        assert.ok(columns.length > 0);
        assert.strictEqual(unresolvedColumnCount({ ...result, columns }), 0);
        assert.deepStrictEqual(result.warnings, []);
        assert.deepStrictEqual(result.diagnostics, []);
      });
    }
  }

  for (const dialect of getDialects()) {
    for (const sql of broadNoResultCases) {
      it(`classifies broad no-result statement for supported dialect: ${dialect}: ${sql}`, async () => {
        const parsed = parse(sql, dialect);
        if (parsed.error) return;

        const result = await describeQuery({ dialect, sql, schema: coverageSchema });

        assert.deepStrictEqual(result.columns, []);
        assert.deepStrictEqual(result.resultSets, []);
        assert.strictEqual(result.statements[0]?.resultKind, 'none');
      });
    }
  }

  for (const dialect of getDialects()) {
    for (const { sql, binds } of bindPlaceholderCases) {
      it(`infers bind placeholder type for supported dialect: ${dialect}: ${sql}`, async () => {
        const parsed = parse(sql, dialect);
        if (parsed.error) return;

        const result = await describeQuery({ dialect, sql, binds });

        assert.strictEqual(result.statements[0]?.resultKind, 'static');
        assert.strictEqual(result.columns.length, 1);
        assert.notStrictEqual(result.columns[0]?.type, 'unknown');
        assert.deepStrictEqual(result.warnings, []);
        assert.deepStrictEqual(result.diagnostics, []);
      });
    }
  }

  for (const dialect of getDialects()) {
    for (const sql of expressionShapeCases) {
      it(`infers expression shape for supported dialect: ${dialect}: ${sql}`, async () => {
        const parsed = parse(sql, dialect);
        if (parsed.error) return;

        const result = await describeQuery({ dialect, sql });

        assert.strictEqual(result.statements[0]?.resultKind, 'static');
        assert.strictEqual(result.columns.length, 1);
        assert.notStrictEqual(result.columns[0]?.type, 'unknown');
        assert.deepStrictEqual(result.warnings, []);
        assert.deepStrictEqual(result.diagnostics, []);
      });
    }
  }

  for (const dialect of getDialects()) {
    for (const sql of aggregateWindowCases) {
      it(`infers aggregate/window expression for supported dialect: ${dialect}: ${sql}`, async () => {
        const parsed = parse(sql, dialect);
        if (parsed.error) return;

        const result = await describeQuery({ dialect, sql, schema: coverageSchema });

        assert.strictEqual(result.statements[0]?.resultKind, 'static');
        assert.strictEqual(result.columns.length, 1);
        assert.notStrictEqual(result.columns[0]?.type, 'unknown');
        assert.deepStrictEqual(result.warnings, []);
        assert.deepStrictEqual(result.diagnostics, []);
      });
    }
  }

  for (const dialect of getDialects()) {
    for (const sql of selectModifierCases) {
      it(`statically describes SELECT modifier for supported dialect: ${dialect}: ${sql}`, async () => {
        const parsed = parse(sql, dialect);
        if (parsed.error) return;

        const result = await describeQuery({ dialect, sql, schema: coverageSchema });
        const columns = result.resultSets.at(-1)?.columns ?? result.columns;

        assert.strictEqual(result.statements.at(-1)?.resultKind, 'static');
        assert.ok(columns.length > 0);
        assert.strictEqual(unresolvedColumnCount({ ...result, columns }), 0);
        assert.deepStrictEqual(result.warnings, []);
        assert.deepStrictEqual(result.diagnostics, []);
      });
    }
  }
});

function unresolvedColumnCount(result: DescribeResult): number {
  return result.columns.filter((column) => column.type === 'unknown').length;
}

function representativeSqlCases(): Array<[string, string]> {
  const dialects = getDialects().map(String);
  return [
    ...staticResultCases,
    ...noResultCases,
    ...schemaTrackingCases,
    ...dialects.flatMap((dialect) => returningDmlCases.map((sql): [string, string] => [dialect, sql])),
    ...dialects.flatMap((dialect) => schemaProducingDdlCases.map((sql): [string, string] => [dialect, sql])),
    ...dialects.flatMap((dialect) => structuralSelectCases.map((sql): [string, string] => [dialect, sql])),
    ...dialects.flatMap((dialect) => tableFunctionCases.map((sql): [string, string] => [dialect, sql])),
    ...dialects.flatMap((dialect) => broadNoResultCases.map((sql): [string, string] => [dialect, sql])),
    ...dialects.flatMap((dialect) => bindPlaceholderCases.map(({ sql }): [string, string] => [dialect, sql])),
    ...dialects.flatMap((dialect) => expressionShapeCases.map((sql): [string, string] => [dialect, sql])),
    ...dialects.flatMap((dialect) => aggregateWindowCases.map((sql): [string, string] => [dialect, sql])),
    ...dialects.flatMap((dialect) => selectModifierCases.map((sql): [string, string] => [dialect, sql])),
  ];
}

function statementKind(statement: unknown): string {
  return isRecord(statement) ? Object.keys(statement)[0] ?? 'unknown' : 'unknown';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const knownStatementKinds = new Set([
  'add',
  'alias',
  'alter_table',
  'alter_sequence',
  'alter_view',
  'analyze',
  'array_func',
  'attach',
  'between',
  'boolean',
  'cache',
  'case',
  'cast',
  'clone',
  'coalesce',
  'column',
  'command',
  'comment',
  'commit',
  'concat',
  'copy',
  'create_database',
  'create_function',
  'create_index',
  'create_procedure',
  'create_schema',
  'create_sequence',
  'create_synonym',
  'create_table',
  'create_task',
  'create_trigger',
  'create_type',
  'create_view',
  'declare',
  'declare_item',
  'delete',
  'describe',
  'detach',
  'div',
  'drop_database',
  'drop_function',
  'drop_index',
  'drop_namespace',
  'drop_procedure',
  'drop_schema',
  'drop_sequence',
  'drop_table',
  'drop_trigger',
  'drop_type',
  'drop_view',
  'eq',
  'except',
  'execute',
  'exists',
  'export',
  'extract',
  'function',
  'grant',
  'gt',
  'gte',
  'if_func',
  'in',
  'insert',
  'install',
  'intersect',
  'is',
  'is_not_null',
  'is_null',
  'kill',
  'like',
  'literal',
  'load_data',
  'locking_statement',
  'lt',
  'lte',
  'merge',
  'mod',
  'mul',
  'neg',
  'not',
  'null',
  'null_safe_eq',
  'null_safe_neq',
  'paren',
  'pivot',
  'power',
  'pragma',
  'prepare',
  'put',
  'query_band',
  'raw',
  'refresh',
  'revoke',
  'rollback',
  'safe_cast',
  'select',
  'sequence_properties',
  'set_statement',
  'show',
  'similar_to',
  'sub',
  'subquery',
  'summarize',
  'transaction',
  'truncate',
  'truncate_table',
  'try_cast',
  'uncache',
  'undrop',
  'union',
  'update',
  'use',
  'values',
]);
