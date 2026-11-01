# Compact Workspace Implementation Plan

**Goal:** Apply the user's selected Compact workspace preview to timetable and inventory.

**Design:** The user selected Compact workspace in the interactive sample and confirmed it in chat. Use a neutral canvas, wide content, compact heading and summary, a single table toolbar, restrained status colors, and denser rows. Retain the green logo, sticky header, and right-aligned navigation.

**Architecture:** Share page framing through StudioPage and add an optional actions slot to SectionCard. Keep domain controls and table behavior in their existing modules. Use the existing Next.js, React, HeroUI and Tailwind utilities and shared global CSS setup without new dependencies.

## Work

- [x] Add shared StudioPage layout and compact SectionCard toolbar; update both pages.
- [x] Simplify class cell presentation and restyle table, controls and detail surfaces. Preserve sorting, pagination, expansion, stable IDs, accessible labels, and mobile pinned columns.
- [x] Run unit tests, lint, type checks, production browser tests, and visual desktop/mobile checks. Check sticky navigation and no page overflow.

## Review focus

- Long class names and times remain readable with the pinned column.
- All assessment controls remain reachable and labeled on mobile.
- Loading, errors, retries and empty data retain their current behavior.
- The shared page layout allows date context to wrap without colliding with its heading.
- Reduced-motion settings and keyboard focus remain supported.

## Verification

33 unit tests passed; lint, type checking and the production build passed. Browser suite: 5 passed, 1 existing skip. Both routes were checked at 320px, 375px and 1440px: no page overflow, sticky header at the top, and right-aligned navigation. Desktop timetable and mobile inventory screenshots were visually inspected.
