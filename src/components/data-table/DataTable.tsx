"use client";

import { Skeleton } from "@heroui/react";
import {
  Fragment,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { ColumnDef, DataTableProps } from "@/types/table";
import { PaginationControls } from "./PaginationControls";
import { useTableProcessing } from "./use-table-processing";
import { useRowExpansion } from "./use-row-expansion";
import { RowDetails } from "./RowDetails";
import { createColumnLayout, type ColumnLayout } from "./column-layout";
import { SortHeader } from "./SortHeader";
import { TableMessage } from "./TableMessage";
import { ExpandableCell } from "./ExpandableCell";
import styles from "./DataTable.module.css";

function displayValue(value: unknown): ReactNode {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isFinite(value) ? value : "—";
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? "—" : value.toISOString();
  return typeof value === "string" ? value : "—";
}

function renderCell<T>(column: ColumnDef<T>, row: T, rowId: string): ReactNode {
  if (column.cell) return column.cell({ row, rowId });
  return displayValue(
    column.accessorFn ? column.accessorFn(row) : row[column.accessorKey],
  );
}

export function DataTable<T, TChild = never>(props: DataTableProps<T, TChild>) {
  // A new logical dataset resets local viewport state; ordinary array changes do not.
  return <TableContent key={props.datasetKey} {...props} />;
}

function TableContent<T, TChild>({
  data,
  columns,
  getRowId,
  caption,
  request = { status: "ready" },
  emptyMessage = "No records available.",
  sorting,
  pagination,
  expansion,
}: DataTableProps<T, TChild>) {
  const [scrolled, setScrolled] = useState(false);
  const detailPrefix = useId();
  const details = useRowExpansion(expansion);
  const processing = useTableProcessing({
    data,
    columns,
    sorting,
    pagination,
    ready: request.status === "ready",
  });
  const layout = useMemo(() => createColumnLayout(columns), [columns]);

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
  const rows =
    request.status === "ready"
      ? processing.visibleData.map((row) => ({ row, id: rowIds.get(row)! }))
      : [];

  const skeletonRows =
    request.status === "loading" &&
    Number.isSafeInteger(request.skeletonRows) &&
    (request.skeletonRows ?? 0) > 0
      ? request.skeletonRows!
      : processing.paginationEnabled
        ? processing.page.pageSize
        : 10;
  const cellStyle = (cell: ColumnLayout<T>): CSSProperties | undefined =>
    cell.pinned ? { left: cell.left } : undefined;
  const cellClass = (cell: ColumnLayout<T>) =>
    [
      cell.pinned ? styles.pinned : "",
      cell.edge ? styles.pinnedEdge : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {request.status === "loading"
          ? `Loading ${caption.toLowerCase()}…`
          : ""}
      </span>
      <div
        className={styles.scrollRegion}
        role="region"
        aria-label={`${caption}, scrollable table`}
        tabIndex={0}
        data-scrolled={scrolled}
        onScroll={(event) => setScrolled(event.currentTarget.scrollLeft > 0)}
      >
        <table
          className={styles.table}
          aria-busy={request.status === "loading"}
          style={{
            minWidth: layout.totalWidth,
            width: layout.unpinnedWidth ? "100%" : layout.totalWidth,
          }}
        >
          <caption className="sr-only">{caption}</caption>
          <colgroup>
            {layout.cells.map((cell) => (
              <col
                key={cell.column.id}
                style={{
                  width: cell.pinned
                    ? cell.width
                    : `calc((100% - ${layout.pinnedWidth}px) * ${cell.width / layout.unpinnedWidth})`,
                }}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              {layout.cells.map((cell) => {
                const sortable =
                  processing.sortingEnabled && cell.column.sortable;
                const active = processing.sort?.columnId === cell.column.id;
                let sortDirection:
                  "ascending" | "descending" | "none" | undefined;
                if (sortable) {
                  sortDirection = active
                    ? processing.sort?.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none";
                }
                return (
                  <th
                    key={cell.column.id}
                    scope="col"
                    className={cellClass(cell)}
                    style={cellStyle(cell)}
                    aria-sort={sortDirection}
                  >
                    {sortable ? (
                      <SortHeader
                        columnId={cell.column.id}
                        label={cell.column.header}
                        sort={processing.sort}
                        disabled={request.status !== "ready"}
                        onSort={processing.toggleSort}
                      />
                    ) : (
                      cell.column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {request.status === "loading" &&
              Array.from({ length: skeletonRows }, (_, index) => (
                <tr key={index} aria-hidden="true">
                  {layout.cells.map((cell) => (
                    <td
                      key={cell.column.id}
                      className={cellClass(cell)}
                      style={cellStyle(cell)}
                    >
                      <Skeleton className={`table-skeleton ${styles.skeleton}`} />
                    </td>
                  ))}
                </tr>
              ))}
            {request.status === "error" && (
              <tr>
                <td colSpan={layout.cells.length}>
                  <TableMessage
                    title="Unable to load data"
                    message={request.message}
                    onRetry={request.onRetry}
                  />
                </td>
              </tr>
            )}
            {request.status === "ready" && rows.length === 0 && (
              <tr>
                <td colSpan={layout.cells.length}>
                  <TableMessage
                    title={emptyMessage}
                    message="There’s nothing to display right now."
                  />
                </td>
              </tr>
            )}
            {rows.map(({ row, id }) => {
              const canExpand =
                !!expansion && (expansion.canExpand?.(row) ?? true);
              const expanded = details.openRows.has(id);
              const detailId = `${detailPrefix}-details-${encodeURIComponent(id)}`;
              return (
                <Fragment key={id}>
                  <tr data-parent-row>
                    {layout.cells.map((cell, index) => (
                      <td
                        key={cell.column.id}
                        className={cellClass(cell)}
                        style={cellStyle(cell)}
                      >
                        {index === 0 && expansion ? (
                          <ExpandableCell
                            canExpand={canExpand}
                            expanded={expanded}
                            detailsId={detailId}
                            label={
                              canExpand
                                ? expansion.getLabel?.(row, expanded)
                                : undefined
                            }
                            onToggle={() => details.toggle(row, id)}
                          >
                            {renderCell(cell.column, row, id)}
                          </ExpandableCell>
                        ) : (
                          renderCell(cell.column, row, id)
                        )}
                      </td>
                    ))}
                  </tr>
                  {canExpand && expansion && (
                    <RowDetails
                      row={row}
                      id={detailId}
                      columns={layout.cells.length}
                      expanded={expanded}
                      expansion={expansion}
                      request={details.requests.get(id)}
                      onRetry={() => details.retry(row, id)}
                    />
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {processing.paginationEnabled && (
        <PaginationControls
          caption={caption}
          page={processing.page}
          totalRows={processing.totalRows}
          visibleCount={rows.length}
          sizes={processing.sizes}
          disabled={request.status !== "ready" || processing.totalRows === 0}
          onChange={processing.changePage}
        />
      )}
    </>
  );
}
