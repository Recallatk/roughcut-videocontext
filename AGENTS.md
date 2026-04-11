# AGENTS.md

This repository is RoughCut's internal fork of VideoContext.

## Purpose

The short-term goal is to stabilize the existing engine for RoughCut's preview player.

The long-term goal is to evolve this fork into a maintained RoughCut-owned browser video-composition engine.

## Current phase

We are in the stabilization phase.

Priority:
- preserve current engine behavior where possible
- fix playback and lifecycle reliability issues
- keep API changes minimal
- avoid premature modernization during the first stabilization patch

## RoughCut integration context

The RoughCut application currently uses VideoContext in its preview player.

Important integration files in the app repo:
- `src/context/video-player-context.tsx`
- `src/context/video-context-functions.ts`
- `src/app/(authenticated)/project/[projectId]/preview/preview-content.tsx`

The app already "makes it work", and this fork exists to reduce fragility and improve ownership.

## Immediate problems to address

Focus the first internal release on:
- play/pause AbortError behavior
- media element cache init behavior
- reset and callback cleanup
- rapid interaction stability
- deterministic seek/end-of-track behavior

## Non-goals for the first internal release

Do not include these in the first stabilization release:
- full TypeScript migration
- build system rewrite
- API redesign
- application UI concerns
- Convex or app-side state ownership issues

## Working approach

1. Add regression tests for RoughCut-critical playback behavior.
2. Make a narrow stabilization patch.
3. Verify against the RoughCut app.
4. Only then begin modernization in separate phases.

## Modernization direction

After stabilization:
- introduce stronger tests
- define a RoughCut-supported public API
- migrate to TypeScript gradually
- modernize build and test tooling
- decouple app integration through an adapter boundary
