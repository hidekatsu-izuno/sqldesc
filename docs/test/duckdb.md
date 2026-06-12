# DuckDB テストケース

このドキュメントは [DuckDB 公式ドキュメント](https://duckdb.org/docs/stable/) に基づき、`sqldesc` が DuckDB 方言（`--dialect duckdb`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは [Given-When-Then](https://en.wikipedia.org/wiki/Given-When-Then) 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc` / `npm run test:doc:file -- docs/test/duckdb.md`）。

```yaml
doc: sqldesc-test/v1
dialect: duckdb
```

## ドキュメント形式（sqldesc-test/v1）

[sqlite.md](sqlite.md) / [postgresql.md](postgresql.md) / [mysql.md](mysql.md) / [oracle.md](oracle.md) と同じ形式です。

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、* 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、DISTINCT、FETCH FIRST、SAMPLE、QUALIFY、* EXCLUDE、* REPLACE |
| JOIN | INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL OUTER JOIN、CROSS JOIN、NATURAL JOIN、JOIN USING、SEMI JOIN、ANTI JOIN、ASOF JOIN、LATERAL |
| サブクエリ | IN サブクエリ、EXISTS、NOT EXISTS、スカラーサブクエリ、派生テーブル、相関サブクエリ |
| 集約 | GROUP BY / HAVING、string_agg、group_concat、FILTER 句、GROUP BY ROLLUP、approx_count_distinct、histogram |
| CTE | 非再帰 CTE、再帰 CTE、MATERIALIZED CTE |
| 複合 SELECT | UNION、UNION ALL、INTERSECT、EXCEPT |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG、SUM OVER パーティション、名前付き WINDOW 句 |
| 式・述語 | CASE 式、CAST、COALESCE、NULLIF、バインド $1、typeof、version、current_schema、contains、regexp_extract、epoch |
| リスト・構造体 | list_value、list_extract、list_contains、struct_pack、unnest |
| JSON | json_extract、json_each |
| テーブル関数 | range、generate_series、glob、read_csv、read_parquet、read_json、read_text、parquet_schema |
| PIVOT / UNPIVOT | PIVOT、UNPIVOT |
| DML | INSERT、UPDATE、DELETE、INSERT RETURNING、UPDATE RETURNING、DELETE RETURNING、ON CONFLICT DO UPDATE RETURNING、MERGE |
| スキーマ追跡 | CREATE VIEW と SELECT、CREATE TABLE AS SELECT、ALTER TABLE ADD COLUMN、ALTER TABLE RENAME COLUMN |
| スキーマ修飾 | main.users |
| マクロ | TABLE マクロ |
| シーケンス | nextval |
| カタログ | duckdb_tables、duckdb_columns、duckdb_settings、duckdb_extensions |
| PRAGMA / メタ | pragma_table_info、PRAGMA show_tables、SUMMARIZE、DESCRIBE、EXPLAIN |
| 結果なし文 | BEGIN TRANSACTION、COMMIT、ROLLBACK、CREATE INDEX、DROP INDEX、ATTACH、DETACH、INSTALL、CHECKPOINT |
| 負のテスト | パースエラー（タイポ） |

参照ドキュメント:

| カテゴリ | DuckDB ドキュメント |
|----------|---------------------|
| SELECT 基本 | [docs](https://duckdb.org/docs/stable/sql/query_syntax/select) |
| JOIN | [docs](https://duckdb.org/docs/stable/sql/query_syntax/from#joins) |
| サブクエリ | [docs](https://duckdb.org/docs/stable/sql/expressions/subqueries) |
| 集約 | [docs](https://duckdb.org/docs/stable/sql/functions/aggregates) |
| CTE | [docs](https://duckdb.org/docs/stable/sql/query_syntax/with) |
| 複合 SELECT | [docs](https://duckdb.org/docs/stable/sql/query_syntax/setops) |
| ウィンドウ関数 | [docs](https://duckdb.org/docs/stable/sql/functions/window_functions) |
| 式・述語 | [docs](https://duckdb.org/docs/stable/sql/expressions/case) |
| リスト・構造体 | [docs](https://duckdb.org/docs/stable/sql/data_types/list) |
| JSON | [docs](https://duckdb.org/docs/stable/data/json/overview) |
| テーブル関数 | [docs](https://duckdb.org/docs/stable/guides/file_formats/overview) |
| PIVOT / UNPIVOT | [docs](https://duckdb.org/docs/stable/sql/query_syntax/pivot) |
| DML | [docs](https://duckdb.org/docs/stable/sql/statements/insert) |
| スキーマ追跡 | [docs](https://duckdb.org/docs/stable/sql/statements/create_view) |
| スキーマ修飾 | [docs](https://duckdb.org/docs/stable/sql/dialect/schemas) |
| マクロ | [docs](https://duckdb.org/docs/stable/sql/statements/create_macro) |
| シーケンス | [docs](https://duckdb.org/docs/stable/sql/statements/create_sequence) |
| カタログ | [docs](https://duckdb.org/docs/stable/sql/meta/duckdb_table_functions) |
| PRAGMA / メタ | [docs](https://duckdb.org/docs/stable/configuration/pragmas) |
| 結果なし文 | [docs](https://duckdb.org/docs/stable/sql/statements/overview) |
| 負のテスト | [docs](https://duckdb.org/docs/stable/sql/introduction) |
| 既知の限界 | [docs](https://duckdb.org/docs/stable/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: duckdb
```

```sql
CREATE SEQUENCE users_id_seq START 1;
CREATE TABLE users (
  id          INTEGER PRIMARY KEY DEFAULT nextval('users_id_seq'),
  name        VARCHAR NOT NULL,
  age         INTEGER,
  dept        VARCHAR,
  data        JSON,
  tags        VARCHAR[],
  attrs       MAP(VARCHAR, VARCHAR),
  created_at  TIMESTAMP,
  d           DATE
);

CREATE SEQUENCE orders_id_seq START 1;
CREATE TABLE orders (
  id          INTEGER PRIMARY KEY DEFAULT nextval('orders_id_seq'),
  user_id     INTEGER NOT NULL,
  amount      DECIMAL(10, 2) NOT NULL,
  created_at  TIMESTAMP
);

CREATE SEQUENCE active_users_id_seq START 1;
CREATE TABLE active_users (
  id   INTEGER PRIMARY KEY DEFAULT nextval('active_users_id_seq'),
  name VARCHAR NOT NULL
);

CREATE TABLE departments (
  dept   VARCHAR PRIMARY KEY,
  budget INTEGER NOT NULL
);
```

## Prepare-2: main スキーマメタデータ

```yaml
kind: schema-json
dialect: duckdb
```

```json
{
  "tables": [
    {
      "name": "users",
      "schema": "main",
      "columns": [
        { "name": "id", "type": "integer" },
        { "name": "name", "type": "text" },
        { "name": "age", "type": "integer" },
        { "name": "dept", "type": "text" }
      ]
    }
  ]
}
```

---

# SELECT 基本

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/query_syntax/select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| name | varchar | users.name |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| data | json | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, text> | users.attrs |
| created_at | timestamp | users.created_at |
| d | date | users.d |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
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
| msg | varchar | literal |

---
## ORDER BY / LIMIT / OFFSET

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT id FROM users ORDER BY name LIMIT 10 OFFSET 5
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
## DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| dept | varchar | users.dept |

---
## FETCH FIRST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT id FROM users ORDER BY name FETCH FIRST 5 ROWS ONLY
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
## SAMPLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT id FROM users USING SAMPLE 10%
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
## QUALIFY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT id, row_number() OVER (ORDER BY age) AS rn FROM users QUALIFY rn = 1
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
## `*` EXCLUDE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT * EXCLUDE (age, dept) FROM users
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
| data | json | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, text> | users.attrs |
| created_at | timestamp | users.created_at |
| d | date | users.d |

---
## `*` REPLACE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT * REPLACE (lower(name) AS name) FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| id | integer | users.id |
| name | varchar | expression |
| age | integer | users.age |
| dept | varchar | users.dept |
| data | json | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, text> | users.attrs |
| created_at | timestamp | users.created_at |
| d | date | users.d |

---
# JOIN

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/query_syntax/from#joins)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| name | varchar | users.name |
| amount | decimal(10,2) | orders.amount |

---
## LEFT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| amount | decimal(10,2) | orders.amount |

---
## RIGHT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| amount | decimal(10,2) | orders.amount |

---
## FULL OUTER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| amount | decimal(10,2) | orders.amount |

---
## CROSS JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
dialect: duckdb
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
| name | varchar | users.name |

---
## JOIN USING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| name | varchar | users.name |

---
## SEMI JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT u.id FROM users u SEMI JOIN orders o ON u.id = o.user_id
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
## ANTI JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT u.id FROM users u ANTI JOIN orders o ON u.id = o.user_id
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
## ASOF JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT u.id FROM users u ASOF JOIN orders o ON u.id = o.user_id AND u.created_at >= o.created_at
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
## LATERAL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT u.id, o.amount FROM users u, LATERAL (SELECT amount FROM orders WHERE user_id = u.id LIMIT 1) o
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | decimal(10,2) | o.amount |

---
# サブクエリ

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/expressions/subqueries)

---

## IN サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| name | varchar | users.name |

---
## EXISTS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
dialect: duckdb
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
dialect: duckdb
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
| max_amt | decimal(10,2) | expression |

---
## 派生テーブル

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT t.id FROM (SELECT id, name AS n FROM users) t
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| id | integer | t.id |

---
## 相関サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/functions/aggregates)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| dept | varchar | users.dept |
| cnt | bigint | expression |

---
## サーバー生成列名（alias なし）

Docker image `duckdb/duckdb:latest` で実測した未alias式の列名。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| count_star() | bigint | expression |
| (id + 1) | integer | polyglot |
| upper("name") | varchar | polyglot |

---
## string_agg

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT dept, string_agg(name, ',') AS names FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| dept | varchar | users.dept |
| names | varchar | expression |

---
## group_concat

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT group_concat(name, ',') AS gc FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| gc | varchar | expression |

---
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT COUNT(*) FILTER (WHERE age >= 18) AS adults FROM users
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
## GROUP BY ROLLUP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT dept, COUNT(*) AS cnt FROM users GROUP BY ROLLUP(dept)
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

---
## approx_count_distinct

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT approx_count_distinct(dept) AS ac FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| ac | bigint | expression |

---
## histogram

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT histogram(age) AS h FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| h | map<integer, integer> | expression |

---
# CTE

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/query_syntax/with)

---

## 非再帰 CTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| name | varchar | active.name |

---
## 再帰 CTE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM t WHERE n < 3) SELECT n FROM t
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
dialect: duckdb
```

```sql
WITH active AS MATERIALIZED (SELECT id FROM users) SELECT id FROM active
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

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/query_syntax/setops)

---

## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| name | varchar | cast |

---
## UNION ALL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
dialect: duckdb
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
dialect: duckdb
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
# ウィンドウ関数

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/functions/window_functions)

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT id, row_number() OVER (ORDER BY age) AS rn FROM users
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
dialect: duckdb
```

```sql
SELECT id, rank() OVER (ORDER BY age) AS r FROM users
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

---
## LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT id, lag(age) OVER (ORDER BY id) AS la FROM users
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

---
## SUM OVER パーティション

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT id, sum(amount) OVER (PARTITION BY user_id) AS s FROM orders
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| id | integer | orders.id |
| s | decimal(18, 3) | polyglot |

---
## 名前付き WINDOW 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT id, sum(amount) OVER w AS s FROM orders WINDOW w AS (PARTITION BY user_id)
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| id | integer | orders.id |
| s | decimal(18, 3) | polyglot |

---
# 式・述語

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/expressions/case)

---

## CASE 式

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| status | varchar | expression |

---
## CAST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT CAST(age AS VARCHAR) AS age_text FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| age_text | varchar | polyglot |

---
## CAST — native type names with modifiers

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT
  CAST('x' AS VARCHAR) AS v,
  CAST(1.23 AS DECIMAL(8,2)) AS d,
  CAST('2020-01-01 00:00:00' AS TIMESTAMP) AS ts,
  CAST('00000000-0000-0000-0000-000000000000' AS UUID) AS u,
  CAST('abc' AS BLOB) AS b
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| v | varchar | polyglot |
| d | decimal(8,2) | polyglot |
| ts | timestamp | polyglot |
| u | uuid | polyglot |
| b | blob | polyglot |

---
## CAST / COALESCE — null, temporal, arithmetic metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT
  CAST(NULL AS VARCHAR) AS null_v,
  COALESCE(NULL, CAST('x' AS VARCHAR)) AS co_v,
  CAST('12:34:56.123' AS TIME) AS tm,
  INTERVAL '1 day' AS iv,
  CAST(1 AS INTEGER) + CAST(1.25 AS DECIMAL(6,2)) AS add_num
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| null_v | varchar | polyglot |
| co_v | varchar | expression |
| tm | time | polyglot |
| iv | interval | expression |
| add_num | decimal(13,2) | polyglot |

---
## COALESCE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT COALESCE(age, 0) AS a FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| a | integer | expression |

---
## NULLIF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT nullif(age, 0) AS n FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| n | integer | expression |

---
## バインド `$1`

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
## typeof

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT typeof(name) AS t FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| t | varchar | expression |

---
## version

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
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
| v | varchar | expression |

---
## current_schema

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT current_schema() AS cs
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| cs | varchar | expression |

---
## contains

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT contains(name, 'a') AS c FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| c | boolean | expression |

---
## regexp_extract

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT regexp_extract(name, '[a-z]+') AS r FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| r | varchar | expression |

---
## epoch

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT epoch(created_at) AS e FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| e | integer | expression |

---
# リスト・構造体

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/data_types/list)

---

## list_value

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT list_value(id, age) AS xs FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| xs | array<integer> | expression |

---
## list_extract

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT list_extract(tags, 1) AS t FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| t | varchar | expression |

---
## list_contains

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT list_contains(tags, 'a') AS c FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| c | boolean | expression |

---
## struct_pack

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT struct_pack(id := id, name := name) AS s FROM users
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
## unnest

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT unnest(tags) AS t FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| t | unknown |  |

---
# JSON

[DuckDB ドキュメント](https://duckdb.org/docs/stable/data/json/overview)

---

## json_extract

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT json_extract(data, '$.name') AS jn FROM users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| jn | json | expression |

---
## json_each

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT j.key, j.value FROM users, json_each(data) j
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| key | varchar | j.key |
| value | json | j.value |

---
# テーブル関数

[DuckDB ドキュメント](https://duckdb.org/docs/stable/guides/file_formats/overview)

---

## range

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT * FROM range(1, 3) AS r(i)
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| i | integer | r.i |

---
## generate_series

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT * FROM generate_series(1, 3) AS g(i)
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| i | integer | g.i |

---
## glob

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT * FROM glob('*.csv')
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| file | varchar | glob.file |

---
## read_csv

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT * FROM read_csv('x.csv') AS t(id INTEGER, name VARCHAR)
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
## read_parquet

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT * FROM read_parquet('x.parquet') AS t(id INTEGER, name VARCHAR)
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
## read_json

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT * FROM read_json('x.json') AS t(id INTEGER, name VARCHAR)
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
## read_text

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT * FROM read_text('x')
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| filename | varchar | read_text.filename |
| content | varchar | read_text.content |

---
## parquet_schema

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT name FROM parquet_schema('x.parquet')
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| name | varchar | parquet_schema.name |

---
# PIVOT / UNPIVOT

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/query_syntax/pivot)

---

## PIVOT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
PIVOT users ON dept USING sum(age) GROUP BY id, name
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
| data | json | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, text> | users.attrs |
| created_at | timestamp | users.created_at |
| d | date | users.d |

---
## UNPIVOT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
UNPIVOT users ON age::VARCHAR AS age, dept INTO NAME k VALUE v
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
| data | json | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, text> | users.attrs |
| created_at | timestamp | users.created_at |
| d | date | users.d |
| k | varchar | users.k |
| v | integer | users.v |

---
# DML

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/statements/insert)

---

## INSERT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
INSERT INTO users(name) VALUES ('alice')
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
## UPDATE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
UPDATE users SET name = 'bob' WHERE id = 1
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
## DELETE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
DELETE FROM users WHERE id = 1
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
## INSERT RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| name | varchar | users.name |

---
## UPDATE RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| name | varchar | users.name |

---
## DELETE RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
DELETE FROM users WHERE id = 1 RETURNING id, name
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

---
## ON CONFLICT DO UPDATE RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| name | varchar | users.name |

---
## MERGE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
MERGE INTO users USING (SELECT 1 AS id, 'a' AS name) s ON users.id = s.id WHEN MATCHED THEN UPDATE SET name = s.name
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
# スキーマ追跡

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/statements/create_view)

---

## CREATE VIEW と SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
CREATE VIEW active AS SELECT id, name FROM users WHERE age >= 18; SELECT name FROM active
```

### Then

```yaml
kind: columns
verify: true
target: last
```
| name | type | source |
|------|------|--------|
| name | varchar | active.name |

---
## CREATE TABLE AS SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
CREATE TABLE backup AS SELECT id, name FROM users; SELECT name FROM backup
```

### Then

```yaml
kind: columns
verify: true
target: last
```
| name | type | source |
|------|------|--------|
| name | varchar | backup.name |

---
## ALTER TABLE ADD COLUMN

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
CREATE TABLE t(id INTEGER); ALTER TABLE t ADD COLUMN name VARCHAR; SELECT name FROM t
```

### Then

```yaml
kind: columns
verify: true
target: last
```
| name | type | source |
|------|------|--------|
| name | varchar | t.name |

---
## ALTER TABLE RENAME COLUMN

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
CREATE TABLE t(id INTEGER, name VARCHAR); ALTER TABLE t RENAME COLUMN name TO full_name; SELECT full_name FROM t
```

### Then

```yaml
kind: columns
verify: true
target: last
```
| name | type | source |
|------|------|--------|
| full_name | varchar | t.full_name |

---
# スキーマ修飾

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/dialect/schemas)

---

## main.users

### Given

```yaml
prepare: Prepare-1, Prepare-2
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT id, name FROM main.users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| id | integer | main.users.id |
| name | varchar | main.users.name |

---
# マクロ

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/statements/create_macro)

---

## TABLE マクロ

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
CREATE MACRO pair() AS TABLE SELECT 1 AS id, 'x' AS label; SELECT id, label FROM pair()
```

### Then

```yaml
kind: columns
verify: true
target: last
```
| name | type | source |
|------|------|--------|
| id | integer | pair.id |
| label | varchar | pair.label |

---
# シーケンス

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/statements/create_sequence)

---

## nextval

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
CREATE SEQUENCE users_seq START 1; SELECT nextval('users_seq') AS n
```

### Then

```yaml
kind: columns
verify: true
target: last
```
| name | type | source |
|------|------|--------|
| n | bigint | expression |

---
# カタログ

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/meta/duckdb_table_functions)

---

## duckdb_tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT table_name FROM duckdb_tables()
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| table_name | varchar | duckdb_tables.table_name |

---
## duckdb_columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT column_name FROM duckdb_columns()
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| column_name | varchar | duckdb_columns.column_name |

---
## duckdb_settings

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT name, value FROM duckdb_settings()
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| name | varchar | duckdb_settings.name |
| value | varchar | duckdb_settings.value |

---
## duckdb_extensions

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT extension_name FROM duckdb_extensions()
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| extension_name | varchar | duckdb_extensions.extension_name |

---
# PRAGMA / メタ

[DuckDB ドキュメント](https://duckdb.org/docs/stable/configuration/pragmas)

---

## pragma_table_info

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SELECT cid, name, type FROM pragma_table_info('users')
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| cid | integer | pragma_table_info.cid |
| name | varchar | pragma_table_info.name |
| type | varchar | pragma_table_info.type |

---
## PRAGMA show_tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
PRAGMA show_tables
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| name | varchar | cast |

---
## SUMMARIZE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
SUMMARIZE users
```

### Then

```yaml
kind: columns
verify: true
```
| name | type | source |
|------|------|--------|
| column_name | varchar | cast |
| column_type | varchar | cast |
| min | varchar | cast |
| max | varchar | cast |
| approx_unique | integer | cast |
| avg | varchar | cast |
| std | varchar | cast |
| q25 | varchar | cast |
| q50 | varchar | cast |
| q75 | varchar | cast |
| count | integer | cast |
| null_percentage | decimal(18, 3) | cast |

---
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| data | json | users.data |
| tags | array<text> | users.tags |
| attrs | map<text, text> | users.attrs |
| created_at | timestamp | users.created_at |
| d | date | users.d |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
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
| QUERY PLAN | varchar | cast |

---
# 結果なし文

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/statements/overview)

---

## BEGIN TRANSACTION

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
BEGIN TRANSACTION
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
## COMMIT

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
COMMIT
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
## ROLLBACK

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
ROLLBACK
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
dialect: duckdb
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
## DROP INDEX

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: duckdb
```

```sql
CREATE INDEX idx_users_name ON users(name); DROP INDEX idx_users_name
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_NO_RESULT_COLUMNS
verify: true
target: last
```
- `columns`: 空
- `diagnostics`: `SQLDESC_NO_RESULT_COLUMNS`

---
## ATTACH

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
ATTACH 'db2.duckdb' AS db2
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
## DETACH

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
DETACH db2
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
## INSTALL

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
INSTALL httpfs
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
## CHECKPOINT

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
```

```sql
CHECKPOINT
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
# 負のテスト

[DuckDB ドキュメント](https://duckdb.org/docs/stable/sql/introduction)

---

## パースエラー（タイポ）

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: duckdb
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
# 既知の限界

| カテゴリ | 例 | 期待される挙動 |
|----------|-----|----------------|
| ファイル読み込み | `SELECT * FROM 't.csv'` | 実行時スキーマ依存。列は `unknown` になりやすい |
| read_parquet `columns` | `read_parquet(..., columns={...})` | 実行時は非対応。`AS t(col TYPE, ...)` で列を宣言する |
| COLUMNS 式 | `SELECT COLUMNS(...)` | 動的列展開のため列名・型が `unknown` になりやすい |
| unnest / list_agg | 一部リスト関数 | 戻り型が `unknown` になりやすい |
| PIVOT / UNPIVOT | 動的列生成 | ベース列に加えて動的列が展開される |
| COPY | `COPY ... TO` | 実行上は結果列なしだが、`sqldesc` はソース列を推論する場合あり |
| カタログ TVF | `duckdb_tables()` 等 | 列は推論されるが型は `polyglot` になりやすい |
| DML | `INSERT` / `UPDATE` / `DELETE`（RETURNING なし） | 結果列なし |
| メタデータ依存 | 未登録テーブル参照 | `unknown` + warnings |
