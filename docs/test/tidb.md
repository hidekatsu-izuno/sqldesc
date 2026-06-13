# TiDB テストケース

このドキュメントは [TiDB 公式ドキュメント](https://docs.pingcap.com/tidb/stable/sql-statement-select/) に基づき、`sqldesc` が TiDB 方言（`--dialect tidb`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/tidb.md`）。

```yaml
doc: sqldesc-test/v1
dialect: tidb
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [TiDB SELECT](https://docs.pingcap.com/tidb/stable/sql-statement-select/) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: tidb
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

[TiDB SELECT](https://docs.pingcap.com/tidb/stable/sql-statement-select/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: tidb
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
