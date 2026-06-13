# Apache DataFusion テストケース

このドキュメントは [Apache DataFusion 公式ドキュメント](https://datafusion.apache.org/user-guide/sql/select.html) に基づき、`sqldesc` が Apache DataFusion 方言（`--dialect datafusion`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/datafusion.md`）。

```yaml
doc: sqldesc-test/v1
dialect: datafusion
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、WHERE / ORDER / LIMIT / OFFSET、DISTINCT ON、TABLESAMPLE |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句、array_agg / string_agg、approx_distinct、percentile_cont |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、NTILE / cume_dist |
| 複合行ソース | VALUES、UNNEST、CROSS JOIN UNNEST、generate_series |
| 配列・STRUCT | 配列リテラル、配列関数、list_distinct、STRUCT |
| 関数 | 日時、文字列・正規表現、型変換、システム関数 |
| テーブル関数 | read_parquet、read_csv |
| 副問い合わせ・集合演算 | CTE（WITH）、EXCEPT、UNION、INTERSECT |
| メタデータ | EXPLAIN、SHOW TABLES / COLUMNS / DATABASES / FUNCTIONS / CREATE TABLE、DESCRIBE、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Apache DataFusion SELECT](https://datafusion.apache.org/user-guide/sql/select.html) |
| 配列 | [Array functions](https://datafusion.apache.org/user-guide/sql/scalar_functions.html#array-functions) |
| Information schema | [Apache DataFusion Information Schema](https://datafusion.apache.org/user-guide/sql/information_schema.html) |
| テーブル関数 | [Table functions](https://datafusion.apache.org/user-guide/sql/scalar_functions.html#table-functions) |
| CLI | [Apache DataFusion CLI Usage](https://datafusion.apache.org/user-guide/cli/usage.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: datafusion
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

[Apache DataFusion SELECT](https://datafusion.apache.org/user-guide/sql/select.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
dialect: datafusion
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

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
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
## WHERE / ORDER / LIMIT / OFFSET

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT id, name FROM users WHERE amount > 0 ORDER BY name LIMIT 10 OFFSET 5
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

---
## DISTINCT ON

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT DISTINCT ON (dept) id, name FROM users ORDER BY dept, id
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

---
## TABLESAMPLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT id FROM users TABLESAMPLE BERNOULLI(10)
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

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
dialect: datafusion
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
## array_agg / string_agg

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT array_agg(dept) AS depts, string_agg(name, ',') AS names FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| depts | array<text> | expression |
| names | VARCHAR(255) | expression |

---
## approx_distinct

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT approx_distinct(dept) AS ad FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ad | INTEGER | expression |

---
## percentile_cont

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY amount) AS p50 FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| p50 | DECIMAL | expression |

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
dialect: datafusion
```

```sql
SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn FROM users
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
dialect: datafusion
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
## LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
| prev | VARCHAR(255) | expression |

---
## NTILE / cume_dist

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
| q | INTEGER | expression |
| cd | DECIMAL | expression |

---

# 複合行ソース

---

## VALUES 派生表

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT * FROM (VALUES (1, 'a'), (2, 'b')) AS v(id, name)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | v.id |
| name | VARCHAR(255) | v.name |

---
## UNNEST

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT x FROM UNNEST(ARRAY[1, 2]) AS t(x)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| x | INTEGER | t.x |

---
## CROSS JOIN UNNEST

配列列を行に展開する典型的なパターンです。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
| id | INTEGER | users.id |
| tag | VARCHAR(255) | t.tag |

---
## generate_series

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT * FROM generate_series(1, 3) AS t(x)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| x | INTEGER | t.x |

---

# 配列・STRUCT

[Array functions](https://datafusion.apache.org/user-guide/sql/scalar_functions.html#array-functions)

---

## 配列リテラル・添字アクセス

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT ARRAY[1, 2, 3] AS nums, cardinality(tags) AS tc, tags[1] AS first_tag FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nums | array<integer> | expression |
| tc | INTEGER | expression |
| first_tag | VARCHAR(255) | users.tags |

---
## 配列関数

DataFusion には豊富な配列操作関数があります。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT
  array_append(tags, 'new') AS ta,
  array_concat(tags, tags) AS tc,
  array_sort(tags) AS sorted,
  array_to_string(tags, ',') AS joined
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ta | array<text> | expression |
| tc | array<text> | expression |
| sorted | array<text> | expression |
| joined | VARCHAR(255) | expression |

---
## list_distinct

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT list_distinct(tags) AS ld FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ld | array<text> | expression |

---
## STRUCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT struct(id, name) AS s FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | struct<id integer, name text> | expression |

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
dialect: datafusion
```

```sql
SELECT
  to_char(created_at, 'YYYY-MM') AS ym,
  date_trunc('month', created_at) AS m,
  extract(year FROM created_at) AS y,
  date_bin(interval '1 month', created_at, timestamp '2001-01-01') AS b
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ym | VARCHAR(255) | expression |
| m | TIMESTAMP | expression |
| y | INTEGER | expression |
| b | TIMESTAMP | expression |

---
## 文字列・正規表現

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT
  coalesce(name, 'x') AS n,
  regexp_match(name, '[A-Z]+') AS m,
  split_part(name, '-', 1) AS part,
  md5(name) AS h
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
| m | array<text> | expression |
| part | VARCHAR(255) | expression |
| h | VARCHAR(255) | expression |

---
## 型変換

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
dialect: datafusion
```

```sql
SELECT version() AS v, gen_random_uuid() AS u, current_date AS today FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | VARCHAR(255) | expression |
| u | VARCHAR(36) | expression |
| today | DATE | polyglot |

---

# テーブル関数

[Table functions](https://datafusion.apache.org/user-guide/sql/scalar_functions.html#table-functions)

DataFusion では Parquet / CSV などのファイルを直接読み込むテーブル関数が特徴的です。

---

## read_parquet

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT * FROM read_parquet('data.parquet')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| read_parquet | unknown | read_parquet.read_parquet |

---
## read_csv

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT * FROM read_csv('data.csv')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| read_csv | unknown | read_csv.read_csv |

---

# 副問い合わせ・集合演算

---

## CTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
WITH recent AS (SELECT id, name FROM users) SELECT name FROM recent
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | recent.name |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
dialect: datafusion
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
dialect: datafusion
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

[Apache DataFusion Information Schema](https://datafusion.apache.org/user-guide/sql/information_schema.html)

---

## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
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
## SHOW COLUMNS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
| Field | VARCHAR(255) | cast |
| Type | VARCHAR(255) | cast |
| Null | VARCHAR(255) | cast |
| Key | VARCHAR(255) | cast |
| Default | VARCHAR(255) | cast |
| Extra | VARCHAR(255) | cast |

---
## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
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
| Database | VARCHAR(255) | cast |

---
## SHOW FUNCTIONS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
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
| Function | VARCHAR(255) | cast |
| Type | VARCHAR(255) | cast |
| Definer | VARCHAR(255) | cast |
| Modified | TIMESTAMP | cast |
| Created | TIMESTAMP | cast |
| Security_type | VARCHAR(255) | cast |
| Comment | VARCHAR(255) | cast |

---
## SHOW CREATE TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
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
## DESCRIBE table

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |
| age | INTEGER | users.age |
| dept | VARCHAR(255) | users.dept |
| amount | DECIMAL | users.amount |
| created_at | TIMESTAMP | users.created_at |
| data | VARCHAR(255) | users.data |
| tags | array<text> | users.tags |

---

## information_schema.tables Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT table_catalog, table_schema, table_name, table_type FROM information_schema.tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_catalog | VARCHAR(255) | information_schema.tables.table_catalog |
| table_schema | VARCHAR(255) | information_schema.tables.table_schema |
| table_name | VARCHAR(255) | information_schema.tables.table_name |
| table_type | VARCHAR(255) | information_schema.tables.table_type |

---
## information_schema.columns Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT table_name, column_name, ordinal_position, data_type, is_nullable FROM information_schema.columns
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | VARCHAR(255) | information_schema.columns.table_name |
| column_name | VARCHAR(255) | information_schema.columns.column_name |
| ordinal_position | BIGINT | information_schema.columns.ordinal_position |
| data_type | VARCHAR(255) | information_schema.columns.data_type |
| is_nullable | VARCHAR(255) | information_schema.columns.is_nullable |

---
## information_schema.views Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT table_name, definition FROM information_schema.views
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | VARCHAR(255) | information_schema.views.table_name |
| definition | VARCHAR(255) | information_schema.views.definition |

---
## information_schema.df_settings Docker 実測列

DataFusion 固有の設定カタログです。

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT name, value, description FROM information_schema.df_settings
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | information_schema.df_settings.name |
| value | VARCHAR(255) | information_schema.df_settings.value |
| description | VARCHAR(255) | information_schema.df_settings.description |

---
## information_schema.routines

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT routine_name FROM information_schema.routines
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| routine_name | VARCHAR(255) | information_schema.routines.routine_name |

---
## information_schema.schemata

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
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
| schema_name | VARCHAR(255) | information_schema.schemata.schema_name |

---
