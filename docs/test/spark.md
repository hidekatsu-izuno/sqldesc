# Spark SQL テストケース

このドキュメントは [Spark SQL 公式ドキュメント](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select.html) に基づき、`sqldesc` が Spark SQL 方言（`--dialect spark`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/spark.md`）。

```yaml
doc: sqldesc-test/v1
dialect: spark
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Spark SQL SELECT](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: spark
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

[Spark SQL SELECT](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
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
