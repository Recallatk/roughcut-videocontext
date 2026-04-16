import { vi } from "vitest";
import VideoContext from "../../src/videocontext";

let ctx;
import "webgl-mock";

/*
 * creates a video node with provided attributes.
 * returns: the node instance and the mocked HTMLVideoElement which is controlled by the node
 */
const nodeFactory = (
    vidCtx,
    attr = {},
    { sourceOffset = undefined, preloadTime = undefined } = {}
) => {
    let _currentTime = undefined;
    const _currentTimeSetter = vi.fn((v) => {
        _currentTime = v;
    });
    const element = {
        play: vi.fn(),
        pause: vi.fn(),
        get currentTime() {
            return _currentTime;
        },
        set currentTime(v) {
            _currentTimeSetter(v);
        },
        _currentTimeSetter
    };
    const node = vidCtx.video(element, sourceOffset, preloadTime, attr);
    // some sane defaults
    // node should play from the start
    node.start(0);
    node.stop(10);
    return { node, element };
};

/*
 * create a fresh video context with mocked canvas for each test
 * don't useVideoElementCache as unnecessary for these tests and would need to be patched with a mock.
 */
beforeEach(() => {
    const canvas = new HTMLCanvasElement(500, 500);
    ctx = new VideoContext(canvas, undefined, { useVideoElementCache: false });
});

/*
 * These tests use nodeFactory to produce a video element and a controlling video node.
 * The tests check that interaction with the node effects the element as intended.
 * Some tested interactions require the node to have loaded. (eg updating element attributes)
 * We use the public ctx.update method to advance the videocontext timeline and trigger these updates
 */
describe("medianode", () => {
    describe("volume", () => {
        it("volume setter sets volume on element", () => {
            const { element, node } = nodeFactory(ctx);
            node.volume = 0.5;
            expect(element.volume).toBe(0.5);
            node.volume = 1.5;
            expect(element.volume).toBe(1.5);
        });

        it("should play with a default volume if volume attribute is not supplied", () => {
            expect.assertions(3);

            const { element } = nodeFactory(ctx);
            expect(element.volume).toBe(undefined /* because our mock has no volume attr */);

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);

            expect(element.volume).not.toBe(undefined /* it will be a number now */);
            expect(element.volume).toBeGreaterThan(-Infinity);
        });

        it("should set provided volume on update if volume attribute is supplied", () => {
            const { element } = nodeFactory(ctx, { volume: 0.2 });
            expect(element.volume).toBe(undefined /* because our mock has no volume attr */);

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);

            expect(element.volume).toBe(0.2);
        });
    });

    describe("other attributes", () => {
        it("should set generic attributes on node when update loop is run", () => {
            const { element } = nodeFactory(ctx, { asdf: "great!" });
            expect(element.asdf).toBe(undefined /* because our mock has no asdf attr */);

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);

            expect(element.asdf).toBe("great!");
            expect(element.notasdf).toBe(undefined);
        });
    });

    describe("play() error handling", () => {
        /*
         * When play() is called by _update() and the element rejects:
         * - AbortError  → silent retry: _isElementPlaying resets to false, state unchanged
         * - Other error → error state entered, error callback fired, _isElementPlaying resets
         *
         * In all cases _isElementPlaying must NOT be left stuck true; that would
         * prevent any future play() attempt and produce a silently frozen node.
         */

        it("resets _isElementPlaying on AbortError so play() is retried next update", async () => {
            const abortErr = Object.assign(new Error("aborted"), { name: "AbortError" });
            const { node, element } = nodeFactory(ctx);
            element.play = vi.fn().mockRejectedValue(abortErr);
            element.readyState = 4; // signal 'ready' so _update calls play()

            ctx.play(); // ctx must be PLAYING for _update to call play() on the element
            ctx.update(1); // first update — play() called, rejects with AbortError
            await Promise.resolve(); // flush microtask queue

            expect(node._isElementPlaying).toBe(false); // reset — will retry
            expect(node.state).not.toBe(5 /* error */);
        });

        it("enters error state and fires error callback on non-AbortError from play()", async () => {
            const notAllowed = Object.assign(new Error("not allowed"), {
                name: "NotAllowedError"
            });
            const { node, element } = nodeFactory(ctx);
            element.play = vi.fn().mockRejectedValue(notAllowed);
            element.readyState = 4;

            const errorCb = vi.fn();
            node.registerCallback("error", errorCb);

            ctx.play();
            ctx.update(1);
            await Promise.resolve();

            expect(node._isElementPlaying).toBe(false); // always reset
            expect(node.state).toBe(5 /* SOURCENODESTATE.error */);
            expect(errorCb).toHaveBeenCalledOnce();
        });

        it("does not retry play() after a non-AbortError (node stays in error state)", async () => {
            const notAllowed = Object.assign(new Error("not allowed"), {
                name: "NotAllowedError"
            });
            const { node, element } = nodeFactory(ctx);
            element.play = vi.fn().mockRejectedValue(notAllowed);
            element.readyState = 4;

            ctx.play();
            ctx.update(1);
            await Promise.resolve();
            const callsAfterFirst = element.play.mock.calls.length;

            // Further updates should not call play() again — node is in error state
            ctx.update(2);
            await Promise.resolve();

            expect(element.play.mock.calls.length).toBe(callsAfterFirst);
        });
    });

    describe("currentTime on provided element", () => {
        it("element.currentTime should equal ctx.currentTime be zero after load if no sourceOffset is given", () => {
            const { element } = nodeFactory(ctx, {}, { sourceOffset: undefined });

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);

            expect(element.currentTime).toBe(0);
        });

        it("element.currentTime should equal ctx.currentTime plus offset if sourceOffset is given", () => {
            const { element } = nodeFactory(ctx, {}, { sourceOffset: 2 });

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);

            expect(element.currentTime).toBe(2);
        });

        it("element.currentTime not set on each update", () => {
            const { element } = nodeFactory(ctx, {}, { sourceOffset: 2 });

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);
            ctx.update(2);
            ctx.update(3);
            ctx.update(4);

            expect(element._currentTimeSetter).toHaveBeenCalledTimes(1);
        });
    });
});
