import type { InventoryRow, StockMovement } from "@/features/demo/types";
import type { ClassRow } from "@/features/timetable/types";
import { readClasses, readInventory, readStockMovements } from "./data";
import { mockRequest } from "./request";
import type { ListQuery, MockContext, PageResult } from "./types";

export { resetMockFailures } from "./request";

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const sortColumns: readonly {
  id: string;
  value: (row: InventoryRow) => string | number;
}[] = [
  { id: "name", value: row => row.name },
  { id: "sku", value: row => row.sku },
  { id: "category", value: row => row.category },
  { id: "stock", value: row => row.stock },
  { id: "unitPriceCents", value: row => row.unitPriceCents },
];

export function loadClasses(context: MockContext = {}): Promise<readonly ClassRow[]> {
  return mockRequest("classes", "Unable to load classes. Please retry.",
    () => context.scenario === "empty" ? [] : readClasses(), context);
}

export function loadInventory(context: MockContext = {}): Promise<readonly InventoryRow[]> {
  return mockRequest("inventory", "Unable to load inventory. Please retry.",
    () => context.scenario === "empty" ? [] : readInventory(), context);
}

export function queryInventory(
  query: ListQuery,
  context: MockContext = {},
): Promise<PageResult<InventoryRow>> {
  // Capture the request parameters; later caller changes cannot alter this request.
  const sort = query.sort ? { ...query.sort } : null;
  const { pageIndex, pageSize } = query.pagination;

  return mockRequest("inventory", "Unable to load inventory. Please retry.", () => {
    const rows = context.scenario === "empty" ? [] : readInventory();
    const column = sortColumns.find(candidate => candidate.id === sort?.columnId);

    if (column && sort && (sort.direction === "asc" || sort.direction === "desc")) {
      const direction = sort.direction === "asc" ? 1 : -1;
      rows.sort((left, right) => {
        const a = column.value(left);
        const b = column.value(right);
        const compared = typeof a === "number" && typeof b === "number"
          ? a - b : collator.compare(String(a), String(b));
        return compared * direction;
      });
    }

    const size = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 10;
    const index = Number.isSafeInteger(pageIndex) && pageIndex >= 0 ? pageIndex : 0;
    return {
      rows: rows.slice(index * size, (index + 1) * size),
      totalRows: rows.length,
    };
  }, context);
}

export function loadStockMovements(
  itemId: string,
  context: MockContext = {},
): Promise<readonly StockMovement[]> {
  return mockRequest(`stock-movements:${itemId}`,
    "Unable to load stock movements. Please retry.",
    () => context.scenario === "empty" ? [] : readStockMovements(itemId), context);
}
