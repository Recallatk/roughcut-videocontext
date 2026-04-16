//Matthew Shotton, R&D User Experience,© BBC 2015
import MediaNode from "./medianode";

const TYPE = "AudioNode";
class AudioNode extends MediaNode {
    /**
     * Initialise an instance of an AudioNode.
     * This should not be called directly, but created through a call to videoContext.audio();
     */
    constructor(
        src: any,
        gl: WebGLRenderingContext | null,
        renderGraph: any,
        currentTime: number,
        globalPlaybackRate?: number,
        sourceOffset?: number,
        preloadTime?: number,
        mediaElementCache?: any,
        attributes?: Record<string, any>
    ) {
        super(
            src,
            gl,
            renderGraph,
            currentTime,
            globalPlaybackRate,
            sourceOffset,
            preloadTime,
            mediaElementCache,
            attributes
        );
        this._displayName = TYPE;
        this._elementType = "audio";
    }

    _update(currentTime: number): boolean {
        super._update(currentTime, false);
        return true;
    }
}

export { TYPE as AUDIOTYPE };

export default AudioNode;
