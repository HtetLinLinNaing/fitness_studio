import type { PaginationState, SortState } from "@/types/table-state";

export type MockScenario = "normal" | "slow" | "empty" | "error";
export type MockContext = { signal?: AbortSignal; scenario?: MockScenario };
export type ListQuery = { sort: SortState; pagination: PaginationState };
export type PageResult<T> = { rows: readonly T[]; totalRows: number };
