---
"@vireocodedev/starter-localization": minor
---

Own every shared `@vireocodedev` translation namespace.

The `queryengine` and `history` namespaces moved here from
`@vireocodedev/starter-queryengine` and `@vireocodedev/starter-ui`, so a single
package now ships all common strings and app consumers no longer restate them.

Added:

- `createStarterResources({ locales, seedFrom?, overrides? })` — builds every
  starter namespace for every requested locale in one call, with per-namespace
  deep-merged overrides.
- `registerStarterResources(i18n, config)` — imperative equivalent.
- `createQueryEngineResources`, `createHistoryResources`,
  `useQueryEngineTranslation`, `useHistoryTranslation`,
  `queryEngineBaseResources`, `historyBaseResources`,
  `QUERYENGINE_TRANSLATION_NAMESPACE`, `HISTORY_TRANSLATION_NAMESPACE`, and the
  `QueryEngineResources` / `HistoryResources` type families.
- `STARTER_TRANSLATION_NAMESPACES`, `STARTER_BASE_LOCALES`.

No translation key changed, so `t()` call sites are unaffected.
`registerPlatformResources` is deprecated in favour of
`registerStarterResources`.
