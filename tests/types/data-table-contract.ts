import type { ColumnDef } from "@/components/data-table/types";

type Sample = { id: string; label: string };

export const sortingIsDeferred: ColumnDef<Sample> = {
  id: "label", accessorKey: "label", header: "Label",
  // @ts-expect-error Sorting metadata is unavailable until its implementation milestone.
  sortable: true,
};

export const customComparisonIsDeferred: ColumnDef<Sample> = {
  id: "label", accessorKey: "label", header: "Label",
  // @ts-expect-error Custom comparison is unavailable until sorting is implemented.
  compare: () => 0,
};
