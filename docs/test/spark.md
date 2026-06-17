# Spark SQL テストケース

このドキュメントは [Spark SQL 公式ドキュメント](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select.html) に基づき、`sqldesc` が Spark SQL 方言（`--dialect spark`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/spark.md`）。

```yaml
doc: sqldesc-test/v1
dialect: spark
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、DISTINCT |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、**collect_list** / **collect_set**、**percentile_approx** |
| ウィンドウ関数 | ROW_NUMBER / RANK / LAG、dense_rank / ウィンドウ集約 |
| **LATERAL VIEW** | **posexplode** |
| テーブル関数 | **explode**、**stack** |
| 配列・高階関数 | **transform**、size / array_contains |
| JSON / MAP / STRUCT | get_json_object、from_json / to_json、element_at / map_keys |
| 型・関数 | sha2 / xxhash64、date_add / datediff、**monotonically_increasing_id**、current_database / version |
| 分散・サンプリング | **TABLESAMPLE**、**DISTRIBUTE BY / SORT BY** |
| 副問い合わせ・集合演算 | CTE（WITH）、UNION、EXCEPT、INTERSECT |
| メタデータ | SHOW CURRENT NAMESPACE / DATABASES / NAMESPACES / TABLES / FUNCTIONS / COLUMNS / TBLPROPERTIES、DESCRIBE DATABASE / NAMESPACE / TABLE / TABLE EXTENDED / FUNCTION、EXPLAIN |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Spark SQL SELECT](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select.html) |
| 高階関数 | [Higher-Order Functions](https://spark.apache.org/docs/latest/sql-ref-functions-higher-order.html) |
| JSON | [JSON Functions](https://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#json-functions) |
| 配列 | [Array Functions](https://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#array-functions) |
| メタデータ | [SHOW](https://spark.apache.org/docs/latest/sql-ref-syntax-aux-show.html) |

Docker 検証:

- `docker.io/apache/spark:latest` の `spark-submit` でローカル SparkSession を起動し、各 SQL をバッチ実行する（常駐コンテナは不要）。
- 一括検証: `node scripts/verify-spark-doc.mjs`

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: spark
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
  attrs map<text, integer>,
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

[Spark SQL SELECT](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
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
dialect: spark
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
| data | VARCHAR(4000) | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, integer> | users.attrs |
| created_at | TIMESTAMP | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
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
dialect: spark
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
dialect: spark
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
dialect: spark
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
dialect: spark
```

```sql
SELECT dept, COUNT(*) AS cnt, SUM(amount) AS total, collect_list(name) AS names FROM users GROUP BY dept HAVING COUNT(*) > 1
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
| names | array<text> | expression |

---
## collect_set / percentile_approx

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT collect_list(name) AS cl, collect_set(name) AS cs, percentile_approx(age, 0.5) AS pa FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cl | array<text> | expression |
| cs | array<text> | expression |
| pa | DECIMAL | expression |

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
dialect: spark
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
## dense_rank / ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT id, dense_rank() OVER (ORDER BY amount) AS dr, SUM(amount) OVER (PARTITION BY dept ORDER BY id) AS running FROM users
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
| running | DECIMAL | polyglot |

---

# LATERAL VIEW

---

## posexplode

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT id, pos, tag FROM users LATERAL VIEW posexplode(tags) e AS pos, tag
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| pos | INTEGER | e.pos |
| tag | VARCHAR(255) | e.tag |

---

# テーブル関数

---

## explode

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT * FROM explode(array(1, 2)) AS t
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| col | INTEGER | t.col |

---
## stack

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT * FROM stack(2, 1, 'a', 2, 'b') AS t
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| col0 | INTEGER | t.col0 |
| col1 | VARCHAR(255) | t.col1 |

---

# 配列・高階関数

---

## transform

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT transform(tags, x -> upper(x)) AS t FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | array<text> | expression |

---
## size / array_contains

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT size(tags) AS sz, array_contains(tags, 'x') AS has FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sz | INTEGER | expression |
| has | BOOLEAN | expression |

---

# JSON / MAP / STRUCT

---

## get_json_object

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT get_json_object(data, '$.x') AS j FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| j | VARCHAR(255) | expression |

---
## from_json / to_json

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT from_json(data, 'a INT, b STRING') AS parsed, to_json(struct(id, name)) AS j FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| parsed | struct<a integer, b text> | expression |
| j | VARCHAR(4000) | expression |

---
## element_at / map_keys

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT element_at(attrs, 'k') AS v, map_keys(attrs) AS keys FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | INTEGER | expression |
| keys | array<text> | expression |

---

# 型・関数

---

## sha2 / xxhash64

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT sha2(name, 256) AS s, xxhash64(name) AS x FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | VARCHAR(255) | expression |
| x | INTEGER | expression |

---
## date_add / datediff

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT date_add(created_at, 1) AS da, datediff(created_at, current_date()) AS dd FROM users
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
## monotonically_increasing_id

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT monotonically_increasing_id() AS mi FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mi | INTEGER | expression |

---
## current_database / version

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT current_database() AS db, current_user() AS u, version() AS v FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| db | VARCHAR(255) | expression |
| u | VARCHAR(255) | expression |
| v | VARCHAR(255) | expression |

---

# 分散・サンプリング

---

## TABLESAMPLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT * FROM users TABLESAMPLE (10 PERCENT)
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
| data | VARCHAR(4000) | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, integer> | users.attrs |
| created_at | TIMESTAMP | users.created_at |

---
## DISTRIBUTE BY / SORT BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
SELECT * FROM users DISTRIBUTE BY dept SORT BY amount
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
| data | VARCHAR(4000) | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, integer> | users.attrs |
| created_at | TIMESTAMP | users.created_at |

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
dialect: spark
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
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
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
dialect: spark
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
dialect: spark
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

# メタデータ

[Spark SQL SHOW](https://spark.apache.org/docs/latest/sql-ref-syntax-aux-show.html)

---

## SHOW CURRENT NAMESPACE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
SHOW CURRENT NAMESPACE
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| catalog | VARCHAR(255) | cast |
| namespace | VARCHAR(255) | cast |

---
## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
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
| namespace | VARCHAR(255) | cast |

---
## SHOW NAMESPACES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
SHOW NAMESPACES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| namespace | VARCHAR(255) | cast |

---
## DESCRIBE DATABASE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
DESCRIBE DATABASE default
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
## DESCRIBE NAMESPACE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
DESCRIBE NAMESPACE default
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
## DESCRIBE TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
```

```sql
DESCRIBE TABLE users
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
## DESCRIBE TABLE EXTENDED

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
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
## DESCRIBE FUNCTION

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
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
| function_desc | VARCHAR(255) | cast |

---
## SHOW FUNCTIONS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
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
| function | VARCHAR(255) | cast |

---
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
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
| namespace | VARCHAR(255) | cast |
| tableName | VARCHAR(255) | cast |
| isTemporary | BOOLEAN | cast |

---
## SHOW COLUMNS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
SHOW COLUMNS IN users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| col_name | VARCHAR(255) | cast |

---
## SHOW TBLPROPERTIES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
SHOW TBLPROPERTIES users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| key | VARCHAR(255) | cast |
| value | VARCHAR(255) | cast |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
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
| plan | VARCHAR(255) | cast |

---
