---
"@vireocodedev/starter-ui": patch
---

Fix documentation drift and add a contract test that prevents it recurring.

A new `docsContract` test parses every `import ... from "@vireocodedev/starter-ui"` in the `.mdx` docs and in the
Storybook code samples, and asserts the symbol is actually exported from the package barrel. It found eleven defects,
all now corrected:

- `RgoSseProvider` was documented as a provider but has never existed — the real API is the `useRgoSseEmitter` hook. The
  option table was already accurate and has been kept.
- `RgoInitializable` was documented in nine places; the component is named `RgoInitializeProvider`.
- `useSnackbar` was documented as a starter-ui export; toasts moved to sonner, so the example now uses `toast`.
- `useTranslation` was documented as a starter-ui export; it comes from `react-i18next`.
- `useTheme` was documented as a starter-ui export with a `{ toggleTheme, isDarkMode }` return that never existed. It is
  MUI's hook, and `RgoThemeProvider` does not manage colour mode — the dark-theme example now shows the real pattern.
- `I18nTranslationFn` was referenced in four story samples; the exported type is `RgoTranslationFn`.
- `RgoTabPanel` was shown as an import in the `useRgoTabs` example, but it is module-private; the example now uses the
  `TabPanel` returned by the hook.
- The `RgoTablePagination` code sample was missing the commas in its import statement.
- A `storybookutils` JSDoc example imported a nonexistent `Provider`.
