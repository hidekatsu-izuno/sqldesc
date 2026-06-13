# BigQuery テストケース

このドキュメントは [BigQuery Standard SQL](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax) に基づき、`sqldesc` が BigQuery 方言（`--dialect bigquery`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは [Given-When-Then](https://en.wikipedia.org/wiki/Given-When-Then) 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc` / `npm run test:doc:file -- docs/test/bigquery.md`）。

```yaml
doc: sqldesc-test/v1
dialect: bigquery
```

## ドキュメント形式（sqldesc-test/v1）

[sqlite.md](sqlite.md) / [postgresql.md](postgresql.md) / [mysql.md](mysql.md) / [oracle.md](oracle.md) / [tsql.md](tsql.md) / [duckdb.md](duckdb.md) と同じ形式です。

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし |
| 型 | BIGNUMERIC、GEOGRAPHY、JSON、ARRAY、STRUCT |
| バインド | 名前付きバインド |

参照ドキュメント:

| カテゴリ | BigQuery ドキュメント |
|----------|----------------------|
| SELECT | [query syntax](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax) |
| データ型 | [data types](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types) |
| JSON | [JSON functions](https://cloud.google.com/bigquery/docs/reference/standard-sql/json_functions) |
| Geography | [geography functions](https://cloud.google.com/bigquery/docs/reference/standard-sql/geography_functions) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: bigquery
```

```sql
CREATE TABLE users (
  id int64,
  name string,
  amount numeric,
  big_amount bignumeric,
  data json,
  tags array<string>,
  g geography,
  created_at TIMESTAMP,
  d date
);
```

---

# SELECT 基本

[BigQuery Standard SQL query syntax](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: bigquery
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
| id | int64 | users.id |
| name | string | users.name |
| amount | numeric | users.amount |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: bigquery
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
| id | int64 | users.id |
| name | string | users.name |
| amount | numeric | users.amount |
| big_amount | bignumeric | users.big_amount |
| data | json | users.data |
| tags | array<text> | users.tags |
| g | geography | users.g |
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
dialect: bigquery
```

```sql
SELECT 1 AS one, 'x' AS label, TRUE AS ok
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | int64 | literal |
| label | string | literal |
| ok | bool | expression |

---

# 型

[BigQuery Standard SQL data types](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types)

---

## BIGNUMERIC / GEOGRAPHY / JSON

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: bigquery
```

```sql
SELECT
  CAST(1 AS BIGNUMERIC) AS big_amount,
  CAST('POINT(1 2)' AS GEOGRAPHY) AS g,
  JSON '{"a":1}' AS j
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| big_amount | bignumeric | polyglot |
| g | geography | polyglot |
| j | json | expression |

---
## ARRAY / STRUCT

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: bigquery
```

```sql
SELECT
  [1, 2] AS nums,
  STRUCT(1 AS id, 'x' AS name) AS s
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nums | array<integer> | expression |
| s | struct<id integer, name text> | expression |

---

# バインド

---

## 名前付きバインド

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: bigquery
binds: id=int,name=text
```

```sql
SELECT
  @id + 1 AS next_id,
  CAST(@name AS STRING) AS label
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| next_id | int64 | polyglot |
| label | string | polyglot |
