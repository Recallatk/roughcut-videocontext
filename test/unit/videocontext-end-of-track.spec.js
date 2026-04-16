/**
 * Unit tests for end-of-track determinism (2e)
 *
 * Covers:
 * - currentTime is clamped to duration when ENDED fires (no overshoot)
 * - ENDED callback fires exactly once when timeline completes
 * - Source nodes receive _pause() before the final _update() at end
 */
import { vi, describe, test, expect, beforeEach } from "vitest";
import "webgl-mock";
import VideoContext from "../../src/videocontext.js";

function makeCanvas() {
    return new HTMLCanvasElement(100, 100);
}

function makeSourceNode(stopTime = 2) {
    return {
        destroyed: false,
        _state: 1,
        state: 1,
        startTime: 0,
        stopTime,
        _stopTime: stopTime,
        _isReady: vi.fn(() => true),
        _pause: vi.fn(),
        _play: vi.fn(),
        _update: vi.fn(),
        _seek: vi.fn(),
        destroy: vi.fn()
    };
}

describe("VideoContext end-of-track determinism (2e)", () => {
    let canvas;

    beforeEach(() => {
        canvas = makeCanvas();
    });

    test("currentTime is clamped to duration when ENDED fires", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });
        const node = makeSourceNode(2);
        ctx._sourceNodes = [node];
        ctx._state = VideoContext.STATE.PLAYING;
        ctx._currentTime = 1.99;

        // dt large enough to overshoot past duration of 2s
        ctx.update(0.1);

        expect(ctx.state).toBe(VideoContext.STATE.ENDED);
        // Must be exactly duration, not 1.99 + 0.1 = 2.09
        expect(ctx.currentTime).toBe(2);
    });

    test("ENDED callback fires exactly once when timeline ends", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });
        const node = makeSourceNode(2);
        ctx._sourceNodes = [node];
        ctx._state = VideoContext.STATE.PLAYING;
        ctx._currentTime = 1.99;

        const endedCb = vi.fn();
        ctx.registerCallback(VideoContext.EVENTS.ENDED, endedCb);

        ctx.update(0.1);
        expect(endedCb).toHaveBeenCalledTimes(1);

        // Further updates in ENDED state should not re-fire
        ctx.update(0.016);
        ctx.update(0.016);
        expect(endedCb).toHaveBeenCalledTimes(1);
    });

    test("source nodes receive _pause() before final _update() at end", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });
        const node = makeSourceNode(2);
        ctx._sourceNodes = [node];
        ctx._state = VideoContext.STATE.PLAYING;
        ctx._currentTime = 1.99;

        ctx.update(0.1);

        expect(node._pause).toHaveBeenCalled();
        // _update should be called with exactly the clamped duration
        const updateCalls = node._update.mock.calls;
        const lastCall = updateCalls[updateCalls.length - 1];
        expect(lastCall[0]).toBe(2);
    });
});
