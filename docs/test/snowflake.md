# Snowflake テストケース

このドキュメントは [Snowflake 公式ドキュメント](https://docs.snowflake.com/en/sql-reference/constructs/select) に基づき、`sqldesc` が Snowflake 方言（`--dialect snowflake`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/snowflake.md`）。

```yaml
doc: sqldesc-test/v1
dialect: snowflake
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、DISTINCT |
| JOIN | INNER JOIN、LEFT JOIN |
| 集約 | GROUP BY / HAVING、**LISTAGG**、**ARRAY_AGG**、AVG |
| ウィンドウ関数 | ROW_NUMBER / RANK / LAG / ウィンドウ集約、NTILE / dense_rank、**ratio_to_report** |
| VARIANT / JSON / 配列 | VARIANT パス、PARSE_JSON、**FLATTEN**、object_construct / array_construct、split / array_size、配列添字 |
| テーブル関数 | **GENERATOR**、**seq4** / seq8、**GETNEXTVAL**、**split_to_table** |
| Snowflake 固有構文 | **QUALIFY**、**SAMPLE** / TABLESAMPLE、**AT** / **BEFORE** / **CHANGES**、**PIVOT**、**MATCH_RECOGNIZE** |
| 型・関数 | IFF / COALESCE / DATEADD、CASE、TRY_TO_NUMBER、hash / uuid_string、current_* / CURRENT_*、**hll_hash** / **to_bitmap** |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、**MINUS**、UNION、INTERSECT / EXCEPT、VALUES |
| メタデータ・カタログ | SHOW TABLES / DATABASES / SCHEMAS / WAREHOUSES / STREAMS / PIPES / TASKS / DYNAMIC TABLES、DESCRIBE TABLE / WAREHOUSE / STREAM / PIPE、**LIST @stage**、EXPLAIN、information_schema、**account_usage** |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Snowflake SELECT](https://docs.snowflake.com/en/sql-reference/constructs/select) |
| VARIANT | [Semi-structured data](https://docs.snowflake.com/en/sql-reference/data-types-semistructured) |
| FLATTEN | [FLATTEN](https://docs.snowflake.com/en/sql-reference/functions/flatten) |
| GENERATOR | [GENERATOR](https://docs.snowflake.com/en/sql-reference/functions/generator) |
| SEQ | [SEQ1 / SEQ2 / SEQ4 / SEQ8](https://docs.snowflake.com/en/sql-reference/functions/seq1) |
| QUALIFY | [QUALIFY](https://docs.snowflake.com/en/sql-reference/constructs/qualify) |
| 時間旅行 | [Time Travel](https://docs.snowflake.com/en/sql-reference/constructs/at-before) |
| PIVOT | [PIVOT](https://docs.snowflake.com/en/sql-reference/constructs/pivot) |
| MATCH_RECOGNIZE | [MATCH_RECOGNIZE](https://docs.snowflake.com/en/sql-reference/constructs/match_recognize) |
| メタデータ | [SHOW](https://docs.snowflake.com/en/sql-reference/sql/show) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: snowflake
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

[Snowflake SELECT](https://docs.snowflake.com/en/sql-reference/constructs/select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
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
dialect: snowflake
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
| created_at | TIMESTAMP | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
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
dialect: snowflake
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
dialect: snowflake
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
dialect: snowflake
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
## LEFT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT u.id, o.amount FROM users u LEFT JOIN orders o ON u.id = o.user_id
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
dialect: snowflake
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
## LISTAGG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT dept, LISTAGG(name, ',') WITHIN GROUP (ORDER BY name) AS la FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| la | VARCHAR(255) | expression |

---
## ARRAY_AGG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT dept, ARRAY_AGG(name) AS aa FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| aa | array<text> | expression |

---
## AVG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT dept, AVG(amount) AS avg_amt FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| avg_amt | DECIMAL | expression |

---

# ウィンドウ関数

---

## ROW_NUMBER / RANK / LAG / ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT id, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY amount) AS rn, RANK() OVER (ORDER BY amount) AS rk, LAG(amount) OVER (ORDER BY id) AS prev, SUM(amount) OVER (PARTITION BY dept ORDER BY id) AS running FROM users
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
| running | DECIMAL | polyglot |

---
## NTILE / dense_rank

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT id, NTILE(4) OVER (ORDER BY amount) AS q, dense_rank() OVER (ORDER BY amount) AS dr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| q | INTEGER | expression |
| dr | INTEGER | expression |

---
## ratio_to_report

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT ratio_to_report(amount) OVER (PARTITION BY dept) AS rr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rr | DECIMAL | expression |

---

# VARIANT / JSON / 配列

---

## VARIANT パス / PARSE_JSON

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT data:x::varchar AS jv, PARSE_JSON(data) AS pj, data:city::string AS city FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jv | VARCHAR(255) | polyglot |
| pj | VARCHAR(4000) | expression |
| city | VARCHAR(255) | polyglot |

---
## FLATTEN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT f.value, f.key FROM users u, LATERAL FLATTEN(input => u.data) f
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| value | variant | f.value |
| key | VARCHAR(255) | f.key |

---
## object_construct / array_construct

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT object_construct('id', id, 'name', name) AS obj, array_construct(id, age) AS arr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| obj | object | expression |
| arr | array<integer> | expression |

---
## split / array_size

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT split(name, ',') AS s, array_size(split(name, ',')) AS n FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | array<text> | expression |
| n | INTEGER | expression |

---
## 配列添字

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT name, tags[0]::varchar AS first_tag FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | users.name |
| first_tag | VARCHAR(255) | polyglot |

---

# テーブル関数

[GENERATOR](https://docs.snowflake.com/en/sql-reference/functions/generator)

---

## GENERATOR（列なし）

Snowflake の GENERATOR は行数のみを供給し、列は投影句の関数（`seq4()` 等）で決まります。`SELECT *` は 0 列です。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT * FROM TABLE(GENERATOR(ROWCOUNT => 5)) g
```

### Then

```yaml
kind: none
verify: true
```

- `columns`: 空

---
## seq4 / seq8

[SEQ1 / SEQ2 / SEQ4 / SEQ8](https://docs.snowflake.com/en/sql-reference/functions/seq1)

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT seq4() AS s, seq8() AS s8 FROM TABLE(GENERATOR(ROWCOUNT => 3)) g
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | INTEGER | expression |
| s8 | INTEGER | expression |

---
## GETNEXTVAL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT u.id, s.nextval FROM users u, TABLE(GETNEXTVAL(seq1)) s
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| nextval | INTEGER | s.nextval |

---
## split_to_table

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT f.seq, f.value FROM users u, TABLE(split_to_table(u.name, ',')) f
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| seq | INTEGER | f.seq |
| value | VARCHAR(255) | f.value |

---

# Snowflake 固有構文

---

## QUALIFY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT id, row_number() over(order by age) rn FROM users qualify rn = 1
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
## SAMPLE / TABLESAMPLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT * FROM users TABLESAMPLE (10 ROWS)
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
| created_at | TIMESTAMP | users.created_at |

---
## AT（時間旅行）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT * FROM users AT (TIMESTAMP => '2024-01-01 00:00:00'::timestamp)
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
| created_at | TIMESTAMP | users.created_at |

---
## BEFORE（時間旅行）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT * FROM users BEFORE (TIMESTAMP => '2024-01-01 00:00:00'::timestamp)
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
| created_at | TIMESTAMP | users.created_at |

---
## CHANGES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT * FROM users CHANGES (INFORMATION => DEFAULT) AT (TIMESTAMP => '2024-01-01 00:00:00'::timestamp)
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
| created_at | TIMESTAMP | users.created_at |

---
## PIVOT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT * FROM users PIVOT (SUM(amount) FOR dept IN ('A', 'B'))
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
| data | VARCHAR(4000) | users.data |
| tags | array<text> | users.tags |
| created_at | TIMESTAMP | users.created_at |
| A | DECIMAL | users.A |
| B | DECIMAL | users.B |

---
## MATCH_RECOGNIZE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT * FROM users MATCH_RECOGNIZE (PARTITION BY dept ORDER BY created_at MEASURES FIRST(name) AS first_name PATTERN (A B) DEFINE A AS amount > 0, B AS amount > 10)
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
| created_at | TIMESTAMP | users.created_at |
| first_name | VARCHAR(255) | users.first_name |

---

# 型・関数

---

## IFF / COALESCE / DATEADD

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT IFF(age > 30, 'senior', 'junior') AS tier, COALESCE(name, 'unknown') AS nm, DATEADD(day, 1, created_at) AS da FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tier | VARCHAR(255) | expression |
| nm | VARCHAR(255) | expression |
| da | TIMESTAMP | expression |

---
## CASE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT id, CASE WHEN age >= 30 THEN 'senior' ELSE 'junior' END AS tier FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| tier | VARCHAR(255) | expression |

---
## TRY_TO_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT TRY_TO_NUMBER(name) AS n FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | DECIMAL | expression |

---
## hash / uuid_string

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT hash(name) AS h, uuid_string() AS u FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| h | INTEGER | expression |
| u | VARCHAR(36) | expression |

---
## current_version / current_account

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT current_version() AS cv, current_account() AS ca FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cv | VARCHAR(255) | expression |
| ca | VARCHAR(255) | expression |

---
## CURRENT_WAREHOUSE / CURRENT_ROLE / CURRENT_DATABASE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT CURRENT_WAREHOUSE() AS wh, CURRENT_ROLE() AS role, CURRENT_DATABASE() AS db FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| wh | VARCHAR(255) | expression |
| role | VARCHAR(255) | expression |
| db | VARCHAR(255) | expression |

---
## hll_hash / to_bitmap

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT hll_hash(name) AS h, to_bitmap(id) AS b FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| h | hll | expression |
| b | bitmap | expression |

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
dialect: snowflake
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
dialect: snowflake
```

```sql
SELECT id, (SELECT MAX(amount) FROM orders o WHERE o.user_id = u.id) AS max_order FROM users u
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| max_order | DECIMAL | expression |

---
## MINUS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT id FROM users MINUS SELECT user_id AS id FROM orders
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
dialect: snowflake
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
dialect: snowflake
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
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
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
## VALUES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
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

# メタデータ・カタログ

---

## SHOW TABLES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
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
| created_on | TIMESTAMP | cast |
| name | VARCHAR(255) | cast |
| database_name | VARCHAR(255) | cast |
| schema_name | VARCHAR(255) | cast |
| kind | VARCHAR(255) | cast |
| comment | VARCHAR(255) | cast |
| cluster_by | VARCHAR(255) | cast |
| rows | INTEGER | cast |
| bytes | INTEGER | cast |
| owner | VARCHAR(255) | cast |
| retention_time | INTEGER | cast |
| automatic_clustering | VARCHAR(255) | cast |
| change_tracking | BOOLEAN | cast |
| search_optimization | BOOLEAN | cast |

---
## SHOW DATABASES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
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
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
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
## SHOW WAREHOUSES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SHOW WAREHOUSES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | cast |
| state | VARCHAR(255) | cast |
| type | VARCHAR(255) | cast |
| size | VARCHAR(255) | cast |
| min_cluster_count | INTEGER | cast |
| max_cluster_count | INTEGER | cast |
| started_clusters | INTEGER | cast |
| running | INTEGER | cast |
| queued | INTEGER | cast |
| is_default | BOOLEAN | cast |
| is_current | BOOLEAN | cast |
| auto_suspend | INTEGER | cast |
| auto_resume | BOOLEAN | cast |

---
## SHOW STREAMS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SHOW STREAMS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| created_on | TIMESTAMP | cast |
| name | VARCHAR(255) | cast |
| database_name | VARCHAR(255) | cast |
| schema_name | VARCHAR(255) | cast |
| owner | VARCHAR(255) | cast |
| table_name | VARCHAR(255) | cast |
| source_type | VARCHAR(255) | cast |
| base_tables | VARCHAR(255) | cast |
| type | VARCHAR(255) | cast |
| stale | BOOLEAN | cast |
| mode | VARCHAR(255) | cast |
| comment | VARCHAR(255) | cast |

---
## SHOW PIPES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SHOW PIPES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| created_on | TIMESTAMP | cast |
| name | VARCHAR(255) | cast |
| database_name | VARCHAR(255) | cast |
| schema_name | VARCHAR(255) | cast |
| definition | VARCHAR(255) | cast |
| owner | VARCHAR(255) | cast |
| notification_channel | VARCHAR(255) | cast |
| comment | VARCHAR(255) | cast |

---
## SHOW TASKS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SHOW TASKS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| created_on | TIMESTAMP | cast |
| name | VARCHAR(255) | cast |
| id | VARCHAR(255) | cast |
| database_name | VARCHAR(255) | cast |
| schema_name | VARCHAR(255) | cast |
| owner | VARCHAR(255) | cast |
| comment | VARCHAR(255) | cast |
| warehouse | VARCHAR(255) | cast |
| schedule | VARCHAR(255) | cast |
| state | VARCHAR(255) | cast |
| definition | VARCHAR(255) | cast |
| condition | VARCHAR(255) | cast |

---
## SHOW DYNAMIC TABLES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SHOW DYNAMIC TABLES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| created_on | TIMESTAMP | cast |
| name | VARCHAR(255) | cast |
| database_name | VARCHAR(255) | cast |
| schema_name | VARCHAR(255) | cast |
| cluster_by | VARCHAR(255) | cast |
| rows | INTEGER | cast |
| bytes | INTEGER | cast |
| owner | VARCHAR(255) | cast |
| target_lag | VARCHAR(255) | cast |
| warehouse | VARCHAR(255) | cast |
| scheduling_state | VARCHAR(255) | cast |
| comment | VARCHAR(255) | cast |

---
## DESCRIBE TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
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
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |
| age | INTEGER | users.age |
| dept | VARCHAR(255) | users.dept |
| amount | DECIMAL | users.amount |
| data | VARCHAR(4000) | users.data |
| tags | array<text> | users.tags |
| created_at | TIMESTAMP | users.created_at |

---
## DESCRIBE WAREHOUSE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
DESCRIBE WAREHOUSE my_wh
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| property | VARCHAR(255) | cast |
| value | VARCHAR(255) | cast |
| default | VARCHAR(255) | cast |
| level | VARCHAR(255) | cast |
| description | VARCHAR(255) | cast |

---
## DESCRIBE STREAM

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
DESCRIBE STREAM my_stream
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| property | VARCHAR(255) | cast |
| value | VARCHAR(255) | cast |

---
## DESCRIBE PIPE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
DESCRIBE PIPE my_pipe
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| property | VARCHAR(255) | cast |
| value | VARCHAR(255) | cast |

---
## LIST @stage

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
LIST @mystage
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | cast |
| size | INTEGER | cast |
| md5 | VARCHAR(255) | cast |
| last_modified | TIMESTAMP | cast |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
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
## information_schema.tables

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema = 'PUBLIC'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | VARCHAR(255) | information_schema.tables.table_name |
| table_schema | VARCHAR(255) | information_schema.tables.table_schema |

---
## information_schema.columns

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'USERS'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_name | VARCHAR(255) | information_schema.columns.column_name |
| data_type | VARCHAR(255) | information_schema.columns.data_type |

---
## information_schema.warehouses

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT warehouse_name, state FROM information_schema.warehouses
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| warehouse_name | VARCHAR(255) | information_schema.warehouses.warehouse_name |
| state | VARCHAR(255) | information_schema.warehouses.state |

---
## account_usage.query_history

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
```

```sql
SELECT query_id, execution_status FROM account_usage.query_history
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| query_id | VARCHAR(255) | account_usage.query_history.query_id |
| execution_status | VARCHAR(255) | account_usage.query_history.execution_status |

---
