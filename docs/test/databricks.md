# Databricks SQL テストケース

このドキュメントは [Databricks SQL 公式ドキュメント](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select) に基づき、`sqldesc` が Databricks SQL 方言（`--dialect databricks`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/databricks.md`）。

```yaml
doc: sqldesc-test/v1
dialect: databricks
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Databricks SQL SELECT](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: databricks
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

[Databricks SQL SELECT](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: databricks
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
