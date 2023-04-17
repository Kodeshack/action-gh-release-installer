/* eslint-disable */
// @ts-nocheck
module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    rules: {
        "prefer-const": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/ban-ts-comment": 0,

        "node/no-unpublished-import": 0,

        "node/file-extension-in-import": 0,
        "node/no-unsupported-features/es-syntax": 0,
    },
}
