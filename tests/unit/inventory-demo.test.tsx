import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { useInventoryDemo } from "@/features/demo/use-inventory-demo";
import { loadInventory, queryInventory } from "@/mocks/services";
import type { InventoryRow } from "@/features/demo/types";

vi.mock("@/mocks/services", () => ({
  loadInventory: vi.fn(), queryInventory: vi.fn(), resetMockFailures: vi.fn(),
}));
const rows: InventoryRow[] = Array.from({ length: 100 }, (_, i) => ({
  id: `item-${i}`, name: `Item ${i}`, sku: `SKU-${i}`, category: "Equipment", stock: i, unitPriceCents: 2800,
}));
beforeEach(() => {
  vi.mocked(loadInventory).mockReset().mockResolvedValue(rows);
  vi.mocked(queryInventory).mockReset().mockImplementation(async query => ({
    rows: rows.slice(query.pagination.pageIndex * query.pagination.pageSize,
      (query.pagination.pageIndex + 1) * query.pagination.pageSize), totalRows: 100,
  }));
});

test("client data stays complete, controlled sort resets page, manual mode supplies only one page", async () => {
  const { result } = renderHook(() => useInventoryDemo());
  await waitFor(() => expect(result.current.rows).toHaveLength(100));
  act(() => result.current.changePage({ pageIndex: 3, pageSize: 10 }));
  expect(result.current.rows).toHaveLength(100);
  act(() => result.current.changeSort({ columnId: "stock", direction: "desc" }));
  expect(result.current.query.pagination.pageIndex).toBe(0);
  act(() => result.current.changePage({ pageIndex: 2, pageSize: 10 }));
  act(() => result.current.changeMode("manual"));
  await waitFor(() => expect(result.current.request.status).toBe("ready"));
  expect(result.current.rows).toHaveLength(10);
  expect(result.current.totalRows).toBe(100);
  expect(result.current.query.sort).toEqual({ columnId: "stock", direction: "desc" });
  expect(result.current.query.pagination.pageIndex).toBe(0);
  act(() => result.current.changePage({ pageIndex: 2, pageSize: 10 }));
  await waitFor(() => expect(result.current.rows[0]?.id).toBe("item-20"));
  act(() => result.current.changePage({ pageIndex: 2, pageSize: 25 }));
  expect(result.current.query.pagination.pageIndex).toBe(0);
});

test("a cancelled loader that resolves late cannot overwrite the latest scenario", async () => {
  let complete!: (value: readonly InventoryRow[]) => void;
  vi.mocked(loadInventory).mockReturnValueOnce(new Promise(resolve => { complete = resolve; }));
  const { result, unmount } = renderHook(() => useInventoryDemo());
  const oldSignal = vi.mocked(loadInventory).mock.calls[0][0]?.signal;
  const oldKey = result.current.datasetKey;
  vi.mocked(loadInventory).mockResolvedValueOnce([]);
  act(() => result.current.changeListScenario("empty"));
  expect(oldSignal?.aborted).toBe(true);
  expect(result.current.datasetKey).not.toBe(oldKey);
  await waitFor(() => expect(result.current.request.status).toBe("ready"));
  await act(async () => complete(rows));
  expect(result.current.rows).toHaveLength(0);
  const key = result.current.datasetKey;
  act(() => result.current.changeChildScenario("error"));
  expect(result.current.datasetKey).not.toBe(key);
  act(() => result.current.reset());
  expect(result.current.childScenario).toBe("normal");
  expect(result.current.listScenario).toBe("normal");
  unmount();
});

test("retry preserves the manual query and shrinking totals refetch the valid page", async () => {
  const { result } = renderHook(() => useInventoryDemo());
  await waitFor(() => expect(result.current.request.status).toBe("ready"));
  act(() => result.current.changeMode("manual"));
  await waitFor(() => expect(result.current.request.status).toBe("ready"));
  vi.mocked(queryInventory).mockRejectedValueOnce(new Error("Network unavailable"));
  act(() => result.current.changePage({ pageIndex: 4, pageSize: 10 }));
  await waitFor(() => expect(result.current.request.status).toBe("error"));
  vi.mocked(queryInventory).mockResolvedValueOnce({ rows: [], totalRows: 12 });
  vi.mocked(queryInventory).mockResolvedValueOnce({ rows: rows.slice(10, 12), totalRows: 12 });
  act(() => { if (result.current.request.status === "error") result.current.request.onRetry(); });
  expect(result.current.query.pagination.pageIndex).toBe(4);
  await waitFor(() => expect(result.current.rows[0]?.id).toBe("item-10"));
  expect(result.current.query.pagination.pageIndex).toBe(1);
  expect(result.current.totalRows).toBe(12);
});
