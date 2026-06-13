# Apache DataFusion テストケース

このドキュメントは [Apache DataFusion 公式ドキュメント](https://datafusion.apache.org/user-guide/sql/select.html) に基づき、`sqldesc` が Apache DataFusion 方言（`--dialect datafusion`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/datafusion.md`）。

```yaml
doc: sqldesc-test/v1
dialect: datafusion
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Apache DataFusion SELECT](https://datafusion.apache.org/user-guide/sql/select.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: datafusion
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

[Apache DataFusion SELECT](https://datafusion.apache.org/user-guide/sql/select.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
