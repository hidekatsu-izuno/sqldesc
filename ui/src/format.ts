export interface DescribeColumnView {
  index: number;
  name: string | null;
  type: string;
  nullable?: boolean;
  confidence: string;
  source?: string;
  note?: string;
}

export type StatementResultKind = 'static' | 'none' | 'runtime' | 'metadata' | 'unknown';

export interface StatementSummaryView {
  index: number;
  kind: string;
  resultKind: StatementResultKind;
  message?: string;
}

export function formatColumnsTable(columns: DescribeColumnView[]): string[][] {
  const headers = ['#', 'name', 'type', 'nullable', 'confidence', 'source', 'note'];
  const rows = columns.map((column) => [
    String(column.index),
    column.name ?? '',
    column.type,
    column.nullable === undefined ? '' : String(column.nullable),
    column.confidence,
    column.source ?? '',
    column.note ?? '',
  ]);
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
