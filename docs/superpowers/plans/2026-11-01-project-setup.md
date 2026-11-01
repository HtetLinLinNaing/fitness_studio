# Project Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create only the approved project foundation and stop for user review.

**Architecture:** One Next.js App Router application under `src/app`. Integrate HeroUI styles with Tailwind CSS and display one non-table HeroUI control on an otherwise plain placeholder page. Use local state only if needed to verify the control.

**Tech Stack:** Next.js, React, TypeScript, HeroUI, Tailwind CSS, ESLint, npm.

**Spec:** `docs/superpowers/specs/2026-11-01-reusable-data-table-design.md`, specifically the approved Step 1 scope.

## Global Constraints

- Implement only the user-approved Step 1; stop for review afterward.
- No table/grid library, dashboard styling, table implementation, test framework, or backend.
- Strict TypeScript, `src/`, and `@/*` mapping to `src/*`.
- Use compatible stable versions and commit exact dependency resolution to the npm lockfile.
- Use the existing user-selected folder; do not create another project or worktree.

## Review Focus

- Dependency compatibility: npm installation must resolve without forcing peer dependencies.
- Production integration: the build must compile the HeroUI control and CSS.
- Type checking: the standalone type-check script must work without relying on an existing build.
- First load: the placeholder must return HTTP 200 and show expected text.
- Scope: no product UI, grid packages, testing tools, or external services.

## Task 1: Approved foundation

**Files:** Create `package.json`, `package-lock.json`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, and `README.md`. Update the design status and this plan's progress.

**Interfaces:** Consumes approved setup decisions. Produces `npm run dev`, `npm run build`, `npm start`, `npm run lint`, and `npm run typecheck`; route `/` with a minimal setup placeholder. No public component API is introduced.

- [x] Check local Node/npm and current compatible stable package metadata against official documentation.
- [x] Create configuration and a plain placeholder with one HeroUI button to exercise integration. Use system fonts and library defaults; do not establish a dashboard visual style.
- [x] Install packages with npm, preserving exact resolution in `package-lock.json`.
- [x] Document local startup, verification, approved scope, and future-step approval requirements in the README.
- [x] Run lint, strict type checking before the build, and production build; require successful exit codes.
- [x] Start the app, request `/`, and confirm HTTP 200 plus placeholder text and HeroUI control markup. Review implementation against the approved scope.
- [x] Record results and stop for the user's review. Do not publish or start the next step.

No automated test framework is approved for this step. Configuration, build, and HTTP smoke checks are the verification gates. Repository initialization and commits are deferred; the folder has no Git repository yet.

## Execution record

- User approval: explicit approval of Step 1 only; implementation performed in the same chat.
- Node 24.16.0 / npm 11.13.0. Installed Next.js 16.4.3, React 19.3.1, HeroUI 3.2.7, and Tailwind 4.3.3, with exact transitive resolution in the lockfile.
- Ruling: retain compatible ESLint 9 and TypeScript 5.9 instead of unsupported major upgrades; the installed React lint plugin's peer range excludes ESLint 10, and TypeScript ESLint excludes TypeScript 7. Cost: a deprecated ESLint release pending upstream compatibility.
- Ruling: preserve the compatible lint dependency tree rather than force npm's proposed major downgrades or override minimatch across incompatible versions. Full audit reports 16 moderate development-tool findings from one minimatch advisory; runtime audit reports zero. Cost: development tooling retains the upstream advisory.
- Lint, standalone type checking before build, and production build each exited successfully.
- Production server at http://127.0.0.1:3000 returned HTTP 200; response included the heading, placeholder message, disabled HeroUI button, and stylesheet reference.
- The restricted terminal could not enter the workspace's parent directory; installation and verification ran with the approved elevated tool path and explicit project location. No external publication performed.
- Fresh read-only review found the documented Node minimum below a locked lint dependency's requirement. Corrected the project and README to Node 24+, matching the verified environment. No other actionable findings.
- Review scope: browser appearance/hydration and later product behavior remain outside this setup check; no visual design is being approved by this step. HTTP/build checks cover the placeholder integration only.
