# Exasol テストケース

このドキュメントは [Exasol 公式ドキュメント](https://docs.exasol.com/db/latest/sql/select.htm) に基づき、`sqldesc` が Exasol 方言（`--dialect exasol`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/exasol.md`）。

```yaml
doc: sqldesc-test/v1
dialect: exasol
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Exasol SELECT](https://docs.exasol.com/db/latest/sql/select.htm) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: exasol
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

[Exasol SELECT](https://docs.exasol.com/db/latest/sql/select.htm)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: exasol
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
