# Sorting and Pagination Implementation Plan — Step 8

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved grouped sorting/pagination API and accessible timetable controls, verify client and manual behavior, and make a separate Step 8 commit.

**Architecture:** Pure typed helpers provide sort validation, stable comparison, and pagination normalization. A focused hook manages uncontrolled state while reading controlled values directly and emitting user-event callbacks. The native table renders processed rows; manual mode leaves supplied rows untouched. A separate small footer owns presentation of page controls.

**Tech Stack:** existing React/TypeScript/native HTML/CSS Modules and existing test tools. No new dependencies.

**Spec:** approved API/PRD in `docs/superpowers/specs/`, Step 8 scope approved in chat. The current stronger sans-serif/green visual direction remains in use.

## Global Constraints

- Ascending/descending/original order; client sorting before pagination; default 10 rows with 10/25/50 options.
- Controlled and uncontrolled ownership are separate from client/manual processing. Manual pagination requires manual or disabled sorting, never client sorting of a partial dataset.
- Sort/page-size events reset the page. Render-time validation never calls parent callbacks. Missing sort values stay last in either direction; ties preserve original order.
- Client page indexes clamp when data shrinks; manual page reconciliation/refetch remains parent-owned. Empty/loading/error states keep controls coherent and accessible.
- No expansion, child caching, inventory demo UI, global store, or table/grid library in this milestone.
- Preserve existing acceptance documentation edits from the prior turn and commit only this milestone's work. Feature branch remains `feature/reusable-data-table`.

## Review Focus

- Three-state sorting restores input order, handles missing/invalid/custom scalar comparisons, and does not mutate input.
- Pagination sees the full sorted dataset; size/sort resets and shrink/grow behavior do not silently resurrect invalid internal pages.
- Controlled values are not shadowed by local state; manual data is neither re-sorted nor sliced twice, and change callbacks are event-only.
- Invalid keys/sizes/indexes/options and empty/request states remain deterministic; incompatible configuration is rejected by types and runtime validation.
- Keyboard/screen-reader controls work at narrow widths while the pinned column continues to work.

## Task 1: Processing and state contract

**Files:** extend data-table `types.ts`, create `processing.ts`, `use-table-processing.ts`, focused unit/type contract checks; consume neutral sort/page types from `src/types/table-state.ts`.

- [x] Write focused comparison/ownership/manual/page-reset checks and observe RED.
- [x] Implement validated stable processing and state ownership; pass the checks.

## Task 2: Table controls and timetable integration

**Files:** update `DataTable.tsx`, create `PaginationControls.tsx`, extend CSS, enable class column sort flags, replace timetable static footer, update browser checks and docs/roadmap.

- [x] Add accessible sort buttons/aria-sort and responsive page-size/previous/next/page-summary controls.
- [x] Verify focused unit/type checks, lint, production desktop/mobile interactions, and visual screenshots.
- [x] Obtain fresh read-only review, correct material findings, commit separately, and stop for user review.

## Execution record

- Step 8 approved. Prior working-tree edits are documentation recording Step 7 acceptance; no unexpected product-source changes were present at start.
- Skills: writing-plans, executing-plans, test-driven-development, verification-before-completion, requesting-code-review template; receiving-code-review if corrections are needed.
- Observed RED: pure helper import was missing and component checks showed all rows with no sort/page controls. Implemented processing, ownership, and controls; focused checks then passed.
- A focused runtime check exposed missing manual-total validation; added explicit configuration validation and passed the full suite. Type fixtures reject competing owners, missing callbacks/totals, and client sorting of manual pages.
- Checked supported mixed modes, event-only controlled callbacks, no double manual sorting/slicing, invalid inputs, stable missing-value ordering, page-size/sort resets, and bounded uncontrolled shrink/grow normalization.
- Fresh read-only review found one finite-number overflow case. Ruling: although the reviewer labeled it low priority for this dataset, valid finite-number ordering is part of the generic API contract, so corrected it within sorting scope. Reproduced RED for MAX_VALUE/-MAX_VALUE, replaced subtraction with relational comparison, and passed the regression plus full unit suite. No other material findings; no second review pass needed.
- Final checks passed: full unit suite, type checking, lint, production build, and desktop/mobile browser journeys covering keyboard sort cycle, page navigation/sizes, pinned geometry and no outer overflow. Reviewed both screenshot artifacts.
- Review's deferred topics remain deliberate: expansion/inventory UI are future milestones; manual refetch and controlled-state reconciliation remain parent-owned. Guarded own-state normalization never calls parents during render.
- Preview root cause check: a second development preview was rejected because the project already has a development server on port 3000. Preserved that process, restored the separate production review preview on port 3001, and made no application workaround for the environment lock.
- The user accepted Step 8 after review. Commit: `dd4f95b` — `feat: add table sorting and pagination`. Step 9 has not started and needs separate approval.
