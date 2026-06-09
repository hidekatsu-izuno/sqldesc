# T-SQL テストケース

このドキュメントは [SQL Server T-SQL 言語リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/language-reference?view=sql-server-ver17)（SQL Server 2025 / 互換レベル 17）に基づき、`sqldesc` が T-SQL 方言（`--dialect tsql`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは [Given-When-Then](https://en.wikipedia.org/wiki/Given-When-Then) 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc` / `npm run test:doc:file -- docs/test/tsql.md`）。

```yaml
doc: sqldesc-test/v1
dialect: tsql
```

## ドキュメント形式（sqldesc-test/v1）

[sqlite.md](sqlite.md) / [postgresql.md](postgresql.md) / [mysql.md](mysql.md) / [oracle.md](oracle.md) と同じ形式です。

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、TOP、TOP PERCENT、OFFSET / FETCH、DISTINCT、ORDER BY、FROM 句なし、角括弧識別子 |
| JOIN | INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL OUTER JOIN、CROSS JOIN、旧式結合（カンマ + WHERE）、NATURAL JOIN |
| APPLY | CROSS APPLY、OUTER APPLY |
| サブクエリ | IN サブクエリ、EXISTS、NOT EXISTS、スカラーサブクエリ、派生テーブル、相関サブクエリ |
| 集約 | GROUP BY / HAVING、MIN / MAX / AVG / SUM、COUNT DISTINCT、STRING_AGG、GROUP BY CUBE、GROUP BY ROLLUP、VAR / STDEV、GROUPING SETS、GROUPING 関数 |
| CTE | 非再帰 CTE、再帰 CTE |
| 複合 SELECT | UNION、UNION ALL、INTERSECT、EXCEPT |
| ウィンドウ関数 | ROW_NUMBER、RANK / DENSE_RANK、LAG / LEAD、SUM OVER パーティション、NTILE、名前付き WINDOW 句、CUME_DIST / PERCENT_RANK、PERCENTILE_CONT |
| 式・述語 | CASE 式、TRY_CAST / CONVERT / TRY_CONVERT、ISNULL / COALESCE、IIF / CHOOSE、LIKE、BETWEEN、バインド `@p`、FORMAT / CONCAT、COLLATE、@@VERSION |
| 日付・時刻 | GETDATE / SYSDATETIME、DATENAME、DATEDIFF、EOMONTH、DATEADD / DATEPART、AT TIME ZONE |
| 文字列・型 | CHECKSUM / BINARY_CHECKSUM / PATINDEX、DATALENGTH、@@SPID / DB_NAME / APP_NAME、NEWID / NEWSEQUENTIALID、LEN / STUFF、OBJECT_NAME / OBJECT_ID、SUSER_NAME / SYSTEM_USER、@@IDENTITY / SCOPE_IDENTITY |
| JSON | JSON_VALUE / JSON_QUERY、OPENJSON WITH、OPENJSON 既定列、JSON_MODIFY |
| PIVOT | PIVOT |
| 出力句 | FOR JSON PATH、FOR JSON AUTO、FOR XML PATH、FOR XML RAW |
| テーブル関数 | STRING_SPLIT、OPENQUERY、OPENROWSET |
| DML | INSERT、UPDATE、DELETE、INSERT ... SELECT |
| OUTPUT | INSERT OUTPUT、UPDATE OUTPUT、DELETE OUTPUT、UPDATE OUTPUT inserted.*、DELETE OUTPUT deleted.* |
| MERGE | MERGE（結果なし）、MERGE OUTPUT、MERGE OUTPUT inserted/deleted |
| 時間指定 | FOR SYSTEM_TIME |
| スキーマ修飾 | dbo.people、dbo エイリアス |
| カタログ | sys.tables、sys.databases、sys.indexes |
| DMV | sys.dm_exec_sessions、sys.dm_exec_requests |
| ストアドプロシージャ | sp_help、sp_who、sp_columns、sp_tables、sp_spaceused、WITH RESULT SETS、CREATE PROCEDURE + EXEC、sp_helpindex、sp_helpconstraint、sp_databases、sp_pkeys / sp_fkeys、sp_statistics、sp_special_columns、sp_server_info、sp_helpdb、sp_stored_procedures |
| 関数 | CREATE FUNCTION |
| スキーマ追跡 | CREATE VIEW と SELECT、SELECT INTO、CREATE SYNONYM、ALTER TABLE ADD COLUMN、IDENTITY 列、CREATE TABLE |
| 一時テーブル | CREATE TABLE #temp |
| 結果なし文 | BEGIN TRANSACTION、COMMIT、ROLLBACK、TRUNCATE、CREATE INDEX、DROP INDEX、CHECKPOINT、RAISERROR |
| 負のテスト | パースエラー（タイポ） |

参照ドキュメント:

| カテゴリ | SQL Server T-SQL ドキュメント |
|----------|------------------------------|
| SELECT 基本 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17) |
| JOIN | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/from-transact-sql?view=sql-server-ver17) |
| サブクエリ | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/subqueries-transact-sql?view=sql-server-ver17) |
| 集約 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/select-group-by-transact-sql?view=sql-server-ver17) |
| CTE | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/with-common-table-expression-transact-sql?view=sql-server-ver17) |
| 複合 SELECT | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/set-operators-transact-sql?view=sql-server-ver17) |
| ウィンドウ関数 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/select-over-clause-transact-sql?view=sql-server-ver17) |
| 式・述語 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/functions/functions-transact-sql?view=sql-server-ver17) |
| 日付・時刻 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/functions/date-and-time-data-types-and-functions-transact-sql?view=sql-server-ver17) |
| 文字列・型 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/functions/string-functions-transact-sql?view=sql-server-ver17) |
| JSON | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/functions/json-functions-transact-sql?view=sql-server-ver17) |
| PIVOT | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/from-using-pivot-and-unpivot?view=sql-server-ver17) |
| 出力句 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/for-json?view=sql-server-ver17) |
| テーブル関数 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/functions/string-split-transact-sql?view=sql-server-ver17) |
| APPLY | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/from-transact-sql?view=sql-server-ver17) |
| DML | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17) |
| OUTPUT | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17) |
| MERGE | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17) |
| 時間指定 | [docs](https://learn.microsoft.com/ja-jp/sql/tables/temporal-tables?view=sql-server-ver17) |
| スキーマ修飾 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17) |
| カタログ | [docs](https://learn.microsoft.com/ja-jp/sql/relational-databases/system-catalog-views/sys-tables-transact-sql?view=sql-server-ver17) |
| DMV | [docs](https://learn.microsoft.com/ja-jp/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-requests-transact-sql?view=sql-server-ver17) |
| ストアドプロシージャ | [docs](https://learn.microsoft.com/ja-jp/sql/relational-databases/system-stored-procedures/sp-help-transact-sql?view=sql-server-ver17) |
| 関数 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-function-transact-sql?view=sql-server-ver17) |
| 一時テーブル | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17) |
| スキーマ追跡 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17) |
| 結果なし文 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/language-reference?view=sql-server-ver17) |
| 負のテスト | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/language-reference?view=sql-server-ver17) |
| 既知の限界 | [docs](https://learn.microsoft.com/ja-jp/sql/t-sql/language-reference?view=sql-server-ver17) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: tsql
```

```sql
CREATE TABLE users (
  id          INT NOT NULL IDENTITY(1, 1) PRIMARY KEY,
  name        NVARCHAR(100) NOT NULL,
  age         INT,
  dept        NVARCHAR(50),
  data        NVARCHAR(MAX),
  created_at  DATETIME2,
  d           DATE
);

CREATE TABLE orders (
  id       INT NOT NULL PRIMARY KEY,
  user_id  INT NOT NULL,
  amount   DECIMAL(10, 2) NOT NULL
);

CREATE TABLE active_users (
  id   INT NOT NULL PRIMARY KEY,
  name NVARCHAR(100) NOT NULL
);

CREATE TABLE departments (
  dept   NVARCHAR(50) PRIMARY KEY,
  budget INT NOT NULL
);
```

## Prepare-2: dbo スキーマメタデータ

```yaml
kind: schema-json
dialect: tsql
```

```json
{
  "tables": [
    {
      "name": "people",
      "schema": "dbo",
      "columns": [
        {
          "name": "id",
          "type": "integer"
        },
        {
          "name": "name",
          "type": "text"
        }
      ]
    }
  ]
}
```

---

# SELECT 基本

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
| data | text | users.data |
| created_at | datetime | users.created_at |
| d | date | users.d |

---
## TOP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT TOP 10 id, name FROM users ORDER BY name
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
## TOP PERCENT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT TOP 10 PERCENT id FROM users
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
## OFFSET / FETCH

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT id FROM users ORDER BY id OFFSET 5 ROWS FETCH NEXT 10 ROWS ONLY
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
dialect: tsql
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
## ORDER BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT id FROM users ORDER BY name DESC, age ASC
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
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
SELECT 1 AS one
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | integer | literal |

---
## 角括弧識別子

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT [id], [name] FROM [users]
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

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/from-transact-sql?view=sql-server-ver17)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
| amount | decimal | orders.amount |

---
## LEFT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
| amount | decimal | orders.amount |

---
## RIGHT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
| amount | decimal | orders.amount |

---
## FULL OUTER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
| amount | decimal | orders.amount |

---
## CROSS JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
## 旧式結合（カンマ + WHERE）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT u.id, o.amount FROM users u, orders o WHERE o.user_id = u.id
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
## NATURAL JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
# APPLY

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/from-transact-sql?view=sql-server-ver17)

---

## CROSS APPLY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT u.id, x.n FROM users u CROSS APPLY (SELECT TOP 1 amount AS n FROM orders WHERE user_id = u.id) x
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| n | decimal | x.n |

---
## OUTER APPLY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT u.id, x.n FROM users u OUTER APPLY (SELECT TOP 1 amount AS n FROM orders WHERE user_id = u.id) x
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| n | decimal | x.n |

---
# サブクエリ

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/subqueries-transact-sql?view=sql-server-ver17)

---

## IN サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
dialect: tsql
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
dialect: tsql
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
dialect: tsql
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
| max_amt | decimal | expression |

---
## 派生テーブル

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
dialect: tsql
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

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/select-group-by-transact-sql?view=sql-server-ver17)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
| cnt | integer | expression |

---
## MIN / MAX / AVG / SUM

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
| av | decimal | expression |
| su | integer | expression |

---
## COUNT DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
| cd | integer | expression |

---
## STRING_AGG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
## GROUP BY CUBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT dept, COUNT(*) AS cnt FROM users GROUP BY CUBE(dept)
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

---
## GROUP BY ROLLUP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
| dept | text | users.dept |
| cnt | integer | expression |

---
## VAR / STDEV

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT VAR(age) AS v, STDEV(age) AS s FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | unknown | — |
| s | unknown | — |

---
## GROUPING SETS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT dept, COUNT(*) AS cnt FROM users GROUP BY GROUPING SETS ((dept), ())
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

---
## GROUPING 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT dept, GROUPING(dept) AS g, COUNT(*) AS cnt FROM users GROUP BY ROLLUP(dept)
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
| cnt | integer | expression |

---
# CTE

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/with-common-table-expression-transact-sql?view=sql-server-ver17)

---

## 非再帰 CTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
dialect: tsql
```

```sql
WITH t AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM t WHERE n < 3) SELECT n FROM t
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
# 複合 SELECT

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/set-operators-transact-sql?view=sql-server-ver17)

---

## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
dialect: tsql
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
dialect: tsql
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
dialect: tsql
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

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/select-over-clause-transact-sql?view=sql-server-ver17)

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
| rn | integer | expression |

---
## RANK / DENSE_RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
dialect: tsql
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
dialect: tsql
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
| s | decimal | polyglot |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
dialect: tsql
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
| s | decimal | polyglot |

---
## CUME_DIST / PERCENT_RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT id, CUME_DIST() OVER (ORDER BY age) AS cd, PERCENT_RANK() OVER (ORDER BY age) AS pr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| cd | decimal | expression |
| pr | decimal | expression |

---
## PERCENTILE_CONT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT DISTINCT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY age) OVER () AS p FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| p | decimal | expression |

---
# 式・述語

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/functions/functions-transact-sql?view=sql-server-ver17)

---

## CASE 式

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
## TRY_CAST / CONVERT / TRY_CONVERT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT TRY_CAST(age AS NVARCHAR(10)) AS a, CONVERT(INT, age) AS b, TRY_CONVERT(INT, age) AS c FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | text | polyglot |
| b | integer | expression |
| c | integer | expression |

---
## ISNULL / COALESCE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT ISNULL(age, 0) AS a, COALESCE(age, 0) AS c FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | integer | polyglot |
| c | integer | expression |

---
## IIF / CHOOSE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT IIF(age >= 18, 1, 0) AS adult, CHOOSE(age, 'a', 'b', 'c') AS c FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| adult | integer | expression |
| c | unknown | — |

---
## LIKE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT id FROM users WHERE name LIKE '%a%'
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
dialect: tsql
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
## バインド `@p`

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
binds: text
```

```sql
SELECT id FROM users WHERE name = @p
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
## FORMAT / CONCAT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT FORMAT(age, 'N0') AS f, CONCAT(name, dept) AS c FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| f | text | expression |
| c | text | polyglot |

---
## COLLATE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT name COLLATE Latin1_General_CI_AS AS c FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| c | unknown | — |

---
## @@VERSION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT @@VERSION AS v FROM users
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
# 日付・時刻

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/functions/date-and-time-data-types-and-functions-transact-sql?view=sql-server-ver17)

---

## GETDATE / SYSDATETIME

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT GETDATE() AS gd, SYSDATETIME() AS sdt, SYSUTCDATETIME() AS sudt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| gd | timestamp | expression |
| sdt | timestamp | expression |
| sudt | timestamp | expression |

---
## DATENAME

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT DATENAME(MONTH, created_at) AS dn FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dn | text | expression |

---
## DATEDIFF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT DATEDIFF(DAY, d, created_at) AS dd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dd | integer | expression |

---
## EOMONTH

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT EOMONTH(d) AS eo FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| eo | date | expression |

---
## DATEADD / DATEPART

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT DATEADD(DAY, 1, d) AS da, DATEPART(YEAR, d) AS dy FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| da | date | expression |
| dy | integer | expression |

---
## AT TIME ZONE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT created_at AT TIME ZONE 'UTC' AS tz FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tz | unknown | — |

---
# 文字列・型

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/functions/string-functions-transact-sql?view=sql-server-ver17)

---

## CHECKSUM / BINARY_CHECKSUM / PATINDEX

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT CHECKSUM(name) AS cs, BINARY_CHECKSUM(name) AS bc, PATINDEX('%a%', name) AS pi FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cs | text | expression |
| bc | integer | expression |
| pi | text | polyglot |

---
## DATALENGTH

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT DATALENGTH(name) AS dl FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dl | integer | expression |

---
## @@SPID / DB_NAME / APP_NAME

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT @@SPID AS spid, DB_NAME() AS db, HOST_NAME() AS host, APP_NAME() AS app FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| spid | integer | expression |
| db | text | expression |
| host | text | expression |
| app | text | expression |

---
## NEWID / NEWSEQUENTIALID

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT NEWID() AS nid, NEWSEQUENTIALID() AS nsid FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nid | uuid | expression |
| nsid | uuid | expression |

---
## LEN / STUFF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT LEN(name) AS l, STUFF(name, 1, 0, 'x') AS s FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| l | integer | polyglot |
| s | unknown | — |

---
## OBJECT_NAME / OBJECT_ID

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT OBJECT_NAME(id) AS oname, SCHEMA_NAME(id) AS sname, DB_ID() AS dbid, OBJECT_ID('users') AS oid FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| oname | text | expression |
| sname | text | expression |
| dbid | integer | expression |
| oid | text | polyglot |

---
## SUSER_NAME / SYSTEM_USER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT SUSER_NAME() AS su, SYSTEM_USER AS sy FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| su | text | expression |
| sy | text | expression |

---
## @@IDENTITY / SCOPE_IDENTITY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT @@IDENTITY AS i, SCOPE_IDENTITY() AS si FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| i | unknown | — |
| si | unknown | — |

---
# JSON

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/functions/json-functions-transact-sql?view=sql-server-ver17)

---

## JSON_VALUE / JSON_QUERY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT JSON_VALUE(data, '$.name') AS jv, JSON_QUERY(data, '$.items') AS jq FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jv | text | expression |
| jq | json | expression |

---
## OPENJSON WITH

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
SELECT * FROM OPENJSON('{"a": 1}') WITH (a INT '$.a')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | integer | openjson.a |

---
## OPENJSON 既定列

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
binds: text
```

```sql
SELECT [key], value, type FROM OPENJSON(@json)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| key | text | openjson.key |
| value | text | openjson.value |
| type | integer | openjson.type |

---
## JSON_MODIFY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT JSON_MODIFY(data, '$.x', 1) AS jm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jm | unknown | — |

---
# PIVOT

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/from-using-pivot-and-unpivot?view=sql-server-ver17)

---

## PIVOT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT p.* FROM users PIVOT (SUM(age) FOR dept IN ([IT], [HR])) p
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | p.id |
| name | text | p.name |
| data | text | p.data |
| created_at | datetime | p.created_at |
| d | date | p.d |
| IT | integer | p.IT |
| HR | integer | p.HR |

---
# 出力句

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/for-json?view=sql-server-ver17)

---

## FOR JSON PATH

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT id, name FROM users FOR JSON PATH
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
## FOR JSON AUTO

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT id, name FROM users FOR JSON AUTO
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
## FOR XML PATH

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT id, name FROM users FOR XML PATH
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
## FOR XML RAW

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT id, name FROM users FOR XML RAW
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
# テーブル関数

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/functions/string-split-transact-sql?view=sql-server-ver17)

---

## STRING_SPLIT

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
SELECT * FROM STRING_SPLIT('a,b', ',')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| value | text | string_split.value |

---
## OPENQUERY

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
SELECT * FROM OPENQUERY(server, 'SELECT 1 AS id')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | openquery.id |

---
## OPENROWSET

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
SELECT * FROM OPENROWSET('SQLNCLI', 'server=x;', 'SELECT 1 AS id') AS o
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | o.id |

---
# DML

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)

---

## INSERT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
dialect: tsql
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
dialect: tsql
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
## INSERT ... SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
INSERT INTO active_users(name) SELECT name FROM users
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
# OUTPUT

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)

---

## INSERT OUTPUT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
INSERT INTO users(name) OUTPUT inserted.id, inserted.name VALUES ('alice')
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
## UPDATE OUTPUT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
UPDATE users SET name = 'bob' OUTPUT inserted.id, deleted.name WHERE id = 1
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
## DELETE OUTPUT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
DELETE FROM users OUTPUT deleted.id WHERE id = 1
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
## UPDATE OUTPUT inserted.*

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
UPDATE users SET name = 'bob' OUTPUT inserted.* WHERE id = 1
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
| data | text | users.data |
| created_at | datetime | users.created_at |
| d | date | users.d |

---
## DELETE OUTPUT deleted.*

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
DELETE FROM users OUTPUT deleted.* WHERE id = 1
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
| data | text | users.data |
| created_at | datetime | users.created_at |
| d | date | users.d |

---
# MERGE

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)

---

## MERGE（結果なし）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
MERGE users AS t USING orders AS s ON t.id = s.user_id WHEN MATCHED THEN UPDATE SET name = t.name
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
## MERGE OUTPUT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
MERGE users AS t USING orders AS s ON t.id = s.user_id WHEN MATCHED THEN UPDATE SET name = t.name OUTPUT inserted.id, inserted.name
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
## MERGE OUTPUT inserted/deleted

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
MERGE INTO users AS t USING users AS s ON t.id = s.id WHEN MATCHED THEN UPDATE SET name = s.name OUTPUT inserted.id, deleted.name
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
# 時間指定

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/tables/temporal-tables?view=sql-server-ver17)

---

## FOR SYSTEM_TIME

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT * FROM users FOR SYSTEM_TIME AS OF '2020-01-01'
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
| data | text | users.data |
| created_at | datetime | users.created_at |
| d | date | users.d |

---
# スキーマ修飾

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)

---

## dbo.people

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: tsql
```

```sql
SELECT id, name FROM dbo.people
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | dbo.people.id |
| name | text | dbo.people.name |

---
## dbo エイリアス

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: tsql
```

```sql
SELECT p.id, p.name FROM dbo.people AS p
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | dbo.people.id |
| name | text | dbo.people.name |

---
# カタログ

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/relational-databases/system-catalog-views/sys-tables-transact-sql?view=sql-server-ver17)

---

## sys.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
SELECT name, create_date FROM sys.tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | sys.tables.name |
| create_date | timestamp | sys.tables.create_date |

---
## sys.databases

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
SELECT name, database_id FROM sys.databases
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | sys.databases.name |
| database_id | integer | sys.databases.database_id |

---
## sys.indexes

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
SELECT name, index_id FROM sys.indexes
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | sys.indexes.name |
| index_id | integer | sys.indexes.index_id |

---
# DMV

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-requests-transact-sql?view=sql-server-ver17)

---

## sys.dm_exec_sessions

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
SELECT session_id, login_name FROM sys.dm_exec_sessions
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| session_id | integer | sys.dm_exec_sessions.session_id |
| login_name | text | sys.dm_exec_sessions.login_name |

---
## sys.dm_exec_requests

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
SELECT session_id, command FROM sys.dm_exec_requests
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| session_id | integer | sys.dm_exec_requests.session_id |
| command | text | sys.dm_exec_requests.command |

---
# ストアドプロシージャ

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/relational-databases/system-stored-procedures/sp-help-transact-sql?view=sql-server-ver17)

---

## sp_help

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_help users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Name | text | cast |
| Owner | text | cast |
| Type | text | cast |
| Created_datetime | timestamp | cast |

---
## sp_who

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
EXECUTE sp_who
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| spid | integer | cast |
| ecid | integer | cast |
| status | text | cast |
| loginame | text | cast |
| hostname | text | cast |
| blk | text | cast |
| dbname | text | cast |
| cmd | text | cast |
| request_id | integer | cast |

---
## sp_columns

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_columns users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| TABLE_QUALIFIER | text | cast |
| TABLE_OWNER | text | cast |
| TABLE_NAME | text | cast |
| COLUMN_NAME | text | cast |
| DATA_TYPE | integer | cast |
| TYPE_NAME | text | cast |
| PRECISION | integer | cast |
| LENGTH | integer | cast |
| SCALE | integer | cast |
| RADIX | integer | cast |
| NULLABLE | integer | cast |
| REMARKS | text | cast |

---
## sp_tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| TABLE_QUALIFIER | text | cast |
| TABLE_OWNER | text | cast |
| TABLE_NAME | text | cast |
| TABLE_TYPE | text | cast |
| REMARKS | text | cast |

---
## sp_spaceused

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_spaceused users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | cast |
| rows | text | cast |
| reserved | text | cast |
| data | text | cast |
| index_size | text | cast |
| unused | text | cast |

---
## WITH RESULT SETS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
EXEC dbo.my_proc WITH RESULT SETS ((id INT, name NVARCHAR(20)))
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
## CREATE PROCEDURE + EXEC

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
CREATE PROCEDURE p AS SELECT id, name FROM users; EXEC p
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| name | text | users.name |

---
## sp_helpindex

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_helpindex users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| index_name | text | cast |
| index_description | text | cast |
| index_keys | text | cast |

---
## sp_helpconstraint

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_helpconstraint users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| constraint_type | text | cast |
| constraint_name | text | cast |
| delete_action | text | cast |
| update_action | text | cast |
| status_enabled | text | cast |
| status_for_replication | text | cast |
| constraint_keys | text | cast |

---
## sp_databases

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_databases
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| DATABASE_NAME | text | cast |
| DATABASE_SIZE | integer | cast |
| REMARKS | text | cast |

---
## sp_pkeys / sp_fkeys

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_pkeys users; EXEC sp_fkeys users
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| PKTABLE_QUALIFIER | text | cast |
| PKTABLE_OWNER | text | cast |
| PKTABLE_NAME | text | cast |
| PKCOLUMN_NAME | text | cast |
| FKTABLE_QUALIFIER | text | cast |
| FKTABLE_OWNER | text | cast |
| FKTABLE_NAME | text | cast |
| FKCOLUMN_NAME | text | cast |
| KEY_SEQ | integer | cast |
| FK_NAME | text | cast |
| PK_NAME | text | cast |

---
## sp_statistics

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_statistics users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| TABLE_QUALIFIER | text | cast |
| TABLE_OWNER | text | cast |
| TABLE_NAME | text | cast |
| NON_UNIQUE | integer | cast |
| INDEX_QUALIFIER | text | cast |
| INDEX_NAME | text | cast |
| TYPE | integer | cast |
| SEQ_IN_INDEX | integer | cast |
| COLUMN_NAME | text | cast |
| COLLATION | text | cast |
| CARDINALITY | integer | cast |
| PAGES | integer | cast |
| FILTER_CONDITION | text | cast |

---
## sp_special_columns

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_special_columns users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| SCOPE | integer | cast |
| COLUMN_NAME | text | cast |
| DATA_TYPE | integer | cast |
| TYPE_NAME | text | cast |
| PRECISION | integer | cast |
| LENGTH | integer | cast |
| SCALE | integer | cast |
| PSEUDO_COLUMN | integer | cast |

---
## sp_server_info

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_server_info
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| attribute_id | integer | cast |
| attribute_name | text | cast |
| attribute_value | text | cast |

---
## sp_helpdb

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_helpdb
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | cast |
| db_size | text | cast |
| owner | text | cast |
| dbid | integer | cast |
| created | text | cast |
| status | text | cast |
| compatibility_level | integer | cast |

---
## sp_stored_procedures

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
EXEC sp_stored_procedures
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| PROCEDURE_QUALIFIER | text | cast |
| PROCEDURE_OWNER | text | cast |
| PROCEDURE_NAME | text | cast |
| NUM_INPUT_PARAMS | integer | cast |
| NUM_OUTPUT_PARAMS | integer | cast |
| NUM_RESULT_SETS | integer | cast |
| REMARKS | text | cast |
| PROCEDURE_TYPE | integer | cast |

---
# 関数

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-function-transact-sql?view=sql-server-ver17)

---

## CREATE FUNCTION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
CREATE FUNCTION dbo.add_one(@x INT) RETURNS INT AS BEGIN RETURN @x + 1; END;
SELECT dbo.add_one(age) AS n FROM users
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| n | unknown | — |

---
# スキーマ追跡

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)

---

## CREATE VIEW と SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
CREATE VIEW active AS SELECT id, name FROM users WHERE age >= 18;
SELECT name FROM active
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | active.name |

---
## SELECT INTO

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT id INTO #ids FROM users;
SELECT id FROM #ids
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | #ids.id |

---
## CREATE SYNONYM

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
CREATE SYNONYM p FOR users;
SELECT name FROM p
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | p.name |

---
## ALTER TABLE ADD COLUMN

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
CREATE TABLE t(id INT);
ALTER TABLE t ADD name NVARCHAR(20);
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
## IDENTITY 列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
CREATE TABLE t(id INT IDENTITY(1, 1) PRIMARY KEY, name NVARCHAR(20));
SELECT id, name FROM t
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
| name | text | t.name |

---
## CREATE TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
CREATE TABLE t(id INT, name NVARCHAR(20));
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
# 一時テーブル

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)

---

## CREATE TABLE #temp

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
CREATE TABLE #t(id INT, name NVARCHAR(20));
SELECT name FROM #t
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | #t.name |

---
# 結果なし文

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/language-reference?view=sql-server-ver17)

---

## BEGIN TRANSACTION

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
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
dialect: tsql
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
dialect: tsql
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
## TRUNCATE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
TRUNCATE TABLE users
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
dialect: tsql
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
dialect: tsql
```

```sql
DROP INDEX idx_users_name ON users
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
dialect: tsql
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
## RAISERROR

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
```

```sql
RAISERROR('error', 16, 1)
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

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/language-reference?view=sql-server-ver17)

---

## パースエラー（タイポ）

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: tsql
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
| UNPIVOT | 複雑な `UNPIVOT` 句 | パース未対応または `unknown` |
| OPENQUERY / OPENROWSET | リンクサーバー経由 | 列は推論されるが型は `unknown` になりやすい |
| テーブル変数 / sp_rename | `DECLARE @t TABLE`、`sp_rename` | パース未対応 |
| 動的 EXEC | `EXEC dbo.my_proc`（結果セット宣言なし） | `SQLDESC_RUNTIME_RESULT_SHAPE` 警告 |
| DBCC | `DBCC CHECKDB` 等 | 結果列なし + 実行時依存 |
| スキーマ修飾（メタなし） | `dbo.people` | `unknown` になりやすい（`Prepare-2` で解決） |
| DML | `INSERT` / `UPDATE` / `DELETE`（OUTPUT なし） | 結果列なし |
| メタデータ依存 | 未登録テーブル参照 | `unknown` + warnings |
