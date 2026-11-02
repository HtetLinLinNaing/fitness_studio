import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { DataTable } from "@/components/data-table/DataTable";
import type { ColumnDef, ExpansionConfig } from "@/types/table";

type Receipt = { token: string };
type Row = { id: string; label: string; receipts: readonly Receipt[] };
const data: readonly Row[] = [
  { id: "a", label: "Alpha", receipts: [{ token: "Receipt A" }] },
  { id: "b", label: "Beta", receipts: [] },
  { id: "c", label: "Gamma", receipts: [] },
];
const columns: readonly ColumnDef<Row>[] = [
  { id: "label", accessorKey: "label", header: "Label", sortable: true },
];
const base = {
  data,
  columns,
  caption: "Receipts",
  datasetKey: "receipts",
  getRowId: (row: Row) => row.id
};
const presentation = {
  renderChildren: ({ children }: { children: readonly Receipt[] }) => (
    <ul>
      {children.map(child => <li key={child.token}>{child.token}</li>)}
    </ul>
  ),
  emptyMessage: "No receipt records",
  getLabel: (row: Row, expanded: boolean) => `${expanded ? "Collapse" : "Expand"} ${row.label}`,
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

test("inline details keep record identity through sorting/paging and do not count as parent rows", async () => {
  const user = userEvent.setup();
  render(<DataTable<Row, Receipt>
    {...base}
    pagination={{ defaultState: { pageIndex: 0, pageSize: 2 } }}
    expansion={{
      ...presentation,
      mode: "inline",
      getChildren: row => row.receipts,
      canExpand: row => row.id !== "c"
    }}
  />);
  await user.click(screen.getByRole("button", { name: "Expand Alpha" }));
  expect(screen.getByText("Receipt A")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Expand Beta" }));
  expect(screen.getByText("No receipt records")).toBeVisible();
  expect(screen.getByText("1–2 of 3")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /^Sort by Label/ }));
  await user.click(screen.getByRole("button", { name: /^Sort by Label/ }));
  expect(screen.queryByRole("button", { name: "Expand Gamma" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getByRole("button", { name: "Collapse Alpha" })).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Receipt A")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Collapse Alpha" }));
  expect(screen.getByRole("button", { name: "Expand Alpha" })).toHaveAttribute("aria-expanded", "false");
  await waitFor(() => expect(screen.queryByText("Receipt A")).not.toBeInTheDocument());
});

test("lazy loading deduplicates collapse/reopen, caches completion, and never reopens a collapsed row", async () => {
  const user = userEvent.setup();
  const pending = deferred<readonly Receipt[]>();
  const loadChildren = vi.fn(() => pending.promise);
  render(<DataTable<Row, Receipt>
    {...base}
    expansion={{ ...presentation, mode: "lazy", loadChildren }}
  />);
  expect(loadChildren).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Expand Alpha" }));
  expect(screen.getByText("Loading details…")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Collapse Alpha" }));
  await user.click(screen.getByRole("button", { name: "Expand Alpha" }));
  expect(loadChildren).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("button", { name: "Collapse Alpha" }));
  await act(async () => pending.resolve([{ token: "Lazy receipt" }]));
  expect(screen.getByRole("button", { name: "Expand Alpha" })).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Expand Alpha" }));
  expect(screen.getByText("Lazy receipt")).toBeVisible();
  expect(loadChildren).toHaveBeenCalledOnce();
});

test("row failures retry independently while another row loads; successful empty results are cached", async () => {
  const user = userEvent.setup();
  const beta = deferred<readonly Receipt[]>();
  let alphaAttempts = 0;
  const loadChildren = vi.fn((row: Row) => {
    if (row.id === "b") return beta.promise;
    if (alphaAttempts++ === 0) throw new Error("Alpha details failed.");
    return Promise.resolve([{ token: "Recovered receipt" }]);
  });
  render(<DataTable<Row, Receipt>
    {...base}
    expansion={{ ...presentation, mode: "lazy", loadChildren }}
  />);
  await user.click(screen.getByRole("button", { name: "Expand Alpha" }));
  const error = await screen.findByRole("alert");
  expect(error).toHaveTextContent("Alpha details failed.");
  await user.click(screen.getByRole("button", { name: "Expand Beta" }));
  expect(screen.getByText("Loading details…")).toBeVisible();
  expect(screen.getByRole("button", { name: /^Sort by Label/ })).toBeEnabled();
  await user.click(within(error).getByRole("button", { name: "Retry details" }));
  expect(await screen.findByText("Recovered receipt")).toBeVisible();
  expect(screen.getByText("Loading details…")).toBeVisible();
  await act(async () => beta.resolve([]));
  expect(screen.getByText("No receipt records")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Collapse Beta" }));
  await user.click(screen.getByRole("button", { name: "Expand Beta" }));
  expect(loadChildren.mock.calls.filter(([row]) => row.id === "b")).toHaveLength(1);
});

test("dataset replacement aborts old loads and ignores their late results for reused row IDs", async () => {
  const user = userEvent.setup();
  const old = deferred<readonly Receipt[]>();
  const current = deferred<readonly Receipt[]>();
  const loadChildren = vi.fn<NonNullable<Extract<ExpansionConfig<Row, Receipt>, { mode: "lazy" }>["loadChildren"]>>()
    .mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
  const expansion: ExpansionConfig<Row, Receipt> = { ...presentation, mode: "lazy", loadChildren };
  const { rerender } = render(<DataTable<Row, Receipt> {...base} expansion={expansion} />);
  await user.click(screen.getByRole("button", { name: "Expand Alpha" }));
  const oldSignal = loadChildren.mock.calls[0][1].signal;
  rerender(<DataTable<Row, Receipt> {...base} datasetKey="replacement" expansion={expansion} />);
  expect(oldSignal.aborted).toBe(true);
  await user.click(screen.getByRole("button", { name: "Expand Alpha" }));
  await act(async () => old.resolve([{ token: "Stale receipt" }]));
  expect(screen.queryByText("Stale receipt")).not.toBeInTheDocument();
  await act(async () => current.resolve([{ token: "Current receipt" }]));
  expect(screen.getByText("Current receipt")).toBeVisible();
});
