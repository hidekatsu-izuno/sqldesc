# Materialize テストケース

このドキュメントは [Materialize 公式ドキュメント](https://materialize.com/docs/sql/select/) に基づき、`sqldesc` が Materialize 方言（`--dialect materialize`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/materialize.md`）。

```yaml
doc: sqldesc-test/v1
dialect: materialize
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Materialize SELECT](https://materialize.com/docs/sql/select/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: materialize
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

[Materialize SELECT](https://materialize.com/docs/sql/select/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
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
| id | integer | users.id |
| name | text | users.name |
| amount | numeric | users.amount |

---
