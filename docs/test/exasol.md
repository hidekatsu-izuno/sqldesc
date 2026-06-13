# Exasol テストケース

このドキュメントは [Exasol 公式ドキュメント](https://docs.exasol.com/db/latest/sql/select.htm) に基づき、`sqldesc` が Exasol 方言（`--dialect exasol`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/exasol.md`）。

```yaml
doc: sqldesc-test/v1
dialect: exasol
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / OFFSET / LIMIT |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、**GROUP_CONCAT**、**LISTAGG**、median / percentile_cont、approx_count_distinct、bit_and / bit_or |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、NTILE、dense_rank / percent_rank、FIRST_VALUE、ウィンドウ集約、GROUP_CONCAT OVER |
| 階層・ピボット | **CONNECT BY**、**PIVOT** |
| 複合行ソース | VALUES、CROSS JOIN UNNEST |
| 型・関数 | ARRAY、JSON、日時・文字列、地理空間、hll_hash / to_bitmap |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、EXCEPT、UNION、INTERSECT |
| システムテーブル | **exa_all_tables**、**exa_all_columns**、**dual**、has_feature |
| メタデータ | SHOW TABLES / SCHEMAS、DESCRIBE、DESCRIBE FUNCTION、EXPLAIN |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Exasol SELECT](https://docs.exasol.com/db/latest/sql/select.htm) |
| GROUP_CONCAT | [GROUP_CONCAT](https://docs.exasol.com/db/latest/sql_references/functions/alphabeticallistfunctions/group_concat.htm) |
| LISTAGG | [LISTAGG](https://docs.exasol.com/db/latest/sql_references/functions/alphabeticallistfunctions/listagg.htm) |
| システムテーブル | [EXA_ALL_TABLES](https://docs.exasol.com/db/latest/sql_references/system_tables/metadata/exa_all_tables.htm)、[EXA_ALL_COLUMNS](https://docs.exasol.com/db/latest/sql_references/system_tables/metadata/exa_all_columns.htm) |
| IMPORT | [IMPORT](https://docs.exasol.com/db/latest/sql/import.htm) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: exasol
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  manager_id INTEGER,
  data VARCHAR(4000),
  tags array<varchar>,
  created_at TIMESTAMP
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

## Prepare-2: システムテーブル・dual

Exasol のメタデータ照会（`EXA_ALL_*`）と `dual` テーブル用の列定義です。

```yaml
kind: schema-ddl
dialect: exasol
```

```sql
CREATE TABLE exa_all_tables (
  table_schema TEXT,
  table_name TEXT,
  table_owner TEXT,
  table_object_id INTEGER,
  table_is_virtual BOOLEAN,
  table_has_distribution_key BOOLEAN,
  table_has_partition_key BOOLEAN,
  table_row_count BIGINT,
  delete_percentage DECIMAL,
  table_comment TEXT
);

CREATE TABLE exa_all_columns (
  column_schema TEXT,
  column_table TEXT,
  column_name TEXT,
  column_ordinal_position INTEGER,
  column_default TEXT,
  column_is_nullable BOOLEAN,
  column_type TEXT,
  column_maxsize INTEGER,
  column_num_prec INTEGER,
  column_num_scale INTEGER,
  column_comment TEXT
);

CREATE TABLE dual (
  dummy VARCHAR(1)
);
```

---

# SELECT 基本

[Exasol SELECT](https://docs.exasol.com/db/latest/sql/select.htm)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
dialect: exasol
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
| manager_id | INTEGER | users.manager_id |
| data | varchar(4000) | users.data |
| tags | array<text> | users.tags |
| created_at | TIMESTAMP | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: exasol
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
## ORDER BY / OFFSET / LIMIT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
dialect: exasol
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
dialect: exasol
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
| dept | VARCHAR(255) | users.dept |
| cnt | INTEGER | expression |
| total | DECIMAL | expression |

---
## GROUP_CONCAT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT dept, GROUP_CONCAT(name ORDER BY id SEPARATOR ', ') AS gc FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| gc | VARCHAR(255) | expression |

---
## LISTAGG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT dept, LISTAGG(name, ', ') WITHIN GROUP (ORDER BY id) AS la FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| la | INTEGER | expression |

---
## median / percentile_cont

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT median(amount) AS med, stddev_pop(amount) AS sd, percentile_cont(0.5) WITHIN GROUP (ORDER BY amount) AS pc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| med | DECIMAL | expression |
| sd | DECIMAL | expression |
| pc | DECIMAL | expression |

---
## approx_count_distinct / bit_and / bit_or

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT approx_count_distinct(name) AS acd, bit_and(age) AS ba, bit_or(age) AS bo FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| acd | INTEGER | expression |
| ba | INTEGER | expression |
| bo | INTEGER | expression |

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
dialect: exasol
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
dialect: exasol
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
| id | INTEGER | users.id |
| rk | INTEGER | expression |

---
## LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
| id | INTEGER | users.id |
| prev | DECIMAL | expression |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
| id | INTEGER | users.id |
| quartile | INTEGER | expression |

---
## dense_rank / percent_rank

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT id, dense_rank() OVER (ORDER BY amount) AS dr, percent_rank() OVER (ORDER BY amount) AS pr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| dr | INTEGER | expression |
| pr | DECIMAL | expression |

---
## FIRST_VALUE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT id, FIRST_VALUE(name) OVER (PARTITION BY dept ORDER BY id) AS fv FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| fv | VARCHAR(255) | expression |

---
## ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
| id | INTEGER | users.id |
| running | DECIMAL | polyglot |

---
## GROUP_CONCAT OVER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT id, GROUP_CONCAT(name ORDER BY id SEPARATOR ',') OVER (PARTITION BY dept) AS gc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| gc | VARCHAR(255) | polyglot |

---

# 階層・ピボット

---

## CONNECT BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT id, name FROM users CONNECT BY PRIOR id = manager_id START WITH manager_id IS NULL
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
## PIVOT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |
| age | INTEGER | users.age |
| manager_id | INTEGER | users.manager_id |
| data | varchar(4000) | users.data |
| tags | array<text> | users.tags |
| created_at | TIMESTAMP | users.created_at |
| sales | DECIMAL | users.sales |
| eng | DECIMAL | users.eng |

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
dialect: exasol
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
| id | INTEGER | t.id |
| name | VARCHAR(255) | t.name |

---
## CROSS JOIN UNNEST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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

# 型・関数

---

## ARRAY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT tags, cardinality(tags) AS cnt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tags | array<text> | users.tags |
| cnt | INTEGER | expression |

---
## JSON

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT json_value(data, '$.x') AS jv, json_extract(data, '$.y') AS je FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jv | VARCHAR(255) | expression |
| je | VARCHAR(4000) | expression |

---
## 日時・文字列

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT to_char(created_at, 'YYYY-MM-DD') AS tc, trunc(created_at, 'MM') AS tr, regexp_substr(name, '[A-Z]+') AS rs, instr(name, 'a') AS ins FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tc | VARCHAR(255) | expression |
| tr | TIMESTAMP | expression |
| rs | VARCHAR(255) | expression |
| ins | INTEGER | expression |

---
## 地理空間

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT st_distance(st_point(0, 0), st_point(1, 1)) AS sd, st_x(st_point(1, 2)) AS sx FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sd | DECIMAL | expression |
| sx | DECIMAL | expression |

---
## hll_hash / to_bitmap

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT hll_hash(name) AS hh, to_bitmap(id) AS tb FROM users
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

---
## current_date / current_timestamp

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
```

```sql
SELECT current_date AS cd, current_timestamp AS ct FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cd | DATE | polyglot |
| ct | TIMESTAMP | expression |

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
dialect: exasol
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
| id | INTEGER | cte.id |
| name | VARCHAR(255) | cte.name |

---
## 相関副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
| name | VARCHAR(255) | users.name |
| max_order | DECIMAL | expression |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
| id | INTEGER | cast |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
| id | INTEGER | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
| id | INTEGER | cast |

---

# システムテーブル

---

## exa_all_tables

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: exasol
```

```sql
SELECT * FROM exa_all_tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_schema | VARCHAR(255) | exa_all_tables.table_schema |
| table_name | VARCHAR(255) | exa_all_tables.table_name |
| table_owner | VARCHAR(255) | exa_all_tables.table_owner |
| table_object_id | INTEGER | exa_all_tables.table_object_id |
| table_is_virtual | BOOLEAN | exa_all_tables.table_is_virtual |
| table_has_distribution_key | BOOLEAN | exa_all_tables.table_has_distribution_key |
| table_has_partition_key | BOOLEAN | exa_all_tables.table_has_partition_key |
| table_row_count | BIGINT | exa_all_tables.table_row_count |
| delete_percentage | DECIMAL | exa_all_tables.delete_percentage |
| table_comment | VARCHAR(255) | exa_all_tables.table_comment |

---
## exa_all_columns

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: exasol
```

```sql
SELECT * FROM exa_all_columns
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_schema | VARCHAR(255) | exa_all_columns.column_schema |
| column_table | VARCHAR(255) | exa_all_columns.column_table |
| column_name | VARCHAR(255) | exa_all_columns.column_name |
| column_ordinal_position | INTEGER | exa_all_columns.column_ordinal_position |
| column_default | VARCHAR(255) | exa_all_columns.column_default |
| column_is_nullable | BOOLEAN | exa_all_columns.column_is_nullable |
| column_type | VARCHAR(255) | exa_all_columns.column_type |
| column_maxsize | INTEGER | exa_all_columns.column_maxsize |
| column_num_prec | INTEGER | exa_all_columns.column_num_prec |
| column_num_scale | INTEGER | exa_all_columns.column_num_scale |
| column_comment | VARCHAR(255) | exa_all_columns.column_comment |

---
## dual

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: exasol
```

```sql
SELECT * FROM dual
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dummy | varchar(1) | dual.dummy |

---
## has_feature

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: exasol
```

```sql
SELECT has_feature('GROUP_CONCAT') AS hf FROM dual
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| hf | VARCHAR(255) | polyglot |

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
dialect: exasol
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
## SHOW SCHEMAS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: exasol
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
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
| manager_id | INTEGER | users.manager_id |
| data | varchar(4000) | users.data |
| tags | array<text> | users.tags |
| created_at | TIMESTAMP | users.created_at |

---
## DESCRIBE FUNCTION

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: exasol
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
| Name | VARCHAR(255) | cast |
| Description | VARCHAR(255) | cast |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
