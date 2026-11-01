import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { STUDIO_SETTINGS } from "@/config/studio";
import {
  loadClasses,
  loadInventory,
  loadStockMovements,
  queryInventory,
  resetMockFailures,
} from "@/mocks/services";

beforeEach(() => {
  vi.useFakeTimers();
  resetMockFailures();
});

afterEach(() => {
  vi.useRealTimers();
});

async function complete<T>(promise: Promise<T>): Promise<T> {
  await vi.advanceTimersByTimeAsync(500);
  return promise;
}

test("class fixtures have coherent inline bookings, unique IDs, and Singapore timestamps", async () => {
  const classes = await complete(loadClasses());

  expect(classes).toHaveLength(12);
  expect(new Set(classes.map(row => row.id)).size).toBe(classes.length);
  expect(STUDIO_SETTINGS).toMatchObject({
    timeZone: "Asia/Singapore", currency: "SGD", currencySymbol: "S$",
  });
  expect(classes.some(row => row.attendees.length === 0)).toBe(true);
  expect(classes.some(row => row.status === "full")).toBe(true);
  expect(classes.some(row => row.status === "cancelled")).toBe(true);

  for (const row of classes) {
    expect(row.startsAt).toMatch(/\+08:00$/);
    expect(Date.parse(row.endsAt)).toBeGreaterThan(Date.parse(row.startsAt));
    expect(row.bookedCount).toBeLessThanOrEqual(row.capacity);
    expect(row.bookedCount).toBe(row.attendees.filter(attendee =>
      attendee.bookingStatus === "booked" || attendee.bookingStatus === "checked-in",
    ).length);
    expect(new Set(row.attendees.map(attendee => attendee.id)).size)
      .toBe(row.attendees.length);
  }
});

test("inventory is sorted numerically before pagination without changing original order", async () => {
  const original = await complete(loadInventory());
  expect(original).toHaveLength(100);
  expect(new Set(original.map(row => row.id)).size).toBe(100);
  expect(original.every(row => Number.isInteger(row.unitPriceCents))).toBe(true);

  const expected = [...original].sort((left, right) => left.unitPriceCents - right.unitPriceCents);
  const page = await complete(queryInventory({
    sort: { columnId: "unitPriceCents", direction: "asc" },
    pagination: { pageIndex: 1, pageSize: 10 },
  }));
  expect(page.totalRows).toBe(100);
  expect(page.rows).toEqual(expected.slice(10, 20));

  const descending = await complete(queryInventory({
    sort: { columnId: "unitPriceCents", direction: "desc" },
    pagination: { pageIndex: 0, pageSize: 10 },
  }));
  expect(descending.rows.map(row => row.unitPriceCents))
    .toEqual([...original.map(row => row.unitPriceCents)].sort((a, b) => b - a).slice(0, 10));

  const unsorted = await complete(queryInventory({
    sort: null, pagination: { pageIndex: 0, pageSize: 10 },
  }));
  expect(unsorted.rows).toEqual(original.slice(0, 10));
});

test("invalid queries and empty scenarios return predictable rows and totals", async () => {
  const original = await complete(loadInventory());
  const invalid = await complete(queryInventory({
    sort: { columnId: "missing", direction: "asc" },
    pagination: { pageIndex: -1, pageSize: 0 },
  }));
  expect(invalid.rows).toEqual(original.slice(0, 10));

  const outOfRange = await complete(queryInventory({
    sort: null, pagination: { pageIndex: 100, pageSize: 10 },
  }));
  expect(outOfRange).toEqual({ rows: [], totalRows: 100 });

  const empty = await complete(queryInventory({
    sort: null, pagination: { pageIndex: 0, pageSize: 10 },
  }, { scenario: "empty" }));
  expect(empty).toEqual({ rows: [], totalRows: 0 });
  expect(await complete(loadClasses({ scenario: "empty" }))).toEqual([]);
});

test("lazy details belong to the requested item and support empty results", async () => {
  const movements = await complete(loadStockMovements("item-001"));
  expect(movements.length).toBeGreaterThan(0);
  expect(movements.every(row => row.itemId === "item-001")).toBe(true);
  expect(new Set(movements.map(row => row.id)).size).toBe(movements.length);
  expect(await complete(loadStockMovements("item-008"))).toEqual([]);
  expect(await complete(loadStockMovements("item-001", { scenario: "empty" }))).toEqual([]);
});

test("slow requests stay pending until the configured delay", async () => {
  const onResolved = vi.fn();
  const request = loadInventory({ scenario: "slow" }).then(onResolved);
  await vi.advanceTimersByTimeAsync(1_999);
  expect(onResolved).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(1);
  await request;
  expect(onResolved).toHaveBeenCalledOnce();
});

test("one-shot failures recover on retry without breaking independent requests", async () => {
  const failed = expect(loadInventory({ scenario: "error" }))
    .rejects.toThrow("Unable to load inventory");
  await vi.advanceTimersByTimeAsync(500);
  await failed;
  expect(await complete(loadInventory({ scenario: "error" }))).toHaveLength(100);

  const failedChild = expect(loadStockMovements("item-001", { scenario: "error" }))
    .rejects.toThrow("Unable to load stock movements");
  const independentParent = loadInventory();
  await vi.advanceTimersByTimeAsync(500);
  await failedChild;
  expect(await independentParent).toHaveLength(100);
  expect((await complete(loadStockMovements("item-001", { scenario: "error" }))).length)
    .toBeGreaterThan(0);

  resetMockFailures();
  const reset = expect(loadInventory({ scenario: "error" })).rejects.toThrow();
  await vi.advanceTimersByTimeAsync(500);
  await reset;
});

test("aborting prevents delivery and does not consume the recoverable failure", async () => {
  const controller = new AbortController();
  const aborted = expect(loadInventory({ scenario: "error", signal: controller.signal }))
    .rejects.toMatchObject({ name: "AbortError" });
  await vi.advanceTimersByTimeAsync(200);
  controller.abort();
  await aborted;
  await vi.advanceTimersByTimeAsync(2_000);

  const stillFails = expect(loadInventory({ scenario: "error" })).rejects.toThrow();
  await vi.advanceTimersByTimeAsync(500);
  await stillFails;

  const preAborted = new AbortController();
  preAborted.abort();
  await expect(loadClasses({ signal: preAborted.signal }))
    .rejects.toMatchObject({ name: "AbortError" });
});
