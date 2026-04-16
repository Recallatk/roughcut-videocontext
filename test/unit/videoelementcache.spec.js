/**
 * Unit tests for VideoElementCacheItem and VideoElementCache (Phase 6d)
 *
 * Covers:
 * VideoElementCacheItem:
 * - _createElement sets required attributes (crossorigin, webkit-playsinline, playsinline)
 * - linkNode / unlinkNode round-trip
 * - isPlaying() returns true only when linked node state === SOURCENODESTATE.playing
 *
 * VideoElementCache:
 * - constructor populates _cacheItems to the requested size
 * - init() calls play() on each cached element and sets _cacheItemsInitialised
 * - init() suppresses AbortError and NotSupportedError from play()
 * - init() is idempotent — second call is a no-op
 * - getElementAndLinkToNode() returns a free element and links the node
 * - getElementAndLinkToNode() falls back to a new element when all slots are occupied
 * - unlinkNodeFromElement() clears the node link on the matching element
 * - length getter reflects cache size
 */
import "../../src/utils.js"; // bootstraps circular module graph
import { vi, describe, test, expect } from "vitest";
import "webgl-mock";
import VideoElementCacheItem from "../../src/videoelementcacheitem.js";
import VideoElementCache from "../../src/videoelementcache.js";
import { SOURCENODESTATE } from "../../src/SourceNodes/sourcenode.js";

global.window = global.window || {};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a fake media node in the given SOURCENODESTATE. */
function makeNode(state = SOURCENODESTATE.waiting) {
    return { _state: state };
}

/** Stub play() on an HTMLVideoElement so it returns a resolved Promise. */
function stubPlay(el) {
    el.play = vi.fn().mockResolvedValue(undefined);
    return el;
}

// ---------------------------------------------------------------------------
// VideoElementCacheItem
// ---------------------------------------------------------------------------

describe("VideoElementCacheItem", () => {
    describe("_createElement", () => {
        test("creates a <video> element", () => {
            const item = new VideoElementCacheItem();
            expect(item.element.tagName.toLowerCase()).toBe("video");
        });

        test("sets crossorigin attribute to 'anonymous'", () => {
            const item = new VideoElementCacheItem();
            expect(item.element.getAttribute("crossorigin")).toBe("anonymous");
        });

        test("sets webkit-playsinline attribute", () => {
            const item = new VideoElementCacheItem();
            expect(item.element.getAttribute("webkit-playsinline")).toBe("");
        });

        test("sets playsinline attribute", () => {
            const item = new VideoElementCacheItem();
            expect(item.element.getAttribute("playsinline")).toBe("");
        });
    });

    describe("linkNode / unlinkNode", () => {
        test("linkNode stores the node", () => {
            const item = new VideoElementCacheItem();
            const node = makeNode();
            item.linkNode(node);
            expect(item._node).toBe(node);
        });

        test("unlinkNode clears the node", () => {
            const item = new VideoElementCacheItem();
            item.linkNode(makeNode());
            item.unlinkNode();
            expect(item._node).toBeNull();
        });
    });

    describe("isPlaying()", () => {
        test("returns false when no node is linked", () => {
            const item = new VideoElementCacheItem();
            expect(item.isPlaying()).toBeFalsy();
        });

        test("returns false when linked node is in 'waiting' state", () => {
            const item = new VideoElementCacheItem();
            item.linkNode(makeNode(SOURCENODESTATE.waiting));
            expect(item.isPlaying()).toBe(false);
        });

        test("returns false when linked node is in 'paused' state", () => {
            const item = new VideoElementCacheItem();
            item.linkNode(makeNode(SOURCENODESTATE.paused));
            expect(item.isPlaying()).toBe(false);
        });

        test("returns true when linked node is in 'playing' state", () => {
            const item = new VideoElementCacheItem();
            item.linkNode(makeNode(SOURCENODESTATE.playing));
            expect(item.isPlaying()).toBe(true);
        });

        test("returns false when linked node is in 'ended' state", () => {
            const item = new VideoElementCacheItem();
            item.linkNode(makeNode(SOURCENODESTATE.ended));
            expect(item.isPlaying()).toBe(false);
        });
    });

    describe("element setter", () => {
        test("replaces the underlying element", () => {
            const item = new VideoElementCacheItem();
            const newEl = document.createElement("video");
            item.element = newEl;
            expect(item.element).toBe(newEl);
        });
    });
});

// ---------------------------------------------------------------------------
// VideoElementCache
// ---------------------------------------------------------------------------

describe("VideoElementCache", () => {
    describe("constructor", () => {
        test("creates the requested number of cache items (default 3)", () => {
            const cache = new VideoElementCache();
            expect(cache._cacheItems).toHaveLength(3);
            expect(cache.length).toBe(3);
        });

        test("respects a custom cache size", () => {
            const cache = new VideoElementCache(5);
            expect(cache.length).toBe(5);
        });

        test("_cacheItemsInitialised starts false", () => {
            const cache = new VideoElementCache();
            expect(cache._cacheItemsInitialised).toBe(false);
        });
    });

    describe("init()", () => {
        test("sets _cacheItemsInitialised to true", () => {
            const cache = new VideoElementCache(2);
            expect(cache._cacheItemsInitialised).toBe(false);
            cache.init();
            expect(cache._cacheItemsInitialised).toBe(true);
        });

        test("is idempotent — second call is a no-op", () => {
            const cache = new VideoElementCache(2);
            cache.init();
            cache.init(); // should not throw or mutate state further
            expect(cache._cacheItemsInitialised).toBe(true);
        });

        test("does not call play() on cached elements", () => {
            // play() on sourceless elements always rejects; calling it achieves
            // nothing and creates async noise. init() must not call it.
            const cache = new VideoElementCache(2);
            cache._cacheItems.forEach((item) => stubPlay(item.element));
            cache.init();
            cache._cacheItems.forEach((item) => {
                expect(item.element.play).not.toHaveBeenCalled();
            });
        });
    });

    describe("getElementAndLinkToNode()", () => {
        test("returns a video element", () => {
            const cache = new VideoElementCache(2);
            const el = cache.getElementAndLinkToNode(makeNode());
            expect(el.tagName.toLowerCase()).toBe("video");
        });

        test("links the node to the returned element's cache item", () => {
            const cache = new VideoElementCache(2);
            const node = makeNode();
            const el = cache.getElementAndLinkToNode(node);

            // Find the cache item that now holds the element
            const item = cache._cacheItems.find((ci) => ci.element === el);
            expect(item).toBeDefined();
            expect(item._node).toBe(node);
        });

        test("falls back to a new element when all slots are occupied", () => {
            const cache = new VideoElementCache(1);
            const nodeA = makeNode();
            const nodeB = makeNode();

            // First allocation occupies the only slot
            const elA = cache.getElementAndLinkToNode(nodeA);
            // Simulate the slot being occupied (give it a src)
            elA.src = "blob:video-a";

            const elB = cache.getElementAndLinkToNode(nodeB);

            // Fallback should have grown the cache
            expect(cache.length).toBe(2);
            expect(elB).not.toBe(elA);
        });

        test("resets _cacheItemsInitialised when fallback element is created", () => {
            const cache = new VideoElementCache(1);
            cache._cacheItemsInitialised = true;

            const existingEl = cache._cacheItems[0].element;
            existingEl.src = "blob:video-a"; // mark slot as occupied

            cache.getElementAndLinkToNode(makeNode());

            expect(cache._cacheItemsInitialised).toBe(false);
        });
    });

    describe("unlinkNodeFromElement()", () => {
        test("clears the node on the matching cache item", () => {
            const cache = new VideoElementCache(2);
            const node = makeNode();
            const el = cache.getElementAndLinkToNode(node);

            cache.unlinkNodeFromElement(el);

            const item = cache._cacheItems.find((ci) => ci.element === el);
            expect(item._node).toBeNull();
        });

        test("does not affect other cache items", () => {
            const cache = new VideoElementCache(2);
            const nodeA = makeNode();
            const nodeB = makeNode();

            const elA = cache.getElementAndLinkToNode(nodeA);
            elA.src = "blob:video-a";
            const elB = cache.getElementAndLinkToNode(nodeB);

            cache.unlinkNodeFromElement(elA);

            const itemB = cache._cacheItems.find((ci) => ci.element === elB);
            expect(itemB._node).toBe(nodeB);
        });
    });

    describe("length", () => {
        test("reflects the number of cache items", () => {
            const cache = new VideoElementCache(4);
            expect(cache.length).toBe(4);
        });
    });
});
