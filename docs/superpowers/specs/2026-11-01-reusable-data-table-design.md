# Fitness Studio Data Table — PRD and Setup Design

Status: Step 1 setup scope approved by the user. All later steps require separate approval before implementation.
Date: 2026-11-01

## Intent and source

Build a self-contained fitness studio timetable dashboard that demonstrates a reusable, fully typed table. Staff use it to browse classes and inspect attendees; evaluators use a second demo to verify reuse and controlled behavior.

Requirements come from the supplied “Part 2 — Component Engineering Challenge: Reusable Data Table” brief. The user selected Next.js and HeroUI, requested project setup and a PRD first, and chose the lean setup with local mocked API functions.

## Goals

- Meet all required table features without a table/grid library.
- Keep the table independent of fitness-specific row shapes and presentation.
- Make inline and on-demand expansion, controlled sorting/pagination, and failure handling easy to verify.
- Deliver a readable, responsive mini app with documentation suitable for a public repository.
- Keep scope consistent with the brief's approximately four-to-six-hour expected effort; this is a scope guide, not a delivery promise.

## Non-goals and anti-goals

No backend, database, authentication, real payments, booking mutations, or production integrations. No general-purpose component library, elaborate dashboard sections, or calendar editor. Do not use HeroUI Table, TanStack Table, AG Grid, or any other table/grid package, including headless table engines. Do not hide missing behavior behind decorative UI or assume a server-rendered page proves server-side table support.

## Approaches

1. **Lean local mocks — selected by the user.** Next.js App Router, TypeScript, HeroUI for non-table controls, and asynchronous local mock functions. Artificial latency and failures exercise request behavior without endpoints. Best fit for the component-focused brief.
2. **Mock HTTP endpoints — considered.** The same foundation with Next.js Route Handlers. Offers real network requests but adds infrastructure without improving the required table contract. Not selected.

## Constraints and proposed setup

The repository folder is currently empty. Start one Next.js App Router application with TypeScript, ESLint, and Tailwind CSS compatible with the selected HeroUI release. Use the current compatible stable package versions at setup time, verify official guidance, and record exact versions in the lockfile. Do not mix HeroUI major-version setup instructions.

HeroUI supplies non-table buttons, fields, menus, chips, and skeleton primitives as needed. Native HTML supplies table, header, body, row, and cell semantics. The team owns all table behavior and styling. Interactive table/demo code lives within a client component boundary; layout and route wrappers may remain server components. Define callbacks and column renderers within the client subtree, avoiding function props across that boundary.

Proposed folder structure:

```text
src/app/                       routes, shared layout, global styles
src/app/demo/                  reuse and controlled-mode demo
src/components/data-table/     public types, table rendering, local state helpers
src/components/ui/             shared non-table wrappers only when useful
src/features/timetable/        class columns, attendee presentation, dashboard
src/features/demo/             unrelated dataset, columns, demo controls
src/mocks/                     seeded fixtures and async mock functions
tests/                         table behavior and browser acceptance checks
docs/superpowers/specs/         approved requirements and design
README.md                      setup, API, decisions, deployment instructions
```

Use npm with a committed lockfile; strict TypeScript; a conventional source alias; and scripts for development, production build, lint, type checking, focused tests, and browser checks. Proposed verification tools are Vitest with React Testing Library and Playwright. These are builder proposals, not user-specified dependencies. Setup alone adds the foundation and verification configuration, without implementing product features.

## User-facing scope

### Timetable route `/`

Show mock fitness classes in a SaaS-style layout with clear hierarchy. Columns include class name pinned left, instructor, time, attendance, and status. Parent rows expand below their class to show customer name, payment type, and booking status. Use inline attendees here to demonstrate expansion from already-loaded data. A short initial mocked fetch makes matching skeleton rows observable. Include a retry action for initial errors and clear empty messaging.

### Demo route `/demo`

Reuse the same DataTable with a differently shaped inventory dataset: item, SKU, category, stock quantity, and unit price. Pin the item column. Expand items to fetch stock movements lazily, displayed as date, quantity change, and reason. Keep these child details feature-owned.

Provide client and simulated server modes on this route. In server mode the page owns sort/page state, calls a local mock service with those parameters, and passes only the returned page and total to the table. Explicitly label this as simulated server processing; it does not require HTTP or a backend. Offer visible demo controls for normal, slow, empty, and failed initial requests and for a failed child request. Child failures must be reproducible and recover through retry. Include a larger deterministic dataset, proposed at 10,000 parent records, to exercise smooth client sorting and pagination.

## Generic component contract

Use `DataTable<T>` and require `getRowId(row)` to return a stable unique identifier. The component must not reference class, attendee, inventory, or stock-movement fields.

Column definitions include a stable ID, a typed property accessor or accessor function, header label, optional custom cell renderer, sortable flag, width, and pinned-left flag. Accessors yield values suitable for sorting; complex values require an explicit comparator. Preserve type safety for property access and custom renderers without public `any` escape hatches. Final TypeScript signatures are a builder decision.

Expose independent client/manual processing modes for sorting and pagination. State ownership is separate from processing: controlled state may still use client processing. Each state supports either a controlled value and change callback, or an uncontrolled initial value. Controlled state remains parent-owned; uncontrolled state is internal. Do not copy controlled values into competing internal state. Emit changes from user actions, not during render.

Sorting uses one column at a time and cycles ascending, descending, then none. Sorting precedes pagination in client mode. None restores input order. Use stable ordering for equal values and documented deterministic handling of null values. Unsupported or no-longer-sortable IDs are treated as no active sort. Manual mode emits the same typed state and renders supplied order.

Pagination uses a documented zero-based index internally, one-based labels, total count, page-size selection, previous/next navigation, and a compact page indicator. Proposed sizes are 10, 25, and 50. Only parent rows count toward page size and totals. Sort or page-size changes reset to the first page through the relevant state owner. Clamp out-of-range indexes to a valid page; empty data displays an empty state and disables navigation. In manual mode, the demo parent normalizes state when totals change and refetches a valid page. Validate page sizes so invalid values cannot cause division errors.

## Expansion

Support a discriminated expansion configuration: inline or lazy. Inline mode receives a child getter; lazy mode receives an asynchronous loader. Both receive a feature-owned child renderer so child shape may differ from parent shape. Preserve child typing through generic configuration or typed composition; do not assume child records have parent columns. Include a predicate for whether a parent can expand.

Expanded content occupies a full-width detail cell immediately below the parent. Multiple rows may be expanded. Empty child lists have explicit messaging. Smooth expand/collapse transitions honor reduced-motion preferences. The implementation must preserve valid table markup.

Lazy requests show row-local loading, error, retry, and success states. Cache successful results by stable row ID for the current dataset scope; retry failures. Prevent duplicate requests while pending. Late responses must not reopen collapsed rows or overwrite a newer request. Clear cached details and expansion when the dataset scope changes; navigating pages may retain them within the same scope. Use request cancellation where possible or stale-result guards. Collapsing during a request is allowed.

## Sticky columns and accessibility

Use CSS sticky positioning for left-pinned cells with explicit widths and cumulative offsets if more than one column is pinned. Include header/body backgrounds and stacking order so scrolling content does not show through. Show a divider or shadow when horizontal content scrolls under pinned cells. Keep the demo pinned column narrow enough to leave usable scrolling space on mobile.

Use semantic table elements, a caption or accessible name, header scopes, `aria-sort`, labeled sort buttons, and expansion buttons with `aria-expanded` and associated detail IDs. Controls must be keyboard operable with visible focus. Announce loading/errors appropriately and label pagination controls. Avoid making entire rows the only expansion target. Support horizontal scrolling at narrow widths without forcing the entire page to overflow.

## Loading, errors, and state management

Initial parent loading uses skeleton rows following the column widths and pinned layout. Parent fetch failure shows a clear retry action. Empty results show a meaningful message. Loading new manual pages keeps state coherent and prevents misleading stale interactions; the builder may choose a skeleton replacement or a clearly marked disabled stale view and document it.

Use React state and focused hooks for table interactions and feature-level request state. A global store is unnecessary for this scope. Mock functions accept request parameters and return promises with deterministic fixtures, configurable delay, and controlled failures. Child loading state remains independent per parent. Use memoized derived row processing, stable IDs, and pagination before rendering to avoid rendering all 10,000 records. Virtualization is outside scope unless measurement exposes a need.

## Acceptance criteria and verification

1. The same generic table renders classes and inventory without feature-specific branches in its implementation.
2. Clicking a sortable header cycles asc/desc/none; numeric values and times sort by appropriate accessor values, and equal values remain stable.
3. Client pagination navigates the full parent dataset, respects page-size changes, and handles invalid indexes, sort keys, and empty input.
4. Controlled sort/page changes in the demo issue parameterized mock calls; the table does not sort or paginate already processed manual data again.
5. Inline and lazy details render full-width beneath the correct stable parent; empty children, slow responses, failed requests, retry, collapse during loading, and stale responses behave coherently.
6. Initial skeletons match the table layout; parent loading, empty, error, and retry states are visible and reproducible.
7. At approximately 375px and desktop widths, horizontal scrolling works, the left column stays pinned, and the scroll cue appears appropriately.
8. Keyboard users can sort, expand/collapse, retry, and navigate pages; reduced-motion settings suppress expansion animation.
9. The large-data demo renders only the current parent page plus its visible details. Sorting and navigation do not freeze the UI in a normal desktop browser. Record the environment and observed results rather than claiming an unsupported universal timing guarantee.
10. Type checking, lint, focused behavior tests, production build, and relevant browser checks pass. Include regression coverage for controlled/uncontrolled ownership, sorting before pagination, page normalization, and asynchronous child races.

Use meaningful focused tests for table behavior and async state; browser checks verify sticky positioning, responsive scrolling, keyboard operation, and transitions. Avoid tests that merely mirror implementation details.

## Deliverables and release boundary

- Working source and both routes, with deterministic mock data.
- README covering setup, column API examples for both datasets, client/manual strategies, expansion modes, sticky behavior, state ownership, assumptions, tradeoffs, verification, and deployment.
- A public GitHub repository and deployed URL as requested by the challenge. Account/provider selection and external publication will be handled when the implementation is ready; neither is required to approve this design or create the local setup.

## Sequencing and builder discretion

### User approval rule (confirmed 2026-11-01)

Work proceeds one step at a time. Before each step, explain the proposed scope, dependencies, and any style decisions; wait for the user's approval; implement only that step; then stop for their review. Approval of Step 1 does not approve the complete product design or later implementation. Do not silently add testing tools, dashboard styles, features, or publication actions.

Approved Step 1: Next.js App Router, TypeScript, Tailwind CSS, HeroUI for non-table UI, npm, ESLint, strict type checking, a `src/` folder, the `@/` alias, and a minimal placeholder page to verify the app runs. Testing tools, dashboard styling, and table implementation are deferred.

After design approval, create an implementation plan. The first implementation milestone is project setup only: compatible dependencies, layout shell, scripts, and test configuration. Product table/dashboard implementation follows as later planned milestones. Visual branding, typography, and detailed dashboard composition remain open for later discussion; they do not block the foundation.

Builder discretion covers exact package versions, file splits, hook names, concrete generic signatures consistent with this contract, stable mock fixture values, and restrained default styling. These are proposed implementation calls, not preferences already confirmed by the user.
