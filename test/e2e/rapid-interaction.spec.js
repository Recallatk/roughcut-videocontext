/**
 * Rapid interaction regression tests (2d)
 *
 * These tests lock in the correct behaviour after the 2a/2b/2c patches.
 * They run against real media in a headed Chromium + SwiftShader WebGL environment.
 *
 * Covered scenarios:
 * - Rapid play/pause does not leave the engine frozen (2a AbortError fix)
 * - STALLED callback fires exactly once per stall entry, not every frame (2a guard)
 * - Rapid currentTime sets: only one seek per burst reaches the source nodes (2b debounce)
 * - reset() fully clears state and allows a fresh timeline (2c)
 * - destroy() removes the context from the global registry (2c)
 */

import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
        if (msg.type() === "error") console.error("[browser]", msg.text());
    });
    await page.goto("/test/e2e/html/index.html");
    await page.waitForFunction(() => window.ctx != null || window.ctxError != null, {
        timeout: 10000
    });
    const err = await page.evaluate(() => window.ctxError);
    if (err) throw new Error(`VideoContext init failed: ${err}`);
});

// ---------------------------------------------------------------------------
// 2a — Stall recovery: rapid play/pause does not freeze the engine
// ---------------------------------------------------------------------------
test("rapid play/pause leaves engine in PLAYING or PAUSED, never frozen", async ({ page }) => {
    await page.evaluate(() => {
        const videoNode = window.ctx.video("/test/e2e/assets/video1.webm");
        videoNode.startAt(0);
        videoNode.stopAt(10);
        videoNode.connect(window.ctx.destination);
    });

    // Fire 20 rapid play/pause cycles
    await page.evaluate(async () => {
        for (let i = 0; i < 20; i++) {
            window.ctx.play();
            window.ctx.pause();
        }
        window.ctx.play();
        // Wait for a frame to ensure the update loop has processed
        await new Promise((r) => requestAnimationFrame(r));
    });

    const state = await page.evaluate(() => window.ctx.state);
    // Should never reach BROKEN (4) — PLAYING, PAUSED, or transiently STALLED are all valid
    expect(state).not.toBe(4);
});

// ---------------------------------------------------------------------------
// 2a — STALLED callback fires once per stall, not every frame
// ---------------------------------------------------------------------------
test("STALLED callback fires once per stall entry", async ({ page }) => {
    const stalledCount = await page.evaluate(() => {
        /* global VideoContext */
        return new Promise((resolve) => {
            let count = 0;
            window.ctx.registerCallback(VideoContext.EVENTS.STALLED, () => count++);

            // Manually drive the update loop 10 times with a stalled node
            // by using manualUpdate context — we reach into the internals
            // to simulate: force stalled state then call _update repeatedly
            window.ctx._state = VideoContext.STATE.PLAYING;

            // Inject a fake not-ready source node
            const fakeNode = {
                destroyed: false,
                _state: 1,
                startTime: 0,
                stopTime: 100,
                _stopTime: 100,
                _isReady: () => false,
                _pause: () => {},
                _play: () => {},
                _update: () => {},
                _seek: () => {},
                destroy: () => {}
            };
            window.ctx._sourceNodes = [fakeNode];

            // Run 10 update ticks
            for (let i = 0; i < 10; i++) {
                window.ctx._update(0.016);
            }

            resolve(count);
        });
    });

    // Should fire exactly once despite 10 update ticks all being stalled
    expect(stalledCount).toBe(1);
});

// ---------------------------------------------------------------------------
// 2b — Seek debounce: rapid currentTime sets produce one deferred seek
// ---------------------------------------------------------------------------
test("rapid currentTime sets debounce to a single seek on source nodes", async ({ page }) => {
    const seekCount = await page.evaluate(() => {
        return new Promise((resolve) => {
            let seeks = 0;
            const videoNode = window.ctx.video("/test/e2e/assets/video1.webm");
            videoNode.startAt(0);
            videoNode.stopAt(10);
            videoNode.connect(window.ctx.destination);

            // Wrap _seek to count calls
            const original = videoNode._seek.bind(videoNode);
            videoNode._seek = (t) => {
                seeks++;
                original(t);
            };

            // 10 rapid seeks
            for (let i = 0; i < 10; i++) {
                window.ctx.currentTime = i * 0.1;
            }

            // Wait for debounce to flush (default 50ms + buffer)
            setTimeout(() => resolve(seeks), 200);
        });
    });

    // Should have seeked exactly once (the debounced flush)
    expect(seekCount).toBe(1);
});

// ---------------------------------------------------------------------------
// 2b — currentTime updates immediately regardless of debounce
// ---------------------------------------------------------------------------
test("currentTime getter reflects the latest set value immediately", async ({ page }) => {
    const result = await page.evaluate(() => {
        window.ctx.currentTime = 3.5;
        return window.ctx.currentTime;
    });
    expect(result).toBe(3.5);
});

// ---------------------------------------------------------------------------
// 2c — reset() returns engine to clean initial state
// ---------------------------------------------------------------------------
test("reset() clears nodes and resets state to PAUSED at t=0", async ({ page }) => {
    const result = await page.evaluate(() => {
        const videoNode = window.ctx.video("/test/e2e/assets/video1.webm");
        videoNode.startAt(0);
        videoNode.stopAt(10);
        videoNode.connect(window.ctx.destination);

        window.ctx.play();
        window.ctx.currentTime = 5;
        window.ctx.reset();

        return {
            state: window.ctx.state,
            currentTime: window.ctx.currentTime,
            sourceNodeCount: window.ctx._sourceNodes.length
        };
    });

    expect(result.state).toBe(1); // PAUSED
    expect(result.currentTime).toBe(0);
    expect(result.sourceNodeCount).toBe(0);
});

// ---------------------------------------------------------------------------
// 2c — destroy() removes context from global registry
// ---------------------------------------------------------------------------
test("destroy() removes context from window.__VIDEOCONTEXT_REFS__", async ({ page }) => {
    const result = await page.evaluate(() => {
        const id = window.ctx.id;
        const beforeDestroy = window.__VIDEOCONTEXT_REFS__[id] != null;
        window.ctx.destroy();
        const afterDestroy = window.__VIDEOCONTEXT_REFS__[id] != null;
        return { beforeDestroy, afterDestroy };
    });

    expect(result.beforeDestroy).toBe(true);
    expect(result.afterDestroy).toBe(false);
});
