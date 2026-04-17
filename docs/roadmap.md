# Roadmap

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

## Next

### Phase 8: Further hardening

- Additional integration coverage for cache lifecycle under rapid seek/reset
- Decouple app integration through an adapter boundary
- Continue reducing `@typescript-eslint/no-explicit-any` warnings (149 remaining)

### Phase 9: App adapter layer

- Define adapter boundary between VideoContext engine and consumer apps
- Reduce direct dependence on internal engine state from app code
