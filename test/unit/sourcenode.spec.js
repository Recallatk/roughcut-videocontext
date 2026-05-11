import * as utils from "../../src/utils";
import SourceNode from "../../src/SourceNodes/sourcenode";
import { vi } from "vitest";
import "webgl-mock";

global.window = {};

let mockGLContext;

const PAUSED_STATE = 3;
const PLAYING_STATE = 2;
const ELEMENT = { mock: "videoElement" };
const mockRenderGraph = {};

beforeEach(() => {
    const canvas = new HTMLCanvasElement(500, 500);
    mockGLContext = canvas.getContext("webgl");
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("_update", () => {
    test("updatesTexture if currentTime is changed and ctx is PAUSED and node is ready", () => {
        const updateTextureSpy = vi.spyOn(utils, "updateTexture");
        const currentTime = 0;
        const node = new SourceNode(ELEMENT, mockGLContext, mockRenderGraph, currentTime);

        node.startAt(currentTime);

        // force into paused state
        node._state = PAUSED_STATE;
        expect(node.state).toEqual(PAUSED_STATE);

        // force to be ready
        node._ready = true;

        // Expect updateTexture to not be called at this point
        expect(updateTextureSpy).not.toHaveBeenCalled();

        // force an update
        node._update(currentTime + 1);

        // Expect updateTexture to be called after update
        expect(updateTextureSpy).toHaveBeenCalledOnce();
    });

    test("updates texture every playing update when video frame callbacks are not active", () => {
        const updateTextureSpy = vi.spyOn(utils, "updateTexture");
        const node = new SourceNode(ELEMENT, mockGLContext, mockRenderGraph, 0);

        node.startAt(0);
        node._state = PLAYING_STATE;
        node._ready = true;

        node._update(0.1);
        node._update(0.2);

        expect(updateTextureSpy).toHaveBeenCalledTimes(2);
    });

    test("skips stale playing updates when video frame callbacks are active", () => {
        const updateTextureSpy = vi.spyOn(utils, "updateTexture");
        const node = new SourceNode(ELEMENT, mockGLContext, mockRenderGraph, 0);

        node.startAt(0);
        node._state = PLAYING_STATE;
        node._ready = true;
        node._usesVideoFrameCallback = true;
        node._hasNewFrame = true;

        node._update(0.1);
        node._update(0.2);
        node._hasNewFrame = true;
        node._update(0.3);

        expect(updateTextureSpy).toHaveBeenCalledTimes(2);
    });
});
