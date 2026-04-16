import js from "@eslint/js";
import globals from "globals";

export default [
    // Base recommended rules
    js.configs.recommended,

    // Source and test files
    {
        files: ["src/**/*.js", "test/**/*.js"],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.es2024,
                ...globals.node,
                ...globals.jest
            }
        },
        rules: {
            // Formatting rules are owned by Prettier — ESLint handles logic only
            "linebreak-style": ["error", "unix"],
            "quotes": ["error", "double", { "allowTemplateLiterals": true }],
            "semi": ["error", "always"],
            "no-console": 0
        }
    },

    // Global ignores (replaces .eslintignore)
    {
        ignores: ["node_modules/**", "dist/**", "playwright-report/**", "test-results/**"]
    }
];
