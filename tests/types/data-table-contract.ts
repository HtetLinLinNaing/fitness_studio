import type { ClientSorting, ColumnDef, DataTableProps, ManualPagination } from "@/components/data-table/types";

type Sample = { id: string; label: string };

export const column: ColumnDef<Sample> = {
  id: "label", accessorKey: "label", header: "Label",
  sortable: true,
  compare: (left, right) => left.label.localeCompare(right.label),
};

// @ts-expect-error Controlled sorting requires its change callback.
export const missingCallback: ClientSorting = { state: null };

// @ts-expect-error Controlled and default state cannot compete.
export const competingState: ClientSorting = { state: null, defaultState: null, onChange: () => {} };

// @ts-expect-error Manual pagination requires the full row count.
export const missingTotal: ManualPagination = { mode: "manual", state: { pageIndex: 0, pageSize: 10 }, onChange: () => {} };

// @ts-expect-error Client sorting cannot sort a manually paged subset.
export const partialClientSort: DataTableProps<Sample> = { caption: "Invalid", datasetKey: "invalid", data: [], columns: [column], getRowId: row => row.id, sorting: { mode: "client" }, pagination: { mode: "manual", totalRows: 100, state: { pageIndex: 0, pageSize: 10 }, onChange: () => {} } };

export const disabledSortManualPage: DataTableProps<Sample> = {
  caption: "Manual", datasetKey: "manual", data: [], columns: [column], getRowId: row => row.id,
  sorting: false, pagination: { mode: "manual", totalRows: 100, state: { pageIndex: 0, pageSize: 10 }, onChange: () => {} },
};
