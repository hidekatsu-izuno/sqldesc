# Microsoft Fabric SQL テストケース

このドキュメントは [Microsoft Fabric SQL 公式ドキュメント](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql) に基づき、`sqldesc` が Microsoft Fabric SQL 方言（`--dialect fabric`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/fabric.md`）。

```yaml
doc: sqldesc-test/v1
dialect: fabric
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、**TOP** / TOP PERCENT、OFFSET / FETCH、DISTINCT、角括弧識別子、FROM 句なし |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、**STRING_AGG**、COUNT DISTINCT、percentile_cont |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG / LEAD、NTILE、dense_rank / cume_dist、ウィンドウ集約 |
| APPLY | **CROSS APPLY**（OPENJSON / STRING_SPLIT）、**OUTER APPLY** |
| 型・関数 | JSON、日時・文字列、ISNULL / COALESCE / IIF、TRY_CAST / CONVERT |
| PIVOT / 出力句 | **PIVOT**、**FOR JSON PATH / AUTO**、**FOR XML PATH**、**FOR SYSTEM_TIME** |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、EXCEPT、UNION、INTERSECT |
| カタログ・DMV | **sys.tables** / **sys.databases** / **sys.indexes**、**sys.dm_exec_sessions** / **sys.dm_exec_requests** |
| メタデータ | sp_help / sp_columns、information_schema、@@VERSION |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [SELECT (Transact-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql) |
| TOP | [TOP (Transact-SQL)](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql) |
| ウィンドウ関数 | [OVER clause](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-over-clause-transact-sql) |
| JSON | [JSON functions](https://learn.microsoft.com/en-us/sql/t-sql/functions/json-functions-transact-sql) |
| APPLY | [FROM clause](https://learn.microsoft.com/en-us/sql/t-sql/queries/from-transact-sql) |
| PIVOT | [PIVOT and UNPIVOT](https://learn.microsoft.com/en-us/sql/t-sql/queries/from-using-pivot-and-unpivot) |
| 時間指定 | [Temporal tables](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal-tables) |
| カタログ | [sys.tables](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-tables-transact-sql) |

Docker 検証:

- Microsoft Fabric SQL 本体の公式 Docker イメージは存在しない。T-SQL 互換の **`mcr.microsoft.com/mssql/server:2022-latest`** をローカル代替として起動し、TDS プロトコル（ポート **1433**）で接続する。
- 一括検証: `node scripts/verify-fabric-doc.mjs`

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: fabric
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  data TEXT,
  tags TEXT,
  created_at TIMESTAMP,
  d DATE
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

---

# SELECT 基本

[Microsoft Fabric SQL SELECT](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| id | int | users.id |
| name | nvarchar(max) | users.name |
| amount | decimal(38, 10) | users.amount |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| name | nvarchar(max) | users.name |
| age | int | users.age |
| dept | nvarchar(max) | users.dept |
| amount | decimal(38, 10) | users.amount |
| data | nvarchar(max) | users.data |
| tags | nvarchar(max) | users.tags |
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
dialect: fabric
```

```sql
SELECT TOP 5 id, name FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| name | nvarchar(max) | users.name |

---
## TOP PERCENT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT TOP 10 PERCENT id FROM users ORDER BY id
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
dialect: fabric
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
dialect: fabric
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
| dept | nvarchar(max) | users.dept |

---
## 角括弧識別子

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| name | nvarchar(max) | users.name |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: fabric
```

```sql
SELECT 1 AS one, 'x' AS label, CAST(1 AS bit) AS ok
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | int | literal |
| label | nvarchar(max) | literal |
| ok | bit | polyglot |

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
dialect: fabric
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
| id | int | users.id |
| amount | decimal(38, 10) | orders.amount |

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
dialect: fabric
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
| dept | nvarchar(max) | users.dept |
| cnt | int | expression |
| total | decimal(38, 10) | expression |

---
## STRING_AGG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT dept, STRING_AGG(name, ',') WITHIN GROUP (ORDER BY id) AS sa FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | nvarchar(max) | users.dept |
| sa | nvarchar(max) | expression |

---
## COUNT DISTINCT / percentile_cont

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT (SELECT COUNT(DISTINCT dept) FROM users) AS cd, (SELECT TOP 1 PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) OVER () FROM users) AS pc
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cd | bigint | polyglot |
| pc | decimal(38, 10) | expression |

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
dialect: fabric
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
| id | int | users.id |
| rn | int | expression |

---
## RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| id | int | users.id |
| rk | int | expression |

---
## LAG / LEAD

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT id, LAG(amount, 1) OVER (ORDER BY id) AS prev, LEAD(amount, 1) OVER (ORDER BY id) AS nxt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| prev | decimal(38, 10) | expression |
| nxt | decimal(38, 10) | expression |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| id | int | users.id |
| quartile | int | expression |

---
## dense_rank / cume_dist

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| id | int | users.id |
| dr | int | expression |
| cd | decimal(38, 10) | expression |

---
## ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| id | int | users.id |
| running | decimal(38, 10) | polyglot |

---

# APPLY

---

## CROSS APPLY OPENJSON

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT id, value FROM users CROSS APPLY OPENJSON(data) WITH (value NVARCHAR(100) '$.x')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| value | nvarchar(100) | openjson.value |

---
## CROSS APPLY STRING_SPLIT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT id, value FROM users CROSS APPLY STRING_SPLIT(tags, ',')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| value | nvarchar(max) | string_split.value |

---
## OUTER APPLY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT id, part FROM users OUTER APPLY (SELECT TOP 1 amount AS part FROM orders WHERE user_id = users.id) o
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| part | decimal(38, 10) | o.part |

---

# 型・関数

---

## JSON

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT id, JSON_VALUE(data, '$.x') AS jv, JSON_QUERY(data, '$.y') AS jq FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| jv | nvarchar(max) | expression |
| jq | nvarchar(max) | expression |

---
## 日時・文字列

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT DATEADD(day, 7, created_at) AS da, DATEDIFF(day, d, created_at) AS dd, EOMONTH(d) AS em, created_at AT TIME ZONE 'UTC' AS tz, FORMAT(created_at, 'yyyy-MM') AS fm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| da | datetime2(7) | expression |
| dd | int | expression |
| em | date | expression |
| tz | datetimeoffset | expression |
| fm | nvarchar(max) | expression |

---
## ISNULL / COALESCE / IIF / TRY_CAST / CONVERT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT ISNULL(amount, 0) AS ia, COALESCE(name, 'unknown') AS cn, IIF(age > 30, 'senior', 'junior') AS tier, TRY_CAST(name AS int) AS ti, CONVERT(decimal(10, 2), amount) AS ca FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ia | int | polyglot |
| cn | nvarchar(max) | expression |
| tier | nvarchar(max) | expression |
| ti | int | polyglot |
| ca | decimal(10,2) | expression |

---
## NEWID / GETDATE / SYSDATETIME

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT NEWID() AS nid, GETDATE() AS gd, SYSDATETIME() AS sd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nid | uniqueidentifier | expression |
| gd | datetime2(7) | expression |
| sd | datetime2(7) | expression |

---
## CONCAT / CHOOSE / CASE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT CONCAT(name, ' (', dept, ')') AS cn, CHOOSE(age % 3 + 1, 'a', 'b', 'c') AS ch, CASE WHEN age > 30 THEN 'senior' ELSE 'junior' END AS tier FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cn | nvarchar(max) | polyglot |
| ch | nvarchar(max) | expression |
| tier | nvarchar(max) | expression |

---

# PIVOT / 出力句

---

## PIVOT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT * FROM users PIVOT (SUM(amount) FOR dept IN ([sales], [eng])) AS p
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | p.id |
| name | nvarchar(max) | p.name |
| age | int | p.age |
| data | nvarchar(max) | p.data |
| tags | nvarchar(max) | p.tags |
| created_at | datetime2(7) | p.created_at |
| d | date | p.d |
| sales | decimal(38, 10) | p.sales |
| eng | decimal(38, 10) | p.eng |

---
## FOR JSON PATH

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
dialect: fabric
```

```sql
SELECT name, dept, amount FROM users FOR JSON AUTO
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
dialect: fabric
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
## FOR SYSTEM_TIME

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT id, name FROM users FOR SYSTEM_TIME ALL
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| name | nvarchar(max) | users.name |

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
dialect: fabric
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
| id | int | cte.id |
| name | nvarchar(max) | cte.name |

---
## 相関副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| name | nvarchar(max) | users.name |
| max_order | decimal(38, 10) | expression |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| id | int | cast |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| id | int | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| id | int | cast |

---

# カタログ・DMV

---

## sys.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: fabric
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
dialect: fabric
```

```sql
SELECT database_id, name FROM sys.databases
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| database_id | int | sys.databases.database_id |
| name | nvarchar(max) | sys.databases.name |

---
## sys.indexes

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: fabric
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
## sys.dm_exec_sessions

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: fabric
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
dialect: fabric
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

# メタデータ

---

## sp_help

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
## sp_columns

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| COLUMN_DEF | nvarchar(max) | cast |
| SQL_DATA_TYPE | int | cast |
| SQL_DATETIME_SUB | int | cast |
| CHAR_OCTET_LENGTH | int | cast |
| ORDINAL_POSITION | int | cast |
| IS_NULLABLE | nvarchar(max) | cast |
| SS_DATA_TYPE | int | cast |

---
## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: fabric
```

```sql
SELECT table_name, table_type FROM information_schema.tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | nvarchar(max) | information_schema.tables.table_name |
| table_type | nvarchar(max) | information_schema.tables.table_type |

---
## information_schema.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: fabric
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
| column_name | nvarchar(max) | information_schema.columns.column_name |
| data_type | nvarchar(max) | information_schema.columns.data_type |

---
## @@VERSION / DB_NAME / SCHEMA_NAME

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
```

```sql
SELECT @@VERSION AS ver, DB_NAME() AS dbn, SCHEMA_NAME() AS sn FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ver | nvarchar(max) | expression |
| dbn | nvarchar(max) | expression |
| sn | nvarchar(max) | expression |

---
