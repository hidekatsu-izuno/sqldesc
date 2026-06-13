# DuneSQL テストケース

このドキュメントは [DuneSQL 公式ドキュメント](https://docs.dune.com/query-engine/Functions-and-operators/index) に基づき、`sqldesc` が DuneSQL 方言（`--dialect dune`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/dune.md`）。

```yaml
doc: sqldesc-test/v1
dialect: dune
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / OFFSET / LIMIT、`* EXCEPT` |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句、approx_distinct / approx_percentile、any_value / arbitrary / array_agg / count_if |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、NTILE、cume_dist / percent_rank、ウィンドウ集約 |
| 複合行ソース | VALUES、UNNEST、CROSS JOIN UNNEST、generate_series |
| 型・関数 | ARRAY / MAP、配列高階関数、JSON、日時関数、文字列・ハッシュ |
| VARBINARY / UINT256 | **varbinary_to_uint256**、**bytearray_substring**、cast AS uint256 |
| 近似・ビットマップ | **hll_hash** / **to_bitmap** / hll_cardinality |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、EXCEPT、UNION、INTERSECT |
| メタデータ | SHOW DATABASES / SCHEMAS / TABLES / COLUMNS / FUNCTIONS、DESCRIBE、EXPLAIN、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [DuneSQL SELECT](https://docs.dune.com/query-engine/Functions-and-operators/index) |
| VARBINARY | [Varbinary functions](https://docs.dune.com/query-engine/Functions-and-operators/varbinary) |
| データ型 | [Datatypes](https://docs.dune.com/query-engine/datatypes) |
| EVM デコード | [EVM Decoding Functions](https://docs.dune.com/query-engine/Functions-and-operators/evm-decoding-functions) |
| 配列 | [Array functions](https://docs.dune.com/query-engine/Functions-and-operators/array) |
| JSON | [JSON functions](https://docs.dune.com/query-engine/Functions-and-operators/json) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: dune
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  data JSON,
  tags array<varchar>,
  addr VARBINARY,
  created_at TIMESTAMP
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

---

# SELECT 基本

[DuneSQL SELECT](https://docs.dune.com/query-engine/Functions-and-operators/index)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id, name, amount FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| name | varchar | users.name |
| amount | decimal | users.amount |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT * FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| name | varchar | users.name |
| age | integer | users.age |
| dept | varchar | users.dept |
| amount | decimal | users.amount |
| data | json | users.data |
| tags | array(varchar) | users.tags |
| addr | varbinary | users.addr |
| created_at | timestamp(3) | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SELECT 1 AS one, 'x' AS label, true AS ok
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | integer | literal |
| label | varchar | literal |
| ok | boolean | expression |

---
## ORDER BY / OFFSET / LIMIT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id FROM users ORDER BY id OFFSET 5 LIMIT 10
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |

---
## `*` EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT * EXCEPT (age, dept) FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| name | varchar | users.name |
| amount | decimal | users.amount |
| data | json | users.data |
| tags | array(varchar) | users.tags |
| addr | varbinary | users.addr |
| created_at | timestamp(3) | users.created_at |

---

# JOIN

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT u.id, o.amount FROM users u INNER JOIN orders o ON u.id = o.user_id
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | decimal | orders.amount |

---

# 集約

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT dept, COUNT(*) AS cnt, SUM(amount) AS total FROM users GROUP BY dept HAVING COUNT(*) > 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar | users.dept |
| cnt | integer | expression |
| total | decimal | expression |

---
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT dept, COUNT(*) FILTER (WHERE age > 30) AS adult_cnt FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar | users.dept |
| adult_cnt | integer | expression |

---
## approx_distinct / approx_percentile

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT approx_distinct(name) AS ad, approx_percentile(amount, 0.5) AS ap FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ad | integer | expression |
| ap | decimal | expression |

---
## any_value / arbitrary / array_agg / count_if

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT any_value(name) AS av, arbitrary(amount) AS ar, array_agg(name) AS names, count_if(age > 30) AS cif FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| av | varchar | expression |
| ar | decimal | expression |
| names | array(varchar) | expression |
| cif | integer | expression |

---

# ウィンドウ関数

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY amount) AS rn FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| rn | integer | expression |

---
## RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id, RANK() OVER (ORDER BY amount DESC) AS rk FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| rk | integer | expression |

---
## LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id, LAG(amount, 1) OVER (ORDER BY id) AS prev FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| prev | decimal | expression |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id, NTILE(4) OVER (ORDER BY amount) AS quartile FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| quartile | integer | expression |

---
## cume_dist / percent_rank

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id, cume_dist() OVER (ORDER BY amount) AS cd, percent_rank() OVER (ORDER BY amount) AS pr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| cd | decimal | expression |
| pr | decimal | expression |

---
## ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id, SUM(amount) OVER (PARTITION BY dept ORDER BY id) AS running FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| running | decimal | polyglot |

---

# 複合行ソース

---

## VALUES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SELECT * FROM (VALUES (1, 'a'), (2, 'b')) AS t(id, name)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |
| name | varchar | t.name |

---
## CROSS JOIN UNNEST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id, tag FROM users CROSS JOIN UNNEST(tags) AS t(tag)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| tag | varchar | t.tag |

---
## UNNEST

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SELECT * FROM UNNEST(ARRAY[1, 2, 3]) AS t(n)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | integer | t.n |

---
## generate_series

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SELECT * FROM generate_series(1, 5) AS g(n)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | integer | g.n |

---

# 型・関数

---

## ARRAY / 配列高階関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT tags, cardinality(tags) AS cnt, array_join(tags, ',') AS joined, transform(tags, x -> upper(x)) AS tx, element_at(tags, 1) AS e1 FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tags | array(varchar) | users.tags |
| cnt | integer | expression |
| joined | varchar | expression |
| tx | array(varchar) | expression |
| e1 | varchar | expression |

---
## MAP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT map(ARRAY[1, 2], ARRAY['a', 'b']) AS m FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| m | map(integer, varchar) | expression |

---
## JSON

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT json_value(data, '$.x') AS jv, json_query(data, '$.y') AS jq, parse_json('{"a":1}') AS pj FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jv | varchar | expression |
| jq | json | expression |
| pj | json | expression |

---
## 日時関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT date_trunc('month', created_at) AS dt, date_diff('day', created_at, current_timestamp) AS dd, year(created_at) AS y, month(created_at) AS m, format_date(created_at, '%Y-%m') AS fm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dt | timestamp(3) | expression |
| dd | integer | expression |
| y | integer | expression |
| m | integer | expression |
| fm | varchar | expression |

---
## 文字列・ハッシュ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT regexp_extract(name, '[A-Z]+') AS re, safe_divide(amount, age) AS sd, greatest(amount, 0) AS g, starts_with(name, 'A') AS sw, to_hex(addr) AS th, md5(name) AS m, sha256(addr) AS s FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| re | varchar | expression |
| sd | decimal | expression |
| g | integer | polyglot |
| sw | boolean | expression |
| th | varchar | expression |
| m | varchar | expression |
| s | varbinary | expression |

---
## current_date / gen_random_uuid

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT current_date AS cd, current_timestamp AS ct, gen_random_uuid() AS uuid FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cd | date | polyglot |
| ct | timestamp(3) | expression |
| uuid | uuid | expression |

---

# VARBINARY / UINT256

[DuneSQL Varbinary functions](https://docs.dune.com/query-engine/Functions-and-operators/varbinary)

---

## varbinary_to_uint256 / bytearray_substring

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT varbinary_to_uint256(addr) AS vu, bytearray_substring(addr, 1, 2) AS bs FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| vu | decimal | expression |
| bs | varchar | expression |

---
## cast AS uint256

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT cast(id AS uint256) AS u256, cast(amount AS decimal(38, 0)) AS d38 FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| u256 | uint256 | polyglot |
| d38 | decimal(38,0) | polyglot |

---

# 近似・ビットマップ

---

## hll_hash / to_bitmap / hll_cardinality

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT hll_hash(name) AS hh, to_bitmap(id) AS tb, hll_cardinality(hll_hash(name)) AS hc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| hh | hll | expression |
| tb | bitmap | expression |
| hc | integer | expression |

---

# 副問い合わせ・集合演算

---

## CTE（WITH）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
WITH cte AS (SELECT id, name FROM users WHERE age > 20) SELECT * FROM cte
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cte.id |
| name | varchar | cte.name |

---
## 相関副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT name, (SELECT MAX(amount) FROM orders WHERE user_id = users.id) AS max_order FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | varchar | users.name |
| max_order | decimal | expression |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id FROM users EXCEPT SELECT id FROM orders
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cast |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id FROM users UNION SELECT user_id AS id FROM orders
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SELECT id FROM users INTERSECT SELECT user_id AS id FROM orders
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cast |

---

# メタデータ

---

## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SHOW TABLES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | varchar | cast |

---
## SHOW SCHEMAS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SHOW SCHEMAS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Schema | varchar | cast |

---
## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SHOW DATABASES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Database | varchar | cast |

---
## SHOW COLUMNS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
SHOW COLUMNS FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Field | varchar | cast |
| Type | varchar | cast |
| Null | varchar | cast |
| Key | varchar | cast |
| Default | varchar | cast |
| Extra | varchar | cast |

---
## SHOW FUNCTIONS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SHOW FUNCTIONS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Function | varchar | cast |
| Type | varchar | cast |
| Definer | varchar | cast |
| Modified | timestamp(3) | cast |
| Created | timestamp(3) | cast |
| Security_type | varchar | cast |
| Comment | varchar | cast |

---
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
DESCRIBE users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| name | varchar | users.name |
| age | integer | users.age |
| dept | varchar | users.dept |
| amount | decimal | users.amount |
| data | json | users.data |
| tags | array(varchar) | users.tags |
| addr | varbinary | users.addr |
| created_at | timestamp(3) | users.created_at |

---
## DESCRIBE FUNCTION

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
DESCRIBE FUNCTION abs
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Name | varchar | cast |
| Description | varchar | cast |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
```

```sql
EXPLAIN SELECT id FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| QUERY PLAN | varchar | cast |

---
## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'default'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | varchar | information_schema.tables.table_name |
| table_type | varchar | information_schema.tables.table_type |

---
## information_schema.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_name | varchar | information_schema.columns.column_name |
| data_type | varchar | information_schema.columns.data_type |

---
## information_schema.schemata

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: dune
```

```sql
SELECT schema_name FROM information_schema.schemata
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| schema_name | varchar | information_schema.schemata.schema_name |

---
