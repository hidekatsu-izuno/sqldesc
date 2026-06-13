# Apache DataFusion テストケース

このドキュメントは [Apache DataFusion 公式ドキュメント](https://datafusion.apache.org/user-guide/sql/select.html) に基づき、`sqldesc` が Apache DataFusion 方言（`--dialect datafusion`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/datafusion.md`）。

```yaml
doc: sqldesc-test/v1
dialect: datafusion
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Apache DataFusion SELECT](https://datafusion.apache.org/user-guide/sql/select.html) |
| Information schema | [Apache DataFusion Information Schema](https://datafusion.apache.org/user-guide/sql/information_schema.html) |
| CLI | [Apache DataFusion CLI Usage](https://datafusion.apache.org/user-guide/cli/usage.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-ddl
dialect: datafusion
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

[Apache DataFusion SELECT](https://datafusion.apache.org/user-guide/sql/select.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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

## WHERE ORDER LIMIT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT id, name FROM users WHERE amount > 0 ORDER BY name LIMIT 5
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

---

## 集約

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT name, SUM(amount) AS total FROM users GROUP BY name
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | users.name |
| total | DECIMAL | expression |

---

## ウィンドウ関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |
| rn | INTEGER | expression |

---

## CTE

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
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
| name | VARCHAR(255) | recent.name |

---

## VALUES 派生表

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT * FROM (VALUES (1, 'a')) AS v(id, name)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | v.id |
| name | VARCHAR(255) | v.name |

---

# メタデータ

[Apache DataFusion Information Schema](https://datafusion.apache.org/user-guide/sql/information_schema.html)

---

## EXPLAIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
EXPLAIN SELECT id FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| QUERY PLAN | VARCHAR(255) | cast |

---

## SHOW TABLES

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
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

## SHOW COLUMNS

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
SHOW COLUMNS FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Field | VARCHAR(255) | cast |
| Type | VARCHAR(255) | cast |
| Null | VARCHAR(255) | cast |
| Key | VARCHAR(255) | cast |
| Default | VARCHAR(255) | cast |
| Extra | VARCHAR(255) | cast |

---

## DESCRIBE table

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: datafusion
```

```sql
DESCRIBE users
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

---

## information_schema.tables Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT table_catalog, table_schema, table_name, table_type FROM information_schema.tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_catalog | VARCHAR(255) | information_schema.tables.table_catalog |
| table_schema | VARCHAR(255) | information_schema.tables.table_schema |
| table_name | VARCHAR(255) | information_schema.tables.table_name |
| table_type | VARCHAR(255) | information_schema.tables.table_type |

---

## information_schema.columns Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT table_name, column_name, ordinal_position, data_type, is_nullable FROM information_schema.columns
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | VARCHAR(255) | information_schema.columns.table_name |
| column_name | VARCHAR(255) | information_schema.columns.column_name |
| ordinal_position | BIGINT | information_schema.columns.ordinal_position |
| data_type | VARCHAR(255) | information_schema.columns.data_type |
| is_nullable | VARCHAR(255) | information_schema.columns.is_nullable |

---

## information_schema.views Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT table_name, definition FROM information_schema.views
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | VARCHAR(255) | information_schema.views.table_name |
| definition | VARCHAR(255) | information_schema.views.definition |

---

## information_schema.df_settings Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: datafusion
```

```sql
SELECT name, value, description FROM information_schema.df_settings
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | VARCHAR(255) | information_schema.df_settings.name |
| value | VARCHAR(255) | information_schema.df_settings.value |
| description | VARCHAR(255) | information_schema.df_settings.description |

---
