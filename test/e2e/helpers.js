import { expect } from "@playwright/test";

/**
 * Seek to each time, slow-play to the frame, pause, take a screenshot, repeat.
 * Mirrors the original Cypress videoContextScreenShotsAtTimes command.
 *
 * @param {import("@playwright/test").Page} page
 * @param {number[]} times - timeline positions (seconds) to snapshot
 * @param {string} snapshotName - base filename for snapshots
 * @param {{ maxDiffPixelRatio?: number }} [options]
 */
export async function screenshotAtTimes(page, times, snapshotName, options = {}) {
    // Slow playback rate so the timeline callback fires on a consistent frame.
    // Chrome accepts 0.0625–16, matching the original Cypress helper.
    await page.evaluate(() => {
        window.ctx.playbackRate = 0.0625;
    });

    for (const time of times) {
        // Seek to just before the target time, play, then pause inside the
        // registerTimelineCallback so we capture exactly the right frame.
        await page.evaluate((t) => {
            return new Promise((resolve, reject) => {
                const guard = setTimeout(
                    () => reject(new Error(`Timeline callback at ${t}s timed out`)),
                    15000
                );

                window.ctx.currentTime = t - 0.005;
                window.ctx.play();

                window.ctx.registerTimelineCallback(t, () => {
                    clearTimeout(guard);
                    window.ctx.pause();
                    resolve();
                });
            });
        }, time);

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
