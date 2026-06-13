# Presto テストケース

このドキュメントは [Presto 公式ドキュメント](https://prestodb.io/docs/current/sql/select.html) に基づき、`sqldesc` が Presto 方言（`--dialect presto`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/presto.md`）。

```yaml
doc: sqldesc-test/v1
dialect: presto
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Presto SELECT](https://prestodb.io/docs/current/sql/select.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: presto
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

[Presto SELECT](https://prestodb.io/docs/current/sql/select.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: presto
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
| name | varchar | users.name |
| amount | decimal | users.amount |

---
