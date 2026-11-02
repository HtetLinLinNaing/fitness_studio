"use client";

import { DataTable } from "@/components/data-table/DataTable";
import type { ProcessingConfig, ExpansionConfig } from "@/types/table";
import { StudioPage } from "@/components/StudioPage";
import { SectionCard } from "@/components/SectionCard";
import { loadStockMovements } from "@/mocks/services";
import { InventoryControls } from "./InventoryControls";
import { inventoryColumns } from "./inventory-columns";
import { StockMovementList } from "./StockMovementList";
import type { InventoryRow, StockMovement } from "@/types/inventory";
import { useInventory } from "./use-inventory";

const getRowId = (row: InventoryRow) => row.id;

export function Inventory() {
  const inventory = useInventory();
  const processing: ProcessingConfig =
    inventory.mode === "manual"
      ? {
          sorting: {
            mode: "manual",
            state: inventory.query.sort,
            onChange: inventory.changeSort,
          },
          pagination: {
            mode: "manual",
            state: inventory.query.pagination,
            onChange: inventory.changePage,
            totalRows: inventory.totalRows,
          },
        }
      : {
          sorting: {
            mode: "client",
            state: inventory.query.sort,
            onChange: inventory.changeSort,
          },
          pagination: {
            mode: "client",
            state: inventory.query.pagination,
            onChange: inventory.changePage,
          },
        };
  const expansion: ExpansionConfig<InventoryRow, StockMovement> = {
    mode: "lazy",
    emptyMessage: "No stock movements",
    getLabel: (row, expanded) =>
      `${expanded ? "Collapse" : "Expand"} ${row.name} stock movements`,
    loadChildren: (row, { signal }) =>
      loadStockMovements(row.id, { signal, scenario: inventory.childScenario }),
    renderChildren: ({ row, children }) => (
      <StockMovementList itemName={row.name} movements={children} />
    ),
  };
  return (
    <StudioPage
      title="Inventory"
      context="Equipment, products & supplies"
      summary="100 sample items · Expand an item to view stock history"
      footnote="Sample inventory · Fictional studio data"
    >
      <InventoryControls
        mode={inventory.mode}
        listScenario={inventory.listScenario}
        childScenario={inventory.childScenario}
        changeMode={inventory.changeMode}
        changeListScenario={inventory.changeListScenario}
        changeChildScenario={inventory.changeChildScenario}
        reset={inventory.reset}
      />
      <SectionCard
        titleId="inventory-title"
        title="Studio inventory"
        description="Prices in S$ · 100 sample items"
      >
        <DataTable<InventoryRow, StockMovement>
          caption="Studio inventory"
          datasetKey={inventory.datasetKey}
          data={inventory.rows}
          columns={inventoryColumns}
          getRowId={getRowId}
          request={inventory.request}
          emptyMessage="No inventory items available."
          expansion={expansion}
          {...processing}
        />
      </SectionCard>
    </StudioPage>
  );
}
