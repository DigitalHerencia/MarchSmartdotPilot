# Copilot instructions for this repo

Brief: Next.js 15 (App Router) + TypeScript + Tailwind v4 app for a marching band practice studio. Features GPS tracking, metronome, and a simple Web Audio music player. Runs fully in the browser (Geolocation + Web Audio APIs).

## Architecture and data flow
- App shell: `app/layout.tsx` (metadata/viewport, `globals.css`). Main UI in `app/page.tsx` (client component).
- State orchestration in `app/page.tsx`: students, currentRoute, GPS tracking/calibration.
- Hooks: `hooks/use-gps-tracking.ts` (position, accuracy, requestLocation, startTracking), `hooks/use-audio-context.ts` (audioContext, isAudioReady).
- Canvas viz: `components/field-view.tsx` draws field, students, accuracy rings, and waypoints.
- Control panels: `components/route-manager.tsx`, `components/student-tracker.tsx`, `components/music-player.tsx`, `components/metronome.tsx`.
- Data shapes: `types/marching-band.ts` (Position, Student, Waypoint, MarchingRoute, etc.). Field coordinates in yards: x [0,120], y [0,53.33].

## Conventions
- Most interactive files are client components (`"use client"`). Keep that header where needed.
- Path aliases via tsconfig/shadcn: `@/*`, with `@/components/ui`, `@/hooks`, `@/lib`.
- Styling: Tailwind v4 + shadcn/ui (Radix). Utility `cn()` in `lib/utils.ts`.
- Waypoints include `timestamp` (ms) and optional `formation` string; clamp coordinates to field bounds.

## Runtime guardrails
- CSP in `next.config.ts` is strict: external scripts/images/fonts generally blocked by default. Update `headers()`/`images.remotePatterns` if integrating third parties.
- AudioContext is created only after a user gesture; don’t play audio until `isAudioReady` is true.
- Geolocation: call `await requestLocation()` then `const stop = startTracking()` for continuous updates; accuracy values are meters (canvas converts to yards).

## Component contracts
- FieldView: `{ students, route, isTracking, accuracy?, onRouteChange? }`
- RouteManager: `{ currentRoute, onRouteChange }`
- StudentTracker: `{ students, currentStudentId, onStudentChange, position, accuracy? }`
- MusicPlayer/Metronome: `{ audioContext, isReady }`

## Dev workflow
- Run (Turbopack):
  - Windows CMD: `npm run dev` → http://localhost:3000
- Lint/Build/Start: `npm run lint` | `npm run build` | `npm run start`

## Examples
- UI import: `import { Card } from "@/components/ui/card"`
- GPS usage:
  - `const { requestLocation, startTracking } = useGPSTracking()`
  - `await requestLocation(); const stop = startTracking(); /* cleanup: stop() */`
- Add waypoint: `{ id, x, y, timestamp, formation? }` with x∈[0,120], y∈[0,53.33].

## Gotchas
- `app/page.tsx` toggles `isTracking` but doesn’t call `startTracking()`; add it for live updates and keep the cleanup.
- Pass accuracy in meters to `FieldView`; it handles conversion/color thresholds (<3m green, <10m orange, else red).
- Canvas re-renders on students/route/zoom/pan/accuracy; it auto-sizes to its container.

Key files: `app/page.tsx`, `components/field-view.tsx`, `hooks/use-gps-tracking.ts`, `hooks/use-audio-context.ts`, `types/marching-band.ts`.
