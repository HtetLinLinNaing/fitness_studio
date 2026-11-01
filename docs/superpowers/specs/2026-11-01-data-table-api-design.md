# HL Fitness Studio — Data Table API Design

Status: user approved the written API design; Step 4 is complete and accepted. Table and mock-service implementation still require separate step approval.

## Intent and approved direction

Provide one fully typed component for the class timetable and inventory demo, with no fitness-specific behavior in its internals. The user selected grouped configuration: `sorting`, `pagination`, and `expansion`. Keep `data`, `columns`, stable row identity, and accessible naming at the top level.

This design builds on the approved PRD and Calm studio visual direction. Next.js, TypeScript, HeroUI for non-table controls, local JSON fixtures, and mocked async functions remain the selected foundation. This step introduces no dependency.

## Approaches considered

1. **Grouped configuration — selected by the user.** Related options stay together. Explicit processing modes and state ownership remain readable as features grow. Slightly more nesting in JSX.
2. **Flat properties — considered.** Simple individual property lookup, but sort/page/expansion options crowd the top-level component and make valid combinations less obvious. Not selected.

## Public types: basic values and columns

The following are proposed signatures, not production source. Import `ReactNode` from React in the eventual types module.

```ts
type RowId = string;
type SortValue = string | number | boolean | Date | null | undefined;

type ScalarKey<T> = {
  [K in keyof T]-?: T[K] extends SortValue ? K : never;
}[keyof T] & string;

type ColumnAccessor<T> =
  | { accessorKey: ScalarKey<T>; accessorFn?: never }
  | { accessorKey?: never; accessorFn: (row: T) => SortValue };

type ColumnPosition =
  | { pinned: "left"; width: number }
  | { pinned?: false; width?: number };

type ColumnDef<T> = ColumnAccessor<T> & ColumnPosition & {
  id: string;
  header: string;
  cell?: (context: { row: T; rowId: RowId }) => ReactNode;
  sortable?: boolean;
  compare?: (left: T, right: T) => number;
};

type SortState = { columnId: string; direction: "asc" | "desc" } | null;
type PaginationState = { pageIndex: number; pageSize: number };
```

`accessorKey` accepts only an actual scalar property of the row type. A computed accessor returns a scalar sort value. A custom cell receives the entire typed row rather than an ambiguous union of every column's value. For example, a price cell reads `row.unitPriceCents` as a number and an attendee cell may read a typed child collection. No public `any` or unchecked value casts are needed for consumers.

For complex fields, provide a derived scalar accessor for sorting and use the typed row in the cell renderer for presentation. `compare` can implement a custom row comparison; it must return a finite negative/zero/positive number and follow the same ordering rules as an ordinary comparator. This deliberately avoids a more elaborate column-builder abstraction.

Widths are pixel values. A pinned column must declare a width; unpinned columns default to 160px. Non-finite or non-positive widths fall back to 160px with a development warning. Render pinned columns as a leading group, preserving relative order within pinned and unpinned groups; the supplied first pinned column contains the expansion button. Column IDs must be unique, non-empty strings; row IDs must be unique within the dataset. Invalid identity definitions are developer configuration errors and should be caught during development, rather than silently producing incorrect keyed rows.

## Grouped sorting and pagination

```ts
type Controlled<S> = {
  state: S;
  onChange: (next: S) => void;
  defaultState?: never;
};

type Uncontrolled<S> = {
  state?: never;
  defaultState?: S;
  onChange?: (next: S) => void;
};

type ClientSorting = { mode?: "client" } &
  (Controlled<SortState> | Uncontrolled<SortState>);
type ManualSorting = { mode: "manual" } & Controlled<SortState>;
type SortingConfig = ClientSorting | ManualSorting;

type PageOptions = { pageSizes?: readonly number[] };
type ClientPagination = { mode?: "client" } & PageOptions &
  (Controlled<PaginationState> | Uncontrolled<PaginationState>);
type ManualPagination = {
  mode: "manual";
  totalRows: number;
} & PageOptions & Controlled<PaginationState>;
type PaginationConfig = ClientPagination | ManualPagination;

type ProcessingConfig =
  | {
      sorting?: false | ClientSorting;
      pagination?: false | ClientPagination;
    }
  | {
      sorting: ManualSorting;
      pagination?: false | ClientPagination | ManualPagination;
    }
  | {
      sorting: false;
      pagination: ManualPagination;
    };
```

State ownership and data processing are separate. A page may own the state while the table still processes the complete dataset in client mode. Manual mode requires parent-owned state; the table emits changes and renders supplied order/page without processing it again.

Omitted sorting defaults to client mode, no active sort. Omitted pagination defaults to client mode at index 0 and size 10, with sizes 10/25/50. `false` disables the corresponding feature. `defaultState` initializes table-owned state once; it is not a synchronization mechanism. Do not switch a mounted feature between controlled and uncontrolled ownership; remount deliberately if ownership must change. The demo can keep state parent-owned in both processing modes.

**Supported combinations:** client sorting with client pagination; manual sorting with client pagination over a complete already-sorted dataset; manual sorting with manual pagination; or disabled sorting with manual pagination. Client sorting over a manually paged subset is intentionally excluded because it cannot sort the full dataset. The prop union expresses this restriction; runtime validation catches incompatible JavaScript callers too.

### Behavior details

- Sorting cycles asc/desc/none and is stable for ties. `null` and `undefined` sort last in both directions; non-finite numeric values follow the same missing-value rule. Scalars in one column should have a consistent type. Strings use one documented English collator; numbers, booleans, and Dates use their natural order. A custom comparator compares non-missing rows; missing accessors still sort last. `null` sort state restores input order.
- An unknown/non-sortable column ID behaves as no active sort. Do not emit repair callbacks while rendering. The parent mock service applies the same validation to manual requests.
- Client sorting runs before pagination over the full supplied dataset. Only parent rows count toward totals and page sizes.
- Sort/page-size user actions reset pageIndex to 0 through the relevant owner. If both sort and pagination are parent-owned, invoke both change callbacks from the same event; the page uses functional state updates so neither update is lost.
- Pagination is zero-based internally and one-based in the UI. Out-of-range page indexes clamp to the valid range for rendering. Empty data uses index 0 and has disabled page navigation. Invalid page sizes fall back to 10; sanitize page-size options to positive integers and ensure the selected valid size is available.
- In manual mode, the page normalizes indexes using the returned total and refetches a valid page if necessary. The table does not invent missing rows or announce render-time state changes.
- The table preserves each controlled state's owner, never copying it into competing internal state. Change callbacks report complete next states, not partial patches.

## Grouped expansion and request state

```ts
type ChildContext<T, TChild> = {
  row: T;
  children: readonly TChild[];
};

type ExpansionConfig<T, TChild> = {
  canExpand?: (row: T) => boolean;
  renderChildren: (context: ChildContext<T, TChild>) => ReactNode;
  emptyMessage?: string;
  getLabel?: (row: T, expanded: boolean) => string;
} & (
  | {
      mode: "inline";
      getChildren: (row: T) => readonly TChild[];
      loadChildren?: never;
    }
  | {
      mode: "lazy";
      getChildren?: never;
      loadChildren: (
        row: T,
        context: { signal: AbortSignal },
      ) => Promise<readonly TChild[]>;
    }
);

type RequestState =
  | { status: "ready" }
  | { status: "loading"; skeletonRows?: number }
  | { status: "error"; message: string; onRetry: () => void };

type DataTableProps<T, TChild = never> = ProcessingConfig & {
  data: readonly T[];
  columns: readonly ColumnDef<T>[];
  getRowId: (row: T) => RowId;
  datasetKey: string;
  caption: string;
  request?: RequestState;
  emptyMessage?: string;
  expansion?: ExpansionConfig<T, TChild>;
};

declare function DataTable<T, TChild = never>(
  props: DataTableProps<T, TChild>,
): ReactNode;
```

`DataTable<T>` remains generic over its parent row type. Expansion adds an inferred or explicit second type parameter, so attendees and stock movements retain their own types. Child renderers are feature-owned and can render a semantic detail table with different columns. The table owns the full-width detail cell, loading/error/retry/empty wrapper, and animation; the renderer supplies its contents, never a surrounding parent `<tr>` or `<td>`.

Expansion state is table-owned for this scope; controlled expansion is not required. Multiple rows can remain open. `canExpand` defaults to true when expansion is configured; false removes that row's toggle. Omit expansion entirely to omit all toggles. `getLabel` permits row-specific labels; otherwise use generic Expand/Collapse details labels. Empty child results render `emptyMessage` before calling the child renderer.

`datasetKey` identifies the logical dataset, not each new array instance. Changing it clears expansion and cached child results, cancels pending requests, and prevents stale results from being applied. Paging/sorting within a scope preserves stable-record expansion and successful cached details. Retry replaces a failed request; pending requests are deduplicated. Collapse never triggers automatic reopening when loading finishes. Use AbortSignal plus stale-response guards, including loaders that ignore cancellation.

`request` defaults to ready. Loading replaces parent rows with skeletons following column geometry; default skeleton count is current page size, or 10 if pagination is disabled. Sanitize an explicit skeletonRows to a positive integer. During parent loading, disable table sorting, pagination, and expansion controls. External demo scenario controls may remain usable to exercise request replacement. Errors use the supplied message and retry callback while preserving requested sort/page state. Empty ready data renders the table's empty message.

## Feature data and local mock interfaces

These are proposed fixture shapes and interfaces for a later approved mock-data implementation step. They are not fixture files or services created by Step 4.

```ts
type Attendee = {
  id: string;
  customerName: string;
  paymentType: "one-time" | "package" | "membership";
  bookingStatus: "booked" | "checked-in" | "cancelled" | "no-show";
};

type ClassRow = {
  id: string;
  name: string;
  instructorName: string;
  startsAt: string; // ISO timestamp with explicit timezone offset
  endsAt: string;
  bookedCount: number;
  capacity: number;
  status: "scheduled" | "full" | "cancelled";
  attendees: readonly Attendee[];
};

type InventoryRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unitPriceCents: number;
};

type StockMovement = {
  id: string;
  itemId: string;
  occurredAt: string; // ISO timestamp with explicit timezone offset
  quantityChange: number;
  reason: string;
};

type ListQuery = {
  sort: SortState;
  pagination: PaginationState;
};
type PageResult<T> = { rows: readonly T[]; totalRows: number };
type MockScenario = "normal" | "slow" | "empty" | "error";
type MockContext = { signal?: AbortSignal; scenario?: MockScenario };

declare function loadClasses(
  context?: MockContext,
): Promise<readonly ClassRow[]>;
declare function loadInventory(
  context?: MockContext,
): Promise<readonly InventoryRow[]>;
declare function queryInventory(
  query: ListQuery,
  context?: MockContext,
): Promise<PageResult<InventoryRow>>;
declare function loadStockMovements(
  itemId: string,
  context?: MockContext,
): Promise<readonly StockMovement[]>;
```

The local JSON fixtures store these records; use explicit-offset date strings and integer minor currency units to avoid ambiguous dates or floating-point price storage. Formatting is feature-owned. Choose the studio timezone and sample inventory currency during mock-data review. Display them explicitly rather than inferring them from device settings. The proposed unitPriceCents field assumes a two-decimal demo currency.

The revised user-approved fixtures contain 12 classes and 100 inventory items, replacing the earlier large-dataset proposal. A deterministic script generates the JSON; runtime services still read JSON records. Parent and child scenarios are configured independently, so a child failure does not break the parent request. Retry uses the same query/row ID and a one-shot injected failure, so it can recover without editing code or toggling away from the error scenario. Slow requests remain cancellable. Normal delay is 500ms and slow is 2,000ms.

`queryInventory` validates supported sort IDs (`name`, `sku`, `category`, `stock`, `unitPriceCents`), applies stable sort before slicing, and returns the full parent total. Invalid sort IDs mean original order. A shrinking dataset may initially return an empty out-of-range slice with its true total; the page clamps the index and fetches the valid slice. List request identity includes query, dataset/scenario, and latest request generation. Only the latest matching result updates page state.

## Usage example 1: classes with inline attendees

Assume feature-owned renderers and formatters exist; this is a usage sketch, not their implementation.

```tsx
const classColumns: readonly ColumnDef<ClassRow>[] = [
  { id: "name", accessorKey: "name", header: "Class",
    sortable: true, pinned: "left", width: 200 },
  { id: "instructorName", accessorKey: "instructorName",
    header: "Instructor", sortable: true, width: 180 },
  { id: "time", accessorFn: row => Date.parse(row.startsAt),
    header: "Time", sortable: true, width: 190,
    cell: ({ row }) => formatClassTime(row) },
  { id: "attendance", accessorKey: "bookedCount",
    header: "Attendance", sortable: true, width: 130,
    cell: ({ row }) => `${row.bookedCount} / ${row.capacity}` },
  { id: "status", accessorKey: "status", header: "Status",
    sortable: true, width: 130,
    cell: ({ row }) => <ClassStatus status={row.status} /> },
];

<DataTable<ClassRow, Attendee>
  caption="Class timetable"
  datasetKey="classes:v1"
  data={classes}
  columns={classColumns}
  getRowId={row => row.id}
  request={request}
  emptyMessage="No classes available."
  sorting={{ mode: "client", defaultState: null }}
  pagination={{ defaultState: { pageIndex: 0, pageSize: 10 } }}
  expansion={{
    mode: "inline",
    getChildren: row => row.attendees,
    getLabel: (row, expanded) =>
      `${expanded ? "Collapse" : "Expand"} ${row.name} attendees`,
    emptyMessage: "No attendees",
    renderChildren: ({ children }) => <AttendeeList attendees={children} />,
  }}
/>
```

The classes page receives all rows from `loadClasses`, drives the request state, and delegates client sorting/pagination to the table. Feature columns and renderers remain inside the Next.js client subtree.

## Usage example 2: inventory with manual requests and lazy details

Assume the page owns `query`, `result`, `request`, and `scenario`, and that it fetches `queryInventory(query, context)` when query/scenario changes with cancellation and latest-result guards. The callbacks use functional updates so a sort and page reset in one event compose correctly.

```tsx
<DataTable<InventoryRow, StockMovement>
  caption="Inventory component demo"
  datasetKey={`inventory:${scenario}:v1`}
  data={result.rows}
  columns={inventoryColumns}
  getRowId={row => row.id}
  request={request}
  emptyMessage="No inventory items available."
  sorting={{
    mode: "manual",
    state: query.sort,
    onChange: sort => setQuery(previous => ({ ...previous, sort })),
  }}
  pagination={{
    mode: "manual",
    totalRows: result.totalRows,
    state: query.pagination,
    onChange: pagination =>
      setQuery(previous => ({ ...previous, pagination })),
  }}
  expansion={{
    mode: "lazy",
    emptyMessage: "No stock movements",
    getLabel: (row, expanded) =>
      `${expanded ? "Collapse" : "Expand"} ${row.name} stock movements`,
    loadChildren: (row, { signal }) =>
      loadStockMovements(row.id, { signal, scenario: childScenario }),
    renderChildren: ({ children }) => <StockMovementList movements={children} />,
  }}
/>
```

`inventoryColumns` is a `readonly ColumnDef<InventoryRow>[]` with the documented sort IDs and a 200px left-pinned name column. The client-mode demo uses all rows from `loadInventory`, keeps the same parent-owned state, and changes processing configs to client mode without manual totalRows. Switching processing mode resets pageIndex to 0 and discards stale list requests. This demonstrates controlled client processing as well as manual processing; the classes page demonstrates uncontrolled usage.

Child scenario changes must also invalidate cached child results before demonstrating another scenario. Either include a child-scenario generation in datasetKey or provide a deliberate Reset demo action that changes that key. This scope reset is intentional and may clear expansion; explain it alongside the demo controls.

## Acceptance and review boundary

User testing preference: concise test planning and meaningful behavior/regression coverage, not test quantity or artificial coverage targets. Tests should accompany the features they protect; avoid setup-only filler tests.

- Columns reject nonexistent scalar property names; cells retain the parent row type; child rendering retains the independent child type.
- Types reject both state and defaultState, a controlled value without its callback, mixed inline/lazy loaders, and client sorting over manual pages.
- Runtime guards cover untyped invalid sort/page/width inputs and unsupported data-processing combinations.
- The API accommodates the approved sort cycle, page resets, independent child failures, cached details, dataset scope resets, skeletons, and accessible labels.
- No table library, global state library, endpoint, testing tool, or additional product feature is introduced.

The user approved this API design after a fresh read-only builder check found no important unanswered planning questions or blocking API inconsistencies. Exact internal hooks, file decomposition, and verification commands belong to the later implementation plan. Test tools were subsequently approved and configured in Step 5; each implementation milestone still needs its own approval. Mock models, service signatures, table/column/expansion declarations, and usage examples remain design-only pending their approved implementation milestones.

## Documentation consulted

- [TypeScript generics](https://www.typescriptlang.org/docs/handbook/2/generics.html): property constraints and typed object access.
- [TypeScript narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html): discriminated configuration unions.
- [React state ownership](https://react.dev/learn/sharing-state-between-components): controlled/uncontrolled components and a single owner for each state.

Current official documentation was fetched through Context7 during this design step.
