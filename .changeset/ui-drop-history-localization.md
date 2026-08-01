---
"@vireocodedev/starter-ui": major
---

**Breaking:** the `history` translation namespace moved to
`@vireocodedev/starter-localization`.

`useHistoryTranslation`, `createHistoryResources`, `historyBaseResources`,
`HISTORY_TRANSLATION_NAMESPACE` and the `HistoryResources` types are no longer
exported from this package — import them from
`@vireocodedev/starter-localization` instead. Translation keys are unchanged, so
only import specifiers need updating.
