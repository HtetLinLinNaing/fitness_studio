"use client";

import { Button, Skeleton } from "@heroui/react";
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
      cell.pinned ? "sticky z-1" : "",
      cell.edge
        ? "border-r border-r-transparent group-data-[scrolled=true]/table:shadow-[9px_0_12px_-9px_#153d295c]"
        : "",
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
        className="group/table overflow-x-auto overscroll-x-contain [scrollbar-width:thin] [scrollbar-color:#9fb4a5_transparent] focus-visible:outline-offset-[-3px]"
        role="region"
        aria-label={`${caption}, scrollable table`}
        tabIndex={0}
        data-scrolled={scrolled}
        onScroll={(event) => setScrolled(event.currentTarget.scrollLeft > 0)}
      >
        <table
          className="data-table table-fixed border-separate border-spacing-0 text-[14px] text-ink"
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
                    className={`${cellClass(cell)} z-2`}
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
                      <Skeleton className="table-skeleton h-[13px] w-[76%] rounded bg-[#d5dfd6]" />
                    </td>
                  ))}
                </tr>
              ))}
            {request.status === "error" && (
              <tr>
                <td colSpan={layout.cells.length}>
                  <div
                    className="sticky left-0 w-[min(360px,calc(100vw-96px))] py-[38px] text-[#304e3b]"
                    role="alert"
                  >
                    <strong className="text-[15px] font-semibold">
                      Unable to load data
                    </strong>
                    <p className="mt-[9px] mb-[18px] text-sm leading-[1.7] text-[#4b6055]">
                      {request.message}
                    </p>
                    <Button variant="secondary" onPress={request.onRetry}>
                      Retry
                    </Button>
                  </div>
                </td>
              </tr>
            )}
            {request.status === "ready" && rows.length === 0 && (
              <tr>
                <td colSpan={layout.cells.length}>
                  <div className="sticky left-0 w-[min(360px,calc(100vw-96px))] py-[38px] text-[#304e3b]">
                    <strong className="text-[15px] font-semibold">
                      {emptyMessage}
                    </strong>
                    <p className="mt-[9px] mb-[18px] text-sm leading-[1.7] text-[#4b6055]">
                      There’s nothing to display right now.
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {rows.map(({ row, id }) => {
              const canExpand =
                expansion && (expansion.canExpand?.(row) ?? true);
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
                          <div className="flex items-center gap-2">
                            {canExpand ? (
                              <button
                                type="button"
                                className="group/expand grid h-8 w-7 shrink-0 basis-7 cursor-pointer place-items-center rounded-[5px] border border-transparent bg-transparent text-[#245638] [font:inherit] hover:border-[#bacdbf] hover:bg-[#dcebe0] max-[520px]:h-11 max-[520px]:w-9 max-[520px]:basis-9"
                                aria-label={
                                  expansion.getLabel?.(row, expanded) ??
                                  `${expanded ? "Collapse" : "Expand"} details`
                                }
                                aria-expanded={expanded}
                                aria-controls={detailId}
                                onClick={() => details.toggle(row, id)}
                              >
                                <span
                                  className="inline-block text-[23px] leading-none transition-transform duration-180 ease-[ease] group-aria-expanded/expand:rotate-90 motion-reduce:transition-none motion-reduce:duration-0"
                                  aria-hidden="true"
                                >
                                  ›
                                </span>
                              </button>
                            ) : (
                              <span
                                className="h-8 w-7 shrink-0 basis-7 max-[520px]:h-11 max-[520px]:w-9 max-[520px]:basis-9"
                                aria-hidden="true"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              {renderCell(cell.column, row, id)}
                            </div>
                          </div>
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
