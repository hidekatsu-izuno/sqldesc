# Apache Doris テストケース

このドキュメントは [Apache Doris 公式ドキュメント](https://doris.apache.org/docs/sql-manual/sql-statements/data-query/SELECT/) に基づき、`sqldesc` が Apache Doris 方言（`--dialect doris`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/doris.md`）。

```yaml
doc: sqldesc-test/v1
dialect: doris
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句、collect_list / collect_set、approx_count_distinct / percentile_approx、group_concat |
| Bitmap / HLL | to_bitmap / bitmap_count、hll_hash / hll_cardinality |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、NTILE / cume_dist |
| LATERAL VIEW | explode |
| 配列・JSON | array_size / array_contains、配列関数、JSON 関数 |
| 関数 | 日時、文字列、型変換、システム関数 |
| テーブル関数 | numbers、s3 |
| 副問い合わせ・集合演算 | CTE（WITH）、EXCEPT、UNION、INTERSECT |
| メタデータ | SHOW DATABASES / TABLES / COLUMNS / PARTITIONS / CATALOGS / TABLE STATUS / TABLETS、SHOW CREATE TABLE、EXPLAIN、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Apache Doris SELECT](https://doris.apache.org/docs/sql-manual/sql-statements/data-query/SELECT/) |
| Bitmap | [Bitmap functions](https://doris.apache.org/docs/sql-manual/sql-functions/aggregate-functions/bitmap-functions) |
| HLL | [HLL functions](https://doris.apache.org/docs/sql-manual/sql-functions/aggregate-functions/hll-functions) |
| 配列 | [Array functions](https://doris.apache.org/docs/sql-manual/sql-functions/array-functions) |
| JSON | [JSON functions](https://doris.apache.org/docs/sql-manual/sql-functions/json-functions) |
| テーブル関数 | [Table functions](https://doris.apache.org/docs/sql-manual/sql-functions/table-functions) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: doris
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  created_at TIMESTAMP,
  data JSON,
  tags Array(TEXT)
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

---

# SELECT 基本

[Apache Doris SELECT](https://doris.apache.org/docs/sql-manual/sql-statements/data-query/SELECT/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
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
| id | int | users.id |
| name | varchar(255) | users.name |
| amount | decimal | users.amount |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
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
| id | int | users.id |
| name | varchar(255) | users.name |
| age | int | users.age |
| dept | varchar(255) | users.dept |
| amount | decimal | users.amount |
| created_at | timestamp | users.created_at |
| data | json | users.data |
| tags | array<text> | users.tags |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
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
| one | int | literal |
| label | varchar(255) | literal |
| ok | tinyint(1) | expression |

---
## ORDER BY / LIMIT / OFFSET

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT id FROM users ORDER BY id LIMIT 10 OFFSET 5
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |

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
dialect: doris
```

```sql
SELECT u.id, o.amount
FROM users u
JOIN orders o ON o.user_id = u.id
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
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
dialect: doris
```

```sql
SELECT dept, count(*) AS n, sum(amount) AS total
FROM users
GROUP BY dept
HAVING count(*) > 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar(255) | users.dept |
| n | int | expression |
| total | decimal | expression |

---
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT count(*) FILTER (WHERE age >= 20) AS adults FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| adults | int | expression |

---
## collect_list / collect_set

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT collect_list(dept) AS depts, collect_set(dept) AS udepts FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| depts | array<text> | expression |
| udepts | array<text> | expression |

---
## approx_count_distinct / percentile_approx

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT approx_count_distinct(dept) AS ac, percentile_approx(amount, 0.5) AS p50 FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ac | int | expression |
| p50 | decimal | expression |

---
## group_concat / any_value

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT group_concat(name) AS gc, any_value(name) AS av FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| gc | varchar(255) | expression |
| av | varchar(255) | expression |

---

# Bitmap / HLL

Doris の特徴的な近似・集合型集約です。

[Bitmap functions](https://doris.apache.org/docs/sql-manual/sql-functions/aggregate-functions/bitmap-functions)、[HLL functions](https://doris.apache.org/docs/sql-manual/sql-functions/aggregate-functions/hll-functions)

---

## bitmap_count / to_bitmap

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT bitmap_count(to_bitmap(age)) AS bc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| bc | int | expression |

---
## hll_cardinality / hll_hash

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT hll_cardinality(hll_hash(name)) AS hc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| hc | int | expression |

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
dialect: doris
```

```sql
SELECT id, row_number() OVER (PARTITION BY dept ORDER BY id) AS rn FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| rn | int | expression |

---
## RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT rank() OVER (ORDER BY amount DESC) AS r FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | int | expression |

---
## LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT lag(name) OVER (ORDER BY id) AS prev FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| prev | varchar(255) | expression |

---
## NTILE / cume_dist

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT ntile(4) OVER (ORDER BY amount) AS q, cume_dist() OVER (ORDER BY amount) AS cd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| q | int | expression |
| cd | decimal | expression |

---

# LATERAL VIEW

[LATERAL VIEW explode](https://doris.apache.org/docs/sql-manual/sql-statements/data-query/SELECT/) で配列列を行に展開します。

---

## explode

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT id, tag FROM users LATERAL VIEW explode(tags) t AS tag
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| tag | varchar(255) | t.tag |

---

# 配列・JSON

---

## array_size / array_contains

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT array_size(tags) AS s, array_contains(tags, 'x') AS c FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | int | expression |
| c | tinyint(1) | expression |

---
## 配列関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT array_sort(tags) AS sorted, array_distinct(tags) AS distinct_tags, array_sum(array(age)) AS s FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sorted | array<text> | expression |
| distinct_tags | array<text> | expression |
| s | int | expression |

---
## JSON 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT
  json_extract(data, '$.name') AS n,
  json_extract_string(data, '$.name') AS js,
  json_length(data) AS jl,
  json_type(data) AS jt
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | json | expression |
| js | varchar(255) | expression |
| jl | int | expression |
| jt | varchar(255) | expression |

---

# 関数

---

## 日時関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT
  date_format(created_at, '%Y-%m') AS ym,
  to_date(created_at) AS d,
  date_trunc(created_at, 'month') AS dt,
  from_unixtime(unix_timestamp(created_at)) AS ts
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ym | varchar(255) | polyglot |
| d | date | expression |
| dt | timestamp | expression |
| ts | timestamp | expression |

---
## 文字列関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT
  ifnull(name, 'x') AS n,
  if(age >= 20, 'adult', 'minor') AS cat,
  md5(name) AS h,
  regexp_extract(name, '[A-Z]+') AS m
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | varchar(255) | expression |
| cat | varchar(255) | expression |
| h | varchar(255) | expression |
| m | varchar(255) | expression |

---
## 型変換

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT cast(amount AS double) AS a FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | double | polyglot |

---
## システム関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT version() AS v, database() AS db, user() AS u, uuid() AS uid FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | varchar(255) | expression |
| db | varchar(255) | expression |
| u | varchar(255) | expression |
| uid | char(36) | expression |

---

# テーブル関数

[Table functions](https://doris.apache.org/docs/sql-manual/sql-functions/table-functions)

---

## numbers

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
```

```sql
SELECT * FROM numbers('number', '0', '3')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| numbers | unknown | numbers.numbers |

---
## s3

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
```

```sql
SELECT * FROM s3('s3://bucket/file.csv', 'CSV', 'id INT, name STRING')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s3 | unknown | s3.s3 |

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
dialect: doris
```

```sql
WITH cte AS (SELECT id, name FROM users) SELECT id FROM cte
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | cte.id |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT id FROM users EXCEPT SELECT id FROM users WHERE age < 18
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | cast |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT id FROM users UNION SELECT id FROM users WHERE age < 18
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
```

```sql
SELECT id FROM users INTERSECT SELECT id FROM users WHERE age >= 18
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | cast |

---

# メタデータ

---

## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
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
| Database | varchar(255) | cast |

---
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
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
| Table | varchar(255) | cast |

---
## SHOW COLUMNS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
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
| Field | varchar(255) | cast |
| Type | varchar(255) | cast |
| Null | varchar(255) | cast |
| Key | varchar(255) | cast |
| Default | varchar(255) | cast |
| Extra | varchar(255) | cast |

---
## SHOW PARTITIONS

Doris 固有のパーティション情報コマンドです。

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
```

```sql
SHOW PARTITIONS FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| partition | varchar(255) | cast |

---
## SHOW CATALOGS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
```

```sql
SHOW CATALOGS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Catalog | varchar(255) | cast |

---
## SHOW CREATE TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
```

```sql
SHOW CREATE TABLE users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | varchar(255) | cast |
| Create Table | varchar(255) | cast |

---
## SHOW TABLE STATUS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
```

```sql
SHOW TABLE STATUS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| created_on | timestamp | cast |
| name | varchar(255) | cast |
| database_name | varchar(255) | cast |
| schema_name | varchar(255) | cast |
| kind | varchar(255) | cast |
| comment | varchar(255) | cast |
| cluster_by | varchar(255) | cast |
| rows | int | cast |
| bytes | int | cast |
| owner | varchar(255) | cast |
| retention_time | int | cast |
| automatic_clustering | varchar(255) | cast |
| change_tracking | tinyint(1) | cast |
| search_optimization | tinyint(1) | cast |

---
## SHOW TABLETS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
```

```sql
SHOW TABLETS FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tablets | varchar(255) | cast |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
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
| QUERY PLAN | varchar(255) | cast |

---
## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
```

```sql
SELECT table_name FROM information_schema.tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | varchar(255) | information_schema.tables.table_name |

---
## information_schema.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: doris
```

```sql
SELECT column_name, data_type FROM information_schema.columns
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_name | varchar(255) | information_schema.columns.column_name |
| data_type | varchar(255) | information_schema.columns.data_type |

---
