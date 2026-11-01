# Mock Data and Services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the revised Step 6 data layer: 12 classes with inline attendees, 100 inventory items with separate stock movements, and asynchronous local mock services.

**Architecture:** JSON fixtures contain deterministic records. Typed feature models and neutral table-query state types describe them. Small mock services provide full lists, sorted/paged inventory results, and per-item lazy details through one cancellable latency/failure helper. No UI or table behavior is implemented.

**Tech Stack:** existing TypeScript, JSON, Node for fixture generation, and Vitest for focused service checks. No new dependencies.

**Spec:** approved PRD and API design in `docs/superpowers/specs/`; user accepted the smaller 12-class/100-item scope, Singapore time, and SGD.

## Global Constraints

- Store records in local JSON; no endpoints or backend.
- Singapore timezone `Asia/Singapore`, explicit `+08:00` fixture timestamps, SGD prices stored in integer cents.
- Normal/slow delay: 500/2000ms; empty and one-shot error scenarios; retries and cancellation.
- Quality over test quantity; no UI changes or subsequent milestone work.
- Keep current project location and existing dependencies.

## Review Focus

- Fixture identities, attendee counts/capacities, timestamps, and child-parent references remain coherent.
- Inventory sorting precedes slicing and does not mutate the original order.
- Invalid sorting/page input, out-of-range pages, and empty details remain predictable.
- Errors recover on retry and remain independent between list and child requests.
- Aborted requests do not resolve or consume a pending one-shot error.

## Task 1: Fixtures and asynchronous data contract

**Files:** `src/config/studio.ts`, `src/types/table-state.ts`, feature `types.ts` files under timetable/demo, mock `types.ts`, `request.ts`, `data.ts`, `services.ts`, JSON under `src/mocks/data/`, deterministic `scripts/generate-mock-data.mjs`, focused `tests/unit/mock-services.test.ts`, README and spec updates.

**Interfaces:** `loadClasses`, `loadInventory`, `queryInventory`, `loadStockMovements` from the approved API; `resetMockFailures` for reproducible demo scenarios; `STUDIO_SETTINGS` for explicit presentation defaults. Fixture generation is available through `npm run mocks:generate`.

- [x] Write focused service/fixture behavior checks and observe the expected missing-service failure.
- [x] Implement typed models, deterministic JSON records, cancellable requests, and mock services; run the focused checks.
- [x] Run lint, strict type checking, and production build, then a fresh scoped code review.
- [x] Document usage and results, stop for user review.

## Execution record

- The user requested a smaller interview-assessment dataset and accepted 12 classes/100 inventory items, replacing the earlier 10,000-item proposal. Larger temporary performance data may be generated only if a later verification step needs it.
- Observed RED: focused service checks failed because the new data-layer modules did not yet exist.
- Implemented 12 class rows with typed inline attendees, 100 inventory rows, and 258 stock movements. JSON fixtures total approximately 84 KB. No new package dependency was added.
- Observed GREEN: all focused service checks passed, covering fixture consistency, global numeric sorting before pagination and original-order recovery, invalid/empty/out-of-range requests, lazy children, slow loading, recoverable independent failures, and cancellation before/during requests.
- `npm run lint`, `npm run typecheck`, and `npm run build` each exited successfully.
- Fresh read-only review found no actionable correctness or scope issues. UI request ownership/latest-result guards, expansion caching, and display formatting remain correctly deferred to their future milestones; this data-layer scope supplies cancellable promises and explicit studio settings.
- README documents service interfaces, scenario/reset behavior, cents/timezone conventions, regeneration, and the reduced dataset.
- The user approved Step 6 after review; this milestone is complete and accepted. Application routes and visual source were not changed; no table implementation has begun.
