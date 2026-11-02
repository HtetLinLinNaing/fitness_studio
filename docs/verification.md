# Assessment verification

Reviewed against the original “Part 2 — Component Engineering Challenge: Reusable Data Table” brief. This record describes the final local submission on 2 November 2026.

## Requirements and evidence

| Requirement | Implementation and evidence |
| --- | --- |
| React/Next.js and generic TypeScript | Native table implementation in `src/components/data-table/`; `src/types/table.ts` defines typed columns, state ownership and expansion. No table/grid library is installed. HeroUI provides non-table primitives only. |
| Column definitions | Property/function accessors, headings, custom cells, sortable flags, widths and left pinning. Timetable and inventory supply independent definitions. Type fixtures reject incompatible configurations. |
| Client sorting | Ascending, descending and original-order cycle. Stable sorting processes the full dataset before pagination; null/invalid values remain last. Tests cover numeric, text, date, boolean, custom, invalid-key and finite-extreme cases. |
| Client pagination | Page navigation and 10/25/50 size options; sort and size changes return to page 1. Invalid/out-of-range pages are normalized; empty data disables navigation. |
| Controlled/uncontrolled state | Timetable uses table-owned sort/page state. Inventory uses parent-owned values in client and manual modes. Tests check callback ownership and shrinking totals. |
| Simulated server processing | `queryInventory` receives sort/page parameters and returns the processed page plus total. The table renders manual rows without sorting or slicing them again. There are no HTTP API endpoints. |
| Inline attendees | The timetable initially expands `row.attendees`, displaying customer, payment type and booking status. |
| On-demand attendees | The same timetable renderer uses `loadAttendees` in On-demand mode. Inventory demonstrates lazy stock history with a different child shape. |
| Detail request states | Row-local loading skeletons, empty results, errors and Retry. Successful results, including empty lists, cache in the detail-state map. Tests cover concurrent rows, collapse/reopen, caching and stale responses. |
| Full-width animated expansion | Details span all parent columns. Browser checks measure expanded/collapsed heights, associated panel IDs, inert hidden panels and reduced-motion behavior. |
| Pinned column | Column widths and cumulative left offsets drive native sticky positioning. A scroll-dependent shadow indicates overlap. Mobile checks verify that the first column stays fixed while the table region scrolls. |
| Initial loading/empty/error | Skeletons follow actual columns and page size. Loading replaces stale rows; failures retain a Retry action. Inventory controls reproduce normal, slow, empty and failed requests. |
| Second dataset | `/classTimetable` displays 12 fictional classes; `/inventory` displays 100 inventory items using the same generic table. `/` redirects to `/classTimetable`. |
| Responsive and accessible controls | Semantic tables, captions, header scope, labeled controls, keyboard sorting/disclosure/navigation, focus indicators and request announcements. Browser coverage uses desktop/mobile Chromium and a tablet viewport. |
| Larger datasets | A generated 5,000-row component test confirms global sorting and page-limited rendering. The measurement script separately measures in-memory sorting/slicing. This does not establish large-dataset browser scrolling performance. |
| README | Setup, column API examples, client/manual processing, expansion, sticky behavior, state ownership, assumptions and trade-offs. |
| Public delivery | Public repository and Vercel URLs are listed in the README. The production routes are `/classTimetable` and `/inventory`, with `/` redirecting to the timetable. |

## Final validation

Verified on Windows x64 with Node.js 24.16.0:

- `npm run lint`: passed without warnings.
- `npm run typecheck`: passed, including negative type-contract fixtures.
- `npm test -- --reporter=dot`: 8 test files and 34 tests passed.
- `npm run test:e2e`: production build succeeded; 7 browser tests passed. One duplicate tablet check was intentionally skipped in the mobile project.
- `git diff --check`: passed.

Reproduce these checks with:

```sh
npm run lint
npm run typecheck
npm test -- --reporter=dot
node scripts/measure-table.mjs
npm run test:e2e
```

The browser runner builds production output, starts it on `127.0.0.1:3100` and checks both routes. Its tablet-only test intentionally skips the duplicate mobile-project entry. Generated reports, screenshots and traces are ignored by Git.

## Performance scope

`scripts/measure-table.mjs` generates deterministic 100- and 5,000-row datasets in memory and performs five warm-ups followed by 50 timed sort-and-slice samples. It uses the actual `sortRows` implementation and checks input immutability and the first page. Results describe Node processing, not browser rendering.

| Generated records | Median | P95 | Maximum |
| --- | --- | --- | --- |
| 100 | 0.104ms | 0.144ms | 0.558ms |
| 5,000 | 13.488ms | 27.970ms | 30.167ms |

Measured on the shared development machine on 2 November 2026. These observations are not portable timing guarantees.

The browser suite records client sort timings over the shipped 100-row inventory. Those samples include the event, React update and two animation frames, and exclude simulated request latency. Normal/slow requests deliberately take 500ms/2s. Pagination bounds parent-row rendering; there is no virtualization.

## Limits

Browser coverage uses Chromium, including 1440px desktop, 768px tablet and 375px mobile layouts. Other engines, physical phones and lower-end hardware are not benchmarked. Accessibility checks cover semantics and keyboard interaction; they do not constitute a complete screen-reader or WCAG audit. The results above concern the local production build. Deployment availability and version parity must also be checked against the public URLs.
