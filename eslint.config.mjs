import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/storybook-static/**",
      "**/*.mdx",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: [
      "packages/*/{src,tests}/**/*.{ts,tsx}",
      "packages/*/.storybook/**/*.{ts,tsx}",
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/useMediaQueryDevice"],
              message:
                "Use useResponsiveProps for viewport variants. Use useAppPageContentLayout for container-width variants.",
            },
          ],
        },
      ],
    },
  },
  {
    // Stories and Storybook helpers are documentation, not shipped code.
    files: [
      "packages/*/src/**/*.stories.{ts,tsx}",
      "packages/*/src/**/stories/**/*.{ts,tsx}",
      "packages/*/src/utils/storybookutils.tsx",
      "packages/*/.storybook/**/*.{ts,tsx}",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // The public barrel deliberately re-exports every hook, including the
    // ones application code is steered away from importing directly.
    files: ["packages/*/src/index.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["packages/*/tests/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.node,
    },
  },
);
