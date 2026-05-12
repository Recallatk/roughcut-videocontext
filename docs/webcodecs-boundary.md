# WebCodecs Boundary (Future)

> Status: **documentation only** — no implementation planned for current release.

## Context

The engine currently uploads video frames via:

```ts
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);
```

Where `element` is an `HTMLVideoElement` managed by `MediaNode`. Frame timing is
gated by `requestVideoFrameCallback` (rVFC) when available.

WebCodecs (`VideoDecoder` + `VideoFrame`) would replace both the `<video>` element
and rVFC with a pull-based decode pipeline, giving direct control over:

- Which frames are decoded (no browser heuristic buffering)
- When frames are uploaded to GPU (`VideoFrame` is a valid `texImage2D` source)
- Frame lifecycle (explicit `.close()` prevents GC pressure)

## Source-Frame Adapter Shape

The boundary between the engine and a frame source should be a minimal interface:

```ts
interface FrameSource {
  /** Seek the source to a media time (seconds). */
  seek(mediaTime: number): void;

  /** Start continuous frame delivery. */
  play(rate: number): void;

  /** Stop frame delivery. */
  pause(): void;

  /**
   * Get the current frame for GPU upload.
   * Returns a TexImageSource (HTMLVideoElement | VideoFrame | ImageBitmap | …)
   * or null if no new frame is available.
   */
  getCurrentFrame(): TexImageSource | null;

  /** Whether a new frame is available since the last getCurrentFrame() call. */
  readonly hasNewFrame: boolean;

  /** Clean up resources (close VideoFrames, release decoder, etc.) */
  destroy(): void;
}
```

The existing `MediaNode` already implements this shape implicitly:

| Adapter method | Current equivalent |
|---|---|
| `seek(t)` | `_element.currentTime = t` |
| `play(rate)` | `_element.playbackRate = rate; _element.play()` |
| `pause()` | `_element.pause()` |
| `getCurrentFrame()` | `_element` (the video element itself is the TexImageSource) |
| `hasNewFrame` | `_hasNewFrame` (gated by rVFC) |
| `destroy()` | `_unload()` |

## WebCodecs Implementation (Not Yet)

A `WebCodecsFrameSource` implementing this interface would:

1. Use `fetch()` + demuxer (e.g. mp4box.js) to get encoded chunks
2. Feed chunks to a `VideoDecoder`
3. Hold the latest decoded `VideoFrame` as the current frame
4. Return `VideoFrame` from `getCurrentFrame()` (valid `texImage2D` source)
5. Call `.close()` on previous frames to release GPU memory

## Migration Path

1. Extract `FrameSource` interface from existing `MediaNode` behavior
2. Create `HTMLVideoFrameSource` wrapping current `<video>` + rVFC logic
3. Create `WebCodecsFrameSource` as an alternative
4. Let `MediaNode` (or a new node type) accept a `FrameSource` at construction
5. The engine's `updateTexture` call remains unchanged — it just receives the
   source from `getCurrentFrame()` instead of directly from `_element`

## Why Not Now

- WebCodecs support is still uneven across browser versions, platforms, and
  codecs; production use would require runtime `VideoDecoder.isConfigSupported()`
  checks
- The rVFC path already achieves frame-accurate uploads without redundancy
- Demuxing requires a third-party library (mp4box.js or similar)
- The current architecture works correctly — this is a performance/control upgrade
