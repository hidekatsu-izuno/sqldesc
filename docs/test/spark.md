# Spark SQL テストケース

このドキュメントは [Spark SQL 公式ドキュメント](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select.html) に基づき、`sqldesc` が Spark SQL 方言（`--dialect spark`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/spark.md`）。

```yaml
doc: sqldesc-test/v1
dialect: spark
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Spark SQL SELECT](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: spark
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
        { "name": "created_at", "type": "timestamp" }
      ]
    }
  ]
}
```

---

# SELECT 基本

[Spark SQL SELECT](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-select.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: spark
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

# メタデータ

[Spark SQL SHOW](https://spark.apache.org/docs/latest/sql-ref-syntax-aux-show.html)

---

## SHOW CURRENT NAMESPACE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
SHOW CURRENT NAMESPACE
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| namespace | VARCHAR(255) | cast |

---

## DESCRIBE DATABASE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
DESCRIBE DATABASE default
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| database_description_item | VARCHAR(255) | cast |
| database_description_value | VARCHAR(255) | cast |

---

## DESCRIBE FUNCTION

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
DESCRIBE FUNCTION abs
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| function_desc | VARCHAR(255) | cast |

---

## SHOW FUNCTIONS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
SHOW FUNCTIONS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Function | VARCHAR(255) | cast |
| Type | VARCHAR(255) | cast |
| Definer | VARCHAR(255) | cast |
| Modified | TIMESTAMP | cast |
| Created | TIMESTAMP | cast |
| Security_type | VARCHAR(255) | cast |
| Comment | VARCHAR(255) | cast |

---

## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: spark
```

```sql
SHOW TABLES
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | VARCHAR(255) | cast |

---
