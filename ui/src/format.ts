import type { DescribeColumn, StatementResultKind } from 'sqldesc';

export interface ColumnRow extends DescribeColumn {
  jdbcType?: string;
}

export function formatColumnsTable(columns: ColumnRow[], options?: { showJdbc?: boolean }): string[][] {
  const showJdbc = options?.showJdbc ?? false;
  const headers = showJdbc
    ? ['#', 'name', 'type', 'jdbc', 'nullable', 'source', 'note']
    : ['#', 'name', 'type', 'nullable', 'source', 'note'];
  const rows = columns.map((column) => {
    const cells = [
      String(column.index),
      column.name,
      column.type,
    ];
    if (showJdbc) {
      cells.push(column.jdbcType ?? '');
    }
    cells.push(
      column.nullable === undefined ? '' : String(column.nullable),
      column.source ?? '',
      column.note ?? '',
    );
    return cells;
  });
  return [headers, ...rows];
}

export function resultKindLabel(kind: StatementResultKind): string {
  switch (kind) {
    case 'static':
      return 'static';
    case 'none':
      return 'no result';
    case 'runtime':
      return 'runtime dependent';
    case 'metadata':
      return 'metadata dependent';
    default:
      return 'unknown';
  }
}

export function resultKindClass(kind: StatementResultKind): string {
  switch (kind) {
    case 'static':
      return 'badge badge-static';
    case 'none':
      return 'badge badge-none';
    case 'runtime':
      return 'badge badge-runtime';
    case 'metadata':
      return 'badge badge-metadata';
    default:
      return 'badge badge-unknown';
  }
}
