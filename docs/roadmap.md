# Roadmap

## Current Branch: requestVideoFrameCallback

The current hardening branch optimizes video texture delivery with
`requestVideoFrameCallback` (rVFC). The goal is to upload video textures when the
source media presents a new frame, rather than on every display refresh.

### Status

The implementation work is functionally complete:

- rVFC gates video texture uploads when browser support is available
- unsupported browsers fall back to the previous RAF-driven behavior
- MediaStream sources are excluded from the rVFC path
- simple paused graphs skip redundant composites once source textures are stable
- paused graphs with effects, transitions, or compositors continue to composite
- paused seeks force a fresh texture upload on the next update
- clear-texture dedupe avoids repeated transparent uploads outside source windows
- private media-node debug metrics track callback, upload, and skipped-frame data

### Completed Deliverables

| Area | Outcome |
|---|---|
| rVFC lifecycle hardening | Fallback behavior, seek handling, callback cancellation, play rejection cleanup, and MediaStream exclusion are covered. |
| Paused compositor skip | Source-only paused graphs can skip redundant render-graph passes; processing-node graphs keep rendering for correctness. |
| Paused seek coverage | Integration tests verify `_hasNewFrame`, `_textureChanged`, stale-frame avoidance, and no paused callback chaining. |
| E2E capture timing | `screenshotAtTimes()` uses rVFC `metadata.mediaTime` for video graphs and timeline callbacks for image-only graphs. Timing-sensitive shaders have local annotated tolerances. |
| Perf harness | Playwright patches `WebGLRenderingContext.prototype.texImage2D` and counts `HTMLVideoElement` uploads. Local result: about `51` rVFC uploads vs `98` non-rVFC uploads over two seconds. |
| Debug metrics | `MediaNode._debugMetrics` tracks callback count, upload count, last `mediaTime`, last `presentedFrames`, and accumulated skipped frames. |
| WebCodecs boundary | Future adapter shape documented in `docs/webcodecs-boundary.md`; no WebCodecs implementation in this branch. |

### Added Coverage

- `test/unit/videocontext-paused-skip.spec.js`
  - paused source-only skip behavior
  - processing-node paused correctness
  - changed texture and first paused-frame rendering
  - clearTexture dedupe and seek reset behavior

- `test/integration/medianode.test.js`
  - paused seek rVFC behavior
  - MediaStream rVFC exclusion
  - debug metrics initialization, metadata, skipped-frame, upload, and unload reset behavior

- `test/e2e/perf-teximage2d.spec.js`
  - rVFC upload count near decoded video frame rate
  - non-rVFC upload count near RAF cadence
  - direct rVFC vs non-rVFC comparison

### Verification So Far

- Typecheck: passing
- Unit tests: `162` passing
- Integration tests: `46` passing
- E2E tests: `28` passing
- Focused perf harness: passing, ratio around `0.52`
- Commit hooks: passing with the existing `149` `no-explicit-any` warnings

### Remaining Before PR

1. Commit `docs/webcodecs-boundary.md` and this roadmap consolidation.
2. Run one final full validation pass:
   - `npm run typecheck`
   - `npm run test-unit`
   - `npm run test-integration`
   - `npm run test-e2e -- --workers=1`
3. Validate the branch in the preview-player consumer app.
4. Prepare the PR summary with the perf result, fallback behavior, and MediaStream exclusion called out clearly.

## Completed

### Phase 1: Tooling modernisation

- Vite 8 lib mode (CJS + ESM), Vitest 4, Playwright, ESLint 10, Prettier, Husky, GitHub Actions CI, GitHub Packages publish

### Phase 2: Engine stabilisation

- Stall detection/recovery, seek debounce, reset/callback cleanup, end-of-track determinism, rapid interaction regression tests

### Phase 3: ESM exports

- Dual CJS/ESM build via Vite lib mode, `exports` field in package.json

### Phase 4: TypeScript migration

- Full TypeScript coverage across all source files, `strict: true`, `noImplicitAny: true`

### Phase 5: Public API surface

- Clean exports, typed public methods, dead code removal

### Phase 6: Quality hardening

- ESLint on TS, strict mode (306 errors resolved), comprehensive unit tests (186 total), cache tests

### Phase 7: Cache and transport hardening

- Removed bogus `VideoElementCache.init()` play() warming
- Hardened `MediaNode._update()` play() error handling (AbortError retry, error state for others)
- Fixed `_seek()` regression from TS migration

### Phase 8: rVFC frame delivery hardening

- Optimized video texture uploads with `requestVideoFrameCallback`
- Added fallback and MediaStream exclusion coverage
- Added paused compositor skip for stable source-only graphs
- Stabilized video E2E capture timing
- Added `texImage2D(video)` upload-count perf coverage
- Added private media-node debug metrics
- Documented the future WebCodecs adapter boundary

## Next

### Phase 9: Further hardening

- Additional integration coverage for cache lifecycle under rapid seek/reset
- Decouple app integration through an adapter boundary
- Continue reducing `@typescript-eslint/no-explicit-any` warnings (149 remaining)
- Add dirty tracking for processing-node uniform/property changes

### Phase 10: App adapter layer

- Define adapter boundary between VideoContext engine and consumer apps
- Reduce direct dependence on internal engine state from app code
- Validate engine changes in the preview-player consumer app

### Future: WebCodecs

- Keep WebCodecs out of the rVFC optimization patch
- Use `docs/webcodecs-boundary.md` as the starting point for a later adapter refactor
- Add WebGL2 `texImage2D` perf instrumentation only if the engine gains a WebGL2 path
