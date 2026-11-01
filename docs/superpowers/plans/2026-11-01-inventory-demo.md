# Inventory Demo Implementation Plan — Step 10

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Demonstrate the existing reusable table with inventory columns, controlled client/manual processing, lazy stock movements, and independent request scenarios.

**Architecture:** A feature hook owns query, mode, scenario and list requests. The existing generic table processes complete client datasets or trusts manually sorted/paged results. Feature-owned columns and movement markup format SGD prices and Singapore timestamps. A shared page shell preserves the accepted branding and navigation.

**Tech Stack:** existing Next.js, React, strict TypeScript, CSS Modules, native table, HeroUI non-table primitives, Vitest/RTL and Playwright. No new dependencies or backend.

**Spec:** `../specs/2026-11-01-reusable-data-table-design.md` and `../specs/2026-11-01-data-table-api-design.md`. User approved the inventory direction and then this implementation plan before product code changes.

## Global Constraints

- Reuse DataTable; no table/grid library or domain fields inside generic table internals.
- Use the existing 100 fictional inventory items and stock-movement JSON through mock services.
- Preserve approved sans-serif typography, stronger contrast, forest-green palette and HL Fitness Studio branding.
- Prices use integer cents formatted as S$; timestamps use Asia/Singapore.
- Sorting cycles ascending/descending/original order; default 10 parent rows and 10/25/50 size options. Parent counts exclude details.
- Client mode uses complete data; simulated server mode sorts before paging. Parent owns sort/page state in both modes.
- Independent list/detail scenarios: Normal, Slow, Empty, Error. Errors recover through Retry.
- Scope covers Step 10 only; final project QA/publication remain Steps 11/12.

## Proposed page and controls

- Add `/inventory`, titled Inventory, and a navigation link beside Class timetable on both pages.
- Keep the existing page/card structure. Show item name pinned left, SKU, category, stock quantity and unit price. All five columns sortable.
- Put a compact, labeled demo-controls area above the table: Processing (Client / Simulated server), List response, Detail response, Reset demo.
- Default to Client, Normal list and Normal details. Each scenario offers Normal (500ms), Slow (2s), Empty and Error.
- Explain briefly that responses are simulated. Changing mode resets page to 1 while retaining sort/page size. Changing scenarios or resetting clears open details/cache and resets page to 1. Reset restores all defaults and re-arms errors.
- Expand an item to show a feature-owned stock-movement table: Date/time, Quantity change and Reason. Positive changes show a plus sign. Empty results show No stock movements.
- Detail scenarios operate separately from list scenarios. Keep controls usable while loading so reviewers can exercise request replacement.

## Review Focus

- Fast mode/query/scenario changes must never display stale results or retain a mismatched total.
- Manual responses must not be sorted/sliced twice; out-of-range totals must clamp/refetch without loops.
- Changing child scenarios must invalidate caches and abort old requests without reopening rows.
- Recoverable list errors must preserve the requested query; child errors must leave parent controls working.
- Navigation, controls, nested details and pinned cells must remain usable at 375px and by keyboard.

## Task 1: Inventory request owner

**Files:** create `src/features/demo/use-inventory-demo.ts`; tests `tests/unit/inventory-demo.test.tsx`. Consume existing models in `src/features/demo/types.ts`, service interfaces in `src/mocks/services.ts`, and table state types.

**Interfaces:** `useInventoryDemo()` returns rows, totalRows, request, query, mode, listScenario, childScenario, datasetKey, and actions for sort/page/mode/scenarios/reset. Mode is `client | manual`. List service is loadInventory in client mode and queryInventory in manual mode. Query uses existing ListQuery.

- [x] Write failing behavior checks: client loads full 100 rows; manual returns only the requested page and total 100; sort/size/mode reset page appropriately; newest request wins when old work ignores cancellation; retry preserves query; scenario reset invalidates scope; shrinking totals clamp/refetch once.
- [x] Run `npm test -- tests/unit/inventory-demo.test.tsx`; expected RED before hook implementation.
- [x] Implement hook with AbortController and generation guards. Keep requests tied to the exact mode/query/scenario. Re-arm failures on deliberate scenario/reset actions, never on ordinary retry. Treat client sort/page changes as local processing rather than new list requests.
- [x] Run focused checks; expected PASS.

## Task 2: Inventory page and lazy details

**Files:** create `src/app/inventory/page.tsx`, `src/features/demo/InventoryDemo.tsx`, `inventory-columns.tsx`, `StockMovementList.tsx`, `inventory-demo.module.css`, `src/components/studio-shell/StudioShell.tsx` and shell CSS. Modify Timetable to use the shared shell without changing its content. Extend `tests/unit/inventory-demo.test.tsx` and add `tests/e2e/inventory.spec.ts`.

**Interfaces:** `InventoryDemo()` consumes Task 1. Columns are `readonly ColumnDef<InventoryRow>[]` with existing service sort IDs name/sku/category/stock/unitPriceCents. `StockMovementList({ movements })` receives readonly StockMovement[]. Expansion calls `loadStockMovements(row.id, { signal, scenario: childScenario })` and uses datasetKey to invalidate results intentionally.

- [x] Write failing page checks for labeled mode/scenario controls, S$ prices, independent detail error/retry and an empty movement list. Run focused tests; expected RED before UI implementation.
- [x] Build the page, controls, shared shell and child renderer. Reuse existing table; pass controlled client configs or controlled manual configs with totalRows. Fetch only the rows appropriate to the selected mode.
- [x] Add desktop/mobile browser journeys proving navigation between both routes, identical full-dataset sort results across modes, page changes, lazy detail retry, empty details, pending scenario replacement, keyboard controls and contained horizontal scrolling.
- [x] Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run test:e2e`; expected all PASS. Browser runner includes a production build. Inspect desktop/mobile screenshots.
- [x] Obtain one fresh read-only review. Fix material findings with a failing regression check first; update README, PRD and roadmap with actual behavior/evidence.
- [x] Stage only milestone files, run `git diff --cached --check`, and commit `feat: add inventory demo and scenario controls`. Stop for user review; do not begin Step 11.

## Planning record

- Main assistant implements in the current feature checkout; a fresh reviewer checks the completed milestone, consistent with prior steps.
- No new data generation, dependencies, API routes, editing forms or inventory management operations.
- Self-review: existing service signatures and grouped API support this scope; both tasks share ListQuery, table state and datasetKey. Focused checks cover the identified request/cache risks rather than a test-count target.
- Skills at execution: executing-plans, test-driven-development, verification-before-completion and requesting-code-review; Context7 for framework/library guidance as needed.

## Execution record

- Initial working-tree edits recorded Step 9 acceptance and this approved plan; source base was `48428a2` on `feature/reusable-data-table`.
- Tests were written and run before each implementation: initial hook/page runs failed because the new modules did not yet exist. Hook checks then passed, followed by the full 30-check unit suite including the real mock-service inventory page integration.
- Browser run initially found an ambiguous test locator: Next.js route announcements also use role=alert. Scoped assertions to the inventory table. Production desktop/mobile journeys for both pages then passed (4 journeys); screenshots inspected.
- Refactored only the common header/navigation into StudioShell and removed obsolete timetable header rules. Generic DataTable internals did not change.
- Fresh read-only review found no Critical/Important issues, deferred minors or declined judgments.
- Context7 official React guidance supported effect cleanup/stale-response guards; Next.js guidance supported Link navigation and route metadata.
- Final verification: 30 unit checks, lint and typecheck pass; production build and 4 desktop/mobile browser journeys pass. The user accepted Step 10 after reviewing commit `94c4d86`. No dependencies added; no Step 11/12 work started.
