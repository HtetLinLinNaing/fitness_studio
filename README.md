# HL Fitness Studio

Reusable data table interview project with a working basic class timetable, local mock services, and an approved step-by-step roadmap.

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

The testing tools are configured for meaningful feature and regression checks. Current unit tests protect mock services, generic cells/request states, and timetable error/retry/cleanup behavior. Browser checks verify the production timetable on desktop and mobile, including actual pinned-column geometry and keyboard scrolling. Type-check fixtures also reject unavailable future sorting options. There are no placeholder tests or test-count/coverage targets.

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

## Basic table usage — Step 7

`DataTable<T>` is in `src/components/data-table/`. Supply typed columns, data, a stable string row ID, dataset key, accessible caption, and optional request/empty state. A column chooses either a scalar property accessor or a scalar-producing function; custom cells receive the full typed row. Pinned columns require pixel widths and are grouped on the left. Unpinned columns share extra desktop space while preserving the declared minimum table width.

```tsx
const columns: readonly ColumnDef<Product>[] = [
  { id: "name", accessorKey: "name", header: "Product", pinned: "left", width: 200 },
  { id: "stock", accessorKey: "stock", header: "Stock", width: 140 },
];

<DataTable<Product>
  caption="Products"
  datasetKey="products:v1"
  data={products}
  columns={columns}
  getRowId={row => row.id}
  request={{ status: "ready" }}
  emptyMessage="No products available."
/>
```

Changing datasetKey resets local viewport state; new data arrays in the same scope do not. Loading uses column-matched skeleton rows and an accessible announcement; errors expose the caller's Retry callback. Duplicate/empty row and column identities produce developer configuration errors. The feature page owns asynchronous fetching, cancellation, and stale-result guards; the table imports no fixture or feature model.

This milestone is the foundation subset of the approved API. All 12 classes currently render together. Sorting metadata/configuration, pagination, expansion, and the inventory demo screen are introduced in later approved steps; unsupported props are rejected rather than accepted without behavior. Navigation currently exposes only the implemented timetable route. Error/retry and empty states are covered by component checks; reviewer scenario controls belong to the later demo route.

## Approval workflow

Before each step, propose its scope and any dependency, style, or behavior decisions. Wait for user approval, build only the approved step, and stop for user review.

Step 1 includes only setup and a plain placeholder. Dashboard styling, table implementation, mock data, demo routes, testing tools, repository publication, and deployment require approval in later steps.

Steps 1–6 are accepted. Step 7 (basic table/timetable) is implemented and awaiting user review. The selected design is Calm studio with the HL Fitness Studio name. Future steps require separate approval; see the [full roadmap and skill log](docs/superpowers/project-roadmap.md), [approved PRD](docs/superpowers/specs/2026-11-01-reusable-data-table-design.md), [visual design](docs/superpowers/specs/2026-11-01-dashboard-visual-options.md), [component API](docs/superpowers/specs/2026-11-01-data-table-api-design.md), and [Step 7 execution record](docs/superpowers/plans/2026-11-01-basic-table-timetable.md).
