import { describe, expect, it } from 'vitest';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadSchema, parseCreateAsTables, parseCreateSynonyms, parseCreateTables, parseCreateViews } from '../src/schema.js';

describe('parseCreateTables', () => {
  it('extracts ordinary create table columns', () => {
    expect(parseCreateTables(`
      CREATE TABLE public.users (
        id integer primary key,
        name varchar(255) not null,
        age int,
        constraint users_name_unique unique (name)
      );
    `)).toEqual([
      {
        name: 'users',
        schema: 'public',
        columns: [
          { name: 'id', type: 'int', nullable: false, primaryKey: true, unique: false },
          { name: 'name', type: 'var_char', nullable: false, primaryKey: false, unique: true },
          { name: 'age', type: 'int', nullable: undefined, primaryKey: false, unique: false },
        ],
        primaryKey: ['id'],
        uniqueKeys: [['name']],
        foreignKeys: [],
      },
    ]);
  });

  it('extracts table-level keys and foreign keys from AST constraints', () => {
    expect(parseCreateTables(`
      create table orders (
        id int,
        user_id int,
        total decimal(10,2),
        primary key(id),
        foreign key(user_id) references users(id),
        unique(user_id,total)
      )
    `)).toEqual([
      {
        name: 'orders',
        columns: [
          { name: 'id', type: 'int', nullable: undefined, primaryKey: true, unique: false },
          { name: 'user_id', type: 'int', nullable: undefined, primaryKey: false, unique: false },
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
    expect(parseCreateTables(
      'create table dbo.t ([id] int identity(1,1) primary key, [name] nvarchar(20) not null)',
      'tsql',
    )).toEqual([
      {
        name: 't',
        schema: 'dbo',
        columns: [
          { name: 'id', type: 'int', nullable: false, primaryKey: true, unique: false },
          { name: 'name', type: 'NVARCHAR(20)', nullable: false, primaryKey: false, unique: false },
        ],
        primaryKey: ['id'],
        uniqueKeys: [],
        foreignKeys: [],
      },
    ]);
  });

  it('preserves nested struct and array type shapes', () => {
    expect(parseCreateTables(
      'create table users (profile struct<name text, age int>, addresses array<struct<city text>>, scores int[])',
      'bigquery',
    )[0]?.columns.map((column) => [column.name, column.type])).toEqual([
      ['profile', 'struct<name text, age int>'],
      ['addresses', 'array<struct<city text>>'],
      ['scores', 'array<int>'],
    ]);
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
    expect(parseCreateViews('create view active_users as select id, name from users', baseSchema)).toEqual([
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
    expect(parseCreateViews('create view numbers(n) as select 1 union select 2')).toEqual([
      {
        name: 'numbers',
        columns: [
          { name: 'n', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('resolves CTE-backed view projection types', () => {
    expect(parseCreateViews('create view cte_view as with q as (select 1 as id) select id from q', undefined, 'postgres')).toEqual([
      {
        name: 'cte_view',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('resolves derived table and table function view projection types', () => {
    expect(parseCreateViews('create view derived_view as select x.id from (select 1 as id) x', undefined, 'postgres')).toEqual([
      {
        name: 'derived_view',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
        ],
      },
    ]);

    expect(parseCreateViews("create view derived_star_view as select * from (select 1 as id, 'a' as name) x", undefined, 'postgres')).toEqual([
      {
        name: 'derived_star_view',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
          { name: 'name', type: 'text', nullable: undefined },
        ],
      },
    ]);

    expect(parseCreateViews('create view series_view as select g.n from generate_series(1,3) as g(n)', undefined, 'postgres')).toEqual([
      {
        name: 'series_view',
        columns: [
          { name: 'n', type: 'integer', nullable: undefined },
        ],
      },
    ]);

    expect(parseCreateViews('create view json_each_view as select j.* from json_each(\'{"a":1}\') as j', undefined, 'sqlite')[0]?.columns.slice(0, 4)).toEqual([
      { name: 'key', type: 'text' },
      { name: 'value', type: 'json' },
      { name: 'type', type: 'text' },
      { name: 'atom', type: 'json' },
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

    expect(parseCreateViews('create view joined_view as select * from users join orders using(id)', joinSchema, 'postgres')).toEqual([
      {
        name: 'joined_view',
        columns: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'name', type: 'text', nullable: false },
          { name: 'total', type: 'decimal', nullable: false },
        ],
      },
    ]);

    expect(parseCreateViews('create view natural_view as select * from users natural join orders', joinSchema, 'postgres')).toEqual([
      {
        name: 'natural_view',
        columns: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'name', type: 'text', nullable: false },
          { name: 'total', type: 'decimal', nullable: false },
        ],
      },
    ]);

    expect(parseCreateViews('create view left_join_view as select users.id, orders.total from users left join orders on users.id = orders.id', joinSchema, 'postgres')).toEqual([
      {
        name: 'left_join_view',
        columns: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'total', type: 'decimal', nullable: true },
        ],
      },
    ]);

    expect(parseCreateViews('create view full_join_view as select * from users full join orders on users.id = orders.id', joinSchema, 'postgres')).toEqual([
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
    expect(parseCreateViews('create materialized view public.user_ids as select 1 as id')).toEqual([
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

describe('parseCreateAsTables', () => {
  it('extracts create table as select columns', () => {
    expect(parseCreateAsTables("create table generated_users as select 1 as id, 'a' as name")).toEqual([
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
    expect(parseCreateAsTables('create table generated_users (id int) as select 1')).toEqual([
      {
        name: 'generated_users',
        columns: [
          { name: 'id', type: 'int', nullable: undefined, primaryKey: false, unique: false },
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
    expect(parseCreateAsTables('create table new_users (like users)', baseSchema, 'postgres')).toEqual([
      {
        name: 'new_users',
        columns: [
          { name: 'id', type: 'integer' },
          { name: 'name', type: 'text' },
        ],
      },
    ]);
    expect(parseCreateAsTables('create table cloned_users clone users', baseSchema, 'snowflake')).toEqual([
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
    expect(parseCreateAsTables('create table public.generated_users as select 1 as id')).toEqual([
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
    expect(parseCreateAsTables('create table cte_table as with q as (select 1 as id) select id from q', undefined, 'postgres')).toEqual([
      {
        name: 'cte_table',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
        ],
      },
    ]);
  });

  it('resolves derived table create table as projection types', () => {
    expect(parseCreateAsTables('create table derived_table as select x.id from (select 1 as id) x', undefined, 'postgres')).toEqual([
      {
        name: 'derived_table',
        columns: [
          { name: 'id', type: 'integer', nullable: undefined },
        ],
      },
    ]);

    expect(parseCreateAsTables("create table derived_star_table as select * from (select 1 as id, 'a' as name) x", undefined, 'postgres')).toEqual([
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
    expect(parseCreateSynonyms('create synonym user_syn for users', baseSchema)).toEqual([
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
    expect(parseCreateSynonyms('create synonym app.user_syn for public.users', baseSchema)).toEqual([
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
  it('loads create synonyms after base table definitions', async () => {
    const cwd = path.join(tmpdir(), `sqldesc-schema-${Date.now()}`);
    await mkdir(path.join(cwd, 'schemas'), { recursive: true });
    await writeFile(path.join(cwd, 'schemas', 'schema.sql'), `
      create table users (id int, name text);
      create synonym user_syn for users;
    `);

    const schema = await loadSchema(['schemas/**/*.sql'], { cwd });
    expect(schema.tables.find((table) => table.name === 'user_syn')?.columns).toEqual([
      { name: 'id', type: 'int', nullable: undefined, primaryKey: false, unique: false },
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
    expect(schema.tables.find((table) => table.name === 'users')?.columns).toEqual([
      { name: 'id', type: 'int', nullable: false, primaryKey: true, unique: false },
      { name: 'age', type: 'big_int', nullable: undefined, primaryKey: false, unique: false },
      { name: 'full_name', type: 'text', nullable: undefined, primaryKey: false, unique: false },
      { name: 'email', type: 'text', nullable: undefined, primaryKey: false, unique: false },
    ]);
    expect(schema.tables.find((table) => table.name === 'user_view')?.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'int'],
      ['age', 'big_int'],
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
    expect(schema.tables.some((table) => table.name === 'stale')).toBe(false);
    expect(schema.tables.some((table) => table.name === 'stale_view')).toBe(false);
    expect(schema.tables.find((table) => table.name === 'events')).toMatchObject({ schema: 'archive' });
    expect(schema.tables.find((table) => table.name === 'event_ids')?.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'int'],
    ]);
  });
});
