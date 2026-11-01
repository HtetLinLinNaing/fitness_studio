export type SortState = {
  columnId: string;
  direction: "asc" | "desc";
} | null;

export type PaginationState = {
  pageIndex: number;
  pageSize: number;
};
