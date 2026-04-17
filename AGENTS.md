# AGENTS.md

This repository is RoughCut's internal fork of VideoContext.

## Purpose

The short-term goal is to stabilize the existing engine for RoughCut's preview player.

The long-term goal is to evolve this fork into a maintained RoughCut-owned browser video-composition engine.

## Current phase

Stabilisation is complete (v0.54.0-roughcut.7.1). We are now in the hardening and integration phase.

Current version: `0.54.0-roughcut.7.1` on `main` branch.

What has shipped:

- Vite 8, Vitest 4, Playwright, ESLint 10, Husky, GitHub Actions CI
- Full TypeScript migration (strict mode, 186 tests)
- Engine fixes: stall recovery, seek debounce, reset/cleanup, end-of-track determinism
- Cache init and play() error hardening
- Public API surface defined
- Published to GitHub Packages as `@recallatk/videocontext`

Priority now:

- verify stability in the RoughCut app under real usage
- expand integration test coverage
- define adapter boundary for app integration
- reduce remaining `any` type warnings

## RoughCut integration context

The RoughCut application currently uses VideoContext in its preview player.

Important integration files in the app repo:

- `src/context/video-player-context.tsx`
- `src/context/video-context-functions.ts`
- `src/app/(authenticated)/project/[projectId]/preview/preview-content.tsx`

The app already "makes it work", and this fork exists to reduce fragility and improve ownership.

## Immediate problems to address

These were addressed in the stabilisation releases (v3.1–v7.1):

- ~~play/pause AbortError behavior~~ — fixed in v7.0
- ~~media element cache init behavior~~ — fixed in v7.0
- ~~reset and callback cleanup~~ — fixed in v3.1
- ~~rapid interaction stability~~ — tested in v3.1
- ~~deterministic seek/end-of-track behavior~~ — fixed in v3.4

## Non-goals for the first internal release

These constraints applied during stabilisation and have been resolved:

- ~~full TypeScript migration~~ — completed in v4.0–v4.4, strict mode in v6.1
- ~~build system rewrite~~ — Vite 8 in v3.1
- ~~API redesign~~ — public API defined in v5.0
- application UI concerns — still out of scope for this repo
- Convex or app-side state ownership issues — still out of scope for this repo

## Working approach

1. Add regression tests for RoughCut-critical playback behavior.
2. Make a narrow stabilization patch.
3. Verify against the RoughCut app.
4. Only then begin modernization in separate phases.

## Modernization direction

Stabilisation and modernisation through Phase 7 are complete. Next:

- expand integration test coverage for cache lifecycle under rapid seek/reset
- define adapter boundary for app integration
- reduce remaining `@typescript-eslint/no-explicit-any` warnings (149 remaining)
- see `docs/roadmap.md` for full phase breakdown
