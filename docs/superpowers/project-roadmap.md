# HL Fitness Studio — Roadmap and Skill Usage

This is the current project status and proposed remaining roadmap. A roadmap entry is not permission to implement it. Before each step, explain its scope and active skills, obtain user approval, implement only that scope, verify it, and stop for user review.

## Milestones

| Step | Deliverable | Status |
| --- | --- | --- |
| 1 | Next.js/TypeScript/Tailwind/HeroUI project setup | Accepted |
| 2 | PRD, requirements, scope, and acceptance criteria | Accepted |
| 3 | Calm studio visual design and HL Fitness Studio branding | Accepted |
| 4 | Grouped reusable table API design | Accepted |
| 5 | Quality-focused testing foundation | Accepted |
| 6 | JSON fixtures and mock services; 12 classes, 100 items, Singapore/SGD | Accepted |
| 7 | Basic generic table and real timetable; pinned column and request states | Accepted, including the stronger sans-serif/contrast revision |
| 8 | Sorting and pagination, including controlled/client/manual processing | Accepted |
| 9 | Inline and lazy expansion, child caching/retry, transitions | Accepted |
| 10 | Inventory demo route, simulated server mode, scenario controls | Accepted |
| 11 | Final integrated verification, accessibility/performance checks, README | Approved scope; verified, awaiting user review |
| 12 | Public repository and website deployment | Proposed; needs scope/provider/publication approval |

There are **12 proposed milestones**. Steps 1–10 are accepted. Step 11 has approved scope and awaits user review. Step 12 remains unapproved. Existing acceptance of the PRD/API does not authorize all later implementation at once.

## Git milestones

- `e17943d` — original initial Next.js setup commit, preserved.
- `6708dc2` — setup, design, and testing through Step 5.
- `74e3eaa` — mock data and services for Step 6.
- Step 7: `feat: build basic table and class timetable` (see the latest Git log for its hash). Commit subjects and the feature branch do not use a Codex prefix.
- Step 7 review revision: `style: strengthen timetable typography and contrast`, following user approval of sans-serif typography and stronger colors.
- `dd4f95b` — `feat: add table sorting and pagination`, accepted after user review.
- `48428a2` — `feat: add inline and lazy row expansion`, accepted after user review.
- `94c4d86` — `feat: add inventory demo and scenario controls`, accepted after user review.

The former combined commit `0f22600` was split at the user's request. Exact final-tree equality was checked after the split; source content was unchanged.

## Superpowers skills actually applied

| Skill | Purpose in this project | Evidence |
| --- | --- | --- |
| `using-superpowers` | Identify applicable skills at conversation start | Skill instructions read at the start |
| `brainstorming` | Requirements discussion, choices, visual options, written design and approval gates | Approved specs in `specs/` and the local visual companion |
| `writing-plans` | Record the scope and implementation/verification sequence | Saved milestone plans in `plans/`, including final verification |
| `executing-plans` | Implement approved milestones in this chat and maintain execution records | Task checklists and execution records in those plans |
| `test-driven-development` | Observe checks failing before implementing new service/table behavior | Recorded RED→GREEN checks for Steps 6–8 |
| `verification-before-completion` | Run and read checks before success claims and commits | Lint, type checks, focused unit checks, production build/browser records |
| `requesting-code-review` template | Fresh read-only reviews of implementation | Used its reviewer prompt via the executing-plans workflow |
| `receiving-code-review` | Verify review findings and correct them with regression protection | Step 7 deferred-sorting API finding and compile-time regression check |
| `systematic-debugging` | Identify the cause of a preview environment conflict before changing the run method | Step 8 confirmed an existing project development server; preserved it and reused a separate production preview |

Implementation is performed by the main assistant. Fresh subagents have been used for design checks and read-only reviews, not to approve scope on the user's behalf. The user's approval controls scope and progression.

Supporting tools/skills: Context7 provides current official library guidance; computer-use/browser tools were used for the visual companion; Vitest/RTL and Playwright verify implementation. Reading `diagnosing-superpowers` to assess the user's process-visibility question did not start a formal transcript audit or bug report; none was requested.

## Communication rule going forward

Before a step: show its number, deliverable, relevant skill names, what will be built, and what will be reviewable. At handoff: report the actual behavior, verification, any limitation, commit, and overall roadmap position. Ask for approval before starting the next milestone. Keep test explanations focused on important behavior, not test quantity.
