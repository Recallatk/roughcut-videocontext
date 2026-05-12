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

const addVideoFrameCallbackSupport = (element) => {
    let nextHandle = 1;
    const callbacks = new Map();

    element.requestVideoFrameCallback = vi.fn((callback) => {
        const handle = nextHandle++;
        callbacks.set(handle, callback);
        return handle;
    });
    element.cancelVideoFrameCallback = vi.fn((handle) => {
        callbacks.delete(handle);
    });

    return {
        fire(handle, metadataOverrides = {}) {
            const callback = callbacks.get(handle);
            if (!callback) throw new Error(`No video frame callback for handle ${handle}`);
            callback(0, {
                presentationTime: 0,
                expectedDisplayTime: 0,
                width: 1920,
                height: 1080,
                mediaTime: 0,
                presentedFrames: handle,
                ...metadataOverrides
            });
        }
    };
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
            const { element } = nodeFactory(ctx);
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

    describe("requestVideoFrameCallback lifecycle", () => {
        it("chains callbacks while a supported video element is playing", () => {
            const { node, element } = nodeFactory(ctx);
            const videoFrames = addVideoFrameCallbackSupport(element);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            ctx.play();
            ctx.update(1);

            const firstHandle = node._rvfcHandle;
            expect(node._usesVideoFrameCallback).toBe(true);
            expect(element.requestVideoFrameCallback).toHaveBeenCalledOnce();

            videoFrames.fire(firstHandle);

            expect(node._hasNewFrame).toBe(true);
            expect(element.requestVideoFrameCallback).toHaveBeenCalledTimes(2);
            expect(node._rvfcHandle).not.toBe(firstHandle);
        });

        it("re-registers a callback after seeking while playing", () => {
            const { node, element } = nodeFactory(ctx);
            addVideoFrameCallbackSupport(element);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            ctx.play();
            ctx.update(1);

            const firstHandle = node._rvfcHandle;
            node._seek(2);

            expect(element.cancelVideoFrameCallback).toHaveBeenCalledWith(firstHandle);
            expect(element.requestVideoFrameCallback).toHaveBeenCalledTimes(2);
            expect(node._rvfcHandle).not.toBe(firstHandle);
            expect(node._hasNewFrame).toBe(true);
        });

        it("does not enable frame gating when callback methods are unavailable", () => {
            const { node, element } = nodeFactory(ctx);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            ctx.play();
            ctx.update(1);

            expect(node._usesVideoFrameCallback).toBe(false);
            expect(node._rvfcHandle).toBeNull();
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

    describe("paused seek with rVFC", () => {
        it("seek while paused sets _hasNewFrame = true immediately", () => {
            const { node, element } = nodeFactory(ctx);
            addVideoFrameCallbackSupport(element);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            // Play briefly to get the node loaded and rVFC registered
            ctx.play();
            ctx.update(1);
            expect(node._usesVideoFrameCallback).toBe(true);

            // Pause — puts source into paused state
            ctx.pause();
            ctx.update(0.016);

            // Seek while paused
            node._seek(3);

            // _hasNewFrame must be true so the next update uploads a fresh texture
            expect(node._hasNewFrame).toBe(true);
        });

        it("update after paused seek produces _textureChanged = true", () => {
            const { node, element } = nodeFactory(ctx);
            addVideoFrameCallbackSupport(element);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            ctx.play();
            ctx.update(1);

            // Pause
            ctx.pause();
            ctx.update(0.016);

            // Consume the initial paused-frame upload
            expect(node._textureChanged).toBe(true);
            // Simulate that the paused frame is now rendered
            node._renderPaused = true;
            node._textureChanged = false;

            // Seek while paused — forces fresh frame
            node._seek(4);
            expect(node._hasNewFrame).toBe(true);

            // MediaNode._seek sets _ready = false (element is seeking).
            // Simulate the element finishing its seek.
            node._ready = true;

            // Next update should upload the texture and set _textureChanged
            node._update(4);
            expect(node._textureChanged).toBe(true);
        });

        it("seek while paused does NOT register a new rVFC callback (no chaining when paused)", () => {
            const { node, element } = nodeFactory(ctx);
            addVideoFrameCallbackSupport(element);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            ctx.play();
            ctx.update(1);

            const callsBefore = element.requestVideoFrameCallback.mock.calls.length;

            // Pause
            ctx.pause();
            ctx.update(0.016);

            // Seek while paused
            node._seek(5);

            // Should NOT have registered a new callback (node is paused, not playing)
            expect(element.requestVideoFrameCallback.mock.calls.length).toBe(callsBefore);
            expect(node._rvfcHandle).toBeNull();
        });

        it("paused seek does not freeze: subsequent update still uploads once element is ready", () => {
            const { node, element } = nodeFactory(ctx);
            addVideoFrameCallbackSupport(element);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            ctx.play();
            ctx.update(1);

            // Pause and render the paused frame
            ctx.pause();
            ctx.update(0.016);
            node._renderPaused = true;
            node._textureChanged = false;
            node._hasNewFrame = false; // simulate rVFC not fired (paused)

            // Seek while paused — this is the critical path
            node._seek(6);

            // _hasNewFrame is forced true by _seek(), bypassing the rVFC requirement
            expect(node._hasNewFrame).toBe(true);
            // _ready is false (element is seeking) — this is expected
            expect(node._ready).toBe(false);

            // Simulate element finishing its seek (browser would fire 'seeked' event)
            node._ready = true;

            // Update — because _hasNewFrame is true and element is ready,
            // the node will upload the texture (no freeze)
            node._update(6);
            expect(node._textureChanged).toBe(true);
        });
    });

    describe("MediaStream rVFC exclusion", () => {
        it("does not enable rVFC for MediaStream sources", () => {
            const originalGlobalMediaStream = global.MediaStream;
            const originalWindowMediaStream = global.window.MediaStream;
            // Mock MediaStream in the test environment
            const MockMediaStream = class MockMediaStream {};

            try {
                global.MediaStream = MockMediaStream;
                global.window.MediaStream = MockMediaStream;

                const stream = new MockMediaStream();
                const canvas = new HTMLCanvasElement(100, 100);
                const streamCtx = new VideoContext(canvas, undefined, {
                    useVideoElementCache: false
                });

                // Create a video node with the mock MediaStream
                const node = streamCtx.video(stream);
                node.start(0);
                node.stop(10);

                // Force a load so the element is created, then patch it before play
                node._load();
                expect(node._element).toBeDefined();

                // Patch the real DOM element with mocks
                node._element.requestVideoFrameCallback = vi.fn();
                node._element.cancelVideoFrameCallback = vi.fn();
                node._element.play = vi.fn().mockResolvedValue(undefined);
                node._element.pause = vi.fn();
                Object.defineProperty(node._element, "readyState", {
                    value: 4,
                    writable: true
                });

                streamCtx.play();
                streamCtx.update(1);

                // Must NOT use video frame callbacks for MediaStream
                expect(node._usesVideoFrameCallback).toBe(false);
                expect(node._rvfcHandle).toBeNull();
            } finally {
                global.MediaStream = originalGlobalMediaStream;
                global.window.MediaStream = originalWindowMediaStream;
            }
        });
    });

    describe("_debugMetrics", () => {
        it("initialises with zeroed metrics", () => {
            const { node } = nodeFactory(ctx);
            expect(node._debugMetrics).toEqual({
                callbackCount: 0,
                uploadCount: 0,
                lastMediaTime: -1,
                lastPresentedFrames: 0,
                skippedFrames: 0
            });
        });

        it("tracks callback count and metadata from rVFC", () => {
            const { node, element } = nodeFactory(ctx);
            const videoFrames = addVideoFrameCallbackSupport(element);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            ctx.play();
            ctx.update(1);

            videoFrames.fire(node._rvfcHandle, {
                mediaTime: 0.5,
                presentedFrames: 10
            });
            expect(node._debugMetrics.callbackCount).toBe(1);
            expect(node._debugMetrics.lastMediaTime).toBe(0.5);
            expect(node._debugMetrics.lastPresentedFrames).toBe(10);

            videoFrames.fire(node._rvfcHandle, {
                mediaTime: 1.0,
                presentedFrames: 11
            });
            expect(node._debugMetrics.callbackCount).toBe(2);
            expect(node._debugMetrics.lastMediaTime).toBe(1.0);
            expect(node._debugMetrics.lastPresentedFrames).toBe(11);
        });

        it("counts skipped frames from presentedFrames gaps", () => {
            const { node, element } = nodeFactory(ctx);
            const videoFrames = addVideoFrameCallbackSupport(element);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            ctx.play();
            ctx.update(1);

            // First callback — no skipped frames (no previous reference)
            videoFrames.fire(node._rvfcHandle, {
                mediaTime: 0.04,
                presentedFrames: 5
            });
            expect(node._debugMetrics.skippedFrames).toBe(0);

            // Consecutive frame — no skip
            videoFrames.fire(node._rvfcHandle, {
                mediaTime: 0.08,
                presentedFrames: 6
            });
            expect(node._debugMetrics.skippedFrames).toBe(0);

            // Gap of 3 frames (presentedFrames jumps from 6 to 10)
            videoFrames.fire(node._rvfcHandle, {
                mediaTime: 0.2,
                presentedFrames: 10
            });
            expect(node._debugMetrics.skippedFrames).toBe(3);
        });

        it("tracks upload count during playback", () => {
            const { node, element } = nodeFactory(ctx);
            const videoFrames = addVideoFrameCallbackSupport(element);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            ctx.play();
            ctx.update(1); // sets _ready = true
            ctx.update(1.04); // first upload now that _ready is true
            expect(node._debugMetrics.uploadCount).toBe(1);

            // Fire rVFC → _hasNewFrame = true → next update uploads
            videoFrames.fire(node._rvfcHandle, {
                mediaTime: 0.1,
                presentedFrames: 1
            });
            ctx.update(1.08);
            expect(node._debugMetrics.uploadCount).toBe(2);

            // No rVFC fired → _hasNewFrame = false → no upload
            ctx.update(1.12);
            expect(node._debugMetrics.uploadCount).toBe(2);
        });

        it("resets metrics on unload", () => {
            const { node, element } = nodeFactory(ctx);
            const videoFrames = addVideoFrameCallbackSupport(element);
            element.readyState = 4;
            element.duration = 10;
            element.play = vi.fn().mockResolvedValue(undefined);

            ctx.play();
            ctx.update(1); // sets _ready = true
            ctx.update(1.04); // triggers upload

            videoFrames.fire(node._rvfcHandle, {
                mediaTime: 0.5,
                presentedFrames: 5
            });
            expect(node._debugMetrics.callbackCount).toBe(1);
            expect(node._debugMetrics.uploadCount).toBe(1);

            // Seek past stopTime to trigger unload
            ctx.currentTime = 11;
            ctx.update(11);

            expect(node._debugMetrics.callbackCount).toBe(0);
            expect(node._debugMetrics.uploadCount).toBe(0);
            expect(node._debugMetrics.lastMediaTime).toBe(-1);
            expect(node._debugMetrics.lastPresentedFrames).toBe(0);
            expect(node._debugMetrics.skippedFrames).toBe(0);
        });
    });
});
