export type InventoryRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unitPriceCents: number;
};

export type StockMovement = {
  id: string;
  itemId: string;
  occurredAt: string;
  quantityChange: number;
  reason: string;
};
