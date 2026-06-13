# Generic SQL テストケース

このドキュメントは [Generic SQL 公式ドキュメント](https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html) に基づき、`sqldesc` が Generic SQL 方言（`--dialect generic`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/generic.md`）。

```yaml
doc: sqldesc-test/v1
dialect: generic
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Generic SQL SELECT](https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: generic
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

[Generic SQL SELECT](https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: generic
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
