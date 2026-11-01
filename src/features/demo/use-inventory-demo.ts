"use client";

import { useEffect, useState } from "react";
import type { RequestState } from "@/components/data-table/types";
import { loadInventory, queryInventory, resetMockFailures } from "@/mocks/services";
import type { ListQuery, MockScenario } from "@/mocks/types";
import type { PaginationState, SortState } from "@/types/table-state";
import type { InventoryRow } from "./types";

type Mode = "client" | "manual";
type Settings = {
  mode: Mode; listScenario: MockScenario; childScenario: MockScenario;
  query: ListQuery; generation: number; attempt: number;
};
type Result = {
  key: string; rows: readonly InventoryRow[]; totalRows: number;
  status: "ready" | "error"; message?: string;
};
const initialQuery = (): ListQuery => ({ sort: null, pagination: { pageIndex: 0, pageSize: 10 } });
const defaults = (): Settings => ({ mode: "client", listScenario: "normal", childScenario: "normal",
  query: initialQuery(), generation: 0, attempt: 0 });

export function useInventoryDemo() {
  const [settings, setSettings] = useState(defaults);
  const [result, setResult] = useState<Result | null>(null);
  const { mode, query, listScenario, childScenario, generation, attempt } = settings;
  const datasetKey = `inventory:${generation}:${mode}:${listScenario}:${childScenario}`;
  // Client sort/page changes use the loaded complete dataset, without refetching.
  const requestKey = JSON.stringify([datasetKey, attempt, mode === "manual" ? query : null]);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    const [, , manualQuery] = JSON.parse(requestKey) as [string, number, ListQuery | null];
    const context = { signal: controller.signal, scenario: listScenario };
    const pending = manualQuery ? queryInventory(manualQuery, context)
      : loadInventory(context).then(rows => ({ rows, totalRows: rows.length }));
    pending.then(response => {
      if (!current || controller.signal.aborted) return;
      if (manualQuery) {
        const lastPage = Math.max(0, Math.ceil(response.totalRows / manualQuery.pagination.pageSize) - 1);
        if (manualQuery.pagination.pageIndex > lastPage) {
          setSettings(previous => ({ ...previous, query: { ...previous.query,
            pagination: { ...previous.query.pagination, pageIndex: lastPage } } }));
          return;
        }
      }
      setResult({ ...response, key: requestKey, status: "ready" });
    }).catch((error: unknown) => {
      if (!current || controller.signal.aborted) return;
      setResult({ key: requestKey, status: "error", rows: [], totalRows: 0,
        message: error instanceof Error ? error.message : "Unable to load inventory. Please retry." });
    });
    return () => { current = false; controller.abort(); };
  }, [requestKey, listScenario]);

  const current = result?.key === requestKey ? result : null;
  const request: RequestState = !current ? { status: "loading" }
    : current.status === "error" ? { status: "error", message: current.message!,
      onRetry: () => setSettings(previous => ({ ...previous, attempt: previous.attempt + 1 })) }
      : { status: "ready" };
  const resetScope = (patch: Partial<Settings>) => {
    resetMockFailures();
    setSettings(previous => ({ ...previous, ...patch, generation: previous.generation + 1,
      query: { ...previous.query, pagination: { ...previous.query.pagination, pageIndex: 0 } } }));
  };
  return {
    rows: current?.rows ?? [], totalRows: current?.totalRows ?? 0, request, query,
    mode, listScenario, childScenario, datasetKey,
    changeSort: (sort: SortState) => setSettings(previous => ({ ...previous,
      query: { sort, pagination: { ...previous.query.pagination, pageIndex: 0 } } })),
    changePage: (pagination: PaginationState) => setSettings(previous => ({ ...previous,
      query: { ...previous.query, pagination: { ...pagination,
        pageIndex: pagination.pageSize !== previous.query.pagination.pageSize ? 0 : pagination.pageIndex } } })),
    changeMode: (next: Mode) => resetScope({ mode: next }),
    changeListScenario: (next: MockScenario) => resetScope({ listScenario: next }),
    changeChildScenario: (next: MockScenario) => resetScope({ childScenario: next }),
    reset: () => { resetMockFailures(); setSettings(previous => ({ ...defaults(), generation: previous.generation + 1 })); },
  };
}
