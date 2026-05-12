Updated Roadmap

Fix Paused Dirty-Render Correctness

Only skip paused compositing when:
this.\_processingNodes.length === 0
all sources have rendered their paused frame
no source texture changed
If processing nodes exist, always composite while paused.
Add tests for:
simple paused graph skips redundant composites
graph with processing node does not skip
clearTexture dedupe still clears once per transition/window edge
Add Paused Seek rVFC Coverage

Be precise about the assertion:
after seek, \_hasNewFrame === true
after next \_update, \_textureChanged === true
no stale/frozen texture path
This verifies the existing forced fresh upload behavior, not necessarily a new rVFC callback.
Stabilize E2E Capture Timing

Short term: add per-test screenshot tolerances only where timing-sensitive shaders amplify frame drift.
Annotate every tolerance with the reason.
Medium term: rework screenshotAtTimes to pause based on rVFC metadata.mediaTime >= targetTime.
Add texImage2D(video) Perf Harness

Prefer Playwright-side monkey patch:
patch WebGLRenderingContext.prototype.texImage2D
count calls where the source arg is an HTMLVideoElement
expose counts via window
Avoid production counters unless the prototype patch proves unreliable.
Add Private Debug Metrics

Per video node:
callback count
upload count
last mediaTime
last presentedFrames
skipped-frame count
Keep private/debug-only.
Document Future WebCodecs Boundary

Keep this intentionally thin.
Describe the source-frame adapter shape.
Do not design or implement WebCodecs yet.
Updated Ship Criteria

Unsupported rVFC behaves like old engine.
rVFC path is disabled for MediaStream sources and covered by a test.
texImage2D(video) calls are reduced when rVFC is active.
Paused simple graphs can skip redundant composites.
Paused graphs with processing nodes still composite.
Paused seek causes a fresh texture upload on next update.
Clear-texture dedupe is explicitly tested.
E2E tolerances are local and explained, not global.
WebCodecs remains documented as future work only.
