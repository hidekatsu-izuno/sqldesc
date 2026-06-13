# Apache Hive テストケース

このドキュメントは [Apache Hive 公式ドキュメント](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+Select) に基づき、`sqldesc` が Apache Hive 方言（`--dialect hive`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/hive.md`）。

```yaml
doc: sqldesc-test/v1
dialect: hive
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Apache Hive SELECT](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+Select) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: hive
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

[Apache Hive SELECT](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+Select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: hive
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
