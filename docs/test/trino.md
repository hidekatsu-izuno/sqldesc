# Trino テストケース

このドキュメントは [Trino 公式ドキュメント](https://trino.io/docs/current/) に基づき、`sqldesc` が Trino 方言（`--dialect trino`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは [Given-When-Then](https://en.wikipedia.org/wiki/Given-When-Then) 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc` / `npm run test:doc:file -- docs/test/trino.md`）。

```yaml
doc: sqldesc-test/v1
dialect: trino
```

## ドキュメント形式（sqldesc-test/v1）

[sqlite.md](sqlite.md) / [postgresql.md](postgresql.md) / [mysql.md](mysql.md) / [oracle.md](oracle.md) / [tsql.md](tsql.md) / [duckdb.md](duckdb.md) / [bigquery.md](bigquery.md) と同じ形式です。

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列の明示指定、`*` 全列展開、FROM 句なし、ORDER BY / OFFSET / LIMIT |
| JOIN | INNER JOIN |
| 集約 | GROUP BY / HAVING、FILTER 句 |
| ウィンドウ関数 | ROW_NUMBER |
| 複合行ソース | VALUES、UNNEST |
| 型・関数 | ARRAY、MAP、JSON |
| メタデータ | SHOW CATALOGS、information_schema.tables |

参照ドキュメント:

| カテゴリ | Trino ドキュメント |
|----------|-------------------|
| SELECT 基本 | [SELECT](https://trino.io/docs/current/sql/select.html) |
| JOIN | [SELECT - joins](https://trino.io/docs/current/sql/select.html#joins) |
| 集約 | [Aggregate functions](https://trino.io/docs/current/functions/aggregate.html) |
| ウィンドウ関数 | [Window functions](https://trino.io/docs/current/functions/window.html) |
| VALUES | [VALUES](https://trino.io/docs/current/sql/values.html) |
| UNNEST | [SELECT - UNNEST](https://trino.io/docs/current/sql/select.html#unnest) |
| 型 | [Data types](https://trino.io/docs/current/language/types.html) |
| JSON | [JSON functions](https://trino.io/docs/current/functions/json.html) |
| SHOW | [SHOW CATALOGS](https://trino.io/docs/current/sql/show-catalogs.html) |
| Information schema | [Information schema](https://trino.io/docs/current/connector/system.html#information-schema) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: trino
```

```json
{
  "tables": [
    {
      "name": "users",
      "columns": [
        { "name": "id", "type": "integer" },
        { "name": "name", "type": "varchar" },
        { "name": "age", "type": "integer" },
        { "name": "dept", "type": "varchar" },
        { "name": "amount", "type": "decimal(10,2)" },
        { "name": "data", "type": "json" },
        { "name": "tags", "type": "array<varchar>" },
        { "name": "attrs", "type": "map<varchar, varchar>" },
        { "name": "created_at", "type": "timestamp" }
      ]
    },
    {
      "name": "orders",
      "columns": [
        { "name": "id", "type": "integer" },
        { "name": "user_id", "type": "integer" },
        { "name": "amount", "type": "decimal(10,2)" }
      ]
    }
  ]
}
```

---

# SELECT 基本

[Trino SELECT](https://trino.io/docs/current/sql/select.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: trino
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
| name | varchar | users.name |
| amount | decimal(10,2) | users.amount |

---
## `*` 全列展開

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: trino
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
| name | varchar | users.name |
| age | integer | users.age |
| dept | varchar | users.dept |
| amount | decimal(10,2) | users.amount |
| data | json | users.data |
| tags | array(varchar) | users.tags |
| attrs | map(varchar, varchar) | users.attrs |
| created_at | timestamp(3) | users.created_at |

---
## FROM 句なし

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: trino
```

```sql
SELECT 1 AS one, 'x' AS label, true AS ok
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | integer | literal |
| label | varchar(1) | literal |
| ok | boolean | expression |

---
## ORDER BY / OFFSET / LIMIT

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: trino
```

```sql
SELECT id FROM users ORDER BY id OFFSET 5 LIMIT 10
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |

---

# JOIN

[Trino SELECT - joins](https://trino.io/docs/current/sql/select.html#joins)

---

## INNER JOIN

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: trino
```

```sql
SELECT u.id, o.amount
FROM users u
JOIN orders o ON o.user_id = u.id
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | decimal(10,2) | orders.amount |

---

# 集約

[Trino aggregate functions](https://trino.io/docs/current/functions/aggregate.html)

---

## GROUP BY / HAVING

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: trino
```

```sql
SELECT dept, count(*) AS n, sum(amount) AS total
FROM users
GROUP BY dept
HAVING count(*) > 1
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | varchar | users.dept |
| n | bigint | expression |
| total | decimal(38,2) | expression |

---
## FILTER 句

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: trino
```

```sql
SELECT count(*) FILTER (WHERE age >= 20) AS adults FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| adults | bigint | expression |

---

# ウィンドウ関数

[Trino window functions](https://trino.io/docs/current/functions/window.html)

---

## ROW_NUMBER

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: trino
```

```sql
SELECT id, row_number() OVER (PARTITION BY dept ORDER BY id) AS rn FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| rn | bigint | expression |

---

# 複合行ソース

[Trino VALUES](https://trino.io/docs/current/sql/values.html)

---

## VALUES 派生テーブル

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: trino
```

```sql
SELECT * FROM (VALUES (1, 'a'), (2, 'b')) AS t(id, label)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |
| label | varchar | t.label |

---
## UNNEST

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: trino
```

```sql
SELECT x FROM UNNEST(ARRAY[1, 2]) AS t(x)
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| x | integer | t.x |

---

# 型・関数

[Trino data types](https://trino.io/docs/current/language/types.html)

---

## ARRAY / MAP

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: trino
```

```sql
SELECT ARRAY[1, 2, 3] AS nums, MAP(ARRAY['a'], ARRAY[1]) AS m
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| nums | array(integer) | expression |
| m | map(varchar, integer) | expression |

---
## JSON 関数

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: trino
```

```sql
SELECT json_extract(data, '$.name') AS name_json FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name_json | json | expression |

---

# メタデータ

[Trino SHOW CATALOGS](https://trino.io/docs/current/sql/show-catalogs.html)

---

## SHOW CATALOGS

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: trino
```

```sql
SHOW CATALOGS
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Catalog | varchar | cast |

---
## information_schema.tables

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: trino
```

```sql
SELECT table_name FROM information_schema.tables
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table_name | varchar | information_schema.tables.table_name |

---

## information_schema.tables Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: trino
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
| table_catalog | varchar | information_schema.tables.table_catalog |
| table_schema | varchar | information_schema.tables.table_schema |
| table_name | varchar | information_schema.tables.table_name |
| table_type | varchar | information_schema.tables.table_type |

---

## information_schema.columns Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: trino
```

```sql
SELECT column_name, data_type FROM information_schema.columns
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_name | varchar | information_schema.columns.column_name |
| data_type | varchar | information_schema.columns.data_type |

---

## system.runtime.nodes Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: trino
```

```sql
SELECT node_id, http_uri, coordinator FROM runtime.nodes
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| node_id | varchar | runtime.nodes.node_id |
| http_uri | varchar | runtime.nodes.http_uri |
| coordinator | boolean | runtime.nodes.coordinator |

---

## system.runtime.queries Docker 実測列

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: trino
```

```sql
SELECT query_id, state, query FROM runtime.queries
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| query_id | varchar | runtime.queries.query_id |
| state | varchar | runtime.queries.state |
| query | varchar | runtime.queries.query |
