"use client";

import { DataTable } from "@/components/data-table/DataTable";
import type { ProcessingConfig, ExpansionConfig } from "@/components/data-table/types";
import { StudioShell } from "@/components/studio-shell/StudioShell";
import { loadStockMovements } from "@/mocks/services";
import type { MockScenario } from "@/mocks/types";
import { inventoryColumns } from "./inventory-columns";
import { StockMovementList } from "./StockMovementList";
import type { InventoryRow, StockMovement } from "./types";
import { useInventoryDemo } from "./use-inventory-demo";
import styles from "./inventory-demo.module.css";

const scenarios: readonly { value: MockScenario; label: string }[] = [
  { value: "normal", label: "Normal (500ms)" }, { value: "slow", label: "Slow (2s)" },
  { value: "empty", label: "Empty" }, { value: "error", label: "Error" },
];
function ScenarioSelect({ label, value, onChange }: {
  label: string; value: MockScenario; onChange: (value: MockScenario) => void;
}) {
  return <label>{label}<select value={value} onChange={event => {
    const selected = scenarios.find(option => option.value === event.target.value);
    if (selected) onChange(selected.value);
  }}>{scenarios.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
const getRowId = (row: InventoryRow) => row.id;

export function InventoryDemo() {
  const demo = useInventoryDemo();
  const processing: ProcessingConfig = demo.mode === "manual" ? {
    sorting: { mode: "manual", state: demo.query.sort, onChange: demo.changeSort },
    pagination: { mode: "manual", state: demo.query.pagination, onChange: demo.changePage, totalRows: demo.totalRows },
  } : {
    sorting: { mode: "client", state: demo.query.sort, onChange: demo.changeSort },
    pagination: { mode: "client", state: demo.query.pagination, onChange: demo.changePage },
  };
  const expansion: ExpansionConfig<InventoryRow, StockMovement> = {
    mode: "lazy", emptyMessage: "No stock movements",
    getLabel: (row, expanded) => `${expanded ? "Collapse" : "Expand"} ${row.name} stock movements`,
    loadChildren: (row, { signal }) => loadStockMovements(row.id, { signal, scenario: demo.childScenario }),
    renderChildren: ({ row, children }) => <StockMovementList itemName={row.name} movements={children} />,
  };
  return <StudioShell active="inventory"><main className={styles.main} id="inventory-main">
    <p className={styles.eyebrow}>Your studio essentials</p>
    <h1>Inventory</h1>
    <p className={styles.description}>Equipment, products and supplies. Explore stock history for each item.</p>
    <section className={styles.controls} aria-labelledby="demo-controls-title">
      <div className={styles.controlsHeading}><h2 id="demo-controls-title">Demo controls</h2><span>Simulated responses · Local mock data</span></div>
      <div className={styles.controlFields}>
        <label>Processing<select value={demo.mode} onChange={event => demo.changeMode(event.target.value === "manual" ? "manual" : "client")}>
          <option value="client">Client</option><option value="manual">Simulated server</option></select></label>
        <ScenarioSelect label="List response" value={demo.listScenario} onChange={demo.changeListScenario} />
        <ScenarioSelect label="Detail response" value={demo.childScenario} onChange={demo.changeChildScenario} />
        <button type="button" onClick={demo.reset}>Reset demo</button>
      </div>
      <p>Changing demo settings returns to page 1 and clears open details. Error responses recover with Retry.</p>
    </section>
    <section className={styles.card} aria-labelledby="inventory-title">
      <div className={styles.cardHeader}><h2 id="inventory-title">Studio inventory</h2><span>Prices in S$ · 100 sample items</span></div>
      <DataTable<InventoryRow, StockMovement> caption="Studio inventory" datasetKey={demo.datasetKey}
        data={demo.rows} columns={inventoryColumns} getRowId={getRowId} request={demo.request}
        emptyMessage="No inventory items available." expansion={expansion} {...processing} />
    </section>
    <p className={styles.footnote}>Sample inventory · Fictional studio data</p>
  </main></StudioShell>;
}
