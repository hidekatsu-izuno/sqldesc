# StarRocks テストケース

このドキュメントは [StarRocks 公式ドキュメント](https://docs.starrocks.io/docs/sql-reference/sql-statements/table_bucket_part_index/SELECT/) に基づき、`sqldesc` が StarRocks 方言（`--dialect starrocks`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/starrocks.md`）。

```yaml
doc: sqldesc-test/v1
dialect: starrocks
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、DISTINCT |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、GROUP_CONCAT、**approx_count_distinct** / **percentile_approx** |
| Bitmap / HLL | **to_bitmap** / **bitmap_count**、**bitmap_union_count**、**hll_hash** |
| ウィンドウ関数 | ROW_NUMBER / RANK / LAG、NTILE / dense_rank / ウィンドウ集約 |
| 配列 | **array_length** / **array_contains** |
| JSON | JSON_EXTRACT / JSON_UNQUOTE、**get_json_string**、parse_json |
| 型・関数 | IFF / COALESCE、DATE_ADD / DATEDIFF、CAST、CONVERT |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、UNION、EXCEPT、INTERSECT、VALUES ROW |
| メタデータ | SHOW DATABASES / TABLES / COLUMNS / PARTITIONS / CREATE TABLE、DESCRIBE、EXPLAIN、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [StarRocks SELECT](https://docs.starrocks.io/docs/sql-reference/sql-statements/table_bucket_part_index/SELECT/) |
| Bitmap | [Bitmap functions](https://docs.starrocks.io/docs/sql-reference/sql-functions/aggregate-functions/bitmap) |
| HLL | [HLL functions](https://docs.starrocks.io/docs/sql-reference/sql-functions/aggregate-functions/hll) |
| 配列 | [Array functions](https://docs.starrocks.io/docs/sql-reference/sql-functions/Array_functions) |
| JSON | [JSON functions](https://docs.starrocks.io/docs/sql-reference/sql-functions/json-functions/json-functions) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: starrocks
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  data JSON,
  tags array<text>,
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

[StarRocks SELECT](https://docs.starrocks.io/docs/sql-reference/sql-statements/table_bucket_part_index/SELECT/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
dialect: starrocks
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
| tags | array<text> | users.tags |
| created_at | timestamp | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
dialect: starrocks
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
dialect: starrocks
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
dialect: starrocks
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

# 集約

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
```

```sql
SELECT dept, COUNT(*) AS cnt, SUM(amount) AS total, GROUP_CONCAT(name) AS gc FROM users GROUP BY dept HAVING COUNT(*) > 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar(255) | users.dept |
| cnt | int | expression |
| total | decimal | expression |
| gc | varchar(255) | expression |

---
## approx_count_distinct / percentile_approx

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
```

```sql
SELECT approx_count_distinct(age) AS acd, percentile_approx(amount, 0.5) AS pa FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| acd | int | expression |
| pa | decimal | expression |

---

# Bitmap / HLL

---

## to_bitmap / bitmap_count

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
## bitmap_union_count

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
```

```sql
SELECT bitmap_union_count(to_bitmap(id)) AS buc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| buc | int | expression |

---
## hll_hash

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
```

```sql
SELECT hll_hash(name) AS hh FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| hh | hll | expression |

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
dialect: starrocks
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
| id | int | users.id |
| rn | int | expression |
| rk | int | expression |
| prev | decimal | expression |

---
## NTILE / dense_rank / ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
| id | int | users.id |
| q | int | expression |
| dr | int | expression |
| running | decimal | polyglot |

---

# 配列

---

## array_length / array_contains

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
```

```sql
SELECT array_length(tags) AS al, array_contains(tags, 'x') AS ac FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| al | int | expression |
| ac | tinyint(1) | expression |

---

# JSON

---

## JSON_EXTRACT / JSON_UNQUOTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
## get_json_string

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
```

```sql
SELECT get_json_string(data, '$.x') AS gjs FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| gjs | varchar(255) | expression |

---
## parse_json

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
```

```sql
SELECT parse_json(data) AS pj FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| pj | json | expression |

---

# 型・関数

---

## IFF / COALESCE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
```

```sql
SELECT IFF(age > 30, 'senior', 'junior') AS tier, COALESCE(name, 'unknown') AS nm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tier | varchar(255) | expression |
| nm | varchar(255) | expression |

---
## DATE_ADD / DATEDIFF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
```

```sql
SELECT DATE_ADD(created_at, INTERVAL 1 DAY) AS da, DATEDIFF(created_at, NOW()) AS dd FROM users
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

---
## CAST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
dialect: starrocks
```

```sql
SELECT CONVERT(amount, DECIMAL(10,2)) AS cv FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cv | decimal(10,2) | expression |

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
dialect: starrocks
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
dialect: starrocks
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
| id | int | users.id |
| max_amt | decimal | expression |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
| id | int | cast |

---
## VALUES ROW

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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

# メタデータ

---

## SHOW DATABASES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
dialect: starrocks
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

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
## SHOW CREATE TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
| tags | array<text> | users.tags |
| created_at | timestamp | users.created_at |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
dialect: starrocks
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
