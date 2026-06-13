# Apache Druid SQL テストケース

このドキュメントは [Apache Druid SQL 公式ドキュメント](https://druid.apache.org/docs/latest/querying/sql/) に基づき、`sqldesc` が Apache Druid SQL 方言（`--dialect druid`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/druid.md`）。

```yaml
doc: sqldesc-test/v1
dialect: druid
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Apache Druid SQL SELECT](https://druid.apache.org/docs/latest/querying/sql/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: druid
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

[Apache Druid SQL SELECT](https://druid.apache.org/docs/latest/querying/sql/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: druid
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
