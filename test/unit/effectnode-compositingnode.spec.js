/**
 * Unit tests for EffectNode and CompositingNode (Phase 6c)
 *
 * Covers:
 * - displayName
 * - instanceof ProcessingNode
 * - EffectNode: limitConnections=true (maximumConnections equals input count)
 * - CompositingNode: limitConnections=false (maximumConnections is Infinity)
 * - inherited setProperty / getProperty
 * - inherited _update sets _currentTime
 */
import "../../src/utils.js"; // must be first — bootstraps circular module graph
import { describe, test, expect, beforeEach } from "vitest";
import "webgl-mock";
import EffectNode from "../../src/ProcessingNodes/effectnode.js";
import CompositingNode from "../../src/ProcessingNodes/compositingnode.js";
import ProcessingNode from "../../src/ProcessingNodes/processingnode.js";
import RenderGraph from "../../src/rendergraph.js";

global.window = global.window || {};

// Minimal vertex and fragment shaders that compile under webgl-mock
const VERT = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
`;
const FRAG = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float opacity;
    varying vec2 v_texCoord;
    void main() {
        gl_FragColor = texture2D(u_image, v_texCoord) * opacity;
    }
`;

function makeDefinition(inputs = ["u_image"]) {
    return {
        vertexShader: VERT,
        fragmentShader: FRAG,
        properties: {
            opacity: { type: "uniform", value: 1.0 }
        },
        inputs
    };
}

let gl;
let renderGraph;

beforeEach(() => {
    const canvas = new HTMLCanvasElement(200, 200);
    gl = canvas.getContext("webgl");
    renderGraph = new RenderGraph();
});

// ---------------------------------------------------------------------------
// EffectNode
// ---------------------------------------------------------------------------
describe("EffectNode", () => {
    test("displayName is 'EffectNode'", () => {
        const node = new EffectNode(gl, renderGraph, makeDefinition());
        expect(node.displayName).toBe("EffectNode");
    });

    test("is an instance of ProcessingNode", () => {
        const node = new EffectNode(gl, renderGraph, makeDefinition());
        expect(node).toBeInstanceOf(ProcessingNode);
    });

    test("maximumConnections equals the number of inputs (limitConnections=true)", () => {
        const node = new EffectNode(gl, renderGraph, makeDefinition(["u_image"]));
        expect(node.maximumConnections).toBe(1);
    });

    test("maximumConnections equals 2 for a two-input definition", () => {
        const def = {
            ...makeDefinition(["u_image_a", "u_image_b"]),
            fragmentShader: `
                precision mediump float;
                uniform sampler2D u_image_a;
                uniform sampler2D u_image_b;
                varying vec2 v_texCoord;
                void main() { gl_FragColor = vec4(0.0); }
            `
        };
        const node = new EffectNode(gl, renderGraph, def);
        expect(node.maximumConnections).toBe(2);
    });

    test("setProperty / getProperty work correctly", () => {
        const node = new EffectNode(gl, renderGraph, makeDefinition());
        node.setProperty("opacity", 0.42);
        expect(node.getProperty("opacity")).toBe(0.42);
    });

    test("_update sets _currentTime", () => {
        const node = new EffectNode(gl, renderGraph, makeDefinition());
        node._update(4.0);
        expect(node._currentTime).toBe(4.0);
    });
});

// ---------------------------------------------------------------------------
// CompositingNode
// ---------------------------------------------------------------------------
describe("CompositingNode", () => {
    test("displayName is 'CompositingNode'", () => {
        const node = new CompositingNode(gl, renderGraph, makeDefinition());
        expect(node.displayName).toBe("CompositingNode");
    });

    test("is an instance of ProcessingNode", () => {
        const node = new CompositingNode(gl, renderGraph, makeDefinition());
        expect(node).toBeInstanceOf(ProcessingNode);
    });

    test("maximumConnections is Infinity (limitConnections=false)", () => {
        const node = new CompositingNode(gl, renderGraph, makeDefinition());
        expect(node.maximumConnections).toBe(Infinity);
    });

    test("setProperty / getProperty work correctly", () => {
        const node = new CompositingNode(gl, renderGraph, makeDefinition());
        node.setProperty("opacity", 0.25);
        expect(node.getProperty("opacity")).toBe(0.25);
    });

    test("_update sets _currentTime", () => {
        const node = new CompositingNode(gl, renderGraph, makeDefinition());
        node._update(2.5);
        expect(node._currentTime).toBe(2.5);
    });

    test("inputs array is empty on construction", () => {
        const node = new CompositingNode(gl, renderGraph, makeDefinition());
        expect(node.inputs).toHaveLength(0);
    });
});
