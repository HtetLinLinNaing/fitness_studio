import type { ColumnDef } from "@/types/table";
import type { InventoryRow } from "@/types/inventory";

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
      <strong className="text-sm leading-normal font-semibold text-[#193b2b]">
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
        className="font-semibold tabular-nums data-[empty=true]:text-[#8b362d]"
        data-empty={row.stock === 0}
      >
        {row.stock}{" "}
        <span className="text-xs font-normal text-[#52685a]">units</span>
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
      <span className="font-semibold tabular-nums">
        S{currency.format(row.unitPriceCents / 100)}
      </span>
    ),
  },
];
