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
import { useInventoryDemo } from "./use-inventory-demo";

const getRowId = (row: InventoryRow) => row.id;

export function InventoryDemo() {
  const demo = useInventoryDemo();
  const processing: ProcessingConfig =
    demo.mode === "manual"
      ? {
          sorting: {
            mode: "manual",
            state: demo.query.sort,
            onChange: demo.changeSort,
          },
          pagination: {
            mode: "manual",
            state: demo.query.pagination,
            onChange: demo.changePage,
            totalRows: demo.totalRows,
          },
        }
      : {
          sorting: {
            mode: "client",
            state: demo.query.sort,
            onChange: demo.changeSort,
          },
          pagination: {
            mode: "client",
            state: demo.query.pagination,
            onChange: demo.changePage,
          },
        };
  const expansion: ExpansionConfig<InventoryRow, StockMovement> = {
    mode: "lazy",
    emptyMessage: "No stock movements",
    getLabel: (row, expanded) =>
      `${expanded ? "Collapse" : "Expand"} ${row.name} stock movements`,
    loadChildren: (row, { signal }) =>
      loadStockMovements(row.id, { signal, scenario: demo.childScenario }),
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
        mode={demo.mode}
        listScenario={demo.listScenario}
        childScenario={demo.childScenario}
        changeMode={demo.changeMode}
        changeListScenario={demo.changeListScenario}
        changeChildScenario={demo.changeChildScenario}
        reset={demo.reset}
      />
      <SectionCard
        titleId="inventory-title"
        title="Studio inventory"
        description="Prices in S$ · 100 sample items"
      >
        <DataTable<InventoryRow, StockMovement>
          caption="Studio inventory"
          datasetKey={demo.datasetKey}
          data={demo.rows}
          columns={inventoryColumns}
          getRowId={getRowId}
          request={demo.request}
          emptyMessage="No inventory items available."
          expansion={expansion}
          {...processing}
        />
      </SectionCard>
    </StudioPage>
  );
}
