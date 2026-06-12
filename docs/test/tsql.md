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
| JOIN | INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL OUTER JOIN、CROSS JOIN、旧式結合（カンマ + WHERE）、共通列 INNER JOIN（NATURAL JOIN 相当） |
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

## Prepare-3: dbo.people テーブル

```yaml
kind: schema-ddl
dialect: tsql
```

```sql
IF OBJECT_ID('dbo.people', 'U') IS NOT NULL DROP TABLE dbo.people;
CREATE TABLE dbo.people (
  id   INT NOT NULL,
  name NVARCHAR(100) NOT NULL
);
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
| id | int | users.id |
| name | nvarchar(100) | users.name |

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
| id | int | users.id |
| name | nvarchar(100) | users.name |
| age | int | users.age |
| dept | nvarchar(50) | users.dept |
| data | nvarchar(max) | users.data |
| created_at | datetime2(7) | users.created_at |
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
| id | int | users.id |
| name | nvarchar(100) | users.name |

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
| id | int | users.id |

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
| id | int | users.id |

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
| dept | nvarchar(50) | users.dept |

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
| id | int | users.id |

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
| one | int | literal |

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
| id | int | users.id |
| name | nvarchar(100) | users.name |

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
| id | int | users.id |
| name | nvarchar(100) | users.name |
| amount | decimal(10,2) | orders.amount |

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
| id | int | users.id |
| amount | decimal(10,2) | orders.amount |

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
| id | int | users.id |
| amount | decimal(10,2) | orders.amount |

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
| id | int | users.id |
| amount | decimal(10,2) | orders.amount |

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
| id | int | users.id |
| id | int | orders.id |

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
| id | int | users.id |
| amount | decimal(10,2) | orders.amount |

---
## 共通列 INNER JOIN（NATURAL JOIN 相当）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT u.id, u.name FROM users u INNER JOIN active_users a ON u.id = a.id
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| name | nvarchar(100) | users.name |

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
| id | int | users.id |
| n | decimal(10,2) | x.n |

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
| id | int | users.id |
| n | decimal(10,2) | x.n |

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
| id | int | users.id |
| name | nvarchar(100) | users.name |

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
| id | int | users.id |

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
| id | int | users.id |

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
| id | int | users.id |
| max_amt | decimal(10,2) | expression |

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
| id | int | t.id |

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
| id | int | users.id |

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
| dept | nvarchar(50) | users.dept |
| cnt | int | expression |

---
## サーバー生成列名（alias なし）

Docker image `mcr.microsoft.com/mssql/server:2022-latest` で実測した未alias式の列名。SQL Server は空の列名を返す。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
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
|  | int | expression |
|  | int | polyglot |
|  | nvarchar(max) | polyglot |

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
| mi | int | expression |
| ma | int | expression |
| av | int | expression |
| su | int | expression |

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
| cd | int | expression |

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
| dept | nvarchar(50) | users.dept |
| names | nvarchar(max) | expression |

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
| dept | nvarchar(50) | users.dept |
| cnt | int | expression |

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
| dept | nvarchar(50) | users.dept |
| cnt | int | expression |

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
| v | decimal(38, 10) | expression |
| s | decimal(38, 10) | expression |

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
| dept | nvarchar(50) | users.dept |
| cnt | int | expression |

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
| dept | nvarchar(50) | users.dept |
| g | int | expression |
| cnt | int | expression |

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
| id | int | active.id |
| name | nvarchar(100) | active.name |

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
| n | int | t.n |

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
| id | int | cast |
| name | nvarchar(100) | cast |

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
| id | int | cast |

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
| id | int | cast |

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
| id | int | cast |

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
| id | int | users.id |
| rn | bigint | expression |

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
| id | int | users.id |
| r | int | expression |
| dr | int | expression |

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
| id | int | users.id |
| la | int | expression |
| le | int | expression |

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
| id | int | orders.id |
| s | decimal(38, 10) | polyglot |

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
| id | int | users.id |
| nt | int | expression |

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
| id | int | orders.id |
| s | decimal(38, 10) | polyglot |

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
| id | int | users.id |
| cd | decimal(38, 10) | expression |
| pr | decimal(38, 10) | expression |

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
| p | decimal(38, 10) | expression |

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
| id | int | users.id |
| status | nvarchar(max) | expression |

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
| a | nvarchar(10) | polyglot |
| b | int | expression |
| c | int | expression |

---
## TRY_CAST / CONVERT / TRY_CONVERT — native type names with modifiers

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT
  CAST(N'x' AS NVARCHAR(12)) AS n12,
  CAST(1.23 AS DECIMAL(8,2)) AS d82,
  CAST('2020-01-01T00:00:00.123' AS DATETIME2(3)) AS dt3,
  CONVERT(VARBINARY(4), 171) AS b4
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n12 | nvarchar(12) | polyglot |
| d82 | decimal(8,2) | polyglot |
| dt3 | datetime2(3) | polyglot |
| b4 | varbinary(4) | expression |

---
## TRY_CAST / CONVERT / TRY_CONVERT — null, temporal, arithmetic metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT
  CAST(NULL AS NVARCHAR(8)) AS null_v,
  COALESCE(NULL, CAST(N'x' AS NCHAR(4))) AS co_c,
  CAST('12:34:56.123' AS TIME(3)) AS tm3,
  CAST('2020-01-01T00:00:00.123+09:00' AS DATETIMEOFFSET(3)) AS dto3,
  CAST(1 AS INT) + CAST(1.25 AS DECIMAL(6,2)) AS add_num
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| null_v | nvarchar(8) | polyglot |
| co_c | nchar(4) | expression |
| tm3 | time(3) | polyglot |
| dto3 | datetimeoffset(3) | polyglot |
| add_num | decimal(13,2) | polyglot |

---
## TRY_CAST / CONVERT / TRY_CONVERT — CASE mixed metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT
  CASE WHEN 1=1 THEN NULL ELSE CAST(N'x' AS NVARCHAR(5)) END AS case_null,
  CASE WHEN 1=1 THEN CAST(1 AS INT) ELSE CAST(1.25 AS DECIMAL(6,2)) END AS case_num,
  CASE WHEN 1=1 THEN CAST(N'x' AS NCHAR(3)) ELSE CAST(N'yy' AS NVARCHAR(7)) END AS case_text
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| case_null | nvarchar(5) | expression |
| case_num | decimal(12,2) | expression |
| case_text | nchar(3) | expression |

---
## UNION — null and mixed numeric metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT CAST(NULL AS NVARCHAR(5)) AS u, CAST(1 AS INT) AS n
UNION ALL
SELECT CAST(N'x' AS NVARCHAR(5)), CAST(1.25 AS DECIMAL(6,2))
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| u | nvarchar(5) | cast |
| n | decimal(12,2) | cast |

---
## 集約 — decimal precision metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT
  SUM(CAST(1.25 AS DECIMAL(6,2))) AS sum_num,
  AVG(CAST(1.25 AS DECIMAL(6,2))) AS avg_num,
  AVG(CAST(1 AS INT)) AS avg_int
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sum_num | decimal(38,2) | expression |
| avg_num | decimal(38,6) | expression |
| avg_int | int | expression |

---
## 文字列連結・日時演算 — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT
  CAST(N'ab' AS NVARCHAR(2)) + CAST(N'cde' AS NVARCHAR(3)) AS concat_text,
  DATEADD(DAY, 1, CAST('2020-01-01' AS DATE)) AS date_plus,
  DATEADD(DAY, 1, CAST('2020-01-01T00:00:00.123' AS DATETIME2(3))) AS ts_plus
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| concat_text | nvarchar(5) | polyglot |
| date_plus | date | expression |
| ts_plus | datetime2(3) | expression |

---
## 算術・文字列関数・ウィンドウ — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT
  CAST(1.25 AS DECIMAL(6,2)) * CAST(2 AS INT) AS mul_num,
  CAST(5 AS INT) / CAST(2 AS INT) AS div_int,
  ROUND(CAST(1.25 AS DECIMAL(6,2)), 1) AS round_num,
  SUBSTRING(CAST(N'abcde' AS NVARCHAR(5)), 2, 3) AS substr_text,
  ROW_NUMBER() OVER (ORDER BY (SELECT 1)) AS rn,
  SUM(CAST(1.25 AS DECIMAL(6,2))) OVER () AS win_sum,
  AVG(CAST(1 AS INT)) OVER () AS win_avg
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mul_num | decimal(17,2) | polyglot |
| div_int | int | polyglot |
| round_num | decimal(6,2) | polyglot |
| substr_text | nvarchar(3) | expression |
| rn | bigint | expression |
| win_sum | decimal(38,2) | polyglot |
| win_avg | int | polyglot |

---
## 型優先順位・リテラル — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT
  COALESCE(NULL, CAST(1 AS INT), CAST(1.25 AS DECIMAL(6,2))) AS co_num,
  COALESCE(NULL, CAST(N'x' AS NCHAR(3)), CAST(N'yy' AS NVARCHAR(7))) AS co_text,
  NULLIF(CAST(1.25 AS DECIMAL(6,2)), CAST(1 AS INT)) AS nullif_num,
  ISNULL(CAST(NULL AS NCHAR(3)), CAST(N'x' AS NVARCHAR(7))) AS isnull_text,
  1 AS lit_int,
  1.25 AS lit_decimal,
  N'abc' AS lit_text,
  NULL AS lit_null,
  CAST('2020-01-01' AS DATE) AS lit_date,
  CAST('2020-01-01T00:00:00.123' AS DATETIME2(3)) AS lit_ts
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| co_num | decimal(12,2) | expression |
| co_text | nchar(3) | expression |
| nullif_num | decimal(6,2) | polyglot |
| isnull_text | nchar(3) | polyglot |
| lit_int | int | literal |
| lit_decimal | decimal(3,2) | literal |
| lit_text | nvarchar(3) |  |
| lit_null | int | literal |
| lit_date | date | polyglot |
| lit_ts | datetime2(3) | polyglot |

---
## 日時差分・述語相当列 — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT
  DATEDIFF(DAY, CAST('2020-01-01' AS DATE), CAST('2020-01-03' AS DATE)) AS date_diff_days,
  DATEDIFF(SECOND, CAST('2020-01-01T00:00:00' AS DATETIME2(0)), CAST('2020-01-01T00:00:10' AS DATETIME2(0))) AS ts_diff_seconds,
  CAST(IIF(1 = 1, 1, 0) AS BIT) AS pred_eq,
  CAST(IIF(NULL IS NULL, 1, 0) AS BIT) AS pred_null,
  CAST(IIF(2 BETWEEN 1 AND 3, 1, 0) AS BIT) AS pred_between,
  CAST(IIF(2 IN (1, 2, 3), 1, 0) AS BIT) AS pred_in
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| date_diff_days | int | expression |
| ts_diff_seconds | int | expression |
| pred_eq | bit | polyglot |
| pred_null | bit | polyglot |
| pred_between | bit | polyglot |
| pred_in | bit | polyglot |

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
| a | int | polyglot |
| c | int | expression |

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
| adult | int | expression |
| c | nvarchar(max) | expression |

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
| id | int | users.id |

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
| id | int | users.id |

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
| id | int | users.id |

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
| f | nvarchar(max) | expression |
| c | nvarchar(max) | polyglot |

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
| c | nvarchar(100) | users.name |

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
| v | nvarchar(max) | expression |

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
| gd | datetime2(7) | expression |
| sdt | datetime2(7) | expression |
| sudt | datetime2(7) | expression |

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
| dn | nvarchar(max) | expression |

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
| dd | int | expression |

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
| dy | int | expression |

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
| tz | datetimeoffset | expression |

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
| cs | nvarchar(100) | expression |
| bc | int | expression |
| pi | nvarchar(max) | polyglot |

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
| dl | int | expression |

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
| spid | int | expression |
| db | nvarchar(max) | expression |
| host | nvarchar(max) | expression |
| app | nvarchar(max) | expression |

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
DECLARE @g TABLE (id UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID());
INSERT INTO @g DEFAULT VALUES;
SELECT NEWID() AS nid, CAST((SELECT TOP 1 id FROM @g) AS UNIQUEIDENTIFIER) AS nsid;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nid | uniqueidentifier | expression |
| nsid | uniqueidentifier | polyglot |

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
| l | int | polyglot |
| s | nvarchar(max) | expression |

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
| oname | nvarchar(max) | expression |
| sname | nvarchar(max) | expression |
| dbid | int | expression |
| oid | nvarchar(max) | polyglot |

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
| su | nvarchar(max) | expression |
| sy | nvarchar(max) | expression |

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
| i | int | expression |
| si | int | expression |

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
| jv | nvarchar(max) | expression |
| jq | nvarchar(max) | expression |

---
## JSON extraction — result metadata

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tsql
```

```sql
SELECT
  JSON_QUERY(N'{"name":"bob","items":[1,2]}', '$.items') AS json_items,
  JSON_VALUE(N'{"name":"bob","items":[1,2]}', '$.name') AS json_name,
  ISJSON(N'{"name":"bob","items":[1,2]}') AS json_is_valid
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| json_items | nvarchar(4000) | expression |
| json_name | nvarchar(4000) | expression |
| json_is_valid | int | polyglot |

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
| a | int | openjson.a |

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
DECLARE @json NVARCHAR(MAX) = N'{"a": 1}';
SELECT [key], value, type FROM OPENJSON(@json);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| key | nvarchar(max) | openjson.key |
| value | nvarchar(max) | openjson.value |
| type | int | openjson.type |

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
| jm | nvarchar(max) | expression |

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
| id | int | p.id |
| name | nvarchar(100) | p.name |
| data | nvarchar(max) | p.data |
| created_at | datetime2(7) | p.created_at |
| d | date | p.d |
| IT | int | p.IT |
| HR | int | p.HR |

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
|  | nvarchar(max) | cast |

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
|  | nvarchar(max) | cast |

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
|  | xml | cast |

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
|  | xml | cast |

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
| value | nvarchar(max) | string_split.value |

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
| id | int | openquery.id |

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
| id | int | o.id |

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
INSERT INTO active_users(id, name) SELECT id + 100, name FROM users
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
| id | int | users.id |
| name | nvarchar(100) | users.name |

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
| id | int | users.id |
| name | nvarchar(100) | users.name |

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
| id | int | users.id |

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
| id | int | users.id |
| name | nvarchar(100) | users.name |
| age | int | users.age |
| dept | nvarchar(50) | users.dept |
| data | nvarchar(max) | users.data |
| created_at | datetime2(7) | users.created_at |
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
| id | int | users.id |
| name | nvarchar(100) | users.name |
| age | int | users.age |
| dept | nvarchar(50) | users.dept |
| data | nvarchar(max) | users.data |
| created_at | datetime2(7) | users.created_at |
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
MERGE users AS t USING src AS s ON t.id = s.id WHEN MATCHED THEN UPDATE SET name = s.name;
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
MERGE users AS t USING src AS s ON t.id = s.id WHEN MATCHED THEN UPDATE SET name = s.name OUTPUT inserted.id, inserted.name;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| name | nvarchar(100) | users.name |

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
MERGE INTO users AS t USING users AS s ON t.id = s.id WHEN MATCHED THEN UPDATE SET name = s.name OUTPUT inserted.id, deleted.name;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| name | nvarchar(100) | users.name |

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
| id | int | users.id |
| name | nvarchar(100) | users.name |
| age | int | users.age |
| dept | nvarchar(50) | users.dept |
| data | nvarchar(max) | users.data |
| created_at | datetime2(7) | users.created_at |
| d | date | users.d |

---
# スキーマ修飾

[SQL Server T-SQL リファレンス](https://learn.microsoft.com/ja-jp/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)

---

## dbo.people

### Given

```yaml
prepare: Prepare-2, Prepare-3
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
| id | int | dbo.people.id |
| name | nvarchar(max) | dbo.people.name |

---
## dbo エイリアス

### Given

```yaml
prepare: Prepare-2, Prepare-3
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
| id | int | dbo.people.id |
| name | nvarchar(max) | dbo.people.name |

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
| name | nvarchar(max) | sys.tables.name |
| create_date | datetime2(7) | sys.tables.create_date |

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
| name | nvarchar(max) | sys.databases.name |
| database_id | int | sys.databases.database_id |

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
| name | nvarchar(max) | sys.indexes.name |
| index_id | int | sys.indexes.index_id |

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
| session_id | int | sys.dm_exec_sessions.session_id |
| login_name | nvarchar(max) | sys.dm_exec_sessions.login_name |

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
| session_id | int | sys.dm_exec_requests.session_id |
| command | nvarchar(max) | sys.dm_exec_requests.command |

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
| Name | nvarchar(max) | cast |
| Owner | nvarchar(max) | cast |
| Type | nvarchar(max) | cast |
| Created_datetime | datetime2(7) | cast |

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
| spid | int | cast |
| ecid | int | cast |
| status | nvarchar(max) | cast |
| loginame | nvarchar(max) | cast |
| hostname | nvarchar(max) | cast |
| blk | nvarchar(max) | cast |
| dbname | nvarchar(max) | cast |
| cmd | nvarchar(max) | cast |
| request_id | int | cast |

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
| TABLE_QUALIFIER | nvarchar(max) | cast |
| TABLE_OWNER | nvarchar(max) | cast |
| TABLE_NAME | nvarchar(max) | cast |
| COLUMN_NAME | nvarchar(max) | cast |
| DATA_TYPE | int | cast |
| TYPE_NAME | nvarchar(max) | cast |
| PRECISION | int | cast |
| LENGTH | int | cast |
| SCALE | int | cast |
| RADIX | int | cast |
| NULLABLE | int | cast |
| REMARKS | nvarchar(max) | cast |

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
| TABLE_QUALIFIER | nvarchar(max) | cast |
| TABLE_OWNER | nvarchar(max) | cast |
| TABLE_NAME | nvarchar(max) | cast |
| TABLE_TYPE | nvarchar(max) | cast |
| REMARKS | nvarchar(max) | cast |

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
| name | nvarchar(max) | cast |
| rows | nvarchar(max) | cast |
| reserved | nvarchar(max) | cast |
| data | nvarchar(max) | cast |
| index_size | nvarchar(max) | cast |
| unused | nvarchar(max) | cast |

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
CREATE PROCEDURE dbo.my_proc AS SELECT 1 AS id, N'a' AS name;
EXEC dbo.my_proc WITH RESULT SETS ((id INT, name NVARCHAR(20)));
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | cast |
| name | nvarchar(20) | cast |

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
| id | int | users.id |
| name | nvarchar(100) | users.name |

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
| index_name | nvarchar(max) | cast |
| index_description | nvarchar(max) | cast |
| index_keys | nvarchar(max) | cast |

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
| constraint_type | nvarchar(max) | cast |
| constraint_name | nvarchar(max) | cast |
| delete_action | nvarchar(max) | cast |
| update_action | nvarchar(max) | cast |
| status_enabled | nvarchar(max) | cast |
| status_for_replication | nvarchar(max) | cast |
| constraint_keys | nvarchar(max) | cast |

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
| DATABASE_NAME | nvarchar(max) | cast |
| DATABASE_SIZE | int | cast |
| REMARKS | nvarchar(max) | cast |

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
| PKTABLE_QUALIFIER | nvarchar(max) | cast |
| PKTABLE_OWNER | nvarchar(max) | cast |
| PKTABLE_NAME | nvarchar(max) | cast |
| PKCOLUMN_NAME | nvarchar(max) | cast |
| FKTABLE_QUALIFIER | nvarchar(max) | cast |
| FKTABLE_OWNER | nvarchar(max) | cast |
| FKTABLE_NAME | nvarchar(max) | cast |
| FKCOLUMN_NAME | nvarchar(max) | cast |
| KEY_SEQ | int | cast |
| FK_NAME | nvarchar(max) | cast |
| PK_NAME | nvarchar(max) | cast |

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
| TABLE_QUALIFIER | nvarchar(max) | cast |
| TABLE_OWNER | nvarchar(max) | cast |
| TABLE_NAME | nvarchar(max) | cast |
| NON_UNIQUE | int | cast |
| INDEX_QUALIFIER | nvarchar(max) | cast |
| INDEX_NAME | nvarchar(max) | cast |
| TYPE | int | cast |
| SEQ_IN_INDEX | int | cast |
| COLUMN_NAME | nvarchar(max) | cast |
| COLLATION | nvarchar(max) | cast |
| CARDINALITY | int | cast |
| PAGES | int | cast |
| FILTER_CONDITION | nvarchar(max) | cast |

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
| SCOPE | int | cast |
| COLUMN_NAME | nvarchar(max) | cast |
| DATA_TYPE | int | cast |
| TYPE_NAME | nvarchar(max) | cast |
| PRECISION | int | cast |
| LENGTH | int | cast |
| SCALE | int | cast |
| PSEUDO_COLUMN | int | cast |

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
| attribute_id | int | cast |
| attribute_name | nvarchar(max) | cast |
| attribute_value | nvarchar(max) | cast |

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
| name | nvarchar(max) | cast |
| db_size | nvarchar(max) | cast |
| owner | nvarchar(max) | cast |
| dbid | int | cast |
| created | nvarchar(max) | cast |
| status | nvarchar(max) | cast |
| compatibility_level | int | cast |

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
| PROCEDURE_QUALIFIER | nvarchar(max) | cast |
| PROCEDURE_OWNER | nvarchar(max) | cast |
| PROCEDURE_NAME | nvarchar(max) | cast |
| NUM_INPUT_PARAMS | int | cast |
| NUM_OUTPUT_PARAMS | int | cast |
| NUM_RESULT_SETS | int | cast |
| REMARKS | nvarchar(max) | cast |
| PROCEDURE_TYPE | int | cast |

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
| n | int | function |

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
| name | nvarchar(100) | active.name |

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
| id | int | #ids.id |

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
CREATE SYNONYM p FOR dbo.users;
SELECT name FROM p;
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| name | nvarchar(100) | p.name |

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
| name | nvarchar(20) | t.name |

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
| id | int | t.id |
| name | nvarchar(20) | t.name |

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
| name | nvarchar(20) | t.name |

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
| name | nvarchar(20) | #t.name |

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
BEGIN TRANSACTION;
COMMIT;
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
BEGIN TRANSACTION;
ROLLBACK;
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
CREATE INDEX idx_users_name ON users(name);
DROP INDEX idx_users_name ON users;
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
RAISERROR('error', 10, 1)
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
| NATURAL JOIN | `NATURAL JOIN` | SQL Server 非対応。共通列での `INNER JOIN` を使用する |
| NEWSEQUENTIALID | `SELECT NEWSEQUENTIALID()` | `DEFAULT` 式専用。`SELECT` ではテーブル変数等で取得する |
| OPENQUERY / OPENROWSET | リンクサーバー経由 | リテラル SQL は静的に推論する。実行にはリンクサーバー登録や `Ad Hoc Distributed Queries` の有効化が必要 |
| UNPIVOT | 複雑な `UNPIVOT` 句 | パース未対応または `unknown` |
| テーブル変数 / sp_rename | `DECLARE @t TABLE`、`sp_rename` | パース未対応 |
| 動的 EXEC | `EXEC dbo.my_proc`（結果セット宣言なし） | `SQLDESC_RUNTIME_RESULT_SHAPE` 警告 |
| DBCC | `DBCC CHECKDB` 等 | 結果列なし + 実行時依存 |
| スキーマ修飾（メタなし） | `dbo.people` | `unknown` になりやすい（`Prepare-2` で解決） |
| DML | `INSERT` / `UPDATE` / `DELETE`（OUTPUT なし） | 結果列なし |
| メタデータ依存 | 未登録テーブル参照 | `unknown` + warnings |
