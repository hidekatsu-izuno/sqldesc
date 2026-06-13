# Teradata Vantage テストケース

このドキュメントは [Teradata Vantage 公式ドキュメント](https://docs.teradata.com/r/Teradata-VantageCloud-Lake/SQL-Reference/SQL-Data-Manipulation-Language/SELECT-Statements/SELECT) に基づき、`sqldesc` が Teradata Vantage 方言（`--dialect teradata`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/teradata.md`）。

```yaml
doc: sqldesc-test/v1
dialect: teradata
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Teradata Vantage SELECT](https://docs.teradata.com/r/Teradata-VantageCloud-Lake/SQL-Reference/SQL-Data-Manipulation-Language/SELECT-Statements/SELECT) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: teradata
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

[Teradata Vantage SELECT](https://docs.teradata.com/r/Teradata-VantageCloud-Lake/SQL-Reference/SQL-Data-Manipulation-Language/SELECT-Statements/SELECT)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: teradata
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
