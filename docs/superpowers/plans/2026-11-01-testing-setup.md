# Testing Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure the three user-approved testing tools, verify the configuration, and stop for review.

**Architecture:** Vitest runs focused unit/component tests using React Testing Library and jsdom. Playwright runs separate desktop/mobile Chromium checks against an isolated local production server. Tests will accompany later features; do not retain filler tests to inflate counts.

**Tech Stack:** existing Next.js/React/TypeScript, Vitest/Vite React transform, React Testing Library and DOM matchers/user-event, jsdom, Playwright.

**Spec:** approved PRD at `docs/superpowers/specs/2026-11-01-reusable-data-table-design.md`, including the user's quality-over-quantity testing preference and explicit Step 5 tool approval.

## Global Constraints

- Testing foundation only; no feature implementation or visual changes.
- Keep planning and reporting brief; prioritize meaningful behavior and regressions over counts.
- Install compatible versions through npm and update the lockfile.
- Keep unit and browser discovery separate; no arbitrary coverage thresholds.
- Work in the current user-selected project; no Git repository, worktree, publication, or deployment setup is included.

## Review Focus

- React JSX, the source alias, DOM matchers, async user events, and cleanup work together.
- Unit discovery cannot collect browser tests and vice versa.
- Browser checks use a known server on port 3100 rather than silently reusing a different app.
- Mobile project uses a narrow viewport and browser diagnostics are retained on failure.
- Empty suites are reported honestly; the committed commands must not mask missing tests as passing.

## Task 1: Testing configuration

**Files:** modify `package.json`, `package-lock.json`, `.gitignore`, `eslint.config.mjs`, `tsconfig.json`, `README.md`, and PRD status; create `vitest.config.mts`, `playwright.config.ts`, and `tests/setup.ts`. Temporary verification probes are removed after they run.

**Interfaces:** `npm test`, `npm run test:watch`, `npm run test:e2e`, and `npm run test:e2e:install`; unit tests under `tests/unit/**/*.test.{ts,tsx}`, browser tests under `tests/e2e/**/*.spec.ts`.

- [x] Install approved test tools and their required support packages; install Chromium for local verification.
- [x] Configure JSX, jsdom, typed matchers, cleanup, source alias, separate discovery, and desktop/mobile projects.
- [x] Verify the integrations with temporary probes, then remove the probes. Document empty-suite behavior instead of retaining setup-only tests.
- [x] Run lint, strict type checking, and production build; review the setup for scope and configuration errors.
- [x] Document results, stop, and wait for user review before any feature work.

## Execution record

- Step 5 is approved. User explicitly prefers concise planning, meaningful feature/regression tests, and no quantity targets.
- Configuration work uses direct tool checks and temporary verification rather than permanent product tests, because no product feature is implemented in this step.
- Installed Vitest 5.0.5, Vite 8.3.5, React Testing Library 16.3.3, Playwright 1.64.1, compatible support packages, and the corresponding Chromium browser. Exact resolution is in package-lock.json.
- Temporary Vitest integration checks passed: React JSX, source alias, actual HeroUI rendering, DOM matchers, between-test cleanup, async user-event, and mock assertions.
- Temporary Playwright checks passed against the production build in desktop and 375px mobile Chromium; HTTP 200, placeholder rendering, disabled HeroUI control, and no page errors. Playwright managed build/start/shutdown on the dedicated local test port.
- Lint and standalone strict type checking exited successfully. The Playwright webServer command performed a successful production build before running browser checks; no redundant build was needed.
- Temporary probes were removed. Normal test commands intentionally fail when no tests exist; no passWithNoTests setting masks that condition. Feature tests will be introduced alongside approved feature implementation.
- The existing 16 moderate development-tool audit findings remain unchanged; no forced dependency overrides or downgrades were applied.
- After removing probes, `vitest list --filesOnly` successfully loaded the final configuration and found no product tests. Confirmed both temporary probe files were absent.
- Fresh read-only setup review found no actionable issues. It confirmed package/lockfile consistency, separate discovery, cleanup, source alias, diagnostics, isolated server, and documented empty-suite behavior.
- Step 5 is ready for user review; no subsequent implementation step has begun.
