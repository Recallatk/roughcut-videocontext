# Roadmap

## Phase 1: Stabilization Baseline
- keep upstream `v0.54.0` as the behavioral baseline
- use Node 16 for reproducibility
- keep Yarn Classic during baseline stabilization
- ensure build and unit tests pass

## Phase 2: RoughCut Regression Coverage
- add tests for cache-init transport behavior
- add tests for repeated play/pause interactions
- add tests for reset/callback cleanup
- add tests for seek near end-of-track
- add tests for deterministic playback state under rapid interaction

## Phase 3: Narrow Stabilization Patch
- patch transport races
- patch cache/media element lifecycle behavior
- patch callback registration and cleanup behavior
- keep API changes minimal

## Phase 4: RoughCut App Integration
- package an internal release of the fork
- install the fork into the RoughCut app
- verify preview flows in the app
- confirm the engine is stable under real usage

## Phase 5: Controlled Modernization
- upgrade Node baseline
- modernize build pipeline
- modernize test tooling
- preserve behavior with regression coverage

## Phase 6: TypeScript Migration
- start with `allowJs`
- define public engine types
- convert core modules gradually
- reduce reliance on implicit and untyped internals

## Phase 7: Owned API Surface
- define the RoughCut-supported engine contract
- support adapter-based integration in the app
- reduce direct dependence on legacy upstream internals
