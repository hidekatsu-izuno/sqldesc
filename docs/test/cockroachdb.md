# CockroachDB テストケース

このドキュメントは [CockroachDB 公式ドキュメント](https://www.cockroachlabs.com/docs/stable/select-clause) に基づき、`sqldesc` が CockroachDB 方言（`--dialect cockroachdb`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/cockroachdb.md`）。

```yaml
doc: sqldesc-test/v1
dialect: cockroachdb
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [CockroachDB SELECT](https://www.cockroachlabs.com/docs/stable/select-clause) |
| SHOW COLUMNS | [CockroachDB SHOW COLUMNS](https://www.cockroachlabs.com/docs/stable/show-columns) |
| SHOW INDEXES | [CockroachDB SHOW INDEXES](https://www.cockroachlabs.com/docs/stable/show-indexes) |
| SHOW DATABASES | [CockroachDB SHOW DATABASES](https://www.cockroachlabs.com/docs/stable/show-databases) |

Docker 検証:

- `docker.io/cockroachdb/cockroach:latest` を `start-single-node --insecure --store=type=mem,size=0.25 --listen-addr=127.0.0.1:26257` で起動して確認。
- 検証バージョンは `CockroachDB CCL v26.2.2`。
- `CREATE TABLE users(id int, name string, amount decimal, created_at timestamp)` 後の `pg_typeof` は `bigint`, `text`, `numeric`, `timestamp without time zone` を返す。
- `SHOW COLUMNS FROM users`, `SHOW INDEXES FROM users`, `SHOW DATABASES` を実行し、メタデータ列を確認。

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: cockroachdb
```

```json
{
  "tables": [
    {
      "name": "users",
      "columns": [
        { "name": "id", "type": "integer" },
        { "name": "name", "type": "text" },
        { "name": "amount", "type": "decimal" },
        { "name": "created_at", "type": "timestamp" },
        { "name": "tags", "type": "array<text>" },
        { "name": "attrs", "type": "map<text, integer>" }
      ]
    }
  ]
}
```

---

# SELECT 基本

[CockroachDB SELECT](https://www.cockroachlabs.com/docs/stable/select-clause)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
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
dialect: cockroachdb
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

## ORDER BY / LIMIT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: cockroachdb
```

```sql
SELECT id, name FROM users ORDER BY id LIMIT 1
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

---

## SHOW DATABASES

### When

```yaml
dialect: cockroachdb
```

```sql
SHOW DATABASES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Database | text | cast |

---

## SHOW INDEXES

### When

```yaml
dialect: cockroachdb
```

```sql
SHOW INDEXES FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | text | cast |
| Non_unique | integer | cast |
| Key_name | text | cast |
| Seq_in_index | integer | cast |
| Column_name | text | cast |
| Collation | text | cast |
| Cardinality | integer | cast |
| Sub_part | integer | cast |
| Packed | text | cast |
| Null | text | cast |
| Index_type | text | cast |
| Comment | text | cast |
| Index_comment | text | cast |

---
