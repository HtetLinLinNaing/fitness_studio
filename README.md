# Fitness Studio

Step 1: project foundation for the reusable data table challenge.

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

The full product requirements remain a draft for later approval. See the [PRD and setup design](docs/superpowers/specs/2026-11-01-reusable-data-table-design.md) and the [Step 1 plan](docs/superpowers/plans/2026-11-01-project-setup.md).
