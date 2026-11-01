# HL Fitness Studio Data Table — PRD and Setup Design

Status: Steps 1–11 are complete and accepted. Public GitHub publication is approved. The user will handle Vercel deployment personally.
Date: 2026-11-01

## Approval boundary

The seven approved PRD decisions and the approved data clarifications recorded below define the product requirements. The visual direction, component API, and testing tools were separately reviewed and approved in Steps 3–5. Remaining proposals and any changes to those decisions still require step-specific approval. Approving this PRD does not authorize implementation of the complete application.

## Intent and source

Build a self-contained fitness studio timetable dashboard that demonstrates a reusable, fully typed table. Staff use it to browse classes and inspect attendees; evaluators use a second demo to verify reuse and controlled behavior.

Requirements come from the supplied “Part 2 — Component Engineering Challenge: Reusable Data Table” brief. The user selected Next.js and HeroUI, requested project setup and a PRD first, and chose the lean setup with local mocked API functions.

The user confirmed the display name **HL Fitness Studio** with this exact spacing. Use it in the eventual application header and page title, with HL as the compact brand mark.

Approved data clarification after the PRD review: local JSON fixtures store classes, attendees, inventory, and stock movements. Mocked async functions read those fixtures and simulate latency, failures, sorting, and pagination. On-demand details are delivered through the mock loader when a row expands. This simulates fetching behavior and does not require HTTP endpoints or a backend. The component receives data through its generic contract and does not import feature fixtures directly. Fixture schemas and implementation remain subject to their own step approval.

The user confirmed the mock studio timezone as Singapore (`Asia/Singapore`) and the inventory currency as Singapore dollars (`SGD`, displayed as `S$`). Store timestamps with explicit offsets and prices as integer cents; format them explicitly for these settings rather than relying on the device timezone or currency.

Approved scope amendment for Step 6: use **12 classes and 100 inventory items**, with attendees and separate stock movements. This replaces the earlier 10,000-record proposal because the user wants a smaller interview-assessment project. The original brief gives no required record count. Temporary generated performance data may be considered during later verification rather than shipped as a large fixture.

## Goals

- Meet all required table features without a table/grid library.
- Keep the table independent of fitness-specific row shapes and presentation.
- Make inline and on-demand expansion, controlled sorting/pagination, and failure handling easy to verify.
- Deliver a readable, responsive mini app with documentation suitable for a public repository.
- Keep scope consistent with the brief's approximately four-to-six-hour expected effort; this is a scope guide, not a delivery promise.

## Non-goals and anti-goals

No backend, database, authentication, real payments, booking mutations, or production integrations. No general-purpose component library, elaborate dashboard sections, or calendar editor. Do not use HeroUI Table, TanStack Table, AG Grid, or any other table/grid package, including headless table engines. Do not hide missing behavior behind decorative UI or assume a server-rendered page proves server-side table support.

## Approaches

1. **Lean local mocks — selected by the user.** Next.js App Router, TypeScript, HeroUI for non-table controls, local JSON fixtures, and asynchronous mock functions. Artificial latency and failures exercise request behavior without endpoints. Best fit for the component-focused brief.
2. **Mock HTTP endpoints — considered.** The same foundation with Next.js Route Handlers. Offers real network requests but adds infrastructure without improving the required table contract. Not selected.

## Constraints and proposed setup

The approved foundation now exists: Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, HeroUI 3, ESLint, npm, `src/`, and the `@/` alias. Node.js 24+ is the documented requirement. Exact dependency resolution is recorded in the lockfile. Do not mix HeroUI major-version setup instructions.

HeroUI supplies non-table buttons, fields, menus, chips, and skeleton primitives as needed. Native HTML supplies table, header, body, row, and cell semantics. The team owns all table behavior and styling. Interactive table/demo code lives within a client component boundary; layout and route wrappers may remain server components. Define callbacks and column renderers within the client subtree, avoiding function props across that boundary.

Proposed folder structure:

```text
src/app/                       routes, shared layout, global styles
src/app/inventory/             reuse and controlled-mode demo
src/components/data-table/     public types, table rendering, local state helpers
src/components/ui/             shared non-table wrappers only when useful
src/features/classTimetable/        class columns, attendee presentation, dashboard
src/features/demo/             unrelated dataset, columns, demo controls
src/mocks/                     seeded fixtures and async mock functions
tests/                         table behavior and browser acceptance checks
docs/superpowers/specs/         approved requirements and design
README.md                      setup, API, decisions, deployment instructions
```

The foundation includes an npm lockfile and scripts for development, production build, lint, and type checking. The user separately approved Vitest with React Testing Library and Playwright in Step 5, whose configuration is complete. No automated test framework was installed during Step 1; Step 5 added that foundation without retaining filler tests.

## User-facing scope

Approved during Step 2 PRD review: two pages, a class timetable with inline attendee details and an inventory demo with on-demand stock movements, simulated server sorting/pagination, and controls demonstrating loading, empty, and error states. The app supports viewing and inspecting data. Class creation, booking edits, and payment management are outside scope.

### Timetable route `/classTimetable`

Approved route-structure revision: `/` redirects to `/classTimetable`. Timetable and inventory now have matching route folders. This supersedes earlier references to `/` as the timetable route.

Show mock fitness classes in a SaaS-style layout with clear hierarchy. Columns include class name pinned left, instructor, time, attendance, and status. Parent rows expand below their class to show customer name, payment type, and booking status. Inline attendees are the default. An approved follow-up adds an Attendee loading switch to On-demand, so the same attendee data demonstrates both expansion modes as the original brief asks. Mode changes reset table/cache state and cancel pending details. A short initial mocked fetch makes matching skeleton rows observable. Include a retry action for initial errors and clear empty messaging.

### Inventory demo route `/inventory`

Reuse the same DataTable with a differently shaped inventory dataset: item, SKU, category, stock quantity, and unit price. Pin the item column. Expand items to fetch stock movements lazily, displayed as date, quantity change, and reason. Keep these child details feature-owned.

Provide client and simulated server modes on this route. In server mode the page owns sort/page state, calls a local mock service with those parameters, and passes only the returned page and total to the table. Explicitly label this as simulated server processing; it does not require HTTP or a backend. Offer visible demo controls for normal, slow, empty, and failed initial requests and for a failed child request. Child failures must be reproducible and recover through retry. Use the revised deterministic dataset of 100 inventory items.

## Generic component contract

Approved during Step 2 PRD review: one generic `DataTable<T>` shared by both routes. Column definitions specify accessor, header, custom cell, sorting, width, and pinned position. Support both table-managed and parent-managed sorting/pagination. Use React's built-in state and focused hooks without a global state library. Keep attendee and stock-movement rendering outside the reusable table. Detailed component API signatures require a separate review before implementation.

Use `DataTable<T>` and require `getRowId(row)` to return a stable unique identifier. The component must not reference class, attendee, inventory, or stock-movement fields.

Column definitions include a stable ID, a typed property accessor or accessor function, header label, optional custom cell renderer, sortable flag, width, and pinned-left flag. Accessors yield values suitable for sorting; complex values require an explicit comparator. Preserve type safety for property access and custom renderers without public `any` escape hatches. Final TypeScript signatures will be proposed and reviewed separately before implementation.

Expose independent client/manual processing modes for sorting and pagination. State ownership is separate from processing: controlled state may still use client processing. Each state supports either a controlled value and change callback, or an uncontrolled initial value. Controlled state remains parent-owned; uncontrolled state is internal. Do not copy controlled values into competing internal state. Emit changes from user actions, not during render.

Approved during Step 2 PRD review: sorting uses one column at a time and cycles ascending, descending, then none. Sorting precedes pagination across the full dataset in client mode. None restores input order. Expansion stays attached to the correct record after sorting. The demo provides client and simulated server modes using the same controls.

Proposed technical details: use stable ordering for equal values and documented deterministic handling of null values. Unsupported or no-longer-sortable IDs are treated as no active sort. Manual mode emits the same typed state and renders supplied order.

Approved during Step 2 PRD review: start with 10 parent rows per page, with size options of 10, 25, and 50. Expanded details do not count toward page size or totals. Sort or page-size changes reset to the first page.

Proposed technical details: use a documented zero-based index internally, one-based labels, total count, page-size selection, previous/next navigation, and a compact page indicator. Clamp out-of-range indexes to a valid page; empty data displays an empty state and disables navigation. In manual mode, the demo parent normalizes state when totals change and refetches a valid page. Validate page sizes so invalid values cannot cause division errors.

## Expansion

Support a discriminated expansion configuration: inline or lazy. Inline mode receives a child getter; lazy mode receives an asynchronous loader. Both receive a feature-owned child renderer so child shape may differ from parent shape. Preserve child typing through generic configuration or typed composition; do not assume child records have parent columns. Include a predicate for whether a parent can expand.

Expanded content occupies a full-width detail cell immediately below the parent. Approved during Step 2 PRD review: multiple rows may stay expanded, with clearly labeled expand/collapse buttons. Empty child lists display “No attendees” or “No stock movements” as appropriate. Smooth expand/collapse transitions honor reduced-motion preferences. The implementation must preserve valid table markup.

Approved during Step 2 PRD review: lazy requests show row-local loading and a Retry action on failure. Reuse successfully loaded details when reopened until the demo dataset changes. Collapsing during a request is allowed; completion must not reopen a collapsed row.

Proposed technical details: cache successful results by stable row ID for the current dataset scope. Prevent duplicate requests while pending and prevent late responses from overwriting a newer request. Clear cached details and expansion when the dataset scope changes; navigating pages may retain them within the same scope. Use request cancellation where possible or stale-result guards.

## Sticky columns and accessibility

Approved during Step 2 PRD review: preserve the table layout on mobile with horizontal scrolling contained inside the table area. Pin the class/item column left and show a divider or shadow when other content scrolls beneath it. Keep the pinned column narrow enough to leave usable space for other columns, and allow surrounding controls to wrap on small screens. Sorting, expansion, pagination, and Retry must be keyboard operable with visible focus. Provide screen-reader labels for sort direction, expanded rows, and loading/error states. Colors, fonts, and dashboard composition require separate approval.

Use CSS sticky positioning for left-pinned cells with explicit widths and cumulative offsets if more than one column is pinned. Include header/body backgrounds and stacking order so scrolling content does not show through. Show a divider or shadow when horizontal content scrolls under pinned cells. Keep the demo pinned column narrow enough to leave usable scrolling space on mobile.

Use semantic table elements, a caption or accessible name, header scopes, `aria-sort`, labeled sort buttons, and expansion buttons with `aria-expanded` and associated detail IDs. Controls must be keyboard operable with visible focus. Announce loading/errors appropriately and label pagination controls. Avoid making entire rows the only expansion target. Support horizontal scrolling at narrow widths without forcing the entire page to overflow.

## Loading, errors, and state management

Approved during Step 2 PRD review: initial parent loading uses skeleton rows matching the table columns and widths. Loading a simulated server page replaces rows with skeletons and disables pagination until the request finishes. Empty data displays a clear message inside the table and disables pagination. Failed table requests display an error with Retry, preserving the requested sort and page. Failed expanded details display a local error and Retry while the parent table remains usable. Demo controls let reviewers trigger normal, slow, empty, and failed requests without changing code.

Approved during Step 2 PRD review: use React state and focused hooks for table interactions and feature-level request state, without a global store. Mock functions accept request parameters and return promises with deterministic fixtures, configurable delay, and controlled failures. Child loading state remains independent per parent. Proposed performance implementation: use memoized derived row processing, stable IDs, and pagination before rendering to avoid rendering the entire dataset unnecessarily. Virtualization would require a separate proposal if measurements expose a need.

## Acceptance criteria and verification

Verify sorting and pagination responsiveness with the revised 100-item demo; consider temporary generated larger data during later performance verification if needed. Verify page changes, expansion, retries, and responses arriving after users change views. Check keyboard use, mobile scrolling, and pinned columns. Type checking, lint, and production build must pass. The testing tools were separately approved in Step 5.

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

User testing preference: prioritize quality over quantity. Each test should protect an actual feature behavior, important edge case, or regression. Keep test explanations brief; avoid exhaustive test-by-test planning, arbitrary test-count/coverage targets, redundant assertions of implementation details, and filler tests created only to demonstrate tool setup. Add focused tests alongside the feature they protect.

## Deliverables and release boundary

Approved during Step 2 PRD review: a README explaining setup, component usage, state management, and tradeoffs; a public GitHub repository; and a deployed website. The testing tools, hosting provider, and external publication actions require separate approval before use.

- Working source and both routes, with deterministic mock data.
- README covering setup, column API examples for both datasets, client/manual strategies, expansion modes, sticky behavior, state ownership, assumptions, tradeoffs, verification, and deployment.
- A public GitHub repository and deployed URL as requested by the challenge. Account/provider selection and external publication will be handled when the implementation is ready; neither is required to approve this design or create the local setup.

## Sequencing and builder discretion

### User approval rule (confirmed 2026-11-01)

Work proceeds one step at a time. Before each step, explain the proposed scope, dependencies, and any style decisions; wait for the user's approval; implement only that step; then stop for their review. Approval of Step 1 does not approve the complete product design or later implementation. Do not silently add testing tools, dashboard styles, features, or publication actions.

Approved Step 1: Next.js App Router, TypeScript, Tailwind CSS, HeroUI for non-table UI, npm, ESLint, strict type checking, a `src/` folder, the `@/` alias, and a minimal placeholder page to verify the app runs. Testing tools, dashboard styling, and table implementation are deferred.

Approved Step 2 decision 1: the two-page viewing/inspection scope and inventory as the second dataset. This approves requirements only; product implementation remains gated separately.

Approved Step 2 decision 2: single-column asc/desc/original-order sorting; full-dataset sorting before client pagination; default 10 parent rows with 10/25/50 options; details excluded from page counts; reset to page 1 after sort/page-size changes; expansion attached to stable records; shared controls across client and simulated server demo modes.

Approved Step 2 decision 3: multiple expanded rows; labeled expand/collapse buttons; explicit empty-child messaging; row-local lazy loading and Retry; reuse successful child results until dataset changes; collapse during loading without automatic reopening; reduced-motion support.

Approved Step 2 decision 4: column-matched initial skeletons; skeleton replacement and disabled pagination during simulated server page requests; clear in-table empty messaging with disabled pagination; table-level error and Retry preserving requested sort/page; independent child failure handling; reviewer controls for normal/slow/empty/failed requests.

Approved Step 2 decision 5: mobile table-area horizontal scrolling; a narrow left-pinned class/item column with a scroll divider/shadow; wrapping surrounding controls; keyboard-operable interactions with visible focus; screen-reader labels for sorting, expansion, and request states. Visual styling remains a separate approval step.

Approved Step 2 decision 6: behavior and stale-response verification; responsiveness checks; keyboard/mobile/pinned-column checks; passing type checking, lint, and production build; README, public repository, and deployed website deliverables. The original record-count proposal was superseded by the Step 6 amendment to 100 inventory items. Hosting selection and external publication remain separately gated.

Approved Step 2 decision 7: one generic typed table; column-driven configuration; table-managed and parent-managed sort/pagination; built-in React state and hooks without a global store; feature-owned detail rendering. Detailed component API review precedes implementation.

Approved follow-up decision 8: store mock records in local JSON fixtures and access them through mocked async functions; simulate delays, failures, sorting, pagination, and on-demand detail delivery without real endpoints. This approves the data approach, not the creation of fixtures or mock services yet.

Step 1 delivered compatible dependencies, a minimal layout and placeholder, scripts, and configuration; the user accepted it. Step 2 finalized the approved PRD. Step 3 finalized the approved Calm studio direction and HL Fitness Studio name. Later implementation milestones require their own proposed scope and user approval. Detailed screen/state layouts remain reviewable within their respective future steps.

Later proposals will identify the files, any new dependencies, exact component API, mock data choices, and behavior or style decisions relevant to that step. Ordinary internal naming may follow project conventions; user-visible choices, dependencies, and scope changes must be explained before implementation. The approved visual direction is documented separately; changes to it require review.

## Suggested future review sequence (not yet approved)

1. Review the written PRD and accept or request revisions — completed and approved.
2. Propose a visual design step, including a mockup approach and styling decisions, for approval.
3. Propose the detailed table API and verification tools for approval.
4. Propose small implementation milestones individually; after each approved milestone, build, verify, and stop for user review.
5. Propose repository publication and deployment when the finished application is ready.

This sequence is a recommendation. The user approves the next step before any work on it begins.

## Document review

A fresh read-only builder check of this version found no important unanswered planning questions. The user approved the written PRD, completing Step 2. This step changed documentation only. No later step is authorized by this approval.

The user subsequently selected and approved A — Calm studio with the HL Fitness Studio name, completing Step 3. The approved visual design and the considered alternative are documented in `2026-11-01-dashboard-visual-options.md`. Dashboard implementation remains separately gated.

The user approved Step 4 component API design with grouped configuration, completing that step. The approved types, mock-service interfaces, and usage examples are in `2026-11-01-data-table-api-design.md`; a fresh builder check found no blocking gaps.

The user accepted lightweight testing following Step 5 setup with Vitest, React Testing Library, and Playwright. Temporary tooling checks were removed after verification. The user selected Singapore time/SGD and accepted the smaller Step 6 mock-data scope, then approved the completed implementation after its checks and review. Table and dashboard implementation remain separately gated.

The user accepted Step 7 after reviewing the basic timetable and approving a stronger sans-serif/contrast revision. It includes a generic basic table, pinned class column, skeleton loading, empty/error/retry states, and mock class data. Sorting, pagination, expansion, and the inventory demo UI remain later milestones requiring approval. The foundation deliberately omits unimplemented sorting configuration from its current TypeScript API. Step 7 and its style revision were committed separately.

The user accepted the completed Step 8 implementation. Grouped sorting/pagination, sortable/custom comparator columns, client and controlled/manual processing, page resets and normalization, accessible controls, and focused behavior/type/browser checks are implemented. Sorting configuration is now active rather than deferred. Commit: `dd4f95b`. Expansion and the inventory demo UI remain later milestones requiring approval.

Step 9 was accepted after review of commit `48428a2`: typed inline/lazy expansion, independent row requests and retry, successful/empty cache, stale-result protection, accessible animated detail rows, and inline timetable attendees. Unit/type/lint and production desktop/mobile checks pass. Inventory UI remains Step 10 and requires separate approval.

Step 10 scope and plan were approved and implemented: `/inventory`, shared navigation, 100 items, controlled client/manual processing, lazy stock movements and independent list/detail scenarios. Existing generic table internals were reused without domain changes. Unit/lint/type checks and production desktop/mobile journeys pass; fresh review found no material issues. The user accepted Step 10 at commit `94c4d86`. The route name `/inventory` supersedes the earlier `/demo` proposal.

Step 11 scope was approved: final requirements verification, keyboard/mobile/performance checks, confirmed-issue fixes and README completion. No material implementation issues were found, so no product behavior or styling changed. The verification record is `../../verification.md`; it includes requirement evidence, measured performance, passing checks and limits. Step 11 awaits user review. Publication/deployment remain Step 12 and unapproved.
