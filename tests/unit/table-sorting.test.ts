import { expect, test } from "vitest";
import { sortRows } from "@/components/data-table/processing";
import type { ColumnDef } from "@/types/table";

type Row = { id: string; value: number | null; when: Date; active: boolean };
const rows: readonly Row[] = Object.freeze([
  { id: "a", value: 20, when: new Date("2026-11-03T00:00:00Z"), active: true },
  { id: "b", value: null, when: new Date("invalid"), active: false },
  { id: "c", value: 10, when: new Date("2026-11-01T00:00:00Z"), active: false },
  { id: "d", value: 20, when: new Date("2026-11-02T00:00:00Z"), active: true },
  { id: "e", value: NaN, when: new Date("invalid"), active: false },
]);
const columns: readonly ColumnDef<Row>[] = [
  { id: "value", accessorKey: "value", header: "Value", sortable: true },
  { id: "when", accessorKey: "when", header: "When", sortable: true },
  { id: "active", accessorKey: "active", header: "Active", sortable: true },
  { id: "readonly", accessorKey: "id", header: "Read only" },
];

test("numeric sorting is stable, leaves missing values last in both directions, and restores input order", () => {
  expect(sortRows(rows, columns, { columnId: "value", direction: "asc" }).map(row => row.id))
    .toEqual(["c", "a", "d", "b", "e"]);
  expect(sortRows(rows, columns, { columnId: "value", direction: "desc" }).map(row => row.id))
    .toEqual(["a", "d", "c", "b", "e"]);
  expect(sortRows(rows, columns, null)).toEqual(rows);
  expect(rows.map(row => row.id)).toEqual(["a", "b", "c", "d", "e"]);
  expect(sortRows(rows, columns, { columnId: "unknown", direction: "desc" })).toEqual(rows);
  expect(sortRows(rows, columns, { columnId: "readonly", direction: "desc" })).toEqual(rows);
});

test("date, boolean, derived string and custom comparisons use the same stable missing-value rules", () => {
  expect(sortRows(rows, columns, { columnId: "when", direction: "asc" }).map(row => row.id))
    .toEqual(["c", "d", "a", "b", "e"]);
  expect(sortRows(rows, columns, { columnId: "active", direction: "asc" }).map(row => row.id))
    .toEqual(["b", "c", "e", "a", "d"]);
  const strings: readonly ColumnDef<Row>[] = [{
    id: "code", header: "Code", sortable: true,
    accessorFn: row => ({ a: "item 10", b: "Item 2", c: "item 1", d: "ITEM 2", e: undefined })[row.id]
  }];
  expect(sortRows(rows, strings, { columnId: "code", direction: "asc" }).map(row => row.id))
    .toEqual(["c", "b", "d", "a", "e"]);
  const custom: readonly ColumnDef<Row>[] = [{
    id: "value", accessorKey: "value", header: "Value",
    sortable: true, compare: (left, right) => (right.value ?? 0) - (left.value ?? 0)
  }];
  expect(sortRows(rows, custom, { columnId: "value", direction: "asc" }).map(row => row.id))
    .toEqual(["a", "d", "c", "b", "e"]);
});

test("finite numeric extremes retain their real order without subtraction overflow", () => {
  const extremes = [{ ...rows[0], id: "max", value: Number.MAX_VALUE },
  { ...rows[0], id: "min", value: -Number.MAX_VALUE }];
  expect(sortRows(extremes, columns, { columnId: "value", direction: "asc" }).map(row => row.id))
    .toEqual(["min", "max"]);
  expect(sortRows([...extremes].reverse(), columns, { columnId: "value", direction: "desc" }).map(row => row.id))
    .toEqual(["max", "min"]);
});
