//Matthew Shotton, R&D User Experience,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode";

type DebugMetrics = {
    callbackCount: number;
    uploadCount: number;
    lastMediaTime: number;
    lastPresentedFrames: number;
    skippedFrames: number;
};

class MediaNode extends SourceNode {
    _preloadTime: number;
    _sourceOffset: number;
    _globalPlaybackRate: number;
    _mediaElementCache: any;
    _playbackRate: number;
    _playbackRateUpdated: boolean;
    _attributes: Record<string, any>;
    _loopElement: boolean;
    _isElementPlaying: boolean;
    _loadTriggered!: boolean;
    _elementType!: string;
    _hasNewFrame: boolean;
    _rvfcHandle: number | null;
    _debugMetrics!: DebugMetrics;

    /**
     * Initialise an instance of a MediaNode.
     * This should not be called directly, but extended by other Node Types which use a `HTMLMediaElement`.
     */
    constructor(
        src: any,
        gl: WebGLRenderingContext | null,
        renderGraph: any,
        currentTime: number,
        globalPlaybackRate = 1.0,
        sourceOffset = 0,
        preloadTime = 4,
        mediaElementCache: any = undefined,
        attributes = {}
    ) {
        super(src, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._sourceOffset = sourceOffset;
        this._globalPlaybackRate = globalPlaybackRate;
        this._mediaElementCache = mediaElementCache;
        this._playbackRate = 1.0;
        this._playbackRateUpdated = true;
        this._attributes = Object.assign({ volume: 1.0 }, attributes);
        this._loopElement = false;
        this._isElementPlaying = false;
        this._hasNewFrame = true;
        this._rvfcHandle = null;
        this._resetDebugMetrics();
        if (this._attributes.loop) {
            this._loopElement = this._attributes.loop;
        }
    }

    set playbackRate(playbackRate) {
        this._playbackRate = playbackRate;
        this._playbackRateUpdated = true;
    }

    set stretchPaused(stretchPaused) {
        super.stretchPaused = stretchPaused;
        if (this._element) {
            if (this._stretchPaused) {
                this._element.pause();
            } else {
                if (this._state === SOURCENODESTATE.playing) {
                    this._element.play().catch((e: any) => {
                        if (e.name === "AbortError") return;
                        // Resume failed (e.g. NotAllowedError) — mark as not playing
                        // so the next update can retry or the caller can intervene.
                        console.debug("MediaNode stretchPaused resume failed:", e);
                        this._isElementPlaying = false;
                    });
                }
            }
        }
    }

    get stretchPaused() {
        return this._stretchPaused;
    }

    get playbackRate() {
        return this._playbackRate;
    }

    get elementURL() {
        return this._elementURL;
    }

    /**
     * @property {Boolean}
     * @summary - Check if the element is waiting on the network to continue playback
     */

    get _buffering() {
        if (this._element) {
            return this._element.readyState < HTMLMediaElement.HAVE_FUTURE_DATA;
        }

        return false;
    }

    set volume(volume: number) {
        this._attributes.volume = volume;
        if (this._element !== undefined) this._element.volume = this._attributes.volume;
    }

    _triggerLoad() {
        // If the user hasn't supplied an element, videocontext is responsible for the element
        if (this._isResponsibleForElementLifeCycle) {
            if (this._mediaElementCache) {
                /**
                 * Get a cached video element and also pass this instance so the
                 * cache can access the current play state.
                 */
                this._element = this._mediaElementCache.getElementAndLinkToNode(this);
            } else {
                this._element = document.createElement(this._elementType);
                this._element.setAttribute("crossorigin", "anonymous");
                this._element.setAttribute("webkit-playsinline", "");
                this._element.setAttribute("playsinline", "");
                this._playbackRateUpdated = true;
            }
            this._element.volume = this._attributes.volume;
            if (window.MediaStream !== undefined && this._elementURL instanceof MediaStream) {
                this._element.srcObject = this._elementURL;
            } else {
                this._element.src = this._elementURL;
            }
        }
        // at this stage either the user or the element cache should have provided an element
        if (this._element) {
            for (const key in this._attributes) {
                this._element[key] = this._attributes[key];
            }

            let currentTimeOffset = 0;
            if (this._currentTime > this._startTime)
                currentTimeOffset = this._currentTime - this._startTime;
            this._element.currentTime = this._sourceOffset + currentTimeOffset;
            this._element.onerror = () => {
                if (this._element === undefined) return;
                console.debug("Error with element", this._element);
                this._state = SOURCENODESTATE.error;
                //Event though there's an error ready should be set to true so the node can output transparenn
                this._ready = true;
                this._triggerCallbacks("error");
            };
        } else {
            // If the element doesn't exist for whatever reason enter the error state.
            this._state = SOURCENODESTATE.error;
            this._ready = true;
            this._triggerCallbacks("error");
        }

        this._loadTriggered = true;
    }

    /**
     * _load has two functions:
     *
     * 1. `_triggerLoad` which ensures the element has the correct src and is at the correct currentTime,
     *     so that the browser can start fetching media.
     *
     * 2.  `shouldPollForElementReadyState` waits until the element has a "readState" that signals there
     *     is enough media to start playback. This is a little confusing as currently structured.
     *     We're using the _update loop to poll the _load function which checks the element status.
     *     When ready we fire off the "loaded callback"
     *
     */

    _load() {
        super._load();

        /**
         * We've got to be careful here as _load is called many times whilst waiting for the element to buffer
         * and this function should only be called once.
         * This is step one in what should be a more thorough refactor
         */
        if (!this._loadTriggered) {
            this._triggerLoad();
        }

        const shouldPollForElementReadyState = this._element !== undefined;
        /**
         * this expression is effectively polling the element, waiting for it to buffer
         * it gets called a lot of time
         */
        if (shouldPollForElementReadyState) {
            if (this._element.readyState > 3 && !this._element.seeking) {
                // at this point the element has enough data for current playback position
                // and at least a couple of frames into the future

                // Check if the duration has changed. Update if necessary.
                // this could potentially go in the normal update loop but I don't want to change
                // too many things at once
                if (this._loopElement === false) {
                    if (this._stopTime === Infinity || this._stopTime == undefined) {
                        this._stopTime = this._startTime + this._element.duration;
                        this._triggerCallbacks("durationchange", this.duration);
                    }
                }

                // signal to user that this node has "loaded"
                if (this._ready !== true) {
                    this._triggerCallbacks("loaded");
                    this._playbackRateUpdated = true;
                }

                this._ready = true;
            } else {
                if (this._state !== SOURCENODESTATE.error) {
                    this._ready = false;
                }
            }
        }
    }

    _cancelVideoFrameCallback() {
        if (this._rvfcHandle !== null && this._element) {
            this._element.cancelVideoFrameCallback(this._rvfcHandle);
        }
        this._rvfcHandle = null;
    }

    _canUseVideoFrameCallback() {
        const isMediaStreamSource =
            typeof MediaStream !== "undefined" &&
            (this._elementURL instanceof MediaStream ||
                this._element?.srcObject instanceof MediaStream);

        return (
            this._elementType === "video" &&
            !isMediaStreamSource &&
            this._element !== undefined &&
            typeof this._element.requestVideoFrameCallback === "function" &&
            typeof this._element.cancelVideoFrameCallback === "function"
        );
    }

    _registerVideoFrameCallback() {
        this._usesVideoFrameCallback = this._canUseVideoFrameCallback();
        if (!this._usesVideoFrameCallback || this._rvfcHandle !== null) {
            return;
        }
        this._rvfcHandle = this._element.requestVideoFrameCallback(
            (_now: number, metadata: { mediaTime: number; presentedFrames: number }) => {
                this._hasNewFrame = true;
                this._rvfcHandle = null;

                // Track debug metrics from rVFC metadata
                this._debugMetrics.callbackCount++;
                const prevPresented = this._debugMetrics.lastPresentedFrames;
                this._debugMetrics.lastMediaTime = metadata.mediaTime;
                this._debugMetrics.lastPresentedFrames = metadata.presentedFrames;
                if (prevPresented > 0 && metadata.presentedFrames > prevPresented + 1) {
                    this._debugMetrics.skippedFrames +=
                        metadata.presentedFrames - prevPresented - 1;
                }

                // Re-register for the next frame while still playing
                if (this._state === SOURCENODESTATE.playing) {
                    this._registerVideoFrameCallback();
                }
            }
        );
    }

    _resetDebugMetrics() {
        this._debugMetrics = {
            callbackCount: 0,
            uploadCount: 0,
            lastMediaTime: -1,
            lastPresentedFrames: 0,
            skippedFrames: 0
        };
    }

    _unload() {
        this._cancelVideoFrameCallback();
        super._unload();
        if (this._isResponsibleForElementLifeCycle && this._element !== undefined) {
            this._element.removeAttribute("src");
            this._element.srcObject = undefined;
            this._element.load();
            for (const key in this._attributes) {
                this._element.removeAttribute(key);
            }
            // Unlink this form the cache, freeing up the element for another media node
            if (this._mediaElementCache)
                this._mediaElementCache.unlinkNodeFromElement(this._element);
            this._element = undefined;
            if (!this._mediaElementCache) delete this._element;
        }
        // reset class to initial state
        this._ready = false;
        this._isElementPlaying = false;
        this._hasNewFrame = true;
        this._usesVideoFrameCallback = false;
        this._resetDebugMetrics();
        // For completeness. I couldn't find a path that required reuse of this._loadTriggered after _unload.
        this._loadTriggered = false;
    }

    _seek(time: number) {
        this._cancelVideoFrameCallback();
        this._hasNewFrame = true;
        super._seek(time);
        if (this.state === SOURCENODESTATE.playing || this.state === SOURCENODESTATE.paused) {
            if (this._element === undefined) this._load();
            const relativeTime = this._currentTime - this._startTime + this._sourceOffset;
            this._element.currentTime = relativeTime;
            this._ready = false;
            if (this.state === SOURCENODESTATE.playing) this._registerVideoFrameCallback();
        }
        if (
            (this._state === SOURCENODESTATE.sequenced || this._state === SOURCENODESTATE.ended) &&
            this._element !== undefined
        ) {
            this._unload();
        }
    }

    _update(currentTime: number, triggerTextureUpdate = true) {
        super._update(currentTime, triggerTextureUpdate);
        // super._update resets _textureChanged at entry, then sets it true on
        // upload (updateTexture) or clear (clearTexture). We only count uploads:
        // updateTexture sets _textureIsCleared = false, clearTexture sets it true.
        if (this._textureChanged && !this._textureIsCleared) {
            this._debugMetrics.uploadCount++;
        }
        //check if the media has ended
        if (this._element !== undefined) {
            if (this._element.ended) {
                this._state = SOURCENODESTATE.ended;
                this._triggerCallbacks("ended");
            }
        }

        if (
            this._startTime - this._currentTime <= this._preloadTime &&
            this._state !== SOURCENODESTATE.waiting &&
            this._state !== SOURCENODESTATE.ended
        )
            this._load();

        if (this._state === SOURCENODESTATE.playing) {
            if (this._playbackRateUpdated) {
                this._element.playbackRate = this._globalPlaybackRate * this._playbackRate;
                this._playbackRateUpdated = false;
            }
            if (!this._isElementPlaying) {
                this._isElementPlaying = true; // set optimistically to prevent double-call
                this._registerVideoFrameCallback();
                this._element.play().catch((e: any) => {
                    // Always reset the flag — either we retry (AbortError) or we enter
                    // the error state.  Never leave _isElementPlaying stuck true.
                    this._cancelVideoFrameCallback();
                    this._isElementPlaying = false;
                    if (e.name === "AbortError") {
                        // Interrupted by a concurrent seek/pause — will retry next update
                        return;
                    }
                    // Any other error (NotAllowedError, NotSupportedError, network, …)
                    // is permanent for this play attempt.  Enter the error state and
                    // notify listeners so the application can react.
                    console.debug("MediaNode play() failed:", e);
                    this._state = SOURCENODESTATE.error;
                    this._ready = true;
                    this._triggerCallbacks("error");
                });
                if (this._stretchPaused) {
                    this._element.pause();
                }
            }
            return true;
        } else if (this._state === SOURCENODESTATE.paused) {
            this._cancelVideoFrameCallback();
            this._element.pause();
            this._isElementPlaying = false;
            return true;
        } else if (this._state === SOURCENODESTATE.ended && this._element !== undefined) {
            this._element.pause();
            if (this._isElementPlaying) {
                this._unload();
            }
            return false;
        }
        return false;
    }

    clearTimelineState() {
        super.clearTimelineState();
        if (this._element !== undefined) {
            this._element.pause();
            this._isElementPlaying = false;
        }
        this._unload();
    }

    destroy() {
        this._cancelVideoFrameCallback();
        if (this._element) this._element.pause();
        super.destroy();
    }
}

export default MediaNode;
