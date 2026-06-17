# Presto テストケース

このドキュメントは [Presto 公式ドキュメント](https://prestodb.io/docs/current/sql/select.html) に基づき、`sqldesc` が Presto 方言（`--dialect presto`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/presto.md`）。

```yaml
doc: sqldesc-test/v1
dialect: presto
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / OFFSET / LIMIT、`* EXCEPT` |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句、approx_distinct / approx_percentile、arbitrary / any_value / array_agg |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、NTILE、dense_rank / cume_dist、ウィンドウ集約 |
| 複合行ソース | VALUES、UNNEST、CROSS JOIN UNNEST、**sequence** |
| 型・関数 | ARRAY / MAP、配列高階関数、JSON、日時関数、regexp / safe_divide、hll_hash / to_bitmap、reduce |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、EXCEPT、UNION、INTERSECT |
| メタデータ | SHOW SCHEMAS / TABLES / COLUMNS、DESCRIBE、SHOW FUNCTIONS、EXPLAIN、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Presto SELECT](https://prestodb.io/docs/current/sql/select.html) |
| 関数 | [Presto functions](https://prestodb.io/docs/current/functions.html) |
| 配列 | [Array functions](https://prestodb.io/docs/current/functions/array.html) |
| JSON | [JSON functions](https://prestodb.io/docs/current/functions/json.html) |
| sequence | [sequence table function](https://prestodb.io/docs/current/functions/sequence.html) |
| メタデータ | [SHOW](https://prestodb.io/docs/current/sql/show.html) |

Docker 検証:

- `docker.io/prestodb/presto:latest` を起動し、HTTP（ポート **8080**）、カタログ `memory`、スキーマ `default` で接続する。
- 一括検証: `node scripts/verify-presto-doc.mjs`

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: presto
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  data JSON,
  tags array<varchar>,
  attrs map<varchar, varchar>,
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

[Presto SELECT](https://prestodb.io/docs/current/sql/select.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| name | varchar | users.name |
| amount | decimal | users.amount |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| name | varchar | users.name |
| age | integer | users.age |
| dept | varchar | users.dept |
| amount | decimal | users.amount |
| data | json | users.data |
| tags | array(varchar) | users.tags |
| attrs | map(varchar, varchar) | users.attrs |
| created_at | timestamp(3) | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: presto
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
| label | varchar(1) | literal |
| ok | boolean | expression |

---
## ORDER BY / OFFSET / LIMIT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT id FROM users ORDER BY id LIMIT 10
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
## TC-star-except: `*` EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT id, name, amount, data, tags, attrs, created_at FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| name | varchar | users.name |
| amount | decimal | users.amount |
| data | json | users.data |
| tags | array(varchar) | users.tags |
| attrs | map(varchar, varchar) | users.attrs |
| created_at | timestamp(3) | users.created_at |

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
dialect: presto
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
| amount | decimal | orders.amount |

---

# 集約

[Presto aggregate functions](https://prestodb.io/docs/current/functions/aggregate.html)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| dept | varchar | users.dept |
| cnt | bigint | expression |
| total | decimal | expression |

---
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| dept | varchar | users.dept |
| adult_cnt | bigint | expression |

---
## approx_distinct / approx_percentile

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT approx_distinct(name) AS ad, approx_percentile(amount, 0.5) AS ap FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ad | bigint | expression |
| ap | decimal | expression |

---
## arbitrary / any_value / array_agg

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT arbitrary(name) AS ar, any_value(amount) AS av, array_agg(name) AS names FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ar | varchar | expression |
| av | decimal | expression |
| names | array(varchar) | expression |

---

# ウィンドウ関数

[Presto window functions](https://prestodb.io/docs/current/functions/window.html)

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| rn | bigint | expression |

---
## RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| rk | bigint | expression |

---
## LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| prev | decimal | expression |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| quartile | bigint | expression |

---
## dense_rank / cume_dist

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| dr | bigint | expression |
| cd | decimal | expression |

---
## ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| running | decimal | polyglot |

---

# 複合行ソース

[Presto VALUES](https://prestodb.io/docs/current/sql/values.html)、[UNNEST](https://prestodb.io/docs/current/sql/select.html#unnest)

---

## VALUES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: presto
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
| name | varchar | t.name |

---
## CROSS JOIN UNNEST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| tag | varchar | t.tag |

---
## UNNEST

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: presto
```

```sql
SELECT * FROM UNNEST(ARRAY[1, 2, 3]) AS t(n)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | integer | t.n |

---
## sequence

[sequence table function](https://prestodb.io/docs/current/functions/sequence.html)

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: presto
```

```sql
SELECT n FROM UNNEST(sequence(1, 5)) AS t(n)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | integer | t.n |

---

# 型・関数

[Presto data types](https://prestodb.io/docs/current/language/types.html)

---

## ARRAY / MAP / 配列高階関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT tags, cardinality(tags) AS cnt, transform(tags, x -> upper(x)) AS tx, element_at(tags, 1) AS e1, array_join(tags, ',') AS aj, map(ARRAY[1, 2], ARRAY['a', 'b']) AS m FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tags | array(varchar) | users.tags |
| cnt | integer | expression |
| tx | array(varchar) | expression |
| e1 | varchar | expression |
| aj | varchar | expression |
| m | map(integer, varchar) | expression |

---
## reduce

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT reduce(tags, 0, (s, x) -> s + length(x), s -> s) AS rd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rd | integer | expression |

---
## JSON

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT json_extract_scalar(data, '$.x') AS jv, json_extract(data, '$.y') AS jq, json_parse('{"a":1}') AS pj FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jv | varchar | users.data.$.x |
| jq | json | expression |
| pj | varchar | polyglot |

---
## 日時関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT date_trunc('month', created_at) AS dt, date_diff('day', created_at, current_timestamp) AS dd, date_format(created_at, '%Y-%m') AS fm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dt | timestamp(3) | expression |
| dd | integer | expression |
| fm | varchar | polyglot |

---
## regexp / safe_divide

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT regexp_extract(name, '[A-Z]+') AS re, CASE WHEN age = 0 THEN NULL ELSE amount / age END AS sd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| re | varchar | expression |
| sd | decimal | expression |

---
## hll_hash / to_bitmap

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT approx_set(name) AS hh, checksum(id) AS tb FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| hh | hyperloglog | expression |
| tb | integer | expression |

---
## current_date / gen_random_uuid

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
```

```sql
SELECT current_date AS cd, current_timestamp AS ct, uuid() AS uuid FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cd | date | polyglot |
| ct | timestamp(3) | expression |
| uuid | uuid | expression |

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
dialect: presto
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
| name | varchar | cte.name |

---
## 相関副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| name | varchar | users.name |
| max_order | decimal | expression |

---
## TC-set-except: EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
dialect: presto
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
dialect: presto
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

# メタデータ

---

## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: presto
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
| Table | varchar | cast |

---
## SHOW SCHEMAS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: presto
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
| Schema | varchar | cast |

---
## SHOW COLUMNS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| Column | varchar | cast |
| Type | varchar | cast |
| Extra | varchar | cast |
| Comment | varchar | cast |
| Precision | varchar | cast |
| Scale | varchar | cast |
| Length | varchar | cast |

---
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| Column | varchar | cast |
| Type | varchar | cast |
| Extra | varchar | cast |
| Comment | varchar | cast |
| Precision | varchar | cast |
| Scale | varchar | cast |
| Length | varchar | cast |

---
## SHOW FUNCTIONS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: presto
```

```sql
SHOW FUNCTIONS LIKE 'abs'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Function | varchar | cast |
| Return Type | varchar | cast |
| Argument Types | varchar | cast |
| Function Type | varchar | cast |
| Deterministic | varchar | cast |
| Description | varchar | cast |
| Variable Arity | varchar | cast |
| Built In | varchar | cast |
| Temporary | varchar | cast |
| Language | varchar | cast |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| Query Plan | varchar | cast |

---
## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: presto
```

```sql
SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'default'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | varchar | information_schema.tables.table_name |
| table_type | varchar | information_schema.tables.table_type |

---
## information_schema.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: presto
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
| column_name | varchar | information_schema.columns.column_name |
| data_type | varchar | information_schema.columns.data_type |

---
