# VideoContext

A WebGL & HTML5 graph-based video composition engine for the browser.

> **This is a maintained fork** of [VideoContext by BBC R&D](https://github.com/bbc/VideoContext).
> The fork modernises the build tooling (Vite, Vitest, TypeScript strict, ESLint 10),
> fixes engine bugs (stall detection, seek debounce, reset/cleanup), and ships as
> ESM + CJS. All changes are documented in [CHANGELOG.md](CHANGELOG.md).

VideoContext provides a graph-based, shader-accelerated processing pipeline
paired with a media-playback sequencing timeline. The API is inspired by the
Web Audio API.

## Install

```sh
npm install @recallatk/videocontext
```

## Quick start

```js
import VideoContext from "@recallatk/videocontext";

const canvas = document.getElementById("canvas");
const ctx = new VideoContext(canvas);

const video1 = ctx.video("./video1.mp4");
video1.start(0);
video1.stop(4);

const video2 = ctx.video("./video2.mp4");
video2.start(2);
video2.stop(6);

const crossFade = ctx.transition(VideoContext.DEFINITIONS.CROSSFADE);
crossFade.transition(2, 4, 0.0, 1.0, "mix");

video1.connect(crossFade);
video2.connect(crossFade);
crossFade.connect(ctx.destination);

ctx.play();
```

## Options

Pass an options object as the second argument to the constructor:

```js
const ctx = new VideoContext(canvas, {
    manualUpdate: false,          // drive updates yourself via ctx.update()
    endOnLastSourceEnd: true,     // auto-pause when the last source ends
    useVideoElementCache: true,   // reuse <video> elements
    videoElementCacheSize: 6,     // how many to keep pooled
    stallTimeout: 3000,           // ms before a stalled source is skipped
    seekDebounce: 200,            // ms debounce for seek operations
});
```

## Node types

### VideoNode

```js
const videoNode = ctx.video("./video.mp4");
videoNode.connect(ctx.destination);
videoNode.start(0);
videoNode.stop(4);
```

For best results encode video with a fast-decode profile:

```sh
ffmpeg -i input.mp4 -tune fastdecode output.mp4
```

### AudioNode

```js
const audioNode = ctx.audio("./audio.mp3");
audioNode.connect(ctx.destination);
audioNode.start(0);
audioNode.stop(4);
```

### ImageNode

```js
const imageNode = ctx.image("./photo.png");
imageNode.connect(ctx.destination);
imageNode.start(0);
imageNode.stop(4);
```

### CanvasNode

```js
const srcCanvas = document.getElementById("input-canvas");
const canvasNode = ctx.canvas(srcCanvas);
canvasNode.connect(ctx.destination);
canvasNode.start(0);
canvasNode.stop(4);
```

### CustomSourceNode

Create custom source nodes that hook into the VideoContext node API.
For example, an HLS source:

```js
import Hls from "hls.js";

class HLSNode extends VideoContext.NODES.VideoNode {
    constructor(src, gl, renderGraph, currentTime, playbackRate, sourceOffset, preloadTime, hlsOptions = {}) {
        const video = document.createElement("video");
        super(video, gl, renderGraph, currentTime, playbackRate, sourceOffset, preloadTime);
        this.hls = new Hls(hlsOptions);
        this.hls.attachMedia(video);
        this._src = src;
        this._displayName = "HLSNode";
        this._elementType = "hls";
    }

    _load() {
        if (!this._loadTriggered) {
            this.hls.loadSource(this._src);
        }
        super._load();
    }

    destroy() {
        if (this.hls) this.hls.destroy();
        super.destroy();
    }
}

const hlsNode = ctx.customSourceNode(
    HLSNode,
    "https://example.com/stream.m3u8"
);
hlsNode.start(0);
hlsNode.stop(60);
hlsNode.connect(ctx.destination);
ctx.play();
```

### EffectNode

Apply GPU shader effects to sources. Built-in definitions are available on
`VideoContext.DEFINITIONS`.

```js
const sepiaEffect = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);
sepiaEffect.outputMix = [1.25, 1.18, 0.9];

videoNode.connect(sepiaEffect);
sepiaEffect.connect(ctx.destination);
```

Custom effect definitions use GLSL fragment/vertex shaders:

```js
const monochromeDefinition = {
    title: "Monochrome",
    description: "Single-chroma filter with adjustable color mix.",
    vertexShader: `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main() {
            gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
            v_texCoord = a_texCoord;
        }`,
    fragmentShader: `
        precision mediump float;
        uniform sampler2D u_image;
        uniform vec3 inputMix;
        uniform vec3 outputMix;
        varying vec2 v_texCoord;
        void main(){
            vec4 color = texture2D(u_image, v_texCoord);
            float mono = color[0]*inputMix[0] + color[1]*inputMix[1] + color[2]*inputMix[2];
            color[0] = mono * outputMix[0];
            color[1] = mono * outputMix[1];
            color[2] = mono * outputMix[2];
            gl_FragColor = color;
        }`,
    properties: {
        inputMix:  { type: "uniform", value: [0.4, 0.6, 0.2] },
        outputMix: { type: "uniform", value: [1.0, 1.0, 1.0] },
    },
    inputs: ["u_image"],
};
```

### TransitionNode

Transition nodes tween shader properties over time — useful for cross-fades,
wipes, and other video transitions:

```js
const crossfade = ctx.transition(VideoContext.DEFINITIONS.CROSSFADE);

// Transition the "mix" property from 0 → 1 between t=8s and t=10s
crossfade.transition(8.0, 10.0, 0.0, 1.0, "mix");

videoNode1.connect(crossfade);
videoNode2.connect(crossfade);
crossfade.connect(ctx.destination);
```

Inputs can be connected by name or index:

```js
videoNode1.connect(crossfade, "image_a"); // by name
videoNode2.connect(crossfade, 1);         // by index
```

### CompositingNode

Compositing nodes accept unlimited inputs and render each through the same
shader to a single output — ideal for layering sources with alpha channels
or collecting timeline segments into a track:

```js
const combine = ctx.compositor(VideoContext.DEFINITIONS.COMBINE);

videoNode1.connect(combine);
videoNode2.connect(combine);
videoNode3.connect(combine);
combine.connect(ctx.destination);
```

## Writing custom effect definitions

```js
const effectDefinition = {
    title: "",            // Effect name
    description: "",      // What it does
    vertexShader: "",     // GLSL vertex shader
    fragmentShader: "",   // GLSL fragment shader
    properties: {},       // Uniforms exposed as JS properties
    inputs: ["u_image"],  // sampler2D uniform names for texture inputs
};
```

See [AdvancedExamples.md](AdvancedExamples.md) for more complex usage patterns.

## Built-in definitions

| Name | Type |
|------|------|
| `CROSSFADE` | transition |
| `DREAMFADE` | transition |
| `TOCOLORANDBACKFADE` | transition |
| `HORIZONTALWIPE` | transition |
| `VERTICALWIPE` | transition |
| `RANDOMDISSOLVE` | transition |
| `STARWIPE` | transition |
| `STATICDISSOLVE` | transition |
| `STATICEFFECT` | effect |
| `MONOCHROME` | effect |
| `HORIZONTAL_BLUR` | effect |
| `VERTICAL_BLUR` | effect |
| `OPACITY` | effect |
| `CROP` | effect |
| `COLORTHRESHOLD` | effect |
| `COMBINE` | compositing |
| `AAF_VIDEO_CROP` | effect |
| `AAF_VIDEO_FLIP` | effect |
| `AAF_VIDEO_FLOP` | effect |
| `AAF_VIDEO_POSITION` | effect |
| `AAF_VIDEO_SCALE` | effect |

## Development

Requires **Node ≥ 22**.

```sh
npm install          # install dependencies
npm run dev          # build with watch mode
npm test             # run unit + integration tests
npm run test-e2e     # run Playwright end-to-end tests
npm run lint         # ESLint
npm run typecheck    # TypeScript strict check
npm run format       # Prettier
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor workflow.

## License

[Apache-2.0](LICENSE)

Originally created by [Matthew Shotton](mailto:matthew.shotton@bbc.co.uk) at BBC R&D.
Maintained by [RoughCut (Recallatk)](https://github.com/Recallatk).
