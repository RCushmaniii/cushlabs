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

  {
    files: ["**/*.astro"],
    rules: {
      // Scope this rule to handlers that are actually *interactions*. Its default
      // handler list includes onLoad and onError, which are lifecycle events — so a
      // plain `<img onload="...">` driving a shimmer placeholder was reported as an
      // accessibility error. Keyboard/pointer handlers on non-interactive elements
      // are still caught, which is the behaviour worth having.
      "astro/jsx-a11y/no-noninteractive-element-interactions": [
        "error",
        {
          handlers: [
            "onClick",
            "onMouseDown",
            "onMouseUp",
            "onKeyPress",
            "onKeyDown",
            "onKeyUp",
          ],
        },
      ],
    },
  },

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

  // CLI / build scripts use console as their legitimate output channel.
  {
    files: ["scripts/**"],
    rules: {
      "no-console": "off",

      // These scripts consume the GitHub API through Octokit, whose generated types
      // declare fields like `stargazers_count`, `pushed_at`, and `archived` as always
      // present. The API omits them depending on endpoint, permissions, and repo
      // visibility — so the `?? 0` / `?? ""` fallbacks the rule calls "unnecessary" are
      // the only thing keeping `undefined` out of projects.generated.json.
      //
      // Deleting a guard because a type promised it could not fire is precisely how
      // this repo shipped `thumbnail: null` to production in April. The types are
      // wrong here; the guards stay.
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },

  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      "public/",
      "nextjs-react-agency-starter/",
    ],
  },
];
