import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mkdir, writeFile } from 'node:fs/promises';

import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadSchema, parseCreateAsTables, parseCreateProcedures, parseCreateScalarFunctions, parseCreateSynonyms, parseCreateTableFunctions, parseCreateTables, parseCreateViews } from '../dist/schema.js';

describe('parseCreateTables', () => {
  it('extracts ordinary create table columns', () => {
    assert.deepStrictEqual(parseCreateTables(`
      CREATE TABLE public.users (
        id integer primary key,
        name varchar(255) not null,
        age int,
        constraint users_name_unique unique (name)
      );
    `), [
      {
        name: 'users',
        schema: 'public',
        columns: [
          { name: 'id', type: 'integer', nullable: false, primaryKey: true, unique: false },
          { name: 'name', type: 'text', nullable: false, primaryKey: false, unique: true },
          { name: 'age', type: 'integer', nullable: undefined, primaryKey: false, unique: false },
        ],
        primaryKey: ['id'],
        uniqueKeys: [['name']],
        foreignKeys: [],
      },
    ]);
  });

  it('extracts table-level keys and foreign keys from AST constraints', () => {
    assert.deepStrictEqual(parseCreateTables(`
      create table orders (
        id int,
        user_id int,
        total decimal(10,2),
        primary key(id),
        foreign key(user_id) references users(id),
        unique(user_id,total)
      )
    `), [
      {
        name: 'orders',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined, primaryKey: true, unique: false },
          { name: 'user_id', type: 'integer', nullable: undefined, primaryKey: false, unique: false },
          { name: 'total', type: 'decimal', nullable: undefined, primaryKey: false, unique: false },
        ],
        primaryKey: ['id'],
        uniqueKeys: [['user_id', 'total']],
        foreignKeys: [
          {
            columns: ['user_id'],
            references: {
              table: 'users',
              columns: ['id'],
            },
          },
        ],
      },
    ]);
  });

  it('passes dialect to create table AST parsing', () => {
    assert.deepStrictEqual(parseCreateTables(
      'create table dbo.t ([id] int identity(1,1) primary key, [name] nvarchar(20) not null)',
      'tsql',
    ), [
      {
        name: 't',
        schema: 'dbo',
        columns: [
          { name: 'id', type: 'integer', nullable: false, primaryKey: true, unique: false },
          { name: 'name', type: 'text', nullable: false, primaryKey: false, unique: false },
        ],
        primaryKey: ['id'],
        uniqueKeys: [],
        foreignKeys: [],
      },
    ]);
  });

  it('accepts common dialect aliases while parsing schema SQL', () => {
    assert.deepStrictEqual(parseCreateTables(
      'create table dbo.t ([id] int identity(1,1) primary key)',
      'sqlserver',
    ), [
      {
        name: 't',
        schema: 'dbo',
        columns: [
          { name: 'id', type: 'integer', nullable: false, primaryKey: true, unique: false },
        ],
        primaryKey: ['id'],
        uniqueKeys: [],
        foreignKeys: [],
      },
    ]);
  });

  it('extracts Oracle global temporary table fallback columns', () => {
    assert.deepStrictEqual(parseCreateTables(
      'create global temporary table t(id number, name varchar2(20)) on commit preserve rows',
      'oracle',
    ), [
      {
        name: 't',
        columns: [
          { name: 'id', type: 'decimal', nullable: true, primaryKey: false, unique: false },
          { name: 'name', type: 'text', nullable: true, primaryKey: false, unique: false },
        ],
        uniqueKeys: [],
        foreignKeys: [],
      },
    ]);
  });

  it('preserves nested struct and array type shapes', () => {
    assert.deepStrictEqual(parseCreateTables(
      'create table users (profile struct<name text, age int>, addresses array<struct<city text>>, scores int[])',
      'bigquery',
    )[0]?.columns.map((column) => [column.name, column.type]), [
      ['profile', 'struct<name text, age integer>'],
      ['addresses', 'array<struct<city text>>'],
      ['scores', 'array<integer>'],
    ]);
  });

  it('preserves ClickHouse map type shapes', () => {
    assert.deepStrictEqual(parseCreateTables(
      'create table users(attrs Map(String, UInt64), label Nullable(String), category LowCardinality(String), pair Tuple(String, UInt64), events Nested(name String, count UInt64)) engine = MergeTree order by tuple()',
      'clickhouse',
    )[0]?.columns.map((column) => [column.name, column.type]), [
      ['attrs', 'map<text, bigint>'],
      ['label', 'text'],
      ['category', 'text'],
      ['pair', 'struct<field_1 text, field_2 bigint>'],
      ['events', 'array<struct<name text, count bigint>>'],
    ]);
  });

  it('preserves map/list/row shapes across common nested type syntaxes', () => {
    assert.deepStrictEqual(parseCreateTables(
      'create table t(a map(varchar, integer), b list(integer), c row(name varchar, age integer))',
      'trino',
    )[0]?.columns.map((column) => [column.name, column.type]), [
      ['a', 'map<text, integer>'],
      ['b', 'array<integer>'],
      ['c', 'struct<name text, age integer>'],
    ]);
  });

  it('resolves PostgreSQL user-defined type aliases while parsing CREATE TABLE', () => {
    assert.deepStrictEqual(parseCreateTables(
      [
        'create domain positive_int as int check (value > 0)',
        "create type mood as enum ('sad','ok','happy')",
        'create type pair as (id int, name text)',
        'create table t(id positive_int, m mood, p pair)',
      ].join('; '),
      'postgres',
    )[0]?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['m', 'text'],
      ['p', 'struct<id integer, name text>'],
    ]);
  });
});

describe('loadSchema dialect handling', () => {
  it('rejects unsupported dialect names before reading schema SQL', async () => {
    await assert.rejects(
      () => loadSchema([], { dialect: 'nosuch' }),
      /Unsupported SQL dialect "nosuch"/,
    );
  });
});

describe('parseCreateViews', () => {
  it('extracts view columns from schema-backed projections', () => {
    const baseSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer', nullable: false },
            { name: 'name', type: 'text', nullable: false },
          ],
        },
      ],
    };
    assert.deepStrictEqual(parseCreateViews('create view active_users as select id, name from users', baseSchema), [
      {
        name: 'active_users',
        columns: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'name', type: 'text', nullable: false },
        ],
      },
    ]);
  });

  it('uses explicit view columns and set operation output shape', () => {
    assert.deepStrictEqual(parseCreateViews('create view numbers(n) as select 1 union select 2'), [
      {
        name: 'numbers',
        columns: [
          { name: 'n', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('extracts VALUES-backed view and CTAS columns when Polyglot omits CREATE AST', () => {
    assert.deepStrictEqual(parseCreateViews("create view value_view(label, n) as values ('a', 1), ('b', 2)", undefined, 'postgres'), [
      {
        name: 'value_view',
        columns: [
          { name: 'label', type: 'text', nullable: undefined },
          { name: 'n', type: 'integer', nullable: undefined },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateAsTables("create table value_table(label, n) as values ('a', 1)", undefined, 'postgres'), [
      {
        name: 'value_table',
        columns: [
          { name: 'label', type: 'text', nullable: undefined },
          { name: 'n', type: 'integer', nullable: undefined },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateViews("create view semicolon_value(label, n) as values ('a;b', 1);", undefined, 'postgres'), [
      {
        name: 'semicolon_value',
        columns: [
          { name: 'label', type: 'text', nullable: undefined },
          { name: 'n', type: 'integer', nullable: undefined },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateViews("create view derived_value_view(label, n) as select * from (values ('a', 1)) as x(a, b)", undefined, 'postgres'), [
      {
        name: 'derived_value_view',
        columns: [
          { name: 'label', type: 'text', nullable: undefined },
          { name: 'n', type: 'integer', nullable: undefined },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateAsTables("create table derived_value_table(label, n) as select * from (values ('a', 1)) as x(a, b)", undefined, 'postgres'), [
      {
        name: 'derived_value_table',
        columns: [
          { name: 'label', type: 'text', nullable: undefined },
          { name: 'n', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('extracts cast expression types from view queries', () => {
    assert.deepStrictEqual(parseCreateViews('create view typed_view as select id::int as id, name::text as name from users', {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'text' },
            { name: 'name', type: 'text' },
          ],
        },
      ],
    }, 'postgres'), [
      {
        name: 'typed_view',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
          { name: 'name', type: 'text', nullable: undefined },
        ],
      },
    ]);
  });

  it('extracts common expression types from view queries', () => {
    assert.deepStrictEqual(parseCreateViews(`
      create view expression_view as
      select
        coalesce(name, 'x') as label,
        case when age > 0 then age else 0 end as bucket,
        true as flag,
        id + 1 as next_id
      from users
    `, {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer' },
            { name: 'name', type: 'text' },
            { name: 'age', type: 'integer' },
          ],
        },
      ],
    }, 'postgres'), [
      {
        name: 'expression_view',
        columns: [
          { name: 'label', type: 'text', nullable: undefined },
          { name: 'bucket', type: 'integer', nullable: undefined },
          { name: 'flag', type: 'boolean', nullable: undefined },
          { name: 'next_id', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('extracts function aggregate and window expression types from view queries', () => {
    assert.deepStrictEqual(parseCreateViews(`
      create view function_view as
      select
        lower(name) as label,
        length(name) as label_length,
        count(*) as row_count,
        sum(age) as total_age,
        avg(age) as average_age,
        row_number() over(order by id) as rownum
      from users
    `, {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer' },
            { name: 'name', type: 'text' },
            { name: 'age', type: 'integer' },
          ],
        },
      ],
    }, 'postgres'), [
      {
        name: 'function_view',
        columns: [
          { name: 'label', type: 'text', nullable: undefined },
          { name: 'label_length', type: 'integer', nullable: undefined },
          { name: 'row_count', type: 'integer', nullable: undefined },
          { name: 'total_age', type: 'integer', nullable: undefined },
          { name: 'average_age', type: 'decimal', nullable: undefined },
          { name: 'rownum', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('resolves CTE-backed view projection types', () => {
    assert.deepStrictEqual(parseCreateViews('create view cte_view as with q as (select 1 as id) select id from q', undefined, 'postgres'), [
      {
        name: 'cte_view',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('resolves derived table and table function view projection types', () => {
    assert.deepStrictEqual(parseCreateViews('create view derived_view as select x.id from (select 1 as id) x', undefined, 'postgres'), [
      {
        name: 'derived_view',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateViews("create view derived_star_view as select * from (select 1 as id, 'a' as name) x", undefined, 'postgres'), [
      {
        name: 'derived_star_view',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
          { name: 'name', type: 'text', nullable: undefined },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateViews('create view series_view as select g.n from generate_series(1,3) as g(n)', undefined, 'postgres'), [
      {
        name: 'series_view',
        columns: [
          { name: 'n', type: 'integer', nullable: undefined },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateViews('create view json_each_view as select j.* from json_each(\'{"a":1}\') as j', undefined, 'sqlite')[0]?.columns.slice(0, 4), [
      { name: 'key', type: 'text', nullable: undefined },
      { name: 'value', type: 'json', nullable: undefined },
      { name: 'type', type: 'text', nullable: undefined },
      { name: 'atom', type: 'json', nullable: undefined },
    ]);
  });

  it('expands joined star projections and suppresses USING/NATURAL duplicate columns', () => {
    const joinSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer', nullable: false },
            { name: 'name', type: 'text', nullable: false },
          ],
        },
        {
          name: 'orders',
          columns: [
            { name: 'id', type: 'integer', nullable: false },
            { name: 'total', type: 'decimal', nullable: false },
          ],
        },
      ],
    };

    assert.deepStrictEqual(parseCreateViews('create view joined_view as select * from users join orders using(id)', joinSchema, 'postgres'), [
      {
        name: 'joined_view',
        columns: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'name', type: 'text', nullable: false },
          { name: 'total', type: 'decimal', nullable: false },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateViews('create view natural_view as select * from users natural join orders', joinSchema, 'postgres'), [
      {
        name: 'natural_view',
        columns: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'name', type: 'text', nullable: false },
          { name: 'total', type: 'decimal', nullable: false },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateViews('create view left_join_view as select users.id, orders.total from users left join orders on users.id = orders.id', joinSchema, 'postgres'), [
      {
        name: 'left_join_view',
        columns: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'total', type: 'decimal', nullable: true },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateViews('create view full_join_view as select * from users full join orders on users.id = orders.id', joinSchema, 'postgres'), [
      {
        name: 'full_join_view',
        columns: [
          { name: 'id', type: 'integer', nullable: true },
          { name: 'name', type: 'text', nullable: true },
          { name: 'id', type: 'integer', nullable: true },
          { name: 'total', type: 'decimal', nullable: true },
        ],
      },
    ]);
  });

  it('preserves schema-qualified materialized view names', () => {
    assert.deepStrictEqual(parseCreateViews('create materialized view public.user_ids as select 1 as id'), [
      {
        name: 'user_ids',
        schema: 'public',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });
});

describe('parseCreateTableFunctions', () => {
  it('extracts table-valued function return columns', () => {
    assert.deepStrictEqual(parseCreateTableFunctions(
      "create function people() returns table(id int, name text) language sql as $$ select 1, 'a' $$",
      'postgres',
    ), [
      {
        name: 'people',
        columns: [
          { name: 'id', type: 'integer' },
          { name: 'name', type: 'text' },
        ],
        uniqueKeys: [],
        foreignKeys: [],
      },
    ]);
  });
});

describe('parseCreateScalarFunctions', () => {
  it('extracts scalar function return types', () => {
    assert.deepStrictEqual(parseCreateScalarFunctions(
      [
        'create function public.label(x text) returns text language sql as $$ select x $$',
        'create function score(x int) returns int language sql as $$ select x $$',
        "create function people() returns table(id int, name text) language sql as $$ select 1, 'a' $$",
      ].join('; '),
      'postgres',
    ), [
      { name: 'label', schema: 'public', returnType: 'text' },
      { name: 'score', returnType: 'integer' },
    ]);
  });
});

describe('parseCreateProcedures', () => {
  it('extracts procedure result columns from body queries and return table declarations', () => {
    const baseSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer' },
            { name: 'name', type: 'text' },
          ],
        },
      ],
    };

    assert.deepStrictEqual(parseCreateProcedures(
      'create procedure p() begin select id, name from users; end',
      baseSchema,
      'mysql',
    ), [
      {
        name: 'p',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
          { name: 'name', type: 'text', nullable: undefined },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateProcedures(
      'create procedure p() returns table(id number, name string) language sql as $$ select id, name from users $$',
      baseSchema,
      'snowflake',
    ), [
      {
        name: 'p',
        columns: [
          { name: 'id', type: 'decimal' },
          { name: 'name', type: 'text' },
        ],
      },
    ]);
  });
});

describe('parseCreateAsTables', () => {
  it('extracts create table as select columns', () => {
    assert.deepStrictEqual(parseCreateAsTables("create table generated_users as select 1 as id, 'a' as name"), [
      {
        name: 'generated_users',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
          { name: 'name', type: 'text', nullable: undefined },
        ],
      },
    ]);
  });

  it('prefers explicit create table column definitions', () => {
    assert.deepStrictEqual(parseCreateAsTables('create table generated_users (id int) as select 1'), [
      {
        name: 'generated_users',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined, primaryKey: false, unique: false },
        ],
      },
    ]);
  });

  it('copies create table like and clone columns from existing schema', () => {
    const baseSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer' },
            { name: 'name', type: 'text' },
          ],
        },
      ],
    };
    assert.deepStrictEqual(parseCreateAsTables('create table new_users (like users)', baseSchema, 'postgres'), [
      {
        name: 'new_users',
        columns: [
          { name: 'id', type: 'integer' },
          { name: 'name', type: 'text' },
        ],
      },
    ]);
    assert.deepStrictEqual(parseCreateAsTables('create table cloned_users clone users', baseSchema, 'snowflake'), [
      {
        name: 'cloned_users',
        columns: [
          { name: 'id', type: 'integer' },
          { name: 'name', type: 'text' },
        ],
      },
    ]);
  });

  it('preserves schema-qualified create table as names', () => {
    assert.deepStrictEqual(parseCreateAsTables('create table public.generated_users as select 1 as id'), [
      {
        name: 'generated_users',
        schema: 'public',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('resolves CTE-backed create table as projection types', () => {
    assert.deepStrictEqual(parseCreateAsTables('create table cte_table as with q as (select 1 as id) select id from q', undefined, 'postgres'), [
      {
        name: 'cte_table',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('resolves derived table create table as projection types', () => {
    assert.deepStrictEqual(parseCreateAsTables('create table derived_table as select x.id from (select 1 as id) x', undefined, 'postgres'), [
      {
        name: 'derived_table',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
        ],
      },
    ]);

    assert.deepStrictEqual(parseCreateAsTables("create table derived_star_table as select * from (select 1 as id, 'a' as name) x", undefined, 'postgres'), [
      {
        name: 'derived_star_table',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
          { name: 'name', type: 'text', nullable: undefined },
        ],
      },
    ]);
  });
});

describe('parseCreateSynonyms', () => {
  it('copies target table columns into synonym schema entries', () => {
    const baseSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer', nullable: false },
            { name: 'name', type: 'text', nullable: false },
          ],
          primaryKey: ['id'],
        },
      ],
    };
    assert.deepStrictEqual(parseCreateSynonyms('create synonym user_syn for users', baseSchema), [
      {
        name: 'user_syn',
        columns: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'name', type: 'text', nullable: false },
        ],
        primaryKey: ['id'],
      },
    ]);
  });

  it('preserves schema-qualified synonym names and targets', () => {
    const baseSchema = {
      tables: [
        {
          schema: 'public',
          name: 'users',
          columns: [
            { name: 'id', type: 'integer' },
          ],
        },
      ],
    };
    assert.deepStrictEqual(parseCreateSynonyms('create synonym app.user_syn for public.users', baseSchema), [
      {
        schema: 'app',
        name: 'user_syn',
        columns: [
          { name: 'id', type: 'integer' },
        ],
      },
    ]);
  });
});

describe('loadSchema', () => {
  it('loads Oracle SQL*Plus schema scripts split by slash commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-oracle-script-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      set define off
      prompt creating schema objects
      create table users (
        id number,
        name varchar2(20)
      )
      /
      create view user_names as
      select id, name from users
      /
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'oracle' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'users')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'decimal'],
      ['name', 'text'],
    ]);
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'decimal'],
      ['name', 'text'],
    ]);
  });

  it('loads Oracle SQL*Plus scripts included with @ commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-oracle-include-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas', 'parts'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      @parts/tables.sql
      create view user_names as select id, name from users
      /
    `);
    await writeFile(path.join(cwd, 'schemas', 'parts', 'tables.sql'), `
      create table users(id number, name varchar2(20))
      /
    `);

    const schema = await loadSchema(['schemas/schema.sql'], { cwd, dialect: 'oracle' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'decimal'],
      ['name', 'text'],
    ]);
  });

  it('loads Oracle SQL*Plus scripts with DEFINE substitution', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-oracle-define-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      define owner = APP
      create table &owner..users(id number, name varchar2(20))
      /
      create view &owner..user_names as select id, name from &owner..users
      /
    `);

    const schema = await loadSchema(['schemas/schema.sql'], { cwd, dialect: 'oracle' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'users' && table.schema === 'APP')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'decimal'],
      ['name', 'text'],
    ]);
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names' && table.schema === 'APP')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'decimal'],
      ['name', 'text'],
    ]);
  });

  it('loads MySQL schema scripts with DELIMITER commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-mysql-script-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      create table users(id int, name text);
      DELIMITER //
      create procedure p()
      begin
        select id, name from users;
      end//
      DELIMITER ;
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'mysql' });
    assert.deepStrictEqual(schema.procedures, [
      {
        name: 'p',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
          { name: 'name', type: 'text', nullable: undefined },
        ],
      },
    ]);
  });

  it('loads MySQL schema scripts included with SOURCE commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-mysql-source-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas', 'parts'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      SOURCE parts/tables.sql
      create view user_names as select id, name from users;
    `);
    await writeFile(path.join(cwd, 'schemas', 'parts', 'tables.sql'), 'create table users(id int, name text);');

    const schema = await loadSchema(['schemas/schema.sql'], { cwd, dialect: 'mysql' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads MySQL schema scripts with USE as the default object schema', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-mysql-use-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      USE app;
      create table users(id int, name text);
      create view user_names as select id, name from app.users;
    `);

    const schema = await loadSchema(['schemas/schema.sql'], { cwd, dialect: 'mysql' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'users' && table.schema === 'app')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names' && table.schema === 'app')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads T-SQL schema scripts split by GO batches', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-tsql-script-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      create table users(id int, name nvarchar(20));
      GO
      create view user_names as select id, name from users;
      GO
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'tsql' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads sqlcmd scripts included with :r commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-sqlcmd-include-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas', 'parts'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      :r parts/tables.sql
      GO
      create view user_names as select id, name from users;
      GO
    `);
    await writeFile(path.join(cwd, 'schemas', 'parts', 'tables.sql'), 'create table users(id int, name nvarchar(20));');

    const schema = await loadSchema(['schemas/schema.sql'], { cwd, dialect: 'sqlserver' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads PostgreSQL psql scripts while ignoring backslash meta-commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-psql-script-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      \\set ON_ERROR_STOP on
      \\echo creating schema objects
      create table users(id int, name text);
      \\dt
      create view user_names as select id, name from users;
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'postgres' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads PostgreSQL psql scripts included with backslash include commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-psql-include-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas', 'parts'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      \\i parts/tables.sql
      create view user_names as select id, name from users;
    `);
    await writeFile(path.join(cwd, 'schemas', 'parts', 'tables.sql'), 'create table users(id int, name text);');

    const schema = await loadSchema(['schemas/schema.sql'], { cwd, dialect: 'postgres' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads PostgreSQL psql scripts with variable substitution', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-psql-vars-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      \\set schema app
      create table :schema.users(id int, name text);
      create view :schema.user_names as select id, name from :schema.users where id::int > 0;
    `);

    const schema = await loadSchema(['schemas/schema.sql'], { cwd, dialect: 'postgres' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'users' && table.schema === 'app')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names' && table.schema === 'app')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('honors literal PostgreSQL psql conditional blocks while loading schema scripts', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-psql-conditional-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas', 'parts'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      \\if false
      \\i parts/missing.sql
      create table skipped(id int);
      \\else
      \\i parts/tables.sql
      \\endif
      create view user_names as select id, name from users;
    `);
    await writeFile(path.join(cwd, 'schemas', 'parts', 'tables.sql'), 'create table users(id int, name text);');

    const schema = await loadSchema(['schemas/schema.sql'], { cwd, dialect: 'postgres' });
    assert.strictEqual(schema.tables.some((table) => table.name === 'skipped'), false);
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads sqlcmd scripts while ignoring colon commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-sqlcmd-script-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      :setvar dbname sqldesc
      :on error exit
      create table users(id int, name nvarchar(20));
      GO
      create view user_names as select id, name from users;
      GO
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'sqlserver' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads sqlcmd scripts with :setvar variable substitution', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-sqlcmd-setvar-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas', 'parts'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      :setvar schemaName "dbo"
      :setvar tableName users
      :r parts/tables.sql
      GO
      create view $(schemaName).user_names as select id, name from $(schemaName).$(tableName);
      GO
    `);
    await writeFile(path.join(cwd, 'schemas', 'parts', 'tables.sql'), `
      create table $(schemaName).$(tableName)(id int, name nvarchar(20));
    `);

    const schema = await loadSchema(['schemas/schema.sql'], { cwd, dialect: 'sqlserver' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names' && table.schema === 'dbo')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads SQLite CLI scripts while ignoring dot commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-sqlite-script-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      .bail on
      .headers on
      create table users(id integer, name text);
      .mode column
      create view user_names as select id, name from users;
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'sqlite' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads SQLite CLI scripts included with .read commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-sqlite-read-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas', 'parts'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      .read parts/tables.sql
      create view user_names as select id, name from users;
    `);
    await writeFile(path.join(cwd, 'schemas', 'parts', 'tables.sql'), 'create table users(id integer, name text);');

    const schema = await loadSchema(['schemas/schema.sql'], { cwd, dialect: 'sqlite' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads DuckDB CLI scripts while ignoring dot commands', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-duckdb-script-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      .timer on
      create table users(id integer, name varchar);
      .mode duckbox
      create view user_names as select id, name from users;
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'duckdb' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_names')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads create synonyms after base table definitions', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      create table users (id int, name text);
      create synonym user_syn for users;
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_syn')?.columns, [
      { name: 'id', type: 'integer', nullable: undefined, primaryKey: false, unique: false },
      { name: 'name', type: 'text', nullable: undefined, primaryKey: false, unique: false },
    ]);
  });

  it('applies alter table actions before dependent schema objects', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-alter-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      create table users (id int, age int, name text);
      alter table users add column email text;
      alter table users alter column age type bigint;
      alter table users rename column name to full_name;
      alter table users add primary key (id);
      create synonym user_syn for users;
      create view user_view as select id, age, full_name, email from user_syn;
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'postgres' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'users')?.columns, [
      { name: 'id', type: 'integer', nullable: false, primaryKey: true, unique: false },
      { name: 'age', type: 'bigint', nullable: undefined, primaryKey: false, unique: false },
      { name: 'full_name', type: 'text', nullable: undefined, primaryKey: false, unique: false },
      { name: 'email', type: 'text', nullable: undefined, primaryKey: false, unique: false },
    ]);
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'user_view')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['age', 'bigint'],
      ['full_name', 'text'],
      ['email', 'text'],
    ]);
  });

  it('applies drop and schema rename mutations from schema files', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-drop-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      create table stale (id int);
      create table analytics.events (id int);
      create view stale_view as select id from stale;
      drop table stale;
      drop view stale_view;
      alter schema analytics rename to archive;
      create view event_ids as select id from archive.events;
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'postgres' });
    assert.strictEqual(schema.tables.some((table) => table.name === 'stale'), false);
    assert.strictEqual(schema.tables.some((table) => table.name === 'stale_view'), false);
    assert.partialDeepStrictEqual(schema.tables.find((table) => table.name === 'events'), { schema: 'archive' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'event_ids')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
    ]);
  });

  it('resolves user-defined type aliases across schema files', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-types-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', '00-types.sql'), [
      'create domain positive_int as int check (value > 0)',
      "create type mood as enum ('sad','ok','happy')",
      'create type pair as (id int, name text)',
    ].join('; '));
    await writeFile(path.join(cwd, 'schemas', '10-table.sql'), 'create table t(id positive_int, m mood, p pair);');

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'postgres' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 't')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['m', 'text'],
      ['p', 'struct<id integer, name text>'],
    ]);
  });

  it('resolves user-defined type aliases in ALTER TABLE schema mutations', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-alter-types-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', '00-types.sql'), [
      'create domain positive_int as int check (value > 0)',
      "create type mood as enum ('sad','ok','happy')",
      'create type pair as (id int, name text)',
    ].join('; '));
    await writeFile(path.join(cwd, 'schemas', '10-table.sql'), [
      'create table t(raw_id int)',
      'alter table t add column id positive_int',
      'alter table t add column m mood',
      'alter table t alter column raw_id type positive_int',
      'alter table t add column p pair',
    ].join('; '));

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'postgres' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 't')?.columns.map((column) => [column.name, column.type]), [
      ['raw_id', 'integer'],
      ['id', 'integer'],
      ['m', 'text'],
      ['p', 'struct<id integer, name text>'],
    ]);
  });

  it('loads table-valued function schemas from schema files', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-table-functions-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(
      path.join(cwd, 'schemas', 'functions.sql'),
      "create function people() returns table(id int, name text) language sql as $$ select 1, 'a' $$",
    );

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'postgres' });
    assert.deepStrictEqual(schema.tables.find((table) => table.name === 'people')?.columns.map((column) => [column.name, column.type]), [
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('loads scalar function return types from schema files', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-scalar-functions-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(
      path.join(cwd, 'schemas', 'functions.sql'),
      [
        'create function public.label(x text) returns text language sql as $$ select x $$',
        'create function score(x int) returns int language sql as $$ select x $$',
      ].join('; '),
    );

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'postgres' });
    assert.deepStrictEqual(schema.functions, [
      { name: 'label', schema: 'public', returnType: 'text' },
      { name: 'score', returnType: 'integer' },
    ]);
  });

  it('loads procedure result columns from schema files', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-procedures-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), [
      'create table users(id int, name text)',
      'create procedure p() begin select id, name from users; end',
    ].join('; '));

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'mysql' });
    assert.deepStrictEqual(schema.procedures, [
      {
        name: 'p',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
          { name: 'name', type: 'text', nullable: undefined },
        ],
      },
    ]);
  });

  it('resolves procedure result columns against views from later schema files', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-procedure-view-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', '00-table.sql'), 'create table users(id int, name text);');
    await writeFile(path.join(cwd, 'schemas', '10-procedure.sql'), 'create procedure p() begin select id, name from v; end;');
    await writeFile(path.join(cwd, 'schemas', '20-view.sql'), 'create view v as select id, name from users;');

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'mysql' });
    assert.deepStrictEqual(schema.procedures, [
      {
        name: 'p',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
          { name: 'name', type: 'text', nullable: undefined },
        ],
      },
    ]);
  });

  it('uses scalar function return types while loading procedure result columns', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-procedure-functions-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), [
      'create table users(age int, name text)',
      'create function f(x int) returns int language sql as $$ select x $$',
      'create procedure p() begin select f(age) as score from users; end',
    ].join('; '));

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'mysql' });
    assert.deepStrictEqual(schema.procedures, [
      {
        name: 'p',
        columns: [
          { name: 'score', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('applies drop function and drop procedure routine mutations from schema files', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-drop-routines-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), [
      'create table users(id int, name text)',
      'create function label(x text) returns text language sql as $$ select x $$',
      'create procedure p() begin select id from users; end',
      'drop function label',
      'drop procedure p',
      'create function label(x text) returns int language sql as $$ select 1 $$',
      'create procedure p() begin select name from users; end',
    ].join('; '));

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd, dialect: 'mysql' });
    assert.deepStrictEqual(schema.functions, [
      { name: 'label', returnType: 'integer' },
    ]);
    assert.deepStrictEqual(schema.procedures, [
      {
        name: 'p',
        columns: [
          { name: 'name', type: 'text', nullable: undefined },
        ],
      },
    ]);
  });
});
