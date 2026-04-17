# RoughCut fork changelog

This fork is maintained by RoughCut, based on [VideoContext by BBC R&D](https://github.com/bbc/VideoContext)
at upstream version `0.54.0`. All entries below `0.54.0-roughcut.*` are RoughCut additions.
Entries at `0.54.0` and below are from the upstream project.

## RoughCut releases

---

### 0.55.0 (2026-04)

#### Public release — rename and registry switch

- Renamed package from `@recallatk/videocontext` to `@videocontext/core`
- Switched publishConfig from GitHub Packages to public npm registry
- Phase 8 cleanup: removed dead config files, stale docs, updated metadata, rewrote README
- 186 tests passing, 0 vulnerabilities, TypeScript strict

---

### 0.54.0-roughcut.7.1 (2026-04)

#### Bugfix — \_seek regression from TS migration

- Restored `if (this._element === undefined) this._load()` guard in `MediaNode._seek()` that was accidentally dropped during Phase 4d TypeScript migration
- Without this guard, seeking backwards into an ended/unloaded node threw `Cannot set properties of undefined (setting 'currentTime')`
- 186 tests passing

---

### 0.54.0-roughcut.7.0 (2026-04)

#### Phase 7 — Cache init and MediaNode play() error hardening

**`VideoElementCache.init()`**

- Removed play()-on-sourceless-elements warming loop. `play()` always rejects immediately (`NotSupportedError` / `AbortError`) for elements with no `src`, so the intended gesture-unlock never occurred.
- Actual autoplay unlocking happens naturally: `MediaNode._update()` calls `play()` on a real-source element during the user's `ctx.play()` gesture — which is how browsers grant autoplay permission.
- `init()` is now an idempotent marker: sets `_cacheItemsInitialised = true` and returns immediately on repeat calls. No async side-effects.

**`MediaNode._update()` play() error handling**

- Previously only `AbortError` reset `_isElementPlaying`; all other rejections (`NotAllowedError`, `NotSupportedError`, network errors) left the flag stuck `true`, producing a silently frozen node with an unhandled Promise rejection.
- Now always resets `_isElementPlaying` in `.catch()`.
- `AbortError` → silent retry next update tick.
- All other errors → enter `SOURCENODESTATE.error`, set `_ready = true`, fire `"error"` callback. No throws inside `.catch()`.
- `stretchPaused` resume setter: same pattern — reset flag and log instead of throwing into an unhandled rejection.

**Tests**

- Updated `test/unit/videoelementcache.spec.js`: replaced play()-call assertions with tests verifying `init()` does NOT call `play()`.
- Added three integration tests in `test/integration/medianode.test.js`: `AbortError` retry, non-`AbortError` error state + callback, and no retry after permanent error.
- 186 tests passing (was 185)

---

### 0.54.0-roughcut.6.3 (2026-04)

#### Phase 6d — Unit tests: VideoElementCache + VideoElementCacheItem

- Added `test/unit/videoelementcache.spec.js` covering both cache classes
- `VideoElementCacheItem`: attribute setup (`crossorigin`, `webkit-playsinline`, `playsinline`), `linkNode`/`unlinkNode`, `isPlaying()` across all states, `element` setter
- `VideoElementCache`: constructor size, `init()` idempotency, `play()` error suppression (`AbortError`, `NotSupportedError`), `getElementAndLinkToNode()` slot allocation and fallback, `unlinkNodeFromElement()`, `length` getter
- 185 tests passing (was 158)

---

### 0.54.0-roughcut.6.2 (2026-04)

#### Phase 6c — Unit tests: all node subclasses

- Added `test/unit/videonode.spec.js` — VideoNode and AudioNode (displayName, `_elementType`, sequencing, callbacks, `clearTimelineState`, texture-update suppression)
- Added `test/unit/imagenode.spec.js` — ImageNode (`_load`, `onload`/`onerror` callbacks, `_unload`) and CanvasNode (`_load` sets `_ready` immediately, state transitions)
- Added `test/unit/processingnode.spec.js` — `setProperty`/`getProperty`, array property deep-copy, `_update`/`_seek` set `_currentTime`, `limitConnections` behaviour
- Added `test/unit/effectnode-compositingnode.spec.js` — instanceof chain, `maximumConnections` (limited vs unlimited), inherited property/update behaviour
- Added `test/unit/transitionnode.spec.js` — `transition()`/`transitionAt()`, overlap rejection, `clearTransitions`/`clearTransition`, mid-transition interpolation
- Fixed `ImageNode._unload`: guard `window.ImageBitmap` before `instanceof` to avoid `TypeError` in environments without `createImageBitmap`
- 158 tests passing (was 81)

---

### 0.54.0-roughcut.6.1 (2026-04)

#### Phase 6b — TypeScript strict mode

- Enabled `strict: true` and `noImplicitAny: true` in `tsconfig.json`
- Resolved 306 type errors across 15 source files
- No runtime behaviour changes; build output and all unit tests unchanged
- 81 tests passing

---

### 0.54.0-roughcut.6.0 (2026-04)

#### Phase 6a — ESLint extended to TypeScript source files

- Added `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`
- Extended `eslint.config.js` flat config to cover `src/**/*.ts` files
- Resolved all initial lint errors in TypeScript source files
- Lint now runs on `.ts` files in pre-commit hook and CI

---

### 0.54.0-roughcut.5.0 (2026-04)

#### Phase 5 — Public API surface

- Defined clean public exports via `src/videocontext.ts`: `VideoContext` (default), `DEFINITIONS`, `SOURCENODESTATE`, `UpdateablesManager`
- Documented and typed the stable public method and property surface
- Marked internal implementation details with `private`/`protected` where applicable
- Deprecated and removed genuinely dead legacy utilities (`exportToJSON`, Sigma graph helpers)

---

### 0.54.0-roughcut.4.4 (2026-04)

#### Phase 4e — TypeScript: utilities and definitions

- Migrated `src/utils.js` → `src/utils.ts`
- Migrated `src/Definitions/definitions.js` → `src/Definitions/definitions.ts` and all per-effect definition files to TypeScript
- Full TypeScript coverage across all source files; `allowJs` retained for build compatibility
- tsc clean, all tests pass

---

### 0.54.0-roughcut.4.3 (2026-04)

#### Phase 4d — TypeScript: source and processing nodes

- Migrated all `src/SourceNodes/*.js` → `.ts`: `sourcenode`, `medianode`, `videonode`, `audionode`, `imagenode`, `canvasnode`
- Migrated all `src/ProcessingNodes/*.js` → `.ts`: `processingnode`, `effectnode`, `compositingnode`, `transitionnode`
- Migrated `src/DestinationNode/destinationnode.js` → `.ts`
- Migrated `src/videoelementcache.js` and `src/videoelementcacheitem.js` → `.ts`
- tsc clean, build unchanged

---

### 0.54.0-roughcut.4.2 (2026-04)

#### Phase 4c — TypeScript: base classes

- Migrated `src/graphnode.js` → `src/graphnode.ts`
- Migrated `src/rendergraph.js` → `src/rendergraph.ts`
- Migrated `src/exceptions.js` → `src/exceptions.ts`
- Added typed signatures for all public methods; `strict: false` retained at this phase
- tsc clean, build unchanged, all tests pass

---

### 0.54.0-roughcut.4.1 (2026-04)

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

### 0.54.0-roughcut.4.0 (2026-04)

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
