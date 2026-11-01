import type { ReactNode } from "react";
import type { PaginationState, SortState } from "@/types/table-state";
export type { PaginationState, SortState } from "@/types/table-state";

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
  sortable?: boolean;
  compare?: (left: T, right: T) => number;
};

export type Controlled<S> = { state: S; onChange: (next: S) => void; defaultState?: never };
export type Uncontrolled<S> = { state?: never; defaultState?: S; onChange?: (next: S) => void };
export type ClientSorting = { mode?: "client" } & (Controlled<SortState> | Uncontrolled<SortState>);
export type ManualSorting = { mode: "manual" } & Controlled<SortState>;
export type SortingConfig = ClientSorting | ManualSorting;
type PageOptions = { pageSizes?: readonly number[] };
export type ClientPagination = { mode?: "client" } & PageOptions &
  (Controlled<PaginationState> | Uncontrolled<PaginationState>);
export type ManualPagination = { mode: "manual"; totalRows: number } & PageOptions & Controlled<PaginationState>;
export type PaginationConfig = ClientPagination | ManualPagination;
export type ProcessingConfig =
  | { sorting?: false | ClientSorting; pagination?: false | ClientPagination }
  | { sorting: ManualSorting; pagination?: false | ClientPagination | ManualPagination }
  | { sorting: false; pagination: ManualPagination };

export type RequestState =
  | { status: "ready" }
  | { status: "loading"; skeletonRows?: number }
  | { status: "error"; message: string; onRetry: () => void };

/** Generic table with independent state ownership and data-processing configuration. */
export type DataTableProps<T> = ProcessingConfig & {
  data: readonly T[];
  columns: readonly ColumnDef<T>[];
  getRowId: (row: T) => RowId;
  datasetKey: string;
  caption: string;
  request?: RequestState;
  emptyMessage?: string;
};
