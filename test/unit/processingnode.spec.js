/**
 * Unit tests for ProcessingNode (Phase 6c)
 *
 * Covers:
 * - construction with minimal definition
 * - setProperty / getProperty round-trip
 * - _update sets _currentTime
 * - _seek sets _currentTime
 * - property values copied from definition at construction
 */
import "../../src/utils.js"; // must be first — bootstraps circular module graph
import { describe, test, expect, beforeEach } from "vitest";
import "webgl-mock";
import ProcessingNode from "../../src/ProcessingNodes/processingnode.js";
import RenderGraph from "../../src/rendergraph.js";

global.window = global.window || {};

// Minimal GLSL definition that the webgl-mock can compile without errors.
// The shader bodies are intentionally trivial — webgl-mock doesn't execute GLSL.
const MINIMAL_VERT = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
`;
const MINIMAL_FRAG = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float opacity;
    varying vec2 v_texCoord;
    void main() {
        gl_FragColor = texture2D(u_image, v_texCoord) * opacity;
    }
`;

function makeDefinition(overrides = {}) {
    return {
        vertexShader: MINIMAL_VERT,
        fragmentShader: MINIMAL_FRAG,
        properties: {
            opacity: { type: "uniform", value: 1.0 }
        },
        inputs: ["u_image"],
        ...overrides
    };
}

let gl;
let renderGraph;

beforeEach(() => {
    const canvas = new HTMLCanvasElement(200, 200);
    gl = canvas.getContext("webgl");
    renderGraph = new RenderGraph();
});

describe("ProcessingNode", () => {
    describe("construction", () => {
        test("displayName is 'ProcessingNode'", () => {
            const def = makeDefinition();
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            expect(node.displayName).toBe("ProcessingNode");
        });

        test("WebGL program is created", () => {
            const def = makeDefinition();
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            expect(node._program).not.toBeNull();
        });

        test("framebuffer is created", () => {
            const def = makeDefinition();
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            expect(node._framebuffer).not.toBeNull();
        });

        test("properties copied from definition", () => {
            const def = makeDefinition();
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            expect(node._properties.opacity).toBeDefined();
            expect(node._properties.opacity.value).toBe(1.0);
        });

        test("_currentTime initialised to 0", () => {
            const def = makeDefinition();
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            expect(node._currentTime).toBe(0);
        });

        test("array property values are shallow-copied (not shared reference)", () => {
            const arr = [0.0, 0.0, 0.0];
            const def = makeDefinition({
                properties: {
                    color: { type: "uniform", value: arr }
                }
            });
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            // Mutating the original should not affect the node's copy
            arr[0] = 99;
            expect(node._properties.color.value[0]).toBe(0.0);
        });
    });

    describe("setProperty / getProperty", () => {
        test("round-trip: set and get a uniform value", () => {
            const def = makeDefinition();
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            node.setProperty("opacity", 0.5);
            expect(node.getProperty("opacity")).toBe(0.5);
        });

        test("property accessor mirrors _properties value", () => {
            const def = makeDefinition();
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            node.setProperty("opacity", 0.3);
            // The Object.defineProperty accessor created in constructor should
            // reflect the same value.
            expect(node.opacity).toBe(0.3);
        });

        test("setting via accessor updates _properties", () => {
            const def = makeDefinition();
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            node.opacity = 0.7;
            expect(node._properties.opacity.value).toBe(0.7);
        });
    });

    describe("_update", () => {
        test("sets _currentTime to the passed value", () => {
            const def = makeDefinition();
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            node._update(3.5);
            expect(node._currentTime).toBe(3.5);
        });
    });

    describe("_seek", () => {
        test("sets _currentTime to the passed value", () => {
            const def = makeDefinition();
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            node._seek(7.0);
            expect(node._currentTime).toBe(7.0);
        });
    });

    describe("limitConnections", () => {
        test("limitConnections=true restricts connections to inputNames count", () => {
            const def = makeDefinition({ inputs: ["u_image"] });
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, true);
            // maximumConnections is inherited from GraphNode
            expect(node.maximumConnections).toBe(1);
        });

        test("limitConnections=false allows unlimited connections", () => {
            const def = makeDefinition({ inputs: ["u_image"] });
            const node = new ProcessingNode(gl, renderGraph, def, def.inputs, false);
            expect(node.maximumConnections).toBe(Infinity);
        });
    });
});
