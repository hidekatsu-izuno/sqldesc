import { describe, expect, it } from 'vitest';
import { describeQuery } from '../src/describe.js';
import type { ValidationSchema } from '../src/types.js';

const schema: ValidationSchema = {
  tables: [
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'integer', nullable: false },
        { name: 'name', type: 'text', nullable: false },
        { name: 'age', type: 'integer', nullable: true },
      ],
    },
    {
      name: 'orders',
      columns: [
        { name: 'id', type: 'integer', nullable: false },
        { name: 'user_id', type: 'integer', nullable: false },
        { name: 'total', type: 'decimal', nullable: false },
      ],
    },
  ],
};

describe('describeQuery', () => {
  it('describes schema projections', async () => {
    const result = await describeQuery({ sql: 'select id, name from users', schema });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('describes schema-qualified table references', async () => {
    const qualifiedSchema: ValidationSchema = {
      tables: [
        {
          name: 'users',
          schema: 'public',
          columns: [
            { name: 'id', type: 'integer', nullable: false },
            { name: 'name', type: 'text', nullable: false },
          ],
        },
      ],
    };
    const result = await describeQuery({ sql: 'select public.users.id from public.users', schema: qualifiedSchema });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'public.users.id'],
    ]);

    const aliasResult = await describeQuery({ sql: 'select u.id, u.name from public.users as u', schema: qualifiedSchema });
    expect(aliasResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'public.users.id'],
      ['name', 'text', 'public.users.name'],
    ]);

    const starResult = await describeQuery({ sql: 'select * from public.users', schema: qualifiedSchema });
    expect(starResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'public.users.id'],
      ['name', 'text', 'public.users.name'],
    ]);
  });

  it('describes aliases and expressions', async () => {
    const result = await describeQuery({
      sql: 'select id as user_id, age + ? as next_age from users',
      schema,
      binds: 'int',
    });
    expect(result.columns[0]).toMatchObject({ name: 'user_id', type: 'integer' });
    expect(result.columns[1]).toMatchObject({ name: 'next_age', type: 'integer' });
  });

  it('describes top-level expressions parsed by polyglot', async () => {
    const result = await describeQuery({ sql: '1 + 2' });
    expect(result.statements[0]).toMatchObject({ kind: 'add', resultKind: 'static' });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['column_1', 'int', 'polyglot'],
    ]);

    const aliasResult = await describeQuery({ sql: '1 as one' });
    expect(aliasResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['one', 'integer', 'literal'],
    ]);

    const expressionCases = [
      ['true', 'boolean'],
      ['not true', 'boolean'],
      ['-1', 'int'],
      ['(1)', 'integer'],
      ['array[1,2]', 'array<integer>'],
      ['case when true then 1 else 0 end', 'int'],
      ['coalesce(null, 1)', 'integer'],
      ['exists(select 1)', 'boolean'],
      ['extract(year from current_date)', 'integer'],
      ['1 is distinct from 2', 'boolean'],
      ["1 ilike '1'", 'boolean'],
      ['1 % 2', 'int'],
      ['1 & 2', 'big_int'],
      ['1 | 2', 'big_int'],
      ['1 << 2', 'integer'],
      ['1 >> 2', 'integer'],
      ['1 ^ 2', 'double'],
    ] as const;
    for (const [sql, type] of expressionCases) {
      const expressionResult = await describeQuery({ sql, dialect: 'postgres' });
      expect(expressionResult.statements[0]?.resultKind).toBe('static');
      expect(expressionResult.columns[0]?.type).toBe(type);
    }
  });

  it('describes casts and literals', async () => {
    const result = await describeQuery({ sql: 'select cast(? as text) as label, 1 as one', binds: 'int' });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['label', 'text'],
      ['one', 'integer'],
    ]);
  });

  it('describes named bind projections', async () => {
    const result = await describeQuery({ sql: 'select :id as id, @name as name', binds: 'id=integer,name=text' });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'integer'],
      ['name', 'text'],
    ]);

    const positionalExpressionResult = await describeQuery({ sql: 'select coalesce(?, 1) as n', binds: 'int' });
    expect(positionalExpressionResult.columns[0]).toMatchObject({ name: 'n', type: 'int', source: 'expression' });

    const namedExpressionResult = await describeQuery({ sql: 'select greatest(:score, 1) as score', binds: 'score=decimal' });
    expect(namedExpressionResult.columns[0]).toMatchObject({ name: 'score', type: 'decimal', source: 'expression' });
  });

  it('describes additional predicate and numeric operator result types', async () => {
    const result = await describeQuery({
      sql: "select 1 is distinct from 2 as distinct_check, 1 ilike '1' as pattern_check, 5 % 2 as rem, 1 & 3 as masked, 2 ^ 3 as powered",
      dialect: 'postgres',
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['distinct_check', 'boolean', 'expression'],
      ['pattern_check', 'boolean', 'polyglot'],
      ['rem', 'int', 'polyglot'],
      ['masked', 'big_int', 'polyglot'],
      ['powered', 'double', 'polyglot'],
    ]);
  });

  it('warns for unknown columns', async () => {
    const result = await describeQuery({ sql: 'select mystery from users', schema: { tables: [] } });
    expect(result.columns[0].type).toBe('unknown');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('expands stars from schema', async () => {
    const result = await describeQuery({ sql: 'select * from users', schema });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'integer'],
      ['name', 'text'],
      ['age', 'integer'],
    ]);
  });

  it('expands stars across joins and table aliases', async () => {
    const result = await describeQuery({
      sql: 'select u.*, o.total from users u join orders o on u.id = o.user_id',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
      ['total', 'decimal', 'orders.total'],
    ]);
  });

  it('expands unqualified stars across all joined tables', async () => {
    const result = await describeQuery({
      sql: 'select * from users u join orders o on u.id = o.user_id',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
      ['id', 'integer', 'orders.id'],
      ['user_id', 'integer', 'orders.user_id'],
      ['total', 'decimal', 'orders.total'],
    ]);
  });

  it('marks columns from nullable outer-join sides as nullable', async () => {
    const leftResult = await describeQuery({
      sql: 'select users.id, orders.total from users left join orders on users.id = orders.user_id',
      dialect: 'postgres',
      schema,
    });
    expect(leftResult.columns.map((column) => [column.name, column.type, column.source, column.nullable])).toEqual([
      ['id', 'integer', 'users.id', false],
      ['total', 'decimal', 'orders.total', true],
    ]);

    const rightResult = await describeQuery({
      sql: 'select users.id, orders.total from users right join orders on users.id = orders.user_id',
      dialect: 'postgres',
      schema,
    });
    expect(rightResult.columns.map((column) => [column.name, column.type, column.source, column.nullable])).toEqual([
      ['id', 'integer', 'users.id', true],
      ['total', 'decimal', 'orders.total', false],
    ]);

    const fullStarResult = await describeQuery({
      sql: 'select * from users full join orders on users.id = orders.user_id',
      dialect: 'postgres',
      schema,
    });
    expect(fullStarResult.columns.map((column) => [column.name, column.nullable])).toEqual([
      ['id', true],
      ['name', true],
      ['age', true],
      ['id', true],
      ['user_id', true],
      ['total', true],
    ]);
  });

  it('preserves table shapes with sampling and system time modifiers', async () => {
    const sampleResult = await describeQuery({
      sql: 'select * from users tablesample bernoulli(10)',
      dialect: 'postgres',
      schema,
    });
    expect(sampleResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
    ]);

    const systemTimeResult = await describeQuery({
      sql: "select * from users for system_time as of '2020-01-01'",
      dialect: 'tsql',
      schema,
    });
    expect(systemTimeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
    ]);
  });

  it('suppresses duplicate joined columns for using and natural joins', async () => {
    const usingResult = await describeQuery({
      sql: 'select * from users join orders using (id)',
      schema,
    });
    expect(usingResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
      ['user_id', 'integer', 'orders.user_id'],
      ['total', 'decimal', 'orders.total'],
    ]);

    const naturalResult = await describeQuery({
      sql: 'select * from users natural join orders',
      schema,
    });
    expect(naturalResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
      ['user_id', 'integer', 'orders.user_id'],
      ['total', 'decimal', 'orders.total'],
    ]);
  });

  it('honors star except, rename, and replace modifiers', async () => {
    const exceptResult = await describeQuery({ sql: 'select * except(age) from users', dialect: 'bigquery', schema });
    expect(exceptResult.columns.map((column) => column.name)).toEqual(['id', 'name']);

    const renameResult = await describeQuery({ sql: 'select * rename(name as full_name) from users', dialect: 'bigquery', schema });
    expect(renameResult.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'integer'],
      ['full_name', 'text'],
      ['age', 'integer'],
    ]);

    const replaceResult = await describeQuery({ sql: 'select * replace(42 as age) from users', dialect: 'bigquery', schema });
    expect(replaceResult.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'integer'],
      ['name', 'text'],
      ['age', 'integer'],
    ]);
    expect(replaceResult.columns[2].source).toBe('literal');
  });

  it('honors qualified star except modifiers', async () => {
    const tableResult = await describeQuery({ sql: 'select * except(users.age) from users', dialect: 'bigquery', schema });
    expect(tableResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);

    const aliasResult = await describeQuery({ sql: 'select * except(u.age) from users u', dialect: 'bigquery', schema });
    expect(aliasResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);
  });

  it('honors table column aliases for qualified projections and stars', async () => {
    const projectionResult = await describeQuery({
      sql: 'select u.uid, u.uname from users as u(uid, uname, years)',
      schema,
    });
    expect(projectionResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['uid', 'integer', 'users.id'],
      ['uname', 'text', 'users.name'],
    ]);

    const starResult = await describeQuery({
      sql: 'select u.* from users as u(uid, uname, years)',
      schema,
    });
    expect(starResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['uid', 'integer', 'users.id'],
      ['uname', 'text', 'users.name'],
      ['years', 'integer', 'users.age'],
    ]);
  });

  it('describes insert returning columns', async () => {
    const result = await describeQuery({
      sql: 'insert into users(id, name) values (1, ?) returning id, name',
      dialect: 'postgres',
      schema,
      binds: 'text',
    });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'integer'],
      ['name', 'text'],
    ]);

    const fullValueResult = await describeQuery({
      sql: "insert into users(id, name, age) values (1, 'a', 2) returning id, name",
      dialect: 'postgres',
      schema,
    });
    expect(fullValueResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);
    expect(fullValueResult.diagnostics).toEqual([]);

    const conflictResult = await describeQuery({
      sql: "insert into users(id, name) values (1, 'a') on conflict (id) do update set name = excluded.name returning excluded.name",
      dialect: 'postgres',
      schema,
    });
    expect(conflictResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'text', 'users.name'],
    ]);

    const excludedStarResult = await describeQuery({
      sql: "insert into users(id, name) values (1, 'a') on conflict (id) do update set name = excluded.name returning excluded.*",
      dialect: 'postgres',
      schema,
    });
    expect(excludedStarResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
    ]);
  });

  it('describes update returning columns', async () => {
    const result = await describeQuery({
      sql: "update users set name = 'x' returning id, name",
      dialect: 'postgres',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'integer'],
      ['name', 'text'],
    ]);
  });

  it('describes delete returning columns', async () => {
    const result = await describeQuery({
      sql: 'delete from users returning id',
      dialect: 'postgres',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'integer'],
    ]);
  });

  it('describes SQL Server output columns from DML statements', async () => {
    const insertResult = await describeQuery({
      sql: "insert into users(id, name) output inserted.id, inserted.name values (1, 'a')",
      dialect: 'tsql',
      schema,
    });
    expect(insertResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);

    const updateResult = await describeQuery({
      sql: "update users set name = 'x' output deleted.id, inserted.name",
      dialect: 'tsql',
      schema,
    });
    expect(updateResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);

    const deleteResult = await describeQuery({
      sql: 'delete users output deleted.id from users',
      dialect: 'tsql',
      schema,
    });
    expect(deleteResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
    ]);
  });

  it('expands insert returning stars from the target table', async () => {
    const result = await describeQuery({
      sql: 'insert into users(id, name) select id, name from active_users returning *',
      dialect: 'postgres',
      schema: {
        tables: [
          ...schema.tables,
          {
            name: 'active_users',
            columns: [
              { name: 'id', type: 'integer', nullable: false },
              { name: 'name', type: 'text', nullable: false },
            ],
          },
        ],
      },
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
    ]);
  });

  it('expands update returning target aliases', async () => {
    const result = await describeQuery({
      sql: "update users as u set name = 'x' returning u.*",
      dialect: 'postgres',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
    ]);
  });

  it('resolves delete returning aliases', async () => {
    const result = await describeQuery({
      sql: 'delete from users as u returning u.id, u.name',
      dialect: 'postgres',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);
  });

  it('resolves TSQL output pseudo table columns', async () => {
    const result = await describeQuery({
      sql: "update users set name = 'x' output inserted.id, inserted.name",
      dialect: 'tsql',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);
  });

  it('expands TSQL output pseudo table stars', async () => {
    const result = await describeQuery({
      sql: 'delete from users output deleted.*',
      dialect: 'tsql',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
    ]);
  });

  it('returns an empty result with warning for parsed non-result SQL', async () => {
    const result = await describeQuery({ sql: 'create table audit_log (id int)' });
    expect(result.columns).toEqual([]);
    expect(result.statements[0]).toMatchObject({ kind: 'create_table', resultKind: 'none' });
    expect(result.diagnostics.at(-1)).toMatchObject({ code: 'SQLDESC_NO_RESULT_COLUMNS', severity: 'info' });
  });

  it('classifies transaction session and maintenance statements as no-result SQL', async () => {
    const transactionResult = await describeQuery({ sql: 'begin; commit; rollback', dialect: 'postgres' });
    expect(transactionResult.columns).toEqual([]);
    expect(transactionResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['transaction', 'none'],
      ['commit', 'none'],
      ['rollback', 'none'],
    ]);
    expect(transactionResult.diagnostics.at(-1)).toMatchObject({ code: 'SQLDESC_NO_RESULT_COLUMNS', severity: 'info' });

    const sessionResult = await describeQuery({ sql: 'use mydb; set x = 1', dialect: 'mysql' });
    expect(sessionResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['use', 'none'],
      ['set_statement', 'none'],
    ]);

    const maintenanceResult = await describeQuery({ sql: 'analyze users; vacuum', dialect: 'postgres' });
    expect(maintenanceResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['analyze', 'static'],
      ['command', 'none'],
    ]);

    const refreshResult = await describeQuery({ sql: 'refresh materialized view v', dialect: 'postgres' });
    expect(refreshResult.statements[0]).toMatchObject({ kind: 'refresh', resultKind: 'none' });

    const truncateResult = await describeQuery({ sql: 'truncate table users', dialect: 'postgres' });
    expect(truncateResult.statements[0]).toMatchObject({ kind: 'truncate', resultKind: 'none' });

    const lockResult = await describeQuery({ sql: 'lock table users', dialect: 'postgres' });
    expect(lockResult.statements[0]).toMatchObject({ kind: 'command', resultKind: 'none' });

    const reindexResult = await describeQuery({ sql: 'reindex', dialect: 'sqlite' });
    expect(reindexResult.statements[0]).toMatchObject({ kind: 'column', resultKind: 'none' });

    const msckResult = await describeQuery({ sql: 'msck repair table users', dialect: 'spark' });
    expect(msckResult.statements[0]).toMatchObject({ kind: 'command', resultKind: 'none' });

    const expressionCommandResult = await describeQuery({ sql: 'checkpoint; listen channel; notify channel; unlisten channel; savepoint s', dialect: 'postgres' });
    expect(expressionCommandResult.columns).toEqual([]);
    expect(expressionCommandResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['column', 'none'],
      ['alias', 'none'],
      ['alias', 'none'],
      ['alias', 'none'],
      ['alias', 'none'],
    ]);
  });

  it('describes MySQL table maintenance status result columns', async () => {
    const analyzeResult = await describeQuery({ sql: 'analyze table users', dialect: 'mysql' });
    expect(analyzeResult.statements[0]).toMatchObject({ kind: 'analyze', resultKind: 'static' });
    expect(analyzeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Table', 'text', 'cast'],
      ['Op', 'text', 'cast'],
      ['Msg_type', 'text', 'cast'],
      ['Msg_text', 'text', 'cast'],
    ]);

    const optimizeResult = await describeQuery({ sql: 'optimize table users', dialect: 'mysql' });
    expect(optimizeResult.statements[0]).toMatchObject({ kind: 'command', resultKind: 'static' });
    expect(optimizeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Table', 'text', 'cast'],
      ['Op', 'text', 'cast'],
      ['Msg_type', 'text', 'cast'],
      ['Msg_text', 'text', 'cast'],
    ]);

    const postgresAnalyzeResult = await describeQuery({ sql: 'analyze verbose users', dialect: 'postgres' });
    expect(postgresAnalyzeResult.statements[0]).toMatchObject({ kind: 'analyze', resultKind: 'static' });
    expect(postgresAnalyzeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Table', 'text', 'cast'],
      ['Op', 'text', 'cast'],
      ['Msg_type', 'text', 'cast'],
      ['Msg_text', 'text', 'cast'],
    ]);
  });

  it('classifies additional DDL and access-control statements as no-result SQL', async () => {
    const result = await describeQuery({
      sql: [
        'create index idx_users_name on users(name)',
        'drop index idx_users_name',
        'create schema analytics',
        'create database app',
        'create sequence s',
        'drop sequence s',
        "comment on table users is 'x'",
        'grant select on users to bob',
        'revoke select on users from bob',
      ].join('; '),
      dialect: 'postgres',
    });
    expect(result.columns).toEqual([]);
    expect(result.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['create_index', 'none'],
      ['drop_index', 'none'],
      ['create_schema', 'none'],
      ['create_database', 'none'],
      ['create_sequence', 'none'],
      ['drop_sequence', 'none'],
      ['comment', 'none'],
      ['grant', 'none'],
      ['revoke', 'none'],
    ]);
    expect(result.diagnostics.at(-1)).toMatchObject({ code: 'SQLDESC_NO_RESULT_COLUMNS', severity: 'info' });
  });

  it('classifies routine trigger and raw utility statements as no-result SQL', async () => {
    const routineResult = await describeQuery({
      sql: [
        'create function f() returns int return 1',
        'create procedure p() begin select 1; end',
        'drop procedure p',
        'drop trigger trg',
      ].join('; '),
      dialect: 'mysql',
    });
    expect(routineResult.columns).toEqual([]);
    expect(routineResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['create_function', 'none'],
      ['create_procedure', 'none'],
      ['drop_procedure', 'none'],
      ['drop_trigger', 'none'],
    ]);

    const rawResult = await describeQuery({
      sql: "create role analyst; create user bob; alter user bob with password 'x'; create policy p on users using (true)",
      dialect: 'postgres',
    });
    expect(rawResult.columns).toEqual([]);
    expect(rawResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['raw', 'none'],
      ['raw', 'none'],
      ['raw', 'none'],
      ['raw', 'none'],
    ]);
    expect(rawResult.diagnostics.at(-1)).toMatchObject({ code: 'SQLDESC_NO_RESULT_COLUMNS', severity: 'info' });

    const utilityResult = await describeQuery({
      sql: 'prepare s as select 1 as x; deallocate s; vacuum; lock table users',
      dialect: 'postgres',
    });
    expect(utilityResult.columns).toEqual([]);
    expect(utilityResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['prepare', 'none'],
      ['command', 'none'],
      ['command', 'none'],
    ]);
  });

  it('classifies object type namespace synonym and external object DDL as no-result SQL', async () => {
    const objectResult = await describeQuery({
      sql: [
        "create type mood as enum ('sad','ok','happy')",
        'drop type mood',
        'create domain positive_int as int check (value > 0)',
        'drop domain positive_int',
        'drop namespace analytics',
      ].join('; '),
      dialect: 'postgres',
    });
    expect(objectResult.columns).toEqual([]);
    expect(objectResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['create_type', 'none'],
      ['drop_type', 'none'],
      ['create_type', 'none'],
      ['drop_type', 'none'],
      ['drop_namespace', 'none'],
    ]);

    const synonymResult = await describeQuery({ sql: 'create synonym s for users', dialect: 'tsql' });
    expect(synonymResult.statements[0]).toMatchObject({ kind: 'create_synonym', resultKind: 'none' });

    const snowflakeResult = await describeQuery({ sql: 'create stage mystage; drop stage mystage; create file format ff type = csv; drop file format ff', dialect: 'snowflake' });
    expect(snowflakeResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['raw', 'none'],
      ['command', 'none'],
      ['raw', 'none'],
      ['command', 'none'],
    ]);
  });

  it('describes values statements', async () => {
    const result = await describeQuery({ sql: "values (1, 'a')" });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['column_1', 'integer'],
      ['column_2', 'text'],
    ]);

    const nullableFirstRowResult = await describeQuery({ sql: "values (null, null), (1, 'a')" });
    expect(nullableFirstRowResult.columns.map((column) => [column.name, column.type])).toEqual([
      ['column_1', 'integer'],
      ['column_2', 'text'],
    ]);

    const widenedResult = await describeQuery({ sql: 'values (1), (2.5)' });
    expect(widenedResult.columns.map((column) => [column.name, column.type])).toEqual([
      ['column_1', 'decimal'],
    ]);
  });

  it('describes set operations from the left query shape', async () => {
    const result = await describeQuery({ sql: 'select 1 as n union select 2' });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['n', 'integer'],
    ]);

    const nullableLeftResult = await describeQuery({ sql: 'select null as id union select 1' });
    expect(nullableLeftResult.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'integer'],
    ]);

    const widenedResult = await describeQuery({ sql: 'select 1 as n union select 2.5' });
    expect(widenedResult.columns.map((column) => [column.name, column.type])).toEqual([
      ['n', 'decimal'],
    ]);
  });

  it('describes projections over CTEs', async () => {
    const result = await describeQuery({ sql: 'with q as (select 1 as one) select one from q' });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['one', 'integer'],
    ]);
  });

  it('describes recursive CTE output from the seed query shape', async () => {
    const result = await describeQuery({
      sql: 'with recursive q(n) as (select 1 union all select n + 1 from q where n < 3) select n from q',
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['n', 'integer', 'q.n'],
    ]);
    expect(result.diagnostics).toEqual([]);
  });

  it('honors explicit CTE column aliases', async () => {
    const result = await describeQuery({ sql: "with q(one,label) as (select 1, 'a') select one, label from q" });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['one', 'integer', 'q.one'],
      ['label', 'text', 'q.label'],
    ]);
  });

  it('lets CTE chains and names shadow base schema tables', async () => {
    const shadowResult = await describeQuery({
      sql: 'with users as (select 1 as id) select id from users',
      schema,
    });
    expect(shadowResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
    ]);

    const chainResult = await describeQuery({
      sql: 'with a as (select 1 as id), b as (select id from a) select id from b',
      schema,
    });
    expect(chainResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'b.id'],
    ]);
  });

  it('describes derived table projections and stars', async () => {
    const result = await describeQuery({ sql: "select x.one, x.label from (select 1 as one, 'a' as label) x" });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['one', 'integer', 'x.one'],
      ['label', 'text', 'x.label'],
    ]);

    const starResult = await describeQuery({ sql: "select x.* from (select 1 as one, 'a' as label) as x" });
    expect(starResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['one', 'integer', 'x.one'],
      ['label', 'text', 'x.label'],
    ]);
  });

  it('describes scalar subquery projection types', async () => {
    const result = await describeQuery({
      sql: 'select (select max(age) from users) as max_age',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['max_age', 'integer', 'expression'],
    ]);

    const correlatedResult = await describeQuery({
      sql: 'select id, (select count(*) from orders o where o.user_id = users.id) as order_count from users',
      schema,
    });
    expect(correlatedResult.columns.map((column) => [column.name, column.type])).toEqual([
      ['id', 'integer'],
      ['order_count', 'big_int'],
    ]);
  });

  it('describes table-valued function aliases with explicit columns', async () => {
    const result = await describeQuery({ sql: 'select f.id, f.name from my_func() as f(id, name)' });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'unknown', 'f.id'],
      ['name', 'unknown', 'f.name'],
    ]);

    const starResult = await describeQuery({ sql: 'select * from generate_series(1,3) as g(n)' });
    expect(starResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['n', 'integer', 'g.n'],
    ]);

    const directSeriesResult = await describeQuery({ sql: 'select * from generate_series(1,3)', dialect: 'postgres', schema });
    expect(directSeriesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['generate_series', 'integer', 'generate_series.generate_series'],
    ]);

    const timestampResult = await describeQuery({
      sql: "select * from generate_series(timestamp '2020-01-01', timestamp '2020-01-02', interval '1 day') as g(ts)",
      dialect: 'postgres',
    });
    expect(timestampResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['ts', 'timestamp', 'g.ts'],
    ]);

    const jsonEachResult = await describeQuery({
      sql: "select j.key, j.value from json_each('{\"a\":1}') as j",
      dialect: 'sqlite',
    });
    expect(jsonEachResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['key', 'text', 'j.key'],
      ['value', 'json', 'j.value'],
    ]);

    const jsonEachStarResult = await describeQuery({
      sql: "select * from json_each('{\"a\":1}') as j",
      dialect: 'sqlite',
    });
    expect(jsonEachStarResult.columns.slice(0, 4).map((column) => [column.name, column.type, column.source])).toEqual([
      ['key', 'text', 'j.key'],
      ['value', 'json', 'j.value'],
      ['type', 'text', 'j.type'],
      ['atom', 'json', 'j.atom'],
    ]);

    const pgKeywordsResult = await describeQuery({
      sql: 'select * from pg_catalog.pg_get_keywords() as k',
      dialect: 'postgres',
    });
    expect(pgKeywordsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['word', 'text', 'k.word'],
      ['catcode', 'text', 'k.catcode'],
      ['catdesc', 'text', 'k.catdesc'],
      ['baredesc', 'text', 'k.baredesc'],
    ]);

    const clickHouseNumbersResult = await describeQuery({ sql: 'select * from numbers(3)', dialect: 'clickhouse' });
    expect(clickHouseNumbersResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['numbers', 'integer', 'numbers.numbers'],
    ]);

    const prestoSequenceResult = await describeQuery({ sql: 'select * from sequence(1,3) as t(x)', dialect: 'presto' });
    expect(prestoSequenceResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'integer', 't.x'],
    ]);

    const pragmaTableInfoResult = await describeQuery({ sql: "select * from pragma_table_info('users')", dialect: 'duckdb' });
    expect(pragmaTableInfoResult.columns.slice(0, 3).map((column) => [column.name, column.type, column.source])).toEqual([
      ['cid', 'integer', 'pragma_table_info.cid'],
      ['name', 'text', 'pragma_table_info.name'],
      ['type', 'text', 'pragma_table_info.type'],
    ]);
  });

  it('describes additional dialect table functions without expanding unrelated schema tables', async () => {
    const jsonRecordsetResult = await describeQuery({
      sql: "select * from json_to_recordset('[{\"a\":1}]') as x(a int, b text)",
      dialect: 'postgres',
      schema,
    });
    expect(jsonRecordsetResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['a', 'int', 'x.a'],
      ['b', 'text', 'x.b'],
    ]);

    const regexpResult = await describeQuery({
      sql: "select * from regexp_matches('abc', '(a)(b)') as m",
      dialect: 'postgres',
      schema,
    });
    expect(regexpResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['m', 'array<text>', 'm.m'],
    ]);

    const subscriptsResult = await describeQuery({
      sql: 'select * from generate_subscripts(array[1,2], 1) as s(i)',
      dialect: 'postgres',
      schema,
    });
    expect(subscriptsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['i', 'integer', 's.i'],
    ]);

    const splitTableResult = await describeQuery({
      sql: "select * from regexp_split_to_table('a,b', ',') as x",
      dialect: 'postgres',
      schema,
    });
    expect(splitTableResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'text', 'x.x'],
    ]);

    const splitArrayResult = await describeQuery({
      sql: "select * from regexp_split_to_array('a,b', ',') as x",
      dialect: 'postgres',
      schema,
    });
    expect(splitArrayResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'array<text>', 'x.x'],
    ]);

    const jsonArrayElementsResult = await describeQuery({
      sql: "select * from json_array_elements('[1,2]') as x",
      dialect: 'postgres',
      schema,
    });
    expect(jsonArrayElementsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'json', 'x.x'],
    ]);

    const jsonEachTextResult = await describeQuery({
      sql: "select * from json_each_text('{\"a\":1}') as x",
      dialect: 'postgres',
      schema,
    });
    expect(jsonEachTextResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['key', 'text', 'x.key'],
      ['value', 'text', 'x.value'],
    ]);

    const stringSplitResult = await describeQuery({
      sql: "select * from string_split('a,b', ',')",
      dialect: 'tsql',
      schema,
    });
    expect(stringSplitResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['value', 'text', 'string_split.value'],
    ]);

    const openQueryResult = await describeQuery({
      sql: "select * from openquery(server, 'select 1 as id')",
      dialect: 'tsql',
      schema,
    });
    expect(openQueryResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['openquery', 'unknown', 'openquery.openquery'],
    ]);

    const bigQueryArrayResult = await describeQuery({
      sql: 'select * from generate_array(1,3) as x',
      dialect: 'bigquery',
      schema,
    });
    expect(bigQueryArrayResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'integer', 'x.x'],
    ]);

    const bigQueryDateArrayResult = await describeQuery({
      sql: 'select * from generate_date_array(date "2020-01-01", date "2020-01-03") as d',
      dialect: 'bigquery',
      schema,
    });
    expect(bigQueryDateArrayResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['d', 'date', 'd.d'],
    ]);

    const oracleCollectionResult = await describeQuery({
      sql: "select * from table(sys.odcivarchar2list('a','b')) t",
      dialect: 'oracle',
      schema,
    });
    expect(oracleCollectionResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['t', 'text', 't.t'],
    ]);
  });

  it('describes unnest aliases with explicit columns', async () => {
    const result = await describeQuery({ sql: 'select u.x from unnest(array[1,2]) as u(x)' });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'integer', 'u.x'],
    ]);

    const multiArrayResult = await describeQuery({ sql: "select * from unnest(array[1,2], array['a','b']) as u(id, label)", dialect: 'postgres' });
    expect(multiArrayResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'u.id'],
      ['label', 'text', 'u.label'],
    ]);

    const ordinalityResult = await describeQuery({ sql: 'select * from unnest(array[1,2]) with ordinality as u(x, ord)', dialect: 'postgres' });
    expect(ordinalityResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'integer', 'u.x'],
      ['ord', 'integer', 'u.ord'],
    ]);
  });

  it('describes unnest aliases that expose the alias as a value column', async () => {
    const result = await describeQuery({ sql: 'select x from users, unnest(tags) as x', dialect: 'bigquery', schema });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'unknown', 'x.x'],
    ]);

    const arraySchema: ValidationSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer' },
            { name: 'tags', type: 'text[]' },
          ],
        },
      ],
    };
    const typedResult = await describeQuery({ sql: 'select x from users, unnest(tags) as x', dialect: 'bigquery', schema: arraySchema });
    expect(typedResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'text', 'x.x'],
    ]);
  });

  it('describes unaliased unnest over struct arrays', async () => {
    const result = await describeQuery({
      sql: 'select * from unnest([struct(1 as id, "a" as name)])',
      dialect: 'bigquery',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'unnest.id'],
      ['name', 'text', 'unnest.name'],
    ]);

    const generatedArrayResult = await describeQuery({
      sql: 'select * from unnest(generate_array(1,3)) as x',
      dialect: 'bigquery',
      schema,
    });
    expect(generatedArrayResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'integer', 'x.x'],
    ]);

    const mapResult = await describeQuery({
      sql: "select * from unnest(map(array['a'], array[1])) as t(k, v)",
      dialect: 'trino',
      schema,
    });
    expect(mapResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['k', 'text', 't.k'],
      ['v', 'integer', 't.v'],
    ]);
  });

  it('describes lateral view aliases as generated columns', async () => {
    const result = await describeQuery({
      sql: 'select x from users lateral view explode(tags) e as x',
      dialect: 'spark',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'unknown', 'e.x'],
    ]);

    const starResult = await describeQuery({
      sql: 'select e.* from users lateral view explode(tags) e as x',
      dialect: 'spark',
      schema,
    });
    expect(starResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'unknown', 'e.x'],
    ]);

    const collectionSchema: ValidationSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'tags', type: 'array<text>' },
            { name: 'attrs', type: 'map<text, integer>' },
          ],
        },
      ],
    };
    const typedArrayResult = await describeQuery({
      sql: 'select x from users lateral view explode(tags) e as x',
      dialect: 'spark',
      schema: collectionSchema,
    });
    expect(typedArrayResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'text', 'e.x'],
    ]);

    const arrayLiteralResult = await describeQuery({
      sql: "select x from users lateral view explode(array('a','b')) e as x",
      dialect: 'spark',
    });
    expect(arrayLiteralResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['x', 'text', 'e.x'],
    ]);

    const typedMapResult = await describeQuery({
      sql: 'select k, v from users lateral view explode(attrs) e as k, v',
      dialect: 'spark',
      schema: collectionSchema,
    });
    expect(typedMapResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['k', 'text', 'e.k'],
      ['v', 'integer', 'e.v'],
    ]);

    const posexplodeResult = await describeQuery({
      sql: 'select pos, x from users lateral view posexplode(tags) e as pos, x',
      dialect: 'spark',
      schema: collectionSchema,
    });
    expect(posexplodeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['pos', 'integer', 'e.pos'],
      ['x', 'text', 'e.x'],
    ]);
  });

  it('describes lateral function join aliases as generated columns', async () => {
    const result = await describeQuery({
      sql: 'select g.n from users cross join lateral generate_series(1,3) as g(n)',
      dialect: 'postgres',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['n', 'integer', 'g.n'],
    ]);

    const starResult = await describeQuery({
      sql: 'select g.* from users cross join lateral generate_series(1,3) as g(n)',
      dialect: 'postgres',
      schema,
    });
    expect(starResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['n', 'integer', 'g.n'],
    ]);
  });

  it('describes derived values tables with explicit columns', async () => {
    const result = await describeQuery({ sql: "select v.id, v.name from (values (1, 'a')) as v(id, name)" });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'v.id'],
      ['name', 'text', 'v.name'],
    ]);
  });

  it('describes whole-row table and alias projections as structs', async () => {
    const tableResult = await describeQuery({ sql: 'select users from users', dialect: 'bigquery', schema });
    expect(tableResult.columns[0]).toMatchObject({
      name: 'users',
      type: 'struct<id integer, name text, age integer>',
      source: 'users',
    });

    const aliasResult = await describeQuery({ sql: 'select u from users u', dialect: 'bigquery', schema });
    expect(aliasResult.columns[0]).toMatchObject({
      name: 'u',
      type: 'struct<id integer, name text, age integer>',
      source: 'users',
    });
  });

  it('describes nested struct and array field projections from schema types', async () => {
    const nestedSchema: ValidationSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'profile', type: 'struct<name text, age integer>' },
            { name: 'addresses', type: 'array<struct<city text, zip integer>>' },
            { name: 'scores', type: 'integer[]' },
            { name: 'data', type: 'json' },
          ],
        },
      ],
    };

    const fieldResult = await describeQuery({ sql: 'select profile.name from users', dialect: 'bigquery', schema: nestedSchema });
    expect(fieldResult.columns[0]).toMatchObject({
      name: 'name',
      type: 'text',
      source: 'users.profile.name',
    });
    expect(fieldResult.diagnostics).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'E222' }),
    ]));

    const arrayFieldResult = await describeQuery({ sql: 'select addresses[offset(0)].city as city from users', dialect: 'bigquery', schema: nestedSchema });
    expect(arrayFieldResult.columns[0]).toMatchObject({
      name: 'city',
      type: 'text',
      source: 'users.addresses.city',
    });

    const arrayResult = await describeQuery({ sql: 'select scores[1] as first_score from users', dialect: 'postgres', schema: nestedSchema });
    expect(arrayResult.columns[0]).toMatchObject({
      name: 'first_score',
      type: 'integer',
      source: 'users.scores',
    });

    const jsonResult = await describeQuery({ sql: "select data->>'name' as name from users", dialect: 'postgres', schema: nestedSchema });
    expect(jsonResult.columns[0]).toMatchObject({
      name: 'name',
      type: 'text',
      source: 'users.data.name',
    });

    const jsonExtractResult = await describeQuery({ sql: "select json_extract(data, '$.name') as j, json_value(data, '$.name') as name from users", dialect: 'mysql', schema: nestedSchema });
    expect(jsonExtractResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['j', 'json', 'expression'],
      ['name', 'text', 'expression'],
    ]);
  });

  it('describes json constructor expression result types', async () => {
    const mysqlResult = await describeQuery({ sql: "select json_object('id', 1) as obj, json_array(1,2) as arr", dialect: 'mysql' });
    expect(mysqlResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['obj', 'json', 'expression'],
      ['arr', 'json', 'expression'],
    ]);

    const postgresResult = await describeQuery({ sql: "select json_build_object('id', 1) as obj, jsonb_build_object('id', 1) as objb, to_json('x') as scalar", dialect: 'postgres' });
    expect(postgresResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['obj', 'json', 'expression'],
      ['objb', 'jsonb', 'expression'],
      ['scalar', 'json', 'expression'],
    ]);

    const scalarResult = await describeQuery({ sql: "select json_array_length('[1,2]') as len, json_typeof('{}') as kind", dialect: 'postgres' });
    expect(scalarResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['len', 'integer', 'expression'],
      ['kind', 'text', 'expression'],
    ]);
  });

  it('describes temporal function result types', async () => {
    const temporalSchema: ValidationSchema = {
      tables: [
        {
          name: 'events',
          columns: [
            { name: 'created_at', type: 'timestamp' },
            { name: 'start_at', type: 'timestamp' },
            { name: 'end_at', type: 'timestamp' },
          ],
        },
      ],
    };

    const postgresResult = await describeQuery({
      sql: "select date_trunc('day', created_at) as bucket, extract(year from created_at) as year, date_part('month', created_at) as month, make_date(2020,1,1) as d, make_timestamp(2020,1,1,0,0,0) as ts from events",
      dialect: 'postgres',
      schema: temporalSchema,
    });
    expect(postgresResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['bucket', 'timestamp', 'expression'],
      ['year', 'integer', 'expression'],
      ['month', 'integer', 'expression'],
      ['d', 'date', 'expression'],
      ['ts', 'timestamp', 'expression'],
    ]);

    const diffResult = await describeQuery({
      sql: 'select datediff(day, start_at, end_at) as days from events',
      dialect: 'tsql',
      schema: temporalSchema,
    });
    expect(diffResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['days', 'integer', 'expression'],
    ]);

    const arithmeticResult = await describeQuery({
      sql: "select date '2020-01-01' + interval '1 day' as next_day, timestamp '2020-01-01 00:00:00' - interval '1 hour' as prev_hour, interval '1 day' + interval '2 hours' as span",
      dialect: 'postgres',
    });
    expect(arithmeticResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['next_day', 'date', 'expression'],
      ['prev_hour', 'timestamp', 'expression'],
      ['span', 'interval', 'expression'],
    ]);
  });

  it('describes conversion function result types', async () => {
    const conversionSchema: ValidationSchema = {
      tables: [
        {
          name: 't',
          columns: [
            { name: 'x', type: 'text' },
          ],
        },
      ],
    };

    const tsqlResult = await describeQuery({
      sql: 'select try_cast(x as int) as a, convert(int, x) as b, try_convert(decimal, x) as c from t',
      dialect: 'tsql',
      schema: conversionSchema,
    });
    expect(tsqlResult.columns.map((column) => [column.name, column.type])).toEqual([
      ['a', 'int'],
      ['b', 'int'],
      ['c', 'decimal'],
    ]);

    const bigQueryResult = await describeQuery({
      sql: "select safe_cast(x as string) as s, parse_date('%Y%m%d', x) as d, parse_timestamp('%Y%m%d', x) as ts from t",
      dialect: 'bigquery',
      schema: conversionSchema,
    });
    expect(bigQueryResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['s', 'string', 'polyglot'],
      ['d', 'date', 'expression'],
      ['ts', 'timestamp', 'expression'],
    ]);

    const postgresResult = await describeQuery({
      sql: 'select to_date(x) as d, to_timestamp(x) as ts from t',
      dialect: 'postgres',
      schema: conversionSchema,
    });
    expect(postgresResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['d', 'date', 'expression'],
      ['ts', 'timestamp', 'expression'],
    ]);
  });

  it('describes geospatial function result types', async () => {
    const spatialSchema: ValidationSchema = {
      tables: [
        {
          name: 'places',
          columns: [
            { name: 'lon', type: 'decimal' },
            { name: 'lat', type: 'decimal' },
            { name: 'geom', type: 'geometry' },
          ],
        },
      ],
    };
    const result = await describeQuery({
      sql: 'select st_geogpoint(lon, lat) as geog, st_point(lon, lat) as geom, st_asgeojson(geom) as geojson, st_distance(geom, geom) as distance, st_contains(geom, geom) as contains, st_x(geom) as x from places',
      dialect: 'postgres',
      schema: spatialSchema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['geog', 'geography', 'expression'],
      ['geom', 'geometry', 'expression'],
      ['geojson', 'text', 'expression'],
      ['distance', 'decimal', 'expression'],
      ['contains', 'boolean', 'expression'],
      ['x', 'decimal', 'expression'],
    ]);
  });

  it('describes identifier hash and random function result types', async () => {
    const hashSchema: ValidationSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'name', type: 'text' },
          ],
        },
      ],
    };
    const postgresResult = await describeQuery({
      sql: 'select gen_random_uuid() as id, md5(name) as md5_hash, random() as r from users',
      dialect: 'postgres',
      schema: hashSchema,
    });
    expect(postgresResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'uuid', 'expression'],
      ['md5_hash', 'text', 'expression'],
      ['r', 'decimal', 'expression'],
    ]);

    const mixedResult = await describeQuery({
      sql: 'select uuid() as id, sha256(name) as sha_hash, rand() as r from users',
      dialect: 'mysql',
      schema: hashSchema,
    });
    expect(mixedResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'uuid', 'expression'],
      ['sha_hash', 'bytes', 'expression'],
      ['r', 'decimal', 'expression'],
    ]);
  });

  it('describes aggregate function result types', async () => {
    const aggregateSchema: ValidationSchema = {
      tables: [
        {
          name: 'orders',
          columns: [
            { name: 'name', type: 'text' },
            { name: 'active', type: 'boolean' },
            { name: 'total', type: 'decimal' },
          ],
        },
      ],
    };
    const result = await describeQuery({
      sql: "select count(*) as c, avg(total) as avg_total, bool_or(active) as any_active, string_agg(name, ',') as names, array_agg(total) as totals, json_agg(name) as names_json from orders",
      dialect: 'postgres',
      schema: aggregateSchema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['c', 'integer', 'expression'],
      ['avg_total', 'decimal', 'expression'],
      ['any_active', 'boolean', 'expression'],
      ['names', 'text', 'expression'],
      ['totals', 'array<decimal>', 'expression'],
      ['names_json', 'json', 'expression'],
    ]);
  });

  it('describes regex split and math function result types', async () => {
    const functionSchema: ValidationSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'name', type: 'text' },
            { name: 'score', type: 'decimal' },
          ],
        },
      ],
    };
    const result = await describeQuery({
      sql: "select regexp_extract(name, '([a-z]+)', 1) as part, regexp_count(name, 'a') as matches, split(name, ',') as pieces, sqrt(score) as root, sign(score) as direction from users",
      dialect: 'postgres',
      schema: functionSchema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['part', 'text', 'expression'],
      ['matches', 'integer', 'expression'],
      ['pieces', 'array<text>', 'expression'],
      ['root', 'double', 'polyglot'],
      ['direction', 'integer', 'expression'],
    ]);
  });

  it('describes row constructor expressions as records', async () => {
    const result = await describeQuery({ sql: 'select row(id, name) as r from users', dialect: 'postgres', schema });
    expect(result.columns[0]).toMatchObject({
      name: 'r',
      type: 'record<id integer, name text>',
      source: 'expression',
    });
  });

  it('describes array map and struct constructor expressions', async () => {
    const postgresArray = await describeQuery({ sql: 'select array[1,2] as a', dialect: 'postgres' });
    expect(postgresArray.columns[0]).toMatchObject({
      name: 'a',
      type: 'array<integer>',
      source: 'expression',
    });

    const sparkConstructors = await describeQuery({
      sql: "select array('a','b') as a, map('a', 1, 'b', 2) as m, named_struct('id', 1, 'name', 'a') as s",
      dialect: 'spark',
    });
    expect(sparkConstructors.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['a', 'array<text>', 'expression'],
      ['m', 'map<text, integer>', 'expression'],
      ['s', 'struct<id integer, name text>', 'expression'],
    ]);

    const bigQueryStruct = await describeQuery({ sql: "select struct(1 as id, 'a' as name) as s", dialect: 'bigquery' });
    expect(bigQueryStruct.columns[0]).toMatchObject({
      name: 's',
      type: 'struct<id integer, name text>',
      source: 'expression',
    });
  });

  it('describes array scalar function result types', async () => {
    const arraySchema: ValidationSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'tags', type: 'text[]' },
          ],
        },
      ],
    };
    const result = await describeQuery({
      sql: "select array_length(tags, 1) as len, cardinality(tags) as card, array_append(tags, 'x') as appended, array_cat(tags, array['x']) as cat, array_to_string(tags, ',') as joined from users",
      dialect: 'postgres',
      schema: arraySchema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['len', 'integer', 'expression'],
      ['card', 'integer', 'expression'],
      ['appended', 'text[]', 'expression'],
      ['cat', 'text[]', 'expression'],
      ['joined', 'text', 'expression'],
    ]);

    const bigQueryResult = await describeQuery({
      sql: "select array_concat(tags, array['x']) as tags2 from users",
      dialect: 'bigquery',
      schema: arraySchema,
    });
    expect(bigQueryResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['tags2', 'text[]', 'expression'],
    ]);
  });

  it('describes map scalar function result types', async () => {
    const mapSchema: ValidationSchema = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'attrs', type: 'map<text, integer>' },
          ],
        },
      ],
    };
    const result = await describeQuery({
      sql: "select map_keys(attrs) as keys, map_values(attrs) as vals, element_at(attrs, 'a') as val, attrs['a'] as sub_val, map_entries(attrs) as entries from users",
      dialect: 'spark',
      schema: mapSchema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['keys', 'array<text>', 'expression'],
      ['vals', 'array<integer>', 'expression'],
      ['val', 'integer', 'expression'],
      ['sub_val', 'integer', 'expression'],
      ['entries', 'array<struct<key text, value integer>>', 'expression'],
    ]);
  });

  it('describes common window function result types', async () => {
    const result = await describeQuery({
      sql: 'select row_number() over (partition by name order by id) as rn, rank() over (order by id) as r, lag(name) over (order by id) as prev_name from users',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['rn', 'integer', 'expression'],
      ['r', 'integer', 'expression'],
      ['prev_name', 'text', 'expression'],
    ]);
  });

  it('describes common scalar function result types', async () => {
    const result = await describeQuery({
      sql: "select lower(name) as lower_name, length(name) as name_len, abs(age) as age_abs, coalesce(name, 'unknown') as display_name, greatest(age, 1) as max_age, current_date as today from users",
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['lower_name', 'var_char', 'polyglot'],
      ['name_len', 'int', 'polyglot'],
      ['age_abs', 'double', 'polyglot'],
      ['display_name', 'text', 'expression'],
      ['max_age', 'int', 'polyglot'],
      ['today', 'date', 'polyglot'],
    ]);
  });

  it('describes temporal add and subtract function result types', async () => {
    const temporalSchema: ValidationSchema = {
      tables: [
        {
          name: 'events',
          columns: [
            { name: 'd', type: 'date' },
            { name: 'ts', type: 'timestamp' },
            { name: 'dt', type: 'datetime' },
          ],
        },
      ],
    };
    const result = await describeQuery({
      sql: "select date_add(d, interval '1 day') as d2, date_sub(d, interval '1 day') as d3, timestamp_add(ts, interval '1 hour') as ts2, datetime_sub(dt, interval '1 hour') as dt2 from events",
      dialect: 'postgres',
      schema: temporalSchema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['d2', 'date', 'expression'],
      ['d3', 'date', 'expression'],
      ['ts2', 'timestamp', 'expression'],
      ['dt2', 'datetime', 'expression'],
    ]);
  });

  it('describes conditional expression result types', async () => {
    const caseResult = await describeQuery({
      sql: "select case when age > 18 then name else 'minor' end as label, case age when 1 then 10 else 20 end as bucket from users",
      schema,
    });
    expect(caseResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['label', 'var_char', 'polyglot'],
      ['bucket', 'int', 'polyglot'],
    ]);

    const ifResult = await describeQuery({
      sql: "select if(age > 18, name, 'minor') as label from users",
      dialect: 'bigquery',
      schema,
    });
    expect(ifResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['label', 'var_char', 'polyglot'],
    ]);

    const iffResult = await describeQuery({
      sql: "select iff(age > 18, name, 'minor') as label from users",
      dialect: 'snowflake',
      schema,
    });
    expect(iffResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['label', 'var_char', 'polyglot'],
    ]);
  });

  it('describes predicate expression result types', async () => {
    const result = await describeQuery({
      sql: "select age > 18 as adult, name is null as missing, name like 'A%' as starts_a, id in (1,2) as selected, exists(select 1) as has_any, age > 18 and name is not null as ok from users",
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['adult', 'boolean'],
      ['missing', 'boolean'],
      ['starts_a', 'boolean'],
      ['selected', 'boolean'],
      ['has_any', 'boolean'],
      ['ok', 'boolean'],
    ]);
  });

  it('preserves projection shapes across select modifiers', async () => {
    const distinctOnResult = await describeQuery({
      sql: 'select distinct on (name) id, name from users order by name, id',
      dialect: 'postgres',
      schema,
    });
    expect(distinctOnResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);

    const qualifyResult = await describeQuery({
      sql: 'select id, name, row_number() over (partition by name order by id) as rn from users qualify rn = 1',
      dialect: 'bigquery',
      schema,
    });
    expect(qualifyResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['rn', 'integer', 'expression'],
    ]);

    const topResult = await describeQuery({ sql: 'select top 2 id, name from users', dialect: 'tsql', schema });
    expect(topResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);

    const fetchResult = await describeQuery({ sql: 'select id, name from users fetch first 2 rows only', dialect: 'postgres', schema });
    expect(fetchResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);
  });

  it('describes grouping extension projections', async () => {
    const aggregateSchema: ValidationSchema = {
      tables: [
        {
          name: 'orders',
          columns: [
            { name: 'region', type: 'text' },
            { name: 'product', type: 'text' },
            { name: 'total', type: 'decimal' },
          ],
        },
      ],
    };
    const rollupResult = await describeQuery({
      sql: 'select region, sum(total) as total from orders group by rollup(region)',
      dialect: 'postgres',
      schema: aggregateSchema,
    });
    expect(rollupResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['region', 'text', 'orders.region'],
      ['total', 'decimal', 'expression'],
    ]);

    const cubeResult = await describeQuery({
      sql: 'select region, product, sum(total) as total from orders group by cube(region, product)',
      dialect: 'postgres',
      schema: aggregateSchema,
    });
    expect(cubeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['region', 'text', 'orders.region'],
      ['product', 'text', 'orders.product'],
      ['total', 'decimal', 'expression'],
    ]);

    const groupingSetsResult = await describeQuery({
      sql: 'select region, product, sum(total) as total from orders group by grouping sets ((region),(product),())',
      dialect: 'postgres',
      schema: aggregateSchema,
    });
    expect(groupingSetsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['region', 'text', 'orders.region'],
      ['product', 'text', 'orders.product'],
      ['total', 'decimal', 'expression'],
    ]);

    const groupingResult = await describeQuery({
      sql: 'select grouping(region) as g, sum(total) as total from orders group by rollup(region)',
      dialect: 'postgres',
      schema: aggregateSchema,
    });
    expect(groupingResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['g', 'integer', 'expression'],
      ['total', 'decimal', 'expression'],
    ]);
  });

  it('describes pivot result columns from schema metadata', async () => {
    const result = await describeQuery({
      sql: "select * from users pivot(sum(age) for name in ('a','b'))",
      dialect: 'bigquery',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['a', 'integer', 'users.a'],
      ['b', 'integer', 'users.b'],
    ]);
  });

  it('describes unpivot result columns from schema metadata', async () => {
    const result = await describeQuery({
      sql: 'select * from users unpivot(value for metric in (age))',
      dialect: 'bigquery',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['metric', 'text', 'users.metric'],
      ['value', 'integer', 'users.value'],
    ]);
  });

  it('describes qualified pivot aliases', async () => {
    const result = await describeQuery({
      sql: 'select p.* from users pivot (sum(age) for name in ([a], [b])) p',
      dialect: 'tsql',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'p.id'],
      ['a', 'integer', 'p.a'],
      ['b', 'integer', 'p.b'],
    ]);
  });

  it('describes json_table virtual columns', async () => {
    const result = await describeQuery({
      sql: "select jt.* from json_table(doc, '$' columns (id int path '$.id', label varchar path '$.label')) jt",
      dialect: 'mysql',
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'jt.id'],
      ['label', 'varchar', 'jt.label'],
    ]);

    const qualifiedResult = await describeQuery({
      sql: "select jt.id from json_table(doc, '$' columns (id int path '$.id')) jt",
      dialect: 'mysql',
    });
    expect(qualifiedResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'jt.id'],
    ]);

    const nestedResult = await describeQuery({
      sql: "select jt.* from json_table(doc, '$' columns (ord for ordinality, nested path '$.items[*]' columns (item_id int path '$.id'))) jt",
      dialect: 'mysql',
    });
    expect(nestedResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['ord', 'integer', 'jt.ord'],
      ['item_id', 'int', 'jt.item_id'],
    ]);
  });

  it('describes SQL Server openjson virtual columns', async () => {
    const result = await describeQuery({
      sql: 'select * from openjson(@json) with (id int, name nvarchar(100))',
      dialect: 'tsql',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'openjson.id'],
      ['name', 'NVARCHAR(100)', 'openjson.name'],
    ]);

    const defaultResult = await describeQuery({
      sql: 'select [key], value, type from openjson(@json)',
      dialect: 'tsql',
      schema,
    });
    expect(defaultResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['key', 'text', 'openjson.key'],
      ['value', 'text', 'openjson.value'],
      ['type', 'integer', 'openjson.type'],
    ]);
  });

  it('describes oracle xmltable virtual columns', async () => {
    const result = await describeQuery({
      sql: "select xt.* from xmltable('/root' passing doc columns id number path 'id', label varchar2(20) path 'label') xt",
      dialect: 'oracle',
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'NUMBER', 'xt.id'],
      ['label', 'VARCHAR2(20)', 'xt.label'],
    ]);
  });

  it('describes snowflake lateral flatten columns', async () => {
    const result = await describeQuery({
      sql: 'select f.* from lateral flatten(input => arr) f',
      dialect: 'snowflake',
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['seq', 'integer', 'f.seq'],
      ['key', 'text', 'f.key'],
      ['path', 'text', 'f.path'],
      ['index', 'integer', 'f.index'],
      ['value', 'variant', 'f.value'],
      ['this', 'variant', 'f.this'],
    ]);

    const valueResult = await describeQuery({
      sql: 'select f.value from lateral flatten(input => arr) f',
      dialect: 'snowflake',
    });
    expect(valueResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['value', 'variant', 'f.value'],
    ]);

    const tableFunctionResult = await describeQuery({
      sql: 'select f.* from table(flatten(input => arr)) f',
      dialect: 'snowflake',
    });
    expect(tableFunctionResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['seq', 'integer', 'f.seq'],
      ['key', 'text', 'f.key'],
      ['path', 'text', 'f.path'],
      ['index', 'integer', 'f.index'],
      ['value', 'variant', 'f.value'],
      ['this', 'variant', 'f.this'],
    ]);
  });

  it('describes match_recognize base and measure columns', async () => {
    const result = await describeQuery({
      sql: 'select mr.id, mr.mid from users match_recognize (partition by id order by age measures id as mid pattern (a) define a as age > 0) mr',
      dialect: 'snowflake',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'mr.id'],
      ['mid', 'integer', 'mr.mid'],
    ]);
  });

  it('describes joins between derived tables and schema tables', async () => {
    const result = await describeQuery({
      sql: 'select x.one, u.name from (select 1 as one) x join users u on true',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['one', 'integer', 'x.one'],
      ['name', 'text', 'users.name'],
    ]);
  });

  it('describes projections from view schemas', async () => {
    const result = await describeQuery({
      sql: 'select id, name from active_users',
      schema: {
        tables: [
          ...schema.tables,
          {
            name: 'active_users',
            columns: [
              { name: 'id', type: 'integer', nullable: false },
              { name: 'name', type: 'text', nullable: false },
            ],
          },
        ],
      },
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'active_users.id'],
      ['name', 'text', 'active_users.name'],
    ]);
  });

  it('describes common metadata catalog projections without user schema', async () => {
    const tablesResult = await describeQuery({
      sql: 'select table_schema, table_name from information_schema.tables',
      dialect: 'postgres',
    });
    expect(tablesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['table_schema', 'text', 'information_schema.tables.table_schema'],
      ['table_name', 'text', 'information_schema.tables.table_name'],
    ]);
    expect(tablesResult.warnings).toEqual([]);

    const columnsResult = await describeQuery({
      sql: 'select * from information_schema.columns',
      dialect: 'postgres',
    });
    expect(columnsResult.columns.slice(0, 8).map((column) => [column.name, column.type, column.source])).toEqual([
      ['table_catalog', 'text', 'information_schema.columns.table_catalog'],
      ['table_schema', 'text', 'information_schema.columns.table_schema'],
      ['table_name', 'text', 'information_schema.columns.table_name'],
      ['column_name', 'text', 'information_schema.columns.column_name'],
      ['ordinal_position', 'integer', 'information_schema.columns.ordinal_position'],
      ['column_default', 'text', 'information_schema.columns.column_default'],
      ['is_nullable', 'boolean', 'information_schema.columns.is_nullable'],
      ['data_type', 'text', 'information_schema.columns.data_type'],
    ]);
    expect(columnsResult.warnings).toEqual([]);

    const pgCatalogResult = await describeQuery({
      sql: 'select schemaname, tablename from pg_catalog.pg_tables',
      dialect: 'postgres',
    });
    expect(pgCatalogResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['schemaname', 'text', 'pg_catalog.pg_tables.schemaname'],
      ['tablename', 'text', 'pg_catalog.pg_tables.tablename'],
    ]);

    const constraintsResult = await describeQuery({
      sql: 'select constraint_name, update_rule from information_schema.referential_constraints',
      dialect: 'postgres',
    });
    expect(constraintsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['constraint_name', 'text', 'information_schema.referential_constraints.constraint_name'],
      ['update_rule', 'text', 'information_schema.referential_constraints.update_rule'],
    ]);

    const sysResult = await describeQuery({
      sql: 'select name, create_date from sys.tables',
      dialect: 'tsql',
    });
    expect(sysResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'text', 'sys.tables.name'],
      ['create_date', 'timestamp', 'sys.tables.create_date'],
    ]);

    const sysDmvResult = await describeQuery({
      sql: 'select session_id, login_name from sys.dm_exec_sessions',
      dialect: 'tsql',
    });
    expect(sysDmvResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['session_id', 'integer', 'sys.dm_exec_sessions.session_id'],
      ['login_name', 'text', 'sys.dm_exec_sessions.login_name'],
    ]);

    const sysDatabasesResult = await describeQuery({
      sql: 'select name, database_id from sys.databases',
      dialect: 'tsql',
    });
    expect(sysDatabasesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'text', 'sys.databases.name'],
      ['database_id', 'integer', 'sys.databases.database_id'],
    ]);

    const sysRequestsResult = await describeQuery({
      sql: 'select session_id, command from sys.dm_exec_requests',
      dialect: 'tsql',
    });
    expect(sysRequestsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['session_id', 'integer', 'sys.dm_exec_requests.session_id'],
      ['command', 'text', 'sys.dm_exec_requests.command'],
    ]);

    const sysIndexesResult = await describeQuery({
      sql: 'select name, index_id from sys.indexes',
      dialect: 'tsql',
    });
    expect(sysIndexesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'text', 'sys.indexes.name'],
      ['index_id', 'integer', 'sys.indexes.index_id'],
    ]);

    const systemTablesResult = await describeQuery({
      sql: 'select database, name from system.tables',
      dialect: 'clickhouse',
    });
    expect(systemTablesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['database', 'text', 'system.tables.database'],
      ['name', 'text', 'system.tables.name'],
    ]);

    const oracleVSessionResult = await describeQuery({
      sql: 'select sid, username from v$session',
      dialect: 'oracle',
    });
    expect(oracleVSessionResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['sid', 'integer', 'v$session.sid'],
      ['username', 'text', 'v$session.username'],
    ]);

    const snowflakeAccountUsageResult = await describeQuery({
      sql: 'select query_id, execution_status from account_usage.query_history',
      dialect: 'snowflake',
    });
    expect(snowflakeAccountUsageResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['query_id', 'text', 'account_usage.query_history.query_id'],
      ['execution_status', 'text', 'account_usage.query_history.execution_status'],
    ]);

    const sqliteResult = await describeQuery({
      sql: 'select type, name, tbl_name, sql from sqlite_master',
      dialect: 'sqlite',
    });
    expect(sqliteResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['type', 'text', 'sqlite_master.type'],
      ['name', 'text', 'sqlite_master.name'],
      ['tbl_name', 'text', 'sqlite_master.tbl_name'],
      ['sql', 'text', 'sqlite_master.sql'],
    ]);

    const bigQueryJobsResult = await describeQuery({
      sql: 'select job_id, creation_time from information_schema.jobs',
      dialect: 'bigquery',
    });
    expect(bigQueryJobsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['job_id', 'text', 'information_schema.jobs.job_id'],
      ['creation_time', 'timestamp', 'information_schema.jobs.creation_time'],
    ]);

    const snowflakeTableResult = await describeQuery({
      sql: 'select table_name, row_count from information_schema.tables',
      dialect: 'snowflake',
    });
    expect(snowflakeTableResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['table_name', 'text', 'information_schema.tables.table_name'],
      ['row_count', 'integer', 'information_schema.tables.row_count'],
    ]);

    const overriddenResult = await describeQuery({
      sql: 'select table_name from information_schema.tables',
      dialect: 'postgres',
      schema: {
        tables: [
          {
            schema: 'information_schema',
            name: 'tables',
            columns: [
              { name: 'table_name', type: 'uuid' },
            ],
          },
        ],
      },
    });
    expect(overriddenResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['table_name', 'uuid', 'information_schema.tables.table_name'],
    ]);
  });

  it('describes projections from set-operation view schemas', async () => {
    const result = await describeQuery({
      sql: 'select n from numbers',
      schema: {
        tables: [
          {
            name: 'numbers',
            columns: [
              { name: 'n', type: 'integer' },
            ],
          },
        ],
      },
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['n', 'integer', 'numbers.n'],
    ]);
  });

  it('describes create view query shapes', async () => {
    const result = await describeQuery({
      sql: 'create view user_names(user_id, label) as select id, name from users',
      schema,
    });
    expect(result.statements[0]).toMatchObject({ kind: 'create_view', resultKind: 'static' });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['user_id', 'integer', 'users.id'],
      ['label', 'text', 'users.name'],
    ]);
  });

  it('describes create table as select query shapes', async () => {
    const result = await describeQuery({
      sql: 'create table user_names(user_id int, label text) as select id, name from users',
      schema,
    });
    expect(result.statements[0]).toMatchObject({ kind: 'create_table', resultKind: 'static' });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['user_id', 'integer', 'users.id'],
      ['label', 'text', 'users.name'],
    ]);
  });

  it('describes common show listing result columns', async () => {
    const result = await describeQuery({ sql: 'show tables' });
    expect(result.statements[0]).toMatchObject({ kind: 'show', resultKind: 'static' });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Table', 'text', 'cast'],
    ]);

    const schemasResult = await describeQuery({ sql: 'show schemas', dialect: 'postgres' });
    expect(schemasResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Schema', 'text', 'cast'],
    ]);

    const variablesResult = await describeQuery({ sql: 'show variables', dialect: 'mysql' });
    expect(variablesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Variable_name', 'text', 'cast'],
      ['Value', 'text', 'cast'],
    ]);

    const globalVariablesResult = await describeQuery({ sql: 'show global variables', dialect: 'mysql' });
    expect(globalVariablesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Variable_name', 'text', 'cast'],
      ['Value', 'text', 'cast'],
    ]);

    const warningsResult = await describeQuery({ sql: 'show warnings', dialect: 'mysql' });
    expect(warningsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Level', 'text', 'cast'],
      ['Code', 'integer', 'cast'],
      ['Message', 'text', 'cast'],
    ]);

    const enginesResult = await describeQuery({ sql: 'show engines', dialect: 'mysql' });
    expect(enginesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Engine', 'text', 'cast'],
      ['Support', 'text', 'cast'],
      ['Comment', 'text', 'cast'],
      ['Transactions', 'text', 'cast'],
      ['XA', 'text', 'cast'],
      ['Savepoints', 'text', 'cast'],
    ]);

    const engineStatusResult = await describeQuery({ sql: 'show engine innodb status', dialect: 'mysql' });
    expect(engineStatusResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Type', 'text', 'cast'],
      ['Name', 'text', 'cast'],
      ['Status', 'text', 'cast'],
    ]);

    const processlistResult = await describeQuery({ sql: 'show processlist', dialect: 'mysql' });
    expect(processlistResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Id', 'integer', 'cast'],
      ['User', 'text', 'cast'],
      ['Host', 'text', 'cast'],
      ['db', 'text', 'cast'],
      ['Command', 'text', 'cast'],
      ['Time', 'integer', 'cast'],
      ['State', 'text', 'cast'],
      ['Info', 'text', 'cast'],
    ]);

    const fullTablesResult = await describeQuery({ sql: 'show full tables', dialect: 'mysql' });
    expect(fullTablesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Table', 'text', 'cast'],
      ['Table_type', 'text', 'cast'],
    ]);

    const openTablesResult = await describeQuery({ sql: 'show open tables', dialect: 'mysql' });
    expect(openTablesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Database', 'text', 'cast'],
      ['Table', 'text', 'cast'],
      ['In_use', 'integer', 'cast'],
      ['Name_locked', 'integer', 'cast'],
    ]);

    const triggersResult = await describeQuery({ sql: 'show triggers', dialect: 'mysql' });
    expect(triggersResult.columns.slice(0, 5).map((column) => [column.name, column.type, column.source])).toEqual([
      ['Trigger', 'text', 'cast'],
      ['Event', 'text', 'cast'],
      ['Table', 'text', 'cast'],
      ['Statement', 'text', 'cast'],
      ['Timing', 'text', 'cast'],
    ]);

    const masterStatusResult = await describeQuery({ sql: 'show master status', dialect: 'mysql' });
    expect(masterStatusResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['File', 'text', 'cast'],
      ['Position', 'integer', 'cast'],
      ['Binlog_Do_DB', 'text', 'cast'],
      ['Binlog_Ignore_DB', 'text', 'cast'],
      ['Executed_Gtid_Set', 'text', 'cast'],
    ]);

    const profilesResult = await describeQuery({ sql: 'show profiles', dialect: 'mysql' });
    expect(profilesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Query_ID', 'integer', 'cast'],
      ['Duration', 'decimal', 'cast'],
      ['Query', 'text', 'cast'],
    ]);

    const replicasResult = await describeQuery({ sql: 'show replicas', dialect: 'mysql' });
    expect(replicasResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Server_Id', 'integer', 'cast'],
      ['Host', 'text', 'cast'],
      ['Port', 'integer', 'cast'],
      ['Source_Id', 'integer', 'cast'],
      ['Replica_UUID', 'text', 'cast'],
    ]);

    const authorsResult = await describeQuery({ sql: 'show authors', dialect: 'mysql' });
    expect(authorsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Name', 'text', 'cast'],
      ['Location', 'text', 'cast'],
      ['Comment', 'text', 'cast'],
    ]);

    const createFunctionResult = await describeQuery({ sql: 'show create function f', dialect: 'mysql' });
    expect(createFunctionResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Object', 'text', 'cast'],
      ['Create Function', 'text', 'cast'],
    ]);

    const functionCodeResult = await describeQuery({ sql: 'show function code f', dialect: 'mysql' });
    expect(functionCodeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Pos', 'integer', 'cast'],
      ['Instruction', 'text', 'cast'],
    ]);

    const relayLogEventsResult = await describeQuery({ sql: 'show relaylog events', dialect: 'mysql' });
    expect(relayLogEventsResult.columns.slice(0, 3).map((column) => [column.name, column.type, column.source])).toEqual([
      ['Log_name', 'text', 'cast'],
      ['Pos', 'integer', 'cast'],
      ['Event_type', 'text', 'cast'],
    ]);

    const pluginsResult = await describeQuery({ sql: 'show plugins', dialect: 'mysql' });
    expect(pluginsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Name', 'text', 'cast'],
      ['Status', 'text', 'cast'],
      ['Type', 'text', 'cast'],
      ['Library', 'text', 'cast'],
      ['License', 'text', 'cast'],
    ]);

    const functionStatusResult = await describeQuery({ sql: 'show function status', dialect: 'mysql' });
    expect(functionStatusResult.columns.slice(0, 5).map((column) => [column.name, column.type, column.source])).toEqual([
      ['Db', 'text', 'cast'],
      ['Name', 'text', 'cast'],
      ['Type', 'text', 'cast'],
      ['Definer', 'text', 'cast'],
      ['Modified', 'timestamp', 'cast'],
    ]);

    const procedureStatusResult = await describeQuery({ sql: 'show procedure status', dialect: 'mysql' });
    expect(procedureStatusResult.columns.slice(0, 5).map((column) => [column.name, column.type, column.source])).toEqual([
      ['Db', 'text', 'cast'],
      ['Name', 'text', 'cast'],
      ['Type', 'text', 'cast'],
      ['Definer', 'text', 'cast'],
      ['Modified', 'timestamp', 'cast'],
    ]);

    const snowflakeParametersResult = await describeQuery({ sql: 'show parameters', dialect: 'snowflake' });
    expect(snowflakeParametersResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['key', 'text', 'cast'],
      ['value', 'text', 'cast'],
      ['default', 'text', 'cast'],
      ['level', 'text', 'cast'],
      ['description', 'text', 'cast'],
      ['type', 'text', 'cast'],
    ]);

    const snowflakeTasksResult = await describeQuery({ sql: 'show tasks', dialect: 'snowflake' });
    expect(snowflakeTasksResult.columns.slice(0, 6).map((column) => [column.name, column.type, column.source])).toEqual([
      ['created_on', 'timestamp', 'cast'],
      ['name', 'text', 'cast'],
      ['id', 'text', 'cast'],
      ['database_name', 'text', 'cast'],
      ['schema_name', 'text', 'cast'],
      ['owner', 'text', 'cast'],
    ]);

    const snowflakeExternalTablesResult = await describeQuery({ sql: 'show external tables', dialect: 'snowflake' });
    expect(snowflakeExternalTablesResult.columns.slice(0, 4).map((column) => [column.name, column.type, column.source])).toEqual([
      ['created_on', 'timestamp', 'cast'],
      ['name', 'text', 'cast'],
      ['database_name', 'text', 'cast'],
      ['schema_name', 'text', 'cast'],
    ]);

    const snowflakeSequencesResult = await describeQuery({ sql: 'show sequences', dialect: 'snowflake' });
    expect(snowflakeSequencesResult.columns.slice(0, 4).map((column) => [column.name, column.type, column.source])).toEqual([
      ['created_on', 'timestamp', 'cast'],
      ['name', 'text', 'cast'],
      ['database_name', 'text', 'cast'],
      ['schema_name', 'text', 'cast'],
    ]);

    const snowflakeKeysResult = await describeQuery({ sql: 'show primary keys', dialect: 'snowflake' });
    expect(snowflakeKeysResult.columns.slice(0, 4).map((column) => [column.name, column.type, column.source])).toEqual([
      ['created_on', 'timestamp', 'cast'],
      ['database_name', 'text', 'cast'],
      ['schema_name', 'text', 'cast'],
      ['table_name', 'text', 'cast'],
    ]);

    const snowflakeIntegrationsResult = await describeQuery({ sql: 'show integrations', dialect: 'snowflake' });
    expect(snowflakeIntegrationsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'text', 'cast'],
      ['type', 'text', 'cast'],
      ['category', 'text', 'cast'],
      ['enabled', 'boolean', 'cast'],
      ['comment', 'text', 'cast'],
      ['created_on', 'timestamp', 'cast'],
    ]);

    const snowflakeTablesResult = await describeQuery({ sql: 'show tables', dialect: 'snowflake' });
    expect(snowflakeTablesResult.columns.slice(0, 5).map((column) => [column.name, column.type, column.source])).toEqual([
      ['created_on', 'timestamp', 'cast'],
      ['name', 'text', 'cast'],
      ['database_name', 'text', 'cast'],
      ['schema_name', 'text', 'cast'],
      ['kind', 'text', 'cast'],
    ]);

    const catalogsResult = await describeQuery({ sql: 'show catalogs', dialect: 'trino' });
    expect(catalogsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Catalog', 'text', 'cast'],
    ]);

    const clickHouseShowDatabasesResult = await describeQuery({ sql: 'show databases', dialect: 'clickhouse' });
    expect(clickHouseShowDatabasesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Database', 'text', 'cast'],
    ]);

    const clickHouseDescribeResult = await describeQuery({ sql: 'describe table users', dialect: 'clickhouse' });
    expect(clickHouseDescribeResult.columns.slice(0, 3).map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'text', 'cast'],
      ['type', 'text', 'cast'],
      ['default_type', 'text', 'cast'],
    ]);

    const partitionsResult = await describeQuery({ sql: 'show partitions users', dialect: 'spark' });
    expect(partitionsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['partition', 'text', 'cast'],
    ]);

    const tblPropertiesResult = await describeQuery({ sql: 'show tblproperties users', dialect: 'spark' });
    expect(tblPropertiesResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['key', 'text', 'cast'],
      ['value', 'text', 'cast'],
    ]);

    const currentNamespaceResult = await describeQuery({ sql: 'show current namespace', dialect: 'spark' });
    expect(currentNamespaceResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['namespace', 'text', 'cast'],
    ]);

    const trinoStatsResult = await describeQuery({ sql: 'show stats for users', dialect: 'trino' });
    expect(trinoStatsResult.columns.slice(0, 4).map((column) => [column.name, column.type, column.source])).toEqual([
      ['column_name', 'text', 'cast'],
      ['data_size', 'integer', 'cast'],
      ['distinct_values_count', 'integer', 'cast'],
      ['nulls_fraction', 'decimal', 'cast'],
    ]);
  });

  it('describes duckdb summarize metadata columns', async () => {
    const result = await describeQuery({ sql: 'summarize users', dialect: 'duckdb', schema });
    expect(result.statements[0]).toMatchObject({ kind: 'summarize', resultKind: 'static' });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['column_name', 'text', 'cast'],
      ['column_type', 'text', 'cast'],
      ['min', 'text', 'cast'],
      ['max', 'text', 'cast'],
      ['approx_unique', 'integer', 'cast'],
      ['avg', 'text', 'cast'],
      ['std', 'text', 'cast'],
      ['q25', 'text', 'cast'],
      ['q50', 'text', 'cast'],
      ['q75', 'text', 'cast'],
      ['count', 'integer', 'cast'],
      ['null_percentage', 'decimal', 'cast'],
    ]);
  });

  it('describes common show metadata result columns', async () => {
    const columnsResult = await describeQuery({ sql: 'show columns from users', dialect: 'mysql' });
    expect(columnsResult.statements[0]).toMatchObject({ kind: 'show', resultKind: 'static' });
    expect(columnsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Field', 'text', 'cast'],
      ['Type', 'text', 'cast'],
      ['Null', 'text', 'cast'],
      ['Key', 'text', 'cast'],
      ['Default', 'text', 'cast'],
      ['Extra', 'text', 'cast'],
    ]);

    const createResult = await describeQuery({ sql: 'show create table users', dialect: 'mysql' });
    expect(createResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Table', 'text', 'cast'],
      ['Create Table', 'text', 'cast'],
    ]);

    const indexResult = await describeQuery({ sql: 'show indexes from users', dialect: 'mysql' });
    expect(indexResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['Table', 'text', 'cast'],
      ['Non_unique', 'integer', 'cast'],
      ['Key_name', 'text', 'cast'],
      ['Seq_in_index', 'integer', 'cast'],
      ['Column_name', 'text', 'cast'],
      ['Collation', 'text', 'cast'],
      ['Cardinality', 'integer', 'cast'],
      ['Sub_part', 'integer', 'cast'],
      ['Packed', 'text', 'cast'],
      ['Null', 'text', 'cast'],
      ['Index_type', 'text', 'cast'],
      ['Comment', 'text', 'cast'],
      ['Index_comment', 'text', 'cast'],
    ]);
  });

  it('describes sqlite pragma table metadata result columns', async () => {
    const result = await describeQuery({ sql: 'pragma table_info(users)', dialect: 'sqlite' });
    expect(result.statements[0]).toMatchObject({ kind: 'pragma', resultKind: 'static' });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['cid', 'integer', 'cast'],
      ['name', 'text', 'cast'],
      ['type', 'text', 'cast'],
      ['notnull', 'integer', 'cast'],
      ['dflt_value', 'text', 'cast'],
      ['pk', 'integer', 'cast'],
    ]);

    const indexResult = await describeQuery({ sql: 'pragma index_list(users)', dialect: 'sqlite' });
    expect(indexResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['seq', 'integer', 'cast'],
      ['name', 'text', 'cast'],
      ['unique', 'integer', 'cast'],
      ['origin', 'text', 'cast'],
      ['partial', 'integer', 'cast'],
    ]);

    const foreignKeyResult = await describeQuery({ sql: 'pragma foreign_key_list(users)', dialect: 'sqlite' });
    expect(foreignKeyResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'cast'],
      ['seq', 'integer', 'cast'],
      ['table', 'text', 'cast'],
      ['from', 'text', 'cast'],
      ['to', 'text', 'cast'],
      ['on_update', 'text', 'cast'],
      ['on_delete', 'text', 'cast'],
      ['match', 'text', 'cast'],
    ]);

    const functionListResult = await describeQuery({ sql: 'pragma function_list', dialect: 'sqlite' });
    expect(functionListResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'text', 'cast'],
      ['builtin', 'integer', 'cast'],
      ['type', 'text', 'cast'],
      ['enc', 'text', 'cast'],
      ['narg', 'integer', 'cast'],
      ['flags', 'integer', 'cast'],
    ]);

    const moduleListResult = await describeQuery({ sql: 'pragma module_list', dialect: 'sqlite' });
    expect(moduleListResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'text', 'cast'],
    ]);

    const compileOptionsResult = await describeQuery({ sql: 'pragma compile_options', dialect: 'sqlite' });
    expect(compileOptionsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['compile_options', 'text', 'cast'],
    ]);

    const collationListResult = await describeQuery({ sql: 'pragma collation_list', dialect: 'sqlite' });
    expect(collationListResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['seq', 'integer', 'cast'],
      ['name', 'text', 'cast'],
    ]);

    const pragmaListResult = await describeQuery({ sql: 'pragma pragma_list', dialect: 'sqlite' });
    expect(pragmaListResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'text', 'cast'],
    ]);

    const quickCheckResult = await describeQuery({ sql: 'pragma quick_check', dialect: 'sqlite' });
    expect(quickCheckResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['quick_check', 'text', 'cast'],
    ]);

    const optimizeResult = await describeQuery({ sql: 'pragma optimize', dialect: 'sqlite' });
    expect(optimizeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['optimize', 'text', 'cast'],
    ]);

    const walCheckpointResult = await describeQuery({ sql: 'pragma wal_checkpoint', dialect: 'sqlite' });
    expect(walCheckpointResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['busy', 'integer', 'cast'],
      ['log', 'integer', 'cast'],
      ['checkpointed', 'integer', 'cast'],
    ]);

    const statsResult = await describeQuery({ sql: 'pragma stats', dialect: 'sqlite' });
    expect(statsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['table', 'text', 'cast'],
      ['index', 'text', 'cast'],
      ['width', 'integer', 'cast'],
      ['height', 'integer', 'cast'],
    ]);

    const journalModeResult = await describeQuery({ sql: 'pragma journal_mode', dialect: 'sqlite' });
    expect(journalModeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['journal_mode', 'text', 'cast'],
    ]);

    const cacheSizeResult = await describeQuery({ sql: 'pragma cache_size', dialect: 'sqlite' });
    expect(cacheSizeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['cache_size', 'integer', 'cast'],
    ]);

    const foreignKeysResult = await describeQuery({ sql: 'pragma foreign_keys', dialect: 'sqlite' });
    expect(foreignKeysResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['foreign_keys', 'boolean', 'cast'],
    ]);
  });

  it('describes explain query targets and describe table targets when schema is available', async () => {
    const describeResult = await describeQuery({ sql: 'describe users', schema });
    expect(describeResult.statements[0]).toMatchObject({ kind: 'describe', resultKind: 'static' });
    expect(describeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
    ]);

    const explainResult = await describeQuery({ sql: 'explain select id from users', schema });
    expect(explainResult.statements[0]).toMatchObject({ kind: 'describe', resultKind: 'static' });
    expect(explainResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['QUERY PLAN', 'text', 'cast'],
    ]);

    const explainAnalyzeResult = await describeQuery({ sql: 'explain analyze select id from users', dialect: 'postgres', schema });
    expect(explainAnalyzeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['QUERY PLAN', 'text', 'cast'],
    ]);

    const mysqlExplainResult = await describeQuery({ sql: 'explain select id from users', dialect: 'mysql', schema });
    expect(mysqlExplainResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'cast'],
      ['select_type', 'text', 'cast'],
      ['table', 'text', 'cast'],
      ['partitions', 'text', 'cast'],
      ['type', 'text', 'cast'],
      ['possible_keys', 'text', 'cast'],
      ['key', 'text', 'cast'],
      ['key_len', 'text', 'cast'],
      ['ref', 'text', 'cast'],
      ['rows', 'integer', 'cast'],
      ['filtered', 'decimal', 'cast'],
      ['Extra', 'text', 'cast'],
    ]);

    const sqliteExplainResult = await describeQuery({ sql: 'explain select id from users', dialect: 'sqlite', schema });
    expect(sqliteExplainResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['addr', 'integer', 'cast'],
      ['opcode', 'text', 'cast'],
      ['p1', 'integer', 'cast'],
      ['p2', 'integer', 'cast'],
      ['p3', 'integer', 'cast'],
      ['p4', 'text', 'cast'],
      ['p5', 'integer', 'cast'],
      ['comment', 'text', 'cast'],
    ]);

    const sparkDescribeFunctionResult = await describeQuery({ sql: 'describe function abs', dialect: 'spark', schema });
    expect(sparkDescribeFunctionResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['function_desc', 'text', 'cast'],
    ]);

    const snowflakeDescribeWarehouseResult = await describeQuery({ sql: 'describe warehouse wh', dialect: 'snowflake', schema });
    expect(snowflakeDescribeWarehouseResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['property', 'text', 'cast'],
      ['value', 'text', 'cast'],
      ['default', 'text', 'cast'],
      ['level', 'text', 'cast'],
      ['description', 'text', 'cast'],
    ]);
  });

  it('keeps unresolved describe targets as metadata dependent', async () => {
    const result = await describeQuery({ sql: 'describe missing_table', schema });
    expect(result.columns).toEqual([]);
    expect(result.statements[0]).toMatchObject({ kind: 'describe', resultKind: 'metadata' });
    expect(result.diagnostics.at(-1)).toMatchObject({ code: 'SQLDESC_METADATA_RESULT_SHAPE' });
  });

  it('reports non-static statement diagnostics even when other statements are static', async () => {
    const metadataResult = await describeQuery({ sql: 'describe missing_table; select 1 as one', schema });
    expect(metadataResult.columns.map((column) => [column.name, column.type])).toEqual([
      ['one', 'integer'],
    ]);
    expect(metadataResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['describe', 'metadata'],
      ['select', 'static'],
    ]);
    expect(metadataResult.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SQLDESC_METADATA_RESULT_SHAPE', severity: 'warning' }),
    ]));

    const runtimeResult = await describeQuery({ sql: 'select 1 as one; call my_proc()' });
    expect(runtimeResult.columns.map((column) => [column.name, column.type])).toEqual([
      ['one', 'integer'],
    ]);
    expect(runtimeResult.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['select', 'static'],
      ['command', 'runtime'],
    ]);
    expect(runtimeResult.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SQLDESC_RUNTIME_RESULT_SHAPE', severity: 'warning' }),
    ]));
  });

  it('classifies runtime-dependent result shapes', async () => {
    const callResult = await describeQuery({ sql: 'call my_proc()' });
    expect(callResult.statements[0]).toMatchObject({ kind: 'command', resultKind: 'runtime' });
    expect(callResult.diagnostics.at(-1)).toMatchObject({ code: 'SQLDESC_RUNTIME_RESULT_SHAPE' });

    const executeResult = await describeQuery({ sql: 'execute my_stmt' });
    expect(executeResult.statements[0]).toMatchObject({ kind: 'execute', resultKind: 'runtime' });
    expect(executeResult.diagnostics.at(-1)).toMatchObject({ code: 'SQLDESC_RUNTIME_RESULT_SHAPE' });

    const tsqlExecuteResult = await describeQuery({ sql: 'exec dbo.my_proc', dialect: 'tsql' });
    expect(tsqlExecuteResult.statements[0]).toMatchObject({ kind: 'execute', resultKind: 'runtime' });
    expect(tsqlExecuteResult.diagnostics).toEqual([
      expect.objectContaining({ code: 'SQLDESC_RUNTIME_RESULT_SHAPE', severity: 'warning' }),
    ]);

    const copyResult = await describeQuery({ sql: "copy unknown_table to '/tmp/x.csv'", dialect: 'postgres' });
    expect(copyResult.statements[0]).toMatchObject({ kind: 'copy', resultKind: 'runtime' });

    const copyFromResult = await describeQuery({ sql: 'copy users from stdin', dialect: 'postgres', schema });
    expect(copyFromResult.columns).toEqual([]);
    expect(copyFromResult.statements[0]).toMatchObject({ kind: 'copy', resultKind: 'none' });
  });

  it('describes copy and export query shapes', async () => {
    const copyQuery = await describeQuery({
      sql: "copy (select id, name from users) to '/tmp/users.csv' csv",
      dialect: 'postgres',
      schema,
    });
    expect(copyQuery.statements[0]).toMatchObject({ kind: 'copy', resultKind: 'static' });
    expect(copyQuery.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);

    const copyTable = await describeQuery({
      sql: "copy users to '/tmp/users.csv' csv",
      dialect: 'postgres',
      schema,
    });
    expect(copyTable.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'integer', 'users.age'],
    ]);

    const snowflakeCopy = await describeQuery({
      sql: 'copy into @stage/users.csv from (select id, name from users)',
      dialect: 'snowflake',
      schema,
    });
    expect(snowflakeCopy.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);

    const exportResult = await describeQuery({
      sql: "export data options(uri='gs://x/*.csv', format='CSV') as select id, name from users",
      dialect: 'bigquery',
      schema,
    });
    expect(exportResult.statements[0]).toMatchObject({ kind: 'export', resultKind: 'static' });
    expect(exportResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);
    expect(exportResult.diagnostics).toEqual([]);
  });

  it('describes execute result shapes from earlier prepare statements', async () => {
    const result = await describeQuery({
      sql: 'prepare get_user as select id, name from users; execute get_user',
      dialect: 'postgres',
      schema,
    });
    expect(result.statements.map((statement) => [statement.kind, statement.resultKind])).toEqual([
      ['prepare', 'none'],
      ['execute', 'static'],
    ]);
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);
    expect(result.resultSets[0]?.index).toBe(2);
    expect(result.diagnostics).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'E200' }),
    ]));
  });

  it('classifies non-result statements', async () => {
    const result = await describeQuery({ sql: 'merge into users using src on users.id = src.id when matched then update set name = src.name' });
    expect(result.columns).toEqual([]);
    expect(result.statements[0]).toMatchObject({ kind: 'merge', resultKind: 'none' });
    expect(result.diagnostics.at(-1)).toMatchObject({ code: 'SQLDESC_NO_RESULT_COLUMNS', severity: 'info' });

    const declareResult = await describeQuery({ sql: 'declare c cursor for select id from users', dialect: 'postgres' });
    expect(declareResult.columns).toEqual([]);
    expect(declareResult.statements[0]).toMatchObject({ kind: 'declare', resultKind: 'none' });

    const triggerResult = await describeQuery({ sql: 'create trigger tr before insert on users execute function f()', dialect: 'postgres' });
    expect(triggerResult.columns).toEqual([]);
    expect(triggerResult.statements[0]).toMatchObject({ kind: 'create_trigger', resultKind: 'none' });

    const attachResult = await describeQuery({ sql: "attach database 'x.db' as x", dialect: 'sqlite' });
    expect(attachResult.columns).toEqual([]);
    expect(attachResult.statements[0]).toMatchObject({ kind: 'attach', resultKind: 'none' });

    const detachResult = await describeQuery({ sql: 'detach database x', dialect: 'sqlite' });
    expect(detachResult.columns).toEqual([]);
    expect(detachResult.statements[0]).toMatchObject({ kind: 'detach', resultKind: 'none' });

    const cacheResult = await describeQuery({ sql: 'cache table users', dialect: 'spark' });
    expect(cacheResult.columns).toEqual([]);
    expect(cacheResult.statements[0]).toMatchObject({ kind: 'cache', resultKind: 'none' });

    const uncacheResult = await describeQuery({ sql: 'uncache table users', dialect: 'spark' });
    expect(uncacheResult.columns).toEqual([]);
    expect(uncacheResult.statements[0]).toMatchObject({ kind: 'uncache', resultKind: 'none' });

    const alterIndexResult = await describeQuery({ sql: 'alter index idx rename to idx2', dialect: 'postgres' });
    expect(alterIndexResult.columns).toEqual([]);
    expect(alterIndexResult.statements[0]).toMatchObject({ kind: 'alter_index', resultKind: 'none' });

    const taskResult = await describeQuery({ sql: 'create task t as select 1', dialect: 'snowflake' });
    expect(taskResult.columns).toEqual([]);
    expect(taskResult.statements[0]).toMatchObject({ kind: 'create_task', resultKind: 'none' });
  });

  it('describes merge returning columns', async () => {
    const result = await describeQuery({
      sql: 'merge into users using orders on users.id = orders.user_id when matched then update set name = users.name returning users.id, users.name',
      dialect: 'postgres',
      schema,
    });
    expect(result.statements[0]).toMatchObject({ kind: 'merge', resultKind: 'static' });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);
  });

  it('describes merge output pseudo table columns', async () => {
    const result = await describeQuery({
      sql: 'merge users as target using orders as source on target.id = source.user_id when matched then update set name = target.name output inserted.id, inserted.name',
      dialect: 'tsql',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);
  });

  it('describes merge returning target aliases', async () => {
    const result = await describeQuery({
      sql: 'merge users as target using orders as source on target.id = source.user_id when matched then update set name = target.name returning target.id',
      dialect: 'postgres',
      schema,
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'users.id'],
    ]);
  });

  it('preserves multiple result sets for multi-statement SQL', async () => {
    const result = await describeQuery({ sql: "select 1 as one; values (2, 'b')" });
    expect(result.columns.map((column) => [column.name, column.type])).toEqual([
      ['one', 'integer'],
    ]);
    expect(result.resultSets.map((set) => set.columns.map((column) => [column.name, column.type]))).toEqual([
      [['one', 'integer']],
      [
        ['column_1', 'integer'],
        ['column_2', 'text'],
      ],
    ]);
  });

  it('uses definitions from earlier statements in later statement schemas', async () => {
    const viewResult = await describeQuery({ sql: 'create view v as select 1 as id; select id from v' });
    expect(viewResult.resultSets[1]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'v.id'],
    ]);

    const schemaBackedViewResult = await describeQuery({
      sql: 'create view user_ids as select id from users; select id from user_ids',
      schema,
    });
    expect(schemaBackedViewResult.resultSets[1]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'user_ids.id'],
    ]);
    expect(schemaBackedViewResult.diagnostics).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'E200' }),
    ]));

    const ctasResult = await describeQuery({ sql: "create table t as select 1 as id, 'a' as label; select label from t" });
    expect(ctasResult.resultSets[1]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['label', 'text', 't.label'],
    ]);

    const tableResult = await describeQuery({ sql: 'create table local_users (id int, name text); select id, name from local_users' });
    expect(tableResult.resultSets[0]?.index).toBe(2);
    expect(tableResult.resultSets[0]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'local_users.id'],
      ['name', 'text', 'local_users.name'],
    ]);

    const synonymResult = await describeQuery({
      sql: 'create table users (id int, name text); create synonym user_syn for users; select id, name from user_syn',
    });
    expect(synonymResult.resultSets[0]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'user_syn.id'],
      ['name', 'text', 'user_syn.name'],
    ]);
  });

  it('keeps schema-qualified and materialized view definitions in local schema', async () => {
    const qualifiedSchema: ValidationSchema = {
      tables: [
        {
          name: 'users',
          schema: 'public',
          columns: [
            { name: 'id', type: 'integer' },
          ],
        },
      ],
    };
    const result = await describeQuery({
      sql: 'create materialized view public.user_ids as select id from public.users; select id from public.user_ids',
      dialect: 'postgres',
      schema: qualifiedSchema,
    });
    expect(result.resultSets[1]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'public.user_ids.id'],
    ]);
    expect(result.diagnostics).toEqual([]);

    const renameResult = await describeQuery({
      sql: 'create materialized view public.user_ids as select id from public.users; alter materialized view public.user_ids rename to renamed_user_ids; select id from public.renamed_user_ids',
      dialect: 'postgres',
      schema: qualifiedSchema,
    });
    expect(renameResult.resultSets[1]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'public.renamed_user_ids.id'],
    ]);
  });

  it('applies earlier alter table actions to later statement schemas', async () => {
    const addResult = await describeQuery({
      sql: 'create table users (id int); alter table users add column name text; select id, name from users',
    });
    expect(addResult.resultSets[0]?.index).toBe(3);
    expect(addResult.resultSets[0]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'users.id'],
      ['name', 'text', 'users.name'],
    ]);

    const dropResult = await describeQuery({
      sql: 'create table users (id int, age int); alter table users drop column age; select * from users',
    });
    expect(dropResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'users.id'],
    ]);

    const renameResult = await describeQuery({
      sql: 'create table users (id int, name text); alter table users rename column name to full_name; select full_name from users',
    });
    expect(renameResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['full_name', 'text', 'users.full_name'],
    ]);

    const alterTypeResult = await describeQuery({
      sql: 'create table users (id int, age int); alter table users alter column age type bigint; select age from users',
      dialect: 'postgres',
    });
    expect(alterTypeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['age', 'big_int', 'users.age'],
    ]);

    const changeResult = await describeQuery({
      sql: 'create table users (id int, age int); alter table users change column age years bigint; select years from users',
      dialect: 'mysql',
    });
    expect(changeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['years', 'big_int', 'users.years'],
    ]);

    const modifyResult = await describeQuery({
      sql: 'create table users (id int, age int); alter table users modify column age bigint; select age from users',
      dialect: 'mysql',
    });
    expect(modifyResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['age', 'bigint', 'users.age'],
    ]);

    const notNullResult = await describeQuery({
      sql: 'create table users (id int, name text); alter table users alter column name set not null; select name from users',
      dialect: 'postgres',
    });
    expect(notNullResult.columns[0]).toMatchObject({ name: 'name', type: 'text', nullable: false });

    const constraintResult = await describeQuery({
      sql: 'create table users (id int, name text); alter table users add primary key (id); alter table users add unique (name); select id, name from users',
      dialect: 'postgres',
    });
    expect(constraintResult.columns[0]).toMatchObject({ name: 'id', nullable: false });

    const addColumnsResult = await describeQuery({
      sql: 'create table users (id int); alter table users add columns (name text, age int); select id, name, age from users',
      dialect: 'postgres',
    });
    expect(addColumnsResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'users.id'],
      ['name', 'text', 'users.name'],
      ['age', 'int', 'users.age'],
    ]);

    const serialResult = await describeQuery({
      sql: 'create table users (id serial primary key, name text unique not null); select id, name from users',
      dialect: 'postgres',
    });
    expect(serialResult.columns.map((column) => [column.name, column.type, column.source, column.nullable])).toEqual([
      ['id', 'integer', 'users.id', undefined],
      ['name', 'text', 'users.name', false],
    ]);
  });

  it('uses raw global temporary table definitions as local schema for later statements', async () => {
    const result = await describeQuery({
      sql: 'create global temporary table tmp_users (id number, name varchar2(20)); select name from tmp_users',
      dialect: 'oracle',
    });
    expect(result.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'varchar2(20)', 'tmp_users.name'],
    ]);
    expect(result.warnings).toEqual([]);
  });

  it('applies earlier drop and table rename actions to later statement schemas', async () => {
    const dropResult = await describeQuery({
      sql: 'create table users (id int); drop table users; select * from users',
    });
    expect(dropResult.resultSets.map((resultSet) => resultSet.index)).toEqual([]);
    expect(dropResult.statements[2]).toMatchObject({ kind: 'select', resultKind: 'unknown' });
    expect(dropResult.diagnostics.at(-1)).toMatchObject({ code: 'SQLDESC_UNKNOWN_RESULT_SHAPE' });

    const dropViewResult = await describeQuery({
      sql: 'create view v as select 1 as id; drop view v; select * from v',
    });
    expect(dropViewResult.resultSets.map((resultSet) => resultSet.index)).toEqual([1]);

    const dropSchemaResult = await describeQuery({
      sql: 'create table analytics.events (id int); drop schema analytics; select * from analytics.events',
      dialect: 'postgres',
    });
    expect(dropSchemaResult.resultSets.map((resultSet) => resultSet.index)).toEqual([]);
    expect(dropSchemaResult.statements[2]).toMatchObject({ kind: 'select', resultKind: 'unknown' });

    const dropNamespaceResult = await describeQuery({
      sql: 'create table analytics.events (id int); drop namespace analytics; select * from analytics.events',
      dialect: 'snowflake',
    });
    expect(dropNamespaceResult.resultSets.map((resultSet) => resultSet.index)).toEqual([]);
    expect(dropNamespaceResult.statements[2]).toMatchObject({ kind: 'select', resultKind: 'unknown' });

    const renameResult = await describeQuery({
      sql: 'create table users (id int); alter table users rename to people; select id from people',
    });
    expect(renameResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'people.id'],
    ]);

    const setSchemaResult = await describeQuery({
      sql: 'create table users (id int); alter table users set schema archive; select id from archive.users',
      dialect: 'postgres',
    });
    expect(setSchemaResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'archive.users.id'],
    ]);

    const renameSchemaResult = await describeQuery({
      sql: 'create table analytics.events (id int); alter schema analytics rename to archive; select id from archive.events',
      dialect: 'postgres',
    });
    expect(renameSchemaResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'int', 'archive.events.id'],
    ]);

    const renameViewResult = await describeQuery({
      sql: 'create view v as select 1 as id; alter view v rename to v2; select id from v2',
      dialect: 'postgres',
    });
    expect(renameViewResult.resultSets[1]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'v2.id'],
    ]);
    expect(renameViewResult.statements[1]).toMatchObject({ kind: 'alter_view', resultKind: 'none' });
  });

  it('uses select into targets as local schema for later statements', async () => {
    const result = await describeQuery({
      sql: 'select id, name into new_users from users; select name from new_users',
      schema,
    });
    expect(result.resultSets.map((resultSet) => resultSet.index)).toEqual([1, 2]);
    expect(result.resultSets[1]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['name', 'text', 'new_users.name'],
    ]);

    const tempResult = await describeQuery({
      sql: 'select id into #ids from users; select id from #ids',
      dialect: 'tsql',
      schema,
    });
    expect(tempResult.resultSets[1]?.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', '#ids.id'],
    ]);
  });

  it('uses create table like and clone sources as local schema for later statements', async () => {
    const likeResult = await describeQuery({
      sql: 'create table new_users (like users); select id, name from new_users',
      dialect: 'postgres',
      schema,
    });
    expect(likeResult.resultSets[0]?.index).toBe(2);
    expect(likeResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['id', 'integer', 'new_users.id'],
      ['name', 'text', 'new_users.name'],
    ]);

    const cloneResult = await describeQuery({
      sql: 'create table cloned_users clone users; select age from cloned_users',
      dialect: 'snowflake',
      schema,
    });
    expect(cloneResult.columns.map((column) => [column.name, column.type, column.source])).toEqual([
      ['age', 'integer', 'cloned_users.age'],
    ]);
  });
});
