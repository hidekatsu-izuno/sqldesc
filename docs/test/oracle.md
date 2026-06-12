# Oracle テストケース

このドキュメントは [Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/index.html) に基づき、`sqldesc` が Oracle 方言（`--dialect oracle`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは [Given-When-Then](https://en.wikipedia.org/wiki/Given-When-Then) 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc` / `npm run test:doc:file -- docs/test/oracle.md`）。

```yaml
doc: sqldesc-test/v1
dialect: oracle
```

## ドキュメント形式（sqldesc-test/v1）

[sqlite.md](sqlite.md) / [postgresql.md](postgresql.md) / [mysql.md](mysql.md) と同じ形式です。

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FETCH FIRST、ROWNUM、DISTINCT、ORDER BY、SAMPLE、ROWID |
| JOIN | INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL OUTER JOIN、CROSS JOIN、NATURAL JOIN、JOIN USING、(+) 外部結合 |
| サブクエリ | IN サブクエリ、EXISTS、NOT EXISTS、スカラーサブクエリ、派生テーブル、相関サブクエリ |
| 集約 | GROUP BY / HAVING、MIN / MAX / AVG / SUM、COUNT DISTINCT、LISTAGG、GROUP BY ROLLUP、GROUP BY CUBE、GROUPING 関数、KEEP 集約、stddev / variance |
| CTE | 非再帰 CTE、再帰 CTE |
| 複合 SELECT | UNION、UNION ALL、INTERSECT、MINUS、MINUS ALL |
| ウィンドウ関数 | ROW_NUMBER、RANK / DENSE_RANK、LAG / LEAD、SUM OVER パーティション、NTILE、RATIO_TO_REPORT、CUME_DIST / PERCENT_RANK、FIRST_VALUE、名前付き WINDOW 句 |
| 式・述語 | CASE 式、CAST、NVL / COALESCE、DECODE、LIKE、REGEXP_LIKE、BETWEEN、バインド `:1`、バインド `:name`、NULLIF、TO_NUMBER |
| DUAL | SELECT FROM DUAL、SYS_GUID / USERENV、SYS_CONTEXT |
| 日付・時刻 | TO_CHAR、TO_DATE、TRUNC、ADD_MONTHS / LAST_DAY、NUMTODSINTERVAL、MONTHS_BETWEEN、NUMTOYMINTERVAL、EXTRACT |
| 文字列・型 | SUBSTR / INSTR、REGEXP_COUNT、DUMP / TO_CLOB、ORA_HASH、RAWTOHEX / HEXTORAW |
| JSON | JSON_VALUE / JSON_QUERY、JSON_TABLE、JSON_TABLE（複数列）、JSON_OBJECT / JSON_ARRAY |
| XML | XMLTABLE、XMLTABLE（単独）、XMLAGG |
| テーブル関数 | TABLE(collection)、DBMS_XPLAN.DISPLAY |
| 階層問合せ | CONNECT BY、LEVEL from DUAL |
| MATCH_RECOGNIZE | 行パターンマッチング、CLASSIFIER / MATCH_NUMBER |
| LATERAL | LATERAL 派生テーブル |
| DML | INSERT、INSERT ALL、UPDATE、DELETE、INSERT RETURNING、UPDATE RETURNING、DELETE RETURNING、INSERT ... SELECT |
| MERGE | MERGE INTO、MERGE RETURNING |
| シーケンス | NEXTVAL / CURRVAL |
| スキーマ修飾 | hr.employees、hr エイリアス |
| カタログ | all_users、user_tables、dba_tables、all_tab_columns、all_objects、user_indexes、v$session、all_views、all_constraints、user_constraints、user_objects、user_ind_columns |
| スキーマ追跡 | CREATE VIEW と SELECT、CREATE TABLE AS SELECT、GLOBAL TEMPORARY TABLE、ALTER TABLE ADD COLUMN、ALTER TABLE RENAME COLUMN、CREATE TABLE、CREATE MATERIALIZED VIEW、CREATE SYNONYM |
| ストアド | CREATE FUNCTION |
| メンテナンス | ANALYZE TABLE |
| 結果なし文 | BEGIN ... END、TRUNCATE、CREATE INDEX、SAVEPOINT、COMMIT、ROLLBACK、DROP INDEX、CREATE PROCEDURE |
| 負のテスト | パースエラー（タイポ） |

参照ドキュメント:

| カテゴリ | Oracle Database 21 ドキュメント |
|----------|--------------------------------|
| SELECT 基本 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/SELECT.html) |
| JOIN | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/JOINs.html) |
| サブクエリ | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Subqueries.html) |
| 集約 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/GROUP-BY-HAVING.html) |
| CTE | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/WITH-Clause.html) |
| 複合 SELECT | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Set-Operators.html) |
| ウィンドウ関数 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Analytic-Functions.html) |
| 式・述語 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Single-Row-Functions.html) |
| DUAL | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/DUAL.html) |
| 日付・時刻 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Datetime-and-Interval-Functions-and-Expressions.html) |
| 文字列・型 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Character-Functions.html) |
| JSON | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/JSON-in-Oracle-Database.html) |
| XML | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/XMLTABLE.html) |
| テーブル関数 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/TABLE-Collection-Expressions.html) |
| 階層問合せ | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Hierarchical-Queries.html) |
| MATCH_RECOGNIZE | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/MATCH_RECOGNIZE-Clause-for-Row-Pattern-Matching.html) |
| LATERAL | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/SELECT.html) |
| DML | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/INSERT.html) |
| MERGE | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/MERGE.html) |
| シーケンス | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/CREATE-SEQUENCE.html) |
| ストアド | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/CREATE-FUNCTION.html) |
| スキーマ修飾 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Database-Schema-Objects.html) |
| カタログ | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Static-Data-Dictionary-Views.html) |
| スキーマ追跡 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/CREATE-VIEW.html) |
| メンテナンス | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/ANALYZE.html) |
| 結果なし文 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/index.html) |
| 負のテスト | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/index.html) |
| 既知の限界 | [docs](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/index.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: oracle
```

```sql
CREATE TABLE users (
  id          NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name        VARCHAR2(100) NOT NULL,
  age         NUMBER,
  dept        VARCHAR2(50),
  data        CLOB,
  created_at  TIMESTAMP,
  d           DATE,
  parent_id   NUMBER
);

CREATE TABLE orders (
  id       NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id  NUMBER NOT NULL,
  amount   NUMBER(10, 2) NOT NULL
);

CREATE TABLE active_users (
  id   NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name VARCHAR2(100) NOT NULL
);

CREATE TABLE departments (
  dept   VARCHAR2(50) PRIMARY KEY,
  budget NUMBER NOT NULL
);
```

## Prepare-2: hr スキーマメタデータ

```yaml
kind: schema-json
dialect: oracle
```

```json
{
  "tables": [
    {
      "name": "employees",
      "schema": "hr",
      "columns": [
        {
          "name": "employee_id",
          "type": "integer"
        },
        {
          "name": "first_name",
          "type": "text"
        },
        {
          "name": "last_name",
          "type": "text"
        },
        {
          "name": "department_id",
          "type": "integer"
        }
      ]
    }
  ]
}
```

---

# SELECT 基本

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/SELECT.html/index.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| name | varchar2(100) | users.name |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| name | varchar2(100) | users.name |
| age | number | users.age |
| dept | varchar2(50) | users.dept |
| data | varchar2(255) | users.data |
| created_at | timestamp(6) | users.created_at |
| d | date | users.d |
| parent_id | number | users.parent_id |

---
## FETCH FIRST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |

---
## ROWNUM

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT id FROM users WHERE ROWNUM <= 10
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |

---
## DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| dept | varchar2(50) | users.dept |

---
## ORDER BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |

---
## SAMPLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT id FROM users SAMPLE(10)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |

---
## ROWID

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT ROWID AS rid FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rid | varchar2(255) | expression |

---
# JOIN

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/JOINs.html/index.html)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| name | varchar2(100) | users.name |
| amount | number(10,2) | orders.amount |

---
## LEFT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| amount | number(10,2) | orders.amount |

---
## RIGHT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| amount | number(10,2) | orders.amount |

---
## FULL OUTER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| amount | number(10,2) | orders.amount |

---
## CROSS JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| id | number | orders.id |

---
## NATURAL JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| name | varchar2(100) | users.name |

---
## JOIN USING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| name | varchar2(100) | users.name |

---
## (+) 外部結合

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT u.id, o.amount FROM users u, orders o WHERE o.user_id(+) = u.id
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |
| amount | number(10,2) | orders.amount |

---
# サブクエリ

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Subqueries.html/index.html)

---

## IN サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| name | varchar2(100) | users.name |

---
## EXISTS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |

---
## NOT EXISTS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |

---
## スカラーサブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| max_amt | number(10,2) | expression |

---
## 派生テーブル

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | t.id |

---
## 相関サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |

---
# 集約

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/GROUP-BY-HAVING.html/index.html)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| dept | varchar2(50) | users.dept |
| cnt | number | expression |

---
## サーバー生成列名（alias なし）

Docker image `gvenzl/oracle-xe:21-slim` で実測した未alias式の列名。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| COUNT(*) | number | expression |
| ID+1 | number(10) | polyglot |
| UPPER(NAME) | varchar2(255) | polyglot |

---
## MIN / MAX / AVG / SUM

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| mi | number | expression |
| ma | number | expression |
| av | number | expression |
| su | number | expression |

---
## COUNT DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| cd | number | expression |

---
## LISTAGG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT dept, LISTAGG(name, ',') WITHIN GROUP (ORDER BY name) AS names FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar2(50) | users.dept |
| names | varchar2(255) | expression |

---
## GROUP BY ROLLUP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| dept | varchar2(50) | users.dept |
| cnt | number | expression |

---
## GROUP BY CUBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| dept | varchar2(50) | users.dept |
| cnt | number | expression |

---
## GROUPING 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| dept | varchar2(50) | users.dept |
| g | number(10) | expression |
| cnt | number | expression |

---
## KEEP 集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT MAX(age) KEEP (DENSE_RANK FIRST ORDER BY age) AS k FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| k | number | expression |

---
## stddev / variance

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| sd | number | expression |
| v | number | expression |

---
# CTE

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/WITH-Clause.html/index.html)

---

## 非再帰 CTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | active.id |
| name | varchar2(100) | active.name |

---
## 再帰 CTE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
WITH t(n) AS (SELECT 1 FROM DUAL UNION ALL SELECT n + 1 FROM t WHERE n < 3) SELECT n FROM t
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | number(10) | t.n |

---
# 複合 SELECT

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Set-Operators.html/index.html)

---

## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | cast |
| name | varchar2(255) | cast |

---
## UNION ALL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | cast |

---
## MINUS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT id FROM users MINUS SELECT user_id FROM orders
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | cast |

---
## MINUS ALL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT id FROM users MINUS ALL SELECT user_id FROM orders
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | cast |

---
# ウィンドウ関数

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Analytic-Functions.html/index.html)

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| rn | number(10) | expression |

---
## RANK / DENSE_RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| r | number(10) | expression |
| dr | number(10) | expression |

---
## LAG / LEAD

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| la | number | expression |
| le | number | expression |

---
## SUM OVER パーティション

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | orders.id |
| s | number | polyglot |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| nt | number(10) | expression |

---
## RATIO_TO_REPORT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT id, RATIO_TO_REPORT(age) OVER () AS rr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |
| rr | number | expression |

---
## CUME_DIST / PERCENT_RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| cd | number | expression |
| pr | number | expression |

---
## FIRST_VALUE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT id, FIRST_VALUE(age) OVER (ORDER BY age) AS fv FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |
| fv | number | expression |

---
## 名前付き WINDOW 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | orders.id |
| s | number | polyglot |

---
# 式・述語

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Single-Row-Functions.html/index.html)

---

## CASE 式

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| status | varchar2(255) | expression |

---
## CAST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT CAST(age AS VARCHAR2(10)) AS age_text FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| age_text | varchar2(10) | polyglot |

---
## CAST — native type names with modifiers

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT
  CAST('x' AS VARCHAR2(12)) AS v12,
  CAST(1.23 AS NUMBER(8,2)) AS n82,
  CAST(TIMESTAMP '2020-01-01 00:00:00.123' AS TIMESTAMP(3)) AS ts3,
  CAST(HEXTORAW('AB') AS RAW(4)) AS r4
FROM dual
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v12 | varchar2(12) | polyglot |
| n82 | number(8,2) | polyglot |
| ts3 | timestamp(3) | polyglot |
| r4 | raw(4) | polyglot |

---
## NVL / COALESCE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT NVL(age, 0) AS a, COALESCE(age, 0) AS c FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | number | expression |
| c | number | expression |

---
## DECODE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT DECODE(age, 1, 'one', 'other') AS d FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| d | varchar2(255) | expression |

---
## LIKE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |

---
## REGEXP_LIKE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT id FROM users WHERE REGEXP_LIKE(name, '^a')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |

---
## BETWEEN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |

---
## バインド `:1`

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
binds: text
```

```sql
SELECT id FROM users WHERE name = :1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |

---
## バインド `:name`

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
binds: text
```

```sql
SELECT id FROM users WHERE name = :nm
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |

---
## NULLIF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT NULLIF(age, 0) AS n FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | number | expression |

---
## TO_NUMBER

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT TO_NUMBER('42') AS tn FROM DUAL
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tn | number | expression |

---
# DUAL

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/DUAL.html/index.html)

---

## SELECT FROM DUAL

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT 1 AS one, SYSDATE AS sd, SYSTIMESTAMP AS st, USER AS u FROM DUAL
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | number(10) | literal |
| sd | timestamp(6) | expression |
| st | timestamp(6) | expression |
| u | varchar2(255) | expression |

---
## SYS_GUID / USERENV

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT sys_guid() AS sg, userenv('LANG') AS ue FROM DUAL
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sg | raw(255) | expression |
| ue | varchar2(255) | polyglot |

---
## SYS_CONTEXT

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT sys_context('USERENV', 'SESSION_USER') AS su FROM DUAL
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| su | varchar2(255) | polyglot |

---
# 日付・時刻

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Datetime-and-Interval-Functions-and-Expressions.html/index.html)

---

## TO_CHAR

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT TO_CHAR(d, 'YYYY') AS y FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| y | varchar2(255) | expression |

---
## TO_DATE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT TO_DATE('2020-01-01', 'YYYY-MM-DD') AS td FROM DUAL
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| td | date | expression |

---
## TRUNC

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT TRUNC(d) AS tr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tr | date | expression |

---
## ADD_MONTHS / LAST_DAY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT add_months(d, 1) AS am, last_day(d) AS ld FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| am | date | expression |
| ld | date | expression |

---
## NUMTODSINTERVAL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT numtodsinterval(age, 'DAY') AS ndi FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ndi | interval | expression |

---
## MONTHS_BETWEEN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT months_between(d, d) AS mb FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mb | number | expression |

---
## NUMTOYMINTERVAL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT numtoyminterval(age, 'MONTH') AS nym FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nym | interval | expression |

---
## EXTRACT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT EXTRACT(YEAR FROM d) AS ey FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ey | number(10) | expression |

---
# 文字列・型

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Character-Functions.html/index.html)

---

## SUBSTR / INSTR

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT SUBSTR(name, 1, 3) AS s, INSTR(name, 'a') AS i FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | varchar2(255) | expression |
| i | number(10) | expression |

---
## REGEXP_COUNT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT regexp_count(name, 'a') AS rc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rc | number(10) | expression |

---
## DUMP / TO_CLOB

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT dump(name) AS dv, to_clob(name) AS tc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dv | varchar2(255) | expression |
| tc | varchar2(255) | expression |

---
## ORA_HASH

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT ora_hash(name) AS oh FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| oh | number(10) | expression |

---
## RAWTOHEX / HEXTORAW

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT rawtohex(name) AS rh, hextoraw(rawtohex(name)) AS hr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rh | varchar2(255) | expression |
| hr | raw(255) | expression |

---
# JSON

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/JSON-in-Oracle-Database.html/index.html)

---

## JSON_VALUE / JSON_QUERY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| jv | varchar2(255) | expression |
| jq | json | expression |

---
## JSON_TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT jt.id FROM users, JSON_TABLE(data, '$' COLUMNS (id NUMBER PATH '$.id')) jt
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | jt.id |

---
## JSON_TABLE（複数列）

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT * FROM JSON_TABLE('{}', '$' COLUMNS (id NUMBER PATH '$.id', name VARCHAR2(20) PATH '$.name'))
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | json_table.id |
| name | varchar2(20) | json_table.name |

---
## JSON_OBJECT / JSON_ARRAY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT JSON_OBJECT('id' VALUE id) AS jo, JSON_ARRAY(id, name) AS ja FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jo | json | expression |
| ja | json | expression |

---
# XML

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/XMLTABLE.html/index.html)

---

## XMLTABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT xt.id FROM users u, XMLTABLE('/root' PASSING XMLTYPE('<root><id>' || u.id || '</id></root>') COLUMNS id NUMBER PATH 'id') xt
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | xt.id |

---
## XMLTABLE（単独）

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT * FROM XMLTABLE('/a' PASSING XMLTYPE('<a><id>1</id></a>') COLUMNS id NUMBER PATH 'id')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | xmltable.id |

---
## XMLAGG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT XMLAGG(XMLELEMENT(e, name)) AS x FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| x | xmltype | expression |

---
# テーブル関数

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/TABLE-Collection-Expressions.html/index.html)

---

## TABLE(collection)

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT * FROM TABLE(sys.odcivarchar2list('a', 'b')) t
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | varchar2(255) | t.t |

---
## DBMS_XPLAN.DISPLAY

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| plan_table_output | varchar2(255) | table.plan_table_output |

---
# 階層問合せ

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Hierarchical-Queries.html/index.html)

---

## CONNECT BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT id, name, LEVEL AS lvl FROM users CONNECT BY PRIOR id = parent_id START WITH parent_id IS NULL
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |
| name | varchar2(100) | users.name |
| lvl | number(10) | expression |

---
## LEVEL from DUAL

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT LEVEL AS lvl FROM DUAL CONNECT BY LEVEL <= 3
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| lvl | number(10) | expression |

---
# MATCH_RECOGNIZE

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/MATCH_RECOGNIZE-Clause-for-Row-Pattern-Matching.html/index.html)

---

## 行パターンマッチング

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT * FROM users MATCH_RECOGNIZE (PARTITION BY dept ORDER BY created_at MEASURES MATCH_NUMBER() AS mn PATTERN (A+) DEFINE A AS age > 0)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |
| name | varchar2(100) | users.name |
| age | number | users.age |
| dept | varchar2(50) | users.dept |
| data | varchar2(255) | users.data |
| created_at | timestamp(6) | users.created_at |
| d | date | users.d |
| parent_id | number | users.parent_id |
| mn | number(10) | users.mn |

---
## CLASSIFIER / MATCH_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT * FROM users MATCH_RECOGNIZE (PARTITION BY dept ORDER BY created_at MEASURES MATCH_NUMBER() AS match_no, CLASSIFIER() AS cls ALL ROWS PER MATCH PATTERN (A+) DEFINE A AS age > 0)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |
| name | varchar2(100) | users.name |
| age | number | users.age |
| dept | varchar2(50) | users.dept |
| data | varchar2(255) | users.data |
| created_at | timestamp(6) | users.created_at |
| d | date | users.d |
| parent_id | number | users.parent_id |
| match_no | number(10) | users.match_no |
| cls | varchar2(255) | users.cls |

---
# LATERAL

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/SELECT.html/index.html)

---

## LATERAL 派生テーブル

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
SELECT u.id, o.amount FROM users u, LATERAL (SELECT amount FROM orders WHERE user_id = u.id AND ROWNUM = 1) o
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |
| amount | number(10,2) | o.amount |

---
# DML

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/INSERT.html/index.html)

---

## INSERT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
## INSERT ALL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
INSERT ALL INTO active_users(name) VALUES (name) SELECT name FROM users
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
dialect: oracle
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
dialect: oracle
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
dialect: oracle
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
| id | number | users.id |
| name | varchar2(100) | users.name |

---
## UPDATE RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| name | varchar2(100) | users.name |

---
## DELETE RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| id | number | users.id |
| name | varchar2(100) | users.name |

---
## INSERT ... SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
# MERGE

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/MERGE.html/index.html)

---

## MERGE INTO

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
MERGE INTO users u USING (SELECT 1 AS id, 'a' AS name FROM DUAL) s ON (u.id = s.id) WHEN MATCHED THEN UPDATE SET u.name = s.name
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
## MERGE RETURNING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
MERGE INTO users u USING (SELECT 1 AS id, 'a' AS name FROM DUAL) s ON (u.id = s.id) WHEN MATCHED THEN UPDATE SET u.name = s.name RETURNING u.id
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | number | users.id |

---
# シーケンス

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/CREATE-SEQUENCE.html/index.html)

---

## NEXTVAL / CURRVAL

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
CREATE SEQUENCE users_seq START WITH 1;
SELECT users_seq.NEXTVAL AS n, users_seq.CURRVAL AS c FROM DUAL
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| n | number(10) | expression |
| c | number(10) | expression |

---
# スキーマ修飾

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Database-Schema-Objects.html/index.html)

---

## hr.employees

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: oracle
```

```sql
SELECT employee_id, first_name FROM hr.employees
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| employee_id | number(10) | hr.employees.employee_id |
| first_name | varchar2(255) | hr.employees.first_name |

---
## hr エイリアス

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: oracle
```

```sql
SELECT e.employee_id, e.last_name FROM hr.employees e
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| employee_id | number(10) | hr.employees.employee_id |
| last_name | varchar2(255) | hr.employees.last_name |

---
# カタログ

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/Static-Data-Dictionary-Views.html/index.html)

---

## all_users

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT username FROM all_users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| username | varchar2(255) | all_users.username |

---
## user_tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT table_name FROM user_tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | varchar2(255) | user_tables.table_name |

---
## dba_tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT table_name FROM dba_tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | varchar2(255) | dba_tables.table_name |

---
## all_tab_columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT column_name FROM all_tab_columns
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_name | varchar2(255) | all_tab_columns.column_name |

---
## all_objects

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT object_name FROM all_objects
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| object_name | varchar2(255) | all_objects.object_name |

---
## user_indexes

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT index_name FROM user_indexes
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| index_name | varchar2(255) | user_indexes.index_name |

---
## v$session

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT sid, username FROM v$session
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sid | number(10) | v$session.sid |
| username | varchar2(255) | v$session.username |

---
## all_views

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT view_name FROM all_views
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| view_name | varchar2(255) | all_views.view_name |

---
## all_constraints

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT constraint_name FROM all_constraints
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| constraint_name | varchar2(255) | all_constraints.constraint_name |

---
## user_constraints

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT constraint_name FROM user_constraints
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| constraint_name | varchar2(255) | user_constraints.constraint_name |

---
## user_objects

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT object_name FROM user_objects
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| object_name | varchar2(255) | user_objects.object_name |

---
## user_ind_columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
SELECT column_name FROM user_ind_columns
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_name | varchar2(255) | user_ind_columns.column_name |

---
# スキーマ追跡

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/CREATE-VIEW.html/index.html)

---

## CREATE VIEW と SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| name | varchar2(100) | active.name |

---
## CREATE TABLE AS SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
CREATE TABLE backup AS SELECT id, name FROM users;
SELECT name FROM backup
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| name | varchar2(100) | backup.name |

---
## GLOBAL TEMPORARY TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
CREATE GLOBAL TEMPORARY TABLE t(id NUMBER, name VARCHAR2(20)) ON COMMIT PRESERVE ROWS;
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
| name | varchar2(20) | t.name |

---
## ALTER TABLE ADD COLUMN

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
CREATE TABLE t(id NUMBER);
ALTER TABLE t ADD name VARCHAR2(20);
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
| name | varchar2(20) | t.name |

---
## ALTER TABLE RENAME COLUMN

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
CREATE TABLE t(id NUMBER, name VARCHAR2(20));
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
| full_name | varchar2(20) | t.full_name |

---
## CREATE TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
CREATE TABLE t(id NUMBER, name VARCHAR2(20));
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
| name | varchar2(20) | t.name |

---
## CREATE MATERIALIZED VIEW

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
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
| name | varchar2(100) | mv.name |

---
## CREATE SYNONYM

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
CREATE SYNONYM u FOR users;
SELECT name FROM u
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| name | varchar2(100) | u.name |

---
# ストアド

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/CREATE-FUNCTION.html/index.html)

---

## CREATE FUNCTION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
CREATE OR REPLACE FUNCTION add_one(x NUMBER) RETURN NUMBER IS BEGIN RETURN x + 1; END;
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
| n | number | function |

---
# メンテナンス

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/ANALYZE.html/index.html)

---

## ANALYZE TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
ANALYZE TABLE users COMPUTE STATISTICS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | varchar2(255) | cast |
| Op | varchar2(255) | cast |
| Msg_type | varchar2(255) | cast |
| Msg_text | varchar2(255) | cast |

---
# 結果なし文

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/index.html/index.html)

---

## BEGIN ... END

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
BEGIN NULL; END;
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
dialect: oracle
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
dialect: oracle
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
dialect: oracle
```

```sql
SAVEPOINT sp1
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
dialect: oracle
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
dialect: oracle
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
## DROP INDEX

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: oracle
```

```sql
CREATE INDEX idx_users_name ON users(name);
DROP INDEX idx_users_name
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
## CREATE PROCEDURE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
```

```sql
CREATE OR REPLACE PROCEDURE p AS BEGIN NULL; END;
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

[Oracle Database 21 SQL リファレンス](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/index.html/index.html)

---

## パースエラー（タイポ）

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: oracle
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
| EXPLAIN PLAN | `EXPLAIN PLAN FOR ...` | パース未対応 |
| MODEL / PIVOT / UNPIVOT | 高度な SELECT 句 | パース未対応または列推論が過剰になる場合あり |
| FLASHBACK | `AS OF TIMESTAMP` | パース未対応 |
| PL/SQL ブロック | `FORALL`、`RETURNING ... INTO` | パース未対応 |
| RETURNING 句 | `INSERT ... RETURNING id, name` | SQL*Plus では `INTO :bind` が必要（ORA-00925）。列推論用の簡略構文 |
| MERGE RETURNING | `MERGE ... RETURNING` | Oracle Database 21c では非対応（23c 以降） |
| ANALYZE TABLE | `ANALYZE TABLE users COMPUTE STATISTICS` | 実行可能だが結果列は返らない（`sqldesc` は MySQL 風の列名を推論） |
| カタログ | `v$session` 等の動的ビュー | 列は推論されるが型は `polyglot` になりやすい |
| スキーマ修飾（メタなし） | `hr.employees` | `unknown` になりやすい（`Prepare-2` で解決） |
| DML | `INSERT` / `UPDATE` / `DELETE` / `MERGE`（RETURNING なし） | 結果列なし |
| メタデータ依存 | 未登録テーブル参照 | `unknown` + warnings |
