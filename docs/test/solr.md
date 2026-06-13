# Solr SQL テストケース

このドキュメントは [Solr SQL 公式ドキュメント](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html) に基づき、`sqldesc` が Solr SQL 方言（`--dialect solr`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/solr.md`）。

```yaml
doc: sqldesc-test/v1
dialect: solr
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Solr SQL SELECT](https://solr.apache.org/guide/solr/latest/query-guide/sql-query.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: solr
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  amount DECIMAL,
  created_at TIMESTAMP
);
```

## Prepare-2: SolrCloud SQL 実測スキーマ

```yaml
kind: schema-ddl
dialect: solr
```

```sql
CREATE TABLE users (
  id STRING,
  name_s STRING,
  amount_f FLOAT,
  created_at_dt TIMESTAMP
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

## SolrCloud SQL handler 実測列

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: solr
```

```sql
SELECT id, name_s, amount_f, created_at_dt FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | VARCHAR(255) | users.id |
| name_s | VARCHAR(255) | users.name_s |
| amount_f | DECIMAL | users.amount_f |
| created_at_dt | TIMESTAMP | users.created_at_dt |

---

## SolrCloud 集約

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: solr
```

```sql
SELECT COUNT(*) AS total FROM users
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
