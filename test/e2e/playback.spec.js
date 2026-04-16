import { test } from "@playwright/test";
import { screenshotAtTimes } from "./helpers.js";

test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
        if (msg.type() === "error") console.error("[browser]", msg.text());
    });
    await page.goto("/test/e2e/html/index.html");
    await page.waitForFunction(() => window.ctx != null || window.ctxError != null, { timeout: 10000 });
    const err = await page.evaluate(() => window.ctxError);
    if (err) throw new Error(`VideoContext init failed: ${err}`);
});

test("plays back video", async ({ page }) => {
    await page.evaluate(() => {
        const videoNode = window.ctx.video("/test/e2e/assets/video1.webm");
        videoNode.startAt(0);
        videoNode.connect(window.ctx.destination);
    });

    await screenshotAtTimes(page, [0.5, 1, 1.5], "playback-video");
});

test("plays back image", async ({ page }) => {
    await page.evaluate(() => {
        const imageNode = window.ctx.image("/test/e2e/assets/test-image.png");
        imageNode.startAt(0);
        imageNode.connect(window.ctx.destination);
    });

    await screenshotAtTimes(page, [0.5, 1, 1.5], "playback-image");
});

test("plays back image with no createImageBitmap", async ({ page }) => {
    await page.evaluate(() => {
        // Remove createImageBitmap to simulate a browser without support
        window.createImageBitmap = undefined;
        const imageNode = window.ctx.image("/test/e2e/assets/test-image.png");
        imageNode.startAt(0);
        imageNode.connect(window.ctx.destination);
    });

    await screenshotAtTimes(page, [0.5, 1, 1.5], "playback-image-no-createImageBitmap");
});

test("plays back with user supplied element and start offset", async ({ page }) => {
    await page.evaluate(() => {
        const video = document.createElement("video");
        video.src = "/test/e2e/assets/video1.webm";
        video.crossOrigin = "anonymous";

        const videoNode = window.ctx.video(video, 10);
        videoNode.startAt(0);
        videoNode.connect(window.ctx.destination);
    });

    await screenshotAtTimes(page, [0.5, 1, 1.5], "playback-user-supplied-element");
});
