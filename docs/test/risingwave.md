# RisingWave テストケース

このドキュメントは [RisingWave 公式ドキュメント](https://docs.risingwave.com/sql/commands/sql-select) に基づき、`sqldesc` が RisingWave 方言（`--dialect risingwave`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/risingwave.md`）。

```yaml
doc: sqldesc-test/v1
dialect: risingwave
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / OFFSET / LIMIT、DISTINCT ON |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句、string_agg / array_agg |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG / LEAD、NTILE、dense_rank、ウィンドウ集約 |
| 複合行ソース | VALUES、UNNEST、generate_series |
| **ストリーミング時間窓** | **tumble_start / tumble_end**、**hop_start / hop_end**、**TUMBLE GROUP BY** |
| 型・関数 | ARRAY、JSON / JSONB、regexp_match、coalesce |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、EXCEPT、UNION、INTERSECT |
| **SHOW 系** | **SHOW MATERIALIZED VIEWS**、**SHOW SOURCES / SINKS**、SHOW VIEWS / TABLES / DATABASES / INDEXES / SCHEMAS、SHOW CREATE TABLE |
| メタデータ | information_schema、pg_catalog、DESCRIBE、EXPLAIN |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [RisingWave SELECT](https://docs.risingwave.com/sql/commands/sql-select) |
| 時間窓 | [Time windows](https://docs.risingwave.com/processing/time-windows) |
| SOURCES / SINKS | [SHOW SOURCES](https://docs.risingwave.com/sql/commands/sql-show-sources)、[SHOW SINKS](https://docs.risingwave.com/sql/commands/sql-show-sinks) |
| MATERIALIZED VIEWS | [SHOW MATERIALIZED VIEWS](https://docs.risingwave.com/sql/commands/sql-show-materialized-views) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: risingwave
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  data JSONB,
  created_at TIMESTAMP,
  tags ARRAY<TEXT>
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

---

# SELECT 基本

[RisingWave SELECT](https://docs.risingwave.com/sql/commands/sql-select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
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
dialect: risingwave
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
| data | jsonb | users.data |
| created_at | timestamp without time zone | users.created_at |
| tags | array<text> | users.tags |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
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
dialect: risingwave
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
dialect: risingwave
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
dialect: risingwave
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
dialect: risingwave
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
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT dept, COUNT(*) FILTER (WHERE age > 30) AS adult_cnt FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| adult_cnt | integer | expression |

---
## string_agg / array_agg

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT dept, string_agg(name, ',') AS sa, array_agg(name) AS names FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| sa | text | expression |
| names | array<text> | expression |

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
dialect: risingwave
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
dialect: risingwave
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
dialect: risingwave
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
## NTILE / dense_rank

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT id, NTILE(4) OVER (ORDER BY amount) AS quartile, dense_rank() OVER (ORDER BY amount) AS dr FROM users
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
| dr | integer | expression |

---
## ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
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
dialect: risingwave
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
## UNNEST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
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
| id | integer | users.id |
| tag | text | t.tag |

---
## generate_series

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT * FROM generate_series(1, 5) AS g(n)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | integer | g.n |

---

# ストリーミング時間窓

[Time windows](https://docs.risingwave.com/processing/time-windows)

---

## tumble_start / tumble_end

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT tumble_start(created_at, interval '1 hour') AS ts, tumble_end(created_at, interval '1 hour') AS te FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ts | timestamp without time zone | expression |
| te | timestamp without time zone | expression |

---
## hop_start / hop_end

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT hop_start(created_at, interval '5 minute', interval '1 minute') AS hs, hop_end(created_at, interval '5 minute', interval '1 minute') AS he FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| hs | timestamp without time zone | expression |
| he | timestamp without time zone | expression |

---
## TUMBLE GROUP BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT dept, SUM(amount) AS total FROM users GROUP BY dept, TUMBLE(created_at, interval '1 hour')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| total | numeric | expression |

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
dialect: risingwave
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
| cnt | integer | expression |

---
## JSON / JSONB

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT data->>'x' AS jt, data->'y' AS jo FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jt | text | users.data.x |
| jo | json | expression |

---
## regexp_match / coalesce

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT regexp_match(name, '[A-Z]+') AS rm, coalesce(amount, 0) AS ca FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rm | array<text> | expression |
| ca | numeric | expression |

---
## current_timestamp / gen_random_uuid / version

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT current_timestamp AS ct, gen_random_uuid() AS uuid, version() AS ver, current_database() AS db FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ct | timestamp without time zone | expression |
| uuid | uuid | expression |
| ver | text | expression |
| db | text | expression |

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
dialect: risingwave
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
dialect: risingwave
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
dialect: risingwave
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
dialect: risingwave
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
dialect: risingwave
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

# SHOW 系

---

## SHOW MATERIALIZED VIEWS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
```

```sql
SHOW MATERIALIZED VIEWS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| created_on | timestamp without time zone | cast |
| name | text | cast |
| database_name | text | cast |
| schema_name | text | cast |
| cluster_by | text | cast |
| rows | integer | cast |
| bytes | integer | cast |
| owner | text | cast |
| comment | text | cast |

---
## SHOW SOURCES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
```

```sql
SHOW SOURCES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | cast |
| schema | text | cast |
| type | text | cast |
| owner | text | cast |
| cluster | text | cast |

---
## SHOW SINKS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
```

```sql
SHOW SINKS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | cast |
| schema | text | cast |
| type | text | cast |
| owner | text | cast |
| cluster | text | cast |

---
## SHOW VIEWS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
```

```sql
SHOW VIEWS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| View | text | cast |

---
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
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
## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
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
## SHOW INDEXES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
```

```sql
SHOW INDEXES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | text | cast |
| Non_unique | integer | cast |
| Key_name | text | cast |
| Seq_in_index | integer | cast |
| Column_name | text | cast |
| Collation | text | cast |
| Cardinality | integer | cast |
| Sub_part | integer | cast |
| Packed | text | cast |
| Null | text | cast |
| Index_type | text | cast |
| Comment | text | cast |
| Index_comment | text | cast |

---
## SHOW SCHEMAS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
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
## SHOW CREATE TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
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
| Table | text | cast |
| Create Table | text | cast |

---

# メタデータ

---

## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
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
## pg_catalog.pg_class

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: risingwave
```

```sql
SELECT relname FROM pg_catalog.pg_class LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| relname | text | pg_catalog.pg_class.relname |

---
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
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
| data | jsonb | users.data |
| created_at | timestamp without time zone | users.created_at |
| tags | array<text> | users.tags |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
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
