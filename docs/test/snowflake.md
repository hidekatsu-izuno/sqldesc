# Snowflake テストケース

このドキュメントは [Snowflake 公式ドキュメント](https://docs.snowflake.com/en/sql-reference/constructs/select) に基づき、`sqldesc` が Snowflake 方言（`--dialect snowflake`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/snowflake.md`）。

```yaml
doc: sqldesc-test/v1
dialect: snowflake
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Snowflake SELECT](https://docs.snowflake.com/en/sql-reference/constructs/select) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: snowflake
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

[Snowflake SELECT](https://docs.snowflake.com/en/sql-reference/constructs/select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: snowflake
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
