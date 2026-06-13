# Materialize テストケース

このドキュメントは [Materialize 公式ドキュメント](https://materialize.com/docs/sql/select/) に基づき、`sqldesc` が Materialize 方言（`--dialect materialize`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/materialize.md`）。

```yaml
doc: sqldesc-test/v1
dialect: materialize
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / OFFSET / LIMIT、DISTINCT ON |
| JOIN | INNER JOIN、LATERAL |
| 集約 | GROUP BY / HAVING、FILTER 句、string_agg / array_agg、bool_and |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、NTILE、dense_rank / cume_dist、ウィンドウ集約 |
| 複合行ソース | VALUES、UNNEST、generate_series |
| 型・関数 | ARRAY / MAP、JSON / JSONB、regexp_match、coalesce / CASE |
| **Materialize 固有** | **mz_now()**、current_timestamp / gen_random_uuid / version |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、EXCEPT、UNION、INTERSECT |
| **SHOW 系** | **SHOW CLUSTERS**、**SHOW MATERIALIZED VIEWS**、**SHOW SOURCES / SINKS**、SHOW VIEWS / TABLES / SCHEMAS / DATABASES / COLUMNS |
| メタデータ | information_schema、pg_catalog、DESCRIBE、EXPLAIN |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Materialize SELECT](https://materialize.com/docs/sql/select/) |
| SHOW VIEWS | [SHOW VIEWS](https://materialize.com/docs/sql/show-views/) |
| SHOW CLUSTERS | [SHOW CLUSTERS](https://materialize.com/docs/sql/show-clusters/) |
| SOURCES / SINKS | [SHOW SOURCES](https://materialize.com/docs/sql/show-sources/)、[SHOW SINKS](https://materialize.com/docs/sql/show-sinks/) |
| データ型 | [Materialize data types](https://materialize.com/docs/sql/types/) |
| mz_now | [mz_now function](https://materialize.com/docs/sql/functions/mz_now/) |

Docker 検証:

- `docker.io/materialize/materialized:latest` を起動し、同梱 `psql` から確認。
- 検証バージョンは `Materialize 26.28.0`。
- `CREATE TABLE users(id int, name text, amount numeric, created_at timestamp)` 後の `pg_typeof` は `integer`, `text`, `numeric`, `timestamp without time zone` を返す。
- `SELECT id, name, amount FROM users` と `SHOW VIEWS` を実行し、ローカルコンテナでクラウド接続なしに確認。

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: materialize
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
  tags ARRAY<TEXT>,
  attrs MAP<TEXT, INTEGER>
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

---

# SELECT 基本

[Materialize SELECT](https://materialize.com/docs/sql/select/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
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
dialect: materialize
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
| attrs | map<text, integer> | users.attrs |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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
## LATERAL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
```

```sql
SELECT id, val FROM users, LATERAL (SELECT amount AS val FROM orders WHERE user_id = users.id LIMIT 1) o
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| val | numeric | o.val |

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
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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
## bool_and

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
```

```sql
SELECT bool_and(age > 18) AS ba FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ba | boolean | expression |

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
dialect: materialize
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
dialect: materialize
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
## LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
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
| id | integer | users.id |
| prev | numeric | expression |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
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
## dense_rank / cume_dist

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
```

```sql
SELECT id, dense_rank() OVER (ORDER BY amount) AS dr, cume_dist() OVER (ORDER BY amount) AS cd FROM users
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
| cd | numeric | expression |

---
## ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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

# 型・関数

---

## ARRAY / MAP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
```

```sql
SELECT tags, cardinality(tags) AS cnt, attrs, map_keys(attrs) AS mk FROM users
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
| attrs | map<text, integer> | users.attrs |
| mk | array<text> | expression |

---
## JSON / JSONB

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
```

```sql
SELECT data->>'x' AS jt, data->'y' AS jo, jsonb_path_query(data, '$.items[*]') AS jp FROM users
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
| jp | jsonb | expression |

---
## regexp_match / coalesce / CASE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
```

```sql
SELECT regexp_match(name, '[A-Z]+') AS rm, coalesce(amount, 0) AS ca, CASE WHEN age > 30 THEN 'senior' ELSE 'junior' END AS tier FROM users
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
| tier | text | expression |

---

# Materialize 固有

---

## mz_now()

[mz_now function](https://materialize.com/docs/sql/functions/mz_now/)

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
```

```sql
SELECT mz_now() AS mz FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mz | mz_timestamp | expression |

---
## current_timestamp / gen_random_uuid / version

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
```

```sql
SELECT current_timestamp AS ct, now() AS n, gen_random_uuid() AS uuid, version() AS ver, current_database() AS db, current_schema() AS sch FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ct | timestamp without time zone | expression |
| n | timestamp without time zone | polyglot |
| uuid | uuid | expression |
| ver | text | expression |
| db | text | expression |
| sch | text | expression |

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
dialect: materialize
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
| name | text | recent.name |

---
## 相関副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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

## SHOW CLUSTERS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: materialize
```

```sql
SHOW CLUSTERS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | cast |
| replicas | integer | cast |
| size | text | cast |
| availability_zones | text | cast |
| managed | boolean | cast |

---
## SHOW MATERIALIZED VIEWS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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
dialect: materialize
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
## SHOW COLUMNS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
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
| Field | text | cast |
| Type | text | cast |
| Null | text | cast |
| Key | text | cast |
| Default | text | cast |
| Extra | text | cast |

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
dialect: materialize
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
## information_schema.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: materialize
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
| column_name | text | information_schema.columns.column_name |
| data_type | text | information_schema.columns.data_type |

---
## pg_catalog.pg_class

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: materialize
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
dialect: materialize
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
| attrs | map<text, integer> | users.attrs |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
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
