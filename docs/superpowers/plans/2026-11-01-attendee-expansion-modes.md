# Attendee Expansion Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the original brief literally by demonstrating inline and on-demand attendees in the timetable, retaining the inventory demo.

**Architecture:** Add a typed `loadAttendees(classId, context?)` mock service using the existing class fixtures and request simulator. Timetable selects inline or lazy ExpansionConfig with the same AttendeeList renderer. A mode-specific dataset key clears old expansion/cache and aborts pending details through the existing generic table lifecycle.

**Tech Stack:** existing React/TypeScript/native controls/CSS and current test tools; no new dependency, fixture, endpoint or generic-table change.

**Spec:** original assessment instruction “Use this child data to drive both expansion modes”; user approved adding an attendee expansion switch. Existing design/palette remains.

## Global Constraints

- Default Inline, alternative On-demand, accessible label Attendee loading.
- Inline uses row.attendees; lazy requests only when expanded and retains existing skeleton/error/retry/empty/cache behavior.
- Same attendee shape and child columns in both modes. Normal mock latency 500ms; cancellation/stale delivery remain supported.
- Mode changes reset the table via datasetKey, clearing sort/page/open/cache state. Explain the reset near the switch.
- No scenario controls or unrelated features added to the timetable.

## Review Focus

- Mode selection must change the actual expansion source, not only copy.
- Pending lazy attendees must not arrive in the new inline scope after a switch.
- Empty classes and recoverable attendee failures must remain local to their row.
- The new control must fit narrow screens and remain keyboard accessible.
- Documentation must distinguish lazy simulated requests from actual backend/network fetching.

## Task 1: Mock service and timetable selection

**Files:** `src/mocks/services.ts`, `src/features/timetable/Timetable.tsx`, timetable CSS, focused service/timetable checks.

- [x] Write checks for attendee identity/copy/empty/error-retry/cancellation and for Inline default, lazy skeleton/retry, switch cancellation and no stale delivery.
- [x] Run focused tests and observe failures before implementation.
- [x] Implement `loadAttendees(classId: string, context?: MockContext): Promise<readonly Attendee[]>`, with independent operation keys `attendees:${classId}`. Reuse mockRequest/readClasses; unknown/empty classes return empty lists.
- [x] Add mode state and labeled select, choose typed inline/lazy config and mode-scoped dataset key. Render the existing AttendeeList in both modes. Explain that switching resets the table.
- [x] Run focused/full unit tests, lint and typecheck; expect PASS.

## Task 2: Browser verification and documentation

**Files:** timetable browser journey, README, verification/PRD/API records.

- [x] Extend desktop/mobile journey: keyboard choose On-demand, see child loading then actual attendees, collapse/reopen cached result, switch to Inline and verify reset and immediate attendees.
- [x] Run production browser suite, inspect screenshots and get one fresh read-only review. Fix material findings with a failing regression check first.
- [x] Update README and close the literal brief-alignment gap in verification records; commit `feat: demonstrate both attendee expansion modes` and stop for user review.

## Execution record

- Approved in chat. Source base `3d49ad7`; working tree clean. Main assistant implements; one fresh reviewer checks the result.
- Deployment remains user-managed. Publication of this new behavior will follow user review so the live version remains reviewable before release.
- RED: service check failed because loadAttendees did not exist; timetable check failed because the Attendee loading control did not exist. GREEN: focused 11 checks then all 33 unit checks passed; lint/typecheck passed.
- Context7 current React documentation confirmed controlled native select behavior and key-based scope resets.
- Fresh read-only review: no Critical/Important findings, deferred minors or declined judgments. No production corrections required.
- First production browser run passed desktop modes, tablet and both inventory journeys; mobile pinning assertion used an unscoped descendant selector that also matched closing attendee markup. Scoped it to the parent row, then reran the browser suite.
- Full production browser rerun: 5 journeys passed, duplicate mobile-project tablet case intentionally skipped. Screenshots inspected. Tightened the final screenshot check to wait for the whole expansion transition so records are not captured mid-animation; final focused desktop/mobile timetable journeys rerun for that artifact change.
- No generic table, inventory implementation, dependencies or fixtures changed. The user reviewed the local production preview and approved commit/push of both attendee modes at `2db0243`. Deployment remains user-managed.
