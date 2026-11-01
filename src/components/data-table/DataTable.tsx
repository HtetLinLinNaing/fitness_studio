"use client";

import { Button, Skeleton } from "@heroui/react";
import { Fragment, useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { ColumnDef, DataTableProps } from "./types";
import { PaginationControls } from "./PaginationControls";
import { useTableProcessing } from "./use-table-processing";
import { useRowExpansion } from "./use-row-expansion";
import { RowDetails } from "./RowDetails";
import styles from "./data-table.module.css";

function displayValue(value: unknown): ReactNode {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isFinite(value) ? value : "—";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "—" : value.toISOString();
  return typeof value === "string" ? value : "—";
}

function renderCell<T>(column: ColumnDef<T>, row: T, rowId: string): ReactNode {
  if (column.cell) return column.cell({ row, rowId });
  return displayValue(column.accessorFn ? column.accessorFn(row) : row[column.accessorKey]);
}

export function DataTable<T, TChild = never>(props: DataTableProps<T, TChild>) {
  // A new logical dataset resets local viewport state; ordinary array changes do not.
  return <TableContent key={props.datasetKey} {...props} />;
}

function TableContent<T, TChild>({ data, columns, getRowId, caption,
  request = { status: "ready" }, emptyMessage = "No records available.",
  sorting, pagination, expansion,
}: DataTableProps<T, TChild>) {
  const [scrolled, setScrolled] = useState(false);
  const detailPrefix = useId();
  const details = useRowExpansion(expansion);
  const processing = useTableProcessing({ data, columns, sorting, pagination, ready: request.status === "ready" });
  const layout = useMemo(() => {
    if (columns.length === 0) throw new Error("DataTable requires at least one column.");
    const ids = new Set<string>();
    const ordered = [...columns.filter(column => column.pinned === "left"),
      ...columns.filter(column => column.pinned !== "left")];
    let offset = 0;
    const pinnedCount = ordered.filter(column => column.pinned === "left").length;
    const cells = ordered.map((column, index) => {
      if (!column.id || ids.has(column.id)) throw new Error("DataTable column IDs must be unique and non-empty.");
      ids.add(column.id);
      const width = Number.isFinite(column.width) && (column.width ?? 0) > 0 ? column.width! : 160;
      if (column.width !== undefined && width !== column.width && process.env.NODE_ENV !== "production") {
        console.warn(`Invalid width for column ${column.id}; using 160px.`);
      }
      const pinned = column.pinned === "left";
      const left = offset;
      if (pinned) offset += width;
      return { column, width, pinned, left, edge: pinned && index === pinnedCount - 1 };
    });
    return { cells, pinnedWidth: offset,
      totalWidth: cells.reduce((sum, cell) => sum + cell.width, 0),
      unpinnedWidth: cells.filter(cell => !cell.pinned).reduce((sum, cell) => sum + cell.width, 0) };
  }, [columns]);

  const rowIds = useMemo(() => {
    const result = new Map<T, string>();
    if (request.status !== "ready") return result;
    const ids = new Set<string>();
    for (const row of data) {
      const id = getRowId(row);
      if (typeof id !== "string" || !id || ids.has(id)) {
        throw new Error("DataTable row IDs must be unique non-empty strings.");
      }
      ids.add(id);
      result.set(row, id);
    }
    return result;
  }, [data, getRowId, request.status]);
  const rows = request.status === "ready"
    ? processing.visibleData.map(row => ({ row, id: rowIds.get(row)! })) : [];

  const skeletonRows = request.status === "loading" && Number.isSafeInteger(request.skeletonRows)
    && (request.skeletonRows ?? 0) > 0 ? request.skeletonRows!
      : processing.paginationEnabled ? processing.page.pageSize : 10;
  const cellStyle = (cell: typeof layout.cells[number]): CSSProperties | undefined =>
    cell.pinned ? { left: cell.left } : undefined;
  const cellClass = (cell: typeof layout.cells[number]) =>
    [cell.pinned ? styles.pinned : "", cell.edge ? styles.edge : ""].filter(Boolean).join(" ");

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {request.status === "loading" ? `Loading ${caption.toLowerCase()}…` : ""}
      </span>
      <div className={styles.viewport} role="region" aria-label={`${caption}, scrollable table`}
        tabIndex={0} data-scrolled={scrolled}
        onScroll={event => setScrolled(event.currentTarget.scrollLeft > 0)}>
        <table className={styles.table} aria-busy={request.status === "loading"}
          style={{ minWidth: layout.totalWidth, width: layout.unpinnedWidth ? "100%" : layout.totalWidth }}>
          <caption className="sr-only">{caption}</caption>
          <colgroup>{layout.cells.map(cell => <col key={cell.column.id} style={{ width: cell.pinned
            ? cell.width : `calc((100% - ${layout.pinnedWidth}px) * ${cell.width / layout.unpinnedWidth})` }} />)}</colgroup>
          <thead><tr>{layout.cells.map(cell => {
            const sortable = processing.sortingEnabled && cell.column.sortable;
            const active = processing.sort?.columnId === cell.column.id;
            const next = !active ? "ascending" : processing.sort?.direction === "asc" ? "descending" : "restore original order";
            return <th key={cell.column.id} scope="col" className={cellClass(cell)} style={cellStyle(cell)}
              aria-sort={sortable ? active ? processing.sort?.direction === "asc" ? "ascending" : "descending" : "none" : undefined}>
              {sortable ? <button type="button" className={styles.sortButton} disabled={request.status !== "ready"}
                aria-label={`Sort by ${cell.column.header}, ${next}`}
                onClick={() => processing.toggleSort(cell.column.id)}>
                {cell.column.header}<span className={active ? styles.activeSort : styles.sortIcon} aria-hidden="true">
                  {active ? processing.sort?.direction === "asc" ? "↑" : "↓" : "↕"}
                </span></button> : cell.column.header}
            </th>;
          })}</tr></thead>
          <tbody>
            {request.status === "loading" && Array.from({ length: skeletonRows }, (_, index) => (
              <tr key={index} aria-hidden="true">{layout.cells.map(cell => <td key={cell.column.id}
                className={cellClass(cell)} style={cellStyle(cell)}><Skeleton className={styles.skeleton} /></td>)}</tr>
            ))}
            {request.status === "error" && <tr><td colSpan={layout.cells.length}>
              <div className={styles.message} role="alert"><strong>Unable to load data</strong>
                <p>{request.message}</p><Button variant="secondary" onPress={request.onRetry}>Retry</Button></div>
            </td></tr>}
            {request.status === "ready" && rows.length === 0 && <tr><td colSpan={layout.cells.length}>
              <div className={styles.message}><strong>{emptyMessage}</strong><p>There’s nothing to display right now.</p></div>
            </td></tr>}
            {rows.map(({ row, id }) => {
              const canExpand = expansion && (expansion.canExpand?.(row) ?? true);
              const expanded = details.openRows.has(id);
              const detailId = `${detailPrefix}-details-${encodeURIComponent(id)}`;
              return <Fragment key={id}>
                <tr data-parent-row>{layout.cells.map((cell, index) => <td key={cell.column.id}
                  className={cellClass(cell)} style={cellStyle(cell)}>
                  {index === 0 && expansion ? <div className={styles.rowTitle}>
                    {canExpand ? <button type="button" className={styles.expandButton}
                      aria-label={expansion.getLabel?.(row, expanded) ?? `${expanded ? "Collapse" : "Expand"} details`}
                      aria-expanded={expanded} aria-controls={detailId} onClick={() => details.toggle(row, id)}>
                      <span aria-hidden="true">›</span></button> : <span className={styles.expandPlaceholder} aria-hidden="true" />}
                    <div className={styles.rowContent}>{renderCell(cell.column, row, id)}</div>
                  </div> : renderCell(cell.column, row, id)}
                </td>)}</tr>
                {canExpand && expansion && <RowDetails row={row} id={detailId} columns={layout.cells.length}
                  expanded={expanded} expansion={expansion} request={details.requests.get(id)}
                  onRetry={() => details.retry(row, id)} />}
              </Fragment>;
            })}
          </tbody>
        </table>
      </div>
      {processing.paginationEnabled && <PaginationControls caption={caption} page={processing.page}
        totalRows={processing.totalRows} visibleCount={rows.length} sizes={processing.sizes}
        disabled={request.status !== "ready" || processing.totalRows === 0} onChange={processing.changePage} />}
    </>
  );
}
