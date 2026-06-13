# Apache Hive テストケース

このドキュメントは [Apache Hive 公式ドキュメント](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+Select) に基づき、`sqldesc` が Apache Hive 方言（`--dialect hive`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/hive.md`）。

```yaml
doc: sqldesc-test/v1
dialect: hive
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、collect_list / collect_set、percentile_approx、GROUP BY CUBE / GROUPING SETS |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、NTILE、dense_rank / cume_dist、ウィンドウ集約 |
| **LATERAL VIEW** | **explode**、**OUTER explode**、**posexplode**、explode テーブル関数 |
| 複合行ソース | VALUES、CROSS JOIN UNNEST、**stack** |
| 分散・サンプリング | **CLUSTER BY**、**DISTRIBUTE BY / SORT BY**、**TABLESAMPLE** |
| 型・関数 | ARRAY / MAP / STRUCT、get_json_object、RLIKE、日時、nvl / if、hash / sha2 |
| セッション関数 | current_database / current_user / version、pmod / conv |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、EXCEPT、UNION、INTERSECT |
| メタデータ | SHOW DATABASES / TABLES、DESCRIBE、DESCRIBE FUNCTION、EXPLAIN |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [LanguageManual Select](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+Select) |
| LATERAL VIEW | [LanguageManual LateralView](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+LateralView) |
| 複合型 | [Complex Types](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+Types) |
| 関数 | [LanguageManual UDF](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF) |
| 集約 | [LanguageManual GroupBy](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+GroupBy) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: hive
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  data VARCHAR(4000),
  tags array<string>,
  attrs map<string, string>,
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

[Apache Hive SELECT](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+Select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
dialect: hive
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
| data | varchar(4000) | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, text> | users.attrs |
| created_at | TIMESTAMP | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: hive
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
## ORDER BY / LIMIT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
dialect: hive
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
dialect: hive
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
## collect_list / collect_set

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT dept, collect_list(name) AS names, collect_set(dept) AS ds FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| names | array<text> | expression |
| ds | array<text> | expression |

---
## percentile_approx

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT percentile_approx(amount, 0.5) AS pa FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| pa | DECIMAL | expression |

---
## GROUP BY CUBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT dept, amount FROM users GROUP BY dept, amount WITH CUBE
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| amount | DECIMAL | users.amount |

---
## GROUPING SETS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT dept, amount FROM users GROUP BY dept, amount GROUPING SETS ((dept), (amount), ())
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| amount | DECIMAL | users.amount |

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
dialect: hive
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
dialect: hive
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
| id | INTEGER | users.id |
| rk | INTEGER | expression |

---
## LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
| id | INTEGER | users.id |
| prev | DECIMAL | expression |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
| id | INTEGER | users.id |
| quartile | INTEGER | expression |

---
## dense_rank / cume_dist

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
| id | INTEGER | users.id |
| dr | INTEGER | expression |
| cd | DECIMAL | expression |

---
## ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
| id | INTEGER | users.id |
| running | DECIMAL | polyglot |

---

# LATERAL VIEW

[LanguageManual LateralView](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+LateralView)

---

## explode

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT id, tag FROM users LATERAL VIEW explode(tags) t AS tag
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
## OUTER explode

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT id, tag FROM users LATERAL VIEW OUTER explode(tags) t AS tag
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
## posexplode

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT id, pos, tag FROM users LATERAL VIEW posexplode(tags) t AS pos, tag
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| pos | INTEGER | t.pos |
| tag | VARCHAR(255) | t.tag |

---
## explode テーブル関数

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: hive
```

```sql
SELECT * FROM explode(array(1, 2, 3)) AS t(col)
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

# 複合行ソース

---

## VALUES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: hive
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
## CROSS JOIN UNNEST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
## stack

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: hive
```

```sql
SELECT * FROM stack(2, 'a', 1, 'b', 2) AS s(key, val)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| key | VARCHAR(255) | s.key |
| val | INTEGER | s.val |

---

# 分散・サンプリング

---

## CLUSTER BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT id FROM users CLUSTER BY dept
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
## DISTRIBUTE BY / SORT BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT id FROM users DISTRIBUTE BY dept SORT BY id
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
dialect: hive
```

```sql
SELECT * FROM users TABLESAMPLE(10 PERCENT)
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
| data | varchar(4000) | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, text> | users.attrs |
| created_at | TIMESTAMP | users.created_at |

---

# 型・関数

---

## ARRAY / MAP / STRUCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT tags, size(tags) AS sz, transform(tags, x -> upper(x)) AS tx, attrs, map_keys(attrs) AS mk, map_values(attrs) AS mv, named_struct('id', id, 'name', name) AS ns FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tags | array<text> | users.tags |
| sz | INTEGER | expression |
| tx | array<text> | expression |
| attrs | map<text, text> | users.attrs |
| mk | array<text> | expression |
| mv | array<text> | expression |
| ns | struct<id integer, name text> | expression |

---
## get_json_object / RLIKE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT get_json_object(data, '$.x') AS gj, regexp_extract(name, '[A-Z]+') AS re, name RLIKE '^[A-Z]' AS rl FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| gj | VARCHAR(255) | expression |
| re | VARCHAR(255) | expression |
| rl | BOOLEAN | expression |

---
## 日時関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT unix_timestamp(created_at) AS ut, from_unixtime(unix_timestamp(created_at)) AS fu, datediff(created_at, current_timestamp) AS dd, year(created_at) AS y, month(created_at) AS m, day(created_at) AS d FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ut | INTEGER | expression |
| fu | TIMESTAMP | expression |
| dd | INTEGER | expression |
| y | INTEGER | expression |
| m | INTEGER | expression |
| d | INTEGER | expression |

---
## nvl / if

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT nvl(amount, 0) AS na, if(age > 30, 'senior', 'junior') AS tier FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| na | DECIMAL | expression |
| tier | VARCHAR(255) | expression |

---
## hash / sha2

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT hash(name) AS h, sha2(name, 256) AS s FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| h | INTEGER | expression |
| s | VARCHAR(255) | expression |

---

# セッション関数

---

## current_database / version / pmod / conv

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
```

```sql
SELECT current_database() AS db, current_user() AS cu, version() AS ver, pmod(age, 2) AS pm, conv(name, 10, 16) AS cv FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| db | VARCHAR(255) | expression |
| cu | VARCHAR(255) | expression |
| ver | VARCHAR(255) | expression |
| pm | INTEGER | expression |
| cv | VARCHAR(255) | expression |

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
dialect: hive
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
dialect: hive
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
| name | VARCHAR(255) | users.name |
| max_order | DECIMAL | expression |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
| id | INTEGER | cast |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
| id | INTEGER | cast |

---

# メタデータ

---

## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: hive
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
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: hive
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
dialect: hive
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
| data | varchar(4000) | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, text> | users.attrs |
| created_at | TIMESTAMP | users.created_at |

---
## DESCRIBE FUNCTION

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: hive
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
| Name | VARCHAR(255) | cast |
| Description | VARCHAR(255) | cast |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
