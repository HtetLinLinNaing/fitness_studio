# HL Fitness Studio

Project and testing foundation for the reusable data table challenge.

## Requirements

Node.js 24 or newer and npm 10 or newer. Setup is verified using Node.js 24.16.0.

## Run locally

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The placeholder displays “Fitness Studio”, a setup message, and a disabled HeroUI button that verifies library integration.

## Verify

```sh
npm run lint
npm run typecheck
npm run build
```

To run the production build locally:

```sh
npm start
```

## Tests

The testing tools are configured for meaningful feature and regression checks. Tests will accompany the features they protect; there are no placeholder tests or test-count/coverage targets.

- Unit/component tests: `tests/unit/**/*.test.ts` or `.test.tsx` using Vitest, React Testing Library, DOM matchers, and user-event. React JSX, jsdom, automatic cleanup, and the `@/` source alias are configured. Import `test`, `expect`, and other test APIs from `vitest`; globals are disabled.
- Browser tests: `tests/e2e/**/*.spec.ts` using Playwright. The same checks run in desktop Chromium and a 375px mobile Chromium viewport. The runner builds and starts the app on `127.0.0.1:3100` and closes that server when finished. It rejects an already occupied test port so it cannot silently exercise another server. Traces and screenshots are retained on failures.

```sh
npm test
npm run test:watch
npm run test:e2e:install
npm run test:e2e
```

Run the browser-install command once after installing packages, and again when a Playwright update requires a new browser version. Unit and browser test discovery are separate. Feature tests have not been added yet, so both runners currently report no tests and exit unsuccessfully; missing tests are not disguised as a passing suite. Temporary tooling checks were removed after setup verification.

The browser HTML report is written to `playwright-report/`, with diagnostics under `test-results/`. These generated folders, as well as coverage output, are ignored by Git and ESLint.


## Foundation

- Next.js App Router with React and strict TypeScript.
- Tailwind CSS v4 and HeroUI v3 using their global CSS imports.
- npm with a lockfile for reproducible installations.
- ESLint with the Next.js Core Web Vitals and TypeScript rules.
- `src/app` for routes and layout; `@/*` resolves to `src/*`.
- `npm run typecheck` generates route types before checking TypeScript, so it also works before the first build.

ESLint 9 and TypeScript 5.9 are selected for compatibility with the installed Next.js lint plugins. At setup verification, npm reported 16 moderate development-tool findings propagated from `minimatch`; the runtime-only audit reported zero vulnerabilities. No forced downgrade or incompatible dependency override has been applied.

HeroUI is reserved for non-table controls. The future table will use native HTML and custom behavior; no table/grid library is included.

## Approval workflow

Before each step, propose its scope and any dependency, style, or behavior decisions. Wait for user approval, build only the approved step, and stop for user review.

Step 1 includes only setup and a plain placeholder. Dashboard styling, table implementation, mock data, demo routes, testing tools, repository publication, and deployment require approval in later steps.

Steps 1–5 (setup, PRD, visual design, API design, and testing setup) are accepted. The selected visual direction is Calm studio with the HL Fitness Studio name. Mock-data services and subsequent table/dashboard implementation require separate approval. See the [approved PRD](docs/superpowers/specs/2026-11-01-reusable-data-table-design.md), [visual design](docs/superpowers/specs/2026-11-01-dashboard-visual-options.md), [component API](docs/superpowers/specs/2026-11-01-data-table-api-design.md), and [testing setup record](docs/superpowers/plans/2026-11-01-testing-setup.md).
