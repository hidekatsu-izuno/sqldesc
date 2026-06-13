# Tableau SQL テストケース

このドキュメントは [Tableau SQL 公式ドキュメント](https://help.tableau.com/current/pro/desktop/en-us/customsql.htm) に基づき、`sqldesc` が Tableau SQL 方言（`--dialect tableau`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/tableau.md`）。

```yaml
doc: sqldesc-test/v1
dialect: tableau
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、**TOP**、DISTINCT |
| JOIN | INNER JOIN、修飾 `u.*`、非修飾 `*` の JOIN 展開 |
| 集約 | GROUP BY / HAVING、集約関数、**ROLLUP**、**STRING_AGG** WITHIN GROUP、近似集約 |
| ウィンドウ関数 | ROW_NUMBER / RANK / LAG、NTILE / dense_rank / ウィンドウ集約 |
| 日時 | **DATEADD** / **DATEDIFF**、DATE_TRUNC、EXTRACT、YEAR / MONTH / DAY、CURRENT_*、日付リテラル |
| 型・関数 | IFF / COALESCE / CASE、文字列関数、CAST、NULLIF / GREATEST、数値関数 |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、IN 副問い合わせ、UNION、EXCEPT、INTERSECT、VALUES |
| メタデータ | SHOW TABLES、DESCRIBE、EXPLAIN |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Tableau SQL SELECT](https://help.tableau.com/current/pro/desktop/en-us/customsql.htm) |
| 日付関数 | [Date Functions](https://help.tableau.com/current/pro/desktop/en-us/functions_functions_date.htm) |
| 文字列関数 | [String Functions](https://help.tableau.com/current/pro/desktop/en-us/functions_functions_string.htm) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: tableau
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

---

# SELECT 基本

[Tableau SQL SELECT](https://help.tableau.com/current/pro/desktop/en-us/customsql.htm)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
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
dialect: tableau
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
## FROM 句なし

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
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
dialect: tableau
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
## TOP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT TOP 10 id, name FROM users ORDER BY id
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
dialect: tableau
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

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
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
## 修飾 `u.*` と JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT u.*, o.amount FROM users u JOIN orders o ON u.id = o.user_id
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
| amount | DECIMAL | orders.amount |

---
## 非修飾 `*` の JOIN 展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT * FROM users u JOIN orders o ON u.id = o.user_id
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
| id | INTEGER | orders.id |
| user_id | INTEGER | orders.user_id |
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
dialect: tableau
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
## 集約関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT COUNT(DISTINCT dept) AS cd, AVG(amount) AS av, MIN(age) AS mi, MAX(age) AS mx FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cd | INTEGER | expression |
| av | DECIMAL | expression |
| mi | INTEGER | expression |
| mx | INTEGER | expression |

---
## ROLLUP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT dept, COUNT(*) AS cnt FROM users GROUP BY ROLLUP(dept)
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

---
## STRING_AGG WITHIN GROUP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT STRING_AGG(name, ',') WITHIN GROUP (ORDER BY id) AS sa FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sa | VARCHAR(255) | expression |

---
## approx_count_distinct / percentile_cont

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT approx_count_distinct(age) AS acd, percentile_cont(0.5) WITHIN GROUP (ORDER BY amount) AS pc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| acd | INTEGER | expression |
| pc | DECIMAL | expression |

---

# ウィンドウ関数

---

## ROW_NUMBER / RANK / LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT id, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY amount) AS rn, RANK() OVER (ORDER BY amount) AS rk, LAG(amount) OVER (ORDER BY id) AS prev FROM users
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
| prev | DECIMAL | expression |

---
## NTILE / dense_rank / ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT id, NTILE(4) OVER (ORDER BY amount) AS q, dense_rank() OVER (ORDER BY amount) AS dr, SUM(amount) OVER (PARTITION BY dept ORDER BY id) AS running FROM users
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
| dr | INTEGER | expression |
| running | DECIMAL | polyglot |

---

# 日時

---

## DATEADD / DATEDIFF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT DATEADD('day', 1, created_at) AS da, DATEDIFF('day', created_at, CURRENT_TIMESTAMP) AS dd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| da | TIMESTAMP | expression |
| dd | INTEGER | expression |

---
## DATE_TRUNC

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT DATE_TRUNC('month', created_at) AS dm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dm | TIMESTAMP | expression |

---
## EXTRACT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT EXTRACT(YEAR FROM created_at) AS yr, EXTRACT(MONTH FROM created_at) AS mo FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| yr | INTEGER | expression |
| mo | INTEGER | expression |

---
## YEAR / MONTH / DAY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT YEAR(created_at) AS yr, MONTH(created_at) AS mo, DAY(created_at) AS dy FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| yr | INTEGER | expression |
| mo | INTEGER | expression |
| dy | INTEGER | expression |

---
## CURRENT_DATE / CURRENT_TIMESTAMP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT CURRENT_DATE AS cd, CURRENT_TIMESTAMP AS ct FROM users
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
## 日付リテラル BETWEEN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT id, name FROM users WHERE created_at BETWEEN DATE '2020-01-01' AND DATE '2020-12-31'
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

# 型・関数

---

## IFF / COALESCE / CASE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT IFF(age > 30, 'senior', 'junior') AS tier, COALESCE(name, 'unknown') AS nm, CASE WHEN age > 30 THEN 'senior' ELSE 'junior' END AS cs FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tier | VARCHAR(255) | expression |
| nm | VARCHAR(255) | expression |
| cs | VARCHAR(255) | expression |

---
## 文字列関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT LEFT(name, 3) AS prefix, RIGHT(name, 3) AS suffix, SUBSTRING(name, 1, 5) AS sub, TRIM(name) AS tn, REGEXP_REPLACE(name, '[0-9]+', 'X') AS rr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| prefix | VARCHAR(255) | expression |
| suffix | VARCHAR(255) | expression |
| sub | VARCHAR(255) | expression |
| tn | VARCHAR(255) | expression |
| rr | VARCHAR(255) | expression |

---
## CAST / CONCAT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT CAST(amount AS DECIMAL(10,2)) AS ca, CONCAT(name, '-', CAST(id AS VARCHAR(10))) AS label FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ca | decimal(10,2) | polyglot |
| label | VARCHAR(255) | polyglot |

---
## NULLIF / GREATEST / 数値関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT NULLIF(amount, 0) AS nz, GREATEST(age, 18) AS ga, ROUND(amount, 2) AS ra, ABS(amount) AS aa FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nz | DECIMAL | expression |
| ga | INTEGER | polyglot |
| ra | DECIMAL | polyglot |
| aa | DECIMAL | polyglot |

---
## ISNULL / NVL / IFNULL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT ISNULL(name, 'x') AS n1, NVL(name, 'x') AS n2, IFNULL(name, 'x') AS n3 FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n1 | VARCHAR(255) | polyglot |
| n2 | VARCHAR(255) | expression |
| n3 | VARCHAR(255) | expression |

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
dialect: tableau
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
dialect: tableau
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
## IN 副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
```

```sql
SELECT id FROM users WHERE dept IN (SELECT dept FROM users WHERE age > 20)
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
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
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
dialect: tableau
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
dialect: tableau
```

```sql
SELECT id FROM users INTERSECT SELECT id FROM users WHERE age > 0
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
dialect: tableau
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
dialect: tableau
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
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
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
dialect: tableau
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
