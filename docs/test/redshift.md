# Amazon Redshift テストケース

このドキュメントは [Amazon Redshift 公式ドキュメント](https://docs.aws.amazon.com/redshift/latest/dg/r_SELECT_synopsis.html) に基づき、`sqldesc` が Amazon Redshift 方言（`--dialect redshift`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/redshift.md`）。

```yaml
doc: sqldesc-test/v1
dialect: redshift
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Amazon Redshift SELECT](https://docs.aws.amazon.com/redshift/latest/dg/r_SELECT_synopsis.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: redshift
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

[Amazon Redshift SELECT](https://docs.aws.amazon.com/redshift/latest/dg/r_SELECT_synopsis.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: redshift
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
