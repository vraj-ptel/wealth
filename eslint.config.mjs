import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-wrapper-object-types":"off",
      "@typescript-eslint/no-unnecessary-type-constraint":"off",
      "@typescript-eslint/no-unsafe-function-types":"off",
      "@typescript-eslint/no-non-null-asserted-optional-chain":"off",
      "@typescript-eslint/no-unsafe-function-types":"off",

      "react/no-unstable-nested-components": "off",
      "react/no-unknown-property": "off",
      "react/no-unescaped-entities": "off",

      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/no-unknown-property": "off",

      "react/no-unstable-nested-components": "off",
      "react/no-unknown-property": "off",

      "react/no-unescaped-entities": "off",
    },
  },
  {
    // Disable all TypeScript rules globally
    files: ["**/*"],
    rules: {
      "@typescript-eslint/*": "off",
    },
  },
];

export default eslintConfig;
