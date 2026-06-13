# Amazon Redshift テストケース

このドキュメントは [Amazon Redshift 公式ドキュメント](https://docs.aws.amazon.com/redshift/latest/dg/r_SELECT_synopsis.html) に基づき、`sqldesc` が Amazon Redshift 方言（`--dialect redshift`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/redshift.md`）。

```yaml
doc: sqldesc-test/v1
dialect: redshift
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / OFFSET / LIMIT、DISTINCT ON |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、**LISTAGG**、MEDIAN / percentile_cont |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG / LEAD、NTILE、dense_rank / percent_rank / cume_dist、ウィンドウ集約 |
| 複合行ソース | VALUES |
| **PIVOT** | **PIVOT** |
| 型・関数 | 日時（DATEADD / GETDATE）、NVL / COALESCE / CASE、TO_CHAR / SPLIT_PART / REGEXP_SUBSTR / SIMILAR TO |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、EXCEPT、UNION、INTERSECT |
| **システムビュー** | **pg_catalog.svv_tables**、**svv_columns**、**stl_query** |
| メタデータ | SHOW TABLES / SCHEMAS / DATABASES、DESCRIBE、EXPLAIN、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Amazon Redshift SELECT](https://docs.aws.amazon.com/redshift/latest/dg/r_SELECT_synopsis.html) |
| ウィンドウ関数 | [Window functions](https://docs.aws.amazon.com/redshift/latest/dg/c_Window_functions.html) |
| LISTAGG | [LISTAGG function](https://docs.aws.amazon.com/redshift/latest/dg/r_LISTAGG.html) |
| システムビュー | [SVV tables](https://docs.aws.amazon.com/redshift/latest/dg/r_SVV_TABLES.html)、[STL_QUERY](https://docs.aws.amazon.com/redshift/latest/dg/r_STL_QUERY.html) |
| PIVOT | [PIVOT and UNPIVOT](https://docs.aws.amazon.com/redshift/latest/dg/r_UNPIVOT.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: redshift
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  data JSON,
  created_at TIMESTAMP
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

## Prepare-2: STL システムテーブル

`stl_query` はクエリログ用のシステムテーブルです。列定義をスキーマに含めて照会します。

```yaml
kind: schema-ddl
dialect: redshift
```

```sql
CREATE TABLE stl_query (
  query TEXT,
  userid INTEGER
);
```

---

# SELECT 基本

[Amazon Redshift SELECT](https://docs.aws.amazon.com/redshift/latest/dg/r_SELECT_synopsis.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
| name | text | users.name |
| amount | numeric | users.amount |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
| name | text | users.name |
| age | integer | users.age |
| dept | text | users.dept |
| amount | numeric | users.amount |
| data | json | users.data |
| created_at | timestamp without time zone | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: redshift
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
| label | text | literal |
| ok | boolean | expression |

---
## ORDER BY / OFFSET / LIMIT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
## DISTINCT ON

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
| id | integer | users.id |
| name | text | users.name |

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
dialect: redshift
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
| amount | numeric | orders.amount |

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
dialect: redshift
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
| dept | text | users.dept |
| cnt | integer | expression |
| total | numeric | expression |

---
## LISTAGG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
```

```sql
SELECT dept, LISTAGG(name, ',') WITHIN GROUP (ORDER BY id) AS la FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| la | integer | expression |

---
## MEDIAN / percentile_cont

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
```

```sql
SELECT MEDIAN(amount) AS med, percentile_cont(0.5) WITHIN GROUP (ORDER BY amount) AS pc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| med | numeric | expression |
| pc | numeric | expression |

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
dialect: redshift
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
dialect: redshift
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
## LAG / LEAD

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
```

```sql
SELECT id, LAG(amount, 1) OVER (ORDER BY id) AS prev, LEAD(amount, 1) OVER (ORDER BY id) AS nxt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| prev | numeric | expression |
| nxt | numeric | expression |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
## dense_rank / percent_rank / cume_dist

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
```

```sql
SELECT id, dense_rank() OVER (ORDER BY amount) AS dr, percent_rank() OVER (ORDER BY amount) AS pr, cume_dist() OVER (ORDER BY amount) AS cd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| dr | integer | expression |
| pr | numeric | expression |
| cd | numeric | expression |

---
## ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
| running | numeric | polyglot |

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
dialect: redshift
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
| name | text | t.name |

---

# PIVOT

---

## PIVOT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
```

```sql
SELECT * FROM users PIVOT (SUM(amount) FOR dept IN ('sales', 'eng'))
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| name | text | users.name |
| age | integer | users.age |
| data | json | users.data |
| created_at | timestamp without time zone | users.created_at |
| sales | numeric | users.sales |
| eng | numeric | users.eng |

---

# 型・関数

---

## 日時関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
```

```sql
SELECT DATEADD(day, 7, created_at) AS da, DATEDIFF(day, created_at, GETDATE()) AS dd, GETDATE() AS gd, SYSDATE AS sd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| da | timestamp without time zone | expression |
| dd | integer | expression |
| gd | timestamp without time zone | expression |
| sd | timestamp without time zone | expression |

---
## NVL / COALESCE / CASE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
```

```sql
SELECT NVL(amount, 0) AS na, COALESCE(name, 'unknown') AS cn, CASE WHEN age > 30 THEN 'senior' ELSE 'junior' END AS tier FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| na | numeric | expression |
| cn | text | expression |
| tier | text | expression |

---
## TO_CHAR / SPLIT_PART / REGEXP_SUBSTR / SIMILAR TO

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
```

```sql
SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS tc, SPLIT_PART(name, ' ', 1) AS sp, REGEXP_SUBSTR(name, '[A-Z]+') AS rs, name SIMILAR TO 'A%' AS sm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tc | text | expression |
| sp | text | expression |
| rs | text | expression |
| sm | boolean | expression |

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
dialect: redshift
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
| name | text | cte.name |

---
## 相関副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
| name | text | users.name |
| max_order | numeric | expression |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
dialect: redshift
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
dialect: redshift
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

# システムビュー

---

## pg_catalog.svv_tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: redshift
```

```sql
SELECT database_name, schema_name, table_name, tablename FROM pg_catalog.svv_tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| database_name | text | pg_catalog.svv_tables.database_name |
| schema_name | text | pg_catalog.svv_tables.schema_name |
| table_name | text | pg_catalog.svv_tables.table_name |
| tablename | text | pg_catalog.svv_tables.tablename |

---
## svv_columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: redshift
```

```sql
SELECT column_name, data_type FROM svv_columns WHERE table_name = 'users'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_name | text | svv_columns.column_name |
| data_type | text | svv_columns.data_type |

---
## stl_query

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: redshift
```

```sql
SELECT query, userid FROM stl_query LIMIT 10
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| query | text | stl_query.query |
| userid | integer | stl_query.userid |

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
dialect: redshift
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
| Table | text | cast |

---
## SHOW SCHEMAS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: redshift
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
| Schema | text | cast |

---
## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: redshift
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
| Database | text | cast |

---
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
| name | text | users.name |
| age | integer | users.age |
| dept | text | users.dept |
| amount | numeric | users.amount |
| data | json | users.data |
| created_at | timestamp without time zone | users.created_at |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
| QUERY PLAN | text | cast |

---
## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: redshift
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
| table_name | text | information_schema.tables.table_name |

---
