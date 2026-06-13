# Tableau SQL テストケース

このドキュメントは [Tableau SQL 公式ドキュメント](https://help.tableau.com/current/pro/desktop/en-us/customsql.htm) に基づき、`sqldesc` が Tableau SQL 方言（`--dialect tableau`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/tableau.md`）。

```yaml
doc: sqldesc-test/v1
dialect: tableau
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Tableau SQL SELECT](https://help.tableau.com/current/pro/desktop/en-us/customsql.htm) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: tableau
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

[Tableau SQL SELECT](https://help.tableau.com/current/pro/desktop/en-us/customsql.htm)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tableau
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
