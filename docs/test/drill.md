# Apache Drill テストケース

このドキュメントは [Apache Drill 公式ドキュメント](https://drill.apache.org/docs/select-statements/) に基づき、`sqldesc` が Apache Drill 方言（`--dialect drill`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/drill.md`）。

```yaml
doc: sqldesc-test/v1
dialect: drill
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Apache Drill SELECT](https://drill.apache.org/docs/select-statements/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: drill
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

[Apache Drill SELECT](https://drill.apache.org/docs/select-statements/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: drill
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
