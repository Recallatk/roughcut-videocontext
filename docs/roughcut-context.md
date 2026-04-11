# RoughCut Context

This repo is RoughCut's internal fork of VideoContext.

## Why we are forking

The current engine covers the product features RoughCut needs in preview:
- multi-clip preview playback
- audio playback
- subtitle/headline overlays
- timeline scrubbing
- preview transforms
- aspect-ratio changes

We are not replacing the engine immediately.
We are first stabilizing it and taking ownership of the engine surface we depend on.

## Current RoughCut pain points

The fork is motivated by preview reliability issues, especially around transport and lifecycle:
- play/pause AbortError caused by media element timing races
- cache initialization behavior that uses native `play()` and `pause()` in fragile ways
- reset/callback lifecycle problems
- fragility under rapid user interaction
- fragility when app state changes while preview is active

## What belongs in this fork

This repo should own:
- engine lifecycle
- media transport semantics
- callback/event behavior
- source node reliability
- compatibility behavior required by RoughCut preview playback

## What does not belong in this fork

This repo should not own:
- Convex queries/subscriptions
- preview page orchestration
- subtitle settings UI
- project settings persistence
- timeline editor UI beyond engine-facing contracts

## Baseline

Current fork baseline:
- upstream version: `v0.54.0`
- runtime baseline: Node 16
- package manager baseline: Yarn Classic
- baseline branch: `roughcut/stabilize-preview-v0.54.0`
- baseline tag: `roughcut-baseline-v0.54.0-node16`

## Strategy

Phase 1:
- preserve upstream runtime/tooling baseline
- add RoughCut-focused regression tests
- patch the narrow set of transport/lifecycle issues

Phase 2:
- integrate internal release into RoughCut app
- verify real preview flows end-to-end

Phase 3:
- modernize incrementally
- add TypeScript
- modernize test/build tooling
- define the owned RoughCut engine API
