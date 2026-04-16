import { test } from "@playwright/test";
import { screenshotAtTimes } from "./helpers.js";

const TIMES = [0.5, 1.5, 2.5]; // before, during, after transition
const TRANSITION_START = 1;
const TRANSITION_END = 2;

test.beforeEach(async ({ page }) => {
    await page.goto("/test/e2e/html/index.html");
    await page.waitForFunction(() => typeof window.ctx !== "undefined");
});

const TRANSITIONS = [
    { definitionName: "CROSSFADE" },
    { definitionName: "HORIZONTAL_WIPE" },
    { definitionName: "VERTICAL_WIPE" },
    { definitionName: "RANDOM_DISSOLVE" },
    { definitionName: "TO_COLOR_AND_BACK" },
    { definitionName: "STAR_WIPE" },
    // Frame-dependent — allow more variance
    { definitionName: "DREAMFADE", options: { maxDiffPixelRatio: 0.3 } },
    // Randomised — allow significant variance
    { definitionName: "STATIC_DISSOLVE", options: { maxDiffPixelRatio: 0.6 } }
];

for (const { definitionName, options } of TRANSITIONS) {
    const testName = definitionName.toLowerCase().replace(/_/g, " ");

    test(testName, async ({ page }) => {
        await page.evaluate(
            ({ name, start, end }) => {
                const { ctx, VideoContext } = window;
                const video1 = ctx.video("/test/e2e/assets/video1.webm");
                const video2 = ctx.video("/test/e2e/assets/video2.webm");
                const transition = ctx.transition(VideoContext.DEFINITIONS[name]);

                video1.start(0);
                video1.stop(4);
                video2.start(0);
                video2.stop(4);

                transition.transition(start, end, 0.0, 1.0, "mix");

                video1.connect(transition);
                video2.connect(transition);
                transition.connect(ctx.destination);
            },
            { name: definitionName, start: TRANSITION_START, end: TRANSITION_END }
        );

        await screenshotAtTimes(page, TIMES, `transition-${testName}`, options ?? {});
    });
}
