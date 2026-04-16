/**
 * Unit tests for TransitionNode (Phase 6c)
 *
 * Covers:
 * - displayName
 * - instanceof EffectNode / ProcessingNode
 * - transition() adds an entry to _transitions
 * - transition() uses _currentTime as offset for relative timing
 * - transitionAt() adds an absolute-time transition
 * - _doesTransitionFitOnTimeline: rejects overlapping transitions
 * - clearTransitions(propertyName) clears all for that property
 * - clearTransitions() (no arg) clears all properties
 * - clearTransition(propertyName, time) removes a single transition
 * - _update interpolates property value mid-transition
 * - _update sets value to target after transition end
 * - _update respects initial value before transition start
 */
import "../../src/utils.js"; // must be first — bootstraps circular module graph
import { describe, test, expect, beforeEach } from "vitest";
import "webgl-mock";
import TransitionNode from "../../src/ProcessingNodes/transitionnode.js";
import EffectNode from "../../src/ProcessingNodes/effectnode.js";
import ProcessingNode from "../../src/ProcessingNodes/processingnode.js";
import RenderGraph from "../../src/rendergraph.js";

global.window = global.window || {};

const VERT = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
`;
const FRAG_TWO_INPUTS = `
    precision mediump float;
    uniform sampler2D u_image_a;
    uniform sampler2D u_image_b;
    uniform float mix;
    varying vec2 v_texCoord;
    void main() {
        vec4 a = texture2D(u_image_a, v_texCoord);
        vec4 b = texture2D(u_image_b, v_texCoord);
        gl_FragColor = mix(a, b, mix);
    }
`;

function makeCrossfadeDef() {
    return {
        vertexShader: VERT,
        fragmentShader: FRAG_TWO_INPUTS,
        properties: {
            mix: { type: "uniform", value: 0.0 }
        },
        inputs: ["u_image_a", "u_image_b"]
    };
}

let gl;
let renderGraph;

beforeEach(() => {
    const canvas = new HTMLCanvasElement(200, 200);
    gl = canvas.getContext("webgl");
    renderGraph = new RenderGraph();
});

describe("TransitionNode", () => {
    describe("construction", () => {
        test("displayName is 'TransitionNode'", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            expect(node.displayName).toBe("TransitionNode");
        });

        test("is an instance of EffectNode", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            expect(node).toBeInstanceOf(EffectNode);
        });

        test("is an instance of ProcessingNode", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            expect(node).toBeInstanceOf(ProcessingNode);
        });

        test("_transitions starts empty", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            expect(Object.keys(node._transitions)).toHaveLength(0);
        });

        test("_initialPropertyValues mirrors definition properties", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            expect(node._initialPropertyValues.mix).toBe(0.0);
        });
    });

    describe("transition() — relative time", () => {
        test("adds a transition entry to _transitions for the property", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            const result = node.transition(1, 3, 0.0, 1.0, "mix");
            expect(result).toBe(true);
            expect(node._transitions.mix).toHaveLength(1);
        });

        test("uses _currentTime as the offset for start/end", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node._currentTime = 10;
            node.transition(2, 5, 0.0, 1.0, "mix");
            expect(node._transitions.mix[0].start).toBe(12);
            expect(node._transitions.mix[0].end).toBe(15);
        });

        test("defaults propertyName to 'mix'", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node.transition(0, 2, 0.0, 1.0);
            expect(node._transitions.mix).toHaveLength(1);
        });

        test("returns false for a completely overlapping transition", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node.transitionAt(0, 4, 0.0, 1.0, "mix");
            // Second transition start/end both inside first transition
            const result = node.transition(1, 3, 0.0, 1.0, "mix");
            expect(result).toBe(false);
        });

        test("allows non-overlapping transitions", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node.transitionAt(0, 2, 0.0, 1.0, "mix");
            const result = node.transitionAt(3, 5, 1.0, 0.0, "mix");
            expect(result).toBe(true);
            expect(node._transitions.mix).toHaveLength(2);
        });
    });

    describe("transitionAt() — absolute time", () => {
        test("adds transition at absolute start/end times", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node.transitionAt(5, 10, 0.0, 1.0, "mix");
            expect(node._transitions.mix[0].start).toBe(5);
            expect(node._transitions.mix[0].end).toBe(10);
        });
    });

    describe("clearTransitions", () => {
        test("clearTransitions(propertyName) empties that property", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node.transitionAt(0, 2, 0.0, 1.0, "mix");
            node.clearTransitions("mix");
            expect(node._transitions.mix).toHaveLength(0);
        });

        test("clearTransitions() with no arg clears all properties", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node.transitionAt(0, 2, 0.0, 1.0, "mix");
            node.clearTransitions(undefined);
            expect(Object.keys(node._transitions)).toHaveLength(0);
        });
    });

    describe("clearTransition", () => {
        test("removes a transition that contains the given time", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node.transitionAt(0, 4, 0.0, 1.0, "mix");
            const removed = node.clearTransition("mix", 2);
            expect(removed).toBe(true);
            expect(node._transitions.mix).toHaveLength(0);
        });

        test("returns false when no transition contains the given time", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node.transitionAt(0, 4, 0.0, 1.0, "mix");
            const removed = node.clearTransition("mix", 10);
            expect(removed).toBe(false);
        });
    });

    describe("_update — property interpolation", () => {
        test("property is currentValue before transition starts", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            // Transition from t=2 to t=4
            node.transitionAt(2, 4, 0.0, 1.0, "mix");
            // At time 1, before transition: property should hold the first
            // transition's current value (0.0) as defined by the transitions list.
            node._update(1.0);
            expect(node.mix).toBe(0.0);
        });

        test("property interpolates to midpoint at 50% through the transition", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node.transitionAt(0, 2, 0.0, 1.0, "mix");
            // At the midpoint (t=1), progress = 0.5 → value should be ~0.5
            node._update(1.0);
            expect(node.mix).toBeCloseTo(0.5, 5);
        });

        test("property is set to targetValue after transition ends", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node.transitionAt(0, 2, 0.0, 1.0, "mix");
            node._update(3.0);
            expect(node.mix).toBe(1.0);
        });

        test("_currentTime is updated by _update", () => {
            const node = new TransitionNode(gl, renderGraph, makeCrossfadeDef());
            node._update(5.5);
            expect(node._currentTime).toBe(5.5);
        });
    });
});
