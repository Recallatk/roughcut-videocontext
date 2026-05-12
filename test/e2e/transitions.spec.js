import { test } from "@playwright/test";
import { screenshotAtTimes } from "./helpers.js";

const TIMES = [0.5, 1.5, 2.5]; // before, during, after transition
const TRANSITION_START = 1;
const TRANSITION_END = 2;

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

const TRANSITIONS = [
    // Linear blends — sub-frame timing drift causes proportional pixel differences
    { definitionName: "CROSSFADE", options: { maxDiffPixelRatio: 0.15 } },
    // Geometric wipes — boundary position shifts with timing, affecting edge pixels
    { definitionName: "HORIZONTAL_WIPE", options: { maxDiffPixelRatio: 0.1 } },
    { definitionName: "VERTICAL_WIPE", options: { maxDiffPixelRatio: 0.1 } },
    // Pseudorandom threshold — pixel membership flips near the threshold boundary
    { definitionName: "RANDOM_DISSOLVE", options: { maxDiffPixelRatio: 0.15 } },
    { definitionName: "TO_COLOR_AND_BACK", options: { maxDiffPixelRatio: 0.1 } },
    // Sharp geometric mask — small time delta shifts the star boundary significantly
    { definitionName: "STAR_WIPE", options: { maxDiffPixelRatio: 0.25 } },
    // Sine-wave distortion amplifies sub-frame timing into large spatial shifts
    { definitionName: "DREAMFADE", options: { maxDiffPixelRatio: 0.3 } },
    // Randomised noise pattern — output is non-deterministic by design
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
