# HL Fitness Studio

A fitness studio dashboard built with Next.js, React and TypeScript. Its reusable data table is built from scratch using native HTML tables. HeroUI supplies only buttons and skeletons.

[Live timetable](https://fitnessstudio-beta.vercel.app/) · [Inventory demo](https://fitnessstudio-beta.vercel.app/inventory) · [GitHub repository](https://github.com/HtetLinLinNaing/fitness_studio)

## Run locally

Use Node.js 24+ and npm 10+.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No backend, database or environment variables are needed.

## Try the demos

| Page | What it demonstrates |
| --- | --- |
| `/classTimetable` | 12 classes, sorting, pagination, and inline or on-demand attendees |
| `/inventory` | 100 items, client or simulated server processing, and on-demand stock history |

Click a column heading to cycle through ascending, descending and original order. Expand a row to see its details.

On Inventory, use **List response** and **Detail response** to try slow, empty and failed requests. An error fails once so **Retry** can succeed. **Reset demo** restores the defaults.

All records are fictional. Dates use Singapore time; prices use Singapore dollars.

## Use the table

`DataTable<T, TChild>` accepts any parent and child row types. Columns define what to display and how to sort it.

```tsx
import { DataTable } from "@/components/data-table/DataTable";
import type { ColumnDef } from "@/types/table";

type Product = { id: string; name: string; stock: number };

const products: Product[] = [
  { id: "mat-1", name: "Yoga mat", stock: 12 },
];

const columns: readonly ColumnDef<Product>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Product",
    sortable: true,
    pinned: "left",
    width: 200,
  },
  {
    id: "stock",
    accessorKey: "stock",
    header: "Stock",
    sortable: true,
    cell: ({ row }) => `${row.stock} units`,
  },
];

export function ProductTable() {
  return (
    <DataTable<Product>
      caption="Products"
      datasetKey="products:v1"
      data={products}
      columns={columns}
      getRowId={row => row.id}
    />
  );
}
```

| Column option | Purpose |
| --- | --- |
| `id` | Unique column identifier |
| `accessorKey` or `accessorFn` | Read a value from the row, or calculate one |
| `header` | Column heading |
| `cell` | Optional custom display using the typed row |
| `sortable` | Enable header sorting |
| `compare` | Optional custom row comparison |
| `width` | Column width in pixels; required for pinned columns |
| `pinned: "left"` | Keep the column visible during horizontal scrolling |

Rows need stable, unique string IDs. Change `datasetKey` when replacing a dataset or clearing cached details; it resets the table's local state.

See [table types](src/types/table.ts) for the full API, or the working [timetable](src/components/classTimetable/ClassTimetable.tsx) and [inventory](src/components/inventory/Inventory.tsx) integrations.

## Sorting, pagination and state

The default is **client processing**: sort the full dataset, then show 10 rows per page. Page sizes are 10, 25 and 50. Sorting or changing page size returns to the first page. Sorting preserves the input array and keeps equal values in their original order.

State ownership and processing mode are separate choices:

| Setting | Who owns the state? | Who processes the data? |
| --- | --- | --- |
| Client with `defaultState` | The table | The table |
| Client with `state` and `onChange` | The parent | The table |
| Manual with `state` and `onChange` | The parent | The parent or server |

Manual pagination also requires `totalRows`. The table displays the supplied page without sorting or slicing it again. Use manual or disabled sorting with manual pagination; sorting only one server page would give misleading results.

The timetable uses table-owned state. Inventory uses parent-owned state in both modes. Its mock server sorts and paginates local JSON after a delay.

React state and focused hooks are sufficient because each page owns its own interactions. A global store would add complexity without a shared-state need. Use `sorting={false}` or `pagination={false}` to disable either feature. Page indexes in the API start at zero.

## Expandable rows

Both modes render details below the parent in a cell spanning all columns:

- **Inline:** `mode: "inline"` and `getChildren(row)` read children already included in the data.
- **On-demand:** `mode: "lazy"` and `loadChildren(row, { signal })` fetch children when the row opens.

Both use `renderChildren({ row, children })` to display the child records. Optional `getLabel`, `canExpand` and `emptyMessage` customize the disclosure.

On-demand rows have their own loading skeletons, error messages and Retry buttons. Successful results, including empty lists, are cached by row ID. Sorting and pagination preserve open state. Changing `datasetKey` clears the cache and cancels pending requests.

See [attendee rendering](src/components/classTimetable/AttendeeList.tsx) and [stock-history rendering](src/components/inventory/StockMovementList.tsx) for two different child datasets.

## Pinned columns and request states

Pinned cells use CSS `position: sticky`, explicit widths and cumulative left offsets. A shadow appears when content scrolls underneath. Below 520px, pinned widths and offsets shrink to 65% to leave more space for other columns.

The `request` prop controls the main table state:

- `ready`: display rows, or `emptyMessage` when there are none.
- `loading`: display skeleton rows matching the column layout.
- `error`: display the supplied message and `onRetry` action.

The table uses captions, labeled controls, keyboard interaction and ARIA state. Collapsed details are hidden from assistive technology. Expansion animation respects reduced-motion settings.

## Check the project

```sh
npm run lint
npm run typecheck
npm test
npm run test:e2e:install
npm run test:e2e
```

Install the browser once before the first browser-test run. The browser suite builds and starts the production app automatically.

For a local production preview, run `npm run build`, then `npm start`.

Tests cover sorting, pagination, both expansion modes, request failures, cancellation and responsive pinning. See the [verification record](docs/verification.md) for results and performance measurements.

## Tradeoffs and assumptions

- Single-column sorting and stable string row IDs keep the API focused.
- Pagination limits rendered rows. There is no virtualization; very large pages or many open details can still be expensive.
- Child results stay cached until the dataset key changes. Live data would need a refresh policy.
- Mock requests demonstrate server-style behavior, not real network or backend performance.
- Browser checks use Chromium. Other browsers and a full screen-reader audit remain outside the verified scope.

## Where to look

| Location | Responsibility |
| --- | --- |
| `src/components/data-table/` | Generic rendering, sorting, pagination and expansion |
| `src/types/table.ts` | Public table API |
| `src/components/classTimetable/` | Class columns, attendee display and fetching |
| `src/components/inventory/` | Inventory columns, controls and fetching |
| `src/mocks/` | Local JSON and simulated requests |
| `tests/` | Unit, type-contract and browser checks |
