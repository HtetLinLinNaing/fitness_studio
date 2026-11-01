# HL Fitness Studio

Reusable data table interview project with a sortable, paginated class timetable, local mock services, and an approved step-by-step roadmap.

See the [project roadmap and skill usage](docs/superpowers/project-roadmap.md) for the complete 12-milestone proposal, approval status, and Superpowers skills used.

## Requirements

Node.js 24 or newer and npm 10 or newer. Setup is verified using Node.js 24.16.0.

## Run locally

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The HL Fitness Studio timetable loads 12 mock classes and displays the approved Calm studio design in Singapore time.

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

## Mock data and services

Local JSON under `src/mocks/data/` stores **12 classes** with inline attendees, **100 inventory items**, and separate per-item stock movements. There are no API endpoints or backend. This smaller dataset replaces the earlier large stress-test proposal.

Studio defaults in `src/config/studio.ts` explicitly use **HL Fitness Studio**, Singapore time (`Asia/Singapore`), and Singapore dollars (`SGD`, shown as `S$`). Fixture timestamps include `+08:00`; inventory prices use integer cents. All records are fictional and deterministic.

Import these asynchronous services from `@/mocks/services`:

- `loadClasses(context?)`: all classes with their inline attendee arrays.
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

## Table usage — through Step 9

`DataTable<T>` is in `src/components/data-table/`. Supply typed columns, data, a stable string row ID, dataset key, accessible caption, and optional request/empty state. A column chooses either a scalar property accessor or a scalar-producing function; custom cells receive the full typed row. Pinned columns require pixel widths and are grouped on the left. Unpinned columns share extra desktop space while preserving the declared minimum table width.

```tsx
import { DataTable } from "@/components/data-table/DataTable";
import type { ColumnDef } from "@/components/data-table/types";

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

The timetable displays 12 classes across two default pages, with inline attendee details. Navigation currently exposes only the timetable route; inventory and scenario controls belong to Step 10 and require separate approval.

### Row expansion

`DataTable<T, TChild>` accepts an optional typed `expansion` group. Inline mode uses `getChildren`; lazy mode uses `loadChildren(row, { signal })`. Both require `renderChildren({ row, children })`, allowing feature-owned child markup with a different shape from the parent. Optional `canExpand`, `getLabel`, and `emptyMessage` customize disclosure behavior and accessible copy.

```tsx
expansion={{
  mode: "lazy",
  loadChildren: (row, { signal }) => loadStockMovements(row.id, { signal }),
  renderChildren: ({ children }) => <MovementList movements={children} />,
  emptyMessage: "No stock movements",
}}
```

Multiple rows can stay open. Open state and successful child results, including empty lists, are retained by stable row ID across sorting and pagination. Pending requests deduplicate; errors and Retry remain local to the row. Collapsing allows an existing request to finish and cache its result without reopening the row. Replacing `datasetKey` or unmounting aborts pending work and ignores late results. Change the dataset key when cached child data should be invalidated.

Details occupy a full-width cell below their parent and do not affect pagination totals. Disclosure buttons expose expanded state and associated panel IDs. Collapsed panels are inert and hidden from assistive technology; closing markup is released after the transition. Reduced-motion settings disable animation. The timetable demonstrates inline attendees; lazy loading is protected by focused component tests and will be connected to inventory in Step 10.

## Approval workflow

Before each step, propose its scope and any dependency, style, or behavior decisions. Wait for user approval, build only the approved step, and stop for user review.

Step 1 includes only setup and a plain placeholder. Dashboard styling, table implementation, mock data, demo routes, testing tools, repository publication, and deployment require approval in later steps.

Steps 1–8 are accepted. Step 9 is implemented and awaiting user review. The selected design uses stronger sans-serif typography/contrast and the HL Fitness Studio name. Future steps require separate approval; see the [full roadmap and skill log](docs/superpowers/project-roadmap.md), [approved PRD](docs/superpowers/specs/2026-11-01-reusable-data-table-design.md), [component API](docs/superpowers/specs/2026-11-01-data-table-api-design.md), and [Step 9 execution record](docs/superpowers/plans/2026-11-01-row-expansion.md).
