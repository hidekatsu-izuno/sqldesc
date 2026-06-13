# Amazon Athena テストケース

このドキュメントは [Amazon Athena 公式ドキュメント](https://docs.aws.amazon.com/athena/latest/ug/querying-athena-tables.html) に基づき、`sqldesc` が Amazon Athena 方言（`--dialect athena`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/athena.md`）。

```yaml
doc: sqldesc-test/v1
dialect: athena
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / OFFSET / LIMIT |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句、近似集約関数 |
| ウィンドウ関数 | ROW_NUMBER、RANK |
| 複合行ソース | VALUES、UNNEST、CROSS JOIN UNNEST、sequence + UNNEST |
| 型・関数 | ARRAY / MAP、JSON、配列高階関数、日時関数、文字列・型変換 |
| 副問い合わせ・集合演算 | CTE（WITH）、EXCEPT |
| メタデータ | SHOW DATABASES、SHOW TABLES、DESCRIBE、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT 基本 | [Amazon Athena SELECT](https://docs.aws.amazon.com/athena/latest/ug/querying-athena-tables.html) |
| 関数 | [Presto 関数リファレンス](https://prestodb.io/docs/current/functions.html)（Athena エンジン互換） |
| 配列 | [Array functions and operators](https://prestodb.io/docs/current/functions/array.html) |
| JSON | [JSON functions and operators](https://prestodb.io/docs/current/functions/json.html) |
| メタデータ | [SHOW DATABASES](https://docs.aws.amazon.com/athena/latest/ug/show-databases.html)、[SHOW TABLES](https://docs.aws.amazon.com/athena/latest/ug/show-tables.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: athena
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

[Amazon Athena SELECT](https://docs.aws.amazon.com/athena/latest/ug/querying-athena-tables.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
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
dialect: athena
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
dialect: athena
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
dialect: athena
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

# JOIN

[Amazon Athena SELECT - joins](https://docs.aws.amazon.com/athena/latest/ug/querying-athena-tables.html)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
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
dialect: athena
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
| dept | varchar | users.dept |
| n | bigint | expression |
| total | decimal | expression |

---
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
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
| adults | bigint | expression |

---
## approx_distinct / approx_percentile

Athena でよく使う近似集約関数です。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
```

```sql
SELECT approx_distinct(dept) AS ad, approx_percentile(amount, 0.5) AS p50 FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ad | bigint | expression |
| p50 | decimal | expression |

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
dialect: athena
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
| rn | bigint | expression |

---
## RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
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
| r | bigint | expression |

---

# 複合行ソース

[Presto VALUES](https://prestodb.io/docs/current/sql/values.html)、[UNNEST](https://prestodb.io/docs/current/sql/select.html#unnest)

---

## VALUES 派生テーブル

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: athena
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
| label | varchar | t.label |

---
## UNNEST

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: athena
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
## CROSS JOIN UNNEST（配列列の展開）

Athena で配列型カラムを行に展開する典型的なパターンです。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
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
## sequence + UNNEST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
```

```sql
SELECT x FROM users CROSS JOIN UNNEST(sequence(1, 3)) AS t(x)
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

# 型・関数

[Presto data types](https://prestodb.io/docs/current/language/types.html)

---

## ARRAY / MAP

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: athena
```

```sql
SELECT ARRAY[1, 2, 3] AS nums, MAP(ARRAY['a'], ARRAY[1]) AS m
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nums | array(integer) | expression |
| m | map(varchar, integer) | expression |

---
## JSON 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
```

```sql
SELECT json_extract(data, '$.name') AS name_json, json_extract_scalar(data, '$.name') AS name_text FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name_json | json | expression |
| name_text | varchar | users.data.$.name |

---
## 配列高階関数（transform / filter / reduce）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
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
| upper_tags | array(varchar) | expression |
| filtered | array(varchar) | expression |
| joined | varchar | expression |

---
## MAP 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
```

```sql
SELECT element_at(attrs, 'key') AS v, map_keys(attrs) AS keys FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | varchar | expression |
| keys | array(varchar) | expression |

---
## 日時関数

Athena（Presto 互換）の日時パース・整形・差分計算です。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
```

```sql
SELECT
  date_parse('2024-01-01', '%Y-%m-%d') AS d,
  date_format(created_at, '%Y-%m') AS ym,
  date_diff('day', created_at, current_timestamp) AS days
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| d | timestamp(3) | expression |
| ym | varchar | polyglot |
| days | integer | expression |

---
## 文字列・型変換

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
```

```sql
SELECT
  TRY_CAST(name AS integer) AS n,
  CAST(amount AS double) AS amt,
  regexp_extract(name, '[A-Z]+') AS m,
  coalesce(name, 'unknown') AS label,
  CASE WHEN age >= 20 THEN 'adult' ELSE 'minor' END AS cat
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | integer | polyglot |
| amt | double | polyglot |
| m | varchar | expression |
| label | varchar | expression |
| cat | varchar | expression |

---
## 特殊列・配列述語

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
```

```sql
SELECT current_date AS today, current_timestamp AS now, cardinality(tags) AS tc, contains(tags, 'vip') AS is_vip FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| today | date | polyglot |
| now | timestamp(3) | expression |
| tc | integer | expression |
| is_vip | boolean | expression |

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
dialect: athena
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
dialect: athena
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

# メタデータ

[SHOW DATABASES](https://docs.aws.amazon.com/athena/latest/ug/show-databases.html)、[SHOW TABLES](https://docs.aws.amazon.com/athena/latest/ug/show-tables.html)

---

## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: athena
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
| Database | varchar | cast |

---
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: athena
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
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
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
| name | varchar | users.name |
| age | integer | users.age |
| dept | varchar | users.dept |
| amount | decimal | users.amount |
| data | json | users.data |
| tags | array(varchar) | users.tags |
| attrs | map(varchar, varchar) | users.attrs |
| created_at | timestamp(3) | users.created_at |

---
## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: athena
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
| table_name | varchar | information_schema.tables.table_name |

---
## information_schema.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: athena
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
| column_name | varchar | information_schema.columns.column_name |
| data_type | varchar | information_schema.columns.data_type |

---
