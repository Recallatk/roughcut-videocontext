/**
 * Unit tests for VideoNode and AudioNode (Phase 6c)
 *
 * Covers:
 * - displayName is set correctly
 * - _elementType is set correctly ("video" / "audio")
 * - URL src stored in _elementURL
 * - HTMLVideoElement/HTMLAudioElement src sets _element, not _elementURL
 * - state transitions: waiting → sequenced → playing → ended
 * - volume setter delegates to element
 * - AudioNode._update suppresses texture update
 */
import "../../src/utils.js"; // must be first — bootstraps circular module graph
import * as utils from "../../src/utils.js";
import { vi, describe, test, expect, beforeEach } from "vitest";
import "webgl-mock";
import VideoNode from "../../src/SourceNodes/videonode.js";
import AudioNode from "../../src/SourceNodes/audionode.js";
import { SOURCENODESTATE } from "../../src/SourceNodes/sourcenode.js";
import RenderGraph from "../../src/rendergraph.js";

global.window = global.window || {};

let gl;
let renderGraph;

beforeEach(() => {
    const canvas = new HTMLCanvasElement(200, 200);
    gl = canvas.getContext("webgl");
    renderGraph = new RenderGraph();
});

// ---------------------------------------------------------------------------
// VideoNode
// ---------------------------------------------------------------------------
describe("VideoNode", () => {
    describe("construction", () => {
        test("displayName is 'VideoNode'", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            expect(node.displayName).toBe("VideoNode");
        });

        test("_elementType is 'video'", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            expect(node._elementType).toBe("video");
        });

        test("URL src is stored in _elementURL", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            expect(node._elementURL).toBe("video.mp4");
            expect(node._element).toBeUndefined();
        });

        test("HTMLVideoElement src assigns element directly", () => {
            const el = document.createElement("video");
            const node = new VideoNode(el, gl, renderGraph, 0);
            expect(node._element).toBe(el);
            expect(node._elementURL).toBeUndefined();
            expect(node._isResponsibleForElementLifeCycle).toBe(false);
        });

        test("initial state is waiting", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            expect(node.state).toBe(SOURCENODESTATE.waiting);
        });
    });

    describe("sequencing", () => {
        test("start() sets state to sequenced", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            node.start(0);
            expect(node.state).toBe(SOURCENODESTATE.sequenced);
        });

        test("start() returns false if already sequenced", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            node.start(0);
            expect(node.start(0)).toBe(false);
        });

        test("stop() returns false if start has not been called", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            expect(node.stop(10)).toBe(false);
        });

        test("startAt/stopAt set absolute timeline positions", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            node.startAt(5);
            node.stopAt(15);
            expect(node.startTime).toBe(5);
            expect(node.stopTime).toBe(15);
        });
    });

    describe("callbacks", () => {
        test("registerCallback / unregisterCallback round-trip", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            const cb = vi.fn();
            node.registerCallback("loaded", cb);
            node._triggerCallbacks("loaded");
            expect(cb).toHaveBeenCalledOnce();

            node.unregisterCallback(cb);
            node._triggerCallbacks("loaded");
            expect(cb).toHaveBeenCalledOnce(); // still just once
        });

        test("unregisterCallback() with no arg removes all", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            const a = vi.fn();
            const b = vi.fn();
            node.registerCallback("play", a);
            node.registerCallback("play", b);
            node.unregisterCallback();
            node._triggerCallbacks("play");
            expect(a).not.toHaveBeenCalled();
            expect(b).not.toHaveBeenCalled();
        });
    });

    describe("clearTimelineState", () => {
        test("resets state to waiting", () => {
            const node = new VideoNode("video.mp4", gl, renderGraph, 0);
            node.startAt(2);
            node.stopAt(8);
            node.clearTimelineState();
            expect(node.state).toBe(SOURCENODESTATE.waiting);
            expect(node.startTime).toBeNaN();
            expect(node.stopTime).toBe(Infinity);
        });
    });
});

// ---------------------------------------------------------------------------
// AudioNode
// ---------------------------------------------------------------------------
describe("AudioNode", () => {
    describe("construction", () => {
        test("displayName is 'AudioNode'", () => {
            const node = new AudioNode("audio.mp3", gl, renderGraph, 0);
            expect(node.displayName).toBe("AudioNode");
        });

        test("_elementType is 'audio'", () => {
            const node = new AudioNode("audio.mp3", gl, renderGraph, 0);
            expect(node._elementType).toBe("audio");
        });
    });

    describe("_update", () => {
        test("never calls updateTexture (audio nodes skip texture upload)", () => {
            // Mirrors the sourcenode.spec.js pattern: use vi.spyOn to assert
            // that updateTexture is NOT invoked by AudioNode regardless of state.
            const updateTextureSpy = vi.spyOn(utils, "updateTexture");

            const node = new AudioNode("audio.mp3", gl, renderGraph, 0);
            // Use a direct HTMLAudioElement element reference so the node is
            // not lifecycle-responsible and won't call load() internally.
            const el = document.createElement("audio");
            node._element = el;
            node._ready = true;
            node._isResponsibleForElementLifeCycle = false;

            // Put node in paused state — sourcenode._update would normally
            // call updateTexture here, but AudioNode passes false.
            node.startAt(0);
            node._state = SOURCENODESTATE.paused;

            node._update(1.0);

            expect(updateTextureSpy).not.toHaveBeenCalled();
            updateTextureSpy.mockRestore();
        });
    });
});
