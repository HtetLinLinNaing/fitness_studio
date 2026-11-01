# Assessment verification

Verified on 2026-11-01 against the supplied “Part 2 — Component Engineering Challenge: Reusable Data Table” brief and the approved scope amendments. Implementation base: `94c4d86`; this Step 11 adds verification and documentation, with no product behavior or styling changes.

## Requirement evidence

| Requirement | Implementation / evidence |
| --- | --- |
| React/Next.js, generic TypeScript, no table library | `src/components/data-table/` supplies native markup, typed columns and custom processing. Package manifest includes no table/grid engine. HeroUI supplies non-table primitives. |
| Column definitions and custom cells | Typed scalar property/function accessors, header, width, pinned flag, sortable flag, custom cells/comparators. `tests/types/data-table-contract.ts` rejects invalid columns/configurations. |
| Client sort asc/desc/none | Stable scalar sorting before slicing, original-order restoration, missing values last. Sorting/unit/browser checks cover numeric/text, ties, invalid IDs and finite numeric extremes. |
| Controlled/uncontrolled sorting and pagination | Timetable uses table-owned state. Inventory uses parent-owned state in client/manual modes. Processing checks verify owner callbacks, page resets, clamping and trusted manual rows. |
| Client pagination and optional server processing | Page sizes 10/25/50 and full parent counts. Inventory browser journey compares complete-dataset sort results across client/manual modes and navigates/changes page size. |
| Inline expansion | Default timetable mode shows real attendees with independent customer/payment/status columns. Stable-ID expansion survives sort/page changes. |
| Lazy expansion | Timetable On-demand mode loads attendees when a class expands; inventory independently loads stock movements. Loading/empty/error/retry remain row-local. Tests cover multiple concurrent rows, pending deduplication, cached empty results, collapse during loading, scope cancellation and ignored late results. |
| Full-width animated details | Detail cell spans all parent columns; feature owns nested child markup. Browser checks measure open/closed height, disclosure ARIA and reduced-motion behavior. Collapsed panels are inert and hidden from assistive technology. |
| Pinned left column / scroll cue | Explicit widths/cumulative offsets and sticky positioning. Desktop/mobile checks verify position, shadow, scroll state and contained overflow. |
| Matching skeletons / list states | Skeleton cells follow actual columns and page size. Component checks verify stale rows are replaced. Inventory controls reproduce slow, empty, failed initial requests and recoverable detail failures. |
| Invalid input / races | Invalid sort/page/type configurations, shrinking totals, independent child errors and list/detail stale-response guards have focused checks. |
| Second dataset / real usage | `/` renders 12 real mock classes; `/inventory` renders 100 differently shaped items with controlled/manual/lazy behavior. Navigation is shared. |
| Responsive and keyboard behavior | Production Chromium checks at 1440px, 768px and 375px. Keyboard sorting, disclosure, scrolling and controls exercised. Tablet checks confirm one main/H1, labeled selects/buttons, column scopes, panel association and inert collapse. Screenshots inspected at all three widths. |
| Larger dataset performance | Generated 5,000-row component check confirms global sorting and only 10 parent rows rendered before/after page navigation. Measurements below separate CPU processing from actual browser interaction. |
| README deliverables | Setup, typed API/usage, client/manual strategy, both expansion modes, sticky approach, state ownership, assumptions and tradeoffs documented in README. |
| Public repository / deployed URL | Public repository: https://github.com/HtetLinLinNaing/fitness_studio. User-deployed website: https://fitnessstudio-beta.vercel.app/. Both `/` and `/inventory` returned HTTP 200 with their expected page titles on 2026-11-01. |

## Commands and results

- `npm test`: 33 unit/component checks passed after the attendee-mode follow-up, including real service integration, attendee source/cancellation behavior and the generated 5,000-row/page-limited rendering check.
- `npm run lint`: passed with no warnings.
- `npm run typecheck`: passed, including compile-time negative contract fixtures.
- `npm run test:e2e`: production build succeeded; 5 browser journeys passed. One duplicate mobile-project tablet case is intentionally skipped because tablet verification runs once in the desktop Chromium project; both independent mobile journeys run and pass.
- Fresh read-only whole-implementation review: no Critical/Important findings, deferred minors or declined judgments. No product corrections were needed.

## Performance observations

Environment: Windows x64, Node 24.16.0, installed Playwright Chromium, production Next.js build. Shared development machine; no CPU/network throttling. These are observations, not portable timing guarantees.

`node scripts/measure-table.mjs` generates deterministic shuffled string records, runs five warm-ups and 50 measured sort-and-slice samples with the actual `sortRows` implementation. Input immutability and the first sorted page are checked on every iteration.

| Generated records | Median | P95 | Maximum |
| --- | --- | --- | --- |
| 100 | 0.260ms | 0.439ms | 2.023ms |
| 5,000 | 16.439ms | 34.470ms | 40.951ms |

This measures Node processing, not browser rendering of 5,000 records. Importing the source TypeScript with Node may emit a module-type detection warning; no package-mode change is required, and timing starts after module import.

The production inventory browser check measured six local client sort events over 100 records at 1440×900. Each sample includes the click, React update and two animation frames, excluding tool transport and artificial service latency: **14.5, 14.1, 15.5, 8.6, 21.6 and 34.6ms**. The DOM retains 10 parent rows. Raw samples are attached as `client-sort-timings` in the Playwright HTML report.

Normal/slow requests deliberately take 500ms/2s and are not included as sorting cost. Pagination is the rendering bound; virtualization, remote request throughput and lower-end devices were not benchmarked. No larger fixture or stress UI was added to the app.

## Verification limits

The accessibility checks exercise semantics, names, keyboard interaction, inert hidden content, focus styling visible in screenshots and reduced motion. They are not a complete WCAG audit or a screen-reader compatibility certification. Browser checks currently use Chromium; other browser engines and real mobile hardware were not tested. No runtime code/dependency change was made during this milestone; previously documented development-tool audit findings remain separate from this functional verification.

Generated browser reports/screenshots live in ignored `playwright-report/` and `test-results/`. Re-run the commands to regenerate them. The user deployed the website on Vercel. Live checks confirmed route availability and titles; the full interaction checks described above ran against the local production build.

## Follow-up from the repeated brief check

The brief specifically asks for attendee data to drive both expansion modes. After Step 11 acceptance, the user approved a timetable Inline / On-demand switch. The implementation now uses the same attendee renderer with either row.attendees or the new loadAttendees service. Switching resets the table/cache and aborts pending details; late responses cannot leak into the new mode. Focused checks exercise actual source selection, detached/empty service results, error/retry and cancellation. This closes the literal brief-alignment gap. The user accepted the implementation at `2db0243` and approved publication. A deployed version of this follow-up has not yet been verified.
