# ClickHouse テストケース

このドキュメントは [ClickHouse 公式ドキュメント](https://clickhouse.com/docs/sql-reference/statements/select) に基づき、`sqldesc` が ClickHouse 方言（`--dialect clickhouse`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/clickhouse.md`）。

```yaml
doc: sqldesc-test/v1
dialect: clickhouse
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / LIMIT / OFFSET、FINAL / SAMPLE / PREWHERE |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、countIf、quantile / uniq / argMax |
| ウィンドウ関数 | ROW_NUMBER、RANK、lagInFrame |
| 配列・MAP | arrayJoin、arrayMap / arrayFilter、mapKeys / mapValues |
| 関数 | 日時、JSON、ハッシュ、型変換、条件式、正規表現、タプル |
| テーブル関数 | numbers、file / url / s3、generateRandom、system.numbers |
| 副問い合わせ・集合演算 | CTE（WITH）、EXCEPT |
| メタデータ | SHOW DATABASES / TABLES、DESCRIBE TABLE、EXPLAIN AST、system テーブル |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [ClickHouse SELECT](https://clickhouse.com/docs/sql-reference/statements/select) |
| データ型 | [ClickHouse data types](https://clickhouse.com/docs/sql-reference/data-types) |
| テーブル関数 | [ClickHouse table functions](https://clickhouse.com/docs/sql-reference/table-functions) |
| 配列 | [Array functions](https://clickhouse.com/docs/sql-reference/functions/array-functions) |
| 集約 | [Aggregate functions](https://clickhouse.com/docs/sql-reference/aggregate-functions) |
| SHOW | [ClickHouse SHOW](https://clickhouse.com/docs/sql-reference/statements/show) |

Docker 検証:

- `docker.io/clickhouse/clickhouse-server:latest` の `clickhouse-local` で確認。
- `SELECT toTypeName(1), toTypeName('x'), toTypeName(toDecimal64(1,2)), toTypeName(today()), toTypeName(now()), toTypeName([1,2]), toTypeName(map('a',1))` は `UInt8`, `String`, `Decimal(18, 2)`, `Date`, `DateTime`, `Array(UInt8)`, `Map(String, UInt8)` を返す。
- `system.numbers` の `number` 列は `UInt64`。

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: clickhouse
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  age INTEGER,
  dept TEXT,
  amount DECIMAL,
  created_at TIMESTAMP,
  tags Array(TEXT),
  attrs Map(TEXT, INTEGER)
);

CREATE TABLE orders (
  id INTEGER,
  user_id INTEGER,
  amount DECIMAL
);
```

---

# SELECT 基本

[ClickHouse SELECT](https://clickhouse.com/docs/sql-reference/statements/select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
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
dialect: clickhouse
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
| tags | array<text> | users.tags |
| attrs | map<text, integer> | users.attrs |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
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
dialect: clickhouse
```

```sql
SELECT id FROM users ORDER BY id LIMIT 10 OFFSET 5
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
## FINAL / SAMPLE / PREWHERE

ClickHouse 固有の SELECT 修飾子です。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT id, name FROM users FINAL SAMPLE 0.1 PREWHERE age > 18
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
## スカラー関数と日時関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT toString(id) AS id_s, today() AS today_value, now() AS now_value FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id_s | VARCHAR(255) | expression |
| today_value | INTEGER | expression |
| now_value | TIMESTAMP | polyglot |

---

# JOIN

[ClickHouse SELECT - JOIN](https://clickhouse.com/docs/sql-reference/statements/select/join)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT u.id, o.amount
FROM users u
JOIN orders o ON o.user_id = u.id
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

[ClickHouse aggregate functions](https://clickhouse.com/docs/sql-reference/aggregate-functions)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT dept, count(*) AS n, sum(amount) AS total
FROM users
GROUP BY dept
HAVING count(*) > 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| n | INTEGER | expression |
| total | DECIMAL | expression |

---
## countIf

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT countIf(age >= 20) AS adults FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| adults | INTEGER | expression |

---
## quantile / uniq / argMax

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT quantile(age) AS q, uniq(name) AS u, argMax(name, age) AS am, argMin(name, age) AS amin FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| q | DECIMAL | expression |
| u | INTEGER | expression |
| am | VARCHAR(255) | expression |
| amin | VARCHAR(255) | expression |

---
## quantiles / stddevPop / varPop

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT quantiles(0.5, 0.9)(age) AS qs, stddevPop(age) AS sp, varPop(age) AS vp FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| qs | array<integer> | expression |
| sp | DECIMAL | expression |
| vp | DECIMAL | expression |

---

# ウィンドウ関数

[ClickHouse window functions](https://clickhouse.com/docs/sql-reference/window-functions)

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT id, row_number() OVER (PARTITION BY dept ORDER BY id) AS rn FROM users
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
## RANK

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT rank() OVER (ORDER BY amount DESC) AS r FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | INTEGER | expression |

---
## lagInFrame

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT lagInFrame(name) OVER (ORDER BY id) AS prev_name FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| prev_name | VARCHAR(255) | expression |

---

# 配列・MAP

[Array functions](https://clickhouse.com/docs/sql-reference/functions/array-functions)、[Map functions](https://clickhouse.com/docs/sql-reference/functions/tuple-map-functions)

---

## arrayJoin

配列列を行に展開する ClickHouse 固有の関数です。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT id, arrayJoin(tags) AS tag FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| tag | VARCHAR(255) | expression |

---
## arrayMap / arrayFilter / arrayConcat

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT
  arrayMap(x -> upper(x), tags) AS upper_tags,
  arrayFilter(x -> x != 'a', tags) AS filtered,
  arrayConcat(tags, tags) AS doubled
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| upper_tags | array<text> | expression |
| filtered | array<text> | expression |
| doubled | array<text> | expression |

---
## 配列述語・文字列化

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT has(tags, 'a') AS h, length(tags) AS l, arrayStringConcat(tags, ',') AS joined, empty(tags) AS e FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| h | BOOLEAN | expression |
| l | INTEGER | polyglot |
| joined | VARCHAR(255) | expression |
| e | BOOLEAN | expression |

---
## MAP 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT mapContains(attrs, 'a') AS mc, mapKeys(attrs) AS mk, mapValues(attrs) AS mv FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mc | BOOLEAN | expression |
| mk | array<text> | expression |
| mv | array<integer> | expression |

---

# 関数

---

## 日時関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT
  formatDateTime(created_at, '%F') AS fd,
  toStartOfDay(created_at) AS sd,
  toUnixTimestamp(created_at) AS tut,
  addDays(today(), 1) AS tomorrow,
  toYear(created_at) AS y
FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| fd | VARCHAR(255) | expression |
| sd | TIMESTAMP | expression |
| tut | INTEGER | expression |
| tomorrow | DATE | expression |
| y | INTEGER | expression |

---
## JSON 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT JSONExtractString(name, 'id') AS js, JSONExtractInt(name, 'id') AS ji, JSONHas(name, 'id') AS jh FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| js | VARCHAR(255) | expression |
| ji | INTEGER | expression |
| jh | BOOLEAN | expression |

---
## ハッシュ関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT cityHash64(name) AS h, sipHash64(name) AS sh, bitCount(age) AS bc FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| h | INTEGER | expression |
| sh | INTEGER | expression |
| bc | INTEGER | expression |

---
## 型変換

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT toInt32(name) AS i, toFloat64(name) AS f, toBool(age) AS b, toUUID(name) AS u, toTypeName(id) AS tn FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| i | INTEGER | expression |
| f | DECIMAL | expression |
| b | BOOLEAN | expression |
| u | VARCHAR(36) | expression |
| tn | VARCHAR(255) | expression |

---
## 条件式

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT multiIf(age > 0, name, 'x') AS mi, ifNull(name, 'x') AS n FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mi | VARCHAR(255) | expression |
| n | VARCHAR(255) | expression |

---
## 正規表現・文字列

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT replaceRegexpAll(name, 'a', 'b') AS rr, match(name, 'a') AS m, lowerUTF8(name) AS l FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rr | VARCHAR(255) | expression |
| m | BOOLEAN | expression |
| l | VARCHAR(255) | expression |

---
## システム関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT version() AS v, currentDatabase() AS db, currentUser() AS cu, generateUUIDv4() AS uid FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| v | VARCHAR(255) | expression |
| db | VARCHAR(255) | expression |
| cu | VARCHAR(255) | expression |
| uid | VARCHAR(36) | expression |

---
## タプルリテラル

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT (id, name) AS t FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | record<id integer, name text> | expression |

---

# テーブル関数

[ClickHouse table functions](https://clickhouse.com/docs/sql-reference/table-functions)

---

## numbers テーブル関数

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT * FROM numbers(3)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| numbers | INTEGER | numbers.numbers |

---
## numbers_mt テーブル関数

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT * FROM numbers_mt(3)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| numbers_mt | INTEGER | numbers_mt.numbers_mt |

---
## file / url / s3

外部データソースを読み込むテーブル関数です。

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT id, name FROM file('a.csv', CSV, 'id UInt64, name String')
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | BIGINT | file.id |
| name | VARCHAR(255) | file.name |

---
## generateRandom

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT id, name FROM generateRandom('id UInt64, name String') LIMIT 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | BIGINT | generaterandom.id |
| name | VARCHAR(255) | generaterandom.name |

---
## system.numbers

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT number FROM system.numbers LIMIT 3
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| number | INTEGER | system.numbers.number |

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
dialect: clickhouse
```

```sql
WITH cte AS (SELECT id, name FROM users) SELECT id FROM cte
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | cte.id |

---
## EXCEPT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT id FROM users EXCEPT SELECT id FROM users WHERE age < 18
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

# メタデータ

[ClickHouse SHOW](https://clickhouse.com/docs/sql-reference/statements/show)

---

## SHOW DATABASES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
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
## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
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
## SHOW CREATE TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
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
| statement | VARCHAR(255) | cast |

---
## DESCRIBE TABLE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
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
| name | VARCHAR(255) | cast |
| type | VARCHAR(255) | cast |
| default_type | VARCHAR(255) | cast |
| default_expression | VARCHAR(255) | cast |
| comment | VARCHAR(255) | cast |
| codec_expression | VARCHAR(255) | cast |
| ttl_expression | VARCHAR(255) | cast |

---
## EXPLAIN AST

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
EXPLAIN AST SELECT id FROM users
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
## system.tables

Docker image `clickhouse/clickhouse-server:latest` の `system.tables` から取得した metadata schema を検証する。

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT name, engine FROM system.tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | system.tables.name |
| engine | VARCHAR(255) | system.tables.engine |

---
## system.columns

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT name, type FROM system.columns
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | system.columns.name |
| type | VARCHAR(255) | system.columns.type |

---
## system.functions

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT name FROM system.functions
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | system.functions.name |

---
