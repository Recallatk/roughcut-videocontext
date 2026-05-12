/**
 * texImage2D(video) performance harness
 *
 * Verifies that requestVideoFrameCallback reduces redundant GPU texture
 * uploads. Without rVFC, texImage2D is called every RAF (~60fps). With rVFC,
 * it's called only when the browser has decoded a new video frame (~25fps
 * for the test asset).
 *
 * Strategy: monkey-patch WebGLRenderingContext.prototype.texImage2D before
 * VideoContext loads, count calls where the source is an HTMLVideoElement,
 * then assert upload counts are bounded by video frame rate, not RAF rate.
 */

import { test, expect } from "@playwright/test";

test.describe("texImage2D(video) upload reduction", () => {
    test.beforeEach(async ({ page }) => {
        // Monkey-patch texImage2D BEFORE VideoContext initialises
        await page.addInitScript(() => {
            const counts = { videoUploads: 0, totalCalls: 0 };
            window.__texImage2DCounts = counts;

            // VideoContext currently uses WebGLRenderingContext. Add WebGL2RenderingContext
            // patching here if the engine gains a WebGL2 path.
            const orig = WebGLRenderingContext.prototype.texImage2D;
            WebGLRenderingContext.prototype.texImage2D = function (...args) {
                counts.totalCalls++;
                // 6-arg form: texImage2D(target, level, internalformat, format, type, source)
                const source = args[args.length - 1];
                if (source instanceof HTMLVideoElement) {
                    counts.videoUploads++;
                }
                return orig.apply(this, args);
            };
        });

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

    test("rVFC limits texImage2D(video) calls to ~video frame rate", async ({ page }) => {
        const PLAY_SECONDS = 2;
        const VIDEO_FPS = 25;

        const result = await page.evaluate((playDuration) => {
            return new Promise((resolve, reject) => {
                const guard = setTimeout(
                    () => reject(new Error("rVFC perf test timed out")),
                    20000
                );

                const ctx = window.ctx;
                const videoNode = ctx.video("/test/e2e/assets/video1.webm");
                videoNode.startAt(0);
                videoNode.stopAt(10);
                videoNode.connect(ctx.destination);

                // Reset counts after node setup (constructor texImage2D calls)
                window.__texImage2DCounts.videoUploads = 0;
                window.__texImage2DCounts.totalCalls = 0;

                ctx.registerTimelineCallback(playDuration, () => {
                    clearTimeout(guard);
                    ctx.pause();
                    resolve({
                        videoUploads: window.__texImage2DCounts.videoUploads,
                        totalCalls: window.__texImage2DCounts.totalCalls,
                        usesRVFC: videoNode._usesVideoFrameCallback
                    });
                });

                ctx.play();
            });
        }, PLAY_SECONDS);

        console.log("texImage2D perf (rVFC):", JSON.stringify(result));

        expect(result.usesRVFC).toBe(true);

        // With rVFC active, uploads should track decoded frames (~25fps),
        // not RAF rate (~60fps). Allow generous margin for timing variance.
        const maxUploads = VIDEO_FPS * PLAY_SECONDS * 2; // 100
        const minUploads = VIDEO_FPS * PLAY_SECONDS * 0.25; // ~12
        expect(result.videoUploads).toBeGreaterThan(minUploads);
        expect(result.videoUploads).toBeLessThanOrEqual(maxUploads);
    });

    test("without rVFC, texImage2D(video) is called every RAF frame", async ({ page }) => {
        const PLAY_SECONDS = 2;
        const VIDEO_FPS = 25;

        const result = await page.evaluate((playDuration) => {
            return new Promise((resolve, reject) => {
                const guard = setTimeout(
                    () => reject(new Error("no-rVFC perf test timed out")),
                    20000
                );

                const ctx = window.ctx;
                const videoNode = ctx.video("/test/e2e/assets/video1.webm");
                videoNode.startAt(0);
                videoNode.stopAt(10);
                videoNode.connect(ctx.destination);

                // Disable rVFC by making _canUseVideoFrameCallback return false.
                // This prevents _registerVideoFrameCallback from activating,
                // so the playing branch uploads on every RAF frame instead.
                videoNode._canUseVideoFrameCallback = () => false;

                // Reset counts
                window.__texImage2DCounts.videoUploads = 0;
                window.__texImage2DCounts.totalCalls = 0;

                ctx.registerTimelineCallback(playDuration, () => {
                    clearTimeout(guard);
                    ctx.pause();
                    resolve({
                        videoUploads: window.__texImage2DCounts.videoUploads,
                        totalCalls: window.__texImage2DCounts.totalCalls,
                        usesRVFC: videoNode._usesVideoFrameCallback
                    });
                });

                ctx.play();
            });
        }, PLAY_SECONDS);

        console.log("texImage2D perf (no rVFC):", JSON.stringify(result));

        expect(result.usesRVFC).toBe(false);

        // Without rVFC, every RAF triggers a texture upload.
        // Headless Chromium RAF rate varies but should be well above 25fps.
        // Expect significantly more uploads than the video frame count.
        const videoFrames = VIDEO_FPS * PLAY_SECONDS; // 50
        expect(result.videoUploads).toBeGreaterThan(videoFrames * 1.5);
    });

    test("rVFC path uploads fewer frames than non-rVFC path", async ({ page }) => {
        const PLAY_SECONDS = 2;

        // Run with rVFC enabled
        const withRVFC = await page.evaluate((playDuration) => {
            return new Promise((resolve, reject) => {
                const guard = setTimeout(
                    () => reject(new Error("rVFC comparison timed out")),
                    20000
                );

                const ctx = window.ctx;
                const videoNode = ctx.video("/test/e2e/assets/video1.webm");
                videoNode.startAt(0);
                videoNode.stopAt(10);
                videoNode.connect(ctx.destination);

                window.__texImage2DCounts.videoUploads = 0;

                ctx.registerTimelineCallback(playDuration, () => {
                    clearTimeout(guard);
                    ctx.pause();
                    resolve(window.__texImage2DCounts.videoUploads);
                });

                ctx.play();
            });
        }, PLAY_SECONDS);

        // Reset context for second run
        await page.evaluate(() => window.ctx.reset());

        // Re-read the fresh context (reset creates new internal state)
        // Need to check if reset clears _sourceNodes
        const withoutRVFC = await page.evaluate((playDuration) => {
            return new Promise((resolve, reject) => {
                const guard = setTimeout(
                    () => reject(new Error("no-rVFC comparison timed out")),
                    20000
                );

                const ctx = window.ctx;
                const videoNode = ctx.video("/test/e2e/assets/video1.webm");
                videoNode.startAt(0);
                videoNode.stopAt(10);
                videoNode.connect(ctx.destination);

                videoNode._canUseVideoFrameCallback = () => false;

                window.__texImage2DCounts.videoUploads = 0;

                ctx.registerTimelineCallback(playDuration, () => {
                    clearTimeout(guard);
                    ctx.pause();
                    resolve(window.__texImage2DCounts.videoUploads);
                });

                ctx.play();
            });
        }, PLAY_SECONDS);

        console.log(
            `texImage2D comparison: rVFC=${withRVFC}, no-rVFC=${withoutRVFC}, ` +
                `ratio=${(withRVFC / withoutRVFC).toFixed(2)}`
        );

        // rVFC should use meaningfully fewer uploads
        expect(withRVFC).toBeLessThan(withoutRVFC);

        // The ratio should be roughly 25/60 ≈ 0.42, but allow wide margin
        const ratio = withRVFC / withoutRVFC;
        expect(ratio).toBeLessThan(0.75);
    });
});
