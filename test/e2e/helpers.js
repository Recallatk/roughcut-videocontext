import { expect } from "@playwright/test";

/**
 * Seek to each time, pause on the correct frame, take a screenshot, repeat.
 *
 * Two capture strategies:
 * 1. If the graph contains video sources with rVFC support, we wait for
 *    metadata.mediaTime >= targetTime from requestVideoFrameCallback before
 *    pausing. This gives frame-accurate capture independent of RAF timing.
 * 2. Fallback: slow-play to a registerTimelineCallback at the target time
 *    (original behavior). Used for image-only graphs or when rVFC is unavailable.
 *
 * @param {import("@playwright/test").Page} page
 * @param {number[]} times - timeline positions (seconds) to snapshot
 * @param {string} snapshotName - base filename for snapshots
 * @param {{ maxDiffPixelRatio?: number, forceTimelineCapture?: boolean }} [options]
 */
export async function screenshotAtTimes(page, times, snapshotName, options = {}) {
    for (const time of times) {
        if (options.forceTimelineCapture) {
            await _captureViaTimeline(page, time);
        } else {
            // Detect video sources by _elementType — element may not exist yet
            // (it's created lazily in _load() during play/seek)
            const hasVideoSources = await page.evaluate(() => {
                return window.ctx._sourceNodes.some((n) => n._elementType === "video");
            });

            if (hasVideoSources) {
                await _captureViaRVFC(page, time);
            } else {
                await _captureViaTimeline(page, time);
            }
        }

        const snapshotOptions = {};
        if (options.maxDiffPixelRatio !== undefined) {
            snapshotOptions.maxDiffPixelRatio = options.maxDiffPixelRatio;
        }

        await expect(page.locator("#canvas")).toHaveScreenshot(
            `${snapshotName}-at-${time}s.png`,
            snapshotOptions
        );
    }

    await page.evaluate(() => window.ctx.reset());
}

/**
 * Frame-accurate capture using requestVideoFrameCallback.
 *
 * Seeks to just before the target time, plays at a slow rate, and waits
 * for any video element's rVFC callback to report mediaTime >= targetTime
 * before pausing. This decouples capture from RAF/timeline timing.
 */
async function _captureViaRVFC(page, time) {
    await page.evaluate((t) => {
        return new Promise((resolve, reject) => {
            const guard = setTimeout(
                () => reject(new Error(`Frame capture at ${t}s timed out`)),
                15000
            );

            const ctx = window.ctx;
            ctx.playbackRate = 0.0625;
            ctx.currentTime = Math.max(0, t - 0.005);
            ctx.play();

            // After play(), elements are created via _load(). Filter to active
            // video nodes that have an element and fall within the target time.
            const videoNodes = ctx._sourceNodes.filter(
                (n) =>
                    n._elementType === "video" && n._element && n._startTime <= t && t < n._stopTime
            );

            let resolved = false;
            const checkFrame = () => {
                if (resolved) return;

                for (const node of videoNodes) {
                    const el = node._element;
                    if (typeof el.requestVideoFrameCallback !== "function") continue;

                    el.requestVideoFrameCallback((_now, metadata) => {
                        if (resolved) return;
                        // Match engine formula: medianode.ts _seek() uses
                        // element.currentTime = timelineTime - startTime + sourceOffset
                        const targetMediaTime = t - node._startTime + node._sourceOffset;
                        if (metadata.mediaTime >= targetMediaTime) {
                            resolved = true;
                            clearTimeout(guard);
                            ctx.pause();
                            resolve();
                        } else {
                            checkFrame();
                        }
                    });
                    return; // Only need one active video to drive timing
                }

                // No rVFC support on any element — fall back to timeline callback
                resolved = true;
                ctx.pause();
                ctx.currentTime = Math.max(0, t - 0.005);
                ctx.play();
                ctx.registerTimelineCallback(t, () => {
                    clearTimeout(guard);
                    ctx.pause();
                    resolve();
                });
            };

            checkFrame();
        });
    }, time);
}

/**
 * Legacy capture using registerTimelineCallback.
 * Used for image-only graphs or when forceTimelineCapture is set.
 */
async function _captureViaTimeline(page, time) {
    await page.evaluate((t) => {
        return new Promise((resolve, reject) => {
            const guard = setTimeout(
                () => reject(new Error(`Timeline callback at ${t}s timed out`)),
                15000
            );

            window.ctx.playbackRate = 0.0625;
            window.ctx.currentTime = t - 0.005;
            window.ctx.play();

            window.ctx.registerTimelineCallback(t, () => {
                clearTimeout(guard);
                window.ctx.pause();
                resolve();
            });
        });
    }, time);
}
