import type { ColumnDef } from "@/types/table";

const DEFAULT_COLUMN_WIDTH = 160;

export type ColumnLayout<T> = {
  column: ColumnDef<T>;
  width: number;
  pinned: boolean;
  left: number;
  edge: boolean;
};

/** Put pinned columns first and calculate their sticky offsets once. */
export function createColumnLayout<T>(columns: readonly ColumnDef<T>[]) {
  if (columns.length === 0) {
    throw new Error("DataTable requires at least one column.");
  }

  const pinnedColumns = columns.filter((column) => column.pinned === "left");
  const otherColumns = columns.filter((column) => column.pinned !== "left");
  const orderedColumns = [...pinnedColumns, ...otherColumns];
  const columnIds = new Set<string>();
  let pinnedWidth = 0;

  const cells: ColumnLayout<T>[] = orderedColumns.map((column, index) => {
    if (!column.id || columnIds.has(column.id)) {
      throw new Error("DataTable column IDs must be unique and non-empty.");
    }
    columnIds.add(column.id);

    const hasValidWidth =
      Number.isFinite(column.width) && (column.width ?? 0) > 0;
    const width = hasValidWidth ? column.width! : DEFAULT_COLUMN_WIDTH;
    if (
      column.width !== undefined &&
      !hasValidWidth &&
      process.env.NODE_ENV !== "production"
    ) {
      console.warn(`Invalid width for column ${column.id}; using 160px.`);
    }

    const pinned = column.pinned === "left";
    const left = pinnedWidth;
    if (pinned) pinnedWidth += width;

    return {
      column,
      width,
      pinned,
      left,
      edge: pinned && index === pinnedColumns.length - 1,
    };
  });

  return {
    cells,
    pinnedWidth,
    totalWidth: cells.reduce((sum, cell) => sum + cell.width, 0),
    unpinnedWidth: cells
      .filter((cell) => !cell.pinned)
      .reduce((sum, cell) => sum + cell.width, 0),
  };
}
