# PostgreSQL テストケース

このドキュメントは [PostgreSQL 公式ドキュメント](https://www.postgresql.org/docs/current/index.html) に基づき、`sqldesc` が PostgreSQL 方言（`--dialect postgres`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは [Given-When-Then](https://en.wikipedia.org/wiki/Given-When-Then) 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc` / `npm run test:doc:file -- docs/test/postgresql.md`）。

```yaml
doc: sqldesc-test/v1
dialect: postgres
```

## ドキュメント形式（sqldesc-test/v1）

`sqlite.md` と同じ [sqldesc-test/v1](sqlite.md) 形式です。`dialect` は `postgres`（内部では `postgresql` に正規化）を指定します。

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、DISTINCT、DISTINCT ON、FETCH FIRST、TABLESAMPLE |
| JOIN | INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL OUTER JOIN、CROSS JOIN、NATURAL JOIN、JOIN USING |
| サブクエリ | IN サブクエリ、EXISTS、NOT EXISTS、スカラーサブクエリ、派生テーブル、相関サブクエリ |
| 集約 | GROUP BY / HAVING、集約関数 MIN / MAX / AVG / SUM、COUNT DISTINCT、STRING_AGG、FILTER 句、GROUP BY ROLLUP、GROUP BY CUBE、GROUPING 関数、percentile_cont、stddev / variance、mode() WITHIN GROUP |
| CTE | 非再帰 CTE、再帰 CTE、MATERIALIZED CTE |
| 複合 SELECT | UNION、UNION ALL、INTERSECT、EXCEPT、VALUES |
| ウィンドウ関数 | ROW_NUMBER、RANK / DENSE_RANK、LAG / LEAD、SUM OVER パーティション、NTILE、名前付き WINDOW 句 |
| 式・述語 | CASE 式、CAST / ::、COALESCE / NULLIF、ILIKE、BETWEEN、バインドパラメータ `$1`、ROW コンストラクタ、組み込み version()、IS DISTINCT FROM、SIMILAR TO、GLOB 相当（~ 演算子） |
| 配列 | 添字アクセス、スライス、array_agg、unnest、unnest WITH ORDINALITY、generate_subscripts、配列演算子 && / @>、array_dims / array_upper、配列サブクエリ |
| JSON / JSONB | JSONB 演算子 `->` / `->>`、jsonb_each、jsonb_array_elements、jsonb_build_object、テーブル列との jsonb_each、json_to_record、jsonb_to_recordset、json_arrayagg / json_object_agg、row_to_json、jsonb_path_query、json_each_text |
| 全文検索 | to_tsvector / plainto_tsquery、ts_rank、ts_debug TVF、to_tsvector / websearch_to_tsquery、setweight |
| テーブル値関数 | generate_series、generate_series（ステップ）、pg_settings、pg_timezone_names、pg_stat_activity |
| 日付・時刻 | to_char、date_bin、clock_timestamp / current_schema |
| 文字列・型 | left / right / repeat、regexp_match、format / pg_typeof |
| シーケンス | nextval / currval / lastval |
| PostGIS | ST_AsGeoJSON / ST_SRID、ST_NPoints / ST_NDims |
| DML | INSERT RETURNING、UPDATE RETURNING、DELETE RETURNING、ON CONFLICT DO UPDATE RETURNING、UPDATE RETURNING OLD / NEW |
| MERGE | MERGE ... RETURNING |
| COPY | COPY TO |
| EXPLAIN | EXPLAIN SELECT、EXPLAIN ANALYZE |
| スキーマ修飾 | public.users、public エイリアス |
| カタログ | pg_catalog.pg_tables、information_schema.columns、current_setting、pg_class、pg_namespace、pg_roles、pg_indexes |
| SHOW | SHOW search_path、SHOW transaction isolation level、SHOW ALL |
| スキーマ追跡 | CREATE VIEW と SELECT、CREATE TABLE AS SELECT、CREATE MATERIALIZED VIEW、ALTER TABLE ADD COLUMN、ALTER TABLE RENAME COLUMN、app スキーマへの CREATE |
| 型定義 | ENUM 型、複合型、DOMAIN 型 |
| 関数 | RETURNS TABLE 関数、スカラー関数の投影 |
| LATERAL | LATERAL サブクエリ |
| 結果なし文 | BEGIN / COMMIT、TRUNCATE、CREATE INDEX、SAVEPOINT、NOTIFY |
| メンテナンス | ANALYZE |
| 負のテスト | パースエラー（タイポ） |

参照ドキュメント:

| カテゴリ | PostgreSQL ドキュメント |
|----------|------------------------|
| SELECT 基本 | [docs](https://www.postgresql.org/docs/current/queries.html) |
| JOIN | [docs](https://www.postgresql.org/docs/current/queries-table-expressions.html) |
| サブクエリ | [docs](https://www.postgresql.org/docs/current/functions-subquery.html) |
| 集約 | [docs](https://www.postgresql.org/docs/current/functions-aggregate.html) |
| CTE | [docs](https://www.postgresql.org/docs/current/queries-with.html) |
| 複合 SELECT | [docs](https://www.postgresql.org/docs/current/queries-union.html) |
| ウィンドウ関数 | [docs](https://www.postgresql.org/docs/current/functions-window.html) |
| 式・述語 | [docs](https://www.postgresql.org/docs/current/functions.html) |
| 配列 | [docs](https://www.postgresql.org/docs/current/arrays.html) |
| JSON / JSONB | [docs](https://www.postgresql.org/docs/current/functions-json.html) |
| 全文検索 | [docs](https://www.postgresql.org/docs/current/textsearch.html) |
| テーブル値関数 | [docs](https://www.postgresql.org/docs/current/functions-srf.html) |
| DML | [docs](https://www.postgresql.org/docs/current/dml.html) |
| スキーマ修飾 | [docs](https://www.postgresql.org/docs/current/ddl-schemas.html) |
| カタログ | [docs](https://www.postgresql.org/docs/current/catalogs.html) |
| SHOW | [docs](https://www.postgresql.org/docs/current/sql-show.html) |
| スキーマ追跡 | [docs](https://www.postgresql.org/docs/current/sql-createview.html) |
| LATERAL | [docs](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-LATERAL) |
| EXPLAIN | [docs](https://www.postgresql.org/docs/current/sql-explain.html) |
| 日付・時刻 | [docs](https://www.postgresql.org/docs/current/functions-datetime.html) |
| 文字列・型 | [docs](https://www.postgresql.org/docs/current/functions-string.html) |
| シーケンス | [docs](https://www.postgresql.org/docs/current/functions-sequence.html) |
| PostGIS | [docs](https://www.postgresql.org/docs/current/postgis.html) |
| MERGE | [docs](https://www.postgresql.org/docs/current/sql-merge.html) |
| COPY | [docs](https://www.postgresql.org/docs/current/sql-copy.html) |
| 型定義 | [docs](https://www.postgresql.org/docs/current/sql-createtype.html) |
| 関数 | [docs](https://www.postgresql.org/docs/current/sql-createfunction.html) |
| 結果なし文 | [docs](https://www.postgresql.org/docs/current/sql-commands.html) |
| 負のテスト | [docs](https://www.postgresql.org/docs/current/sql-syntax.html) |
| メンテナンス | [docs](https://www.postgresql.org/docs/current/sql-analyze.html) |
| 既知の限界 | [docs](https://www.postgresql.org/docs/current/index.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: postgres
```

```sql
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  age         INTEGER,
  dept        TEXT,
  data        JSONB,
  tags        TEXT[],
  created_at  TIMESTAMPTZ,
  geom        GEOMETRY(Point, 4326),
  geog        GEOGRAPHY(Point, 4326)
);

CREATE TABLE orders (
  id       SERIAL PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES users(id),
  amount   NUMERIC(10, 2) NOT NULL
);

CREATE TABLE active_users (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE departments (
  dept    TEXT PRIMARY KEY,
  budget  INTEGER NOT NULL
);

CREATE TABLE documents (
  id    SERIAL PRIMARY KEY,
  title TEXT,
  body  TEXT
);

CREATE TABLE src (
  id   INTEGER,
  name TEXT
);
```

## Prepare-2: public スキーマメタデータ

```yaml
kind: schema-ddl
dialect: postgres
```

```sql
CREATE TABLE public.users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT
);
```

---

# SELECT 基本

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/queries.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, name FROM users
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
## 重複した結果列名

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT name, name FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | users.name |
| name | text | users.name |

---
## Updatable ResultSet 用キー列追加

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
api: updatable
```

```sql
SELECT name FROM users
```

### Then

```yaml
kind: columns
verify: true
sql: SELECT name, users.id FROM users
```

| name | type | source | key |
|------|------|--------|-----|
| name | text | users.name | false |
| id | integer | users.id | true |

---
## Updatable ResultSet 用キー列名重複

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
api: updatable
```

```sql
SELECT name AS id FROM users
```

### Then

```yaml
kind: columns
verify: true
sql: SELECT name AS id, users.id FROM users
```

| name | type | source | key |
|------|------|--------|-----|
| id | text | users.name | false |
| id | integer | users.id | true |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
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
| data | jsonb | users.data |
| tags | array<text> | users.tags |
| created_at | timestamp with time zone | users.created_at |
| geom | geometry | users.geom |
| geog | geography | users.geog |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT 1 AS one, 'hi' AS msg
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | integer | literal |
| msg | text | literal |

---
## ORDER BY / LIMIT / OFFSET

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, name FROM users ORDER BY name LIMIT 10 OFFSET 5
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
## DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
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
| dept | text | users.dept |

---
## DISTINCT ON

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT DISTINCT ON (dept) dept, name FROM users ORDER BY dept, age DESC
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| name | text | users.name |

---
## FETCH FIRST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users FETCH FIRST 5 ROWS ONLY
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
## TABLESAMPLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, name FROM users TABLESAMPLE BERNOULLI (10)
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

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/queries-table-expressions.html)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT u.id, u.name, o.amount FROM users u INNER JOIN orders o ON o.user_id = u.id
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
| amount | numeric(10,2) | orders.amount |

---
## LEFT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT u.id, o.amount FROM users u LEFT JOIN orders o ON o.user_id = u.id
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | numeric(10,2) | orders.amount |

---
## RIGHT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT u.id, o.amount FROM users u RIGHT JOIN orders o ON o.user_id = u.id
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | numeric(10,2) | orders.amount |

---
## FULL OUTER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT u.id, o.amount FROM users u FULL OUTER JOIN orders o ON o.user_id = u.id
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | numeric(10,2) | orders.amount |

---
## CROSS JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT u.id, o.id FROM users u CROSS JOIN orders o
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| id | integer | orders.id |

---
## NATURAL JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, name FROM users NATURAL JOIN active_users
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
## JOIN USING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, users.name FROM users JOIN active_users USING (id)
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
# サブクエリ

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/functions-subquery.html)

---

## IN サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, name FROM users WHERE id IN (SELECT user_id FROM orders)
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
## EXISTS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)
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
## NOT EXISTS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)
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
## スカラーサブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, (SELECT MAX(amount) FROM orders) AS max_amt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| max_amt | numeric(10,2) | expression |

---
## 派生テーブル

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT t.id, t.n FROM (SELECT id, name AS n FROM users) AS t
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |
| n | text | t.n |

---
## 相関サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users u WHERE age > (SELECT AVG(amount) FROM orders o WHERE o.user_id = u.id)
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
# 集約

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/functions-aggregate.html)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT dept, COUNT(*) AS cnt FROM users GROUP BY dept HAVING COUNT(*) > 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| cnt | bigint | expression |

---
## サーバー生成列名（alias なし）

Docker image `postgres:16` で実測した未alias式の列名。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT COUNT(*), id + 1, upper(name) FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| count | bigint | expression |
| ?column? | integer | polyglot |
| upper | text | polyglot |

---
## 集約関数 MIN / MAX / AVG / SUM

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT MIN(age) AS mi, MAX(age) AS ma, AVG(age) AS av, SUM(age) AS su FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mi | integer | expression |
| ma | integer | expression |
| av | numeric | expression |
| su | integer | expression |

---
## COUNT DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT COUNT(DISTINCT dept) AS cd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cd | bigint | expression |

---
## STRING_AGG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT dept, STRING_AGG(name, ',') AS names FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| names | text | expression |

---
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT COUNT(*) FILTER (WHERE age >= 18) AS adult_cnt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| adult_cnt | bigint | expression |

---
## GROUP BY ROLLUP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT dept, COUNT(*) AS cnt FROM users GROUP BY ROLLUP (dept)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| cnt | bigint | expression |

---
## GROUP BY CUBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT dept, COUNT(*) AS cnt FROM users GROUP BY CUBE (dept)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| cnt | bigint | expression |

---
## GROUPING 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT dept, GROUPING(dept) AS g, COUNT(*) AS cnt FROM users GROUP BY ROLLUP (dept)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| g | integer | expression |
| cnt | bigint | expression |

---
# CTE

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/queries-with.html)

---

## 非再帰 CTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
WITH active AS (SELECT id, name FROM users WHERE age >= 18) SELECT id, name FROM active
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | active.id |
| name | text | active.name |

---
## 再帰 CTE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
WITH RECURSIVE t(n) AS (VALUES (1) UNION ALL SELECT n + 1 FROM t WHERE n < 3) SELECT n FROM t
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
## MATERIALIZED CTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
WITH active AS MATERIALIZED (SELECT id FROM users WHERE age >= 18) SELECT id FROM active
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | active.id |

---
# 複合 SELECT

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/queries-union.html)

---

## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, name FROM users UNION SELECT id, name FROM active_users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cast |
| name | text | cast |

---
## UNION ALL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users UNION ALL SELECT id FROM active_users
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
dialect: postgres
```

```sql
SELECT id FROM users INTERSECT SELECT user_id FROM orders
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
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users EXCEPT SELECT user_id FROM orders
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
## VALUES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM (VALUES (1, 'a'), (2, 'b')) AS v(id, label)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | v.id |
| label | text | v.label |

---
# ウィンドウ関数

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/functions-window.html)

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, ROW_NUMBER() OVER (ORDER BY age) AS rn FROM users
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
## RANK / DENSE_RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, RANK() OVER (ORDER BY age) AS r, DENSE_RANK() OVER (ORDER BY age) AS dr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| r | integer | expression |
| dr | integer | expression |

---
## LAG / LEAD

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, LAG(age) OVER (ORDER BY id) AS la, LEAD(age) OVER (ORDER BY id) AS le FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| la | integer | expression |
| le | integer | expression |

---
## SUM OVER パーティション

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, SUM(amount) OVER (PARTITION BY user_id) AS s FROM orders
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | orders.id |
| s | numeric | polyglot |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, NTILE(4) OVER (ORDER BY age) AS nt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| nt | integer | expression |

---
## 名前付き WINDOW 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, SUM(amount) OVER w AS s FROM orders WINDOW w AS (PARTITION BY user_id)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | orders.id |
| s | numeric | polyglot |

---
# 式・述語

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/functions.html)

---

## CASE 式

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, CASE WHEN age < 18 THEN 'minor' ELSE 'adult' END AS status FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| status | text | expression |

---
## CAST / ::

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT age::text AS age_text FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| age_text | text | polyglot |

---
## CAST / :: — native type names with modifiers

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  CAST('x' AS VARCHAR(12)) AS v12,
  CAST(1.23 AS NUMERIC(8,2)) AS n82,
  CAST('2020-01-01 00:00:00' AS TIMESTAMP(3)) AS ts3,
  CAST('2020-01-01 00:00:00+00' AS TIMESTAMPTZ) AS tstz
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v12 | varchar(12) | polyglot |
| n82 | numeric(8,2) | polyglot |
| ts3 | timestamp(3) | polyglot |
| tstz | timestamp with time zone | polyglot |

---
## CAST / COALESCE — null, temporal, arithmetic metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  CAST(NULL AS VARCHAR(8)) AS null_v,
  COALESCE(NULL, CAST('x' AS CHAR(4))) AS co_c,
  CAST('12:34:56.123' AS TIME(3)) AS tm3,
  CAST('1 day' AS INTERVAL) AS iv,
  CAST(1 AS INTEGER) + CAST(1.25 AS NUMERIC(6,2)) AS add_num
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| null_v | varchar(8) | polyglot |
| co_c | char(4) | expression |
| tm3 | time(3) | polyglot |
| iv | interval | polyglot |
| add_num | numeric | polyglot |

---
## CASE — null and mixed type metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  CASE WHEN TRUE THEN NULL ELSE CAST('x' AS VARCHAR(5)) END AS case_null,
  CASE WHEN TRUE THEN CAST(1 AS INTEGER) ELSE CAST(1.25 AS NUMERIC(6,2)) END AS case_num,
  CASE WHEN TRUE THEN CAST('x' AS CHAR(3)) ELSE CAST('yy' AS VARCHAR(7)) END AS case_text
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| case_null | varchar(5) | expression |
| case_num | numeric | expression |
| case_text | text | expression |

---
## UNION — null and mixed numeric metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT CAST(NULL AS VARCHAR(5)) AS u, CAST(1 AS INTEGER) AS n
UNION ALL
SELECT CAST('x' AS VARCHAR(5)), CAST(1.25 AS NUMERIC(6,2))
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| u | text | cast |
| n | numeric | cast |

---
## UNION — type resolution metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT CAST(1 AS INTEGER) AS set_num, CAST('a' AS CHAR(3)) AS set_text, DATE '2020-01-01' AS set_temporal
UNION ALL
SELECT CAST(1 AS BIGINT), CAST('bb' AS VARCHAR(7)), TIMESTAMP '2020-01-01 00:00:00'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| set_num | bigint | cast |
| set_text | text | cast |
| set_temporal | timestamp without time zone | cast |

---
## 集約 — decimal precision metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  SUM(CAST(1.25 AS NUMERIC(6,2))) AS sum_num,
  AVG(CAST(1.25 AS NUMERIC(6,2))) AS avg_num,
  AVG(CAST(1 AS INTEGER)) AS avg_int
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sum_num | numeric | expression |
| avg_num | numeric | expression |
| avg_int | numeric | expression |

---
## 文字列連結・日時演算 — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  CAST('ab' AS VARCHAR(2)) || CAST('cde' AS VARCHAR(3)) AS concat_text,
  CAST('2020-01-01' AS DATE) + INTERVAL '1 day' AS date_plus,
  CAST('2020-01-01 00:00:00' AS TIMESTAMP(3)) + INTERVAL '1 day' AS ts_plus
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| concat_text | text | polyglot |
| date_plus | timestamp without time zone | expression |
| ts_plus | timestamp without time zone | polyglot |

---
## 算術・文字列関数・ウィンドウ — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  CAST(1.25 AS NUMERIC(6,2)) * CAST(2 AS INTEGER) AS mul_num,
  CAST(5 AS INTEGER) / CAST(2 AS INTEGER) AS div_int,
  ROUND(CAST(1.25 AS NUMERIC(6,2)), 1) AS round_num,
  SUBSTRING(CAST('abcde' AS VARCHAR(5)) FROM 2 FOR 3) AS substr_text,
  ROW_NUMBER() OVER () AS rn,
  SUM(CAST(1.25 AS NUMERIC(6,2))) OVER () AS win_sum,
  AVG(CAST(1 AS INTEGER)) OVER () AS win_avg
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mul_num | numeric | polyglot |
| div_int | integer | polyglot |
| round_num | numeric | polyglot |
| substr_text | text | expression |
| rn | bigint | expression |
| win_sum | numeric | polyglot |
| win_avg | numeric | polyglot |

---
## 型優先順位・リテラル — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  COALESCE(NULL, CAST(1 AS INTEGER), CAST(1.25 AS NUMERIC(6,2))) AS co_num,
  COALESCE(NULL, CAST('x' AS CHAR(3)), CAST('yy' AS VARCHAR(7))) AS co_text,
  NULLIF(CAST(1.25 AS NUMERIC(6,2)), CAST(1 AS INTEGER)) AS nullif_num,
  1 AS lit_int,
  1.25 AS lit_decimal,
  'abc' AS lit_text,
  NULL AS lit_null,
  DATE '2020-01-01' AS lit_date,
  TIMESTAMP '2020-01-01 00:00:00.123' AS lit_ts
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| co_num | numeric | expression |
| co_text | text | expression |
| nullif_num | numeric(6,2) | polyglot |
| lit_int | integer | literal |
| lit_decimal | numeric | literal |
| lit_text | text | literal |
| lit_null | text | literal |
| lit_date | date | literal |
| lit_ts | timestamp without time zone | literal |

---
## 日時差分・述語投影 — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  DATE '2020-01-03' - DATE '2020-01-01' AS date_diff_days,
  TIMESTAMP '2020-01-01 00:00:10' - TIMESTAMP '2020-01-01 00:00:00' AS ts_diff,
  1 = 1 AS pred_eq,
  NULL IS NULL AS pred_null,
  2 BETWEEN 1 AND 3 AS pred_between,
  2 IN (1, 2, 3) AS pred_in
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| date_diff_days | integer | expression |
| ts_diff | interval | expression |
| pred_eq | boolean | polyglot |
| pred_null | boolean | expression |
| pred_between | boolean | expression |
| pred_in | boolean | expression |

---
## NULL・除算・timezone差分 — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  CAST('a' AS VARCHAR(3)) || NULL AS concat_null,
  SUM(CAST(NULL AS NUMERIC(6,2))) AS sum_null,
  AVG(CAST(NULL AS INTEGER)) AS avg_null,
  COUNT(NULL) AS count_null,
  MIN(CAST(NULL AS VARCHAR(5))) AS min_null,
  CASE WHEN TRUE THEN NULL ELSE NULL END AS case_all_null,
  CAST(5.00 AS NUMERIC(6,2)) / CAST(2.00 AS NUMERIC(6,2)) AS div_decimal,
  CAST(5.00 AS NUMERIC(6,2)) / CAST(2 AS INTEGER) AS div_decimal_int,
  TIMESTAMP WITH TIME ZONE '2020-01-01 00:00:10+00' - TIMESTAMP WITH TIME ZONE '2020-01-01 00:00:00+00' AS tstz_diff
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| concat_null | text | polyglot |
| sum_null | numeric | expression |
| avg_null | numeric | expression |
| count_null | bigint | expression |
| min_null | text | expression |
| case_all_null | text | expression |
| div_decimal | numeric | polyglot |
| div_decimal_int | numeric | polyglot |
| tstz_diff | interval | polyglot |

---
## NULL型解決・追加演算・set operation・JSON scalar — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  COALESCE(NULL, NULL, CAST(1 AS INTEGER)) AS co_null_typed,
  CASE WHEN FALSE THEN NULL WHEN FALSE THEN NULL ELSE CAST('x' AS VARCHAR(5)) END AS case_nulls_typed,
  NULLIF(NULL::INTEGER, CAST(1 AS INTEGER)) AS nullif_null_typed,
  NULLIF(CAST(1 AS INTEGER), NULL::INTEGER) AS nullif_typed_null,
  CAST('a' AS CHAR(1)) || CAST('bc' AS VARCHAR(4)) AS concat_widen,
  CAST('' AS VARCHAR(1)) || CAST('x' AS VARCHAR(4)) AS concat_empty,
  CAST(1.25 AS NUMERIC(6,2)) + CAST(2 AS INTEGER) AS dec_plus_int,
  CAST(1.25 AS NUMERIC(6,2)) * CAST(2.50 AS NUMERIC(6,2)) AS dec_mul_dec,
  MOD(CAST(5 AS INTEGER), CAST(2 AS INTEGER)) AS mod_num,
  COUNT(*) AS count_star,
  COUNT(DISTINCT CAST(1 AS INTEGER)) AS count_distinct,
  MIN(DATE '2020-01-01') AS min_date,
  MAX(TIMESTAMP '2020-01-01 00:00:00') AS max_ts,
  DATE '2020-01-01' + INTERVAL '1 day' AS date_interval_plus,
  TIMESTAMP '2020-01-01 00:00:00' + INTERVAL '1 day' AS ts_interval_plus,
  '{"n":1,"b":true,"s":"x","z":null}'::jsonb -> 'n' AS json_scalar_num,
  '{"n":1,"b":true,"s":"x","z":null}'::jsonb -> 'b' AS json_scalar_bool,
  '{"n":1,"b":true,"s":"x","z":null}'::jsonb -> 'z' AS json_scalar_null
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| co_null_typed | integer | expression |
| case_nulls_typed | varchar(5) | expression |
| nullif_null_typed | integer | polyglot |
| nullif_typed_null | integer | polyglot |
| concat_widen | text | polyglot |
| concat_empty | text | polyglot |
| dec_plus_int | numeric | polyglot |
| dec_mul_dec | numeric | polyglot |
| mod_num | integer | expression |
| count_star | bigint | expression |
| count_distinct | bigint | expression |
| min_date | date | expression |
| max_ts | timestamp without time zone | expression |
| date_interval_plus | timestamp without time zone | expression |
| ts_interval_plus | timestamp without time zone | expression |
| json_scalar_num | jsonb | expression |
| json_scalar_bool | jsonb | expression |
| json_scalar_null | jsonb | expression |

---
## INTERSECT / EXCEPT — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT CAST(1 AS INTEGER) AS intersect_num, CAST('x' AS CHAR(3)) AS except_text
INTERSECT
SELECT CAST(1 AS BIGINT), CAST('x' AS VARCHAR(7))
EXCEPT
SELECT CAST(2 AS BIGINT), CAST('y' AS VARCHAR(7))
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| intersect_num | bigint | cast |
| except_text | text | cast |

---
## 型付きNULL set operation — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT NULL::INTEGER AS set_null_int, NULL::VARCHAR AS intersect_null_text
UNION ALL
SELECT CAST(1 AS INTEGER), CAST(NULL AS VARCHAR)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| set_null_int | integer | cast |
| intersect_null_text | text | cast |

---
## timezone変換・JSON unquote・bind相当式 — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  CASE WHEN TRUE THEN CAST(1 AS INTEGER) ELSE CAST(2 AS BIGINT) END AS case_num_text,
  CASE WHEN TRUE THEN DATE '2020-01-01' ELSE TIMESTAMP '2020-01-01 00:00:00' END AS case_date_ts,
  BOOL_OR(1 = 1) AS bool_any,
  SUM(CASE WHEN 1 = 1 THEN 1 ELSE 0 END) AS bool_sum,
  TIMESTAMP '2020-01-01 00:00:00' AT TIME ZONE 'Asia/Tokyo' AS timezone_convert,
  '{"n":1,"b":true,"s":"x","z":null}'::jsonb ->> 's' AS json_unquote_text,
  COALESCE(CAST(1 AS INTEGER), CAST(2 AS INTEGER)) AS bind_coalesce_equiv,
  CAST(CAST('x' AS VARCHAR) AS VARCHAR) AS bind_cast_equiv,
  CAST(1 AS INTEGER) + CAST(2 AS INTEGER) AS bind_add_equiv
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| case_num_text | bigint | expression |
| case_date_ts | timestamp without time zone | expression |
| bool_any | boolean | expression |
| bool_sum | bigint | expression |
| timezone_convert | timestamp with time zone | expression |
| json_unquote_text | text | json |
| bind_coalesce_equiv | integer | expression |
| bind_cast_equiv | text | polyglot |
| bind_add_equiv | integer | polyglot |

---
## Unicode・LOB・配列・DB固有型 — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  CAST('あ' AS VARCHAR(4)) COLLATE "C" AS unicode_text,
  CAST('abc' AS CHAR(3)) AS fixed_char_text,
  CAST('abc' AS VARCHAR) AS unbounded_varchar_text,
  CAST('x' AS TEXT) AS large_text,
  DECODE('AB', 'hex') AS large_bytes,
  ARRAY[1, 2] AS int_array,
  JSONB_BUILD_OBJECT('id', 1, 'name', 'x') AS json_object_value,
  '00000000-0000-0000-0000-000000000000'::UUID AS uuid_value,
  INET '127.0.0.1' AS inet_value,
  CAST('a' AS TEXT) COLLATE "C" = CAST('a' AS TEXT) COLLATE "C" AS collated_equal,
  INT4RANGE(1, 5) AS range_value,
  CAST('<a />' AS XML) AS xml_value,
  MACADDR '08:00:2b:01:02:03' AS macaddr_value,
  CIDR '192.168.0.0/24' AS cidr_value,
  CAST('1010' AS BIT(4)) AS bit_value,
  INT4MULTIRANGE(INT4RANGE(1, 5)) AS multirange_value,
  '$.a'::JSONPATH AS jsonpath_value,
  CAST('101010' AS VARBIT(8)) AS varbit_value,
  CAST('(1,2)' AS POINT) AS pg_point_value,
  CAST('<(0,0),1>' AS CIRCLE) AS pg_circle_value,
  CAST('{1,2,3}' AS LINE) AS pg_line_value,
  CAST('((0,0),(1,1))' AS BOX) AS pg_box_value,
  CAST('[(0,0),(1,1)]' AS LSEG) AS pg_lseg_value,
  CAST('[(0,0),(1,1),(2,0)]' AS PATH) AS pg_path_value,
  CAST('((0,0),(1,1),(2,0))' AS POLYGON) AS pg_polygon_value,
  CAST('12:34:56+09' AS TIME WITH TIME ZONE) AS pg_timetz_value,
  CAST(1.23 AS MONEY) AS pg_money_value,
  TO_TSVECTOR('english', 'hello world') AS pg_tsvector_value,
  PLAINTO_TSQUERY('english', 'hello') AS pg_tsquery_value,
  CAST('0/16B6C50' AS PG_LSN) AS pg_lsn_value,
  TO_REGCLASS('pg_class') AS pg_regclass_value,
  CAST('integer' AS REGTYPE) AS pg_regtype_value
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| unicode_text | varchar(4) | cast |
| fixed_char_text | char(3) | polyglot |
| unbounded_varchar_text | character varying | polyglot |
| large_text | text | polyglot |
| large_bytes | bytea | polyglot |
| int_array | array<integer> | expression |
| json_object_value | jsonb | expression |
| uuid_value | uuid | polyglot |
| inet_value | inet | polyglot |
| collated_equal | boolean | polyglot |
| range_value | int4range | polyglot |
| xml_value | xml | polyglot |
| macaddr_value | macaddr | polyglot |
| cidr_value | cidr | polyglot |
| bit_value | bit(4) | polyglot |
| multirange_value | int4multirange | polyglot |
| jsonpath_value | jsonpath | polyglot |
| varbit_value | bit varying(8) | polyglot |
| pg_point_value | point | polyglot |
| pg_circle_value | circle | polyglot |
| pg_line_value | line | polyglot |
| pg_box_value | box | polyglot |
| pg_lseg_value | lseg | polyglot |
| pg_path_value | path | polyglot |
| pg_polygon_value | polygon | polyglot |
| pg_timetz_value | time with time zone | polyglot |
| pg_money_value | money | polyglot |
| pg_tsvector_value | tsvector | polyglot |
| pg_tsquery_value | tsquery | polyglot |
| pg_lsn_value | pg_lsn | polyglot |
| pg_regclass_value | regclass | polyglot |
| pg_regtype_value | regtype | polyglot |

---
## bind placeholder — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
binds: int,text,int
```

```sql
SELECT
  COALESCE($1, CAST(1 AS INTEGER)) AS bind_coalesce,
  CAST($2 AS VARCHAR) AS bind_cast,
  $3 + CAST(1 AS INTEGER) AS bind_add
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| bind_coalesce | integer | expression |
| bind_cast | text | polyglot |
| bind_add | integer | polyglot |

---
## COALESCE / NULLIF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT COALESCE(age, 0) AS a, NULLIF(name, '') AS n FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | integer | expression |
| n | text | expression |

---
## ILIKE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users WHERE name ILIKE '%a%'
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
## BETWEEN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users WHERE age BETWEEN 18 AND 65
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
## バインドパラメータ `$1`

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
binds: text
```

```sql
SELECT id FROM users WHERE name = $1
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
## ROW コンストラクタ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT (id, name) AS r FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | record<id integer, name text> | expression |

---
## 組み込み version()

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT version() AS v
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | text | expression |

---
## IS DISTINCT FROM

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users WHERE age IS DISTINCT FROM 18
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
## SIMILAR TO

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users WHERE name SIMILAR TO 'a%'
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
## GLOB 相当（~ 演算子）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id FROM users WHERE name ~ '^a'
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
# 配列

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/arrays.html)

---

## 添字アクセス

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT tags[1] AS t FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | users.tags |

---
## スライス

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT tags[1:2] AS ts FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ts | array<text> | expression |

---
## array_agg

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT dept, array_agg(name) AS names FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| names | array<text> | expression |

---
## unnest

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM unnest(ARRAY[1, 2, 3]) AS u(n)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | integer | u.n |

---
## unnest WITH ORDINALITY

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM unnest(ARRAY[1, 2]) WITH ORDINALITY AS u(x, ord)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| x | integer | u.x |
| ord | integer | u.ord |

---
## generate_subscripts

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM generate_subscripts(ARRAY[10, 20, 30], 1) AS s(i)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| i | integer | s.i |

---
## 配列演算子 && / @>

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT tags && ARRAY['a']::text[] AS ov, tags @> ARRAY['a']::text[] AS ca FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ov | boolean | expression |
| ca | boolean | expression |

---
## array_dims / array_upper

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT array_dims(tags) AS ad, array_upper(tags, 1) AS au FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ad | text | expression |
| au | integer | expression |

---
## 配列サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT ARRAY(SELECT id FROM users) AS a
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | array<integer> | expression |

---
# JSON / JSONB

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/functions-json.html)

---

## JSONB 演算子 `->` / `->>`

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT data->'name' AS j, data->>'name' AS t FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| j | json | expression |
| t | text | users.data.name |

---
## JSON extraction — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT
  '{"name":"bob","items":[1,2]}'::jsonb -> 'items' AS json_items,
  '{"name":"bob","items":[1,2]}'::jsonb ->> 'name' AS json_name,
  jsonb_path_query_first('{"name":"bob","items":[1,2]}'::jsonb, '$.items') AS json_path_item,
  jsonb_typeof('{"name":"bob","items":[1,2]}'::jsonb -> 'items') AS json_type_name
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| json_items | jsonb | expression |
| json_name | text | json |
| json_path_item | jsonb | expression |
| json_type_name | text | expression |

---
## jsonb_each

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM jsonb_each('{"a": 1}'::jsonb)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| key | text | jsonb_each.key |
| value | json | jsonb_each.value |

---
## jsonb_array_elements

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM jsonb_array_elements('[1, 2]'::jsonb)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jsonb_array_elements | json | jsonb_array_elements.jsonb_array_elements |

---
## jsonb_build_object

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT jsonb_build_object('id', 1) AS obj
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| obj | jsonb | expression |

---
## テーブル列との jsonb_each

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT e.key, e.value FROM users, jsonb_each(data) AS e
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| key | text | e.key |
| value | json | e.value |

---
## json_to_record

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM json_to_record('{"id": 1, "name": "a"}') AS x(id int, name text)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | x.id |
| name | text | x.name |

---
## jsonb_to_recordset

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM jsonb_to_recordset('[{"id": 1}]'::jsonb) AS x(id int)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | x.id |

---
## json_arrayagg / json_object_agg

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT json_arrayagg(name) AS ja, json_object_agg(name, age) AS jo FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ja | json | expression |
| jo | json | expression |

---
## row_to_json

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT row_to_json(users) AS rj FROM users LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rj | json | expression |

---
## jsonb_path_query

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT jsonb_path_query(data, '$.name') AS jp FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jp | jsonb | expression |

---
## json_each_text

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM json_each_text('{"a": 1}') AS x
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| key | text | x.key |
| value | text | x.value |

---
# 全文検索

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/textsearch.html)

---

## to_tsvector / plainto_tsquery

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT title FROM documents WHERE to_tsvector('english', body) @@ plainto_tsquery('english', 'database')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| title | text | documents.title |

---
## ts_rank

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT ts_rank(to_tsvector('english', body), plainto_tsquery('english', 'sql')) AS r FROM documents
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | text | polyglot |

---
## ts_debug TVF

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM ts_debug('english', 'a fat cat') AS t
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| alias | text | t.alias |
| description | text | t.description |
| token | text | t.token |
| dictionaries | text[] | t.dictionaries |
| dictionary | text | t.dictionary |
| lexemes | text[] | t.lexemes |

---
## to_tsvector / websearch_to_tsquery

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT to_tsvector('english', name) AS tv, websearch_to_tsquery('english', 'sql database') AS wq FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tv | text | polyglot |
| wq | text | polyglot |

---
## setweight

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT setweight(to_tsvector('english', name), 'A') AS sw FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sw | text | polyglot |

---
# テーブル値関数

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/functions-srf.html)

---

## generate_series

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM generate_series(1, 3)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| generate_series | integer | generate_series.generate_series |

---
## generate_series（ステップ）

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM generate_series(1, 9, 2)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| generate_series | integer | generate_series.generate_series |

---
## pg_settings

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM pg_settings AS s LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | pg_settings.name |
| setting | text | pg_settings.setting |
| unit | text | pg_settings.unit |
| category | text | pg_settings.category |
| short_desc | text | pg_settings.short_desc |
| extra_desc | text | pg_settings.extra_desc |
| context | text | pg_settings.context |
| vartype | text | pg_settings.vartype |
| source | text | pg_settings.source |
| min_val | text | pg_settings.min_val |
| max_val | text | pg_settings.max_val |
| enumvals | array<variant> | pg_settings.enumvals |
| boot_val | text | pg_settings.boot_val |
| reset_val | text | pg_settings.reset_val |
| sourcefile | text | pg_settings.sourcefile |
| sourceline | integer | pg_settings.sourceline |
| pending_restart | boolean | pg_settings.pending_restart |

---
## pg_timezone_names

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM pg_timezone_names AS tz LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | pg_timezone_names.name |
| abbrev | text | pg_timezone_names.abbrev |
| utc_offset | interval | pg_timezone_names.utc_offset |
| is_dst | boolean | pg_timezone_names.is_dst |

---
## pg_stat_activity

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT pid, state FROM pg_stat_activity LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| pid | integer | pg_stat_activity.pid |
| state | text | pg_stat_activity.state |

---
# 集約

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/functions-aggregate.html)

---

## percentile_cont

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY age) AS p FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| p | numeric | expression |

---
## stddev / variance

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT stddev(age) AS sd, variance(age) AS v FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sd | numeric | expression |
| v | numeric | expression |

---
## mode() WITHIN GROUP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT mode() WITHIN GROUP (ORDER BY age) AS m FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| m | null | expression |

---
# 日付・時刻

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/functions-datetime.html)

---

## to_char

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT to_char(created_at, 'YYYY') AS c FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| c | text | expression |

---
## date_bin

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT date_bin('1 hour', created_at, TIMESTAMP '2020-01-01') AS db FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| db | timestamp without time zone | expression |

---
## clock_timestamp / current_schema

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT clock_timestamp() AS ct, current_schema() AS cs
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ct | timestamp without time zone | expression |
| cs | text | expression |

---
# 文字列・型

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/functions-string.html)

---

## left / right / repeat

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT left(name, 2) AS l, right(name, 2) AS r, repeat(name, 2) AS rp FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| l | text | expression |
| r | text | expression |
| rp | text | expression |

---
## regexp_match

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT regexp_match(name, 'a') AS rm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rm | array<text> | expression |

---
## format / pg_typeof

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT format('%s', name) AS f, pg_typeof(age) AS pt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| f | text | polyglot |
| pt | text | expression |

---
# シーケンス

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/functions-sequence.html)

---

## nextval / currval / lastval

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT nextval('users_id_seq') AS n, currval('users_id_seq') AS c, lastval() AS l
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | bigint | expression |
| c | bigint | expression |
| l | bigint | expression |

---
# PostGIS

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/postgis.html)

---

## ST_AsGeoJSON / ST_SRID

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT ST_AsGeoJSON(geom) AS gj, ST_SRID(geom) AS srid FROM users LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| gj | text | expression |
| srid | integer | expression |

---
## ST_NPoints / ST_NDims

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT ST_NPoints(geom) AS np, ST_NDims(geom) AS nd FROM users LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| np | integer | expression |
| nd | integer | expression |

---
# DML

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/dml.html)

---

## INSERT RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
INSERT INTO users(name) VALUES ('alice') RETURNING id, name
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
## UPDATE RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
UPDATE users SET name = 'bob' WHERE id = 1 RETURNING id, name
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
## DELETE RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
DELETE FROM users WHERE id = 2 RETURNING id
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
## ON CONFLICT DO UPDATE RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
INSERT INTO users(id, name) VALUES (1, 'a') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name RETURNING id, name
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
## UPDATE RETURNING OLD / NEW

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
UPDATE users SET name = 'bob' WHERE id = 1 RETURNING old.name, new.name
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | users.name |
| name | text | users.name |

---
# MERGE

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/sql-merge.html)

---

## MERGE ... RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
MERGE INTO users USING src ON users.id = src.id WHEN MATCHED THEN UPDATE SET name = src.name RETURNING users.id, src.name
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| name | text | src.name |

---
# COPY

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/sql-copy.html)

---

## COPY TO

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
COPY (SELECT id, name FROM users) TO '/tmp/users.csv'
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
# EXPLAIN

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/sql-explain.html)

---

## EXPLAIN SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
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
## EXPLAIN ANALYZE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
EXPLAIN ANALYZE SELECT id FROM users
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
# スキーマ修飾

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/ddl-schemas.html)

---

## public.users

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: postgres
```

```sql
SELECT id, name FROM public.users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | public.users.id |
| name | text | public.users.name |

---
## public エイリアス

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: postgres
```

```sql
SELECT u.id FROM public.users AS u
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | public.users.id |

---
# カタログ

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/catalogs.html)

---

## pg_catalog.pg_tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| schemaname | text | pg_catalog.pg_tables.schemaname |
| tablename | text | pg_catalog.pg_tables.tablename |

---
## information_schema.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
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
## current_setting

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT * FROM current_setting('search_path') AS s
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | text | s.s |

---
## pg_class

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT relname FROM pg_class LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| relname | text | pg_class.relname |

---
## pg_namespace

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT nspname FROM pg_namespace LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nspname | text | pg_namespace.nspname |

---
## pg_roles

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT rolname FROM pg_roles LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rolname | text | pg_roles.rolname |

---
## pg_indexes

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'users' LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| indexname | text | pg_indexes.indexname |

---
# SHOW

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/sql-show.html)

---

## SHOW search_path

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SHOW search_path
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| search_path | text | cast |

---
## SHOW transaction isolation level

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SHOW transaction isolation level
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| transaction_isolation | text | cast |

---
## SHOW ALL

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SHOW ALL
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | cast |
| setting | text | cast |
| description | text | cast |

---
# スキーマ追跡

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/sql-createview.html)

---

## CREATE VIEW と SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
CREATE VIEW active AS SELECT id, name FROM users WHERE age >= 18;
SELECT id, name FROM active
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | active.id |
| name | text | active.name |

---
## CREATE TABLE AS SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
CREATE TABLE backup AS SELECT id, name FROM users;
SELECT id FROM backup
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | backup.id |

---
## CREATE MATERIALIZED VIEW

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
CREATE MATERIALIZED VIEW mv AS SELECT id, name FROM users;
SELECT name FROM mv
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | mv.name |

---
## ALTER TABLE ADD COLUMN

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
CREATE TABLE t(id INT);
ALTER TABLE t ADD COLUMN name TEXT;
SELECT name FROM t
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | t.name |

---
## ALTER TABLE RENAME COLUMN

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
CREATE TABLE t(id INT, name TEXT);
ALTER TABLE t RENAME COLUMN name TO full_name;
SELECT full_name FROM t
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| full_name | text | t.full_name |

---
## app スキーマへの CREATE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
CREATE SCHEMA app;
CREATE TABLE app.people(id INT, name TEXT);
SELECT id, name FROM app.people
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | app.people.id |
| name | text | app.people.name |

---
# 型定義

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/sql-createtype.html)

---

## ENUM 型

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');
CREATE TABLE t(m mood);
SELECT m FROM t
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| m | text | t.m |

---
## 複合型

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
CREATE TYPE pair AS (id INT, name TEXT);
CREATE TABLE t(p pair);
SELECT p FROM t
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| p | struct<id integer, name text> | t.p |

---
## DOMAIN 型

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
CREATE DOMAIN positive_int AS INT CHECK (VALUE > 0);
CREATE TABLE t(id positive_int);
SELECT id FROM t
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |

---
# 関数

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

## RETURNS TABLE 関数

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
CREATE FUNCTION people() RETURNS TABLE(id INT, name TEXT) LANGUAGE SQL AS $$ SELECT 1, 'a' $$;
SELECT id, name FROM people()
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | people.id |
| name | text | people.name |

---
## スカラー関数の投影

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
CREATE FUNCTION add_one(x INT) RETURNS INT LANGUAGE SQL AS $$ SELECT x + 1 $$;
SELECT add_one(age) AS n FROM users
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| n | integer | function |

---
# LATERAL

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-LATERAL)

---

## LATERAL サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
SELECT u.id, x.n FROM users u, LATERAL (SELECT u.age + 1 AS n) AS x
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| n | integer | x.n |

---
# 結果なし文

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/sql-commands.html)

---

## BEGIN / COMMIT

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
BEGIN; COMMIT
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_NO_RESULT_COLUMNS
verify: true
```

- `columns`: 空
- `diagnostics`: `SQLDESC_NO_RESULT_COLUMNS`

---
## TRUNCATE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
TRUNCATE TABLE users CASCADE
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_NO_RESULT_COLUMNS
verify: true
```

- `columns`: 空
- `diagnostics`: `SQLDESC_NO_RESULT_COLUMNS`

---
## CREATE INDEX

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
CREATE INDEX idx_users_name ON users(name)
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_NO_RESULT_COLUMNS
verify: true
```

- `columns`: 空
- `diagnostics`: `SQLDESC_NO_RESULT_COLUMNS`

---
## SAVEPOINT

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
BEGIN; SAVEPOINT sp1; COMMIT
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_NO_RESULT_COLUMNS
verify: true
```

- `columns`: 空
- `diagnostics`: `SQLDESC_NO_RESULT_COLUMNS`

---
## NOTIFY

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
NOTIFY channel
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_NO_RESULT_COLUMNS
verify: true
```

- `columns`: 空
- `diagnostics`: `SQLDESC_NO_RESULT_COLUMNS`

---
# メンテナンス

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/sql-analyze.html)

---

## ANALYZE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: postgres
```

```sql
ANALYZE users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | text | cast |
| Op | text | cast |
| Msg_type | text | cast |
| Msg_text | text | cast |

---
# 負のテスト

[PostgreSQL ドキュメント](https://www.postgresql.org/docs/current/sql-syntax.html)

---

## パースエラー（タイポ）

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
selec id FROM users
```

### Then

```yaml
kind: error
match: Parse error
verify: true
```

- `Error`: `Parse error`

---
# Docker 実測メタデータ

`postgres:16` の `information_schema.columns` から取得した metadata schema を検証する。

---

## pg_catalog.pg_tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT tablename FROM pg_catalog.pg_tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tablename | text | pg_catalog.pg_tables.tablename |

---

## information_schema.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: postgres
```

```sql
SELECT table_name, column_name FROM information_schema.columns
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | text | information_schema.columns.table_name |
| column_name | text | information_schema.columns.column_name |

---
# 既知の限界

| カテゴリ | 例 | 期待される挙動 |
|----------|-----|----------------|
| バージョン依存 SQL | `MERGE ... RETURNING`（17+）、`RETURNING old` / `new`（18+） | PostgreSQL 17 未満では `MERGE` の `RETURNING` が使えない。18 未満では `UPDATE ... RETURNING old` / `new` が使えない |
| 全文検索 MATCH | `@@` を含む複雑な WHERE | 列は推論されるが関連度関数は `polyglot` / `expression` になりやすい |
| PostGIS 未列挙関数 | 一部の `ST_*` 幾何関数 | 代表的な関数は推論する。未列挙関数は `polyglot` または `unknown` になりうる |
| 実行時依存 | `pg_sleep`、レプリケーションスロット系 TVF | スキーマのみでは列形状が不完全な場合あり |
| MERGE / COPY | 複雑な句 | 主要列は推論されるが周辺関数は `expression` になりやすい |
| メタデータ依存 | 未登録テーブル参照 | `unknown` + warnings |
