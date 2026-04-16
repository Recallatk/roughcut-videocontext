import { test } from "@playwright/test";
import { screenshotAtTimes } from "./helpers.js";

const TIMES = [1];

test.beforeEach(async ({ page }) => {
    await page.goto("/test/e2e/html/index.html");
    await page.waitForFunction(() => typeof window.ctx !== "undefined");
});

test("Color Threshold", async ({ page }) => {
    await page.evaluate(() => {
        const { ctx, VideoContext } = window;
        const videoNode = ctx.video("/test/e2e/assets/video1.webm");
        const effect = ctx.effect(VideoContext.DEFINITIONS.COLORTHRESHOLD);
        effect.colorAlphaThreshold = [0.5, 0.5, 0.5];
        videoNode.startAt(0);
        videoNode.connect(effect);
        effect.connect(ctx.destination);
    });

    await screenshotAtTimes(page, TIMES, "effect-color-threshold");
});

test("Crop", async ({ page }) => {
    await page.evaluate(() => {
        const { ctx, VideoContext } = window;
        const videoNode = ctx.video("/test/e2e/assets/video1.webm");
        const effect = ctx.effect(VideoContext.DEFINITIONS.CROP);
        effect.height = 0.75;
        effect.width = 0.75;
        videoNode.startAt(0);
        videoNode.connect(effect);
        effect.connect(ctx.destination);
    });

    await screenshotAtTimes(page, TIMES, "effect-crop");
});

test("Horizontal Blur", async ({ page }) => {
    await page.evaluate(() => {
        const { ctx, VideoContext } = window;
        const videoNode = ctx.video("/test/e2e/assets/video1.webm");
        const effect = ctx.effect(VideoContext.DEFINITIONS.HORIZONTAL_BLUR);
        videoNode.startAt(0);
        videoNode.connect(effect);
        effect.connect(ctx.destination);
    });

    await screenshotAtTimes(page, TIMES, "effect-horizontal-blur");
});

test("Monochrome", async ({ page }) => {
    await page.evaluate(() => {
        const { ctx, VideoContext } = window;
        const videoNode = ctx.video("/test/e2e/assets/video1.webm");
        const effect = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);
        videoNode.startAt(0);
        videoNode.connect(effect);
        effect.connect(ctx.destination);
    });

    await screenshotAtTimes(page, TIMES, "effect-monochrome");
});

test("Opacity", async ({ page }) => {
    await page.evaluate(() => {
        const { ctx, VideoContext } = window;
        const videoNode = ctx.video("/test/e2e/assets/video1.webm");
        const effect = ctx.effect(VideoContext.DEFINITIONS.OPACITY);
        videoNode.startAt(0);
        videoNode.connect(effect);
        effect.connect(ctx.destination);
    });

    await screenshotAtTimes(page, TIMES, "effect-opacity");
});

test("Static", async ({ page }) => {
    await page.evaluate(() => {
        const { ctx, VideoContext } = window;
        const videoNode = ctx.video("/test/e2e/assets/video1.webm");
        const effect = ctx.effect(VideoContext.DEFINITIONS.STATIC_EFFECT);
        videoNode.startAt(0);
        videoNode.connect(effect);
        effect.connect(ctx.destination);
    });

    // Large threshold — Static effect output is non-deterministic by design
    await screenshotAtTimes(page, TIMES, "effect-static", { maxDiffPixelRatio: 0.8 });
});

test("Vertical Blur", async ({ page }) => {
    await page.evaluate(() => {
        const { ctx, VideoContext } = window;
        const videoNode = ctx.video("/test/e2e/assets/video1.webm");
        const effect = ctx.effect(VideoContext.DEFINITIONS.VERTICAL_BLUR);
        videoNode.startAt(0);
        videoNode.connect(effect);
        effect.connect(ctx.destination);
    });

    await screenshotAtTimes(page, TIMES, "effect-vertical-blur");
});
