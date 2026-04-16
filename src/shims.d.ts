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

// VideoContext registers itself on window for debug tooling
interface Window {
    __VIDEOCONTEXT_REFS__: Record<string, unknown>;
}
