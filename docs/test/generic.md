# Generic SQL テストケース

このドキュメントは [Generic SQL 公式ドキュメント](https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html) に基づき、`sqldesc` が Generic SQL 方言（`--dialect generic`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは Given-When-Then 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc:file -- docs/test/generic.md`）。

```yaml
doc: sqldesc-test/v1
dialect: generic
```

## 参照ドキュメント

| カテゴリ | ドキュメント |
|----------|--------------|
| SELECT | [Generic SQL SELECT](https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html) |

## Prepare-1: 共通ベーススキーマ

```yaml
kind: schema-json
dialect: generic
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

[Generic SQL SELECT](https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html)

---

## 列の明示指定

### Given

```yaml
prepare: Prepare-1
```

### When

```yaml
dialect: generic
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

## Prepare-2: users / orders 結合用スキーマ

```yaml
kind: schema-json
dialect: generic
```

```json
{
  "tables": [
    {
      "name": "users",
      "columns": [
        { "name": "id", "type": "integer" },
        { "name": "name", "type": "text" },
        { "name": "age", "type": "integer" }
      ]
    },
    {
      "name": "orders",
      "columns": [
        { "name": "id", "type": "integer" },
        { "name": "user_id", "type": "integer" },
        { "name": "total", "type": "decimal" }
      ]
    }
  ]
}
```

---

## `*` 全列展開

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: generic
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
| age | INTEGER | users.age |

---

## 修飾 `*` と JOIN（`u.*` + 他表列）

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: generic
```

```sql
SELECT u.*, o.total FROM users u JOIN orders o ON u.id = o.user_id
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
| age | INTEGER | users.age |
| total | DECIMAL | orders.total |

---

## 非修飾 `*` の JOIN 展開

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: generic
```

```sql
SELECT * FROM users u JOIN orders o ON u.id = o.user_id
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
| age | INTEGER | users.age |
| id | INTEGER | orders.id |
| user_id | INTEGER | orders.user_id |
| total | DECIMAL | orders.total |

---

## 列エイリアスと式

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: generic
binds: int
```

```sql
SELECT id AS user_id, age + ? AS next_age FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| user_id | INTEGER | users.id |
| next_age | INTEGER | expression |

---

## CAST とリテラル

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: generic
binds: int
```

```sql
SELECT CAST(? AS text) AS label, 1 AS one
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| label | VARCHAR(255) | polyglot |
| one | INTEGER | literal |

---

## 名前付き bind と positional 式

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: generic
binds: id=integer,name=text
```

```sql
SELECT :id AS id, @name AS name
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | bind |
| name | VARCHAR(255) | bind |

---

## positional bind 式 — COALESCE

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: generic
binds: int
```

```sql
SELECT COALESCE(?, 1) AS n
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | INTEGER | expression |

---

## named bind 式 — GREATEST

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: generic
binds: score=decimal
```

```sql
SELECT GREATEST(:score, 1) AS score
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| score | DECIMAL | expression |

---

## 未知列の警告

### Given

```yaml
prepare: none
```

```json
{"tables": []}
```

### When

```yaml
dialect: generic
```

```sql
SELECT mystery FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mystery | unknown | — |

---

## CTE — ベース表の shadow

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: generic
```

```sql
WITH users AS (SELECT 1 AS id) SELECT id FROM users
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | users.id |

---

## CTE — チェーン

### Given

```yaml
prepare: Prepare-2
```

### When

```yaml
dialect: generic
```

```sql
WITH a AS (SELECT 1 AS id), b AS (SELECT id FROM a) SELECT id FROM b
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | INTEGER | b.id |

---

## 派生テーブル — 列指定と `*`

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: generic
```

```sql
SELECT x.one, x.label FROM (SELECT 1 AS one, 'a' AS label) x
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | INTEGER | x.one |
| label | VARCHAR(255) | x.label |

---

## 派生テーブル — `x.*`

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: generic
```

```sql
SELECT x.* FROM (SELECT 1 AS one, 'a' AS label) AS x
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | INTEGER | x.one |
| label | VARCHAR(255) | x.label |

---

## VALUES — 列エイリアス付き派生テーブル

### Given

```yaml
prepare: none
```

### When

```yaml
dialect: generic
```

```sql
SELECT v.id, v.name FROM (VALUES (1, 'a')) AS v(id, name)
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
