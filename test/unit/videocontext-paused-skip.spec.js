/**
 * Unit tests for paused compositor skip optimisation.
 *
 * Covers:
 * - Simple paused graph (no processing nodes) skips render-graph pass after
 *   all source paused frames have been uploaded.
 * - Paused graph with a processing node always composites (never skips).
 * - clearTexture deduplication: only called once when a source exits its
 *   timeline window, not on every subsequent _update tick.
 */
import { vi, describe, test, expect, beforeEach } from "vitest";
import "webgl-mock";
import * as utils from "../../src/utils.js";
import VideoContext from "../../src/videocontext.js";
import RenderGraph from "../../src/rendergraph.js";

function makeCanvas() {
    return new HTMLCanvasElement(100, 100);
}

// Minimal fake source node that behaves like a SourceNode for the compositor
// skip logic. Only the fields the _update loop actually reads are stubbed.
function makeFakeSource(overrides = {}) {
    return {
        destroyed: false,
        _state: 2, // playing
        _ready: true,
        _renderPaused: false,
        _textureChanged: false,
        _textureIsCleared: false,
        _hasNewFrame: undefined,
        _usesVideoFrameCallback: false,
        _buffering: false,
        _currentTime: 0,
        _startTime: 0,
        _stopTime: 10,
        startTime: 0,
        stopTime: 10,
        _update: vi.fn(),
        _pause: vi.fn(),
        _play: vi.fn(),
        _isReady: vi.fn(() => true),
        _seek: vi.fn(),
        destroy: vi.fn(),
        ...overrides
    };
}

// Minimal fake processing node
function makeFakeProcessingNode() {
    return {
        destroyed: false,
        _update: vi.fn(),
        _render: vi.fn(),
        destroy: vi.fn()
    };
}

describe("Paused compositor skip", () => {
    let canvas;

    beforeEach(() => {
        canvas = makeCanvas();
        global.window = global.window || {};
        global.window.__VIDEOCONTEXT_REFS__ = global.window.__VIDEOCONTEXT_REFS__ || {};
    });

    test("simple paused graph skips render-graph pass when all sources are _renderPaused", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });

        // One source node — already uploaded its paused frame
        const src = makeFakeSource({
            _state: 3, // paused
            _renderPaused: true,
            _textureChanged: false
        });
        ctx._sourceNodes = [src];
        ctx._processingNodes = [];

        // Wire a minimal render graph so we can detect if the topology pass runs.
        // If the skip works, RenderGraph.getInputlessNodes should never be called.
        const getInputlessSpy = vi.spyOn(RenderGraph, "getInputlessNodes");

        ctx._state = VideoContext.STATE.PAUSED;
        ctx._currentTime = 1;
        ctx.update(0.016);

        expect(getInputlessSpy).not.toHaveBeenCalled();
        getInputlessSpy.mockRestore();
    });

    test("simple paused graph does NOT skip when a source has _textureChanged", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });

        const src = makeFakeSource({
            _state: 3,
            _renderPaused: true,
            _textureChanged: true // <-- texture just changed (e.g. seek)
        });
        ctx._sourceNodes = [src];
        ctx._processingNodes = [];

        const getInputlessSpy = vi.spyOn(RenderGraph, "getInputlessNodes");

        ctx._state = VideoContext.STATE.PAUSED;
        ctx._currentTime = 1;
        ctx.update(0.016);

        expect(getInputlessSpy).toHaveBeenCalled();
        getInputlessSpy.mockRestore();
    });

    test("simple paused graph does NOT skip when a source has not yet rendered its paused frame", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });

        const src = makeFakeSource({
            _state: 3,
            _renderPaused: false, // <-- hasn't uploaded paused frame yet
            _textureChanged: false
        });
        ctx._sourceNodes = [src];
        ctx._processingNodes = [];

        const getInputlessSpy = vi.spyOn(RenderGraph, "getInputlessNodes");

        ctx._state = VideoContext.STATE.PAUSED;
        ctx._currentTime = 1;
        ctx.update(0.016);

        expect(getInputlessSpy).toHaveBeenCalled();
        getInputlessSpy.mockRestore();
    });

    test("paused graph with processing nodes always composites even when sources are _renderPaused", () => {
        const ctx = new VideoContext(canvas, undefined, { manualUpdate: true });

        const src = makeFakeSource({
            _state: 3,
            _renderPaused: true,
            _textureChanged: false
        });
        const procNode = makeFakeProcessingNode();

        ctx._sourceNodes = [src];
        ctx._processingNodes = [procNode];

        const getInputlessSpy = vi.spyOn(RenderGraph, "getInputlessNodes");

        ctx._state = VideoContext.STATE.PAUSED;
        ctx._currentTime = 1;
        ctx.update(0.016);

        // Should NOT skip — processing nodes exist
        expect(getInputlessSpy).toHaveBeenCalled();
        getInputlessSpy.mockRestore();
    });
});

describe("clearTexture deduplication", () => {
    let mockGLContext;

    beforeEach(() => {
        const canvas = makeCanvas();
        mockGLContext = canvas.getContext("webgl");
        global.window = {};
    });

    test("clearTexture is called once when source exits its timeline window, not on every tick", async () => {
        const clearTextureSpy = vi.spyOn(utils, "clearTexture");
        const SourceNode = (await import("../../src/SourceNodes/sourcenode.js")).default;

        const node = new SourceNode({ mock: "el" }, mockGLContext, {}, 0);
        node.startAt(0);
        node.stop(2);
        node._ready = true;
        node._state = 2; // playing

        // Advance past stop time — should trigger clearTexture once
        node._update(3);
        expect(clearTextureSpy).toHaveBeenCalledTimes(1);
        expect(node._textureIsCleared).toBe(true);
        expect(node._textureChanged).toBe(true);

        clearTextureSpy.mockClear();

        // Second update at same or later time — should NOT call clearTexture again
        node._update(3.5);
        expect(clearTextureSpy).not.toHaveBeenCalled();
        expect(node._textureIsCleared).toBe(true);

        clearTextureSpy.mockRestore();
    });

    test("clearTexture is called once when source is before its start time", async () => {
        const clearTextureSpy = vi.spyOn(utils, "clearTexture");
        const SourceNode = (await import("../../src/SourceNodes/sourcenode.js")).default;

        const node = new SourceNode({ mock: "el" }, mockGLContext, {}, 0);
        node.start(5);
        node.stop(10);
        node._ready = true;

        // Before start time — should clear once
        node._update(2);
        expect(clearTextureSpy).toHaveBeenCalledTimes(1);
        expect(node._textureIsCleared).toBe(true);

        clearTextureSpy.mockClear();

        // Still before start — should NOT clear again
        node._update(3);
        expect(clearTextureSpy).not.toHaveBeenCalled();

        clearTextureSpy.mockRestore();
    });

    test("_seek resets _textureIsCleared so next window exit clears again", async () => {
        const clearTextureSpy = vi.spyOn(utils, "clearTexture");
        const SourceNode = (await import("../../src/SourceNodes/sourcenode.js")).default;

        const node = new SourceNode({ mock: "el" }, mockGLContext, {}, 0);
        node.startAt(0);
        node.stop(5);
        node._ready = true;
        node._state = 2; // playing

        // Past stop — clears once
        node._update(6);
        expect(clearTextureSpy).toHaveBeenCalledTimes(1);
        clearTextureSpy.mockClear();

        // Seek back into the window — resets _textureIsCleared
        node._seek(3);
        expect(node._textureIsCleared).toBe(false);

        // Past stop again — should clear again (once)
        node._state = 2;
        node._update(6);
        expect(clearTextureSpy).toHaveBeenCalledTimes(1);

        clearTextureSpy.mockRestore();
    });
});
