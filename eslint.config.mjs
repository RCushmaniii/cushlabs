import eslintPluginAstro from "eslint-plugin-astro";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default [
  // Astro (flat config)
  ...eslintPluginAstro.configs["flat/recommended"],

  // Astro-aware a11y extensions (requires eslint-plugin-jsx-a11y)
  ...eslintPluginAstro.configs["flat/jsx-a11y-recommended"],

  // Make sure formatting rules don't fight Prettier
  prettier,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      "jsx-a11y/label-has-associated-control": [
        "error",
        {
          assert: "either",
        },
      ],
      "jsx-a11y/control-has-associated-label": "error",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/tabindex-no-positive": "error",

      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",

      "no-alert": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      "jsx-a11y/label-has-associated-control": [
        "error",
        {
          assert: "either",
        },
      ],
      "jsx-a11y/control-has-associated-label": "error",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/tabindex-no-positive": "error",

      "no-alert": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  {
    ignores: ["dist/", ".astro/", "node_modules/", "public/", "nextjs-react-agency-starter/"],
  },
];
