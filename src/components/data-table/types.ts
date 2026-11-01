import type { ReactNode } from "react";

export type RowId = string;
export type SortValue = string | number | boolean | Date | null | undefined;
type ScalarKey<T> = { [K in keyof T]-?: T[K] extends SortValue ? K : never }[keyof T] & string;

type ColumnAccessor<T> =
  | { accessorKey: ScalarKey<T>; accessorFn?: never }
  | { accessorKey?: never; accessorFn: (row: T) => SortValue };
type ColumnPosition =
  | { pinned: "left"; width: number }
  | { pinned?: false; width?: number };

export type ColumnDef<T> = ColumnAccessor<T> & ColumnPosition & {
  id: string;
  header: string;
  cell?: (context: { row: T; rowId: RowId }) => ReactNode;
};

export type RequestState =
  | { status: "ready" }
  | { status: "loading"; skeletonRows?: number }
  | { status: "error"; message: string; onRetry: () => void };

/** Step 7 foundation. Grouped processing and expansion are added in later milestones. */
export type DataTableProps<T> = {
  data: readonly T[];
  columns: readonly ColumnDef<T>[];
  getRowId: (row: T) => RowId;
  datasetKey: string;
  caption: string;
  request?: RequestState;
  emptyMessage?: string;
};
