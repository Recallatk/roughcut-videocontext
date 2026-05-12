import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "test/e2e",
    testMatch: "**/*.spec.js",

    // Per-test timeout: video seeking + playback can be slow
    timeout: 60000,

    // Retry flaky tests in CI
    retries: process.env.CI ? 2 : 0,

    // WebGL + SwiftShader cannot reliably share a single GPU across workers
    workers: 1,

    use: {
        baseURL: "http://localhost:3001",
        // Match Cypress macbook-11 viewport
        viewport: { width: 1366, height: 768 }
    },

    // Chrome only — matches the original Cypress Chrome-only setup
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                // SwiftShader provides software WebGL in headless Chrome
                launchOptions: {
                    args: [
                        "--use-gl=swiftshader",
                        "--enable-webgl",
                        "--ignore-gpu-blacklist",
                        "--disable-gpu-sandbox"
                    ]
                }
            }
        }
    ],

    // Static file server serving the project root
    webServer: {
        command: "node_modules/.bin/serve . -l 3001 --no-clipboard",
        port: 3001,
        reuseExistingServer: !process.env.CI,
        timeout: 15000
    },

    // Default screenshot comparison thresholds (mirrors original Cypress defaults)
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.06,
            threshold: 0.1
        }
    }
});
