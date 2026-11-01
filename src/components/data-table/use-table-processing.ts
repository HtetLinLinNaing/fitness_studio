"use client";

import { useMemo, useState } from "react";
import type {
  ColumnDef,
  PaginationConfig,
  PaginationState,
  SortingConfig,
  SortState,
} from "@/types/table";
import {
  normalizePage,
  pageSizes,
  resolveSort,
  sortRows,
  validTotal,
} from "./processing";

type Input<T> = {
  data: readonly T[];
  columns: readonly ColumnDef<T>[];
  sorting?: false | SortingConfig;
  pagination?: false | PaginationConfig;
  ready: boolean;
};

function validateConfig(
  sorting: false | SortingConfig | undefined,
  pagination: false | PaginationConfig | undefined,
) {
  for (const config of [sorting, pagination]) {
    if (!config) continue;
    if (
      config.mode !== undefined &&
      config.mode !== "client" &&
      config.mode !== "manual"
    ) {
      throw new Error("DataTable processing mode must be client or manual.");
    }
    if (
      config.state !== undefined &&
      (typeof config.onChange !== "function" ||
        config.defaultState !== undefined)
    ) {
      throw new Error(
        "Controlled table state requires onChange and cannot include defaultState.",
      );
    }
    if (
      config.mode === "manual" &&
      (config.state === undefined || typeof config.onChange !== "function")
    ) {
      throw new Error(
        "Manual processing requires controlled state and onChange.",
      );
    }
  }
  if (
    pagination &&
    pagination.mode === "manual" &&
    sorting !== false &&
    sorting?.mode !== "manual"
  ) {
    throw new Error("Manual pagination requires manual or disabled sorting.");
  }
  if (
    pagination &&
    pagination.mode === "manual" &&
    validTotal(pagination.totalRows) !== pagination.totalRows
  ) {
    throw new Error(
      "Manual pagination requires a non-negative integer totalRows.",
    );
  }
}

export function useTableProcessing<T>({
  data,
  columns,
  sorting,
  pagination,
  ready,
}: Input<T>) {
  validateConfig(sorting, pagination);
  const [localSort, setLocalSort] = useState<SortState>(() =>
    sorting ? (sorting.defaultState ?? null) : null,
  );
  const [localPage, setLocalPage] = useState<PaginationState>(() =>
    pagination
      ? (pagination.defaultState ?? { pageIndex: 0, pageSize: 10 })
      : { pageIndex: 0, pageSize: 10 },
  );
  const [observedTotal, setObservedTotal] = useState<number | null>(null);
  const sortingEnabled = sorting !== false;
  const paginationEnabled = pagination !== false;
  const controlledSort = sorting !== false && sorting?.state !== undefined;
  const controlledPage =
    pagination !== false && pagination?.state !== undefined;
  const sort = resolveSort(
    sorting === false
      ? null
      : controlledSort
        ? (sorting?.state ?? null)
        : localSort,
    columns,
  );
  const manualSort = sorting !== false && sorting?.mode === "manual";
  const manualPage = pagination !== false && pagination?.mode === "manual";
  const totalRows = manualPage ? validTotal(pagination.totalRows) : data.length;
  const requestedPage =
    pagination !== false && pagination?.state !== undefined
      ? pagination.state
      : localPage;
  const page = normalizePage(requestedPage, totalRows);

  const sorted = useMemo(
    () =>
      manualSort || !sortingEnabled ? data : sortRows(data, columns, sort),
    [data, columns, sort, manualSort, sortingEnabled],
  );
  const visibleData = useMemo(
    () =>
      manualPage || !paginationEnabled
        ? sorted
        : sorted.slice(
            page.pageIndex * page.pageSize,
            (page.pageIndex + 1) * page.pageSize,
          ),
    [sorted, manualPage, paginationEnabled, page.pageIndex, page.pageSize],
  );

  // Adjust only this hook's uncontrolled state when the ready dataset count changes.
  // Parent callbacks remain event-only; controlled values are never copied locally.
  if (
    ready &&
    paginationEnabled &&
    !controlledPage &&
    observedTotal !== totalRows
  ) {
    setObservedTotal(totalRows);
    if (
      localPage.pageIndex !== page.pageIndex ||
      localPage.pageSize !== page.pageSize
    )
      setLocalPage(page);
  }

  function changePage(next: PaginationState) {
    if (!ready || !paginationEnabled) return;
    const normalized = normalizePage(next, totalRows);
    if (!controlledPage) setLocalPage(normalized);
    if (pagination) pagination.onChange?.(normalized);
  }

  function toggleSort(columnId: string) {
    if (
      !ready ||
      !sortingEnabled ||
      !columns.some((column) => column.id === columnId && column.sortable)
    )
      return;
    const next: SortState =
      sort?.columnId !== columnId
        ? { columnId, direction: "asc" }
        : sort.direction === "asc"
          ? { columnId, direction: "desc" }
          : null;
    if (!controlledSort) setLocalSort(next);
    if (sorting) sorting.onChange?.(next);
    changePage({ pageIndex: 0, pageSize: page.pageSize });
  }

  return {
    visibleData,
    sort,
    page,
    totalRows,
    sortingEnabled,
    paginationEnabled,
    sizes: pageSizes(
      pagination ? pagination.pageSizes : undefined,
      page.pageSize,
    ),
    toggleSort,
    changePage,
  };
}
