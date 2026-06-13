# DuneSQL テストケース

このドキュメントは [DuneSQL 公式ドキュメント](https://docs.dune.com/query-engine/Functions-and-operators/index) に基づき、`sqldesc` が DuneSQL 方言（`--dialect dune`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/dune.md`）。

```yaml
doc: sqldesc-test/v1
dialect: dune
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [DuneSQL SELECT](https://docs.dune.com/query-engine/Functions-and-operators/index) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: dune
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

[DuneSQL SELECT](https://docs.dune.com/query-engine/Functions-and-operators/index)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: dune
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
