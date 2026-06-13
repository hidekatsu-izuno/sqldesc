# Apache Doris テストケース

このドキュメントは [Apache Doris 公式ドキュメント](https://doris.apache.org/docs/sql-manual/sql-statements/data-query/SELECT/) に基づき、`sqldesc` が Apache Doris 方言（`--dialect doris`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/doris.md`）。

```yaml
doc: sqldesc-test/v1
dialect: doris
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Apache Doris SELECT](https://doris.apache.org/docs/sql-manual/sql-statements/data-query/SELECT/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: doris
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

[Apache Doris SELECT](https://doris.apache.org/docs/sql-manual/sql-statements/data-query/SELECT/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: doris
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
