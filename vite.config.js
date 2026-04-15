import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/videocontext.js"),
            name: "VideoContext",
            formats: ["umd", "es"],
            fileName: (format) => format === "es" ? "videocontext.esm.js" : "videocontext.js"
        },
        sourcemap: true,
        rollupOptions: {
            // no external deps — bundle everything
        }
    },
    assetsInclude: ["**/*.frag", "**/*.vert"],
    plugins: [
        // Inline .frag and .vert shader files as raw strings
        {
            name: "glsl-raw",
            transform(src, id) {
                if (id.endsWith(".frag") || id.endsWith(".vert")) {
                    return { code: `export default ${JSON.stringify(src)};`, map: null };
                }
            }
        }
    ]
});
