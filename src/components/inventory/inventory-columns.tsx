import type { ColumnDef } from "@/types/table";
import type { InventoryRow } from "@/types/inventory";
import styles from "./Inventory.module.css";

const currency = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  currencyDisplay: "narrowSymbol",
});
export const inventoryColumns: readonly ColumnDef<InventoryRow>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Item",
    pinned: "left",
    width: 220,
    sortable: true,
    cell: ({ row }) => (
      <strong className={styles.itemName}>
        {row.name}
      </strong>
    ),
  },
  { id: "sku", accessorKey: "sku", header: "SKU", width: 150, sortable: true },
  {
    id: "category",
    accessorKey: "category",
    header: "Category",
    width: 150,
    sortable: true,
  },
  {
    id: "stock",
    accessorKey: "stock",
    header: "Stock",
    width: 120,
    sortable: true,
    cell: ({ row }) => (
      <span
        className={styles.stock}
        data-empty={row.stock === 0}
      >
        {row.stock}{" "}
        <span className={styles.units}>units</span>
      </span>
    ),
  },
  {
    id: "unitPriceCents",
    accessorKey: "unitPriceCents",
    header: "Unit price",
    width: 140,
    sortable: true,
    cell: ({ row }) => (
      <span className={styles.price}>
        S{currency.format(row.unitPriceCents / 100)}
      </span>
    ),
  },
];
