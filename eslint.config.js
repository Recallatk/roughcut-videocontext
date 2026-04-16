import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    // Base recommended rules for all JS/TS files
    js.configs.recommended,

    // TypeScript-aware rules for .ts source files
    ...tseslint.configs.recommended,

    // JS source and test files
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
            quotes: ["error", "double", { allowTemplateLiterals: true }],
            semi: ["error", "always"],
            "no-console": 0
        }
    },

    // TypeScript source files
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.es2024
            }
        },
        rules: {
            // Formatting rules are owned by Prettier — ESLint handles logic only
            "linebreak-style": ["error", "unix"],
            semi: ["error", "always"],
            "no-console": 0,
            // Relax rules that conflict with the gradual migration approach
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-require-imports": "error"
        }
    },

    // Global ignores (replaces .eslintignore)
    {
        ignores: ["node_modules/**", "dist/**", "playwright-report/**", "test-results/**"]
    }
);
