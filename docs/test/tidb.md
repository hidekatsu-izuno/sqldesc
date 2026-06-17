# TiDB テストケース

このドキュメントは [TiDB 公式ドキュメント](https://docs.pingcap.com/tidb/stable/sql-statement-select/) に基づき、`sqldesc` が TiDB 方言（`--dialect tidb`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/tidb.md`）。

```yaml
doc: sqldesc-test/v1
dialect: tidb
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、DISTINCT |
| JOIN | INNER JOIN、修飾 `u.*` |
| 集約 | GROUP BY / HAVING、**GROUP_CONCAT**、**approx_count_distinct** |
| ウィンドウ関数 | ROW_NUMBER / RANK、LAG / LEAD、NTILE / ウィンドウ集約 |
| JSON | **json_extract** / **json_unquote** / **json_contains** |
| TiDB 関数 | **tidb_version** / version、**tidb_decode_key** |
| 型・関数 | IF / COALESCE、DATE_ADD / DATEDIFF、CAST、CONVERT、REGEXP、MD5 / SHA2 |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、IN 副問い合わせ、UNION、EXCEPT、INTERSECT、UNION ALL 行集合 |
| メタデータ | **SHOW STATS_META** / **SHOW STATS_HISTOGRAMS**、**SHOW TABLE REGIONS**、SHOW DATABASES / COLUMNS / CREATE TABLE、DESCRIBE、EXPLAIN、information_schema |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [TiDB SELECT](https://docs.pingcap.com/tidb/stable/sql-statement-select/) |
| JSON | [JSON Functions](https://docs.pingcap.com/tidb/stable/json-functions) |
| 統計 | [SHOW STATS](https://docs.pingcap.com/tidb/stable/sql-statement-show-stats-meta) |
| リージョン | [SHOW TABLE REGIONS](https://docs.pingcap.com/tidb/stable/sql-statement-show-table-regions) |

Docker 検証:

- `docker.io/pingcap/tidb:v8.5.1` を `-P 4000 --store unistore` で起動し、MySQL プロトコル（ポート **4000**）で接続する。
- 一括検証: `node scripts/verify-tidb-doc.mjs`

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: tidb
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  data JSON,
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

[TiDB SELECT](https://docs.pingcap.com/tidb/stable/sql-statement-select/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
| name | varchar(255) | users.name |
| amount | decimal | users.amount |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
| name | varchar(255) | users.name |
| age | int | users.age |
| dept | varchar(255) | users.dept |
| amount | decimal | users.amount |
| data | json | users.data |
| created_at | timestamp | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
| one | int | literal |
| label | varchar(255) | literal |
| ok | tinyint(1) | expression |

---
## ORDER BY / LIMIT / OFFSET

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
| id | int | users.id |
| name | varchar(255) | users.name |

---
## DISTINCT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
| dept | varchar(255) | users.dept |

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
dialect: tidb
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
| amount | decimal | orders.amount |

---
## 修飾 `u.*` と JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT u.*, o.amount FROM users u JOIN orders o ON u.id = o.user_id
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| name | varchar(255) | users.name |
| age | int | users.age |
| dept | varchar(255) | users.dept |
| amount | decimal | users.amount |
| data | json | users.data |
| created_at | timestamp | users.created_at |
| amount | decimal | orders.amount |

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
dialect: tidb
```

```sql
SELECT dept, COUNT(*) AS cnt, SUM(amount) AS total, GROUP_CONCAT(name) AS gc FROM users GROUP BY dept HAVING COUNT(*) > 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar(255) | users.dept |
| cnt | bigint | expression |
| total | decimal | expression |
| gc | varchar(255) | expression |

---
## approx_count_distinct

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT approx_count_distinct(age) AS acd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| acd | bigint | expression |

---

# ウィンドウ関数

---

## ROW_NUMBER / RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT id, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY amount) AS rn, RANK() OVER (ORDER BY amount) AS rk FROM users
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
| rk | int | expression |

---
## LAG / LEAD

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT id, LAG(amount) OVER (ORDER BY id) AS prev, LEAD(amount) OVER (ORDER BY id) AS nxt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| prev | decimal | expression |
| nxt | decimal | expression |

---
## NTILE / ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT id, NTILE(4) OVER (ORDER BY amount) AS q, SUM(amount) OVER (PARTITION BY dept ORDER BY id) AS running FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| q | int | expression |
| running | decimal | polyglot |

---

# JSON

---

## json_extract / json_unquote / json_contains

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT json_extract(data, '$.x') AS je, json_unquote(json_extract(data, '$.x')) AS ju, json_contains(data, '{}') AS jc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| je | json | expression |
| ju | varchar(255) | expression |
| jc | tinyint(1) | expression |

---

# TiDB 関数

---

## tidb_version / version

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT tidb_version() AS v, version() AS mv FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | varchar(255) | expression |
| mv | varchar(255) | expression |

---
## tidb_decode_key

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT tidb_decode_key('key') AS dk FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dk | varchar(255) | polyglot |

---

# 型・関数

---

## IF / COALESCE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT IF(age > 30, 'senior', 'junior') AS tier, COALESCE(name, 'unknown') AS nm FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tier | varchar(255) | expression |
| nm | varchar(255) | expression |

---
## DATE_ADD / DATEDIFF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT DATE_ADD(created_at, INTERVAL 1 DAY) AS da, DATEDIFF(created_at, NOW()) AS dd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| da | timestamp | expression |
| dd | int | expression |

---
## CAST / CONVERT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT CAST(amount AS DECIMAL(10,2)) AS ca, CONVERT(amount, DECIMAL(10,2)) AS cv FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ca | decimal(10,2) | polyglot |
| cv | decimal(10,2) | expression |

---
## REGEXP / MD5 / SHA2

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT REGEXP_LIKE(name, '^a') AS rl, REGEXP_REPLACE(name, 'a', 'b') AS rr, MD5(name) AS m, SHA2(name, 256) AS s FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rl | tinyint(1) | expression |
| rr | varchar(255) | expression |
| m | varchar(255) | expression |
| s | varchar(255) | expression |

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
dialect: tidb
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
| name | varchar(255) | cte.name |

---
## 相関副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT id, (SELECT MAX(amount) FROM users u2 WHERE u2.dept = u.dept) AS max_amt FROM users u
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | users.id |
| max_amt | decimal | expression |

---
## IN 副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT id FROM users WHERE dept IN (SELECT dept FROM users WHERE age > 20)
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
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
| id | int | cast |

---
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT id FROM users INTERSECT SELECT id FROM users WHERE age > 0
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
## UNION ALL 行集合

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT * FROM (SELECT 1 AS id, 'a' AS name UNION ALL SELECT 2, 'b') AS t
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | int | t.id |
| name | varchar(255) | t.name |

---

# メタデータ

---

## SHOW STATS_META

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SHOW STATS_META
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Db_name | varchar(255) | cast |
| Table_name | varchar(255) | cast |
| Partition_name | varchar(255) | cast |
| Update_time | timestamp | cast |
| Modify_count | bigint | cast |
| Row_count | bigint | cast |
| Last_analyze_time | timestamp | cast |

---
## SHOW STATS_HISTOGRAMS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SHOW STATS_HISTOGRAMS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Db_name | varchar(255) | cast |
| Table_name | varchar(255) | cast |
| Partition_name | varchar(255) | cast |
| Column_name | varchar(255) | cast |
| Is_index | tinyint(1) | cast |
| Update_time | timestamp | cast |
| Distinct_count | bigint | cast |
| Null_count | bigint | cast |
| Avg_col_size | decimal | cast |
| Correlation | decimal | cast |
| Load_status | varchar(255) | cast |
| Total_mem_usage | bigint | cast |
| Hist_mem_usage | bigint | cast |
| Topn_mem_usage | bigint | cast |
| Cms_mem_usage | bigint | cast |

---
## SHOW TABLE REGIONS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SHOW TABLE db.users REGIONS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| REGION_ID | bigint | cast |
| START_KEY | varchar(255) | cast |
| END_KEY | varchar(255) | cast |
| LEADER_ID | bigint | cast |
| LEADER_STORE_ID | bigint | cast |
| PEERS | varchar(255) | cast |
| SCATTERING | tinyint(1) | cast |
| WRITTEN_BYTES | bigint | cast |
| READ_BYTES | bigint | cast |
| APPROXIMATE_SIZE(MB) | bigint | cast |
| APPROXIMATE_KEYS | bigint | cast |
| SCHEDULING_CONSTRAINTS | varchar(255) | cast |
| SCHEDULING_STATE | varchar(255) | cast |

---
## SHOW DATABASES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
| Database | varchar(255) | cast |

---
## SHOW COLUMNS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
## SHOW CREATE TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
## DESCRIBE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
| Field | varchar(255) | cast |
| Type | varchar(255) | cast |
| Null | varchar(255) | cast |
| Key | varchar(255) | cast |
| Default | varchar(255) | cast |
| Extra | varchar(255) | cast |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
| id | varchar(255) | cast |
| estRows | varchar(255) | cast |
| task | varchar(255) | cast |
| access object | varchar(255) | cast |
| operator info | varchar(255) | cast |

---
## information_schema.tables

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
```

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'db'
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | varchar(255) | information_schema.tables.table_name |

---
