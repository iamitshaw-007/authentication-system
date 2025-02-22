import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    { files: ["src/**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.browser } },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        ignores: [
            "node_modules/*",
            "dist/*",
            "config/**/*.{ts,js,json}",
            "*.config.{ts,js,json}",
        ],
    },
    {
        rules: {
            quotes: ["error", "double", { allowTemplateLiterals: true }],
            "arrow-body-style": "warn",
            curly: "error",
            "dot-notation": "off",
            eqeqeq: ["error", "smart"],
            "id-match": "error",
            "max-len": [
                "error",
                {
                    code: 200,
                },
            ],
            "no-bitwise": "warn",
            "no-console": [
                "warn",
                {
                    allow: [
                        "warn",
                        "dir",
                        "timeLog",
                        "assert",
                        "clear",
                        "count",
                        "countReset",
                        "group",
                        "groupEnd",
                        "table",
                        "dirxml",
                        "error",
                        "groupCollapsed",
                        "Console",
                        "profile",
                        "profileEnd",
                        "timeStamp",
                        "context",
                    ],
                },
            ],
            "no-debugger": "error",
            "no-empty": "error",
            "no-empty-function": "error",
            "no-eval": "error",
            "no-fallthrough": "error",
            "no-redeclare": "error",
            "no-shadow": "off",
            "no-underscore-dangle": "off",
            "no-unused-expressions": "off",
            "no-unused-vars": "off",
            "no-var": "error",
            "prefer-const": "error",
            radix: "error",
            "spaced-comment": [
                "error",
                "always",
                {
                    markers: ["/"],
                },
            ],
        },
    },
];
