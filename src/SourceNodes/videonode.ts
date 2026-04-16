//Matthew Shotton, R&D User Experience,© BBC 2015
import MediaNode from "./medianode";

const TYPE = "VideoNode";

class VideoNode extends MediaNode {
    /**
     * Initialise an instance of a VideoNode.
     * This should not be called directly, but created through a call to videoContext.createVideoNode();
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
        this._elementType = "video";
    }
}

export { TYPE as VIDEOTYPE };

export default VideoNode;
