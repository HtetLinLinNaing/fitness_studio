import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { DataTable } from "@/components/data-table/DataTable";
import type { ColumnDef } from "@/types/table";

type Sample = { id: string; label: string; amount: number };
const data: readonly Sample[] = [{ id: "sample-1", label: "Balance pad", amount: 3500 }];
const columns: readonly ColumnDef<Sample>[] = [
  { id: "label", accessorKey: "label", header: "Product", pinned: "left", width: 180 },
  {
    id: "price", accessorFn: row => row.amount / 100, header: "Price",
    cell: ({ row }) => `S$${(row.amount / 100).toFixed(2)}`
  },
];
const base = { data, columns, getRowId: (row: Sample) => row.id, datasetKey: "samples", caption: "Sample inventory" };

test("generic column definitions render semantic headers and typed custom cells", () => {
  render(<DataTable {...base} />);
  const table = screen.getByRole("table", { name: "Sample inventory" });
  expect(within(table).getByRole("columnheader", { name: "Product" })).toBeInTheDocument();
  expect(within(table).getByRole("cell", { name: "Balance pad" })).toBeInTheDocument();
  expect(within(table).getByRole("cell", { name: "S$35.00" })).toBeInTheDocument();
  const region = screen.getByRole("region", { name: "Sample inventory, scrollable table" });
  fireEvent.scroll(region, { target: { scrollLeft: 80 } });
  expect(region).toHaveAttribute("data-scrolled", "true");
});

test("loading replaces stale data with column-matched skeletons and ready empty data has a clear message", () => {
  const { rerender } = render(<DataTable {...base} />);
  rerender(<DataTable {...base} request={{ status: "loading", skeletonRows: 2 }} />);
  const table = screen.getByRole("table", { name: "Sample inventory" });
  expect(table).toHaveAttribute("aria-busy", "true");
  expect(screen.queryByText("Balance pad")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Loading sample inventory");
  expect(table.querySelectorAll("tbody tr")).toHaveLength(2);
  expect(table.querySelector("tbody tr")?.querySelectorAll("td")).toHaveLength(2);

  rerender(<DataTable {...base} data={[]} emptyMessage="No equipment available." />);
  expect(screen.getByText("No equipment available.")).toBeInTheDocument();
  expect(table).toHaveAttribute("aria-busy", "false");
});

test("an accessible error preserves the supplied retry action", async () => {
  const onRetry = vi.fn();
  render(<DataTable {...base} request={{ status: "error", message: "Inventory could not load.", onRetry }} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Inventory could not load.");
  expect(screen.queryByText("Balance pad")).not.toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole("button", { name: "Retry" }));
  expect(onRetry).toHaveBeenCalledOnce();
});

test("a larger dataset sorts globally while rendering only the current parent page", async () => {
  const rows = Array.from({ length: 5000 }, (_, index) => ({
    id: `stress-${index}`, label: `Item ${5000 - index}`, amount: index,
  }));
  render(<DataTable {...base} data={rows} columns={[
    { id: "label", accessorKey: "label", header: "Product", sortable: true },
  ]} />);
  const table = screen.getByRole("table", { name: "Sample inventory" });
  expect(table.querySelectorAll("tbody > tr[data-parent-row]")).toHaveLength(10);
  await userEvent.setup().click(screen.getByRole("button", { name: /^Sort by Product/ }));
  expect(table.querySelector("tbody > tr > td")).toHaveTextContent(/^Item 1$/);
  await userEvent.setup().click(screen.getByRole("button", { name: "Next page" }));
  expect(table.querySelector("tbody > tr > td")).toHaveTextContent(/^Item 11$/);
  expect(table.querySelectorAll("tbody > tr[data-parent-row]")).toHaveLength(10);
  expect(screen.getByText("11–20 of 5000")).toBeInTheDocument();
});
