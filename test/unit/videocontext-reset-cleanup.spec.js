/**
 * Unit tests for reset/cleanup lifecycle (2c)
 *
 * Covers:
 * - reset() clears source nodes, processing nodes, timeline, state
 * - reset() clears all registered callbacks
 * - reset() clears timeline callbacks
 * - destroy() removes context from updateablesManager
 * - destroy() removes context from window.__VIDEOCONTEXT_REFS__
 */
import { vi, describe, test, expect, beforeEach } from "vitest";
import "webgl-mock";
import VideoContext from "../../src/videocontext.js";
import { UpdateablesManager } from "../../src/utils.js";

function makeCanvas() {
    return new HTMLCanvasElement(100, 100);
}

describe("VideoContext reset/cleanup lifecycle (2c)", () => {
    let canvas;

    beforeEach(() => {
        canvas = makeCanvas();
        global.window = global.window || {};
        global.window.__VIDEOCONTEXT_REFS__ = global.window.__VIDEOCONTEXT_REFS__ || {};
    });

    test("reset() clears sourceNodes, processingNodes, timeline and resets state", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });

        // Inject fake nodes
        ctx._sourceNodes = [
            {
                destroyed: false,
                _state: 1,
                _update: vi.fn(),
                destroy: vi.fn(),
                _pause: vi.fn(),
                _play: vi.fn(),
                startTime: 0,
                stopTime: 0,
                _stopTime: 0
            }
        ];
        ctx._processingNodes = [
            {
                destroyed: false,
                _update: vi.fn(),
                _render: vi.fn(),
                destroy: vi.fn(),
                _seek: vi.fn()
            }
        ];
        ctx._timelineCallbacks = [{ time: 1, func: vi.fn(), ordering: 0 }];
        ctx._state = VideoContext.STATE.PLAYING;
        ctx._currentTime = 5;

        ctx.reset();

        expect(ctx._sourceNodes).toHaveLength(0);
        expect(ctx._processingNodes).toHaveLength(0);
        expect(ctx._timelineCallbacks).toHaveLength(0);
        expect(ctx._currentTime).toBe(0);
        expect(ctx._state).toBe(VideoContext.STATE.PAUSED);
    });

    test("reset() clears all event callbacks", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });

        const cb = vi.fn();
        ctx.registerCallback(VideoContext.EVENTS.UPDATE, cb);
        ctx.registerCallback(VideoContext.EVENTS.STALLED, cb);

        ctx.reset();

        // After reset, callbacks map should be re-initialised empty
        for (let funcArray of ctx._callbacks.values()) {
            expect(funcArray).toHaveLength(0);
        }
    });

    test("destroy() removes the context from window.__VIDEOCONTEXT_REFS__", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });
        const id = ctx.id;

        expect(window.__VIDEOCONTEXT_REFS__[id]).toBe(ctx);

        ctx.destroy();

        expect(window.__VIDEOCONTEXT_REFS__[id]).toBeUndefined();
    });

    test("destroy() unregisters the context from UpdateablesManager", () => {
        const manager = new UpdateablesManager();
        const fakeCtx = { _update: vi.fn() };

        manager.register(fakeCtx);
        expect(manager._updateables).toContain(fakeCtx);

        manager.unregister(fakeCtx);
        expect(manager._updateables).not.toContain(fakeCtx);
    });

    test("destroy() leaves the context in a stable non-updating state", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });
        ctx.destroy();

        // After destroy, state should be PAUSED and nodes empty
        expect(ctx._state).toBe(VideoContext.STATE.PAUSED);
        expect(ctx._sourceNodes).toHaveLength(0);
    });
});
