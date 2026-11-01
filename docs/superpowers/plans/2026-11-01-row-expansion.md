# Expandable Rows Implementation Plan — Step 9

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved typed inline/lazy expansion API, display real timetable attendees, verify races/accessibility/motion, and create a separate Step 9 commit.

**Architecture:** A row-ID expansion hook owns open rows and lazy request/cache state within the dataset scope. A full-width detail row owns animation, loading/empty/error/retry UI; feature renderers own child shape and markup. Parent sort/page calculations continue to use parent data only. Timetable uses inline attendees; lazy inventory UI remains Step 10.

**Tech Stack:** existing React/TypeScript/native tables/CSS/HeroUI and existing verification tools. No new dependencies.

**Spec:** approved expansion contract in `specs/2026-11-01-data-table-api-design.md` and PRD; user approved Step 9 in chat.

## Global Constraints

- Multiple open rows; inline getters or lazy loader with AbortSignal; typed child data independent of parent type.
- Lazy loading/error/retry is row-local, success/empty results cached by stable row ID, pending requests deduplicated.
- Collapse during loading is allowed; completion may cache data but never reopens the row. Cancel pending requests and ignore stale responses when dataset scope changes or the table unmounts.
- Full-width detail cells below parents; smooth transitions with reduced-motion support; interactive controls inaccessible while collapsed.
- Page size/totals count parents only; preserve record-linked expansion through sorting/page navigation.
- No inventory demo screen or later feature work. Keep test explanations concise and behavior-focused.

## Review Focus

- Child typing and feature-owned rendering do not leak domain assumptions into the reusable table.
- Concurrent rows have independent loading/failure; retry and collapse/reopen do not duplicate requests or lose cached empty results.
- Late responses from an old dataset cannot update a new row with the same ID.
- Table CSS does not leak parent-cell sizing/borders into nested child tables.
- Actual expand/collapse height, keyboard/ARIA controls, hidden focus targets, mobile scrolling and reduced motion remain correct.

## Task 1: Generic expansion behavior

**Files:** data-table `types.ts`, `use-row-expansion.ts`, `RowDetails.tsx`, `DataTable.tsx`, CSS; focused unit/type checks.

- [x] Write focused inline/lazy/cache/race checks and observe RED.
- [x] Implement typed expansion, per-row requests, scoped cache and detail rows; pass focused checks.

## Task 2: Attendees and browser integration

**Files:** timetable `AttendeeList.tsx`, component/CSS, browser journey, README/spec/roadmap updates.

- [x] Connect actual inline attendees and support empty child lists without hard-coded generic fields.
- [x] Verify unit/type/lint and production desktop/mobile behavior, including transitions and reduced motion; inspect screenshots.
- [x] Obtain fresh review, correct material findings, commit Step 9 separately, and stop for user review.

## Execution record

- Step 9 approved. Existing working-tree edits at start only record Step 8 acceptance; source is at `dd4f95b`.
- Skills: writing-plans, executing-plans, test-driven-development, verification-before-completion, fresh requesting-code-review template; receiving-code-review for any corrections.
- Implementation choice: keep in-flight lazy requests running across collapse to support deduplication and cache-on-completion. Abort on dataset-scope replacement/unmount; pending identity and signal guards prevent stale delivery. Collapsed detail markup is released after the short closing transition, while successful data remains cached.
- RED: four focused expansion checks failed before implementation because disclosure controls did not exist. GREEN: all 26 unit checks pass, including inline/lazy, empty cache, independent failures, retry, collapse during pending work, and ignored old-scope responses. Compile-time checks reject mixed sources and incorrect child shapes.
- Verification: lint and typecheck pass. Production Playwright desktop/mobile journeys pass, covering actual panel height, keyboard disclosure, inert collapse, empty details, reduced motion, existing sorting/pagination and pinned-column behavior. Desktop/mobile screenshots inspected. First browser run exposed a punctuation mismatch in the test's expected empty copy; assertion aligned to actual copy, both journeys passed on rerun.
- Fresh read-only review: no Critical/Important findings, no deferred minors or declined judgments. No implementation corrections required.
- Step 9 is ready for user review; Step 10 remains unapproved.
