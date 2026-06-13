# Apache Drill テストケース

このドキュメントは [Apache Drill 公式ドキュメント](https://drill.apache.org/docs/select-statements/) に基づき、`sqldesc` が Apache Drill 方言（`--dialect drill`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/drill.md`）。

```yaml
doc: sqldesc-test/v1
dialect: drill
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、TABLESAMPLE |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句、approx_count_distinct / percentile_cont、listagg / array_agg |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、NTILE / cume_dist |
| 複合行ソース | VALUES、UNNEST、CROSS JOIN UNNEST、generate_series |
| 半構造化データ | **flatten**、convert_to / convert_from |
| 型・関数 | ARRAY / MAP、配列高階関数、STRUCT、JSON、日時、正規表現 |
| タイムトラベル | FOR SYSTEM_TIME AS OF |
| テーブル関数 | table(path => ...) |
| 副問い合わせ・集合演算 | CTE（WITH）、EXCEPT、UNION、INTERSECT |
| メタデータ | SHOW DATABASES / SCHEMAS / TABLES / FILES / CATALOGS / FUNCTIONS / VIEWS / USER、DESCRIBE、EXPLAIN |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Apache Drill SELECT](https://drill.apache.org/docs/select-statements/) |
| FLATTEN | [FLATTEN function](https://drill.apache.org/docs/flatten/) |
| 関数 | [SQL functions](https://drill.apache.org/docs/sql-functions/) |
| SHOW | [SHOW commands](https://drill.apache.org/docs/show/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: drill
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  created_at TIMESTAMP,
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

[Apache Drill SELECT](https://drill.apache.org/docs/select-statements/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
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
dialect: drill
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
dialect: drill
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
dialect: drill
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
## TABLESAMPLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT id FROM users TABLESAMPLE BERNOULLI(10)
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
dialect: drill
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

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
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
dialect: drill
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
## approx_count_distinct / percentile_cont

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT approx_count_distinct(dept) AS ac, percentile_cont(0.5) WITHIN GROUP (ORDER BY amount) AS p50 FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ac | INTEGER | expression |
| p50 | DECIMAL | expression |

---
## listagg / array_agg

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT listagg(name, ',') AS names, array_agg(dept) AS depts FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| names | VARCHAR(255) | polyglot |
| depts | array<text> | expression |

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
dialect: drill
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
dialect: drill
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
dialect: drill
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
dialect: drill
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

# 複合行ソース

---

## VALUES 派生表

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: drill
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
dialect: drill
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
dialect: drill
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
dialect: drill
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

# 半構造化データ

[FLATTEN function](https://drill.apache.org/docs/flatten/) は Drill の代表的な機能で、配列やネストした JSON を行に展開します。

---

## flatten

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT flatten(tags) AS f, flatten(ARRAY[ARRAY[1, 2], ARRAY[3]]) AS nested FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| f | VARCHAR(255) | expression |
| nested | INTEGER | expression |

---
## convert_to / convert_from

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT convert_to(name, 'UTF8') AS ct, convert_from(convert_to(name, 'UTF8'), 'UTF8') AS cf FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ct | VARBINARY(255) | expression |
| cf | VARCHAR(255) | expression |

---

# 型・関数

---

## ARRAY リテラル

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT ARRAY[1, 2, 3] AS nums, cardinality(tags) AS tc FROM users
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

---
## 配列高階関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT
  transform(tags, x -> upper(x)) AS upper_tags,
  filter(tags, x -> x <> '') AS filtered,
  reduce(tags, '', (s, x) -> concat(s, x), s -> s) AS joined
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| upper_tags | array<text> | expression |
| filtered | array<text> | expression |
| joined | VARCHAR(255) | expression |

---
## 配列述語

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT array_length(tags) AS al, array_contains(tags, 'x') AS ac, contains(tags, 'vip') AS has FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| al | INTEGER | expression |
| ac | BOOLEAN | expression |
| has | BOOLEAN | expression |

---
## MAP 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT map_keys(map['a', 1]) AS mk, map_values(map['a', 1]) AS mv, element_at(tags, 1) AS e FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mk | array<text> | expression |
| mv | array<integer> | expression |
| e | VARCHAR(255) | expression |

---
## STRUCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT struct(id, name) AS s FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | struct<id integer, name text> | expression |

---
## JSON 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT json_value(data, '$.name') AS n, parse_json(data) AS p, to_json(struct(id, name)) AS j FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | VARCHAR(255) | expression |
| p | VARCHAR(4000) | expression |
| j | VARCHAR(4000) | expression |

---
## 日時関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT
  to_char(created_at, 'YYYY-MM') AS ym,
  date_trunc('month', created_at) AS m,
  extract(year FROM created_at) AS y,
  last_day(created_at) AS ld
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ym | VARCHAR(255) | expression |
| m | TIMESTAMP | expression |
| y | INTEGER | expression |
| ld | DATE | expression |

---
## 正規表現・文字列

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT
  coalesce(name, 'x') AS n,
  regexp_like(name, '[A-Z]+') AS rl,
  regexp_matches(name, '[A-Z]+') AS rm,
  split_part(name, '-', 1) AS part
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
| rl | BOOLEAN | expression |
| rm | array<text> | expression |
| part | VARCHAR(255) | expression |

---
## 型変換

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
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
dialect: drill
```

```sql
SELECT version() AS v, user() AS u, current_schema() AS cs, current_database() AS cd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | VARCHAR(255) | expression |
| u | VARCHAR(255) | expression |
| cs | VARCHAR(255) | expression |
| cd | VARCHAR(255) | expression |

---

# タイムトラベル

---

## FOR SYSTEM_TIME AS OF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
```

```sql
SELECT id FROM users FOR SYSTEM_TIME AS OF TIMESTAMP '2024-01-01 00:00:00'
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

# テーブル関数

---

## table(path => ...)

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: drill
```

```sql
SELECT * FROM table(path => 's3://bucket/file.parquet')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table | unknown | table.table |

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
dialect: drill
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
dialect: drill
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
dialect: drill
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
dialect: drill
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

[SHOW commands](https://drill.apache.org/docs/show/)

---

## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: drill
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
dialect: drill
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
dialect: drill
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
## SHOW FILES

データレイク上のファイル一覧を返す Drill 固有コマンドです。

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: drill
```

```sql
SHOW FILES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | cast |
| isDirectory | BOOLEAN | cast |
| isFile | BOOLEAN | cast |
| length | INTEGER | cast |
| owner | VARCHAR(255) | cast |
| group | VARCHAR(255) | cast |
| permissions | VARCHAR(255) | cast |
| accessTime | TIMESTAMP | cast |
| modificationTime | TIMESTAMP | cast |

---
## SHOW CATALOGS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: drill
```

```sql
SHOW CATALOGS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Catalog | VARCHAR(255) | cast |

---
## SHOW FUNCTIONS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: drill
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
## SHOW VIEWS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: drill
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
| View | VARCHAR(255) | cast |

---
## SHOW USER

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: drill
```

```sql
SHOW USER
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| user | VARCHAR(255) | cast |

---
## SHOW CREATE TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: drill
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
| Table | VARCHAR(255) | cast |
| Create Table | VARCHAR(255) | cast |

---
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
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
dialect: drill
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
