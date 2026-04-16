import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/videocontext.js"),
            name: "VideoContext",
            formats: ["umd", "es"],
            fileName: (format) => (format === "es" ? "videocontext.esm.js" : "videocontext.js"),
        },
        sourcemap: true,
        rollupOptions: {
            // no external deps — bundle everything
        },
    },
    plugins: [
        // Inline .frag and .vert shader files as raw strings
        {
            name: "glsl-raw",
            transform(src, id) {
                if (id.endsWith(".frag") || id.endsWith(".vert")) {
                    return { code: `export default ${JSON.stringify(src)};`, map: null };
                }
            },
        },
    ],
    test: {
        globals: true,
        environment: "jsdom",
        include: ["test/unit/**/*.{spec,test}.js", "test/integration/**/*.{spec,test}.js"],
        coverage: {
            provider: "v8",
            include: ["src/**/*.js"],
        },
        // Vitest handles .frag/.vert natively via the glsl-raw plugin above
    },
});
