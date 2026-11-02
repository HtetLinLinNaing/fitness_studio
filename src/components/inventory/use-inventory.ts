"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadInventory,
  queryInventory,
  resetMockFailures,
} from "@/mocks/services";
import type { ListQuery, MockScenario } from "@/types/mock";
import type { PaginationState, RequestState, SortState } from "@/types/table";
import type { InventoryRow } from "@/types/inventory";

type Mode = "client" | "manual";
type Settings = {
  mode: Mode;
  listScenario: MockScenario;
  childScenario: MockScenario;
  query: ListQuery;
  generation: number;
  attempt: number;
};
type InventoryRequest = {
  datasetKey: string;
  attempt: number;
  scenario: MockScenario;
  query: ListQuery | null;
};
type Result = {
  parameters: InventoryRequest;
  rows: readonly InventoryRow[];
  totalRows: number;
} & ({ status: "ready" } | { status: "error"; message: string });
const initialQuery = (): ListQuery => ({
  sort: null,
  pagination: { pageIndex: 0, pageSize: 10 },
});
const defaults = (): Settings => ({
  mode: "client",
  listScenario: "normal",
  childScenario: "normal",
  query: initialQuery(),
  generation: 0,
  attempt: 0,
});

export function useInventory() {
  const [settings, setSettings] = useState(defaults);
  const [result, setResult] = useState<Result | null>(null);
  const { mode, query, listScenario, childScenario, generation, attempt } =
    settings;
  const datasetKey = `inventory:${generation}:${mode}:${listScenario}:${childScenario}`;
  // Client sorting/paging uses loaded rows; only manual queries trigger a fetch.
  const manualQuery = mode === "manual" ? query : null;
  const requestParameters = useMemo<InventoryRequest>(
    () => ({ datasetKey, attempt, scenario: listScenario, query: manualQuery }),
    [datasetKey, attempt, listScenario, manualQuery],
  );

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    const { query: requestedQuery, scenario } = requestParameters;
    const context = { signal: controller.signal, scenario };
    const pending = requestedQuery
      ? queryInventory(requestedQuery, context)
      : loadInventory(context).then((rows) => ({
          rows,
          totalRows: rows.length,
        }));
    pending
      .then((response) => {
        if (!current || controller.signal.aborted) return;
        if (requestedQuery) {
          const lastPage = Math.max(
            0,
            Math.ceil(response.totalRows / requestedQuery.pagination.pageSize) - 1,
          );
          if (requestedQuery.pagination.pageIndex > lastPage) {
            setSettings((previous) => ({
              ...previous,
              query: {
                ...previous.query,
                pagination: {
                  ...previous.query.pagination,
                  pageIndex: lastPage,
                },
              },
            }));
            return;
          }
        }
        setResult({
          ...response,
          parameters: requestParameters,
          status: "ready",
        });
      })
      .catch((error: unknown) => {
        if (!current || controller.signal.aborted) return;
        setResult({
          parameters: requestParameters,
          status: "error",
          rows: [],
          totalRows: 0,
          message:
            error instanceof Error
              ? error.message
              : "Unable to load inventory. Please retry.",
        });
      });
    return () => {
      current = false;
      controller.abort();
    };
  }, [requestParameters]);

  const current = result?.parameters === requestParameters ? result : null;
  const request: RequestState = !current
    ? { status: "loading" }
    : current.status === "error"
      ? {
          status: "error",
          message: current.message,
          onRetry: () =>
            setSettings((previous) => ({
              ...previous,
              attempt: previous.attempt + 1,
            })),
        }
      : { status: "ready" };
  const resetScope = (patch: Partial<Settings>) => {
    resetMockFailures();
    setSettings((previous) => ({
      ...previous,
      ...patch,
      generation: previous.generation + 1,
      query: {
        ...previous.query,
        pagination: { ...previous.query.pagination, pageIndex: 0 },
      },
    }));
  };
  return {
    rows: current?.rows ?? [],
    totalRows: current?.totalRows ?? 0,
    request,
    query,
    mode,
    listScenario,
    childScenario,
    datasetKey,
    changeSort: (sort: SortState) =>
      setSettings((previous) => ({
        ...previous,
        query: {
          sort,
          pagination: { ...previous.query.pagination, pageIndex: 0 },
        },
      })),
    changePage: (pagination: PaginationState) =>
      setSettings((previous) => ({
        ...previous,
        query: {
          ...previous.query,
          pagination: {
            ...pagination,
            pageIndex:
              pagination.pageSize !== previous.query.pagination.pageSize
                ? 0
                : pagination.pageIndex,
          },
        },
      })),
    changeMode: (next: Mode) => resetScope({ mode: next }),
    changeListScenario: (next: MockScenario) =>
      resetScope({ listScenario: next }),
    changeChildScenario: (next: MockScenario) =>
      resetScope({ childScenario: next }),
    reset: () => {
      resetMockFailures();
      setSettings((previous) => ({
        ...defaults(),
        generation: previous.generation + 1,
      }));
    },
  };
}
