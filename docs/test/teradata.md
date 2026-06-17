# Teradata Vantage テストケース

このドキュメントは [Teradata Vantage 公式ドキュメント](https://docs.teradata.com/r/Teradata-VantageCloud-Lake/SQL-Reference/SQL-Data-Manipulation-Language/SELECT-Statements/SELECT) に基づき、`sqldesc` が Teradata Vantage 方言（`--dialect teradata`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/teradata.md`）。

```yaml
doc: sqldesc-test/v1
dialect: teradata
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY、**TOP**、**SAMPLE**、DISTINCT |
| JOIN | INNER JOIN、修飾 `u.*`、非修飾 `*` の JOIN 展開 |
| 集約 | GROUP BY / HAVING、集約関数、**ROLLUP** |
| ウィンドウ関数 | ROW_NUMBER / RANK / LAG、NTILE / ウィンドウ集約、**CSUM** / **MAVG** |
| Teradata 関数 | **ZEROIFNULL** / **NULLIFZERO**、**OTRANSLATE** / **OREPLACE**、SUBSTRING FROM FOR、**HASHAMP** / **HASHBUCKET** / **INDEX** |
| 日時 | **ADD_MONTHS** / **MONTHS_BETWEEN**、EXTRACT、INTERVAL 演算、CURRENT_*、日付リテラル |
| 型・関数 | COALESCE / CASE、REGEXP_REPLACE、CAST、NULLIF |
| 副問い合わせ・集合演算 | CTE（WITH）、相関副問い合わせ、IN 副問い合わせ、UNION、**MINUS**、INTERSECT、VALUES |
| メタデータ | **HELP TABLE** / **HELP DATABASE** / **HELP COLUMN**、SHOW TABLES、DESCRIBE、EXPLAIN |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Teradata Vantage SELECT](https://docs.teradata.com/r/Teradata-VantageCloud-Lake/SQL-Reference/SQL-Data-Manipulation-Language/SELECT-Statements/SELECT) |
| 文字列関数 | [String Functions](https://docs.teradata.com/r/Teradata-VantageCloud-Lake/SQL-Functions-Operators-Expressions/String-Functions) |
| HELP | [HELP Statements](https://docs.teradata.com/r/Teradata-VantageCloud-Lake/SQL-Reference/SQL-Data-Definition-Language/HELP-Statements) |

Docker 検証:

- Teradata Vantage **データベース本体の公式 Docker イメージは存在しない**（Vantage Express は VM 配布）。
- クライアントは `docker.io/teradata/python-teradatasql:latest` を `--network host` で実行し、MySQL 互換ではない Teradata プロトコル（既定ポート **1025**）で接続する。
- 接続先は Vantage Express / Developer Tier 等を VM で起動し、ホストへポート転送したインスタンス。環境変数 `TERADATA_HOST`（WSL では `127.0.0.1` と Windows ホスト IP を自動試行）、`TERADATA_PORT`（既定 `1025`）、`TERADATA_USER` / `TERADATA_PASSWORD`（既定 `dbc` / `dbc`）で上書き可能。
- VM セットアップ（WSL + Windows VirtualBox）:
  1. [Vantage Express OVA](https://downloads.teradata.com/download/database/teradata-express/vmware) をダウンロード（要 Teradata アカウント）
  2. `winget install Oracle.VirtualBox`（未導入時）
  3. `node scripts/setup-vantage-express-vbox.mjs /path/to/VantageExpress.ova`
- 一括検証: `node scripts/verify-teradata-doc.mjs`

### 検証状況（2026-06-17）

| 項目 | 結果 |
|------|------|
| 静的検証 | `npm run test:doc:file -- docs/test/teradata.md` で **40 passed / 40 verified** |
| Docker / VM 実測 | 未完了。Vantage Express VM は起動し、Windows 側 `127.0.0.1:1025` と `127.0.0.1:2222` は TCP 接続可能だが、`teradatasql` の SQL ログインが完了しない |

確認した状態:

- Windows VirtualBox 7.2.8 で `sqldesc-vantage` は `running`。
- VM の NIC は NAT、ポート転送は `teradata,tcp,,1025,,1025` と `ssh,tcp,,2222,,22`。
- Windows PowerShell の `Test-NetConnection 127.0.0.1 -Port 1025` と `-Port 2222` は成功。
- WSL から `VBoxManage.exe` を直接実行すると `UtilBindVsockAnyPort` で失敗することがあるため、VM 状態確認は `powershell.exe -NoProfile -Command "& 'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' ..."` 経由で実施。
- Podman/Docker コンテナからは `172.26.64.1:1025`、`192.168.56.1:1025`、`192.168.3.3:1025` の TCP 接続は開く。
- `docker.io/teradata/python-teradatasql:latest` 内の `teradatasql` は `17.10.0.9`。`host=172.26.64.1`, `dbs_port=1025`, `cop=false`, `logmech=TD2` でも SQL 接続が返らない。
- Windows Python に `teradatasql 20.0.0.61` を `--user` インストールし、`host=127.0.0.1`, `dbs_port=1025`, `cop=false`, `logmech=TD2` で直接接続を試したが、ログイン完了まで進まない。

このため、現在の未完了点は `sqldesc` の推論ではなく Vantage Express VM 内の DBS 起動状態、または `teradatasql` と当該 VM のログインハンドシェイクの問題。再開時は SSH (`127.0.0.1:2222`) または VM コンソールから DBS 状態を確認してから `node scripts/verify-teradata-doc.mjs` を再実行する。

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: teradata
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
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

[Teradata Vantage SELECT](https://docs.teradata.com/r/Teradata-VantageCloud-Lake/SQL-Reference/SQL-Data-Manipulation-Language/SELECT-Statements/SELECT)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
dialect: teradata
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
| created_at | TIMESTAMP | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT 1 AS one, 'x' AS label FROM users
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

---
## ORDER BY

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT id, name FROM users ORDER BY id DESC
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
## TOP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |

---
## SAMPLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT id, name FROM users SAMPLE 10
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
dialect: teradata
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
dialect: teradata
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
## 修飾 `u.*` と JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |
| age | INTEGER | users.age |
| dept | VARCHAR(255) | users.dept |
| amount | DECIMAL | users.amount |
| created_at | TIMESTAMP | users.created_at |
| amount | DECIMAL | orders.amount |

---
## 非修飾 `*` の JOIN 展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT * FROM users u JOIN orders o ON u.id = o.user_id
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
| created_at | TIMESTAMP | users.created_at |
| id | INTEGER | orders.id |
| user_id | INTEGER | orders.user_id |
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
dialect: teradata
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
## 集約関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT COUNT(DISTINCT dept) AS cd, AVG(amount) AS av, MIN(age) AS mi, MAX(age) AS mx FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cd | INTEGER | expression |
| av | DECIMAL | expression |
| mi | INTEGER | expression |
| mx | INTEGER | expression |

---
## ROLLUP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
| dept | VARCHAR(255) | users.dept |
| cnt | INTEGER | expression |

---

# ウィンドウ関数

---

## ROW_NUMBER / RANK / LAG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT id, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY amount) AS rn, RANK() OVER (ORDER BY amount) AS rk, LAG(amount) OVER (ORDER BY id) AS prev FROM users
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

---
## NTILE / ウィンドウ集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
| id | INTEGER | users.id |
| q | INTEGER | expression |
| running | DECIMAL | polyglot |

---
## CSUM / MAVG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT id, CSUM(amount) OVER (ORDER BY id) AS csum, MAVG(amount) OVER (ORDER BY id ROWS 3 PRECEDING) AS mavg FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| csum | DECIMAL | expression |
| mavg | DECIMAL | expression |

---

# Teradata 関数

---

## ZEROIFNULL / NULLIFZERO

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT ZEROIFNULL(amount) AS z, NULLIFZERO(amount) AS nz FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| z | DECIMAL | expression |
| nz | DECIMAL | expression |

---
## OTRANSLATE / OREPLACE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT OTRANSLATE(name, 'abc', 'xyz') AS ot, OREPLACE(name, 'a', 'b') AS orp FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ot | VARCHAR(255) | expression |
| orp | VARCHAR(255) | expression |

---
## SUBSTRING FROM FOR

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT TRIM(name) AS tn, SUBSTRING(name FROM 1 FOR 5) AS sub FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| tn | VARCHAR(255) | expression |
| sub | VARCHAR(255) | expression |

---
## HASHAMP / HASHBUCKET / INDEX

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT HASHAMP(id) AS ha, HASHBUCKET(id) AS hb, INDEX(name) AS idx FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ha | INTEGER | expression |
| hb | INTEGER | expression |
| idx | INTEGER | expression |

---

# 日時

---

## ADD_MONTHS / MONTHS_BETWEEN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT ADD_MONTHS(created_at, 1) AS am, MONTHS_BETWEEN(created_at, CURRENT_TIMESTAMP) AS mb FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| am | DATE | expression |
| mb | DECIMAL | expression |

---
## EXTRACT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT EXTRACT(YEAR FROM created_at) AS yr FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| yr | INTEGER | expression |

---
## INTERVAL 演算

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT (created_at - INTERVAL '1' DAY) AS yd FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| yd | TIMESTAMP | expression |

---
## CURRENT_DATE / CURRENT_TIMESTAMP

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT CURRENT_DATE AS cd, CURRENT_TIMESTAMP AS ct FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cd | DATE | polyglot |
| ct | TIMESTAMP | expression |

---
## 日付リテラル BETWEEN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT id, name FROM users WHERE created_at BETWEEN DATE '2020-01-01' AND DATE '2020-12-31'
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

# 型・関数

---

## COALESCE / CASE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT COALESCE(name, 'unknown') AS nm, CASE WHEN age > 30 THEN 'senior' ELSE 'junior' END AS tier FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nm | VARCHAR(255) | expression |
| tier | VARCHAR(255) | expression |

---
## REGEXP_REPLACE / CAST / NULLIF

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
SELECT REGEXP_REPLACE(name, '[0-9]+', 'X') AS rr, CAST(amount AS DECIMAL(10,2)) AS ca, NULLIF(amount, 0) AS nz FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rr | VARCHAR(255) | expression |
| ca | decimal(10,2) | polyglot |
| nz | DECIMAL | expression |

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
dialect: teradata
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
dialect: teradata
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
| id | INTEGER | users.id |
| max_amt | DECIMAL | expression |

---
## IN 副問い合わせ

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
| id | INTEGER | users.id |

---
## UNION

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
## MINUS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
## INTERSECT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
| id | INTEGER | cast |

---
## VALUES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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

# メタデータ

---

## HELP TABLE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
HELP TABLE users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Column Name | VARCHAR(255) | cast |
| Type | VARCHAR(255) | cast |
| Nullable | VARCHAR(255) | cast |
| Format | VARCHAR(255) | cast |
| Title | VARCHAR(255) | cast |
| Max Length | INTEGER | cast |
| Decimal Total Digits | INTEGER | cast |
| Decimal Fractional Digits | INTEGER | cast |

---
## HELP DATABASE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
HELP DATABASE db
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Database Name | VARCHAR(255) | cast |
| Owner Name | VARCHAR(255) | cast |
| Account Name | VARCHAR(255) | cast |
| Protection Type | VARCHAR(255) | cast |
| Journal Flag | VARCHAR(255) | cast |
| Perm Space | INTEGER | cast |
| Spool Space | INTEGER | cast |
| Temp Space | INTEGER | cast |

---
## HELP COLUMN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
```

```sql
HELP COLUMN users.*
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Column Name | VARCHAR(255) | cast |
| Type | VARCHAR(255) | cast |
| Nullable | VARCHAR(255) | cast |
| Format | VARCHAR(255) | cast |
| Title | VARCHAR(255) | cast |
| Max Length | INTEGER | cast |
| Decimal Total Digits | INTEGER | cast |
| Decimal Fractional Digits | INTEGER | cast |

---
## SHOW TABLES

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
dialect: teradata
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
| created_at | TIMESTAMP | users.created_at |

---
## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
