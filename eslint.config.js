import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

const sharedRules = {
  "no-unused-vars": [
    "error",
    {
      varsIgnorePattern: "^[A-Z_]",
      argsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    },
  ],
};

export default defineConfig([
  globalIgnores([
    "dist",
    "coverage",
    "server/**",
    "node_modules",
  ]),
  {
    files: ["src/**/*.{js,jsx}"],
    extends: [js.configs.recommended],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      ...sharedRules,
    },
  },
  {
    files: ["functions/**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.serviceworker,
        File: "readonly",
      },
      parserOptions: { sourceType: "module" },
    },
    rules: sharedRules,
  },
  {
    files: ["src/**/__tests__/**/*.js", "functions/**/__tests__/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        fail: "readonly",
      },
    },
  },
  {
    files: ["functions/api/report/waitlist.js"],
    rules: {
      // SQL identifier quotes are assembled inside a template literal.
      "no-useless-escape": "off",
    },
  },
  {
    files: [
      "scripts/**/*.js",
      "scripts/**/*.mjs",
      "*.config.js",
    ],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
        ...globals.jest,
        fetch: "readonly",
        fail: "readonly",
      },
      parserOptions: { sourceType: "module" },
    },
    rules: sharedRules,
  },
]);
