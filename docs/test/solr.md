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
kind: schema-json
dialect: solr
```

```json
{
  "tables": [
    {
      "name": "users",
      "columns": [
        { "name": "id", "type": "integer" },
        { "name": "name", "type": "text" },
        { "name": "amount", "type": "decimal" },
        { "name": "created_at", "type": "timestamp" }
      ]
    }
  ]
}
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
