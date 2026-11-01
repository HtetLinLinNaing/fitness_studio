import type { ColumnDef, PaginationState, SortState } from "@/types/table";

const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});
type Scalar = string | number | boolean;

export function resolveSort<T>(
  value: SortState,
  columns: readonly ColumnDef<T>[],
): SortState {
  return value &&
    (value.direction === "asc" || value.direction === "desc") &&
    columns.some((column) => column.id === value.columnId && column.sortable)
    ? value
    : null;
}

function comparable(value: unknown): Scalar | null {
  if (value instanceof Date)
    return Number.isFinite(value.getTime()) ? value.getTime() : null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  return typeof value === "string" || typeof value === "boolean" ? value : null;
}

function compareScalars(left: Scalar, right: Scalar): number {
  if (typeof left === "number" && typeof right === "number") {
    return left < right ? -1 : left > right ? 1 : 0;
  }
  if (typeof left === "boolean" && typeof right === "boolean")
    return Number(left) - Number(right);
  return collator.compare(String(left), String(right));
}

export function sortRows<T>(
  data: readonly T[],
  columns: readonly ColumnDef<T>[],
  state: SortState,
): readonly T[] {
  const sort = resolveSort(state, columns);
  const column =
    sort && columns.find((candidate) => candidate.id === sort.columnId);
  if (!sort || !column) return data;
  const direction = sort.direction === "asc" ? 1 : -1;
  return data
    .map((row, index) => ({
      row,
      index,
      value: comparable(
        column.accessorFn ? column.accessorFn(row) : row[column.accessorKey],
      ),
    }))
    .sort((left, right) => {
      if (left.value === null)
        return right.value === null ? left.index - right.index : 1;
      if (right.value === null) return -1;
      const comparison = column.compare
        ? column.compare(left.row, right.row)
        : compareScalars(left.value, right.value);
      return (
        (Number.isFinite(comparison) ? comparison * direction : 0) ||
        left.index - right.index
      );
    })
    .map((entry) => entry.row);
}

export function validPageSize(value: number): number {
  return Number.isSafeInteger(value) && value > 0 ? value : 10;
}

export function validTotal(value: number): number {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function normalizePage(
  value: PaginationState,
  totalRows: number,
): PaginationState {
  const pageSize = validPageSize(value.pageSize);
  const index =
    Number.isSafeInteger(value.pageIndex) && value.pageIndex >= 0
      ? value.pageIndex
      : 0;
  return {
    pageIndex: Math.min(
      index,
      Math.max(0, Math.ceil(totalRows / pageSize) - 1),
    ),
    pageSize,
  };
}

export function pageSizes(
  options: readonly number[] | undefined,
  selected: number,
): number[] {
  return [
    ...new Set([
      ...(options ?? [10, 25, 50]).filter(
        (value) => Number.isSafeInteger(value) && value > 0,
      ),
      selected,
    ]),
  ].sort((a, b) => a - b);
}
