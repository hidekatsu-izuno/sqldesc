# Amazon Athena テストケース

このドキュメントは [Amazon Athena 公式ドキュメント](https://docs.aws.amazon.com/athena/latest/ug/querying-athena-tables.html) に基づき、`sqldesc` が Amazon Athena 方言（`--dialect athena`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/athena.md`）。

```yaml
doc: sqldesc-test/v1
dialect: athena
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Amazon Athena SELECT](https://docs.aws.amazon.com/athena/latest/ug/querying-athena-tables.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: athena
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

[Amazon Athena SELECT](https://docs.aws.amazon.com/athena/latest/ug/querying-athena-tables.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: athena
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
| name | varchar | users.name |
| amount | decimal | users.amount |

---
