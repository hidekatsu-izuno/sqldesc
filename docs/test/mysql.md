# MySQL テストケース

このドキュメントは [MySQL 8.4 リファレンスマニュアル](https://dev.mysql.com/doc/refman/8.4/en/) に基づき、`sqldesc` が MySQL 方言（`--dialect mysql`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは [Given-When-Then](https://en.wikipedia.org/wiki/Given-When-Then) 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc` / `npm run test:doc:file -- docs/test/mysql.md`）。

```yaml
doc: sqldesc-test/v1
dialect: mysql
```

## ドキュメント形式（sqldesc-test/v1）

[sqlite.md](sqlite.md) / [postgresql.md](postgresql.md) と同じ形式です。

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、LIMIT / OFFSET、DISTINCT、ORDER BY、FROM 句なし |
| JOIN | INNER JOIN、LEFT JOIN、RIGHT JOIN、CROSS JOIN、NATURAL JOIN、JOIN USING |
| サブクエリ | IN サブクエリ、EXISTS、NOT EXISTS、スカラーサブクエリ、派生テーブル、相関サブクエリ |
| 集約 | GROUP BY / HAVING、MIN / MAX / AVG / SUM、COUNT DISTINCT、GROUP_CONCAT、WITH ROLLUP、stddev_pop / var_pop、bit_and / bit_or |
| CTE | 非再帰 CTE、再帰 CTE |
| 複合 SELECT | UNION、UNION ALL、INTERSECT、EXCEPT |
| ウィンドウ関数 | ROW_NUMBER、RANK / DENSE_RANK、LAG / LEAD、SUM OVER パーティション、NTILE、CUME_DIST / PERCENT_RANK、FIRST_VALUE、名前付き WINDOW 句 |
| 式・述語 | CASE 式、CAST、IFNULL / IF、LIKE、REGEXP、BETWEEN、バインド `?`、DATABASE() / USER()、DATE_FORMAT、COALESCE、DIV 演算子、SCHEMA()、ENUM 列、VALUES 行コンストラクタ |
| 日付・時刻 | str_to_date、date_add、curdate / curtime、unix_timestamp、timestampdiff |
| 文字列・型 | substring_index、soundex / find_in_set、format / uuid、md5 / sha2、export_set |
| JSON | JSON_EXTRACT / JSON_UNQUOTE、JSON_OBJECT / JSON_ARRAY、JSON_SET / JSON_REMOVE、JSON_VALID / JSON_TYPE、JSON_KEYS / JSON_SEARCH、JSON_CONTAINS / JSON_LENGTH、JSON_INSERT / JSON_MERGE_PATCH、JSON_PRETTY、JSON_TABLE |
| 全文検索 | MATCH ... AGAINST（NATURAL LANGUAGE）、MATCH ... AGAINST（BOOLEAN MODE） |
| DUAL | SELECT FROM DUAL |
| DML | INSERT、ON DUPLICATE KEY UPDATE、REPLACE INTO、UPDATE、DELETE、INSERT ... SELECT、INSERT 後の LAST_INSERT_ID |
| LATERAL | LATERAL 派生テーブル |
| スキーマ修飾 | mydb.users、mydb エイリアス |
| カタログ | information_schema.tables、information_schema.columns、performance_schema.global_variables、information_schema.processlist、events_statements_summary_by_digest |
| SHOW | SHOW COLUMNS、SHOW INDEX、SHOW VARIABLES、SHOW TABLES、SHOW CREATE TABLE、SHOW STATUS、SHOW GLOBAL VARIABLES、SHOW FULL PROCESSLIST、SHOW TABLE STATUS |
| EXPLAIN | EXPLAIN SELECT、EXPLAIN ANALYZE |
| スキーマ追跡 | CREATE VIEW と SELECT、CREATE TABLE AS SELECT、CREATE TEMPORARY TABLE、CREATE TABLE LIKE、ALTER TABLE CHANGE COLUMN |
| ストアド | CREATE PROCEDURE + CALL |
| メンテナンス | ANALYZE TABLE、OPTIMIZE TABLE |
| 結果なし文 | BEGIN / COMMIT、TRUNCATE、CREATE INDEX、DROP INDEX、ROLLBACK、FLUSH TABLES、KILL |
| 負のテスト | パースエラー（タイポ） |

参照ドキュメント:

| カテゴリ | MySQL 8.4 ドキュメント |
|----------|------------------------|
| SELECT 基本 | [docs](https://dev.mysql.com/doc/refman/8.4/en/select.html) |
| JOIN | [docs](https://dev.mysql.com/doc/refman/8.4/en/join.html) |
| サブクエリ | [docs](https://dev.mysql.com/doc/refman/8.4/en/subqueries.html) |
| 集約 | [docs](https://dev.mysql.com/doc/refman/8.4/en/aggregate-functions.html) |
| CTE | [docs](https://dev.mysql.com/doc/refman/8.4/en/with.html) |
| 複合 SELECT | [docs](https://dev.mysql.com/doc/refman/8.4/en/union.html) |
| ウィンドウ関数 | [docs](https://dev.mysql.com/doc/refman/8.4/en/window-functions.html) |
| 式・述語 | [docs](https://dev.mysql.com/doc/refman/8.4/en/functions.html) |
| JSON | [docs](https://dev.mysql.com/doc/refman/8.4/en/json-functions.html) |
| 全文検索 | [docs](https://dev.mysql.com/doc/refman/8.4/en/fulltext-search.html) |
| DUAL | [docs](https://dev.mysql.com/doc/refman/8.4/en/select.html) |
| DML | [docs](https://dev.mysql.com/doc/refman/8.4/en/insert.html) |
| スキーマ修飾 | [docs](https://dev.mysql.com/doc/refman/8.4/en/identifier-qualifiers.html) |
| カタログ | [docs](https://dev.mysql.com/doc/refman/8.4/en/information-schema.html) |
| SHOW | [docs](https://dev.mysql.com/doc/refman/8.4/en/show.html) |
| EXPLAIN | [docs](https://dev.mysql.com/doc/refman/8.4/en/explain.html) |
| LATERAL | [docs](https://dev.mysql.com/doc/refman/8.4/en/lateral-derived-tables.html) |
| 日付・時刻 | [docs](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html) |
| 文字列・型 | [docs](https://dev.mysql.com/doc/refman/8.4/en/string-functions.html) |
| ストアド | [docs](https://dev.mysql.com/doc/refman/8.4/en/create-procedure.html) |
| メンテナンス | [docs](https://dev.mysql.com/doc/refman/8.4/en/analyze-table.html) |
| スキーマ追跡 | [docs](https://dev.mysql.com/doc/refman/8.4/en/create-view.html) |
| 結果なし文 | [docs](https://dev.mysql.com/doc/refman/8.4/en/sql-statements.html) |
| 負のテスト | [docs](https://dev.mysql.com/doc/refman/8.4/en/sql-syntax.html) |
| 既知の限界 | [docs](https://dev.mysql.com/doc/refman/8.4/en/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: mysql
```

```sql
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT,
  dept VARCHAR(50),
  data JSON,
  tags JSON,
  created_at DATETIME,
  d DATE,
  status ENUM('active', 'inactive') DEFAULT 'active'
);

CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL
);

CREATE TABLE active_users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE departments (
  dept VARCHAR(50) PRIMARY KEY,
  budget INT NOT NULL
);

CREATE TABLE documents (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200),
  body TEXT,
  FULLTEXT KEY ft_body (body)
);
```

## Prepare-3: mydb.users テーブル

```yaml
kind: schema-ddl
dialect: mysql
```

```sql
CREATE DATABASE IF NOT EXISTS mydb;
DROP TABLE IF EXISTS mydb.users;
CREATE TABLE mydb.users (
  id   INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  age  INT,
  dept VARCHAR(50)
);
```

## Prepare-2: mydb スキーマメタデータ

```yaml
kind: schema-json
dialect: mysql
```

```json
{
  "tables": [
    {
      "name": "users",
      "schema": "mydb",
      "columns": [
        {
          "name": "id",
          "type": "integer"
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "age",
          "type": "integer"
        },
        {
          "name": "dept",
          "type": "text"
        }
      ]
    }
  ]
}
```

---

# SELECT 基本

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/select.html/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| name | varchar(100) | users.name |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| name | varchar(100) | users.name |
| age | int | users.age |
| dept | varchar(50) | users.dept |
| data | json | users.data |
| tags | json | users.tags |
| created_at | datetime | users.created_at |
| d | date | users.d |
| status | enum | users.status |

---
## LIMIT / OFFSET

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| id | int | users.id |
| name | varchar(100) | users.name |

---
## DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| dept | varchar(50) | users.dept |

---
## ORDER BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
dialect: mysql
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
# JOIN

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/join.html/)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| name | varchar(100) | users.name |
| amount | decimal(10,2) | orders.amount |

---
## LEFT JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
dialect: mysql
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
## CROSS JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
## NATURAL JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| id | int | users.id |
| name | varchar(100) | users.name |

---
## JOIN USING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| id | int | users.id |
| name | varchar(100) | users.name |

---
# サブクエリ

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/subqueries.html/)

---

## IN サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| name | varchar(100) | users.name |

---
## EXISTS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
dialect: mysql
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
dialect: mysql
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
dialect: mysql
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
| id | int | t.id |
| n | varchar(100) | t.n |

---
## 相関サブクエリ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/aggregate-functions.html/)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| dept | varchar(50) | users.dept |
| cnt | bigint | expression |

---
## サーバー生成列名（alias なし）

Docker image `mysql:8.4` で実測した未alias式の列名。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| count(*) | bigint | expression |
| id+1 | int | polyglot |
| upper(name) | varchar(255) | polyglot |

---
## MIN / MAX / AVG / SUM

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| av | decimal(14,4) | expression |
| su | int | expression |

---
## COUNT DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
## GROUP_CONCAT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT dept, GROUP_CONCAT(name ORDER BY name SEPARATOR ',') AS names FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar(50) | users.dept |
| names | varchar(255) | expression |

---
## WITH ROLLUP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT dept, COUNT(*) AS cnt FROM users GROUP BY dept WITH ROLLUP
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar(50) | users.dept |
| cnt | bigint | expression |

---
## stddev_pop / var_pop

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT stddev_pop(age) AS sp, var_pop(age) AS vp FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sp | decimal | expression |
| vp | decimal | expression |

---
## bit_and / bit_or

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT bit_and(age) AS ba, bit_or(age) AS bo FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ba | int | expression |
| bo | int | expression |

---
# CTE

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/with.html/)

---

## 非再帰 CTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| name | varchar(100) | active.name |

---
## 再帰 CTE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
WITH RECURSIVE t AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM t WHERE n < 3) SELECT n FROM t
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

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/union.html/)

---

## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| name | varchar(255) | cast |

---
## UNION ALL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
dialect: mysql
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
dialect: mysql
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

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/window-functions.html/)

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| rn | int | expression |

---
## RANK / DENSE_RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
dialect: mysql
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
dialect: mysql
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
| s | decimal | polyglot |

---
## NTILE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
## CUME_DIST / PERCENT_RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| cd | decimal | expression |
| pr | decimal | expression |

---
## FIRST_VALUE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| id | int | users.id |
| fv | int | expression |

---
## 名前付き WINDOW 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| s | decimal | polyglot |

---
# 式・述語

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/functions.html/)

---

## CASE 式

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| status | varchar(255) | expression |

---
## CAST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT CAST(age AS CHAR) AS age_text FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| age_text | varchar(255) | polyglot |

---
## CAST — native type names with modifiers

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT
  CAST('x' AS CHAR(12)) AS c12,
  CAST(1.23 AS DECIMAL(8,2)) AS d82,
  CAST('2020-01-01 00:00:00.123' AS DATETIME(3)) AS dt3,
  CAST('ab' AS BINARY(4)) AS b4
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| c12 | varchar(12) | polyglot |
| d82 | decimal(8,2) | polyglot |
| dt3 | datetime(3) | polyglot |
| b4 | varbinary(4) | polyglot |

---
## IFNULL / IF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT IFNULL(age, 0) AS a, IF(age >= 18, 1, 0) AS adult FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | int | expression |
| adult | int | expression |

---
## LIKE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
## REGEXP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT id FROM users WHERE name REGEXP '^a'
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
dialect: mysql
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
## バインド `?`

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
binds: text
```

```sql
SELECT id FROM users WHERE name = ?
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
## DATABASE() / USER()

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT DATABASE() AS db, USER() AS u FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| db | varchar(255) | expression |
| u | varchar(255) | expression |

---
## DATE_FORMAT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT DATE_FORMAT(d, '%Y') AS y FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| y | varchar(255) | polyglot |

---
## COALESCE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| a | int | expression |

---
## DIV 演算子

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT age DIV 2 AS d FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| d | int | expression |

---
## SCHEMA()

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT schema() AS sc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sc | varchar(255) | expression |

---
## ENUM 列

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT status FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| status | enum | users.status |

---
## VALUES 行コンストラクタ

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SELECT * FROM (VALUES ROW(1, 'a'), ROW(2, 'b')) AS v(id, label)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | varchar(255) | v.id |

---
# 日付・時刻

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html/)

---

## str_to_date

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT str_to_date(name, '%Y-%m-%d') AS sd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sd | date | expression |

---
## date_add

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT date_add(d, INTERVAL 1 DAY) AS da FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| da | date | expression |

---
## curdate / curtime

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT curdate() AS cd, curtime() AS ct FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cd | date | expression |
| ct | time | expression |

---
## unix_timestamp

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT unix_timestamp(created_at) AS ut FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ut | int | expression |

---
## timestampdiff

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT timestampdiff(DAY, created_at, created_at) AS td FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| td | int | expression |

---
# 文字列・型

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/string-functions.html/)

---

## substring_index

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT substring_index(name, ',', 1) AS si FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| si | varchar(255) | expression |

---
## soundex / find_in_set

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT soundex(name) AS s, find_in_set(name, 'a,b') AS f FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | varchar(255) | expression |
| f | int | expression |

---
## format / uuid

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT format(age, 2) AS f, uuid() AS u FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| f | varchar(255) | expression |
| u | char(36) | expression |

---
## md5 / sha2

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT md5(name) AS m, sha2(name, 256) AS s FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| m | varchar(255) | expression |
| s | varchar(255) | expression |

---
## export_set

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT export_set(age, 'Y', 'N') AS es FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| es | varchar(255) | expression |

---
# JSON

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/json-functions.html/)

---

## JSON_EXTRACT / JSON_UNQUOTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT JSON_EXTRACT(data, '$.name') AS j, JSON_UNQUOTE(JSON_EXTRACT(data, '$.name')) AS n FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| j | json | expression |
| n | varchar(255) | expression |

---
## JSON_OBJECT / JSON_ARRAY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT JSON_OBJECT('id', id) AS obj, JSON_ARRAY(id, name) AS arr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| obj | json | expression |
| arr | json | expression |

---
## JSON_SET / JSON_REMOVE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT JSON_SET(data, '$.x', 1) AS js, JSON_REMOVE(data, '$.x') AS jr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| js | json | expression |
| jr | json | expression |

---
## JSON_VALID / JSON_TYPE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT JSON_VALID(data) AS jv, JSON_TYPE(data) AS jt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jv | tinyint(1) | expression |
| jt | varchar(255) | expression |

---
## JSON_KEYS / JSON_SEARCH

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT json_keys(data) AS jk, json_search(data, 'one', 'x') AS js FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jk | json | expression |
| js | varchar(255) | expression |

---
## JSON_CONTAINS / JSON_LENGTH

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT json_contains(data, '{}') AS jc, json_length(data) AS jl FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jc | tinyint(1) | expression |
| jl | int | expression |

---
## JSON_INSERT / JSON_MERGE_PATCH

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT json_insert(data, '$.x', 1) AS ji, json_merge_patch(data, data) AS jm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ji | json | expression |
| jm | json | expression |

---
## JSON_PRETTY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT json_pretty(data) AS jp FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jp | varchar(255) | expression |

---
## JSON_TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT jt.name FROM users, JSON_TABLE(data, '$.items[*]' COLUMNS (name VARCHAR(100) PATH '$.n')) AS jt
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | varchar(100) | jt.name |

---
# 全文検索

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/fulltext-search.html/)

---

## MATCH ... AGAINST（NATURAL LANGUAGE）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT title, MATCH(body) AGAINST ('database' IN NATURAL LANGUAGE MODE) AS score FROM documents
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| title | varchar(200) | documents.title |
| score | decimal | expression |

---
## MATCH ... AGAINST（BOOLEAN MODE）

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT title FROM documents WHERE MATCH(body) AGAINST ('+mysql -oracle' IN BOOLEAN MODE)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| title | varchar(200) | documents.title |

---
# DUAL

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/select.html/)

---

## SELECT FROM DUAL

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SELECT 1 AS one, VERSION() AS v FROM DUAL
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | int | literal |
| v | varchar(255) | expression |

---
# DML

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/insert.html/)

---

## INSERT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
## ON DUPLICATE KEY UPDATE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
INSERT INTO users(name) VALUES ('alice') ON DUPLICATE KEY UPDATE name = VALUES(name)
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
## REPLACE INTO

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
REPLACE INTO users(id, name) VALUES (1, 'a')
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
dialect: mysql
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
dialect: mysql
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
dialect: mysql
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
## INSERT 後の LAST_INSERT_ID

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
INSERT INTO users(name) VALUES ('alice');
SELECT LAST_INSERT_ID() AS id, 'alice' AS name
```

### Then

```yaml
kind: columns
target: last
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | expression |
| name | varchar(255) | literal |

---
# LATERAL

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/lateral-derived-tables.html/)

---

## LATERAL 派生テーブル

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SELECT u.id, o.amount FROM users u, LATERAL (SELECT amount FROM orders WHERE user_id = u.id LIMIT 1) AS o
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| amount | decimal(10,2) | o.amount |

---
# スキーマ修飾

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/identifier-qualifiers.html/)

---

## mydb.users

### Given

```yaml
prepare: Prepare-2, Prepare-3
```

### When

```yaml
dialect: mysql
```

```sql
SELECT id, name FROM mydb.users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | mydb.users.id |
| name | varchar(255) | mydb.users.name |

---
## mydb エイリアス

### Given

```yaml
prepare: Prepare-2, Prepare-3
```

### When

```yaml
dialect: mysql
```

```sql
SELECT u.id, u.name FROM mydb.users AS u
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | mydb.users.id |
| name | varchar(255) | mydb.users.name |

---
# カタログ

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/information-schema.html/)

---

## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'mydb'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | varchar(255) | information_schema.tables.table_name |
| table_type | varchar(255) | information_schema.tables.table_type |

---
## information_schema.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
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
| column_name | varchar(255) | information_schema.columns.column_name |
| data_type | varchar(255) | information_schema.columns.data_type |

---
## performance_schema.global_variables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SELECT variable_name, variable_value FROM performance_schema.global_variables LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| variable_name | varchar(255) | performance_schema.global_variables.VARIABLE_NAME |
| variable_value | varchar(255) | performance_schema.global_variables.VARIABLE_VALUE |

---
## information_schema.processlist

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SELECT user, host FROM information_schema.processlist LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| user | varchar(255) | information_schema.processlist.USER |
| host | varchar(255) | information_schema.processlist.HOST |

---
## events_statements_summary_by_digest

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SELECT digest_text FROM performance_schema.events_statements_summary_by_digest LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| digest_text | varchar(255) | performance_schema.events_statements_summary_by_digest.DIGEST_TEXT |

---
# SHOW

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/show.html/)

---

## SHOW COLUMNS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| Field | varchar(255) | cast |
| Type | varchar(255) | cast |
| Null | varchar(255) | cast |
| Key | varchar(255) | cast |
| Default | varchar(255) | cast |
| Extra | varchar(255) | cast |

---
## SHOW INDEX

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SHOW INDEX FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | varchar(255) | cast |
| Non_unique | int | cast |
| Key_name | varchar(255) | cast |
| Seq_in_index | int | cast |
| Column_name | varchar(255) | cast |
| Collation | varchar(255) | cast |
| Cardinality | int | cast |
| Sub_part | int | cast |
| Packed | varchar(255) | cast |
| Null | varchar(255) | cast |
| Index_type | varchar(255) | cast |
| Comment | varchar(255) | cast |
| Index_comment | varchar(255) | cast |

---
## SHOW VARIABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SHOW VARIABLES LIKE "version%"
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Variable_name | varchar(255) | cast |
| Value | varchar(255) | cast |

---
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
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
| Table | varchar(255) | cast |

---
## SHOW CREATE TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
SHOW CREATE TABLE users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | varchar(255) | cast |
| Create Table | varchar(255) | cast |

---
## SHOW STATUS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SHOW STATUS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Variable_name | varchar(255) | cast |
| Value | varchar(255) | cast |

---
## SHOW GLOBAL VARIABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SHOW GLOBAL VARIABLES LIKE "version%"
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Variable_name | varchar(255) | cast |
| Value | varchar(255) | cast |

---
## SHOW FULL PROCESSLIST

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SHOW FULL PROCESSLIST
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Id | int | cast |
| User | varchar(255) | cast |
| Host | varchar(255) | cast |
| db | varchar(255) | cast |
| Command | varchar(255) | cast |
| Time | int | cast |
| State | varchar(255) | cast |
| Info | varchar(255) | cast |

---
## SHOW TABLE STATUS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
SHOW TABLE STATUS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| created_on | timestamp | cast |
| name | varchar(255) | cast |
| database_name | varchar(255) | cast |
| schema_name | varchar(255) | cast |
| kind | varchar(255) | cast |
| comment | varchar(255) | cast |
| cluster_by | varchar(255) | cast |
| rows | int | cast |
| bytes | int | cast |
| owner | varchar(255) | cast |
| retention_time | int | cast |
| automatic_clustering | varchar(255) | cast |
| change_tracking | tinyint(1) | cast |
| search_optimization | tinyint(1) | cast |

---
# EXPLAIN

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/explain.html/)

---

## EXPLAIN SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| id | int | cast |
| select_type | varchar(255) | cast |
| table | varchar(255) | cast |
| partitions | varchar(255) | cast |
| type | varchar(255) | cast |
| possible_keys | varchar(255) | cast |
| key | varchar(255) | cast |
| key_len | varchar(255) | cast |
| ref | varchar(255) | cast |
| rows | int | cast |
| filtered | decimal | cast |
| Extra | varchar(255) | cast |

---
## EXPLAIN ANALYZE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| id | int | cast |
| select_type | varchar(255) | cast |
| table | varchar(255) | cast |
| partitions | varchar(255) | cast |
| type | varchar(255) | cast |
| possible_keys | varchar(255) | cast |
| key | varchar(255) | cast |
| key_len | varchar(255) | cast |
| ref | varchar(255) | cast |
| rows | int | cast |
| filtered | decimal | cast |
| Extra | varchar(255) | cast |

---
# スキーマ追跡

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/create-view.html/)

---

## CREATE VIEW と SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
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
| id | int | active.id |
| name | varchar(100) | active.name |

---
## CREATE TABLE AS SELECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
DROP TABLE IF EXISTS backup;
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
| id | int | backup.id |

---
## CREATE TEMPORARY TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
CREATE TEMPORARY TABLE t(id INT, name VARCHAR(20));
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
| name | varchar(20) | t.name |

---
## CREATE TABLE LIKE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
CREATE TABLE t LIKE users;
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
| name | varchar(100) | t.name |

---
## ALTER TABLE CHANGE COLUMN

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
CREATE TABLE t(id INT, name VARCHAR(20));
ALTER TABLE t CHANGE name full_name VARCHAR(30);
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
| full_name | varchar(30) | t.full_name |

---
# ストアド

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/create-procedure.html/)

---

## CREATE PROCEDURE + CALL

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
CREATE PROCEDURE p() BEGIN SELECT id, name FROM users; END;
CALL p()
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
| name | varchar(100) | users.name |

---
# メンテナンス

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/analyze-table.html/)

---

## ANALYZE TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
ANALYZE TABLE users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | varchar(255) | cast |
| Op | varchar(255) | cast |
| Msg_type | varchar(255) | cast |
| Msg_text | varchar(255) | cast |

---
## OPTIMIZE TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: mysql
```

```sql
OPTIMIZE TABLE users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | varchar(255) | cast |
| Op | varchar(255) | cast |
| Msg_type | varchar(255) | cast |
| Msg_text | varchar(255) | cast |

---
# 結果なし文

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/sql-statements.html/)

---

## BEGIN / COMMIT

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
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
dialect: mysql
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
dialect: mysql
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
dialect: mysql
```

```sql
CREATE INDEX idx_users_name ON users(name);
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
## ROLLBACK

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
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
## FLUSH TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
FLUSH TABLES
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
## KILL

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
```

```sql
KILL CONNECTION CONNECTION_ID()
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

[MySQL 8.4 リファレンス](https://dev.mysql.com/doc/refman/8.4/en/sql-syntax.html/)

---

## パースエラー（タイポ）

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: mysql
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
| RETURNING 句 | `INSERT ... RETURNING` | MySQL 非対応。`LAST_INSERT_ID()` 等で代替する |
| CREATE PROCEDURE | `BEGIN ... END` 内の `;` | mysql クライアントでは `DELIMITER` 変更が必要な場合あり |
| KILL | `KILL thread_id` | 実在する接続 ID を指定する必要がある |
| SHOW TABLE STATUS | カタログ列 | 方言横断の列名になる場合あり |
| データベース修飾（メタなし） | `mydb.users` エイリアス | `unknown` になりやすい（`Prepare-2` で解決） |
| DML | `INSERT` / `UPDATE` / `DELETE`（RETURNING なし） | 結果列なし |
| メタデータ依存 | 未登録テーブル参照 | `unknown` + warnings |
