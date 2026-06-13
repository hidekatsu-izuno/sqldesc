# SingleStore テストケース

このドキュメントは [SingleStore 公式ドキュメント](https://docs.singlestore.com/db/v9.0/reference/sql-reference/data-manipulation-language-dml/select/) に基づき、`sqldesc` が SingleStore 方言（`--dialect singlestore`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/singlestore.md`）。

```yaml
doc: sqldesc-test/v1
dialect: singlestore
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、DISTINCT |
| JOIN | INNER JOIN、LEFT JOIN |
| 集約 | GROUP BY / HAVING、GROUP_CONCAT、AVG |
| ウィンドウ関数 | ROW_NUMBER / RANK / LAG / ウィンドウ集約、NTILE / dense_rank |
| 複合行ソース | VALUES、**VALUES ROW** |
| 型・関数 | json_extract_string、**json_extract_json**、JSON_EXTRACT / JSON_UNQUOTE、regexp_match、日時・条件関数、CAST、**CONVERT**、ハッシュ・文字列、CASE |
| 全文検索 | **MATCH ... AGAINST** |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、EXCEPT、UNION、INTERSECT |
| メタデータ | SHOW DATABASES / SCHEMAS / TABLES / COLUMNS / INDEXES / CREATE TABLE、**SHOW PIPELINES**、DESCRIBE、EXPLAIN、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [SingleStore SELECT](https://docs.singlestore.com/db/v9.0/reference/sql-reference/data-manipulation-language-dml/select/) |
| JSON | [JSON functions](https://docs.singlestore.com/db/v9.0/reference/sql-reference/json-functions/) |
| 全文検索 | [Full-text search](https://docs.singlestore.com/db/v9.0/reference/sql-reference/full-text-search/) |
| パイプライン | [SHOW PIPELINES](https://docs.singlestore.com/db/v9.0/reference/sql-reference/pipelines/show-pipelines/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: singlestore
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

---

# SELECT 基本

[SingleStore SELECT](https://docs.singlestore.com/db/v9.0/reference/sql-reference/data-manipulation-language-dml/select/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
dialect: singlestore
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
| data | json | users.data |
| created_at | timestamp | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
dialect: singlestore
```

```sql
SELECT id, name FROM users ORDER BY id DESC LIMIT 10 OFFSET 5
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

---
## DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT DISTINCT dept FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar(255) | users.dept |

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
dialect: singlestore
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
| id | int | users.id |
| amount | decimal | orders.amount |

---
## LEFT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT u.id, o.amount FROM users u LEFT JOIN orders o ON u.id = o.user_id
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
dialect: singlestore
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
| dept | varchar(255) | users.dept |
| cnt | bigint | expression |
| total | decimal | expression |

---
## GROUP_CONCAT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT dept, GROUP_CONCAT(name) AS gc FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar(255) | users.dept |
| gc | varchar(255) | expression |

---
## AVG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT dept, AVG(amount) AS avg_amt FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar(255) | users.dept |
| avg_amt | decimal(14,4) | expression |

---

# ウィンドウ関数

---

## ROW_NUMBER / RANK / LAG / ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT id, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY amount) AS rn, RANK() OVER (ORDER BY amount) AS rk, LAG(amount) OVER (ORDER BY id) AS prev, SUM(amount) OVER (PARTITION BY dept ORDER BY id) AS running FROM users
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
| rk | int | expression |
| prev | decimal | expression |
| running | decimal | polyglot |

---
## NTILE / dense_rank

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT id, NTILE(4) OVER (ORDER BY amount) AS q, dense_rank() OVER (ORDER BY amount) AS dr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| q | int | expression |
| dr | int | expression |

---

# 複合行ソース

---

## VALUES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
| id | int | t.id |
| name | varchar(255) | t.name |

---
## VALUES ROW

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT * FROM (VALUES ROW(1, 'a'), ROW(2, 'b')) AS t(id, name)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | t.id |
| name | varchar(255) | t.name |

---

# 型・関数

---

## json_extract_string

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT json_extract_string(data, '$.x') AS js FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| js | varchar(255) | expression |

---
## json_extract_json

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT json_extract_json(data, '$.x') AS j FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| j | json | expression |

---
## JSON_EXTRACT / JSON_UNQUOTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT JSON_EXTRACT(data, '$.x') AS je, JSON_UNQUOTE(JSON_EXTRACT(data, '$.x')) AS ju FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| je | json | expression |
| ju | varchar(255) | expression |

---
## regexp_match

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT regexp_match(name, '[A-Z]+') AS rm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rm | array<text> | expression |

---
## 日時・条件関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT DATE_ADD(created_at, INTERVAL 1 DAY) AS da, DATEDIFF(created_at, NOW()) AS dd, IFNULL(name, 'unknown') AS nm, IF(age > 30, 'senior', 'junior') AS tier FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| da | timestamp | expression |
| dd | int | expression |
| nm | varchar(255) | expression |
| tier | varchar(255) | expression |

---
## CAST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT CAST(amount AS DECIMAL(10,2)) AS ca FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ca | decimal(10,2) | polyglot |

---
## CONVERT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT CONVERT(amount, DECIMAL(10,2)) AS ca FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ca | decimal(10,2) | expression |

---
## ハッシュ・文字列

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT SHA2(name, 256) AS s, MD5(name) AS m, CONCAT(name, ' (', dept, ')') AS cn FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | varchar(255) | expression |
| m | varchar(255) | expression |
| cn | varchar(255) | polyglot |

---
## NOW / CURDATE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT NOW() AS n, CURDATE() AS cd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | timestamp | polyglot |
| cd | date | expression |

---
## CASE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT id, CASE WHEN age >= 30 THEN 'senior' ELSE 'junior' END AS tier FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| tier | varchar(255) | expression |

---

# 全文検索

[SingleStore Full-text search](https://docs.singlestore.com/db/v9.0/reference/sql-reference/full-text-search/)

---

## MATCH ... AGAINST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT MATCH(name) AGAINST('search') AS sc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sc | decimal | expression |

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
dialect: singlestore
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
| id | int | cte.id |
| name | varchar(255) | cte.name |

---
## 相関副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT id, (SELECT MAX(amount) FROM orders o WHERE o.user_id = u.id) AS max_order FROM users u
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| max_order | decimal | expression |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT id FROM users EXCEPT SELECT user_id AS id FROM orders
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
dialect: singlestore
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
| id | int | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
| id | int | cast |

---

# メタデータ

---

## SHOW DATABASES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
## SHOW SCHEMAS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
| Schema | varchar(255) | cast |

---
## SHOW TABLES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
## SHOW INDEXES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SHOW INDEXES FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | varchar(255) | cast |
| Non_unique | int | cast |
| Key_name | varchar(255) | cast |
| Seq_in_index | int | cast |
| Column_name | varchar(255) | cast |
| Collation | varchar(255) | cast |
| Cardinality | int | cast |
| Sub_part | int | cast |
| Packed | varchar(255) | cast |
| Null | varchar(255) | cast |
| Index_type | varchar(255) | cast |
| Comment | varchar(255) | cast |
| Index_comment | varchar(255) | cast |

---
## SHOW CREATE TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
## SHOW PIPELINES

[SingleStore SHOW PIPELINES](https://docs.singlestore.com/db/v9.0/reference/sql-reference/pipelines/show-pipelines/)

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SHOW PIPELINES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Database | varchar(255) | cast |
| Pipeline | varchar(255) | cast |
| State | varchar(255) | cast |
| Source_Type | varchar(255) | cast |
| Config_JSON | varchar(255) | cast |

---
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
| id | int | users.id |
| name | varchar(255) | users.name |
| age | int | users.age |
| dept | varchar(255) | users.dept |
| amount | decimal | users.amount |
| data | json | users.data |
| created_at | timestamp | users.created_at |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
```

```sql
SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema = 'db'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | varchar(255) | information_schema.tables.table_name |
| table_schema | varchar(255) | information_schema.tables.table_schema |

---
## information_schema.columns

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
| column_name | varchar(255) | information_schema.columns.column_name |
| data_type | varchar(255) | information_schema.columns.data_type |

---
