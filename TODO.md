# Marching Band PWA — Gap Analysis & AI‑Optimized TODO

This plan compares the current codebase to PRD.md and lays out a concrete, Copilot-friendly implementation roadmap. Tasks are small, independently testable, labeled with target files, and include brief acceptance criteria and suggested prompts.

## Snapshot: PRD vs Current Implementation (Updated)

- GPS & Field Grid
  - Current: Geolocation via `use-gps-tracking.ts` shim using `features/gps/hooks/useGpsTracker.ts` (2Hz loop + worker), accuracy display; canvas field grid in `components/field-view.tsx`; calibrated lat/lon → field conversion using affine transform; error margin overlay.
  - PRD: 2Hz loop, smoothing/Kalman, worker, calibration to field hash/sidelines; error margin overlay.
  - Status: Done (core path). Calibration and overlays implemented; ongoing tuning as needed.

- Route Management
  - Current: Create/edit routes, import/export JSON, preview scrubber; in-memory store with server actions; optional Prisma path when `DATABASE_URL` is set.
  - PRD: Create/edit, store, import/export, multi-step preview.
  - Status: Done (DB persistence optional and pending environment setup).

- Practice Mode
  - Current: Metronome with scheduler visuals, Practice HUD, live error metrics vs target; route preview scrubber.
  - PRD: Step-by-step playback, audio cues, live dot tracking with error margin.
  - Status: Partial (HUD and visuals done; automated step playback/audio cues can be expanded).

- Performance Mode
  - Current: Real-time overlay and visual tempo pulses (`VisualCueLayer`), cue text overlay.
  - PRD: Real-time overlay, visual tempo pulses, sheet music/cue cards.
  - Status: Done (baseline cues), can iterate.

- Music Import & Analysis
  - Current: MusicXML upload/parsing to counts/phrases; phrase map helpers.
  - PRD: Upload PDFs/MusicXML, parse measures/phrases, optional AI phrasing.
  - Status: Partial (MusicXML done; PDF and advanced AI suggestions deferred).

- Personalization & Auth
  - Current: Clerk auth, preferences (step size, field dims, notation style) via server actions; gated settings.
  - PRD: Clerk auth, preferences, shows/parts.
  - Status: Partial (core preferences done; shows/parts later).

- Data/Infra
  - Current: Server actions; Prisma schema present; SW for offline; optional Neon via `DATABASE_URL`.
  - PRD: Neon + Prisma, server actions, caching, offline-first PWA.
  - Status: Partial (DB wiring available; needs env + migration to activate).

- QA/Tooling/CI
  - Current: Vitest config + unit tests; Playwright specs; ESLint/TypeScript in place; basic GitHub templates.
  - PRD: Vitest + Playwright; full CI/CD, code quality/security workflows, VS Code recs.
  - Status: Partial (workflows can be added next).

---

## Phase 0 — Structure, Conventions, and Dev Ergonomics

- [x] Introduce feature-driven structure (non-breaking; keep current paths working)
  - Files: create scaffolding dirs `march-smart/features/{gps,field,routes,practice,performance}/`, `march-smart/lib/{actions,fetchers,music}/`, `march-smart/schemas/`, `march-smart/types/` (reuse existing `types/marching-band.ts`).
  - Acceptance: New folders exist; we add placeholder index files and move logic incrementally in later phases.
  - Done: Verified existing feature-driven folders and placeholder index files under `march-smart/features/*`, `lib/*`, and `schemas/`.
  - Copilot prompt: "Generate minimal index files for the new feature folders with TODO comments for migration."

- [x] Add repo tooling: ESLint, Prettier, Commitlint, EditorConfig, VS Code recs
  - Files: `.editorconfig`, `.prettierrc`, `.commitlintrc.cjs`, `.vscode/{extensions.json,settings.json}`; ensure `eslint.config.mjs` aligns with rules in PRD.
  - Acceptance: `npm run lint` works, formatting consistent, commit messages checked locally (optional Husky later).
  - Done: Added `.editorconfig`, `.prettierrc`, `.commitlintrc.cjs` in repo root and `.vscode` recommendations/settings. ESLint CLI runs without errors.
  - Prompt: "Create Prettier and Commitlint config with recommended rules for Next.js + TS."

- [x] Add base test setup (Vitest, Playwright)
  - Files: `package.json` scripts: `test`, `typecheck`; `vitest.config.ts`; `playwright.config.ts`; example unit test for `lib/utils.ts` and a smoke e2e.
  - Acceptance: `npm test` runs unit tests; `npx playwright test` runs a single e2e smoke.
  - Done: Installed `vitest` and `@playwright/test`; added `vitest.config.ts`, `playwright.config.ts`, `lib/utils.test.ts`, and `e2e/smoke.spec.ts`. `vitest run` passes the unit test.
  - Prompt: "Write Vitest tests for cn util and a failing placeholder for GPS smoothing to TDD the filter."

---

## Phase 1 — GPS Tracking Reliability & Field Calibration

- [x] GPS worker + 2Hz update loop with smoothing
  - Files: `features/gps/hooks/useGpsTracker.ts` (new), `features/gps/workers/gpsWorker.ts` (new), migrate from `hooks/use-gps-tracking.ts` (keep shim export for compatibility).
  - Acceptance: Position updates at ~2Hz when moving; accuracy history tracked; no UI regressions.
  - Done: Added `useGpsTracker` with worker-based throttling and smoothing; shimmed `use-gps-tracking` to reuse it.
  - Prompt: "Refactor GPS tracking into a Web Worker with a 2Hz loop and postMessage events; preserve current hook API."

- [x] Implement 2D Kalman filter for position smoothing
  - Files: `features/gps/utils/kalmanFilter.ts` (new), unit tests.
  - Acceptance: Simulated jitter reduced by >50% RMS in tests; toggleable via hook option.
  - Done: Constant-velocity 2D Kalman filter implemented with unit test (RMS reduction confirmed).
  - Prompt: "Implement a simple constant-velocity 2D Kalman filter with unit tests; minimal API: init(), update({lat,lon}), get()."

- [x] Field calibration flow (hash marks/sidelines)
  - Files: `features/field/utils/fieldMath.ts` (new), `components/field-view.tsx` calibration UI controls, small client dialog.
  - Acceptance: User can tap known field points to calibrate an affine transform; lat/lon→field (yards) conversion error < 1.5 yards on sample points.
  - Prompt: "Add an affine transform solver from 3+ geo points to field coords; expose applyTransform()."
  - Done: Live GPS is passed into `FieldView` as `currentGeo`; clicking field points during calibration pairs them with latest GPS; affine transform solved with RMS reported via callback; transform stored in `app/page.tsx` and used for GPS→field conversion.

- [x] Accuracy ring and error margin integration
  - Files: `components/field-view.tsx` (reuse), paramize visualization with calibrated transform.
  - Acceptance: Accuracy circle reflects GPS accuracy (m→yards) post-transform; toggle works.
  - Prompt: "Wire accuracy ring to calibrated transform and ensure yard scaling is correct."
  - Done: Field dot uses calibrated mapping; accuracy ring centers on transformed position and supports scale control.

---

## Phase 2 — Route Management: Persistence, Import/Export, Preview

- [x] Zod schemas for route and preferences
  - Files: `schemas/routeSchema.ts`, `schemas/userPreferencesSchema.ts`.
  - Acceptance: Parsing/validation works in unit tests; schema matches `types/marching-band.ts`.
  - Prompt: "Create Zod schemas mirroring MarchingRoute and Waypoint with strict inference."
  - Done: Added `schemas/routeSchema.ts` and `schemas/userPreferencesSchema.ts`; exported via `schemas/index.ts`.

- [x] Server actions for CRUD routes (no API routes)
  - Files: `lib/actions/routes.ts` ('use server'), `lib/fetchers/routes.ts`, minimal Prisma model later.
  - Acceptance: Can create/list/delete in-memory or file-backed initially, then swap to DB in Phase 4.
  - Prompt: "Write Next.js 15 server actions for routes with optimistic UI in client."
  - Done: Implemented in-memory store `lib/routes/store.ts`; server actions `lib/actions/routes.ts` with create, upsert, list, getById, delete; typed fetchers in `lib/fetchers/routes.ts` validating with Zod.

 - [x] Import/Export (JSON)
  - Files: `features/routes/RouteEditor.tsx` (new), update `components/route-manager.tsx` to call import/export.
  - Acceptance: Export current route to JSON and re-import it; preserves timestamps/formations.
  - Prompt: "Add download/upload JSON for MarchingRoute; validate with Zod before accepting."
  - Done: Added `features/routes/RouteEditor.tsx`, integrated into `components/route-manager.tsx`. Export generates JSON; Import validates using Zod and updates current route.

 - [x] Multi-step preview mode
  - Files: `features/routes/RouteViewer.tsx` (new), integrate in `app/page.tsx`.
  - Acceptance: User can scrub steps and see formation transitions on the field canvas.
  - Prompt: "Implement a scrubber-based route preview: draws path until selected waypoint with time labels."
  - Done: Added `features/routes/RouteViewer.tsx`; wired `previewIndex` prop through `app/page.tsx` into `components/field-view.tsx` to draw path up to selected waypoint and gray out future markers.

---

## Phase 3 — Practice Mode

- [x] Practice HUD with step counts and next-step indicator
  - Files: `features/practice/PracticeHUD.tsx` (new), mount within page.
  - Acceptance: Shows current count, next waypoint vector; configurable step size.
  - Prompt: "Build a compact HUD component that renders count, BPM, and arrow to next dot based on route."
  - Done: Added `PracticeHUD` showing BPM, current step, step size, distance in yards and steps, and direction vector; integrated into `app/page.tsx` and wired to current position and preview index.

- [x] Metronome accuracy and visual pulses
  - Files: enhance `components/metronome.tsx`; add visual pulse overlay layer.
  - Acceptance: Click scheduling drift < 10ms over 1 min; canvas pulses aligned to beat.
  - Done: Rewrote metronome with WebAudio scheduler (lookahead + scheduleAhead), added beat-synced canvas pulses; volume tied to master gain. See `components/metronome.tsx`.
  - Prompt: "Switch setInterval to audio clock-based scheduling using WebAudio time."

- [x] Live “dot” tracking vs target with error margin
  - Files: `features/practice/utils/errorMetrics.ts`, tests; integrated overlay in `components/field-view.tsx`; wired in `app/page.tsx`.
  - Acceptance: Error in steps (> 0.5 steps) highlights red per PRD; unit tests for conversion steps↔yards.
  - Done: Added helpers (errorComponentsYards, errorInSteps, isOffTarget) + tests; FieldView draws vector and badge with steps, colored red when off-target; page passes current position and step size.
  - Prompt: "Compute lateral/longitudinal error in yards and convert to steps given user’s step size."

---

## Phase 4 — Performance Mode

- [x] Real-time target overlay and off-target indicators
  - Files: `features/performance/VisualCueLayer.tsx` (new) for pulses; off-target arrow integrated in `components/field-view.tsx` using error metrics.
  - Acceptance: When off by > 0.5 steps, indicator shows direction/magnitude.
  - Done: FieldView overlay draws vector and step badge; VisualCueLayer mounted above FieldView.

- [x] Visual tempo cues (flashing lines/pulses)
  - Files: part of VisualCueLayer; sync with metronome.
  - Acceptance: Pulses visually match BPM within ±10ms visual sync budget.
  - Done: `features/performance/VisualCueLayer.tsx` renders yard line pulses synced to audio clock.

- [x] Cue cards / minimal sheet overlay
  - Files: `features/performance/SheetOverlay.tsx`.
  - Acceptance: Toggle overlay showing upcoming phrase/cue.
  - Done: Simple cue text overlay added and mounted above FieldView.

---

## Phase 5 — Music Import & Analysis

- [x] Music upload pipeline (local only first)
  - Files: `lib/music/parseMusicXml.ts`, UI in `features/practice/MusicUpload.tsx`, schema `schemas/musicSchema.ts`.
  - Acceptance: Accept MusicXML; extracts tempo, time signature, and per-measure beats (PDF deferred).
  - Done: Implemented MusicXML parsing via DOMParser; added MusicUpload UI showing summary.

- [x] Counts/phrases generation and linking to route
  - Files: `lib/music/phraseMap.ts`, `schemas/musicSchema.ts`.
  - Acceptance: Given tempo + time signature, produce counts; associate waypoints with count indices.
  - Done: Added buildPhraseMap() and findWaypointForCount().

 - [x] Optional AI phrasing suggestions (defer heavy AI; preview interface)
  - Files: `features/practice/PhrasingSuggest.tsx` (preview UI with notes).
  - Acceptance: UI preview behind a feature flag; no external calls.
  - Done: Added `PhrasingSuggest` client component with local-only sample ideas; mounted behind `NEXT_PUBLIC_ENABLE_AI_PHRASE` flag in Music tab (mobile + desktop). No network usage.
  - Prompt: "Create a preview panel to host future AI phrasing suggestions."

---

## Phase 6 — Auth, Preferences, Persistence

- [x] Clerk auth integration (basic sign-in)
  - Files: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`, `app/(auth)/sign-up/[[...sign-up]]/page.tsx`, `app/layout.tsx` (ClerkProvider), `middleware.ts` (protect `/settings`), header controls in `app/page.tsx`.
  - Acceptance: Users can sign in; gated routes for saving routes/preferences.
  - Notes: Added UserButton and links; `/settings` secured; `.env.example` updated for Clerk keys.
  - Prompt: "Integrate Clerk React with simple sign-in and protect routes page."

- [ ] Prisma + Neon setup and minimal models
  - Files: `prisma/schema.prisma` (Route, Waypoint, UserPreferences), `lib/db.ts`.
  - Acceptance: CRUD routes backed by DB; dev works with Neon connection string.
  - Progress: Prisma schema and client helper added; server actions in `lib/actions/routes.ts` use Prisma when `DATABASE_URL` is set; pending: set `DATABASE_URL` and run migrations.
  - Prompt: "Define Prisma models for Route and Waypoint; migrate and wire to server actions."

- [x] User preferences (step size, field dims, drill style)
  - Files: `lib/actions/preferences.ts`, UI in settings panel.
  - Acceptance: Preferences persisted per user; used by Practice/Performance calculations.
  - Done: Server action `savePreferences` and `getPreferences` added; `features/practice/SettingsPanel.tsx` implemented and mounted at `/settings`; `app/page.tsx` loads `stepSizeYards` on mount and passes to HUD/FieldView; future enhancement to apply field dims/notation globally can be handled later.
  - Prompt: "Add a Preferences form with Zod validation and server action save."

---

## Phase 7 — PWA & Offline-First

- [x] Service worker and caching strategy
  - Files: PWA plugin/config or custom SW; cache routes, assets, and simple offline page.
  - Acceptance: Installable; basic functionality (Practice HUD and field view) available offline.
  - Prompt: "Add a minimal service worker for offline route data and static assets."
  - Done: Added `public/sw.js` with network-first for pages (offline fallback to `public/offline.html`), stale-while-revalidate for JS/CSS, and cache-first for images. Added `app/manifest.ts` and linked manifest in `app/layout.tsx`. Registered SW via `components/SwRegister`. App installs and serves cached shell offline.

- [x] Offline DB strategy (optional)
  - Files: IndexedDB wrapper for routes; sync with server on reconnect.
  - Acceptance: Routes can be used/edited offline and sync later (basic conflict strategy).
  - Prompt: "Create a tiny IndexedDB store for routes and a sync action."
  - Done: Added `lib/routes/offlineStore.ts` with IndexedDB stores for routes and a simple change queue. Added `lib/routes/syncClient.ts` and `components/RouteSyncInit` to auto-sync queued upserts/deletes when back online using existing server actions. This enables offline edits with background sync on reconnect. Basic last-write-wins assumed for now.

---

## Phase 8 — QA, Accessibility, CI/CD

- [x] A11y pass and color contrast
  - Files: `components/field-view.tsx`, `components/ui/{dialog,slider}.tsx`, `features/routes/RouteViewer.tsx`.
  - Acceptance: Keyboard shortcuts for zoom/pan, ARIA labels on controls and sliders, focus-visible maintained; live regions for calibration/status added. Contrast maintained for off-target/error badges.
  - Notes: Canvas labeled and focusable; Dialog close has aria-label; Slider thumbs labeled; preview label announced via aria-live.

- [x] Unit tests for GPS, math, and schemas
  - Files: `features/gps/utils/kalmanFilter.test.ts` (existing), `features/field/utils/fieldMath.test.ts` (added), `schemas/schemas.test.ts` (added).
  - Acceptance: Coverage thresholds set to 70% for logic modules (Vitest thresholds); tests pass locally.
  - Notes: Vitest config updated to focus on logic tests and exclude e2e specs. Package script runs only unit tests.

- [x] Playwright e2e for core flows
  - Files: `e2e/core-flows.spec.ts`.
  - Acceptance: Creates a route, adds waypoints, scrubs preview; relies on accessible labels; intended to pass in CI against built app.
  - Notes: Preview slider gets aria-describedby and aria-live label for reliable assertions.

- [x] .github workflows and project hygiene (from PRD)
  - Files: Workflows added: `ci.yml`, `e2e.yml`, `preview-vercel.yml`, `release.yml`, `labeler.yml`, `codeql.yml`, `secret-scan-block.yml`, `lockfile-lint.yml`; Configs: `.github/labeler.yml`, `.github/dependabot.yml`; Templates: ISSUE/PR.
  - Acceptance: CI runs lint/typecheck/unit tests; labeler and dependabot configured; CodeQL enabled.
  - Notes: E2E workflow installs browsers and runs Playwright headless after build.

---

## Quick Risk/Edge Case Notes

- GPS drift and multipath can exceed ±10m; display confidence and encourage calibration.
- Worker timing throttled on backgrounded tabs; keep UI tolerant and fall back to geolocation watch.
- Offline and auth interplay: ensure guest mode works; sync on login without data loss.
- MusicXML variability: start with strict subset; validate and surface parsing errors clearly.

---

## Minimal Contracts (for core modules)

- GPS Tracker Hook
  - Input: options { smoothing: boolean, hz: number }
  - Output: { position, accuracy, averageAccuracy, bestAccuracy, start/stop, error }
  - Error modes: permission denied, timeout, unavailable
  - Success: emits at ~hz with smoothed positions

- Field Math
  - Input: 3–6 calibration points (geo ↔ field)
  - Output: transform fn, inverse fn, error estimate
  - Success: RMS error ≤ target threshold

---

## What’s Already Good

- Next.js 15, React 19, Tailwind v4 baseline OK.
- Solid canvas-based field renderer with waypoints and accuracy ring visuals.
- Sensible security headers in `next.config.ts`.

---

## How to Work This Plan with Copilot

- Use small branches per checkbox; Conventional Commits.
- Within each file, ask: "Draft the function + tests first," then iterate.
- Prefer server actions for mutations; keep client code focused on interactivity.
- After each Phase, add/adjust e2e to lock behavior.

---

## Acceptance Summary Mapping (PRD → Status)

- GPS precision + calibration + 2Hz updates: Partial → Planned (Phases 1)
- Route create/edit/store + import/export + preview: Partial → Planned (Phase 2)
- Practice mode (steps, tempo, live error): Missing → Planned (Phase 3)
- Performance mode (overlay, pulses, cues): Missing → Planned (Phase 4)
- Music import/analysis (MusicXML): Missing → Planned (Phase 5)
- Personalization (step size, styles) + Auth: Missing → Planned (Phase 6)
- Offline-first PWA: Missing → Planned (Phase 7)
- Testing/CI/Quality: Missing → Planned (Phase 8)

---

## Quality gates (current)

- Build: Not run
- Lint/Typecheck: Lint OK (ESLint CLI); typecheck script added
- Unit tests: PASS (Vitest green on sample test)
- E2E: Configured (Playwright installed; smoke test scaffolded)

---

## Next Steps

1) Implement Phase 1 GPS reliability (worker + Kalman + calibration utils).
2) Land Phase 2 route persistence and preview (schemas, actions, import/export).
3) Add CI workflows and more tests (begin Phase 8 incrementally).

This document will evolve as features are implemented and validated.
