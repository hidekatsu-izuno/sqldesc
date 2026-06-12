# SQLite テストケース

このドキュメントは [SQLite 公式ドキュメント](https://sqlite.org/docs.html) に基づき、`sqldesc` が SQLite 方言（`--dialect sqlite`）で推論する結果セット列を検証するためのテストケースを定義します。

各テストケースは [Given-When-Then](https://en.wikipedia.org/wiki/Given-When-Then) 形式で記述し、この md ファイルをそのまま読み込んで機械実行できます（`npm run test:doc` / `npm run test:doc:file -- docs/test/sqlite.md`）。

```yaml
doc: sqldesc-test/v1
dialect: sqlite
```

## ドキュメント形式（sqldesc-test/v1）

### Prepare（再利用可能な前提）

`## Prepare-N: タイトル` で定義します。メタデータは \`yaml\` フェンス、本体は \`sql\` または \`json\` フェンスです。

### テストケース

各 `##` セクションで `### Given` / `### When` / `### Then` を使います。

**Given** — 前提を \`yaml\` フェンスで指定:

| 指定 | 意味 |
|------|------|
| `prepare: Prepare-1` | 共通ベーススキーマ（`Prepare-1`）を使用 |
| `prepare: Prepare-1, Prepare-2` | ベース DDL + FTS 仮想テーブルメタデータ |
| `prepare: none` | スキーマ不要 |
| `kind: schema-json` + \`json\` フェンス | JSON メタデータ |
| \`sql\` フェンスのみ | インライン DDL |

**When** — 実行 SQL（\`yaml\` で `dialect` / `binds` を任意指定）:

```yaml
dialect: sqlite
binds: name=text,min_age=int
```

```sql
SELECT ...
```

**Then** — 期待結果（\`yaml\` で種別指定）:

| kind | 用途 |
|------|------|
| `columns` | 列テーブル（既定） |
| `error` | `describeQuery` が throw |
| `none` | 結果列なし + diagnostics |
| `skip` | 手動 / CLI / ドキュメントのみ |

\`verify: true\` を付けたケースは \`npm run test:doc\` で厳密に検証されます。未検証ケースは参考実行のみです。

- **Given**: 前提（`prepare:` 参照または DDL）
- **When**: 実行する SQL
- **Then**: 推論される結果列（`name` / `type` / `source`）

参照ドキュメント:

| 機能 | SQLite ドキュメント |
|------|---------------------|
| SELECT | [lang_select.html](https://sqlite.org/lang_select.html) |
| INSERT | [lang_insert.html](https://sqlite.org/lang_insert.html) |
| UPDATE | [lang_update.html](https://sqlite.org/lang_update.html) |
| DELETE | [lang_delete.html](https://sqlite.org/lang_delete.html) |
| RETURNING | [lang_returning.html](https://sqlite.org/lang_returning.html) |
| CREATE TABLE | [lang_createtable.html](https://sqlite.org/lang_createtable.html) |
| CREATE VIEW | [lang_createview.html](https://sqlite.org/lang_createview.html) |
| ALTER TABLE | [lang_altertable.html](https://sqlite.org/lang_altertable.html) |
| ATTACH / DETACH | [lang_attach.html](https://sqlite.org/lang_attach.html) |
| WITH（CTE） | [lang_with.html](https://sqlite.org/lang_with.html) |
| ウィンドウ関数 | [windowfunctions.html](https://sqlite.org/windowfunctions.html) |
| 式 | [lang_expr.html](https://sqlite.org/lang_expr.html) |
| PRAGMA | [pragma.html](https://sqlite.org/pragma.html) |
| JSON1 拡張 | [json1.html](https://sqlite.org/json1.html) |
| 組み込み関数 | [lang_corefunc.html](https://sqlite.org/lang_corefunc.html) |
| 集約関数 | [lang_aggfunc.html](https://sqlite.org/lang_aggfunc.html) |
| 日付・時刻 | [lang_datefunc.html](https://sqlite.org/lang_datefunc.html) |
| 数学関数 | [lang_mathfunc.html](https://sqlite.org/lang_mathfunc.html) |
| ユーザー定義関数 | [c3ref/create_function.html](https://sqlite.org/c3ref/create_function.html) |
| FTS5 全文検索 | [fts5.html](https://sqlite.org/fts5.html) |
| FTS3/4（レガシー） | [fts3.html](https://sqlite.org/fts3.html) |
| EXPLAIN | [lang_explain.html](https://sqlite.org/lang_explain.html) |
| スキーマテーブル | [schematab.html](https://sqlite.org/schematab.html) |
| generate_series | [generate_series.html](https://sqlite.org/generate_series.html) |
| 生成列 | [gencol.html](https://sqlite.org/gencol.html) |
| ROW 値 | [rowvalue.html](https://sqlite.org/rowvalue.html) |
| ANALYZE | [lang_analyze.html](https://sqlite.org/lang_analyze.html) |
| PREPARE | [lang_prepare.html](https://sqlite.org/lang_prepare.html) |
| FTS5 外部コンテンツ | [fts5.html#external_content_and_contentless_tables](https://sqlite.org/fts5.html#external_content_and_contentless_tables) |
| ATTACH DATABASE | [lang_attach.html](https://sqlite.org/lang_attach.html) |

## 目次

| カテゴリ | テストケース |
|----------|-------------|
| SELECT 基本 | 列指定、`*`、FROM なし、ORDER BY、FETCH FIRST、DISTINCT、LIMIT |
| JOIN | INNER、LEFT、RIGHT、FULL OUTER、CROSS、NATURAL、USING |
| サブクエリ | IN、EXISTS、NOT EXISTS、スカラー、派生テーブル、相関 |
| 集約 | GROUP BY、HAVING、GROUP_CONCAT、ROLLUP/CUBE/GROUPING、FILTER |
| CTE | 非再帰、再帰、連鎖、MATERIALIZED |
| 複合 SELECT | UNION、UNION ALL、INTERSECT、EXCEPT |
| ウィンドウ関数 | ROW_NUMBER、RANK、LAG/LEAD、SUM OVER、GROUPS/RANGE フレーム、名前付き WINDOW |
| 式・述語 | CASE、CAST、述語投影、COALESCE、バインドパラメータ |
| 関数（FUNCTION） | スカラー、集約、ウィンドウ、ユーザー定義、アプリケーション定義 |
| JSON1 TVF | json_each、json_tree、列との CROSS JOIN |
| 全文検索（FTS） | FTS5 MATCH/TVF、補助関数、fts5vocab、FTS4、定義オプション、外部コンテンツ |
| ATTACH / 外部スキーマ | 修飾テーブル参照、CREATE + SELECT、DETACH 連鎖 |
| DML | INSERT/UPDATE/DELETE RETURNING、UPSERT、INSERT OR（REPLACE/ABORT/FAIL/ROLLBACK）、LIMIT 付き DELETE |
| スキーマ追跡 | CREATE VIEW、DROP VIEW、TEMP VIEW、CTAS、LIKE、RENAME/DROP COLUMN、GENERATED 列 |
| rowid / LATERAL | 暗黙 rowid、LATERAL サブクエリ、複数再帰 CTE |
| 一時カタログ | sqlite_temp_master |
| PRAGMA | table_info、table_xinfo、index_info（SELECT 形式含む）、database_list、その他 |
| カタログ | sqlite_master、sqlite_schema、DESCRIBE、pragma_table_info |
| sqldesc メタ | 複数文、resultSets（3件以上）、resultKind、warnings、diagnostics コード |
| CLI 検証 | `--dialect sqlite3`、複数 `--schema`、`--binds`、複数文 `--json`、エラー出力、JSON スキーマ |
| スキーマファイル | `loadSchema` / `schemaPatterns` / 修飾 DDL によるメタデータ読み込み |
| 負のテスト | パースエラー（ライブラリ・CLI）、結果なし DML、メタデータ不足 |
| EXPLAIN | バイトコード出力 |
| 結果なし文 | ATTACH/DETACH、VACUUM、REINDEX、BEGIN 変種、INDEX/TRIGGER、FTS 管理、PREPARE |
| 拡張関数 | load_extension、readfile、writefile |
| 既知の限界 | パーサ非対応構文、unknown になりやすい関数、runtime/metadata 依存 |

## Prepare-1: 共通ベーススキーマ

多くのテストケースで共通利用する DDL です。Given で `prepare: Prepare-1` と指定します。

```yaml
kind: schema-ddl
dialect: sqlite
```

```sql
CREATE TABLE users (
  id         INTEGER NOT NULL PRIMARY KEY,
  name       TEXT    NOT NULL,
  age        INTEGER,
  dept       TEXT,
  data       JSON,
  created_at TIMESTAMP,
  blob_col   BLOB
);

CREATE TABLE orders (
  id       INTEGER NOT NULL PRIMARY KEY,
  user_id  INTEGER NOT NULL,
  amount   REAL    NOT NULL
);

CREATE TABLE active_users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL
);

CREATE TABLE departments (
  dept    TEXT    NOT NULL PRIMARY KEY,
  budget  INTEGER NOT NULL
);

-- FTS5 仮想テーブル（sender / title / body + 暗黙の rank 列）
CREATE VIRTUAL TABLE email USING fts5(sender, title, body);

-- FTS5 外部コンテンツの実テーブル
CREATE TABLE email_content (
  rowid  INTEGER PRIMARY KEY,
  sender TEXT,
  title  TEXT,
  body   TEXT
);

-- FTS5 UNINDEXED 列を含むテーブル相当
CREATE VIRTUAL TABLE customers USING fts5(name, addr, uuid UNINDEXED);

-- FTS4 仮想テーブル（レガシー）
CREATE VIRTUAL TABLE docs_fts USING fts4(title, content);
```

FTS テストでは `email` / `docs_fts` / `customers` の列定義をスキーマメタデータとして渡します。`rank` は FTS の暗黙列です。外部コンテンツ構成では `email_content` もメタデータに含めます。

ATTACH 先テーブル参照では、スキーマメタデータに `schema: 'other'` を付与したテーブル定義を使います。

## Prepare-2: FTS 仮想テーブルメタデータ

`CREATE VIRTUAL TABLE` は DDL パースでは列が展開されないため、FTS テストでは JSON メタデータを併用します。`prepare: Prepare-1, Prepare-2` でベース DDL と FTS 列定義を同時に渡します。

```yaml
kind: schema-json
dialect: sqlite
```

```json
{
  "tables": [
    {
      "name": "email",
      "columns": [
        { "name": "sender", "type": "text" },
        { "name": "title", "type": "text" },
        { "name": "body", "type": "text" },
        { "name": "rank", "type": "decimal" }
      ]
    },
    {
      "name": "customers",
      "columns": [
        { "name": "name", "type": "text" },
        { "name": "addr", "type": "text" },
        { "name": "uuid", "type": "text" }
      ]
    },
    {
      "name": "docs_fts",
      "columns": [
        { "name": "title", "type": "text" },
        { "name": "content", "type": "text" },
        { "name": "rank", "type": "integer" }
      ]
    }
  ]
}
```

---

## 単純 SELECT — 列の明示指定

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT id, name FROM users;
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

## 単純 SELECT — `*` による全列展開

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT * FROM users;
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
| age | integer | users.age |
| dept | text | users.dept |

---

## INNER JOIN

[SELECT — FROM 句の結合処理](https://sqlite.org/lang_select.html#determination_of_input_data_from_clause_processing_) に基づく結合クエリ。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);

CREATE TABLE orders (
  id       INTEGER NOT NULL PRIMARY KEY,
  user_id  INTEGER NOT NULL,
  amount   REAL    NOT NULL
);
```

### When

```sql
SELECT u.id, u.name, o.amount
FROM users u
JOIN orders o ON o.user_id = u.id;
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
| amount | real | orders.amount |

---

## LEFT OUTER JOIN

[SELECT — LEFT JOIN の処理](https://sqlite.org/lang_select.html#determination_of_input_data_from_clause_processing_) に基づく外部結合。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);

CREATE TABLE orders (
  id       INTEGER NOT NULL PRIMARY KEY,
  user_id  INTEGER NOT NULL,
  amount   REAL    NOT NULL
);
```

### When

```sql
SELECT u.id, o.amount
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | real | orders.amount |

---

## NATURAL JOIN

[SELECT — NATURAL キーワード](https://sqlite.org/lang_select.html#determination_of_input_data_from_clause_processing_) に基づく暗黙 `USING` 結合。共通列名 `dept` は片方のデータセットから省略されます。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);

CREATE TABLE departments (
  dept    TEXT    NOT NULL PRIMARY KEY,
  budget  INTEGER NOT NULL
);
```

### When

```sql
SELECT u.*
FROM users u
NATURAL JOIN departments d;
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
| age | integer | users.age |
| dept | text | users.dept |

---

## 集約クエリ — GROUP BY

[SELECT — 結果行の生成](https://sqlite.org/lang_select.html#generation_of_the_set_of_result_rows) に基づく集約。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT dept, COUNT(*) AS cnt, AVG(age) AS avg_age
FROM users
GROUP BY dept;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| cnt | integer | expression |
| avg_age | real | expression |

---
## サーバー生成列名（alias なし）

Docker image `nouchka/sqlite3:latest` で実測した未alias式の列名。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT COUNT(*), id + 1, upper(name)
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| count(*) | integer | expression |
| id+1 | integer | polyglot |
| upper(name) | text | polyglot |

---

## 共通テーブル式（WITH / CTE）

[SELECT — WITH 句](https://sqlite.org/lang_select.html#the_with_clause) に基づく CTE。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
WITH active AS (
  SELECT id, name FROM users WHERE age >= 18
)
SELECT id, name FROM active;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | active.id |
| name | text | active.name |

---

## 再帰 CTE（WITH RECURSIVE）

[WITH 句 — 再帰 CTE](https://sqlite.org/lang_with.html) に基づく再帰クエリ。

### Given

```yaml
prepare: none
```


### When

```sql
WITH RECURSIVE cnt(x) AS (
  SELECT 1
  UNION ALL
  SELECT x + 1 FROM cnt WHERE x < 5
)
SELECT x FROM cnt;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| x | integer | cnt.x |

---

## VALUES 句

[SELECT — VALUES 句](https://sqlite.org/lang_select.html#the_values_clause) に基づく行リテラル。

### Given

```yaml
prepare: none
```


### When

```sql
VALUES (1, 'a'), (2, 'b');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_1 | integer | cast |
| column_2 | text | cast |

---

## 複合 SELECT — UNION

[SELECT — 複合 SELECT](https://sqlite.org/lang_select.html#compound_select_statements) に基づく集合演算。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);

CREATE TABLE active_users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL
);
```

### When

```sql
SELECT id, name FROM users
UNION
SELECT id, name FROM active_users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cast |
| name | text | cast |

---

## 複合 SELECT — INTERSECT

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);

CREATE TABLE active_users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL
);
```

### When

```sql
SELECT id, name FROM users
INTERSECT
SELECT id, name FROM active_users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cast |
| name | text | cast |

---

## 複合 SELECT — EXCEPT

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);

CREATE TABLE active_users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL
);
```

### When

```sql
SELECT id, name FROM users
EXCEPT
SELECT id, name FROM active_users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cast |
| name | text | cast |

---

## ウィンドウ関数

[SELECT — OVER 句](https://sqlite.org/windowfunctions.html) に基づくウィンドウ関数。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT id, name, ROW_NUMBER() OVER (ORDER BY age) AS rn
FROM users;
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
| rn | integer | expression |

---

## CASE 式

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT id,
       CASE WHEN age < 18 THEN 'minor' ELSE 'adult' END AS status
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| status | text | expression |

---

## サブクエリ — IN

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);

CREATE TABLE orders (
  id       INTEGER NOT NULL PRIMARY KEY,
  user_id  INTEGER NOT NULL,
  amount   REAL    NOT NULL
);
```

### When

```sql
SELECT id, name
FROM users
WHERE id IN (SELECT user_id FROM orders);
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

## 相関サブクエリ — EXISTS

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);

CREATE TABLE orders (
  id       INTEGER NOT NULL PRIMARY KEY,
  user_id  INTEGER NOT NULL,
  amount   REAL    NOT NULL
);
```

### When

```sql
SELECT id
FROM users
WHERE EXISTS (
  SELECT 1 FROM orders WHERE orders.user_id = users.id
);
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

## CAST 式

[SELECT — CAST 式](https://sqlite.org/lang_expr.html#castexpr) に基づく型変換。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT CAST(age AS TEXT) AS age_text FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| age_text | text | polyglot |

---
## CAST 式 — storage class

[SELECT — CAST 式](https://sqlite.org/lang_expr.html#castexpr) に基づく型変換。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT
  CAST('1' AS INTEGER) AS i,
  CAST('1.5' AS NUMERIC) AS n,
  CAST(1 AS TEXT) AS t,
  CAST('abc' AS BLOB) AS b
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| i | integer | polyglot |
| n | real | polyglot |
| t | text | polyglot |
| b | blob | polyglot |

---

## DISTINCT

[SELECT — DISTINCT 処理](https://sqlite.org/lang_select.html#removal_of_duplicate_rows_distinct_processing) に基づく重複排除。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT DISTINCT dept FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |

---

## LIMIT / OFFSET

[SELECT — LIMIT 句](https://sqlite.org/lang_select.html#the_limit_clause) に基づく行数制限。結果列の形状は変わりません。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT id, name FROM users LIMIT 10 OFFSET 5;
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

## 組み込み文字列関数

[コア関数 — length / upper](https://sqlite.org/lang_corefunc.html) に基づくスカラー関数。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT LENGTH(name) AS len, UPPER(name) AS up FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| len | integer | polyglot |
| up | text | polyglot |

---

## バインドパラメータ（`?`）

[SELECT — バインドパラメータ](https://sqlite.org/lang_expr.html#varparam) に基づくプレースホルダ。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

バインド型: `text`

### When

```sql
SELECT id FROM users WHERE name LIKE ?;
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

## INSERT — RETURNING 句

[INSERT — RETURNING 句](https://sqlite.org/lang_returning.html) に基づく DML 結果セット。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
INSERT INTO users(id, name) VALUES (1, 'a') RETURNING id, name;
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

## UPDATE — RETURNING 句

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
UPDATE users SET name = 'b' RETURNING id, name;
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

## DELETE — RETURNING 句

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
DELETE FROM users RETURNING id;
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

## UPSERT — ON CONFLICT DO UPDATE RETURNING

[INSERT — ON CONFLICT](https://sqlite.org/lang_insert.html#upsert) に基づく競合解決と `excluded` 疑似テーブル。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
INSERT INTO users(id, name) VALUES (1, 'a')
ON CONFLICT(id) DO UPDATE SET name = excluded.name
RETURNING excluded.name;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | users.name |

---

## 複数文 — CREATE VIEW と SELECT

同一入力内でのスキーマ追跡。先頭の `CREATE VIEW` で定義したビューを後続の `SELECT` が参照します。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
CREATE VIEW active AS
  SELECT id, name FROM users WHERE age >= 18;

SELECT id, name FROM active;
```

### Then

```yaml
kind: columns
target: last
verify: true
```

最後の文（`SELECT`）の結果列:

| name | type | source |
|------|------|--------|
| id | integer | active.id |
| name | text | active.name |

---

## PRAGMA table_info

[PRAGMA table_info](https://sqlite.org/pragma.html#pragma_table_info) によるテーブル定義メタデータ。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
PRAGMA table_info(users);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cid | integer | cast |
| name | text | cast |
| type | text | cast |
| notnull | integer | cast |
| dflt_value | text | cast |
| pk | integer | cast |

---

## PRAGMA index_list

[PRAGMA index_list](https://sqlite.org/pragma.html#pragma_index_list) によるインデックス一覧。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);

CREATE INDEX idx_users_dept ON users(dept);
```

### When

```sql
PRAGMA index_list(users);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| seq | integer | cast |
| name | text | cast |
| unique | integer | cast |
| origin | text | cast |
| partial | integer | cast |

---

## PRAGMA foreign_key_list

[PRAGMA foreign_key_list](https://sqlite.org/pragma.html#pragma_foreign_key_list) による外部キー定義。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);

CREATE TABLE orders (
  id       INTEGER NOT NULL PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES users(id),
  amount   REAL    NOT NULL
);
```

### When

```sql
PRAGMA foreign_key_list(orders);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cast |
| seq | integer | cast |
| table | text | cast |
| from | text | cast |
| to | text | cast |
| on_update | text | cast |
| on_delete | text | cast |
| match | text | cast |

---

## sqlite_master カタログ

[スキーマテーブル sqlite_master](https://sqlite.org/schematab.html) によるメタデータ参照。

### Given

```yaml
prepare: none
```


### When

```sql
SELECT type, name, tbl_name, sql FROM sqlite_master;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| type | text | sqlite_master.type |
| name | text | sqlite_master.name |
| tbl_name | text | sqlite_master.tbl_name |
| sql | text | sqlite_master.sql |

---

## テーブル値関数 — json_each

[JSON1 — json_each()](https://sqlite.org/json1.html#jeach) による JSON オブジェクトの行展開。

### Given

```yaml
prepare: none
```


### When

```sql
SELECT j.key, j.value
FROM json_each('{"a":1}') AS j;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| key | text | j.key |
| value | text | j.value |

---

## テーブル値関数 — json_each（`*` 展開）

[JSON1 — json_each() 出力列](https://sqlite.org/json1.html#jeach) の全列。

### Given

```yaml
prepare: none
```


### When

```sql
SELECT * FROM json_each('{"a":1,"b":2}') AS j;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| key | text | j.key |
| value | text | j.value |
| type | text | j.type |
| atom | text | j.atom |
| id | integer | j.id |
| parent | integer | j.parent |
| fullkey | text | j.fullkey |
| path | text | j.path |

---

## テーブル値関数 — json_tree

[JSON1 — json_tree()](https://sqlite.org/json1.html#jtree) による JSON ツリーの行展開。

### Given

```yaml
prepare: none
```


### When

```sql
SELECT * FROM json_tree('{"a":{"b":1}}') AS j;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| key | text | j.key |
| value | text | j.value |
| type | text | j.type |
| atom | text | j.atom |
| id | integer | j.id |
| parent | integer | j.parent |
| fullkey | text | j.fullkey |
| path | text | j.path |

---

## EXPLAIN — バイトコード出力

[EXPLAIN](https://sqlite.org/lang_explain.html) によるクエリプラン（バイトコード）列。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
EXPLAIN SELECT id FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| addr | integer | cast |
| opcode | text | cast |
| p1 | integer | cast |
| p2 | integer | cast |
| p3 | integer | cast |
| p4 | text | cast |
| p5 | integer | cast |
| comment | text | cast |

---

## SQLite 組み込みスカラー関数

[コア関数 — changes / last_insert_rowid / sqlite_version](https://sqlite.org/lang_corefunc.html) および [typeof / quote / zeroblob](https://sqlite.org/lang_corefunc.html)。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT changes() AS ch,
       total_changes() AS tc,
       last_insert_rowid() AS lr,
       sqlite_version() AS sv;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ch | integer | expression |
| tc | integer | expression |
| lr | integer | expression |
| sv | text | expression |

---

## typeof / quote / zeroblob

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  age   INTEGER,
  dept  TEXT
);
```

### When

```sql
SELECT typeof(name) AS t,
       quote(name) AS q,
       zeroblob(age) AS zb
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | expression |
| q | text | expression |
| zb | blob | expression |

---

## FROM 句なし SELECT

[SELECT — FROM 省略時](https://sqlite.org/lang_select.html#simple_select_processing) は 0 列の単一行を入力とみなします。

### Given

```yaml
prepare: none
```


### When

```sql
SELECT 1 AS one, 'hello' AS msg;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | integer | literal |
| msg | text | literal |

---

## ブールリテラルと NULL

### Given

```yaml
prepare: none
```


### When

```sql
SELECT TRUE AS t, FALSE AS f, NULL AS n;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | integer | expression |
| f | integer | expression |
| n | null | literal |

---

## RIGHT OUTER JOIN

[SELECT — RIGHT JOIN](https://sqlite.org/lang_select.html#determination_of_input_data_from_clause_processing_)（SQLite 3.39.0 以降）。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT u.id, o.amount
FROM users u
RIGHT JOIN orders o ON o.user_id = u.id;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | real | orders.amount |

---

## FULL OUTER JOIN

[SELECT — FULL JOIN](https://sqlite.org/lang_select.html#determination_of_input_data_from_clause_processing_)（SQLite 3.39.0 以降）。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT u.id, o.amount
FROM users u
FULL OUTER JOIN orders o ON o.user_id = u.id;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | real | orders.amount |

---

## CROSS JOIN

[SELECT — CROSS JOIN](https://sqlite.org/lang_select.html#special_handling_of_cross_join) による直積。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT u.id, o.id
FROM users u
CROSS JOIN orders o;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| id | integer | orders.id |

---

## JOIN — USING 句

[SELECT — USING 句](https://sqlite.org/lang_select.html#determination_of_input_data_from_clause_processing_) により共通列 `user_id` は結果から 1 列にまとめられます。

### Given

```sql
CREATE TABLE users (
  id       INTEGER NOT NULL PRIMARY KEY,
  name     TEXT    NOT NULL,
  user_id  INTEGER
);

CREATE TABLE orders (
  id       INTEGER NOT NULL PRIMARY KEY,
  user_id  INTEGER NOT NULL,
  amount   REAL    NOT NULL
);
```

### When

```sql
SELECT u.id, u.name, o.amount
FROM users u
JOIN orders o USING (user_id);
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
| amount | real | orders.amount |

---

## HAVING 句

[SELECT — HAVING 句](https://sqlite.org/lang_select.html#generation_of_the_set_of_result_rows) による集約後フィルタ。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT dept, COUNT(*) AS cnt
FROM users
GROUP BY dept
HAVING COUNT(*) > 1;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| cnt | integer | expression |

---

## スカラーサブクエリ（SELECT リスト）

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id, (SELECT MAX(amount) FROM orders) AS max_amt
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| max_amt | real | expression |

---

## 相関スカラーサブクエリ

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT u.id,
       (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS oc
FROM users u;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| oc | integer | polyglot |

---

## 派生テーブル（FROM 句サブクエリ）

[SELECT — サブクエリをテーブルとして使用](https://sqlite.org/lang_select.html#table_or_subquery) 。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT t.id, t.n
FROM (SELECT id, name AS n FROM users) AS t;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |
| n | text | t.n |

---

## NOT EXISTS

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM orders WHERE orders.user_id = users.id
);
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

## 複合 SELECT — UNION ALL

[SELECT — UNION ALL](https://sqlite.org/lang_select.html#compound_select_statements) は重複を残します。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users
UNION ALL
SELECT id FROM active_users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cast |

---

## テーブルエイリアス `.*` 展開

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT u.*
FROM users AS u;
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
| age | integer | users.age |
| dept | text | users.dept |
| data | text | users.data |
| created_at | text | users.created_at |
| blob_col | blob | users.blob_col |

---

## 連鎖 CTE

[WITH 句 — 複数 CTE](https://sqlite.org/lang_with.html) の連鎖参照。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
WITH a AS (SELECT id FROM users),
     b AS (SELECT id FROM a)
SELECT id FROM b;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | b.id |

---

## MATERIALIZED CTE

[WITH 句 — MATERIALIZED ヒント](https://sqlite.org/lang_with.html)（SQLite 3.35.0 以降）。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
WITH active AS MATERIALIZED (SELECT id FROM users)
SELECT id FROM active;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | active.id |

---

## VALUES — 列エイリアス付き派生テーブル

### Given

```yaml
prepare: none
```


### When

```sql
SELECT c1, c2
FROM (VALUES (1, 'a'), (2, 'b')) AS v(c1, c2);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| c1 | integer | v.c1 |
| c2 | text | v.c2 |

---

## ORDER BY と NULLS FIRST

[SELECT — ORDER BY 句](https://sqlite.org/lang_select.html#the_order_by_clause)（SQLite 3.30.0 以降の `NULLS FIRST` / `NULLS LAST`）。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id
FROM users
ORDER BY age NULLS FIRST;
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

## FETCH FIRST 句

[SELECT — LIMIT / FETCH FIRST](https://sqlite.org/lang_select.html#the_limit_clause) による行数制限（SQL:2008 構文）。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users FETCH FIRST 5 ROWS ONLY;
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

## INDEXED BY ヒント

[INDEXED BY](https://sqlite.org/lang_indexedby.html) によるインデックス指定。結果列は変わりません。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users INDEXED BY sqlite_autoindex_users_1;
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

## 名前付きバインドパラメータ

[バインドパラメータ — `:name`](https://sqlite.org/lang_expr.html#varparam)。

### Given

```yaml
prepare: Prepare-1
```


バインド型: `name=text`

### When

```sql
SELECT id FROM users WHERE name = :name;
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

## 述語投影 — 比較・NULL チェック・BETWEEN

[式 — 比較演算子](https://sqlite.org/lang_expr.html) に基づく `boolean` 列。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       age > 18 AS adult,
       name IS NULL AS nnull,
       age BETWEEN 1 AND 100 AS bw
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| adult | integer | polyglot |
| nnull | integer | expression |
| bw | integer | expression |

---

## IS NOT DISTINCT FROM

[式 — IS / IS NOT](https://sqlite.org/lang_expr.html#isisnot) による NULL セーフ比較。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users WHERE age IS NOT DISTINCT FROM 18;
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

## IN リスト

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users WHERE dept IN ('sales', 'eng');
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

## GLOB 演算子

[式 — GLOB](https://sqlite.org/lang_expr.html#glob)（SQLite 固有のパターンマッチ）。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users WHERE name GLOB 'A*';
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

## COALESCE / IFNULL / NULLIF

[COALESCE / IFNULL / NULLIF](https://sqlite.org/lang_corefunc.html) による NULL 処理。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT COALESCE(age, 0) AS a,
       IFNULL(name, '') AS n,
       NULLIF(age, 0) AS z
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | integer | expression |
| n | text | expression |
| z | integer | expression |

---

## IIF 関数

[組み込み — iif()](https://sqlite.org/lang_corefunc.html) による条件分岐。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT IIF(age >= 18, 'adult', 'minor') AS s FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | text | expression |

---

## CAST — BLOB / REAL

[CAST 式](https://sqlite.org/lang_expr.html#castexpr) による型変換。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT CAST(name AS BLOB) AS b,
       CAST(age AS REAL) AS r
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| b | blob | polyglot |
| r | real | polyglot |

---

## 集約関数 — MIN / MAX / SUM / AVG

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT MIN(u.age) AS mi,
       MAX(u.age) AS ma,
       SUM(o.amount) AS s
FROM users u
JOIN orders o ON o.user_id = u.id;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mi | integer | expression |
| ma | integer | expression |
| s | real | expression |

---

## COUNT DISTINCT

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT COUNT(DISTINCT dept) AS cd FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cd | integer | expression |

---

## GROUP_CONCAT

[組み込み — group_concat()](https://sqlite.org/lang_aggfunc.html#groupconcat) による文字列連結集約。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT dept, GROUP_CONCAT(name, ',') AS names
FROM users
GROUP BY dept;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| names | text | expression |

---

## GROUP BY ROLLUP

[GROUP BY — ROLLUP](https://sqlite.org/syntax/group-by.html) による小計行。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT dept, COUNT(*) AS cnt
FROM users
GROUP BY ROLLUP(dept);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| cnt | integer | expression |

---

## GROUP BY CUBE

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT dept, COUNT(*) AS cnt
FROM users
GROUP BY CUBE(dept);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| cnt | integer | expression |

---

## GROUPING 関数

[GROUPING()](https://sqlite.org/windowfunctions.html#groupingfunc) によるスーパーアグリゲート行の識別。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT dept, GROUPING(dept) AS g
FROM users
GROUP BY ROLLUP(dept);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| g | integer | expression |

---

## 集約 — bare 列と MAX()

[SELECT — bare 列](https://sqlite.org/lang_select.html#bare_columns_in_an_aggregate_query)（SQLite 拡張）。`MAX()` がある場合、同グループの任意行から bare 列が選ばれます。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT dept, name, MAX(age)
FROM users
GROUP BY dept;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| name | text | users.name |
| column_1 | integer | expression |

---

## 集約 FILTER 句

[集約 — FILTER](https://sqlite.org/windowfunctions.html#filtered_agg) による条件付き集約。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT COUNT(*) FILTER (WHERE age >= 18) AS adult_cnt
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| adult_cnt | integer | expression |

---

## RANK ウィンドウ関数

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id, RANK() OVER (PARTITION BY dept ORDER BY age) AS r
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| r | integer | expression |

---

## DENSE_RANK / NTILE

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       DENSE_RANK() OVER (ORDER BY age) AS dr,
       NTILE(4) OVER (ORDER BY age) AS nt
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| dr | integer | expression |
| nt | integer | expression |

---

## LAG / LEAD

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       LAG(age) OVER (ORDER BY id) AS la,
       LEAD(age) OVER (ORDER BY id) AS le
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| la | integer | expression |
| le | integer | expression |

---

## FIRST_VALUE

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       FIRST_VALUE(name) OVER (PARTITION BY dept ORDER BY age) AS fv
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| fv | text | expression |

---

## PERCENT_RANK

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id, PERCENT_RANK() OVER (ORDER BY age) AS pr
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| pr | real | expression |

---

## SUM() OVER — パーティション集計

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id, SUM(amount) OVER (PARTITION BY user_id) AS s
FROM orders;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | orders.id |
| s | real | polyglot |

---

## 名前付き WINDOW 句

[WINDOW 句](https://sqlite.org/syntax/window-defn.html) によるウィンドウ定義の再利用。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id, SUM(age) OVER w AS s
FROM users
WINDOW w AS (PARTITION BY dept);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| s | real | polyglot |

---

## 文字列関数 — REPLACE / SUBSTR / TRIM / INSTR

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT REPLACE(name, 'a', 'b') AS r,
       SUBSTR(name, 1, 3) AS s,
       TRIM(name) AS t,
       INSTR(name, 'a') AS i
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | text | polyglot |
| s | text | expression |
| t | text | expression |
| i | integer | expression |

---

## 文字列関数 — LOWER / UPPER / LENGTH

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT LOWER(name) AS l, UPPER(name) AS u, LENGTH(name) AS len
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| l | text | polyglot |
| u | text | polyglot |
| len | integer | polyglot |

---

## 数学関数 — ABS / SIGN / ROUND / SQRT / POWER

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT SIGN(age) AS s,
       ABS(age) AS a,
       ROUND(amount, 2) AS r,
       SQRT(age) AS sq,
       POWER(age, 2) AS p
FROM users u
JOIN orders o ON o.user_id = u.id;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | integer | expression |
| a | real | polyglot |
| r | real | polyglot |
| sq | real | polyglot |
| p | real | polyglot |

---

## HEX / UNHEX

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT HEX(name) AS h, UNHEX(HEX(name)) AS u FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| h | text | expression |
| u | blob | expression |

---

## PRINTF

[組み込み — printf()](https://sqlite.org/lang_corefunc.html) によるフォーマット文字列。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT PRINTF('%s:%d', name, age) AS p FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| p | text | polyglot |

---

## RANDOM

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT RANDOM() AS r FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | real | expression |

---

## 日付・時刻関数 — DATE / TIME / DATETIME

[日付・時刻関数](https://sqlite.org/lang_datefunc.html)。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT DATE(created_at) AS d,
       TIME(created_at) AS t,
       DATETIME(created_at) AS dt
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| d | text | polyglot |
| t | text | expression |
| dt | text | expression |

---

## STRFTIME

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT STRFTIME('%Y', created_at) AS y FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| y | text | polyglot |

---

## CURRENT_TIMESTAMP / CURRENT_DATE / CURRENT_TIME

### Given

```yaml
prepare: none
```


### When

```sql
SELECT CURRENT_TIMESTAMP AS ct,
       CURRENT_DATE AS cd,
       CURRENT_TIME AS ctm;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ct | text | expression |
| cd | text | polyglot |
| ctm | text | polyglot |

---

## JSON — json_extract

[JSON1 — json_extract()](https://sqlite.org/json1.html#jex) 。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT JSON_EXTRACT(data, '$.x') AS x FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| x | text | expression |

---

## JSON — json_object / json_array

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT JSON_OBJECT('id', id, 'name', name) AS o,
       JSON_ARRAY(id, name) AS a
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| o | text | expression |
| a | text | expression |

---

## JSON — json_set / json_type / json_valid

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT JSON_SET(data, '$.x', 1) AS s,
       JSON_TYPE(data) AS t,
       JSON_VALID(data) AS v
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | text | expression |
| t | text | expression |
| v | integer | expression |

---

## JSON — json_group_array

[JSON1 — json_group_array()](https://sqlite.org/json1.html#jgrouparray) による集約。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT dept, JSON_GROUP_ARRAY(name) AS a
FROM users
GROUP BY dept;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| a | text | expression |

---

## json_each — テーブル列との CROSS JOIN

[JSON1 — json_each() をテーブル列に適用](https://sqlite.org/json1.html#jeach) 。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT e.value
FROM users, JSON_EACH(users.data) AS e;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| value | text | e.value |

---

## INSERT — 複数行 VALUES RETURNING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT INTO users(id, name) VALUES (1, 'a'), (2, 'b') RETURNING id;
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

## INSERT — SELECT RETURNING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT INTO active_users(id, name)
SELECT id, name FROM users
RETURNING id, name;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | active_users.id |
| name | text | active_users.name |

---

## INSERT — RETURNING `*`

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT INTO users(id, name)
SELECT id, name FROM active_users
RETURNING *;
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
| age | integer | users.age |
| dept | text | users.dept |
| data | text | users.data |
| created_at | text | users.created_at |
| blob_col | blob | users.blob_col |

---

## UPDATE — RETURNING `*`

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
UPDATE users SET name = 'x' RETURNING *;
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
| age | integer | users.age |
| dept | text | users.dept |
| data | text | users.data |
| created_at | text | users.created_at |
| blob_col | blob | users.blob_col |

---

## DELETE — RETURNING `*`

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
DELETE FROM users RETURNING *;
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
| age | integer | users.age |
| dept | text | users.dept |
| data | text | users.data |
| created_at | text | users.created_at |
| blob_col | blob | users.blob_col |

---

## UPDATE — エイリアス `u.*` RETURNING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
UPDATE users AS u SET name = 'x' RETURNING u.*;
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
| age | integer | users.age |
| dept | text | users.dept |
| data | text | users.data |
| created_at | text | users.created_at |
| blob_col | blob | users.blob_col |

---

## DELETE — エイリアス列 RETURNING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
DELETE FROM users AS u RETURNING u.id, u.name;
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

## UPSERT — RETURNING `excluded.*`

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT INTO users(id, name) VALUES (1, 'a')
ON CONFLICT(id) DO UPDATE SET name = excluded.name
RETURNING excluded.*;
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
| age | integer | users.age |
| dept | text | users.dept |
| data | text | users.data |
| created_at | text | users.created_at |
| blob_col | blob | users.blob_col |

---

## UPSERT — ON CONFLICT DO NOTHING RETURNING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT INTO users(id, name) VALUES (1, 'a')
ON CONFLICT DO NOTHING
RETURNING id;
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

## CREATE TABLE AS SELECT

[CREATE TABLE AS](https://sqlite.org/lang_createtable.html#ctealtable) によるスキーマ追跡。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
CREATE TABLE backup AS SELECT id, name FROM users;

SELECT id, name FROM backup;
```

### Then

```yaml
kind: columns
target: last
verify: true
```

最後の文（`SELECT`）の結果列:

| name | type | source |
|------|------|--------|
| id | integer | backup.id |
| name | text | backup.name |

---

## CREATE VIEW — `*` 定義と SELECT

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
CREATE VIEW v AS SELECT * FROM users;

SELECT * FROM v;
```

### Then

```yaml
kind: columns
target: last
verify: true
```

最後の文（`SELECT`）の結果列:

| name | type | source |
|------|------|--------|
| id | integer | v.id |
| name | text | v.name |
| age | integer | v.age |
| dept | text | v.dept |
| data | text | v.data |
| created_at | text | v.created_at |
| blob_col | blob | v.blob_col |

---

## ALTER TABLE ADD COLUMN

[ALTER TABLE — ADD COLUMN](https://sqlite.org/lang_altertable.html) による列追加の追跡。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
ALTER TABLE users ADD COLUMN email TEXT;

SELECT id, email FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| email | text | users.email |

---

## ALTER TABLE RENAME TO

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
ALTER TABLE users RENAME TO people;

SELECT id FROM people;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | people.id |

---

## DROP TABLE 後の SELECT

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
DROP TABLE active_users;

SELECT id FROM users;
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

## PRAGMA table_info — SELECT 形式

[PRAGMA table_info](https://sqlite.org/pragma.html#pragma_table_info) をテーブル値関数として SELECT。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT * FROM pragma_table_info('users');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cid | integer | pragma_table_info.cid |
| name | text | pragma_table_info.name |
| type | text | pragma_table_info.type |
| notnull | integer | pragma_table_info.notnull |
| dflt_value | text | pragma_table_info.dflt_value |
| pk | integer | pragma_table_info.pk |

---

## PRAGMA function_list

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA function_list;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | cast |
| builtin | integer | cast |
| type | text | cast |
| enc | text | cast |
| narg | integer | cast |
| flags | integer | cast |

---

## PRAGMA module_list

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA module_list;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | cast |

---

## PRAGMA compile_options

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA compile_options;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| compile_options | text | cast |

---

## PRAGMA collation_list

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA collation_list;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| seq | integer | cast |
| name | text | cast |

---

## PRAGMA pragma_list

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA pragma_list;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | cast |

---

## PRAGMA quick_check

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA quick_check;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| quick_check | text | cast |

---

## PRAGMA optimize

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA optimize;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| optimize | text | cast |

---

## PRAGMA wal_checkpoint

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA wal_checkpoint;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| busy | integer | cast |
| log | integer | cast |
| checkpointed | integer | cast |

---

## PRAGMA stats

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA stats;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table | text | cast |
| index | text | cast |
| width | integer | cast |
| height | integer | cast |

---

## PRAGMA journal_mode

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA journal_mode;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| journal_mode | text | cast |

---

## PRAGMA cache_size

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA cache_size;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cache_size | integer | cast |

---

## PRAGMA foreign_keys

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA foreign_keys;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| foreign_keys | integer | cast |

---

## PRAGMA foreign_key_check

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
PRAGMA foreign_key_check;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| table | text | cast |
| rowid | integer | cast |
| parent | text | cast |
| fkid | integer | cast |

---

## PRAGMA table_list

[PRAGMA table_list](https://sqlite.org/pragma.html#pragma_table_list)（SQLite 3.37.0 以降）。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
PRAGMA table_list;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| schema | text | cast |
| name | text | cast |
| type | text | cast |
| ncol | integer | cast |
| wr | integer | cast |
| strict | integer | cast |

---

## PRAGMA reverse_unordered_selects

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA reverse_unordered_selects;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| reverse_unordered_selects | integer | cast |

---

## sqlite_schema エイリアス

[sqlite_schema](https://sqlite.org/schematab.html) は `sqlite_master` のエイリアスです。

### Given

```yaml
prepare: none
```


### When

```sql
SELECT name FROM sqlite_schema WHERE type = 'table';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | sqlite_schema.name |

---

## DESCRIBE テーブル

スキーマが利用可能な場合、`DESCRIBE table_name` はテーブル列を返します。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
DESCRIBE users;
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
| age | integer | users.age |
| dept | text | users.dept |
| data | text | users.data |
| created_at | text | users.created_at |
| blob_col | blob | users.blob_col |

---

## generate_series テーブル値関数

[generate_series()](https://sqlite.org/generate_series.html)（組み込みテーブル値関数）。

### Given

```yaml
prepare: none
```


### When

```sql
SELECT value FROM generate_series(1, 5);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| value | integer | generate_series.value |

---

## ATTACH DATABASE（結果なし）

[ATTACH DATABASE](https://sqlite.org/lang_attach.html) は結果セットを返しません。

### Given

```yaml
prepare: none
```


### When

```sql
ATTACH DATABASE 'x.db' AS x;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## VACUUM（結果なし）

[VACUUM](https://sqlite.org/lang_vacuum.html) は結果セットを返しません。

### Given

```yaml
prepare: none
```


### When

```sql
VACUUM;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## REINDEX（結果なし）

[REINDEX](https://sqlite.org/lang_reindex.html) は結果セットを返しません。

### Given

```yaml
prepare: none
```


### When

```sql
REINDEX;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## BEGIN（結果なし）

[トランザクション制御](https://sqlite.org/lang_transaction.html) は結果セットを返しません。

### Given

```yaml
prepare: none
```


### When

```sql
BEGIN;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

# 組み込み関数（FUNCTION）

[組み込み関数](https://sqlite.org/lang_corefunc.html)・[集約関数](https://sqlite.org/lang_aggfunc.html)・[数学関数](https://sqlite.org/lang_mathfunc.html)・[ウィンドウ関数](https://sqlite.org/windowfunctions.html) の使用時に推論される結果列を検証します。

ユーザー定義関数は SQL ではなく C API（[`sqlite3_create_function()`](https://sqlite.org/c3ref/create_function.html)）で登録します。クエリ内で呼び出すと、型情報がない限り `unknown` として報告されます。

---

## 集約関数 — AVG / COUNT / SUM

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT AVG(age) AS a,
       COUNT(*) AS c,
       COUNT(DISTINCT dept) AS cd,
       SUM(age) AS s
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | real | expression |
| c | integer | expression |
| cd | integer | expression |
| s | integer | expression |

---

## 集約関数 — MIN / MAX

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT MIN(age) AS mi, MAX(age) AS ma FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| mi | integer | expression |
| ma | integer | expression |

---

## 集約関数 — TOTAL

[集約 — total()](https://sqlite.org/lang_aggfunc.html#total) は `sum()` と似ていますが NULL 行を 0 として扱います。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT TOTAL(age) AS t FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | real | expression |

---

## 数学関数 — ABS / ROUND / FLOOR / CEILING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT ABS(age) AS a,
       ROUND(age) AS r,
       FLOOR(age) AS f,
       CEILING(age) AS c
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| a | real | polyglot |
| r | real | polyglot |
| f | integer | expression |
| c | integer | expression |

---

## 数学関数 — SIGN / SQRT / EXP / LN

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT SIGN(age) AS s,
       SQRT(ABS(age)) AS sq,
       EXP(1) AS e,
       LN(age) AS l
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | integer | expression |
| sq | real | polyglot |
| e | real | polyglot |
| l | real | polyglot |

---

## 数学関数 — DEGREES / RADIANS

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT DEGREES(PI()) AS d, RADIANS(180) AS r FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| d | real | expression |
| r | real | expression |

---

## 文字列関数 — TRIM / LTRIM / RTRIM

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT TRIM(name) AS t,
       LTRIM(name, 'x') AS lt,
       RTRIM(name, 'x') AS rt
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | expression |
| lt | text | polyglot |
| rt | text | polyglot |

---

## 文字列関数 — SUBSTR / SUBSTRING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT SUBSTR(name, 1, 3) AS s,
       SUBSTRING(name, 2) AS s2
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | text | expression |
| s2 | text | expression |

---

## 文字列関数 — LENGTH / OCTET_LENGTH

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT LENGTH(name) AS l, OCTET_LENGTH(name) AS ol FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| l | integer | polyglot |
| ol | integer | expression |

---

## 文字列関数 — SOUNDEX

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT SOUNDEX(name) AS s FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | text | expression |

---

## 文字列関数 — 連結（`||`）

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT name || ' ' || CAST(age AS TEXT) AS c FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| c | text | polyglot |

---

## 文字列関数 — CHAR

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT CHAR(65, 66) AS c FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| c | integer | polyglot |

---

## 述語関数 — LIKE（投影）

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT name LIKE 'a%' AS l FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| l | integer | polyglot |

---

## 述語関数 — ISNULL / NOTNULL / IS NULL

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT name ISNULL AS ni,
       name NOTNULL AS nn,
       age IS NULL AS ai
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ni | integer | expression |
| nn | integer | expression |
| ai | integer | expression |

---

## バイナリ関数 — HEX / UNHEX / ZEROBLOB

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT HEX(blob_col) AS h,
       UNHEX(HEX(blob_col)) AS u,
       ZEROBLOB(10) AS z
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| h | text | expression |
| u | blob | expression |
| z | integer | polyglot |

---

## 日時関数 — DATETIME 修飾子

[日付・時刻 — 修飾子](https://sqlite.org/lang_datefunc.html#modifiers) 付き `datetime()` / `date()`。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT DATETIME('now') AS n,
       DATETIME('now', '+1 day') AS nd,
       DATE('now', 'start of month') AS sm
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | text | polyglot |
| nd | text | polyglot |
| sm | text | polyglot |

---

## JSON 関数 — json_insert / json_remove

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT JSON_INSERT(data, '$.x', 1) AS ji,
       JSON_REMOVE(data, '$.x') AS jrm
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ji | text | expression |
| jrm | text | expression |

---

## JSON 関数 — json_array_length

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT JSON_ARRAY_LENGTH(JSON_ARRAY(1, 2)) AS jal FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jal | integer | expression |

---

## JSON 関数 — json_each パス指定

[JSON1 — json_each() 第2引数](https://sqlite.org/json1.html#jeach) による配列パス展開。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT value FROM JSON_EACH(data, '$.items');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| value | text | json_each.value |

---

## スカラーサブクエリ（集約）

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT (SELECT COUNT(*) FROM users) AS c;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| c | integer | polyglot |

---

## ROW 値コンストラクタ

[ROW 値](https://sqlite.org/rowvalue.html) による複合値。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT (id, name) AS r FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | record<id integer, name text> | expression |

---

## ウィンドウ関数 — RANK / DENSE_RANK / PERCENT_RANK / CUME_DIST

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       RANK() OVER w AS r,
       DENSE_RANK() OVER w AS dr,
       PERCENT_RANK() OVER w AS pr,
       CUME_DIST() OVER w AS cd
FROM users
WINDOW w AS (ORDER BY age);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| r | integer | expression |
| dr | integer | expression |
| pr | real | expression |
| cd | real | expression |

---

## ウィンドウ関数 — FIRST_VALUE / LAST_VALUE / NTH_VALUE

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       FIRST_VALUE(name) OVER (ORDER BY age) AS fv,
       LAST_VALUE(name) OVER (ORDER BY age) AS lv,
       NTH_VALUE(name, 2) OVER (ORDER BY age) AS nv
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| fv | text | expression |
| lv | text | expression |
| nv | text | expression |

---

## ウィンドウ関数 — LAG / LEAD（オフセット・デフォルト値）

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       LAG(age, 1, 0) OVER (ORDER BY id) AS la,
       LEAD(age, 1, 0) OVER (ORDER BY id) AS le
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| la | integer | expression |
| le | integer | expression |

---

## ウィンドウ関数 — SUM / AVG OVER

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       SUM(age) OVER (PARTITION BY dept) AS s,
       AVG(age) OVER (PARTITION BY dept) AS a
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| s | real | polyglot |
| a | real | polyglot |

---

## アプリケーション定義スカラー関数

[`sqlite3_create_function()`](https://sqlite.org/c3ref/create_function.html) で登録した関数。スキーマに型情報がないため `unknown` になります。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT my_custom_func(name) AS r FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | unknown | — |

---

## アプリケーション定義集約関数

[`sqlite3_create_function()`](https://sqlite.org/c3ref/create_function.html) で登録したユーザー集約。型情報がないため `unknown` になります。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT my_custom_agg(name) AS r FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | unknown | — |

---

# 全文検索（FTS）

[FTS5 拡張](https://sqlite.org/fts5.html) および [FTS3/4](https://sqlite.org/fts3.html) を使った全文検索クエリの結果列を検証します。FTS5 テーブルには暗黙の `rowid` と特殊列 `rank` があります。

---

## FTS5 — MATCH 演算子と `*`

[FTS5 — MATCH 演算子](https://sqlite.org/fts5.html#overview_of_fts5) による全文検索。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT *
FROM email
WHERE email MATCH 'fts5';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |
| title | text | email.title |
| body | text | email.body |
| rank | real | email.rank |

---

## FTS5 — テーブル値関数構文

[FTS5 — テーブル値関数構文](https://sqlite.org/fts5.html#overview_of_fts5) `table('query')`。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT *
FROM email('fts5');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |
| title | text | email.title |
| body | text | email.body |
| rank | real | email.rank |

---

## FTS5 — `=` 演算子

`MATCH` と等価な `=` 演算子による検索。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender, title
FROM email
WHERE email = 'fts5';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |
| title | text | email.title |

---

## FTS5 — ORDER BY rank

[FTS5 — rank 列](https://sqlite.org/fts5.html#overview_of_fts5) による関連度順ソート。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender, title
FROM email
WHERE email MATCH 'fts5'
ORDER BY rank;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |
| title | text | email.title |

---

## FTS5 — 列フィルタ MATCH

[FTS5 — 列フィルタ](https://sqlite.org/fts5.html#fts5_column_filters) により特定列のみ検索。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT *
FROM email
WHERE title MATCH 'sqlite';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |
| title | text | email.title |
| body | text | email.body |
| rank | real | email.rank |

---

## FTS5 — プレフィックスクエリ

[FTS5 — プレフィックスクエリ](https://sqlite.org/fts5.html#fts5_prefix_queries) `*` による前方一致。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH 'sql*';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## FTS5 — フレーズクエリ

[FTS5 — フレーズ](https://sqlite.org/fts5.html#fts5_phrases) による連続トークン検索。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH '"full text"';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## FTS5 — ブール演算子（OR）

[FTS5 — ブール演算子](https://sqlite.org/fts5.html#fts5_boolean_operators)。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH 'sqlite OR fts5';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## FTS5 — NOT 演算子

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH 'sqlite NOT fts5';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## FTS5 — NEAR クエリ

[FTS5 — NEAR クエリ](https://sqlite.org/fts5.html#fts5_near_queries) による近接検索。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH 'NEAR(sqlite search, 10)';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## FTS5 — 列フィルタ（`title :`）

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH 'title : sqlite';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## FTS5 — 否定列フィルタ（`- body :`）

[FTS5 — 否定列フィルタ](https://sqlite.org/fts5.html#fts5_column_filters) により特定列を検索対象から除外。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH '- body : secret';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## FTS5 補助関数 — highlight()

[FTS5 — highlight()](https://sqlite.org/fts5.html#the_highlight_function) によるマッチ箇所のハイライト。戻り値は TEXT として推論されます。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT HIGHLIGHT(email, 2, '<b>', '</b>') AS h
FROM email('fts5');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| h | text | expression |

---

## FTS5 補助関数 — snippet()

[FTS5 — snippet()](https://sqlite.org/fts5.html#the_snippet_function) による抜粋表示。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT SNIPPET(email, -1, '<b>', '</b>', '...', 8) AS s
FROM email('test');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | text | expression |

---

## FTS5 補助関数 — bm25()

[FTS5 — bm25()](https://sqlite.org/fts5.html#the_bm25_function) による関連度スコア。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT BM25(email, 10.0, 1.0, 5.0) AS score
FROM email('test')
ORDER BY score;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| score | real | expression |

---

## FTS5 補助関数 — fts5_get_locale / fts5_insttoken

[FTS5 — fts5_get_locale() / fts5_insttoken()](https://sqlite.org/fts5.html#the_fts5_get_locale_function) 。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT FTS5_GET_LOCALE(email) AS loc,
       FTS5_INSTTOKEN(email) AS it
FROM email('fts5');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| loc | text | expression |
| it | text | expression |

---

## FTS5 — 通常テーブルとの JOIN

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT u.name, e.title
FROM users u
JOIN email e ON e.sender = u.name
WHERE e MATCH 'fts5';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | users.name |
| title | text | email.title |

---

## fts5vocab — col モード（`SELECT *`）

[fts5vocab モジュール](https://sqlite.org/fts5.html#the_fts5vocab_virtual_table_module) 。`*` 展開時は列推論されます。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT * FROM fts5vocab(email, 'col');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| term | text | fts5vocab.term |
| col | text | fts5vocab.col |
| doc | integer | fts5vocab.doc |
| cnt | integer | fts5vocab.cnt |

---

## FTS5 — CREATE VIRTUAL TABLE（単純定義）と SELECT

オプションなしの単純な FTS5 定義は、同一 SQL 内でも後続 SELECT の列推論が成功します。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE email2 USING fts5(sender, title, body);

SELECT sender, title
FROM email2
WHERE email2 MATCH 'sqlite';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email2.sender |
| title | text | email2.title |

`statements`: `[["raw","none"],["select","static"]]`

---

## FTS4 — MATCH 検索（レガシー）

[FTS3/4](https://sqlite.org/fts3.html) による全文検索。FTS4 テーブルにも `rank` 暗黙列があります。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```

### When

```sql
SELECT *
FROM docs_fts
WHERE docs_fts MATCH 'search';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| title | text | docs_fts.title |
| content | text | docs_fts.content |
| rank | integer | docs_fts.rank |

---

# sqldesc メタ検証

`DescribeResult` の `columns` は **先頭の結果セット**（`resultSets[0]`）を返します。複数文 SQL では `resultSets` / `statements` も併せて検証します。

---

## 複数文 — 2 つの SELECT

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users;
SELECT name FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

`columns`（先頭結果セット）:

| name | type | source |
|------|------|--------|
| id | integer | users.id |

`resultSets`（2 件）:

1. `id`
2. `name`

`statements`: `[["select","static"],["select","static"]]`

---

## 複数文 — 結果なし文と SELECT の混在

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
BEGIN;
SELECT id FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |

`statements`: `[["transaction","none"],["select","static"]]`

---

## メタデータ依存 — DESCRIBE 未存在テーブル

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
DESCRIBE missing_table;
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_METADATA_RESULT_SHAPE
verify: true
```

結果列なし（`resultKind: metadata`）。

`diagnostics` に `SQLDESC_METADATA_RESULT_SHAPE` を含む。`warnings` が 1 件以上。

---

## メタデータ依存と静的 SELECT の混在

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
DESCRIBE missing_table;
SELECT 1 AS one;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | integer | literal |

`statements`: `[["describe","metadata"],["select","static"]]`

---

## 実行時依存 — CALL

### Given

```yaml
prepare: none
```


### When

```sql
CALL my_proc();
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_RUNTIME_RESULT_SHAPE
verify: true
```

結果列なし（`resultKind: runtime`）。

`diagnostics` に `SQLDESC_RUNTIME_RESULT_SHAPE` を含む。

---

## PREPARE と EXECUTE

同一入力内で定義したプリペアド文を `EXECUTE` すると、定義時の SELECT 形状を再利用します。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
PREPARE s AS SELECT id FROM users;
EXECUTE s;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |

`statements`: `[["prepare","none"],["execute","static"]]`

---

## PREPARE のみ（結果なし）

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
PREPARE s AS SELECT id, name FROM users;
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_NO_RESULT_COLUMNS
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

`diagnostics` に `SQLDESC_NO_RESULT_COLUMNS` を含む。

---

## warnings — 型推論不能列

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT JULIANDAY(created_at) AS jd, PI() AS p FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| jd | real | expression |
| p | real | expression |

型が安定している数学・日時関数として推論されます。

---

# DML 拡張（SQLite 固有）

---

## INSERT OR REPLACE — RETURNING

[INSERT — OR 句](https://sqlite.org/lang_insert.html) による競合時置換。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT OR REPLACE INTO users(id, name) VALUES (1, 'a') RETURNING id;
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

## INSERT OR IGNORE — RETURNING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT OR IGNORE INTO users(id, name) VALUES (1, 'a') RETURNING id;
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

## UPSERT — DO UPDATE WHERE 句

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT INTO users(id, name) VALUES (1, 'a')
ON CONFLICT(id) DO UPDATE SET name = excluded.name
  WHERE excluded.name <> users.name
RETURNING id;
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

## DELETE — LIMIT 付き RETURNING

[DELETE — LIMIT 句](https://sqlite.org/lang_delete.html)（SQLite 拡張）。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
DELETE FROM users WHERE id = 1 LIMIT 1 RETURNING id;
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

## ANALYZE TABLE

[ANALYZE](https://sqlite.org/lang_analyze.html) は固定メタデータ列を返します。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
ANALYZE users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| Table | text | cast |
| Op | text | cast |
| Msg_type | text | cast |
| Msg_text | text | cast |

---

# 結果なし文（追加）

---

## DETACH DATABASE

### Given

```yaml
prepare: none
```


### When

```sql
DETACH DATABASE x;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## COMMIT

### Given

```yaml
prepare: none
```


### When

```sql
COMMIT;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## ROLLBACK

### Given

```yaml
prepare: none
```


### When

```sql
ROLLBACK;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## SAVEPOINT

### Given

```yaml
prepare: none
```


### When

```sql
SAVEPOINT sp1;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## CREATE INDEX

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
CREATE INDEX idx_users_name ON users(name);
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## DROP INDEX

### Given

```sql
CREATE TABLE users (
  id   INTEGER NOT NULL PRIMARY KEY,
  name TEXT    NOT NULL
);
CREATE INDEX idx_users_name ON users(name);
```

### When

```sql
DROP INDEX idx_users_name;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## CREATE TRIGGER

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
CREATE TRIGGER trg_users_ai
BEFORE INSERT ON users
BEGIN
  SELECT 1;
END;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

# バインドパラメータ（追加）

---

## ドル記号パラメータ（`$name`）

### Given

```yaml
prepare: Prepare-1
```


バインド型: `name=text`

### When

```sql
SELECT id FROM users WHERE name = $name;
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

## アット記号パラメータ（`@name`）

### Given

```yaml
prepare: Prepare-1
```


バインド型: `name=text`

### When

```sql
SELECT id FROM users WHERE name = @name;
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

## 複数プレースホルダ（`?` 連続）

`?1` 形式は現状パーサ非対応のため、連続 `?` で代替します。

### Given

```yaml
prepare: Prepare-1
```


バインド型: `text,int`

### When

```sql
SELECT id FROM users WHERE name = ? AND age > ?;
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

# PRAGMA（追加）

---

## PRAGMA index_info

[PRAGMA index_info](https://sqlite.org/pragma.html#pragma_index_info) 。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  dept  TEXT
);
CREATE INDEX idx_users_dept ON users(dept);
```

### When

```sql
PRAGMA index_info(idx_users_dept);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| seqno | integer | cast |
| cid | integer | cast |
| name | text | cast |

---

## PRAGMA index_xinfo

[PRAGMA index_xinfo](https://sqlite.org/pragma.html#pragma_index_xinfo) 。

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  dept  TEXT
);
CREATE INDEX idx_users_dept ON users(dept);
```

### When

```sql
PRAGMA index_xinfo(idx_users_dept);
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| seqno | integer | cast |
| cid | integer | cast |
| name | text | cast |
| desc | integer | cast |
| coll | text | cast |
| key | integer | cast |

---

## PRAGMA database_list

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA database_list;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| seq | integer | cast |
| name | text | cast |
| file | text | cast |

---

## PRAGMA integrity_check

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA integrity_check;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| integrity_check | text | cast |

---

## PRAGMA encoding

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA encoding;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| encoding | text | cast |

---

## PRAGMA user_version

### Given

```yaml
prepare: none
```


### When

```sql
PRAGMA user_version;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| user_version | integer | cast |

---

# スキーマ追跡（追加）

---

## CREATE TABLE ... LIKE

[CREATE TABLE ... LIKE](https://sqlite.org/lang_createtable.html#clone) による構造コピー。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
CREATE TABLE users_copy LIKE users;

SELECT id, name FROM users_copy;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users_copy.id |
| name | text | users_copy.name |

---

## CREATE TEMP TABLE

### Given

```yaml
prepare: none
```


### When

```sql
CREATE TEMP TABLE tmp(id INTEGER, name TEXT);

SELECT id FROM tmp;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | tmp.id |

---

## GENERATED ALWAYS AS 列

[生成列](https://sqlite.org/gencol.html)（STORED）の追跡。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE TABLE t (
  id        INTEGER,
  name      TEXT,
  age       INTEGER,
  full_name TEXT GENERATED ALWAYS AS (name || ' ' || CAST(age AS TEXT)) STORED
);

SELECT id, full_name FROM t;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |
| full_name | text | t.full_name |

---

## NOT MATERIALIZED CTE

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
WITH active AS NOT MATERIALIZED (SELECT id FROM users)
SELECT id FROM active;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | active.id |

---

# 全文検索（FTS 応用）

---

## FTS5 — 暗黙 AND クエリ

[FTS5 — 暗黙 AND](https://sqlite.org/fts5.html#fts5_boolean_operators)（空白区切りトークン）。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH 'sqlite fts5';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## FTS5 — 初期トークンクエリ（`^`）

[FTS5 — Initial Token Queries](https://sqlite.org/fts5.html#fts5_initial_token_queries) 。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH '^sqlite';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## FTS4 — offsets() 補助関数

[FTS4 — offsets()](https://sqlite.org/fts3.html#offsets) 。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT OFFSETS(docs_fts) AS o
FROM docs_fts('search');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| o | text | expression |

---

## FTS4 — matchinfo() 補助関数

[FTS4 — matchinfo()](https://sqlite.org/fts3.html#matchinfo) 。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT MATCHINFO(docs_fts) AS m
FROM docs_fts('search');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| m | blob | expression |

---

## FTS5 — rebuild 管理コマンド（結果なし）

[FTS5 — rebuild コマンド](https://sqlite.org/fts5.html#the_rebuild_command) 。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
INSERT INTO email(email, rank) VALUES ('rebuild', NULL);
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

# 式・SELECT エッジ（追加）

---

## REGEXP 演算子（WHERE）

[REGEXP 演算子](https://sqlite.org/lang_expr.html#regexp)（拡張）。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users WHERE name REGEXP 'a.*';
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

## MATCH 演算子（WHERE）

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users WHERE name MATCH 'name';
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

## LIKE — ESCAPE 句

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id
FROM users
WHERE name LIKE 'a\_%' ESCAPE '\';
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

## タプル IN

[ROW 値比較](https://sqlite.org/rowvalue.html) による複合条件。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id
FROM users
WHERE (dept, age) IN (SELECT dept, 18 FROM departments);
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

## GROUPING SETS

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT dept, COUNT(*) AS c
FROM users
GROUP BY GROUPING SETS ((dept), ());
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| c | integer | expression |

---

## ウィンドウフレーム — EXCLUDE CURRENT ROW

[ウィンドウフレーム — EXCLUDE](https://sqlite.org/windowfunctions.html#exclusion) 。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       SUM(age) OVER (
         ORDER BY id
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
         EXCLUDE CURRENT ROW
       ) AS s
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| s | real | polyglot |

---

## ORDER BY — NULLS LAST

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users ORDER BY age NULLS LAST;
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

## 修飾 `*` と JOIN（`u.*` + 他表列）

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT u.*, o.amount
FROM users u
JOIN orders o ON o.user_id = u.id;
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
| age | integer | users.age |
| dept | text | users.dept |
| data | text | users.data |
| created_at | text | users.created_at |
| blob_col | blob | users.blob_col |
| amount | real | orders.amount |

---

## 自己結合

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT a.name, b.name
FROM users a
JOIN users b ON a.dept = b.dept;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | users.name |
| name | text | users.name |

---

## NOT INDEXED ヒント

[NOT INDEXED](https://sqlite.org/lang_indexedby.html) によるインデックス不使用ヒント。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users NOT INDEXED;
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

## 複合 SELECT — 全体 ORDER BY / LIMIT

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users
UNION
SELECT id FROM orders
ORDER BY 1
LIMIT 5;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | cast |

---

## REGEXP / MATCH / GLOB（SELECT 投影）

WHERE 句では形状が保たれます。投影でも `REGEXP` / `MATCH` / `GLOB` は boolean として推論されます。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT REGEXP(name, 'a.*') AS r,
       name MATCH 'name' AS m,
       name GLOB 'A*' AS g
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | integer | expression |
| m | integer | expression |
| g | integer | expression |

---

# JSON 関数（追加）

---

## json_patch

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT JSON_PATCH(data, '{"y":2}') AS p FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| p | text | expression |

---

## json_replace

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT JSON_REPLACE(data, '$.x', 1) AS r FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| r | text | expression |

---

## json_group_object

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT dept, JSON_GROUP_OBJECT(name, age) AS o
FROM users
GROUP BY dept;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| dept | text | users.dept |
| o | text | expression |

---

## unixepoch

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT UNIXEPOCH(created_at) AS ue FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| ue | integer | expression |

---

# FTS5 定義オプションと外部コンテンツ

[FTS5 テーブル作成](https://sqlite.org/fts5.html#fts5_table_creation_and_initialization) の各オプションに対するテストです。スキーマを事前ロードした場合と、同一 SQL 内で `CREATE VIRTUAL TABLE` する場合で挙動が異なります。

---

## FTS5 外部コンテンツ — スキーマロード済み

[外部コンテンツテーブル](https://sqlite.org/fts5.html#external_content_tables) 。`email`（FTS5）と `email_content`（実テーブル）をメタデータに登録します。

### Given

```yaml
kind: schema-json
```

```json
{
  "tables": [
    {
      "name": "email",
      "columns": [
        { "name": "sender", "type": "text" },
        { "name": "title", "type": "text" },
        { "name": "body", "type": "text" },
        { "name": "rank", "type": "decimal" }
      ]
    },
    {
      "name": "email_content",
      "columns": [
        { "name": "rowid", "type": "integer" },
        { "name": "sender", "type": "text" },
        { "name": "title", "type": "text" },
        { "name": "body", "type": "text" }
      ]
    }
  ]
}
```

```sql
CREATE VIRTUAL TABLE email USING fts5(
  sender, title, body,
  content='email_content', content_rowid='rowid'
);

CREATE TABLE email_content (
  rowid  INTEGER PRIMARY KEY,
  sender TEXT,
  title  TEXT,
  body   TEXT
);
```

### When

```sql
SELECT sender, body
FROM email
WHERE email MATCH 'sqlite';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |
| body | text | email.body |

---

## FTS5 UNINDEXED 列 — スキーマロード済み

[UNINDEXED 列オプション](https://sqlite.org/fts5.html#the_unindexed_column_option) 。検索対象外の列も SELECT 結果には含まれます。

### Given

```yaml
kind: schema-json
```

```json
{
  "tables": [
    {
      "name": "customers",
      "columns": [
        { "name": "name", "type": "text" },
        { "name": "addr", "type": "text" },
        { "name": "uuid", "type": "text" }
      ]
    }
  ]
}
```

```sql
CREATE VIRTUAL TABLE customers USING fts5(name, addr, uuid UNINDEXED);
```

### When

```sql
SELECT name, uuid
FROM customers
WHERE customers MATCH 'acme';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | customers.name |
| uuid | text | customers.uuid |

---

## FTS5 — 複数列フィルタ（`{col1 col2} :`）

[FTS5 列フィルタ — 複数列](https://sqlite.org/fts5.html#fts5_column_filters) 。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH '{sender title} : sqlite';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## FTS5 — 列別初期トークン（`title : ^`）

[FTS5 Initial Token + 列フィルタ](https://sqlite.org/fts5.html#fts5_initial_token_queries) 。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sender
FROM email
WHERE email MATCH 'title : ^sqlite';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email.sender |

---

## fts5vocab — row モード（`SELECT *`）

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT * FROM fts5vocab(email, 'row');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| term | text | fts5vocab.term |
| doc | integer | fts5vocab.doc |
| cnt | integer | fts5vocab.cnt |

---

## fts5vocab — instance モード（`SELECT *`）

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT * FROM fts5vocab(email, 'instance');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| term | text | fts5vocab.term |
| doc | integer | fts5vocab.doc |
| col | text | fts5vocab.col |
| offset | integer | fts5vocab.offset |

---

## fts5vocab — col モード（部分列指定）

`SELECT *` 以外でも、明示した列は推論されます。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT term FROM fts5vocab(email, 'col');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| term | text | fts5vocab.term |

---

## CREATE VIRTUAL TABLE — content= 外部コンテンツ（スキーマ追跡）

同一 SQL 内で実テーブルと FTS5 外部コンテンツを定義します。

### Given

```sql
CREATE TABLE email_content (
  rowid  INTEGER PRIMARY KEY,
  sender TEXT,
  title  TEXT,
  body   TEXT
);
```

### When

```sql
CREATE VIRTUAL TABLE email_ext USING fts5(
  sender, title, body,
  content='email_content', content_rowid='rowid'
);

SELECT sender
FROM email_ext
WHERE email_ext MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email_ext.sender |

`statements`: `[["raw","none"],["select","static"]]`

---

## CREATE VIRTUAL TABLE — UNINDEXED 列（スキーマ追跡）

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE customers_fts USING fts5(name, addr, uuid UNINDEXED);

SELECT name
FROM customers_fts
WHERE customers_fts MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | customers_fts.name |

---

## CREATE VIRTUAL TABLE — contentless

[コンテンツレステーブル](https://sqlite.org/fts5.html#contentless_tables) 。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE email_cl USING fts5(sender, title, body, content='');

SELECT sender
FROM email_cl
WHERE email_cl MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email_cl.sender |

---

## CREATE VIRTUAL TABLE — tokenize='porter'

[トークナイザ — porter](https://sqlite.org/fts5.html#the_porter_tokenizer) 。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE email_porter USING fts5(
  sender, title, body,
  tokenize='porter'
);

SELECT sender
FROM email_porter
WHERE email_porter MATCH 'running';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email_porter.sender |

---

## CREATE VIRTUAL TABLE — prefix インデックス

[プレフィックスインデックス](https://sqlite.org/fts5.html#prefix_indexes) 。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE email_pref USING fts5(
  sender, title, body,
  prefix='2 3'
);

SELECT sender
FROM email_pref
WHERE email_pref MATCH 'sq*';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sender | text | email_pref.sender |

---

# ATTACH / 外部スキーマ

[ATTACH DATABASE](https://sqlite.org/lang_attach.html) による別 DB の参照と、スキーマ修飾テーブル名の解決を検証します。

---

## ATTACH 後の修飾 SELECT — other.users

スキーマメタデータに `schema: 'other'` を付与した `users` テーブルを登録します。

### Given

スキーマメタデータ:

```json
{
  "tables": [
    {
      "name": "users",
      "schema": "other",
      "columns": [
        { "name": "id", "type": "integer" },
        { "name": "name", "type": "text" }
      ]
    }
  ]
}
```

### When

```sql
ATTACH DATABASE 'other.db' AS other;

SELECT id, name FROM other.users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | other.users.id |
| name | text | other.users.name |

`statements`: `[["attach","none"],["select","static"]]`

---

## ATTACH 後に CREATE TABLE — other.people

同一入力内で ATTACH 先にテーブルを作成し、修飾名で SELECT します。

### Given

```yaml
prepare: none
```


### When

```sql
ATTACH DATABASE 'other.db' AS other;

CREATE TABLE other.people(id INTEGER, name TEXT);

SELECT id FROM other.people;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | other.people.id |

`statements`: `[["attach","none"],["create_table","none"],["select","static"]]`

---

## ATTACH → SELECT → DETACH 連鎖

### Given

```yaml
prepare: none
```


### When

```sql
ATTACH DATABASE 'x.db' AS x;
SELECT 1 AS one;
DETACH DATABASE x;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| one | integer | literal |

`statements`: `[["attach","none"],["select","static"],["detach","none"]]`

---

## main 修飾参照 — main.users（メタデータなし）

`main.` 修飾はスキーマメタデータに `schema: 'main'` がない場合 `unknown` になります。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT main.users.id FROM main.users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | unknown | — |

---

## main 修飾参照 — schema: 'main' 付きメタデータ

### Given

スキーマメタデータ:

```json
{
  "tables": [
    {
      "name": "users",
      "schema": "main",
      "columns": [
        { "name": "id", "type": "integer" },
        { "name": "name", "type": "text" }
      ]
    }
  ]
}
```

### When

```sql
SELECT id FROM main.users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | main.users.id |

---

# 一時カタログ

---

## sqlite_temp_master

[一時スキーマテーブル](https://sqlite.org/schematab.html) `sqlite_temp_master` 。

### Given

```yaml
prepare: none
```


### When

```sql
SELECT name FROM sqlite_temp_master WHERE type = 'table';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| name | text | sqlite_temp_master.name |

---

# rowid / LATERAL / 再帰 CTE（追加）

---

## rowid — 通常テーブル

[rowid](https://sqlite.org/lang_createtable.html#rowid) は暗黙の INTEGER PRIMARY KEY です。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT rowid FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rowid | integer | expression |

---

## rowid — FTS5 テーブル

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT rowid, sender, rank
FROM email
WHERE email MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| rowid | integer | expression |
| sender | text | email.sender |
| rank | real | email.rank |

---

## LATERAL サブクエリ

[LATERAL](https://sqlite.org/lang_select.html)（SQLite 3.41.0 以降）による相関派生テーブル。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT u.id, j.value
FROM users AS u,
LATERAL (SELECT value FROM json_each(u.data)) AS j;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| value | text | j.value |

---

## 複数再帰 CTE

### Given

```yaml
prepare: none
```


### When

```sql
WITH RECURSIVE
  t(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM t WHERE n < 3
  ),
  u(n) AS (SELECT n * 10 FROM t)
SELECT n FROM u;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | integer | u.n |

---

# PRAGMA（SELECT 形式・追加）

---

## PRAGMA table_xinfo — SELECT 形式

[PRAGMA table_xinfo](https://sqlite.org/pragma.html#pragma_table_xinfo) 。`hidden` 列を含みます。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT * FROM pragma_table_xinfo('users');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| cid | integer | pragma_table_xinfo.cid |
| name | text | pragma_table_xinfo.name |
| type | text | pragma_table_xinfo.type |
| notnull | integer | pragma_table_xinfo.notnull |
| dflt_value | text | pragma_table_xinfo.dflt_value |
| pk | integer | pragma_table_xinfo.pk |
| hidden | integer | pragma_table_xinfo.hidden |

---

## PRAGMA index_info — SELECT 形式

### Given

```sql
CREATE TABLE users (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT    NOT NULL,
  dept  TEXT
);
CREATE INDEX idx_users_name ON users(name);
```

### When

```sql
SELECT * FROM pragma_index_info('idx_users_name');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| seqno | integer | pragma_index_info.seqno |
| cid | integer | pragma_index_info.cid |
| name | text | pragma_index_info.name |

---

# スキーマ追跡（追加）

---

## ALTER TABLE RENAME COLUMN

[ALTER TABLE — RENAME COLUMN](https://sqlite.org/lang_altertable.html)（SQLite 3.25.0 以降）。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE TABLE t(id INTEGER, name TEXT);

ALTER TABLE t RENAME COLUMN name TO full_name;

SELECT full_name FROM t;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| full_name | text | t.full_name |

`statements`: `[["create_table","none"],["alter_table","none"],["select","static"]]`

---

## ALTER TABLE DROP COLUMN

[ALTER TABLE — DROP COLUMN](https://sqlite.org/lang_altertable.html#altertabdropcol)（SQLite 3.35.0 以降）。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE TABLE t(id INTEGER, name TEXT, age INTEGER);

ALTER TABLE t DROP COLUMN age;

SELECT id, name FROM t;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |
| name | text | t.name |

---

## DROP VIEW 後の SELECT

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
CREATE VIEW v AS SELECT id, name FROM users;

DROP VIEW v;

SELECT id FROM users;
```

### Then

```yaml
kind: columns
target: last
verify: true
```

`columns`（先頭結果セット = CREATE VIEW の形状）:

| name | type | source |
|------|------|--------|
| id | integer | users.id |

---

## CREATE TEMP VIEW

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
CREATE TEMP VIEW tv AS SELECT id, name FROM users;

SELECT id FROM tv;
```

### Then

```yaml
kind: columns
target: last
verify: true
```

`columns`（先頭結果セット）:

| name | type | source |
|------|------|--------|
| id | integer | tv.id |

---

# ウィンドウフレーム（追加）

---

## GROUPS BETWEEN フレーム

[ウィンドウフレーム — GROUPS](https://sqlite.org/windowfunctions.html) 。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       SUM(age) OVER (
         ORDER BY id
         GROUPS BETWEEN 1 PRECEDING AND 1 FOLLOWING
       ) AS s
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| s | real | polyglot |

---

## RANGE BETWEEN フレーム

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id,
       SUM(age) OVER (
         ORDER BY id
         RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS s
FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| s | real | polyglot |

---

# DML 拡張（INSERT OR 追加）

---

## INSERT OR ABORT — RETURNING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT OR ABORT INTO users(id, name) VALUES (1, 'a') RETURNING id;
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

## INSERT OR FAIL — RETURNING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT OR FAIL INTO users(id, name) VALUES (1, 'a') RETURNING id;
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

## INSERT OR ROLLBACK — RETURNING

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
INSERT OR ROLLBACK INTO users(id, name) VALUES (1, 'a') RETURNING id;
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

# トランザクション（BEGIN 変種）

---

## BEGIN DEFERRED

### Given

```yaml
prepare: none
```


### When

```sql
BEGIN DEFERRED TRANSACTION;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## BEGIN IMMEDIATE

### Given

```yaml
prepare: none
```


### When

```sql
BEGIN IMMEDIATE;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## BEGIN EXCLUSIVE

### Given

```yaml
prepare: none
```


### When

```sql
BEGIN EXCLUSIVE TRANSACTION;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

# 組み込み関数（追加）

---

## sqlite_source_id()

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT sqlite_source_id() AS sid FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| sid | text | expression |

---

# FTS5 管理コマンド（結果なし）

[FTS5 特殊 INSERT コマンド](https://sqlite.org/fts5.html#special_insert_commands) は結果セットを返しません。

### Given

```yaml
prepare: Prepare-1
```


### When / Then

| コマンド | SQL | 期待 |
|----------|-----|------|
| delete | `INSERT INTO email(email, rank) VALUES ('delete', 1)` | 結果なし（`resultKind: none`） |
| delete-all | `INSERT INTO email(email, rank) VALUES ('delete-all', NULL)` | 結果なし |
| optimize | `INSERT INTO email(email, rank) VALUES ('optimize', NULL)` | 結果なし |
| merge | `INSERT INTO email(email, rank) VALUES ('merge', 4)` | 結果なし |

いずれも `diagnostics` に `SQLDESC_NO_RESULT_COLUMNS` を含みます。

---

## CREATE VIRTUAL TABLE — detail=none

[detail オプション](https://sqlite.org/fts5.html#the_detail_option) 付きでも、単純列定義なら後続 SELECT は推論成功します。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE e USING fts5(t, content='', detail=none);

SELECT t FROM e WHERE e MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | e.t |

---

## CREATE VIRTUAL TABLE — columnsize=0

[columnsize オプション](https://sqlite.org/fts5.html#the_columnsize_option) 。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE e USING fts5(t, columnsize=0);

SELECT t FROM e WHERE e MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | e.t |

---

## CREATE VIRTUAL TABLE — contentless_unindexed

[contentless_unindexed オプション](https://sqlite.org/fts5.html#the_contentless_unindexed_option) 。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE e USING fts5(t, content='', contentless_unindexed=1);

SELECT t FROM e WHERE e MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | e.t |

---

## FTS4 — snippet() 補助関数

[FTS4 — snippet()](https://sqlite.org/fts3.html#snippet) 。FTS5 版と異なり、FTS4 では `text` と推論されます。

### Given

```yaml
prepare: Prepare-1, Prepare-2
```


### When

```sql
SELECT SNIPPET(docs_fts, 0, '[', ']', '...', 10) AS s
FROM docs_fts('search');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| s | text | expression |

---

# DDL・インデックス（追加）

---

## DROP TABLE IF EXISTS 後の SELECT

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
DROP TABLE IF EXISTS t;

SELECT id FROM users;
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

## DROP VIEW IF EXISTS

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIEW v AS SELECT 1 AS x;

DROP VIEW IF EXISTS v;

SELECT 1 AS one;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| x | integer | literal |

---

## CREATE UNIQUE INDEX

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
CREATE UNIQUE INDEX uq_users_name ON users(name);
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## 部分インデックス（WHERE 付き CREATE INDEX）

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
CREATE INDEX idx_active ON users(age) WHERE age >= 18;
```

### Then

```yaml
kind: none
resultKind: none
verify: true
```

結果列なし（`resultKind: none`）。

---

## ALTER TABLE DROP COLUMN IF EXISTS

存在しない列を DROP しても、後続 SELECT の形状は維持されます。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE TABLE t(id INTEGER, name TEXT);

ALTER TABLE t DROP COLUMN IF EXISTS missing;

SELECT id FROM t;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |

---

## CREATE TABLE — AUTOINCREMENT

### Given

```yaml
prepare: none
```


### When

```sql
CREATE TABLE t(
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);

SELECT id, name FROM t;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |
| name | text | t.name |

---

## CREATE TABLE — DEFAULT / CHECK

### Given

```yaml
prepare: none
```


### When

```sql
CREATE TABLE t(
  id   INTEGER,
  name TEXT NOT NULL DEFAULT 'x',
  age  INTEGER CHECK (age > 0)
);

SELECT id, name, age FROM t;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | t.id |
| name | text | t.name |
| age | integer | t.age |

---

# 式（追加）

---

## COLLATE 投影

[COLLATE 句](https://sqlite.org/lang_expr.html#collateexpr) 付き投影は型注釈がなく `unknown` になります。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT name COLLATE NOCASE AS n FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| n | text | users.name |

---

# 方言・CLI 検証

---

## 方言エイリアス sqlite3

CLI およびライブラリで `sqlite3` 方言を指定しても、`sqlite` と同様に推論されます。

### Given

```yaml
prepare: Prepare-1
```


方言: `sqlite3`

### When

```sql
SELECT id FROM users;
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

## CLI — スキーマファイル + JSON 出力

`sqldesc` CLI での検証例です。

### Given

スキーマファイル `schema.sql`:

```sql
CREATE TABLE users (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
```

### When

```sh
sqldesc --sql "SELECT rowid FROM users" \
  --schema "schema.sql" \
  --dialect sqlite3 \
  --json
```

### Then

`columns` 配列:

```json
[{ "name": "rowid", "type": "integer" }]
```

`warnings` / `diagnostics` は空。

---

# sqldesc メタ検証（追加）

---

## 複数文 — 3 つの SELECT（resultSets）

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
SELECT id FROM users;
SELECT name FROM users;
SELECT age FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

`columns`（`resultSets[0]`）:

| name | type | source |
|------|------|--------|
| id | integer | users.id |

`resultSets`（3 件）: `["id"]`, `["name"]`, `["age"]`

---

## 診断コード一覧（付録）

テストで確認する `diagnostics` / `warnings` の代表例です。

| コード / メッセージ | 発生条件 | 期待される `resultKind` |
|--------------------|----------|-------------------------|
| `SQLDESC_METADATA_RESULT_SHAPE` | `DESCRIBE` 未存在オブジェクト | `metadata` |
| `SQLDESC_RUNTIME_RESULT_SHAPE` | `CALL` 等の実行時依存 | `runtime` |
| `SQLDESC_NO_RESULT_COLUMNS` | `BEGIN` / `CREATE INDEX` / `UPDATE ... ORDER BY ... LIMIT` / `REPLACE INTO` / FTS 管理 INSERT 等 | `none` |
| `E200` | 未解決参照（メタデータ不足） | 文種による |
| `E201` | 式・関数の型注釈不足 | `static`（列は `unknown` の場合あり） |
| `W002` | ウィンドウフレームの警告 | `static` |
| warnings: `Could not infer type...` | `unknown` 列 | `static` |

---

# 拡張・組み込みモジュール関数

---

## load_extension()

### Given

```yaml
prepare: none
```


### When

```sql
SELECT load_extension('x');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_1 | text | polyglot |

---

## readfile()

[読み込み拡張](https://sqlite.org/lang_corefunc.html#readfile) 。

### Given

```yaml
prepare: none
```


### When

```sql
SELECT readfile('x');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_1 | text | polyglot |

---

## writefile()

### Given

```yaml
prepare: none
```


### When

```sql
SELECT writefile('x', 'data');
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| column_1 | text | polyglot |

---

# FTS5 定義オプション（追加）

---

## CREATE VIRTUAL TABLE — locale オプション

[locale オプション](https://sqlite.org/fts5.html#the_locale_option) 。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE e USING fts5(t, locale='ja');

SELECT t FROM e WHERE e MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | e.t |

---

## CREATE VIRTUAL TABLE — tokenize='porter ascii'

複合トークナイザ指定。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE e USING fts5(t, tokenize='porter ascii');

SELECT t FROM e WHERE e MATCH 'run';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | e.t |

---

## CREATE VIRTUAL TABLE — content= 通常テーブル参照

外部コンテンツとして既存の通常テーブルを参照します。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
CREATE VIRTUAL TABLE e USING fts5(t, content='users', content_rowid='id');

SELECT t FROM e WHERE e MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | e.t |

---

## CREATE VIRTUAL TABLE — detail=column

[detail=column オプション](https://sqlite.org/fts5.html#the_detail_option) 。`detail=none` と同様、後続 SELECT は推論成功します。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE e USING fts5(t, content='', detail=column);

SELECT t FROM e WHERE e MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | e.t |

---

## CREATE VIRTUAL TABLE — detail=full

[detail=full オプション](https://sqlite.org/fts5.html#the_detail_option) 。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE e USING fts5(t, content='', detail=full);

SELECT t FROM e WHERE e MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | e.t |

---

## CREATE VIRTUAL TABLE — locale + tokenize 複合

[locale オプション](https://sqlite.org/fts5.html#the_locale_option) と [tokenize オプション](https://sqlite.org/fts5.html#tokenizers) の組み合わせ。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE e USING fts5(t, locale='ja', tokenize='porter ascii');

SELECT t FROM e WHERE e MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | e.t |

---

## CREATE VIRTUAL TABLE — prefix + locale 複合

[prefix オプション](https://sqlite.org/fts5.html#prefix_indexes) と locale の組み合わせ。

### Given

```yaml
prepare: none
```


### When

```sql
CREATE VIRTUAL TABLE e USING fts5(t, prefix='2', locale='ja');

SELECT t FROM e WHERE e MATCH 'x';
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| t | text | e.t |

---

# スキーマファイル読み込み（loadSchema）

ライブラリ `loadSchema(['schemas/**/*.sql'], { dialect: 'sqlite' })` によるメタデータ読み込みを検証します。

---

## loadSchema — 複数 SQL ファイル（glob）

### Given

スキーマファイル:

`users.sql`:

```sql
CREATE TABLE users (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age  INTEGER
);
```

`orders.sql`:

```sql
CREATE TABLE orders (
  id       INTEGER PRIMARY KEY,
  user_id  INTEGER NOT NULL,
  amount   REAL NOT NULL
);
```

スキーマ読み込み: `loadSchema(['schemas/**/*.sql'], { dialect: 'sqlite' })`

### When

```sql
SELECT u.id, o.amount
FROM users u
JOIN orders o ON o.user_id = u.id;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | unknown | — |

---

## loadSchema — describeQuery の schemaPatterns

`describeQuery({ schemaPatterns, cwd })` で glob 読み込みと推論を一度に行えます。

### Given

スキーマファイル（上記 `users.sql` / `orders.sql` と同構成）を `schemas/` 配下に配置。

スキーマ読み込み:

```js
describeQuery({
  dialect: 'sqlite',
  sql: 'SELECT u.id, o.amount FROM users u JOIN orders o ON o.user_id = u.id',
  schemaPatterns: ['schemas/**/*.sql'],
  cwd: '<作業ディレクトリ>',
});
```

### When

上記 `describeQuery` を実行。

### Then

```yaml
kind: columns
```

| name | type | source |
|------|------|--------|
| id | integer | users.id |
| amount | real | orders.amount |

返却 JSON の `schema.tables` に `users` / `orders` が含まれます。

---

## loadSchema — 修飾 DDL（`CREATE TABLE other.users`）

[ATTACH](https://sqlite.org/lang_attach.html) 先スキーマのテーブルを DDL 修飾名で定義した場合、`loadSchema` が `schema: 'other'` を解釈します。

### Given

`other.sql`:

```sql
CREATE TABLE other.users (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
```

スキーマ読み込み: `loadSchema(['other.sql'], { dialect: 'sqlite' })`

### When

```sql
SELECT id, name FROM other.users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | integer | other.users.id |
| name | text | other.users.name |

---

## loadSchema — 存在しない glob パターン

### Given

`schemas/missing/*.sql` に一致するファイルが存在しない。

### When

```js
describeQuery({
  dialect: 'sqlite',
  sql: 'SELECT id FROM users',
  schemaPatterns: ['schemas/missing/*.sql'],
});
```

### Then

```yaml
kind: skip
reason: freeform expectation
```

- パースエラーにはならない
- `schema.tables` は空
- 列 `id` は `unknown`（メタデータ不足）

---

# CLI 検証（追加）

---

## CLI — 名前付き複数バインド

### Given

`schema.sql`:

```sql
CREATE TABLE users (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age  INTEGER
);
```

### When

```sh
sqldesc --sql "SELECT id FROM users WHERE name = :name AND age > :min_age" \
  --binds "name=text,min_age=int" \
  --schema "schema.sql" \
  --dialect sqlite \
  --json
```

### Then

`columns`:

```json
[{ "name": "id", "type": "integer", "source": "users.id" }]
```

`binds`:

```json
{
  "mode": "named",
  "binds": [
    { "name": "name", "type": "text" },
    { "name": "min_age", "type": "integer" }
  ]
}
```

---

## CLI — 複数スキーマファイル（glob）

### Given

`a.sql` に `users`、`b.sql` に `orders` を定義。

### When

```sh
sqldesc --sql "SELECT u.id, o.amount FROM users u JOIN orders o ON o.user_id = u.id" \
  --schema "schemas/*.sql" \
  --json
```

### Then

JOIN 列が推論される（`users.id`, `orders.amount`）。

---

## CLI — 複数文 JSON（resultSets）

### Given

`users` テーブルを含むスキーマファイル。

### When

```sh
sqldesc --sql "SELECT id FROM users; SELECT name FROM users" \
  --schema "schema.sql" \
  --json
```

### Then

```json
{
  "columns": [{ "name": "id", "type": "integer" }],
  "resultSets": [
    { "columns": [{ "name": "id", "type": "integer" }] },
    { "columns": [{ "name": "name", "type": "text" }] }
  ]
}
```

---

## CLI — パースエラー

### Given

```yaml
prepare: none
```


### When

```sh
sqldesc --sql "selec id from users" --json
```

### Then

```yaml
kind: skip
reason: freeform expectation
```

- 終了コード: `1`
- 標準エラー: `Parse error at line 1, column 14: Invalid expression / Unexpected token`
- 標準出力は空（JSON なし）

---

## CLI — バインド構文エラー

### Given

```yaml
prepare: none
```


### When

```sh
sqldesc --sql "SELECT :id AS id" --binds "id=int,text" --json
```

### Then

```yaml
kind: skip
reason: freeform expectation
```

- 終了コード: `1`
- 標準エラー: `Mixed bind syntax is not supported. Use either "int,text" or "id=int,name=text".`
- 標準出力は空

---

## CLI — SQL 入力なし

### Given

`--sql` もファイル引数も stdin も未指定（TTY）。

### When

```sh
sqldesc --json
```

### Then

```yaml
kind: skip
reason: freeform expectation
```

- 終了コード: `1`
- 標準エラー: `No SQL input. Provide a file, --sql, or stdin.`

---

## CLI — 存在しないスキーマ glob

### Given

`missing/*.sql` に一致するファイルなし。

### When

```sh
sqldesc --sql "SELECT id FROM users" --schema "missing/*.sql" --json
```

### Then

```yaml
kind: skip
reason: freeform expectation
```

- 終了コード: `0`（パースエラーではない）
- 標準出力 JSON の `columns[0].type` は `unknown`
- `warnings` に型推論失敗メッセージ
- `schema.tables` は `[]`

---

## CLI — テキスト出力と warnings（非 `--json`）

### Given

`schema.sql` に `users` テーブル定義。

### When

```sh
sqldesc --sql "SELECT julianday(created_at) AS jd FROM users" \
  --schema "schema.sql" \
  --dialect sqlite
```

### Then

```yaml
kind: skip
reason: freeform expectation
```

- 終了コード: `0`
- 標準出力: ASCII テーブル形式で列一覧（`jd` / `decimal`）
- 標準エラー: 空

---

## CLI — stdin から SQL 読み込み

### Given

```yaml
prepare: none
```


### When

```sh
echo "SELECT 1 AS one" | sqldesc --json
```

### Then

```json
{ "columns": [{ "name": "one", "type": "integer" }] }
```

---

## CLI — SQL ファイルが `--sql` より優先

### Given

`query.sql` に `SELECT 2 AS file_value`、`--sql` に別 SQL を指定。

### When

```sh
sqldesc query.sql --sql "SELECT 1 AS inline_value" --json
```

### Then

`columns[0].name` は `file_value`（ファイル内容が優先）。

---

# バインドパラメータ — 名前付き複数（ライブラリ）

### Given

```yaml
prepare: Prepare-1
```


バインド型: `name=text,min_age=int`

### When

```sql
SELECT id FROM users WHERE name = :name AND age > :min_age;
```

### Then

| name | type | source |
|------|------|--------|
| id | integer | users.id |

---

# 結果なし DML（負のテスト — 分類）

パースは成功するが結果セット列を持たない文です。`diagnostics` に `SQLDESC_NO_RESULT_COLUMNS` が付きます。

---

## UPDATE — ORDER BY / LIMIT 付き

[UPDATE](https://sqlite.org/lang_update.html) の SQLite 拡張構文。パーサは受理しますが、sqldesc は結果列を返しません。

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
UPDATE users SET name = 'x' WHERE id = 1 ORDER BY id LIMIT 1;
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_NO_RESULT_COLUMNS
resultKind: none
verify: true
```

- `columns`: 空
- `diagnostics`: `SQLDESC_NO_RESULT_COLUMNS`
- `statements[0].resultKind`: `none`

---

## REPLACE INTO

### Given

```yaml
prepare: Prepare-1
```


### When

```sql
REPLACE INTO users(id, name) VALUES (1, 'a');
```

### Then

```yaml
kind: none
diagnostics: SQLDESC_NO_RESULT_COLUMNS
verify: true
```

- パースエラーにはならない
- `columns`: 空
- `diagnostics`: `SQLDESC_NO_RESULT_COLUMNS`

---

# 負のテスト（パースエラー・分類）

意図的に不正または非対応の SQL を入力し、ライブラリと CLI の挙動を記録します。ライブラリでは `describeQuery` が `Error` を throw し、メッセージは `Parse error at line …` 形式です。

| テストケース | SQL | ライブラリ | CLI |
|-------------|-----|-----------|-----|
| タイポ | `selec id FROM users` | throw | 終了コード `1`、stderr に Parse error |
| EXPLAIN QUERY PLAN | `EXPLAIN QUERY PLAN SELECT id FROM users` | throw（column 26 付近） | 同上 |
| STRICT テーブル | `CREATE TABLE t(id INT) STRICT` | throw（column 30 付近） | 同上 |
| WITHOUT ROWID | `CREATE TABLE t(id INT PRIMARY KEY, name TEXT) WITHOUT ROWID` | throw | 同上 |
| 番号付きバインド | `SELECT id FROM users WHERE name = ?1` | throw（`?1` 非対応） | 同上 |
| RELEASE SAVEPOINT | `RELEASE SAVEPOINT sp1` | throw | 同上 |

---

## 負のテスト — ライブラリ（タイポ）

### Given

```yaml
prepare: none
```


### When

```js
await describeQuery({ dialect: 'sqlite', sql: 'selec id FROM users' });
```

### Then

```yaml
kind: error
match: Parse error at line 1, column 14: Invalid expression / Unexpected token
```

- `Error`: `Parse error at line 1, column 14: Invalid expression / Unexpected token`
- `columns` / `resultSets` は返らない

---

## 負のテスト — ライブラリ（番号付きバインド `?1`）

SQLite 実行時は `?1` をサポートしますが、sqldesc パーサは `?` のみ対応です。

### Given

```yaml
prepare: Prepare-1
```


### When

```js
await describeQuery({
  dialect: 'sqlite',
  sql: 'SELECT id FROM users WHERE name = ?1',
  schema: /* users テーブル */,
});
```

### Then

```yaml
kind: error
match: Parse error at line 1, column 37: Invalid expression / Unexpected token
```

- `Error`: `Parse error at line 1, column 37: Invalid expression / Unexpected token`
- 代替: `WHERE name = ?` とバインド型 `text` を使用

---

## 負のテスト — メタデータ不足（unknown 列）

パースエラーではなく、スキーマ未提供による推論失敗です。

### Given

```yaml
prepare: none
```


### When

```sql
SELECT id FROM users;
```

### Then

```yaml
kind: columns
verify: true
```

| name | type | source |
|------|------|--------|
| id | unknown | — |

`warnings` に型推論失敗。CLI `--json` でも終了コード `0`。

---

# CLI JSON 出力スキーマ（付録）

`sqldesc --json` の成功時 stdout は次の構造です（`DescribeResult` 型に対応）。

```json
{
  "columns": [
    {
      "index": 1,
      "name": "id",
      "type": "INTEGER",
      "nullable": true,
      "source": "users.id"
    }
  ],
  "resultSets": [
    { "index": 1, "columns": [/* DescribeColumn[] */] }
  ],
  "statements": [
    { "index": 1, "kind": "select", "resultKind": "static" }
  ],
  "warnings": [],
  "diagnostics": [
    { "code": "E201", "message": "...", "severity": "warning" }
  ],
  "binds": {
    "mode": "named",
    "binds": [{ "name": "id", "type": "integer" }]
  },
  "schema": {
    "tables": [{ "name": "users", "columns": [/* ... */] }]
  }
}
```

| フィールド | 説明 |
|-----------|------|
| `columns` | 先頭結果セットの列（`resultSets[0]` と同内容） |
| `resultSets` | 複数文 SQL の各 SELECT 結果 |
| `statements` | 文ごとの `kind`（`select` / `update` 等）と `resultKind` |
| `warnings` | 人間可読の警告文字列 |
| `diagnostics` | 構造化診断（`SQLDESC_*` / `E200` 等） |
| `binds` | 推論されたバインド仕様 |
| `schema` | マージ後の有効スキーマ |

エラー時（パース失敗・バインド不正・入力なし）は **stdout は空**、メッセージは **stderr の 1 行**、終了コード `1` です。

---

# 既知の限界

現状の `sqldesc` / パーサで **未対応または `unknown` になりやすい** 構文・関数です。テストでは意図的に期待値を `unknown` / 結果なし / `metadata` / `runtime` として記録します。

| カテゴリ | 例 | 期待される挙動 |
|----------|-----|----------------|
| パーサ非対応 | `EXPLAIN QUERY PLAN`、`RELEASE SAVEPOINT`、`STRICT` テーブル、`WITHOUT ROWID` | パースエラー |
| バインド | `?1`, `?2` 番号付きプレースホルダ | パースエラー（`?` 連続で代替） |
| 結果なし DML | `UPDATE ... ORDER BY ... LIMIT ...`、`REPLACE INTO` | パース成功、`SQLDESC_NO_RESULT_COLUMNS` |
| 型注釈なし関数 | 拡張関数またはユーザー定義関数 | `unknown` + warnings |
| スキーマ修飾 | `main.users`（`schema: 'main'` なし） | `unknown` |
| 拡張 | `load_extension()` | `unknown` |
| メタデータ依存 | `DESCRIBE` 未存在オブジェクト | 空列 + `metadata` |
| 実行時依存 | `CALL proc()` | 空列 + `runtime` |
| FTS 管理 | `INSERT INTO fts(...) VALUES('delete'/'rebuild'/...)` | 結果なし |
| 非標準 DML | `REPLACE INTO` | 結果なし（パースエラーではない場合あり） |
