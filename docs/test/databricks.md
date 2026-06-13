# Databricks SQL テストケース

このドキュメントは [Databricks SQL 公式ドキュメント](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select) に基づき、`sqldesc` が Databricks SQL 方言（`--dialect databricks`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/databricks.md`）。

```yaml
doc: sqldesc-test/v1
dialect: databricks
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、`* EXCEPT`、TABLESAMPLE |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句、collect_list / collect_set、approx_count_distinct、ROLLUP |
| ウィンドウ関数 | ROW_NUMBER、RANK、LEAD |
| LATERAL VIEW | explode、posexplode |
| 型・関数 | ARRAY / MAP、JSON、STRUCT、配列高階関数、日時、文字列・ハッシュ、型変換 |
| Delta Lake | VERSION AS OF、TIMESTAMP AS OF、`@v1` タイムトラベル |
| テーブル関数 | range |
| 副問い合わせ・集合演算 | CTE（WITH）、EXCEPT、UNION、INTERSECT |
| メタデータ | SHOW CATALOGS / SCHEMAS / TABLES、DESCRIBE DETAIL / HISTORY / CATALOG / SCHEMA / EXTENDED、SHOW CREATE TABLE、EXPLAIN、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Databricks SQL SELECT](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select) |
| Delta Lake | [Time travel](https://docs.databricks.com/aws/en/delta/history) |
| 関数 | [Databricks SQL functions](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions) |
| LATERAL VIEW | [LATERAL VIEW](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-lateral-view) |
| SHOW | [Databricks SQL SHOW](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-ddl-show) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: databricks
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  created_at TIMESTAMP,
  data STRING,
  tags Array(TEXT),
  attrs Map(TEXT, INTEGER)
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

---

# SELECT 基本

[Databricks SQL SELECT](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |
| amount | DECIMAL | users.amount |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |
| age | INTEGER | users.age |
| dept | VARCHAR(255) | users.dept |
| amount | DECIMAL | users.amount |
| created_at | TIMESTAMP | users.created_at |
| data | VARCHAR(255) | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, integer> | users.attrs |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
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
| one | INTEGER | literal |
| label | VARCHAR(255) | literal |
| ok | BOOLEAN | expression |

---
## ORDER BY / LIMIT / OFFSET

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| id | INTEGER | users.id |

---
## `* EXCEPT`

Databricks / Spark SQL 固有の列除外構文です。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT * EXCEPT(age) FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |
| dept | VARCHAR(255) | users.dept |
| amount | DECIMAL | users.amount |
| created_at | TIMESTAMP | users.created_at |
| data | VARCHAR(255) | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, integer> | users.attrs |

---
## TABLESAMPLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT id FROM users TABLESAMPLE (10 PERCENT)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |

---

# JOIN

[Databricks SQL JOIN](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-join)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| id | INTEGER | users.id |
| amount | DECIMAL | orders.amount |

---

# 集約

[Databricks SQL aggregate functions](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions-aggregate)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| dept | VARCHAR(255) | users.dept |
| n | INTEGER | expression |
| total | DECIMAL | expression |

---
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| adults | INTEGER | expression |

---
## collect_list / collect_set

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
## approx_count_distinct

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT approx_count_distinct(dept) AS ac FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ac | INTEGER | expression |

---
## GROUP BY ROLLUP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT dept, sum(amount) AS total FROM users GROUP BY ROLLUP(dept)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| total | DECIMAL | expression |

---

# ウィンドウ関数

[Databricks SQL window functions](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions-window)

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| id | INTEGER | users.id |
| rn | INTEGER | expression |

---
## RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| r | INTEGER | expression |

---
## LEAD

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT lead(name) OVER (ORDER BY id) AS next_name FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| next_name | VARCHAR(255) | expression |

---

# LATERAL VIEW

[LATERAL VIEW](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-lateral-view) は Databricks / Spark SQL で配列を行に展開する典型的な構文です。

---

## explode

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| id | INTEGER | users.id |
| tag | VARCHAR(255) | t.tag |

---
## posexplode

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT id, pos, tag FROM users LATERAL VIEW posexplode(tags) t AS pos, tag
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| pos | INTEGER | t.pos |
| tag | VARCHAR(255) | t.tag |

---

# 型・関数

---

## ARRAY / MAP

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
```

```sql
SELECT array(1, 2, 3) AS nums, map('a', 1) AS m
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nums | array<integer> | expression |
| m | map<text, integer> | expression |

---
## 配列関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT size(tags) AS ts, array_contains(tags, 'vip') AS has_vip, transform(tags, x -> upper(x)) AS upper_tags FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ts | INTEGER | expression |
| has_vip | BOOLEAN | expression |
| upper_tags | array<text> | expression |

---
## MAP 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT element_at(attrs, 'key') AS v, map_keys(attrs) AS mk, map_values(attrs) AS mv FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | INTEGER | expression |
| mk | array<text> | expression |
| mv | array<integer> | expression |

---
## JSON 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT get_json_object(data, '$.name') AS n, from_json(data, 'name STRING') AS parsed, to_json(struct(id, name)) AS j FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | VARCHAR(255) | expression |
| parsed | struct<name text> | expression |
| j | VARCHAR(4000) | expression |

---
## STRUCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT struct(id, name) AS s, named_struct('id', id, 'name', name) AS ns FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | struct<id integer, name text> | expression |
| ns | struct<id integer, name text> | expression |

---
## 日時関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT
  date_format(created_at, 'yyyy-MM') AS ym,
  to_date(created_at) AS d,
  datediff(created_at, current_timestamp()) AS days,
  current_date() AS today
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ym | VARCHAR(255) | polyglot |
| d | DATE | expression |
| days | INTEGER | expression |
| today | DATE | polyglot |

---
## 文字列・ハッシュ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT
  nvl(name, 'x') AS n,
  if(age >= 20, 'adult', 'minor') AS cat,
  sha2(name, 256) AS h,
  regexp_extract(name, '[A-Z]+') AS m,
  split(name, ',') AS parts
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | VARCHAR(255) | expression |
| cat | VARCHAR(255) | expression |
| h | VARCHAR(255) | expression |
| m | VARCHAR(255) | expression |
| parts | array<text> | expression |

---
## xxhash64 / monotonically_increasing_id

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT xxhash64(name) AS h, monotonically_increasing_id() AS mid FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| h | INTEGER | expression |
| mid | INTEGER | expression |

---
## 型変換

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT try_cast(name AS integer) AS n, cast(amount AS double) AS a FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | INTEGER | polyglot |
| a | DECIMAL | polyglot |

---
## システム関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT version() AS v, current_catalog() AS cat, current_database() AS db, current_user() AS u FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | VARCHAR(255) | expression |
| cat | VARCHAR(255) | expression |
| db | VARCHAR(255) | expression |
| u | VARCHAR(255) | expression |

---

# Delta Lake タイムトラベル

[Delta Lake time travel](https://docs.databricks.com/aws/en/delta/history)

---

## VERSION AS OF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT id FROM users VERSION AS OF 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |

---
## TIMESTAMP AS OF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT id FROM users TIMESTAMP AS OF '2024-01-01'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |

---
## `@v1` 構文

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
```

```sql
SELECT id FROM users @v1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |

---

# テーブル関数

[Table-valued functions](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-functions-table)

---

## range

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
```

```sql
SELECT * FROM range(3)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| range | INTEGER | range.range |

---

# 副問い合わせ・集合演算

---

## VALUES 派生テーブル

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
```

```sql
SELECT * FROM (VALUES (1, 'a'), (2, 'b')) AS t(id, label)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | t.id |
| label | VARCHAR(255) | t.label |

---
## CTE（WITH）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| id | INTEGER | cte.id |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| id | INTEGER | cast |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| id | INTEGER | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| id | INTEGER | cast |

---

# メタデータ

[Databricks SQL SHOW](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-ddl-show)

---

## SHOW CATALOGS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
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
| Catalog | VARCHAR(255) | cast |

---
## SHOW SCHEMAS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
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
| Schema | VARCHAR(255) | cast |

---
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
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
| Table | VARCHAR(255) | cast |

---
## DESCRIBE DETAIL

Delta Lake テーブルのメタデータを返す Databricks 固有コマンドです。

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
```

```sql
DESCRIBE DETAIL users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| format | VARCHAR(255) | cast |
| id | VARCHAR(255) | cast |
| name | VARCHAR(255) | cast |
| description | VARCHAR(255) | cast |
| location | VARCHAR(255) | cast |
| createdAt | TIMESTAMP | cast |
| lastModified | TIMESTAMP | cast |
| partitionColumns | array<text> | cast |
| numFiles | INTEGER | cast |
| sizeInBytes | INTEGER | cast |
| properties | map<text, text> | cast |

---
## DESCRIBE HISTORY

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
```

```sql
DESCRIBE HISTORY users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| version | INTEGER | cast |
| timestamp | TIMESTAMP | cast |
| userId | VARCHAR(255) | cast |
| userName | VARCHAR(255) | cast |
| operation | VARCHAR(255) | cast |
| operationParameters | map<text, text> | cast |
| job | VARCHAR(255) | cast |
| notebook | VARCHAR(255) | cast |
| clusterId | VARCHAR(255) | cast |
| readVersion | INTEGER | cast |
| isolationLevel | VARCHAR(255) | cast |
| isBlindAppend | BOOLEAN | cast |
| operationMetrics | map<text, text> | cast |

---
## DESCRIBE CATALOG

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
```

```sql
DESCRIBE CATALOG main
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| info_name | VARCHAR(255) | cast |
| info_value | VARCHAR(255) | cast |

---
## DESCRIBE SCHEMA

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
```

```sql
DESCRIBE SCHEMA default
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| database_description_item | VARCHAR(255) | cast |
| database_description_value | VARCHAR(255) | cast |

---
## DESCRIBE TABLE EXTENDED

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
```

```sql
DESCRIBE TABLE EXTENDED users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| col_name | VARCHAR(255) | cast |
| data_type | VARCHAR(255) | cast |
| comment | VARCHAR(255) | cast |

---
## SHOW CREATE TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
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
| Table | VARCHAR(255) | cast |
| Create Table | VARCHAR(255) | cast |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
| QUERY PLAN | VARCHAR(255) | cast |

---
## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
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
| table_name | VARCHAR(255) | information_schema.tables.table_name |

---
## information_schema.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: databricks
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
| column_name | VARCHAR(255) | information_schema.columns.column_name |
| data_type | VARCHAR(255) | information_schema.columns.data_type |

---
