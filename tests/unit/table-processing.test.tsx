import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { DataTable } from "@/components/data-table/DataTable";
import type { ColumnDef } from "@/components/data-table/types";

type Row = { id: string; label: string; score: number | null };
const data: readonly Row[] = Object.freeze([
  { id: "a", label: "A", score: 40 }, { id: "b", label: "B", score: 10 },
  { id: "c", label: "C", score: 50 }, { id: "d", label: "D", score: 20 },
  { id: "e", label: "E", score: 20 }, { id: "f", label: "F", score: null },
]);
const columns: readonly ColumnDef<Row>[] = [
  { id: "label", accessorKey: "label", header: "Label", pinned: "left", width: 180, sortable: true },
  { id: "score", accessorKey: "score", header: "Score", sortable: true },
];
const base = { data, columns, getRowId: (row: Row) => row.id, datasetKey: "processing", caption: "Results" };
const labels = () => within(screen.getByRole("table", { name: "Results" }))
  .getAllByRole("row").slice(1).map(row => within(row).getAllByRole("cell")[0].textContent);

test("uncontrolled sort cycles over all rows before pagination and resets the page", async () => {
  const user = userEvent.setup();
  render(<DataTable {...base} pagination={{ defaultState: { pageIndex: 0, pageSize: 2 } }} />);
  expect(labels()).toEqual(["A", "B"]);
  const sort = screen.getByRole("button", { name: /^Sort by Score/ });
  await user.click(sort);
  expect(labels()).toEqual(["B", "D"]);
  expect(screen.getByRole("columnheader", { name: /Score/ })).toHaveAttribute("aria-sort", "ascending");
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(labels()).toEqual(["E", "A"]);
  await user.click(sort);
  expect(labels()).toEqual(["C", "A"]);
  expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  await user.click(sort);
  expect(labels()).toEqual(["A", "B"]);
  expect(screen.getByRole("columnheader", { name: /Score/ })).toHaveAttribute("aria-sort", "none");
  await user.click(screen.getByRole("button", { name: "Next page" }));
  await user.selectOptions(screen.getByRole("combobox", { name: "Rows per page" }), "25");
  expect(labels()).toEqual(["A", "B", "C", "D", "E", "F"]);
  expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
});

test("controlled client state emits complete changes and waits for parent props", async () => {
  const onSort = vi.fn();
  const onPage = vi.fn();
  const { rerender } = render(<DataTable {...base}
    sorting={{ state: null, onChange: onSort }}
    pagination={{ state: { pageIndex: 1, pageSize: 2 }, onChange: onPage }} />);
  expect(onSort).not.toHaveBeenCalled();
  expect(onPage).not.toHaveBeenCalled();
  expect(labels()).toEqual(["C", "D"]);
  await userEvent.setup().click(screen.getByRole("button", { name: /^Sort by Score/ }));
  expect(onSort).toHaveBeenLastCalledWith({ columnId: "score", direction: "asc" });
  expect(onPage).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 2 });
  expect(labels()).toEqual(["C", "D"]);
  rerender(<DataTable {...base}
    sorting={{ state: { columnId: "score", direction: "asc" }, onChange: onSort }}
    pagination={{ state: { pageIndex: 0, pageSize: 2 }, onChange: onPage }} />);
  expect(labels()).toEqual(["B", "D"]);
});

test("manual processing renders supplied order/page unchanged and emits navigation", async () => {
  const onSort = vi.fn();
  const onPage = vi.fn();
  render(<DataTable {...base} data={[data[5], data[0]]}
    sorting={{ mode: "manual", state: { columnId: "score", direction: "asc" }, onChange: onSort }}
    pagination={{ mode: "manual", totalRows: 8, state: { pageIndex: 2, pageSize: 2 }, onChange: onPage }} />);
  expect(labels()).toEqual(["F", "A"]);
  expect(screen.getByText("Page 3 of 4")).toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole("button", { name: "Next page" }));
  expect(onPage).toHaveBeenLastCalledWith({ pageIndex: 3, pageSize: 2 });
  expect(labels()).toEqual(["F", "A"]);
});

test("uncontrolled pages clamp when data shrinks without resurrecting the old page on growth", () => {
  const onChange = vi.fn();
  const pagination = { defaultState: { pageIndex: 2, pageSize: 2 }, onChange };
  const { rerender } = render(<DataTable {...base} pagination={pagination} />);
  expect(labels()).toEqual(["E", "F"]);
  rerender(<DataTable {...base} data={data.slice(0, 1)} pagination={pagination} />);
  expect(labels()).toEqual(["A"]);
  rerender(<DataTable {...base} pagination={pagination} />);
  expect(labels()).toEqual(["A", "B"]);
  expect(onChange).not.toHaveBeenCalled();
});

test("invalid controlled input normalizes without render callbacks and empty/loading controls disable", () => {
  const onSort = vi.fn();
  const onPage = vi.fn();
  const props = { ...base,
    sorting: { state: { columnId: "missing", direction: "asc" as const }, onChange: onSort },
    pagination: { state: { pageIndex: 999, pageSize: 0 }, pageSizes: [0, 25, 25, NaN], onChange: onPage },
  };
  const { rerender } = render(<DataTable {...props} />);
  expect(labels()).toEqual(["A", "B", "C", "D", "E", "F"]);
  expect(onSort).not.toHaveBeenCalled();
  expect(onPage).not.toHaveBeenCalled();
  expect(screen.getByRole("combobox", { name: "Rows per page" })).toHaveValue("10");
  rerender(<DataTable {...props} data={[]} />);
  expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  expect(screen.getByRole("combobox", { name: "Rows per page" })).toBeDisabled();
  rerender(<DataTable {...props} request={{ status: "loading" }} />);
  expect(screen.getByRole("button", { name: /^Sort by Score/ })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
});

test("manual ordering can use client pagination and sorting can be disabled independently", () => {
  const { rerender } = render(<DataTable {...base} data={[...data].reverse()}
    sorting={{ mode: "manual", state: { columnId: "score", direction: "asc" }, onChange: () => {} }}
    pagination={{ defaultState: { pageIndex: 1, pageSize: 2 } }} />);
  expect(labels()).toEqual(["D", "C"]);
  rerender(<DataTable {...base} sorting={false} pagination={false} />);
  expect(labels()).toEqual(["A", "B", "C", "D", "E", "F"]);
  expect(screen.queryByRole("button", { name: /^Sort by/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
});

test("invalid untyped manual configurations fail explicitly instead of showing misleading results", () => {
  expect(() => {
    // @ts-expect-error Intentionally simulate a JavaScript caller sorting a partial server page.
    render(<DataTable {...base} sorting={{ mode: "client" }} pagination={{ mode: "manual", totalRows: 100, state: { pageIndex: 0, pageSize: 10 }, onChange: () => {} }} />);
  }).toThrow("Manual pagination requires manual or disabled sorting");

  expect(() => {
    // @ts-expect-error Intentionally simulate a JavaScript caller omitting required server metadata.
    render(<DataTable {...base} sorting={false} pagination={{ mode: "manual", state: { pageIndex: 0, pageSize: 10 }, onChange: () => {} }} />);
  }).toThrow("Manual pagination requires a non-negative integer totalRows");
});
