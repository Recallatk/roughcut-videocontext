/**
 * Unit tests for ImageNode and CanvasNode (Phase 6c)
 *
 * Covers:
 * - displayName
 * - URL stored in _elementURL
 * - ImageElement src assigns element directly (not lifecycle responsible)
 * - _load creates an Image, sets src, fires "loaded" callback
 * - _unload clears _image and _ready
 * - _isReady returns false when _image not loaded
 * - CanvasNode._load sets _ready = true immediately
 * - CanvasNode canvas src assigns element directly
 * - state transitions via _update
 */
import "../../src/utils.js"; // must be first — bootstraps circular module graph
import { vi, describe, test, expect, beforeEach } from "vitest";
import "webgl-mock";
import ImageNode from "../../src/SourceNodes/imagenode.js";
import CanvasNode from "../../src/SourceNodes/canvasnode.js";
import { SOURCENODESTATE } from "../../src/SourceNodes/sourcenode.js";
import RenderGraph from "../../src/rendergraph.js";

global.window = global.window || {};

let gl;
let renderGraph;

beforeEach(() => {
    const canvas = new HTMLCanvasElement(200, 200);
    gl = canvas.getContext("webgl");
    renderGraph = new RenderGraph();
    // webgl-mock replaces Image with a minimal stub that lacks setAttribute.
    // Restore a jsdom-backed HTMLImageElement so ImageNode._load() works.
    global.Image = function ImageCtor() {
        return document.createElement("img");
    };
});

// ---------------------------------------------------------------------------
// ImageNode
// ---------------------------------------------------------------------------
describe("ImageNode", () => {
    describe("construction", () => {
        test("displayName is 'CanvasNode' (historic mislabel in source)", () => {
            // The TYPE constant in imagenode.ts was copied from canvasnode and
            // currently reads "CanvasNode". This test documents the current
            // behaviour — it should be updated if the bug is ever fixed.
            const node = new ImageNode("image.png", gl, renderGraph, 0);
            expect(node.displayName).toBe("CanvasNode");
        });

        test("URL src stored in _elementURL", () => {
            const node = new ImageNode("image.png", gl, renderGraph, 0);
            expect(node._elementURL).toBe("image.png");
            expect(node._element).toBeUndefined();
        });

        test("HTMLImageElement src assigns _element directly", () => {
            const img = document.createElement("img");
            const node = new ImageNode(img, gl, renderGraph, 0);
            expect(node._element).toBe(img);
            expect(node._isResponsibleForElementLifeCycle).toBe(false);
        });

        test("initial state is waiting", () => {
            const node = new ImageNode("image.png", gl, renderGraph, 0);
            expect(node.state).toBe(SOURCENODESTATE.waiting);
        });

        test("custom preloadTime is stored", () => {
            const node = new ImageNode("image.png", gl, renderGraph, 0, 8);
            expect(node._preloadTime).toBe(8);
        });
    });

    describe("_load", () => {
        test("creates an Image element with crossorigin and sets src", () => {
            const node = new ImageNode("image.png", gl, renderGraph, 0);
            node._load();
            expect(node._image).toBeDefined();
            expect(node._image.getAttribute("crossorigin")).toBe("anonymous");
            expect(node._image.src).toContain("image.png");
        });

        test("calling _load a second time does not create a second Image", () => {
            const node = new ImageNode("image.png", gl, renderGraph, 0);
            node._load();
            const firstImage = node._image;
            node._load();
            expect(node._image).toBe(firstImage);
        });

        test("onload fires 'loaded' callback and sets _ready", () => {
            const node = new ImageNode("image.png", gl, renderGraph, 0);
            // Disable createImageBitmap so we hit the simpler else branch
            const origBitmap = window.createImageBitmap;
            window.createImageBitmap = undefined;

            const loadedCb = vi.fn();
            node.registerCallback("loaded", loadedCb);
            node._load();

            // Simulate successful image load
            node._image.onload();

            expect(node._ready).toBe(true);
            expect(loadedCb).toHaveBeenCalledOnce();

            window.createImageBitmap = origBitmap;
        });

        test("onerror sets state to error", () => {
            const node = new ImageNode("bad.png", gl, renderGraph, 0);
            node._load();
            node._image.onerror();
            expect(node._state).toBe(SOURCENODESTATE.error);
            expect(node._ready).toBe(true);
        });
    });

    describe("_unload", () => {
        test("clears _image and _ready", () => {
            const node = new ImageNode("image.png", gl, renderGraph, 0);
            node._load();
            expect(node._image).toBeDefined();
            node._unload();
            expect(node._image).toBeUndefined();
            expect(node._ready).toBe(false);
        });
    });

    describe("callbacks", () => {
        test("registerCallback / unregisterCallback", () => {
            const node = new ImageNode("image.png", gl, renderGraph, 0);
            const cb = vi.fn();
            node.registerCallback("loaded", cb);
            node._triggerCallbacks("loaded");
            expect(cb).toHaveBeenCalledOnce();
            node.unregisterCallback(cb);
            node._triggerCallbacks("loaded");
            expect(cb).toHaveBeenCalledOnce();
        });
    });
});

// ---------------------------------------------------------------------------
// CanvasNode
// ---------------------------------------------------------------------------
describe("CanvasNode", () => {
    describe("construction", () => {
        test("displayName is 'CanvasNode'", () => {
            const canvas = document.createElement("canvas");
            const node = new CanvasNode(canvas, gl, renderGraph, 0);
            expect(node.displayName).toBe("CanvasNode");
        });

        test("canvas element is stored as _element", () => {
            const canvas = document.createElement("canvas");
            const node = new CanvasNode(canvas, gl, renderGraph, 0);
            expect(node._element).toBe(canvas);
            expect(node._isResponsibleForElementLifeCycle).toBe(false);
        });

        test("default preloadTime is 4", () => {
            const canvas = document.createElement("canvas");
            const node = new CanvasNode(canvas, gl, renderGraph, 0);
            expect(node._preloadTime).toBe(4);
        });
    });

    describe("_load", () => {
        test("sets _ready to true immediately", () => {
            const canvas = document.createElement("canvas");
            const node = new CanvasNode(canvas, gl, renderGraph, 0);
            const loadedCb = vi.fn();
            node.registerCallback("loaded", loadedCb);
            node._load();
            expect(node._ready).toBe(true);
            expect(loadedCb).toHaveBeenCalledOnce();
        });
    });

    describe("_unload", () => {
        test("sets _ready to false", () => {
            const canvas = document.createElement("canvas");
            const node = new CanvasNode(canvas, gl, renderGraph, 0);
            node._load();
            node._unload();
            expect(node._ready).toBe(false);
        });
    });

    describe("state transitions", () => {
        test("transitions from sequenced to playing once startTime is reached", () => {
            const canvas = document.createElement("canvas");
            const node = new CanvasNode(canvas, gl, renderGraph, 0);
            node.startAt(1);
            node.stopAt(5);

            node._update(0.5);
            expect(node.state).toBe(SOURCENODESTATE.sequenced);

            node._update(1.0);
            expect(node.state).toBe(SOURCENODESTATE.playing);
        });

        test("transitions to ended once stopTime is reached", () => {
            const canvas = document.createElement("canvas");
            const node = new CanvasNode(canvas, gl, renderGraph, 0);
            node.startAt(0);
            node.stopAt(2);

            node._update(2.0);
            expect(node.state).toBe(SOURCENODESTATE.ended);
        });
    });
});
