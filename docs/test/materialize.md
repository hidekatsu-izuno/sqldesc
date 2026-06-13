# Materialize テストケース

このドキュメントは [Materialize 公式ドキュメント](https://materialize.com/docs/sql/select/) に基づき、`sqldesc` が Materialize 方言（`--dialect materialize`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/materialize.md`）。

```yaml
doc: sqldesc-test/v1
dialect: materialize
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Materialize SELECT](https://materialize.com/docs/sql/select/) |
| SHOW VIEWS | [Materialize SHOW VIEWS](https://materialize.com/docs/sql/show-views/) |
| データ型 | [Materialize data types](https://materialize.com/docs/sql/types/) |

Docker 検証:

- `docker.io/materialize/materialized:latest` を起動し、同梱 `psql` から確認。
- 検証バージョンは `Materialize 26.28.0`。
- `CREATE TABLE users(id int, name text, amount numeric, created_at timestamp)` 後の `pg_typeof` は `integer`, `text`, `numeric`, `timestamp without time zone` を返す。
- `SELECT id, name, amount FROM users` と `SHOW VIEWS` を実行し、ローカルコンテナでクラウド接続なしに確認。

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: materialize
```

```sql
CREATE TABLE users (
  id INTEGER,
  name TEXT,
  amount DECIMAL,
  created_at TIMESTAMP,
  tags ARRAY<TEXT>,
  attrs MAP<TEXT, INTEGER>
);
```

---

# SELECT 基本

[Materialize SELECT](https://materialize.com/docs/sql/select/)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
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

## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
```

```sql
SELECT * FROM users
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
| created_at | timestamp without time zone | users.created_at |
| tags | array<text> | users.tags |
| attrs | map<text, integer> | users.attrs |

---

## CTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: materialize
```

```sql
WITH recent AS (SELECT id, name FROM users) SELECT name FROM recent
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | recent.name |

---

## SHOW VIEWS

### When

```yaml
dialect: materialize
```

```sql
SHOW VIEWS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| View | text | cast |

---
