# Solr SQL テストケース

このドキュメントは [Solr SQL 公式ドキュメント](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html) に基づき、`sqldesc` が Solr SQL 方言（`--dialect solr`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/solr.md`）。

```yaml
doc: sqldesc-test/v1
dialect: solr
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、**`*` + LIMIT**、FROM 句なし、ORDER BY / LIMIT / OFFSET、DISTINCT |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、COUNT / SUM / AVG |
| ウィンドウ関数 | ROW_NUMBER / RANK / LAG / ウィンドウ集約、NTILE |
| Solr 固有 | **動的フィールド接尾辞**（`_s` / `_f` / `_dt` / `_ss`）、**score**、**highlight** / **snippet** |
| 型・関数 | CASE、COALESCE / CONCAT、CAST、regexp_replace、hash |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、UNION、EXCEPT、INTERSECT、VALUES |
| メタデータ | SHOW TABLES / SCHEMAS / COLUMNS、DESCRIBE、EXPLAIN |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Solr SQL SELECT](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html) |
| 集約 | [Aggregations](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html#aggregations) |
| JOIN | [Joins](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html#joins) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: solr
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  created_at TIMESTAMP
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

## Prepare-2: SolrCloud SQL 実測スキーマ

Solr の動的フィールド命名（`_s` / `_f` / `_dt` / `_ss`）と検索スコア列 `score` を含むスキーマです。

```yaml
kind: schema-ddl
dialect: solr
```

```sql
CREATE TABLE users (
  id STRING,
  name_s STRING,
  amount_f FLOAT,
  created_at_dt TIMESTAMP,
  tags_ss array<text>,
  score FLOAT
);
```

---

# SELECT 基本

[Solr SQL SELECT](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
dialect: solr
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

---
## `*` + LIMIT

Solr では `SELECT *` は `LIMIT` 付きクエリで stored フィールドと `score` を返せます。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT * FROM users LIMIT 10
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

---
## FROM 句なし

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
dialect: solr
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
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |

---
## DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
| dept | VARCHAR(255) | users.dept |

---

# JOIN

[Solr SQL Joins](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html#joins)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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

[Solr SQL Aggregations](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html#aggregations)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
## AVG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
| dept | VARCHAR(255) | users.dept |
| avg_amt | DECIMAL | expression |

---
## SolrCloud 集約

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: solr
```

```sql
SELECT COUNT(*) AS total FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| total | INTEGER | expression |

---

# ウィンドウ関数

---

## ROW_NUMBER / RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY amount) AS rn, RANK() OVER (ORDER BY amount) AS rk FROM users
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
| rk | INTEGER | expression |

---
## LAG / ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, LAG(amount) OVER (ORDER BY id) AS prev, SUM(amount) OVER (PARTITION BY dept ORDER BY id) AS running FROM users
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
| running | DECIMAL | polyglot |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, NTILE(4) OVER (ORDER BY amount) AS q FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| q | INTEGER | expression |

---

# Solr 固有

---

## 動的フィールド接尾辞（SolrCloud SQL handler 実測列）

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, name_s, amount_f, created_at_dt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | VARCHAR(255) | users.id |
| name_s | VARCHAR(255) | users.name_s |
| amount_f | DECIMAL | users.amount_f |
| created_at_dt | TIMESTAMP | users.created_at_dt |

---
## 多値フィールド `_ss`

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, tags_ss FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | VARCHAR(255) | users.id |
| tags_ss | array<text> | users.tags_ss |

---
## score

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, score FROM users LIMIT 10
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | VARCHAR(255) | users.id |
| score | DECIMAL | users.score |

---
## highlight / snippet

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT highlight(name) AS hl, snippet(name) AS sn FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| hl | VARCHAR(255) | expression |
| sn | VARCHAR(255) | expression |

---

# 型・関数

---

## CASE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
| id | INTEGER | users.id |
| tier | VARCHAR(255) | expression |

---
## COALESCE / CONCAT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT COALESCE(name, 'unknown') AS nm, CONCAT(name, ' (', dept, ')') AS cn FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nm | VARCHAR(255) | expression |
| cn | VARCHAR(255) | polyglot |

---
## CAST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
## regexp_replace

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT regexp_replace(name, 'a', 'b') AS rr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rr | VARCHAR(255) | expression |

---
## hash

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT hash(name) AS h FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| h | INTEGER | expression |

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
dialect: solr
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
dialect: solr
```

```sql
SELECT id, (SELECT MAX(amount) FROM users u2 WHERE u2.dept = u.dept) AS max_amt FROM users u
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| max_amt | DECIMAL | expression |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
| id | INTEGER | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
## VALUES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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

# メタデータ

---

## SHOW TABLES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
## SHOW COLUMNS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
