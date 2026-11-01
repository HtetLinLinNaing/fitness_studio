import type { ClientSorting, ColumnDef, DataTableProps, ExpansionConfig, ManualPagination } from "@/types/table";

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

type Child = { token: string };
export const inlineChildren: ExpansionConfig<Sample, Child> = {
  mode: "inline", getChildren: () => [{ token: "receipt" }],
  renderChildren: ({ children }) => children.map(child => child.token).join(", "),
};

// @ts-expect-error Inline and lazy child sources cannot be mixed.
export const mixedChildSources: ExpansionConfig<Sample, Child> = { mode: "inline", getChildren: () => [], loadChildren: async () => [], renderChildren: () => null };

export const wrongChildShape: ExpansionConfig<Sample, Child> = {
  mode: "inline",
  // @ts-expect-error Child records retain their own independently checked shape.
  getChildren: () => [{ id: "parent", label: "Not a child" }],
  renderChildren: () => null,
};
