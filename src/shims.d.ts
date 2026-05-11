/**
 * Type shims for non-standard module types and global augmentations.
 * These are needed as src files are migrated to TypeScript.
 */

// GLSL shader files — imported as raw strings by the Vite glsl-raw plugin
declare module "*.frag" {
    const src: string;
    export default src;
}

declare module "*.vert" {
    const src: string;
    export default src;
}

// requestVideoFrameCallback — not yet in the default lib types
interface VideoFrameCallbackMetadata {
    presentationTime: DOMHighResTimeStamp;
    expectedDisplayTime: DOMHighResTimeStamp;
    width: number;
    height: number;
    mediaTime: number;
    presentedFrames: number;
    processingDuration?: number;
    captureTime?: DOMHighResTimeStamp;
    receiveTime?: DOMHighResTimeStamp;
    rtpTimestamp?: number;
}

interface HTMLVideoElement {
    requestVideoFrameCallback(
        callback: (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => void
    ): number;
    cancelVideoFrameCallback(handle: number): void;
}

// VideoContext registers itself on window for debug tooling
interface Window {
    __VIDEOCONTEXT_REFS__: Record<string, unknown>;
}
