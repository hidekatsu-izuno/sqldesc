# CockroachDB テストケース

このドキュメントは [CockroachDB 公式ドキュメント](https://www.cockroachlabs.com/docs/stable/select-clause) に基づき、`sqldesc` が CockroachDB 方言（`--dialect cockroachdb`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/cockroachdb.md`）。

```yaml
doc: sqldesc-test/v1
dialect: cockroachdb
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [CockroachDB SELECT](https://www.cockroachlabs.com/docs/stable/select-clause) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: cockroachdb
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

[CockroachDB SELECT](https://www.cockroachlabs.com/docs/stable/select-clause)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
