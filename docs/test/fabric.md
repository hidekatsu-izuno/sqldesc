# Microsoft Fabric SQL テストケース

このドキュメントは [Microsoft Fabric SQL 公式ドキュメント](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql) に基づき、`sqldesc` が Microsoft Fabric SQL 方言（`--dialect fabric`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/fabric.md`）。

```yaml
doc: sqldesc-test/v1
dialect: fabric
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Microsoft Fabric SQL SELECT](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: fabric
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  amount DECIMAL,
  created_at TIMESTAMP
);
```

---

# SELECT 基本

[Microsoft Fabric SQL SELECT](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: fabric
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
| name | nvarchar(max) | users.name |
| amount | decimal(38, 10) | users.amount |

---
