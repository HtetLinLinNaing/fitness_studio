import type { InventoryRow, StockMovement } from "@/features/demo/types";
import type { ClassRow } from "@/features/timetable/types";
import classesJson from "./data/classes.json";
import inventoryJson from "./data/inventory.json";
import movementsJson from "./data/stock-movements.json";

function enumValue<T extends string>(value: string, allowed: readonly T[]): T {
  const match = allowed.find(candidate => candidate === value);
  if (match === undefined) {
    throw new Error(`Invalid mock fixture value: ${value}`);
  }
  return match;
}

// JSON imports widen string literals. Validate those fields rather than casting.
const classes: readonly ClassRow[] = classesJson.map(row => ({
  ...row,
  status: enumValue(row.status, ["scheduled", "full", "cancelled"] as const),
  attendees: row.attendees.map(attendee => ({
    ...attendee,
    paymentType: enumValue(attendee.paymentType, ["one-time", "package", "membership"] as const),
    bookingStatus: enumValue(attendee.bookingStatus,
      ["booked", "checked-in", "cancelled", "no-show"] as const),
  })),
}));
const inventory: readonly InventoryRow[] = inventoryJson;
const movements: readonly StockMovement[] = movementsJson;

export function readClasses(): ClassRow[] {
  return classes.map(row => ({
    ...row,
    attendees: row.attendees.map(attendee => ({ ...attendee })),
  }));
}

export function readInventory(): InventoryRow[] {
  return inventory.map(row => ({ ...row }));
}

export function readStockMovements(itemId: string): StockMovement[] {
  return movements.filter(row => row.itemId === itemId).map(row => ({ ...row }));
}
