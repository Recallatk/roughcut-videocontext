import VideoElementCacheItem from "./videoelementcacheitem";
import { mediaElementHasSource } from "./utils";

const BENIGN_PLAY_ERRORS = ["AbortError", "NotAllowedError", "NotSupportedError"];

function isBenignPlayError(error) {
    return error !== undefined && error !== null && BENIGN_PLAY_ERRORS.indexOf(error.name) !== -1;
}

class VideoElementCache {
    constructor(cache_size = 3) {
        this._cacheItems = [];
        this._cacheItemsInitialised = false;
        for (let i = 0; i < cache_size; i++) {
            // Create a video element and cache
            this._cacheItems.push(new VideoElementCacheItem());
        }
    }

    init() {
        if (!this._cacheItemsInitialised) {
            for (let cacheItem of this._cacheItems) {
                try {
                    const playPromise = cacheItem.element.play();

                    if (
                        playPromise !== undefined &&
                        playPromise !== null &&
                        typeof playPromise.then === "function"
                    ) {
                        playPromise.then(
                            () => {
                                // Pause any elements not in the "playing" state
                                if (!cacheItem.isPlaying()) {
                                    cacheItem.element.pause();
                                }
                            },
                            e => {
                                if (!isBenignPlayError(e)) throw e;
                            }
                        );
                    }
                } catch (e) {
                    // Keep cache warmup best-effort for browsers which throw synchronously.
                    if (isBenignPlayError(e)) continue;
                    continue;
                }
            }
        }
        this._cacheItemsInitialised = true;
    }

    /**
     * Find and return an empty initialised element or, if the cache is
     * empty, create a new one.
     *
     * @param {Object} mediaNode A `MediaNode` instance
     */
    getElementAndLinkToNode(mediaNode) {
        // Try and get an already intialised element.
        for (let cacheItem of this._cacheItems) {
            // For some reason an uninitialised videoElement has its sr attribute set to the windows href. Hence the below check.
            if (!mediaElementHasSource(cacheItem.element)) {
                // attach node to the element
                cacheItem.linkNode(mediaNode);
                return cacheItem.element;
            }
        }
        // Fallback to creating a new element if none exist or are available
        console.debug(
            "No available video element in the cache, creating a new one. This may break mobile, make your initial cache larger."
        );
        let cacheItem = new VideoElementCacheItem(mediaNode);
        this._cacheItems.push(cacheItem);
        this._cacheItemsInitialised = false;
        return cacheItem.element;
    }

    /**
     * Unlink any media node currently linked to a cached video element.
     *
     * @param {VideoElement} element The element to unlink from any media nodes
     */
    unlinkNodeFromElement(element) {
        for (let cacheItem of this._cacheItems) {
            // Unlink the node from the element
            if (element === cacheItem._element) {
                cacheItem.unlinkNode();
            }
        }
    }

    get length() {
        return this._cacheItems.length;
    }

    get unused() {
        let count = 0;
        for (let cacheItem of this._cacheItems) {
            // For some reason an uninitialised videoElement has its sr attribute set to the windows href. Hence the below check.
            if (!mediaElementHasSource(cacheItem.element)) count += 1;
        }
        return count;
    }
}

export default VideoElementCache;
