/**
 * Unit tests for stall detection and recovery (2a)
 *
 * Covers:
 * - STALLED callback fires once per stall entry, not every frame
 * - Engine transitions PLAYING → STALLED → PLAYING as sources become ready
 * - stallTimeout escalates STALLED → BROKEN after configured duration
 * - reset() clears _stallStartTime
 */
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import "webgl-mock";

// Minimal mock for a source node
function makeSourceNode({ ready = true } = {}) {
    return {
        destroyed: false,
        state: 1, // playing
        _state: 1,
        startTime: 0,
        stopTime: 100,
        _stopTime: 100,
        _isReady: vi.fn(() => ready),
        _pause: vi.fn(),
        _play: vi.fn(),
        _update: vi.fn(),
        _seek: vi.fn(),
        destroy: vi.fn()
    };
}

// We import VideoContext and stub out WebGL / DOM pieces
import VideoContext from "../../src/videocontext.js";

function makeCanvas() {
    const canvas = new HTMLCanvasElement(100, 100);
    return canvas;
}

describe("VideoContext stall detection (2a)", () => {
    let ctx;
    let canvas;

    beforeEach(() => {
        canvas = makeCanvas();
        // stallTimeout of 0 means no BROKEN escalation unless we override per test
        ctx = new VideoContext(canvas, undefined, { manualUpdate: true, stallTimeout: 0 });
    });

    afterEach(() => {
        ctx.reset();
    });

    test("STALLED callback fires once when transitioning into stalled state", () => {
        const stalledNode = makeSourceNode({ ready: false });
        ctx._sourceNodes = [stalledNode];
        ctx._state = VideoContext.STATE.PLAYING;

        const stalledCb = vi.fn();
        ctx.registerCallback(VideoContext.EVENTS.STALLED, stalledCb);

        // First update — transitions PLAYING → STALLED, fires callback once
        ctx.update(0.016);
        expect(ctx.state).toBe(VideoContext.STATE.STALLED);
        expect(stalledCb).toHaveBeenCalledTimes(1);

        // Second update — already STALLED, should NOT fire again
        ctx.update(0.016);
        expect(stalledCb).toHaveBeenCalledTimes(1);

        // Third update — still stalled
        ctx.update(0.016);
        expect(stalledCb).toHaveBeenCalledTimes(1);
    });

    test("re-fires STALLED callback if engine recovers then stalls again", () => {
        const node = makeSourceNode({ ready: false });
        ctx._sourceNodes = [node];
        ctx._state = VideoContext.STATE.PLAYING;

        const stalledCb = vi.fn();
        ctx.registerCallback(VideoContext.EVENTS.STALLED, stalledCb);

        // First stall
        ctx.update(0.016);
        expect(stalledCb).toHaveBeenCalledTimes(1);

        // Node becomes ready — engine recovers
        node._isReady.mockReturnValue(true);
        ctx._state = VideoContext.STATE.STALLED; // stays in update path
        ctx.update(0.016);
        expect(ctx.state).toBe(VideoContext.STATE.PLAYING);

        // Node stalls again
        node._isReady.mockReturnValue(false);
        ctx.update(0.016);
        expect(ctx.state).toBe(VideoContext.STATE.STALLED);
        expect(stalledCb).toHaveBeenCalledTimes(2);
    });

    test("engine recovers from STALLED to PLAYING when source becomes ready", () => {
        const node = makeSourceNode({ ready: false });
        ctx._sourceNodes = [node];
        ctx._state = VideoContext.STATE.PLAYING;

        ctx.update(0.016);
        expect(ctx.state).toBe(VideoContext.STATE.STALLED);

        node._isReady.mockReturnValue(true);
        ctx.update(0.016);
        expect(ctx.state).toBe(VideoContext.STATE.PLAYING);
    });

    test("stallTimeout > 0 escalates STALLED → BROKEN after timeout", () => {
        vi.useFakeTimers();

        const stalledNode = makeSourceNode({ ready: false });
        const brokenCtx = new VideoContext(canvas, undefined, {
            manualUpdate: true,
            stallTimeout: 5 // 5 seconds
        });
        brokenCtx._sourceNodes = [stalledNode];
        brokenCtx._state = VideoContext.STATE.PLAYING;

        // Transition into stalled
        brokenCtx.update(0.016);
        expect(brokenCtx.state).toBe(VideoContext.STATE.STALLED);

        // Advance time to just under timeout — still STALLED
        vi.advanceTimersByTime(4999);
        brokenCtx.update(0.016);
        expect(brokenCtx.state).toBe(VideoContext.STATE.STALLED);

        // Advance past timeout — should become BROKEN
        vi.advanceTimersByTime(2);
        brokenCtx.update(0.016);
        expect(brokenCtx.state).toBe(VideoContext.STATE.BROKEN);

        vi.useRealTimers();
        brokenCtx.reset();
    });

    test("reset() clears _stallStartTime", () => {
        const node = makeSourceNode({ ready: false });
        ctx._sourceNodes = [node];
        ctx._state = VideoContext.STATE.PLAYING;

        ctx.update(0.016);
        expect(ctx._stallStartTime).not.toBeNull();

        ctx.reset();
        expect(ctx._stallStartTime).toBeNull();
    });
});
