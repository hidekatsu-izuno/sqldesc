# Dremio SQL テストケース

このドキュメントは [Dremio SQL 公式ドキュメント](https://docs.dremio.com/current/reference/sql/commands/SELECT/) に基づき、`sqldesc` が Dremio SQL 方言（`--dialect dremio`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/dremio.md`）。

```yaml
doc: sqldesc-test/v1
dialect: dremio
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Dremio SQL SELECT](https://docs.dremio.com/current/reference/sql/commands/SELECT/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: dremio
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

[Dremio SQL SELECT](https://docs.dremio.com/current/reference/sql/commands/SELECT/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dremio
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
