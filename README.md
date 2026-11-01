# HL Fitness Studio

Reusable, typed data table built from scratch for a fitness studio assessment. The class timetable demonstrates both inline and on-demand attendees; the inventory page demonstrates lazy stock history and controlled client/simulated-server processing. No table/grid library or backend is used.

**Live demo:** [HL Fitness Studio](https://fitnessstudio-beta.vercel.app/) · [Inventory demo](https://fitnessstudio-beta.vercel.app/inventory)

## Requirements

Node.js 24 or newer and npm 10 or newer. Setup is verified using Node.js 24.16.0.

## Run locally

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The HL Fitness Studio timetable loads 12 mock classes in Singapore time.

The root URL redirects to `/classTimetable`. The two feature routes are `/classTimetable` and `/inventory`, each with its own `src/app/<route>/page.tsx`. Both share the root layout and compact workspace presentation.

## Verify

```sh
npm run lint
npm run typecheck
npm run build
```

To run the production build locally:

```sh
npm start
```

## Tests

The testing tools are configured for meaningful feature and regression checks. Unit checks protect mock services, generic cells/request states, stable scalar sorting, pagination/reset behavior, controlled/manual processing, invalid input, and timetable error/retry/cleanup. Browser checks exercise keyboard sorting, page navigation, page sizes, and pinned-column behavior on desktop/mobile. Type fixtures reject competing state owners, missing callbacks/totals, and client sorting of manual pages. There are no placeholder tests or test-count/coverage targets.

- Unit/component tests: `tests/unit/**/*.test.ts` or `.test.tsx` using Vitest, React Testing Library, DOM matchers, and user-event. React JSX, jsdom, automatic cleanup, and the `@/` source alias are configured. Import `test`, `expect`, and other test APIs from `vitest`; globals are disabled.
- Browser tests: `tests/e2e/**/*.spec.ts` using Playwright. The same checks run in desktop Chromium and a 375px mobile Chromium viewport. The runner builds and starts the app on `127.0.0.1:3100` and closes that server when finished. It rejects an already occupied test port so it cannot silently exercise another server. Traces and screenshots are retained on failures.

```sh
npm test
npm run test:watch
npm run test:e2e:install
npm run test:e2e
```

Run the browser-install command once after installing packages, and again when a Playwright update requires a new browser version. Unit and browser discovery are separate, and both runners now contain feature checks. Temporary tooling probes were removed after setup verification.

The browser HTML report is written to `playwright-report/`, with diagnostics under `test-results/`. These generated folders, as well as coverage output, are ignored by Git and ESLint.

The [verification record](docs/verification.md) maps the assessment requirements to implementation and evidence, including measured performance and the checks' practical limits. A reproducible in-memory sorting measurement is available with `node scripts/measure-table.mjs` on Node 24; generated stress rows are never shipped as fixtures.

## Mock data and services

Local JSON under `src/mocks/data/` stores **12 classes** with inline attendees, **100 inventory items**, and separate per-item stock movements. There are no API endpoints or backend. This smaller dataset replaces the earlier large stress-test proposal.

`services.ts` imports the JSON directly. Each async service waits for the simulated request, handles the empty scenario, and returns a copy of its data. `request.ts` handles shared delays, cancellation and one-shot failures; `src/types/mock.ts` contains the small shared contracts. Fixture status values are checked by tests rather than a runtime validation layer for these owned JSON files.

Shared types live in `src/types/`: `table.ts` defines the generic table contract and sort/page state, `timetable.ts` defines class/attendee models, `inventory.ts` defines inventory/stock-movement models, and `mock.ts` defines mock request contracts. Component-only props stay with their components.

Styling uses Tailwind CSS 4 utilities in the components. `src/app/globals.css` is the only stylesheet: it defines shared color tokens, base defaults, direct-child table rules that avoid styling nested detail tables, and a reduced-motion fallback for loading skeletons. There are no CSS Modules or separate styles folder. Dynamic column widths and pinned offsets remain inline because they come from the table configuration.

The timetable formatter holds its locale (`en-SG`) and timezone (`Asia/Singapore`) locally. Inventory prices use Singapore dollars (`SGD`, shown as `S$`) in the inventory column formatter. Fixture timestamps include `+08:00`; inventory prices use integer cents. All records are fictional and deterministic.

Import these asynchronous services from `@/mocks/services`:

- `loadClasses(context?)`: all classes with their inline attendee arrays.
- `loadAttendees(classId, context?)`: attendees for one class, delivered on demand through the same latency/error/cancellation simulator. Unknown classes return an empty list. Attendee failures are independent per class and independent of the class list.
- `loadInventory(context?)`: all inventory rows for client processing.
- `queryInventory({ sort, pagination }, context?)`: simulated server sorting/pagination, returning `{ rows, totalRows }`. Sort IDs are `name`, `sku`, `category`, `stock`, and `unitPriceCents`. English, case-insensitive, numeric-aware string comparison and numeric price/stock sorting are stable; sorting happens before pagination. Null/unknown sort IDs preserve fixture order.
- `loadStockMovements(itemId, context?)`: details for one inventory row; some items intentionally have empty detail lists. Unknown item IDs also return an empty list.
- `resetMockFailures()`: re-arm the failure scenarios when demo controls deliberately start a new scenario.

Context accepts `{ scenario, signal }`. Scenarios are `normal` (500ms), `slow` (2,000ms), `empty`, and `error`. Empty/error requests use the normal delay. Errors fail once per operation, or per item for stock movements, so retrying the same request succeeds. Full and paged inventory share the same list operation. Parent and child failures are independent. Scenario controls should call `resetMockFailures()` before demonstrating a new failure cycle. An aborted request rejects with `AbortError` and does not consume a one-shot error.

Page indexes are zero-based. Invalid/negative indexes fall back to zero; invalid sizes fall back to 10. An out-of-range page returns no rows and the true total so the future page owner can clamp and refetch. New results contain detached records to keep caller mutation and sorting from changing the fixture source. The page will own latest-request guards when the services are connected to the UI.

To regenerate the same JSON fixtures:

```sh
npm run mocks:generate
```

Focused service tests cover fixture consistency, global sorting before paging, original-order recovery, empty/invalid queries, child details, delayed loading, independent recoverable errors, and cancellation.

## Foundation

- Next.js App Router with React and strict TypeScript.
- Tailwind CSS v4 and HeroUI v3 using their global CSS imports.
- npm with a lockfile for reproducible installations.
- ESLint with the Next.js Core Web Vitals and TypeScript rules.
- `src/app` for routes and layout; `@/*` resolves to `src/*`.
- `npm run typecheck` generates route types before checking TypeScript, so it also works before the first build.

ESLint 9 and TypeScript 5.9 are selected for compatibility with the installed Next.js lint plugins. At setup verification, npm reported 16 moderate development-tool findings propagated from `minimatch`; the runtime-only audit reported zero vulnerabilities. No forced downgrade or incompatible dependency override has been applied.

HeroUI supplies only non-table primitives (Skeleton and Retry Button). The table itself uses native HTML and custom layout; no table/grid library is included.

## Table API

`DataTable<T>` is in `src/components/data-table/`. Supply typed columns, data, a stable string row ID, dataset key, accessible caption, and optional request/empty state. A column chooses either a scalar property accessor or a scalar-producing function; custom cells receive the full typed row. Pinned columns require pixel widths and are grouped on the left. Unpinned columns share extra desktop space while preserving the declared minimum table width.

```tsx
import { DataTable } from "@/components/data-table/DataTable";
import type { ColumnDef } from "@/types/table";

type Product = { id: string; name: string; stock: number };
const columns: readonly ColumnDef<Product>[] = [
  { id: "name", accessorKey: "name", header: "Product", pinned: "left", width: 200, sortable: true },
  { id: "stock", accessorKey: "stock", header: "Stock", width: 140, sortable: true },
];

<DataTable<Product>
  caption="Products"
  datasetKey="products:v1"
  data={products}
  columns={columns}
  getRowId={row => row.id}
  request={{ status: "ready" }}
  emptyMessage="No products available."
  sorting={{ mode: "client", defaultState: null }}
  pagination={{ defaultState: { pageIndex: 0, pageSize: 10 } }}
/>
```

Changing datasetKey resets local viewport and uncontrolled interaction state; new data arrays in the same scope do not. Loading uses column-matched skeleton rows (current page size by default) and an accessible announcement; errors expose the caller's Retry callback. Duplicate/empty row and column identities produce developer configuration errors. The feature page owns asynchronous fetching, cancellation, and stale-result guards; the table imports no fixture or feature model.

### Sorting and pagination strategy

Omitted sorting/pagination configuration defaults to client processing, no active sort, and 10 parent rows per page with 10/25/50 size options. `sorting={false}` or `pagination={false}` disables that feature independently. Sortable headers cycle ascending, descending, and original input order; sort happens over the full dataset before paging. Ties stay in original order, and null/undefined/non-finite numbers/invalid Dates stay last in both directions. String comparison is English, case-insensitive, and numeric-aware. Custom row comparators must return a finite ordering number; numeric default comparisons handle the full finite range without subtraction overflow. Input arrays are not mutated.

Each group accepts either `defaultState` (table-owned state, optional notification callback), or `state` with required `onChange` (parent-owned state). State ownership is separate from processing: controlled values work in client mode too. Do not switch ownership on a mounted table; deliberately remount if required. Changes are emitted only from user actions, never while rendering. Sort/page-size actions reset to page index 0; controlled parents should compose sort and page callbacks using functional state updates.

Manual sorting requires controlled state and trusts supplied row order. Manual pagination requires controlled state plus a non-negative integer `totalRows`, and renders supplied page data without slicing again. Combine it with manual or disabled sorting; client sorting of a partial server page is rejected by types and runtime validation. Manual sorting plus client pagination is supported when the parent supplies the complete sorted dataset. See the [API design's manual example](docs/superpowers/specs/2026-11-01-data-table-api-design.md) for callbacks and mock-service integration.

Page indexes are zero-based in the API and one-based in labels. Invalid sizes fall back to 10; options are sanitized/deduplicated and include the current valid size. Out-of-range client pages clamp to a valid page and stay clamped when data grows again. Controlled state is validated for display without repair callbacks; the manual parent owns normalization/refetch when totals shrink. Empty/loading/error states disable navigation, and pending/error requests disable sort headers. `aria-sort`, labeled buttons/selects, visible focus, and live range summaries support keyboard and screen-reader use.

The timetable displays 12 classes across two default pages. **Attendee loading** selects Inline (default, already-loaded attendees) or On-demand (calls `loadAttendees` only when a class expands). Both show the same customer/payment/status columns. On-demand includes row-local skeletons, empty/error/retry states and successful-result caching. Changing modes resets sorting, pagination and open/cached details, and cancels pending attendee requests. Shared navigation links the timetable to `/inventory`.

### Row expansion

`DataTable<T, TChild>` accepts an optional typed `expansion` group. Inline mode uses `getChildren`; lazy mode uses `loadChildren(row, { signal })`. Both require `renderChildren({ row, children })`, allowing feature-owned child markup with a different shape from the parent. Optional `canExpand`, `getLabel`, and `emptyMessage` customize disclosure behavior and accessible copy.

```tsx
expansion={{
  mode: "lazy",
  loadChildren: (row, { signal }) => loadStockMovements(row.id, { signal }),
  renderChildren: ({ row, children }) =>
    <StockMovementList itemName={row.name} movements={children} />,
  emptyMessage: "No stock movements",
}}
```

Multiple rows can stay open. Open state and successful child results, including empty lists, are retained by stable row ID across sorting and pagination. Pending requests deduplicate; errors and Retry remain local to the row. Collapsing allows an existing request to finish and cache its result without reopening the row. Replacing `datasetKey` or unmounting aborts pending work and ignores late results. Change the dataset key when cached child data should be invalidated.

Details occupy a full-width cell below their parent and do not affect pagination totals. Disclosure buttons expose expanded state and associated panel IDs. Collapsed panels are inert and hidden from assistive technology; closing markup is released after the transition. Reduced-motion settings disable animation. The timetable demonstrates both modes with attendees; inventory demonstrates reuse with lazy stock movements.

## Inventory demo

Open [Inventory](http://localhost:3000/inventory), or use the shared navigation. It uses the same DataTable with item/SKU/category/stock/unit-price columns, 100 fictional items, S$ prices and Singapore stock-movement timestamps.

- **Client:** fetches the complete dataset once; controlled sorting and pagination run inside the table.
- **Simulated server:** fetches the sorted page from `queryInventory`; the table receives manual configurations and the full total. This is a local asynchronous simulation, with no API endpoint.
- **List response / Detail response:** independently choose Normal (500ms), Slow (2s), Empty or Error. Error fails once for the operation, then Retry succeeds. Detail errors leave the parent table usable.
- **Reset demo:** restores Client/Normal defaults, re-arms errors and clears cached/open details. Changing any demo setting also clears details and returns to page 1; mode/scenario changes preserve sort and page size. Ordinary sorting and pagination preserve record-linked details within the current scope.

Expand an item to load Date/time, Quantity change and Reason. Successful/empty results cache until the scope changes. Request cleanup and latest-result guards prevent replaced list/detail responses from appearing. Manual totals that shrink clamp the requested page and refetch it.

The focused hook/component checks protect request races, page resets, manual clamping, SGD formatting and independent detail recovery. Production browser journeys exercise both routes and both processing modes, scenario replacement, retries, empty results, keyboard controls and mobile pinned-column scrolling.

## Examples from the two datasets

The runnable integrations are [Timetable](src/features/timetable/Timetable.tsx) with [class columns](src/features/timetable/columns.tsx), and [InventoryDemo](src/features/demo/InventoryDemo.tsx) with [inventory columns](src/features/demo/inventory-columns.tsx). Column accessors provide sortable scalars; cells and child renderers retain their full independent row types.

Timetable uses `DataTable<ClassRow, Attendee>` and table-owned sort/page state. Its default inline expansion group is:

```tsx
const expansion: ExpansionConfig<ClassRow, Attendee> = {
  mode: "inline",
  getChildren: row => row.attendees,
  getLabel: (row, expanded) =>
    `${expanded ? "Collapse" : "Expand"} ${row.name} attendees`,
  emptyMessage: "No attendees",
  renderChildren: ({ row, children }) =>
    <AttendeeList classTitle={row.name} attendees={children} />,
};
```

On-demand mode replaces `mode`/`getChildren` with `mode: "lazy"` and `loadChildren: (row, { signal }) => loadAttendees(row.id, { signal })`. Both share the same presentation options. A mode-specific dataset key clears the old scope when switching. These remain simulated asynchronous calls over local fixtures, not backend HTTP requests.

Inventory uses `DataTable<InventoryRow, StockMovement>`. Its feature hook owns the query and fetches either complete rows or a single server-simulated page. In manual mode it passes:

```tsx
sorting={{ mode: "manual", state: demo.query.sort, onChange: demo.changeSort }}
pagination={{
  mode: "manual",
  state: demo.query.pagination,
  onChange: demo.changePage,
  totalRows: demo.totalRows,
}}
expansion={{
  mode: "lazy",
  loadChildren: (row, { signal }) =>
    loadStockMovements(row.id, { signal, scenario: demo.childScenario }),
  renderChildren: ({ row, children }) =>
    <StockMovementList itemName={row.name} movements={children} />,
  emptyMessage: "No stock movements",
}}
```

These are configuration excerpts; the linked components include imports, columns, request ownership and complete JSX. Client mode keeps the same parent-owned query while changing both processing groups to `client` and supplying all rows.

## Design decisions and tradeoffs

| Decision | Reason and limit |
| --- | --- |
| React state and focused hooks | Interaction state is local to one table/page; a global store would add coordination without a shared-data requirement. Controlled values have one parent owner; uncontrolled values stay inside the table. |
| Column-driven generic API | Scalar accessors separate sort values from feature presentation. Discriminated configurations reject competing state owners and unsafe client sorting over manual pages. No public `any` is required. |
| Native tables and CSS sticky | Pinned cells use explicit pixel widths, cumulative left offsets, opaque backgrounds and stacking order. Pinned columns are grouped first; a divider and scroll-dependent shadow show overlap. The surrounding region owns horizontal overflow, including child tables. |
| Sort then paginate | Stable sorting processes the full client dataset; memoized processing and page-limited rendering keep the DOM small. There is no virtualization; unusually large pages or many open child records can still increase rendering cost. |
| Feature-owned async requests | The generic component imports no fixture/domain model. AbortSignal and latest-result guards protect replaced requests; a dataset key deliberately scopes expansion/cache lifetime. |
| Local JSON and simulated server | Deterministic fictional data makes failures and latency reviewable without infrastructure. Manual sorting/pagination demonstrate the real component contract, but do not prove remote network/backend performance. |
| Successful child cache | Includes empty results and avoids repeated requests in one scope. Cache is in memory, has no time-based refresh and is cleared through a new dataset key. The fixtures are static; live mutable data would need an invalidation policy. |

Assumptions: single-column sorting, English numeric-aware comparison, stable unique string IDs, static fictional records, Singapore time and SGD integer cents. Viewing and inspection are the complete product scope; editing, authentication, persistence and inventory operations are excluded. HeroUI supplies only non-table primitives.

## Release status

Source repository: [HtetLinLinNaing/fitness_studio](https://github.com/HtetLinLinNaing/fitness_studio). The user deployed the website on Vercel at [fitnessstudio-beta.vercel.app](https://fitnessstudio-beta.vercel.app/). Both public routes returned HTTP 200 with the expected page titles when checked. Production entry points are `npm run build` and `npm start`; no secrets, database or application environment variables are required by this implementation.

## Approval workflow

Before each step, propose its scope and any dependency, style, or behavior decisions. Wait for user approval, build only the approved step, and stop for user review.

Step 1 includes only setup and a plain placeholder. Dashboard styling, table implementation, mock data, demo routes, testing tools, repository publication, and deployment require approval in later steps.

Steps 1–11 are accepted, and public GitHub publication is approved. Vercel deployment is handled by the user. The selected design uses stronger sans-serif typography/contrast and the HL Fitness Studio name. See the [approved PRD](docs/superpowers/specs/2026-11-01-reusable-data-table-design.md), [component API](docs/superpowers/specs/2026-11-01-data-table-api-design.md), and [verification record](docs/verification.md).
