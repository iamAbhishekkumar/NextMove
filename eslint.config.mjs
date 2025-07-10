// eslint.config.mjs

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FlatCompat helps bridge old-style ESLint config (extends/plugins/rules)
// into the new "flat" config system.
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Import rules from Next.js defaults (core vitals + TypeScript)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Optional: Add overrides or custom rules here
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json", // optional if using type-aware rules
      },
    },
    rules: {
      // Customize strictness as needed
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-empty-interface": "off", // turn off empty interface warning
      "@typescript-eslint/no-explicit-any": "warn", // or "error" based on your style
    },
  },
];

export default eslintConfig;
