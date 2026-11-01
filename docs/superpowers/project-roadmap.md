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
| 7 | Basic generic table and real timetable; pinned column and request states | Implemented, verified, committed separately; user review pending |
| 8 | Sorting and pagination, including controlled/client/manual processing | Proposed; needs scope approval |
| 9 | Inline and lazy expansion, child caching/retry, transitions | Proposed; needs scope approval |
| 10 | Inventory demo route, simulated server mode, scenario controls | Proposed; needs scope approval |
| 11 | Final integrated verification, accessibility/performance checks, README | Proposed; needs scope approval |
| 12 | Public repository and website deployment | Proposed; needs scope/provider/publication approval |

There are **12 proposed milestones**, including the six already accepted. Steps 8–12 can be adjusted with the user. Existing acceptance of the PRD/API does not authorize all later implementation at once.

## Git milestones

- `e17943d` — original initial Next.js setup commit, preserved.
- `6708dc2` — setup, design, and testing through Step 5.
- `74e3eaa` — mock data and services for Step 6.
- Step 7: `feat: build basic table and class timetable` (see the latest Git log for its hash). Commit subjects and the feature branch do not use a Codex prefix.

The former combined commit `0f22600` was split at the user's request. Exact final-tree equality was checked after the split; source content was unchanged.

## Superpowers skills actually applied

| Skill | Purpose in this project | Evidence |
| --- | --- | --- |
| `using-superpowers` | Identify applicable skills at conversation start | Skill instructions read at the start |
| `brainstorming` | Requirements discussion, choices, visual options, written design and approval gates | Approved specs in `specs/` and the local visual companion |
| `writing-plans` | Record the scope and implementation/verification sequence | Saved plans for Steps 1, 5, 6, and 7 in `plans/` |
| `executing-plans` | Implement approved milestones in this chat and maintain execution records | Task checklists and execution records in those plans |
| `test-driven-development` | Observe checks failing before implementing new service/table behavior | Recorded RED→GREEN checks for Steps 6 and 7 |
| `verification-before-completion` | Run and read checks before success claims and commits | Lint, type checks, focused unit checks, production build/browser records |
| `requesting-code-review` template | Fresh read-only reviews of implementation | Used its reviewer prompt via the executing-plans workflow |
| `receiving-code-review` | Verify review findings and correct them with regression protection | Step 7 deferred-sorting API finding and compile-time regression check |

Implementation is performed by the main assistant. Fresh subagents have been used for design checks and read-only reviews, not to approve scope on the user's behalf. The user's approval controls scope and progression.

Supporting tools/skills: Context7 provides current official library guidance; computer-use/browser tools were used for the visual companion; Vitest/RTL and Playwright verify implementation. Reading `diagnosing-superpowers` to assess the user's process-visibility question did not start a formal transcript audit or bug report; none was requested.

## Communication rule going forward

Before a step: show its number, deliverable, relevant skill names, what will be built, and what will be reviewable. At handoff: report the actual behavior, verification, any limitation, commit, and overall roadmap position. Ask for approval before starting the next milestone. Keep test explanations focused on important behavior, not test quantity.
