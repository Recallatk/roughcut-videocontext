# RoughCut fork changelog

This fork is maintained by RoughCut, based on [VideoContext by BBC R&D](https://github.com/bbc/VideoContext)
at upstream version `0.54.0`. All entries below `0.54.0-roughcut.*` are RoughCut additions.
Entries at `0.54.0` and below are from the upstream project.

## RoughCut releases

---

### 0.54.0-roughcut.4.1 (2026-04-16)

#### Phase 4b — TypeScript: VideoContext migration

- Renamed `src/videocontext.js` → `src/videocontext.ts`
- Added `VideoContextOptions` interface for typed constructor options
- Added instance property declarations for all `_xxx` fields
- Added static type declarations for `STATE`, `EVENTS`, and utility statics
- Typed constructor signature, `currentTime` getter and setter
- Fixed pre-existing `_audioElementCache` bug in `audio()` (should be `_videoElementCache`)
- Fixed deprecated method argument count mismatches in `createImageSourceNode` / `createCanvasSourceNode`
- tsc clean, build unchanged, all 51 unit tests pass

---

### 0.54.0-roughcut.4.0 (2026-04-16)

#### Phase 4a — TypeScript toolchain baseline

- Installed TypeScript 6.0.2
- Added `tsconfig.json` with `allowJs: true`, `checkJs: false`, `strict: false` for gradual migration
- Added `src/shims.d.ts` with GLSL module declarations and `Window.__VIDEOCONTEXT_REFS__` augmentation
- Added `typecheck` npm script and `typecheck` step in CI

---

### 0.54.0-roughcut.3.4 (2026-04)

#### Phase 2e — End-of-track determinism

- Clamp `_currentTime` to exact `duration` on end rather than allowing frame-rate-dependent overshoot
- Source nodes receive a final `_pause()` + `_update()` at the clamped end time before state transitions to `ENDED`
- `ENDED` callback now fires at a deterministic, reproducible time
- Added unit tests for end-of-track behaviour

---

### 0.54.0-roughcut.3.3 (2026-04)

#### Phase 2b — Seek debounce

- Added `seekDebounce` constructor option (default 50 ms)
- `currentTime` setter updates the internal playhead immediately but debounces `_seek()` calls to source nodes until scrubbing settles
- Added `_flushSeek()` internal method to apply deferred seeks
- `_seekDebounceTimer` cleaned up in both `reset()` and `destroy()`
- Added unit tests for seek debounce behaviour

---

### 0.54.0-roughcut.3.2 (2026-04)

#### Phase 2a — Stall detection and recovery

- Added `stallTimeout` constructor option (default 10 s) — escalates to `BROKEN` state if stalled beyond threshold
- Added `_stallStartTime` tracking so the `STALLED` callback fires once on entry, not on every frame
- Fixed `_isElementPlaying` tracking in `medianode.js` to correctly reflect media element state
- Added unit tests for stall detection and timeout escalation

---

### 0.54.0-roughcut.3.1 (2026-04)

#### Phase 2c — Reset and callback cleanup

- `reset()` now clears all registered event callbacks, timeline callbacks, and the seek debounce timer
- Added `destroy()` method — calls `reset()`, deregisters from `UpdateablesManager`, removes `__VIDEOCONTEXT_REFS__` entry
- Added `UpdateablesManager.unregister()` in `utils.js`
- Added unit tests for reset/cleanup lifecycle

#### Phase 2d — Rapid interaction regression tests

- Added `test/e2e/rapid-interaction.spec.js` with 6 behavioural e2e tests covering stall recovery, seek debounce, and reset/cleanup under rapid user interaction

#### Phase 3 — ESM exports

- Added ESM build output (`dist/videocontext.esm.js`) via Vite lib mode
- `package.json` `exports` field covers both CJS (`dist/videocontext.js`) and ESM (`dist/videocontext.esm.js`) consumers

#### Phase 1 — Tooling modernisation

- **1a** Build: Migrated from webpack to Vite 8 lib mode; both CJS and ESM outputs
- **1b** Tests: Migrated from Jest/Karma to Vitest 4; 51 unit tests across 8 spec files
- **1c** E2E: Added Playwright replacing Cypress
- **1d** Lint: ESLint 10 flat config (`eslint.config.js`), replacing legacy `.eslintrc`
- **1e** Format: Prettier with `--check` in pre-commit hook (fail-fast, not auto-fix)
- **1f** Git hooks: Husky — lint, typecheck, and unit tests run on pre-commit
- **1g** CI: GitHub Actions workflow with lint, typecheck, unit test, and build steps
- **1h** Publish: GitHub Packages publish workflow triggered on `v*` tags; package scoped to `@recallatk/videocontext`
- **1i** Package: Updated `name`, `main`, `module`, `exports`, `files` in `package.json` for the fork

---

## Planned

### 0.54.0-roughcut.4.x — Phase 4 continued (TypeScript migration)

- **4c** Migrate base classes to TypeScript: `graphnode.js`, `sourcenode.js`, `medianode.js`, `rendergraph.js`
- **4d** Migrate processing and source nodes to TypeScript
- **4e** Type definitions for the shader/definition system

### Phase 5 — Public API definition

- Define a clean, documented public API surface using TypeScript types and exports
- Mark internal implementation details with `private`/`protected`
- Deprecate and remove genuinely dead/legacy utilities (e.g. `exportToJSON`, Sigma graph helpers)

### Phase 6 — Modernisation

- Stronger test coverage across all node types
- Modernise build and test tooling as needed
- Decouple app integration through an adapter boundary

---

### 0.54.0 (2019-11-28)

##### Other Changes

- working headless but not accurate enough ([3ed7b163](https://github.com/bbc/VideoContext/commit/3ed7b1633f5e2ab1e9edeb338eaeef185cc38a1a))

#### 0.53.1 (2019-07-05)

### 0.53.0 (2019-04-08)

##### Other Changes

- fixing a bug where a texutre isn't cleared when expected to due to start() and startAt() setting STATE to be STATE.sequenced before a clearTexture is called. ([cbd44a11](https://github.com/bbc/VideoContext/commit/cbd44a119749bca69c8b7c1b0de3cb9e4cbad36c))

#### 0.52.13 (2019-01-14)

#### 0.52.12 (2018-12-18)

#### 0.52.11 (2018-12-13)

#### 0.52.10 (2018-11-06)

#### 0.52.9 (2018-11-05)

#### 0.52.8 (2018-09-28)

#### 0.52.7 (2018-08-07)

#### 0.52.6 (2018-07-26)

#### 0.52.5 (2018-07-24)

#### 0.52.3 (2018-07-20)

#### 0.52.2 (2018-07-09)
