# Apache Druid SQL テストケース

このドキュメントは [Apache Druid SQL 公式ドキュメント](https://druid.apache.org/docs/latest/querying/sql/) に基づき、`sqldesc` が Apache Druid SQL 方言（`--dialect druid`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/druid.md`）。

```yaml
doc: sqldesc-test/v1
dialect: druid
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句、approx_count_distinct、any_value、ビット集約、回帰集約 |
| 時系列集約 | **time_floor + GROUP BY**（タイムシリーズ） |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、NTILE / cume_dist、ウィンドウ集約 |
| 時刻関数 | **time_floor / time_format / time_shift**、FLOOR TO DAY、TIMESTAMPDIFF |
| 複合行ソース | VALUES、UNNEST、CROSS JOIN UNNEST、generate_series |
| 型・関数 | ARRAY、JSON、文字列・算術 |
| 副問い合わせ・集合演算 | CTE（WITH）、EXCEPT、UNION、INTERSECT |
| メタデータ | **sys.segments**、SHOW DATABASES / SCHEMAS / TABLES / COLUMNS / FUNCTIONS、DESCRIBE、EXPLAIN |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Apache Druid SQL SELECT](https://druid.apache.org/docs/latest/querying/sql/) |
| 時刻関数 | [Date and time functions](https://druid.apache.org/docs/latest/querying/sql-functions/#date-and-time-functions) |
| 集約 | [Aggregation functions](https://druid.apache.org/docs/latest/querying/sql-aggregations/) |
| メタデータ | [Metadata tables](https://druid.apache.org/docs/latest/querying/sql-metadata-tables/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: druid
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  created_at TIMESTAMP,
  __time TIMESTAMP,
  data STRING,
  tags Array(TEXT)
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

---

# SELECT 基本

[Apache Druid SQL SELECT](https://druid.apache.org/docs/latest/querying/sql/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
dialect: druid
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
| __time | TIMESTAMP | users.__time |
| data | VARCHAR(255) | users.data |
| tags | array<text> | users.tags |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: druid
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
dialect: druid
```

```sql
SELECT id FROM users ORDER BY id LIMIT 10 OFFSET 5
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
dialect: druid
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
| id | INTEGER | users.id |
| amount | DECIMAL | orders.amount |

---

# 集約

[Aggregation functions](https://druid.apache.org/docs/latest/querying/sql-aggregations/)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
| dept | VARCHAR(255) | users.dept |
| n | INTEGER | expression |
| total | DECIMAL | expression |

---
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
| adults | INTEGER | expression |

---
## approx_count_distinct / any_value

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT approx_count_distinct(dept) AS ac, any_value(name) AS av FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ac | INTEGER | expression |
| av | VARCHAR(255) | expression |

---
## ビット集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT bit_and(age) AS ba, bit_or(age) AS bo, bit_xor(age) AS bx FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ba | INTEGER | expression |
| bo | INTEGER | expression |
| bx | INTEGER | expression |

---
## 回帰集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT regr_slope(amount, age) AS rs, regr_count(amount, age) AS rc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rs | DECIMAL | expression |
| rc | INTEGER | expression |

---

# 時系列集約

Druid の主タイムスタンプ列 `__time` を使ったタイムシリーズ集約です。

---

## time_floor + GROUP BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT time_floor(__time, 'PT1H') AS hour, count(*) AS c FROM users GROUP BY 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| hour | TIMESTAMP | expression |
| c | INTEGER | expression |

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
dialect: druid
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
dialect: druid
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
| r | INTEGER | expression |

---
## LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
| prev | VARCHAR(255) | expression |

---
## NTILE / cume_dist

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT ntile(4) OVER (ORDER BY amount) AS q, cume_dist() OVER (ORDER BY amount) AS cd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| q | INTEGER | expression |
| cd | DECIMAL | expression |

---
## ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT count(*) OVER (PARTITION BY dept) AS c, sum(amount) OVER (PARTITION BY dept ORDER BY __time) AS s FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| c | BIGINT | polyglot |
| s | DECIMAL | polyglot |

---

# 時刻関数

[Date and time functions](https://druid.apache.org/docs/latest/querying/sql-functions/#date-and-time-functions)

---

## time_floor / time_format / time_shift

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT
  time_floor(__time, 'P1D') AS day,
  time_format(__time, 'yyyy-MM-dd') AS fmt,
  time_ceil(__time, 'P1D') AS ceil_day,
  time_shift(__time, 'P1D', 1) AS shifted,
  time_extract(__time, 'HOUR') AS h
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| day | TIMESTAMP | expression |
| fmt | VARCHAR(255) | expression |
| ceil_day | TIMESTAMP | expression |
| shifted | TIMESTAMP | expression |
| h | INTEGER | expression |

---
## time_parse / FLOOR TO DAY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT time_parse(name, 'yyyy-MM-dd') AS p, floor(__time TO DAY) AS floor_day, ceil(__time TO DAY) AS ceil_day FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| p | TIMESTAMP | expression |
| floor_day | TIMESTAMP | expression |
| ceil_day | TIMESTAMP | expression |

---
## TIMESTAMPDIFF / TIMESTAMPADD

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT timestampdiff(HOUR, created_at, __time) AS diff, timestampadd(HOUR, 1, created_at) AS ta FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| diff | INTEGER | expression |
| ta | TIMESTAMP | expression |

---

# 複合行ソース

---

## VALUES 派生表

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: druid
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
| id | INTEGER | t.id |
| label | VARCHAR(255) | t.label |

---
## UNNEST

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: druid
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
| x | INTEGER | t.x |

---
## CROSS JOIN UNNEST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
## generate_series

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: druid
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
| x | INTEGER | t.x |

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
dialect: druid
```

```sql
SELECT ARRAY[1, 2, 3] AS nums, cardinality(tags) AS tc, transform(tags, x -> upper(x)) AS upper_tags FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nums | array<integer> | expression |
| tc | INTEGER | expression |
| upper_tags | array<text> | expression |

---
## JSON 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT json_value(data, '$.name') AS jv, json_query(data, '$.name') AS jq, json_object(ARRAY['id'], ARRAY[id]) AS jo FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jv | VARCHAR(255) | expression |
| jq | VARCHAR(4000) | expression |
| jo | VARCHAR(4000) | expression |

---
## 文字列・算術

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT
  coalesce(name, 'x') AS n,
  regexp_extract(name, '[A-Z]+') AS m,
  safe_divide(amount, age) AS sd,
  greatest(amount, age) AS g
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | VARCHAR(255) | expression |
| m | VARCHAR(255) | expression |
| sd | DECIMAL | expression |
| g | DECIMAL | expression |

---
## 型変換

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT try_cast(name AS integer) AS n, cast(amount AS double) AS a FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | INTEGER | polyglot |
| a | DECIMAL | polyglot |

---
## システム関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
```

```sql
SELECT version() AS v, current_timestamp AS now, current_date AS today FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | VARCHAR(255) | expression |
| now | TIMESTAMP | expression |
| today | DATE | polyglot |

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
dialect: druid
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
| id | INTEGER | cte.id |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
| id | INTEGER | cast |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
| id | INTEGER | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
| id | INTEGER | cast |

---

# メタデータ

[Metadata tables](https://druid.apache.org/docs/latest/querying/sql-metadata-tables/)

---

## sys.segments

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: druid
```

```sql
SELECT segment_id FROM sys.segments
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| segment_id | unknown | |

---
## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: druid
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
| Database | VARCHAR(255) | cast |

---
## SHOW SCHEMAS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: druid
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
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: druid
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
## SHOW COLUMNS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: druid
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
## SHOW FUNCTIONS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: druid
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
| Function | VARCHAR(255) | cast |
| Type | VARCHAR(255) | cast |
| Definer | VARCHAR(255) | cast |
| Modified | TIMESTAMP | cast |
| Created | TIMESTAMP | cast |
| Security_type | VARCHAR(255) | cast |
| Comment | VARCHAR(255) | cast |

---
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
| __time | TIMESTAMP | users.__time |
| data | VARCHAR(255) | users.data |
| tags | array<text> | users.tags |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
