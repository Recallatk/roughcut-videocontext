jest.mock("../../src/videoelementcacheitem.js", () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            element: {
                play: jest.fn(() => Promise.resolve()),
                pause: jest.fn()
            },
            isPlaying: jest.fn(() => false)
        }))
    };
});

import VideoElementCache from "../../src/videoelementcache.js";

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

const createCacheItem = ({ isPlaying = false, playImpl = () => Promise.resolve() } = {}) => {
    return {
        element: {
            play: jest.fn(playImpl),
            pause: jest.fn()
        },
        isPlaying: jest.fn(() => isPlaying)
    };
};

describe("VideoElementCache", () => {
    it("should ignore AbortError rejections during cache warmup", async () => {
        const cache = new VideoElementCache(0);
        const abortError = new Error("play() was interrupted");
        abortError.name = "AbortError";
        const cacheItem = createCacheItem({
            playImpl: () => Promise.reject(abortError)
        });

        cache._cacheItems = [cacheItem];

        expect(() => cache.init()).not.toThrow();

        await flushPromises();

        expect(cacheItem.element.play).toHaveBeenCalledTimes(1);
        expect(cacheItem.element.pause).not.toHaveBeenCalled();
        expect(cache._cacheItemsInitialised).toBe(true);
    });

    it("should pause warmed elements that are not linked to a playing node", async () => {
        const cache = new VideoElementCache(0);
        const cacheItem = createCacheItem();

        cache._cacheItems = [cacheItem];
        cache.init();

        await flushPromises();

        expect(cacheItem.element.play).toHaveBeenCalledTimes(1);
        expect(cacheItem.element.pause).toHaveBeenCalledTimes(1);
    });

    it("should not pause warmed elements linked to playing nodes", async () => {
        const cache = new VideoElementCache(0);
        const cacheItem = createCacheItem({ isPlaying: true });

        cache._cacheItems = [cacheItem];
        cache.init();

        await flushPromises();

        expect(cacheItem.element.play).toHaveBeenCalledTimes(1);
        expect(cacheItem.element.pause).not.toHaveBeenCalled();
    });
});
