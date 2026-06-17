# Solr SQL テストケース

このドキュメントは [Solr SQL 公式ドキュメント](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html) に基づき、`sqldesc` が Solr SQL 方言（`--dialect solr`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/solr.md`）。

```yaml
doc: sqldesc-test/v1
dialect: solr
```

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、**`*` + LIMIT**、ORDER BY / LIMIT / OFFSET、DISTINCT |
| 集約 | GROUP BY / HAVING、AVG、COUNT |
| Solr 固有 | **動的フィールド接尾辞**（`_s` / `_f` / `_dt` / `_ss`）、**score** |

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Solr SQL SELECT](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html) |
| 集約 | [Aggregations](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html#aggregations) |

Docker 検証:

- `docker.io/library/solr:latest` を SolrCloud モードで起動し、`SOLR_MODULES=sql` を指定する（Solr 9+ では SQL モジュールの有効化が必須）。
- ZooKeeper は `docker.io/zookeeper:3.9` を併用する。
- 検証バージョンは **Solr 10.0.0**。
- SQL は `POST /solr/{collection}/sql` に `stmt` パラメータで送信し、`includeMetadata=true` で列名を確認する。
- `SELECT *` は `LIMIT` 付きクエリでのみサポートされる。`score` は `LIMIT` 付きクエリでのみ取得できる。
- 一括検証: `node scripts/verify-solr-doc.mjs`

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: solr
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
```

## Prepare-2: SolrCloud SQL 実測スキーマ

Solr の動的フィールド命名（`_s` / `_f` / `_dt` / `_ss`）と検索スコア列 `score` を含むスキーマです。

```yaml
kind: schema-ddl
dialect: solr
```

```sql
CREATE TABLE users_dyn (
  id STRING,
  name_s STRING,
  amount_f FLOAT,
  created_at_dt TIMESTAMP,
  tags_ss array<text>,
  score FLOAT
);
```

---

# SELECT 基本

[Solr SQL SELECT](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, name, amount FROM users LIMIT 10
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
## `*` + LIMIT

Solr では `SELECT *` は `LIMIT` 付きクエリで stored フィールドと `score` を返せます。

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT * FROM users LIMIT 10
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| _nest_path_ | VARCHAR(255) | cast |
| _root_ | VARCHAR(255) | cast |
| _text_ | VARCHAR(255) | cast |
| _version_ | BIGINT | cast |
| age | INTEGER | users.age |
| amount | DECIMAL | users.amount |
| created_at | TIMESTAMP | users.created_at |
| dept | VARCHAR(255) | users.dept |
| dept_str | VARCHAR(255) | cast |
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |
| name_str | VARCHAR(255) | cast |
| user_id | INTEGER | cast |
| _query_ | VARCHAR(255) | cast |
| score | DECIMAL | expression |

---
## ORDER BY / LIMIT / OFFSET

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
dialect: solr
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

# 集約

[Solr SQL Aggregations](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html#aggregations)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
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
## AVG

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: solr
```

```sql
SELECT dept, AVG(amount) AS avg_amt FROM users GROUP BY dept
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | VARCHAR(255) | users.dept |
| avg_amt | DECIMAL | expression |

---
## COUNT

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: solr
```

```sql
SELECT COUNT(*) AS total FROM users_dyn
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| total | INTEGER | expression |

---

# Solr 固有

---

## 動的フィールド接尾辞（SolrCloud SQL handler 実測列）

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, name_s, amount_f, created_at_dt FROM users_dyn LIMIT 10
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | VARCHAR(255) | users_dyn.id |
| name_s | VARCHAR(255) | users_dyn.name_s |
| amount_f | DECIMAL | users_dyn.amount_f |
| created_at_dt | TIMESTAMP | users_dyn.created_at_dt |

---
## 多値フィールド `_ss`

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, tags_ss FROM users_dyn LIMIT 10
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | VARCHAR(255) | users_dyn.id |
| tags_ss | array<text> | users_dyn.tags_ss |

---
## score

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, score FROM users_dyn LIMIT 10
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | VARCHAR(255) | users_dyn.id |
| score | DECIMAL | users_dyn.score |

---
