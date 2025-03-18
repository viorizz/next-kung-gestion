// eslint.config.mjs
import { fileURLToPath } from "url";
import path from "path";
import nextPlugin from "@next/eslint-plugin-next";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    plugins: {
      next: nextPlugin,
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    extends: [
      "eslint:recommended",
      "plugin:next/recommended",
    ],
  },
];