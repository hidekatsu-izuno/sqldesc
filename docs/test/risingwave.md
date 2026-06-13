# RisingWave テストケース

このドキュメントは [RisingWave 公式ドキュメント](https://docs.risingwave.com/sql/commands/sql-select) に基づき、`sqldesc` が RisingWave 方言（`--dialect risingwave`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/risingwave.md`）。

```yaml
doc: sqldesc-test/v1
dialect: risingwave
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [RisingWave SELECT](https://docs.risingwave.com/sql/commands/sql-select) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: risingwave
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

[RisingWave SELECT](https://docs.risingwave.com/sql/commands/sql-select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: risingwave
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
| name | text | users.name |
| amount | numeric | users.amount |

---
