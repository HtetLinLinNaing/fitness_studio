# Final Verification Implementation Plan — Step 11

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify the finished app against the original assessment, correct confirmed defects, and provide accurate reviewer documentation.

**Architecture:** Reuse existing test infrastructure and source. Add focused acceptance checks only where existing checks leave a material requirement uncovered. Keep any generated stress data confined to verification. Record observed results and limitations rather than universal performance/accessibility claims.

**Tech Stack:** existing Next.js/React/TypeScript, Vitest/RTL and Playwright; no new dependencies.

**Spec:** original assessment attachment and `../specs/2026-11-01-reusable-data-table-design.md`. User approved final requirements checks, keyboard/mobile/performance verification, confirmed-issue fixes and README completion. No new features, visual redesign, publication or deployment.

## Global Constraints

- Keep the table built from scratch and shared by both datasets.
- Retain the approved 12 classes/100 inventory items, Singapore/SGD and current styling.
- Meaningful checks only; no coverage percentage or test-count targets.
- Use existing feature checkout. Preserve user changes and existing development server.
- Public repository and deployment remain Step 12 and require approval.

## Review Focus

- Required behavior must be demonstrable, not only present in a design document.
- Nested tables, hidden panels and keyboard targets must retain sensible semantics and focus behavior.
- Re-rendering or pending request changes must not bypass sort/page/cache correctness.
- Large data must be processed before page-limited rendering; report measured environment and limits.
- README snippets must match real exports/types, and simulated server behavior must not imply an actual backend.

## Task 1: Acceptance and verification

**Files:** existing source/tests; add focused checks under `tests/unit/` and `tests/e2e/` only for uncovered behavior. Record verification in `docs/verification.md`.

- [x] Compare all original requirements against implementation and existing checks; identify concrete gaps.
- [x] Verify tablet layout, semantic labels/header scopes, keyboard interaction and hidden focus behavior using existing browser infrastructure.
- [x] Measure sorting with temporary generated larger data; verify only a parent page renders. Measure client sort responsiveness on the production browser app and distinguish it from simulated request delay.
- [x] Obtain one fresh read-only full implementation review. For confirmed material defects, reproduce with a failing check, correct them, and verify the relevant/full suite.
- [x] Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run test:e2e`; expect all PASS, including the production build. Inspect current browser artifacts.

## Task 2: Documentation and handoff

**Files:** README, `docs/verification.md`, roadmap/PRD/plan records.

- [x] Complete API examples for both datasets, controlled/uncontrolled/client/manual decisions, sticky geometry, inline/lazy cache lifecycle, assumptions/tradeoffs, setup and verification.
- [x] Reconcile superseded route/status wording with the accepted `/inventory` implementation. Record what remains unpublished.
- [x] Run `git diff --check`; stage only milestone files and commit `chore: verify assessment requirements and finalize documentation` (use a behavior-specific subject if a material fix changes scope).
- [x] Restore the local production preview and stop for Step 11 user review. Step 12 remains unapproved.

## Execution record

- Scope approved in chat. Source base is `94c4d86`; existing working-tree documentation records Step 10 acceptance.
- Skills: writing-plans, executing-plans, verification-before-completion, requesting-code-review; test-driven-development/systematic-debugging for any discovered defect.
- Original brief read and mapped to evidence in `docs/verification.md`. No material functionality gaps were found. Public repo/deployed URL remain deliberately pending Step 12.
- Verification added only where evidence was missing: one generated 5,000-row page-limited rendering check, one tablet/semantic browser journey with client interaction measurements, and a reproducible in-memory sort benchmark. No production code, styling, dependencies or fixtures changed.
- Results: 31 unit checks pass; lint and typecheck pass; production build passes; 5 browser journeys pass, with the duplicate mobile-project tablet case intentionally skipped. Desktop/mobile/tablet screenshots inspected.
- Fresh full implementation review: no Critical/Important findings, no deferred minors and no declined judgments. No fixes or behavior rulings required.
- Performance: 5,000 shuffled records sorted/sliced in 16.439ms median and 34.470ms P95 on this Windows/Node environment. Production 100-item client sort samples (including two frames) ranged 8.6–34.6ms. Detailed methodology and limits are documented; no universal guarantee or unmeasured large-browser claim is made.
- The user accepted Step 11 after commit `472b0c8` and requested removal of the roadmap document, completed in `984bcb4`. Publication/deployment remain separately gated Step 12.
