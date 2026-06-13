# CockroachDB テストケース

このドキュメントは [CockroachDB 公式ドキュメント](https://www.cockroachlabs.com/docs/stable/select-clause) に基づき、`sqldesc` が CockroachDB 方言（`--dialect cockroachdb`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/cockroachdb.md`）。

```yaml
doc: sqldesc-test/v1
dialect: cockroachdb
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、DISTINCT ON |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句、array_agg / string_agg、percentile_cont |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、NTILE、cume_dist |
| 複合行ソース | VALUES、UNNEST、generate_series、regexp_split_to_table |
| 配列・JSON | 添字アクセス、スライス、JSONB 演算子 |
| 関数 | 日時、型変換、coalesce、pg_typeof、gen_random_uuid |
| 副問い合わせ・集合演算 | CTE（WITH）、EXCEPT、UNION、INTERSECT |
| メタデータ | SHOW DATABASES / TABLES / COLUMNS / INDEXES / CONSTRAINTS / JOBS / CREATE TABLE、EXPLAIN、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [CockroachDB SELECT](https://www.cockroachlabs.com/docs/stable/select-clause) |
| SHOW COLUMNS | [CockroachDB SHOW COLUMNS](https://www.cockroachlabs.com/docs/stable/show-columns) |
| SHOW INDEXES | [CockroachDB SHOW INDEXES](https://www.cockroachlabs.com/docs/stable/show-indexes) |
| SHOW DATABASES | [CockroachDB SHOW DATABASES](https://www.cockroachlabs.com/docs/stable/show-databases) |
| 配列 | [CockroachDB arrays](https://www.cockroachlabs.com/docs/stable/array) |
| JSON | [CockroachDB JSON](https://www.cockroachlabs.com/docs/stable/json) |
| ウィンドウ関数 | [CockroachDB window functions](https://www.cockroachlabs.com/docs/stable/window-functions) |

Docker 検証:

- `docker.io/cockroachdb/cockroach:latest` を `start-single-node --insecure --store=type=mem,size=0.25 --listen-addr=127.0.0.1:26257` で起動して確認。
- 検証バージョンは `CockroachDB CCL v26.2.2`。
- `CREATE TABLE users(id int, name string, amount decimal, created_at timestamp)` 後の `pg_typeof` は `bigint`, `text`, `numeric`, `timestamp without time zone` を返す。
- `SHOW COLUMNS FROM users`, `SHOW INDEXES FROM users`, `SHOW DATABASES` を実行し、メタデータ列を確認。

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: cockroachdb
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  created_at TIMESTAMP,
  data JSONB,
  tags Array(TEXT),
  attrs Map(TEXT, INTEGER)
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

---

# SELECT 基本

[CockroachDB SELECT](https://www.cockroachlabs.com/docs/stable/select-clause)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
dialect: cockroachdb
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
| created_at | timestamp without time zone | users.created_at |
| data | jsonb | users.data |
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
dialect: cockroachdb
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
## ORDER BY / LIMIT / OFFSET

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
```

```sql
SELECT id, name FROM users ORDER BY id LIMIT 10 OFFSET 5
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
## DISTINCT ON

PostgreSQL 互換の DISTINCT ON です。CockroachDB でも利用できます。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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

[CockroachDB JOIN](https://www.cockroachlabs.com/docs/stable/select-clause#joins)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
| id | integer | users.id |
| amount | numeric | orders.amount |

---

# 集約

[CockroachDB aggregate functions](https://www.cockroachlabs.com/docs/stable/aggregate-functions)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
| dept | text | users.dept |
| n | integer | expression |
| total | numeric | expression |

---
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
| adults | integer | expression |

---
## array_agg / string_agg

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
| names | text | expression |

---
## percentile_cont

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
| p50 | numeric | expression |

---

# ウィンドウ関数

[CockroachDB window functions](https://www.cockroachlabs.com/docs/stable/window-functions)

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
```

```sql
SELECT id, row_number() OVER (PARTITION BY dept ORDER BY id) AS rn FROM users
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
dialect: cockroachdb
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
| r | integer | expression |

---
## LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
| prev | text | expression |

---
## NTILE / cume_dist

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
```

```sql
SELECT ntile(4) OVER (ORDER BY amount) AS quartile, cume_dist() OVER (ORDER BY amount) AS cd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| quartile | integer | expression |
| cd | numeric | expression |

---

# 複合行ソース

---

## VALUES 派生テーブル

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
```

```sql
SELECT * FROM (VALUES (1, 'a'), (2, 'b')) AS t(id, label)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |
| label | text | t.label |

---
## UNNEST

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
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
| x | integer | t.x |

---
## generate_series

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
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
| x | integer | t.x |

---
## regexp_split_to_table

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
```

```sql
SELECT * FROM regexp_split_to_table(name, ',') AS t(word)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| word | text | t.word |

---

# 配列・JSON

[CockroachDB arrays](https://www.cockroachlabs.com/docs/stable/array)、[JSON](https://www.cockroachlabs.com/docs/stable/json)

---

## 配列リテラル・添字アクセス

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
```

```sql
SELECT ARRAY[1, 2, 3] AS nums, tags[1] AS first_tag, tags[1:3] AS slice, cardinality(tags) AS tc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nums | array<integer> | expression |
| first_tag | text | users.tags |
| slice | array<text> | expression |
| tc | integer | expression |

---
## JSONB 演算子

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
```

```sql
SELECT data->>'name' AS n, data->'tags' AS t FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | text | users.data.name |
| t | json | expression |

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
dialect: cockroachdb
```

```sql
SELECT
  current_date AS today,
  current_timestamp AS now,
  to_char(created_at, 'YYYY-MM') AS ym,
  extract(year FROM created_at) AS y,
  age(created_at) AS a
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| today | date | polyglot |
| now | timestamp without time zone | expression |
| ym | text | expression |
| y | integer | expression |
| a | interval | expression |

---
## 型変換・条件式

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
```

```sql
SELECT coalesce(name, 'x') AS n, amount::float8 AS a, pg_typeof(id) AS t FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | text | expression |
| a | numeric | polyglot |
| t | text | expression |

---
## gen_random_uuid

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
```

```sql
SELECT gen_random_uuid() AS u FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| u | uuid | expression |

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
dialect: cockroachdb
```

```sql
WITH cte AS (SELECT id, name FROM users) SELECT id FROM cte
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cte.id |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
| id | integer | cast |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
| id | integer | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
| id | integer | cast |

---

# メタデータ

[CockroachDB SHOW](https://www.cockroachlabs.com/docs/stable/show-clause)

---

## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
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
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
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
## SHOW COLUMNS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
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
## SHOW INDEXES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
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
## SHOW CONSTRAINTS

CockroachDB 固有のメタデータコマンドです。

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
```

```sql
SHOW CONSTRAINTS FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | text | cast |
| constraint_name | text | cast |
| constraint_type | text | cast |
| details | text | cast |
| validated | boolean | cast |

---
## SHOW JOBS

バックグラウンドジョブの状態を確認する CockroachDB 固有コマンドです。

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
```

```sql
SHOW JOBS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| job_id | integer | cast |
| job_type | text | cast |
| description | text | cast |
| statement | text | cast |
| user_name | text | cast |
| status | text | cast |
| created | timestamp without time zone | cast |
| finished | timestamp without time zone | cast |
| fraction_completed | numeric | cast |

---
## SHOW CREATE TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
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
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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

# Docker 実測メタデータ

`cockroachdb/cockroach:latest` の `information_schema` から取得した metadata schema を検証する。

---

## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: cockroachdb
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
dialect: cockroachdb
```

```sql
SELECT column_name, data_type FROM information_schema.columns
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
