# Basic Table and Timetable Implementation Plan — Step 7

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved basic reusable table and class timetable screen, verify it, and create a separate Step 7 commit.

**Architecture:** Native semantic table driven by typed column definitions. A feature-owned timetable component fetches the existing class mock service with cancellation and stale-result protection. CSS Modules apply the approved Calm studio direction; HeroUI supplies only loading skeletons and Retry controls.

**Tech Stack:** existing Next.js/React/TypeScript/HeroUI/CSS Modules, Vitest/RTL and Playwright. No new dependencies.

**Spec:** approved PRD, API design, and visual design under `docs/superpowers/specs/`. User explicitly approved Step 7 and a separate non-Codex-prefixed commit.

## Global Constraints

- Step 7 only: columns/custom cells, native table semantics, left-pinned columns, initial skeletons, empty/error/retry, mock class data, responsive Calm studio timetable, HL Fitness Studio branding.
- Sorting, pagination, expansion, and the inventory demo UI remain later milestones. Do not add pretend controls or accept unimplemented processing/expansion props.
- Keep the generic table independent of feature models and mock imports.
- Singapore time and fixture-derived summaries; do not invent additional fields or business actions.
- Reuse the current feature branch. Existing split commits through Step 5 and Step 6 remain unchanged.
- Focused tests protect behavior, not counts. Stop for user review after the Step 7 commit.

## Review Focus

- Independent row shapes and custom accessors/cells remain typed and generic.
- Skeletons follow column layout, hide stale rows, and announce loading; retry uses the supplied callback.
- Sticky cells retain opaque backgrounds and a scroll-under cue; narrow layouts do not overflow the outer page.
- The class request is aborted/ignored on cleanup and retry transitions do not overwrite current results.
- The implemented API is an explicit foundation subset; future sort/page/expansion configuration is not silently ignored.

## Task 1: Basic table and screen

**Files:** `src/components/data-table/{types.ts,DataTable.tsx,data-table.module.css}`, `src/features/timetable/{Timetable.tsx,use-class-timetable.ts,columns.tsx,formatters.ts,timetable.module.css}`, app page/layout/globals, focused unit/browser tests, README/spec status.

**Interfaces:** `ColumnDef<T>`, `RequestState`, foundation `DataTableProps<T>` with data/columns/getRowId/datasetKey/caption/request/emptyMessage. `Timetable` renders the real timetable route; `useClassTimetable` owns the request lifecycle. Later milestones extend the foundation with the approved grouped configurations.

- [x] Write focused generic rendering/state and timetable request checks; observe the expected missing-component failure.
- [x] Implement the native table and Calm studio timetable, then pass focused checks.
- [x] Verify lint/type checking and production browser behavior at desktop/mobile sizes, including actual pinned geometry and scroll cue.
- [x] Perform a fresh code review, document results, and commit Step 7 separately; stop for user review.

## Execution record

- User approved Step 7. A history correction split the prior combined commit into `6708dc2` (through Step 5) and `74e3eaa` (Step 6); final tree equality was verified before Step 7 implementation began.
- Routine scope decisions: use fixture-derived capacity/duration instead of the mockup's unapproved studio/category fields; render only navigation for the available timetable route, avoiding an unavailable demo link. Defer inventory demo navigation until its route exists.
- Observed RED: new table/timetable tests failed because the components did not exist. Observed GREEN: behavior checks passed after implementation, alongside the existing service suite.
- Production desktop/mobile Chromium checks passed: real fixture rows, no page errors or outer overflow, keyboard horizontal scrolling, pinned-cell geometry, and scroll shadow. Reviewed both screenshot artifacts visually.
- Fresh read-only review identified one P2 API issue: sortable/compare were accepted before implementation. Confirmed it with a failing compile-time regression fixture (unused expected-error directives), removed those options and their feature declarations, then passed type checking and the complete unit suite.
- Ruling: future sorting controls, pagination, expansion, and inventory navigation are intentionally deferred under the user's Step 7 scope. This temporarily renders all 12 class rows without interactions; the README and roadmap state that limitation.
- Added a complete proposed roadmap and actual skill-use log after the user's process-visibility request. Future milestone scopes remain unapproved until requested individually.
- Final verification: complete unit suite, negative type-contract checks, lint, and production build passed after the review fix. Production browser checks already passed desktop/mobile behavior; the review fix only removed previously unused metadata and changed no rendered behavior.
- Durable screenshots were copied to the chat visualization directory. The production timetable is available locally at http://127.0.0.1:3001 for review. Automatic browser opening was unavailable because local browser use is disabled in Work settings; the preview remains accessible through its URL.
- Step 7 uses its own commit, `feat: build basic table and class timetable`. User review is pending; Step 8 is not started.
- User review requested stronger typography and less pale colors, then approved the proposed revision. Replaced the serif heading with bold Arial/Helvetica/system sans-serif, darkened text, strengthened green accents/borders/header tint, increased small labels, and widened the status column. Desktop/mobile production checks and visual screenshot review passed; no new dependency or feature was added. This receives a separate style revision commit, preserving the earlier history.
