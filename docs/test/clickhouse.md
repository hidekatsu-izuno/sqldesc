# ClickHouse テストケース

このドキュメントは [ClickHouse 公式ドキュメント](https://clickhouse.com/docs/sql-reference/statements/select) に基づき、`sqldesc` が ClickHouse 方言（`--dialect clickhouse`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/clickhouse.md`）。

```yaml
doc: sqldesc-test/v1
dialect: clickhouse
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [ClickHouse SELECT](https://clickhouse.com/docs/sql-reference/statements/select) |
| データ型 | [ClickHouse data types](https://clickhouse.com/docs/sql-reference/data-types) |
| テーブル関数 | [ClickHouse table functions](https://clickhouse.com/docs/sql-reference/table-functions) |
| SHOW | [ClickHouse SHOW](https://clickhouse.com/docs/sql-reference/statements/show) |

Docker 検証:

- `docker.io/clickhouse/clickhouse-server:latest` の `clickhouse-local` で確認。
- `SELECT toTypeName(1), toTypeName('x'), toTypeName(toDecimal64(1,2)), toTypeName(today()), toTypeName(now()), toTypeName([1,2]), toTypeName(map('a',1))` は `UInt8`, `String`, `Decimal(18, 2)`, `Date`, `DateTime`, `Array(UInt8)`, `Map(String, UInt8)` を返す。
- `system.numbers` の `number` 列は `UInt64`。

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: clickhouse
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

[ClickHouse SELECT](https://clickhouse.com/docs/sql-reference/statements/select)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
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

## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
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
| id | INTEGER | users.id |
| name | VARCHAR(255) | users.name |
| amount | DECIMAL | users.amount |
| created_at | TIMESTAMP | users.created_at |
| tags | array<text> | users.tags |
| attrs | map<text, integer> | users.attrs |

---

## スカラー関数と日時関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: clickhouse
```

```sql
SELECT toString(id) AS id_s, today() AS today_value, now() AS now_value FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id_s | VARCHAR(255) | expression |
| today_value | INTEGER | expression |
| now_value | TIMESTAMP | polyglot |

---

## numbers テーブル関数

### When

```yaml
dialect: clickhouse
```

```sql
SELECT * FROM numbers(3)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| numbers | INTEGER | numbers.numbers |

---

## SHOW DATABASES

### When

```yaml
dialect: clickhouse
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
| Database | VARCHAR(255) | cast |

---
