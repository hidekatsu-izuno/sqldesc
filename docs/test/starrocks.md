# StarRocks テストケース

このドキュメントは [StarRocks 公式ドキュメント](https://docs.starrocks.io/docs/sql-reference/sql-statements/table_bucket_part_index/SELECT/) に基づき、`sqldesc` が StarRocks 方言（`--dialect starrocks`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/starrocks.md`）。

```yaml
doc: sqldesc-test/v1
dialect: starrocks
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [StarRocks SELECT](https://docs.starrocks.io/docs/sql-reference/sql-statements/table_bucket_part_index/SELECT/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: starrocks
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

[StarRocks SELECT](https://docs.starrocks.io/docs/sql-reference/sql-statements/table_bucket_part_index/SELECT/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: starrocks
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
| id | int | users.id |
| name | varchar(255) | users.name |
| amount | decimal | users.amount |

---
