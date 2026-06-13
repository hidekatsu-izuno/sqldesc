# SingleStore テストケース

このドキュメントは [SingleStore 公式ドキュメント](https://docs.singlestore.com/db/v9.0/reference/sql-reference/data-manipulation-language-dml/select/) に基づき、`sqldesc` が SingleStore 方言（`--dialect singlestore`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/singlestore.md`）。

```yaml
doc: sqldesc-test/v1
dialect: singlestore
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [SingleStore SELECT](https://docs.singlestore.com/db/v9.0/reference/sql-reference/data-manipulation-language-dml/select/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: singlestore
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

[SingleStore SELECT](https://docs.singlestore.com/db/v9.0/reference/sql-reference/data-manipulation-language-dml/select/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: singlestore
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
