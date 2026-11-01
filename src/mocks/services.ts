import type { InventoryRow, StockMovement } from "@/types/inventory";
import type { Attendee, ClassRow } from "@/types/timetable";
import type { SortState } from "@/types/table";
import classesJson from "./data/classes.json";
import inventoryJson from "./data/inventory.json";
import movementsJson from "./data/stock-movements.json";
import { simulateRequest } from "./request";
import type { ListQuery, MockContext, PageResult } from "@/types/mock";

export { resetMockFailures } from "./request";

// JSON imports widen status strings. These owned fixtures are checked in tests.
const classFixtures = classesJson as readonly ClassRow[];

const inventorySortFields = [
  "name",
  "sku",
  "category",
  "stock",
  "unitPriceCents",
] as const;
const textComparison = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

function sortInventory(rows: InventoryRow[], sort: SortState): void {
  if (!sort) return;

  const field = inventorySortFields.find((field) => field === sort.columnId);
  if (!field || (sort.direction !== "asc" && sort.direction !== "desc")) return;

  const direction = sort.direction === "asc" ? 1 : -1;
  rows.sort((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * direction;
    }

    return (
      textComparison.compare(String(leftValue), String(rightValue)) * direction
    );
  });
}

export async function loadClasses(
  context: MockContext = {},
): Promise<readonly ClassRow[]> {
  await simulateRequest(
    "classes",
    "Unable to load classes. Please retry.",
    context,
  );
  if (context.scenario === "empty") return [];

  // Return independent records so callers cannot change the shared fixtures.
  return structuredClone(classFixtures);
}

export async function loadAttendees(
  classId: string,
  context: MockContext = {},
): Promise<readonly Attendee[]> {
  await simulateRequest(
    `attendees:${classId}`,
    "Unable to load attendees. Please retry.",
    context,
  );
  if (context.scenario === "empty") return [];

  const selectedClass = classFixtures.find((row) => row.id === classId);
  if (!selectedClass) return [];

  return structuredClone(selectedClass.attendees);
}

export async function loadInventory(
  context: MockContext = {},
): Promise<readonly InventoryRow[]> {
  await simulateRequest(
    "inventory",
    "Unable to load inventory. Please retry.",
    context,
  );
  if (context.scenario === "empty") return [];

  return structuredClone(inventoryJson);
}

export async function queryInventory(
  query: ListQuery,
  context: MockContext = {},
): Promise<PageResult<InventoryRow>> {
  // Keep this request's parameters even if its caller changes the query while waiting.
  const sort = query.sort ? { ...query.sort } : null;
  const { pageIndex, pageSize } = query.pagination;

  await simulateRequest(
    "inventory",
    "Unable to load inventory. Please retry.",
    context,
  );
  if (context.scenario === "empty") return { rows: [], totalRows: 0 };

  const rows = structuredClone(inventoryJson);
  sortInventory(rows, sort);

  const size = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 10;
  const index =
    Number.isSafeInteger(pageIndex) && pageIndex >= 0 ? pageIndex : 0;
  const start = index * size;

  return {
    rows: rows.slice(start, start + size),
    totalRows: rows.length,
  };
}

export async function loadStockMovements(
  itemId: string,
  context: MockContext = {},
): Promise<readonly StockMovement[]> {
  await simulateRequest(
    `stock-movements:${itemId}`,
    "Unable to load stock movements. Please retry.",
    context,
  );
  if (context.scenario === "empty") return [];

  const movements = movementsJson.filter((row) => row.itemId === itemId);
  return structuredClone(movements);
}
