/**
 * Unit tests for seek debounce (2b)
 *
 * Covers:
 * - _currentTime updates immediately on every set
 * - _flushSeek is debounced: only called once after a burst of sets
 * - seekDebounce: 0 disables debounce (synchronous seek)
 * - reset() cancels a pending debounce timer
 */
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import "webgl-mock";
import VideoContext from "../../src/videocontext.js";

function makeCanvas() {
    return new HTMLCanvasElement(100, 100);
}

describe("VideoContext seek debounce (2b)", () => {
    let canvas;

    beforeEach(() => {
        vi.useFakeTimers();
        canvas = makeCanvas();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test("currentTime updates immediately without waiting for debounce", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true, seekDebounce: 50 });
        ctx.currentTime = 5;
        expect(ctx.currentTime).toBe(5);
        ctx.currentTime = 10;
        expect(ctx.currentTime).toBe(10);
        ctx.reset();
    });

    test("_flushSeek is called only once after a burst when seekDebounce > 0", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true, seekDebounce: 50 });
        const flushSpy = vi.spyOn(ctx, "_flushSeek");

        // Rapid burst of seeks
        ctx.currentTime = 1;
        ctx.currentTime = 2;
        ctx.currentTime = 3;
        ctx.currentTime = 4;

        // Timer hasn't fired yet — no flush
        expect(flushSpy).not.toHaveBeenCalled();

        // Advance past debounce window
        vi.advanceTimersByTime(60);
        expect(flushSpy).toHaveBeenCalledTimes(1);
        expect(flushSpy).toHaveBeenCalledWith(4); // final value

        ctx.reset();
    });

    test("seekDebounce: 0 seeks synchronously on every set", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true, seekDebounce: 0 });
        const flushSpy = vi.spyOn(ctx, "_flushSeek");

        ctx.currentTime = 1;
        expect(flushSpy).toHaveBeenCalledTimes(1);
        ctx.currentTime = 2;
        expect(flushSpy).toHaveBeenCalledTimes(2);

        ctx.reset();
    });

    test("reset() cancels a pending debounce timer", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true, seekDebounce: 50 });
        const flushSpy = vi.spyOn(ctx, "_flushSeek");

        ctx.currentTime = 5;
        expect(ctx._seekDebounceTimer).not.toBeNull();

        ctx.reset();
        expect(ctx._seekDebounceTimer).toBeNull();

        // Advance time — flush should NOT fire after reset
        vi.advanceTimersByTime(100);
        expect(flushSpy).not.toHaveBeenCalled();
    });

    test("each new set resets the debounce timer", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true, seekDebounce: 50 });
        const flushSpy = vi.spyOn(ctx, "_flushSeek");

        ctx.currentTime = 1;
        vi.advanceTimersByTime(30); // not yet
        ctx.currentTime = 2; // resets timer
        vi.advanceTimersByTime(30); // still not yet (only 30ms since last set)
        expect(flushSpy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(25); // now 55ms since last set
        expect(flushSpy).toHaveBeenCalledTimes(1);
        expect(flushSpy).toHaveBeenCalledWith(2);

        ctx.reset();
    });
});
