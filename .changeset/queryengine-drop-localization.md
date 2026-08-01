---
"@vireocodedev/starter-queryengine": major
---

**Breaking:** the `queryengine` translation namespace moved to
`@vireocodedev/starter-localization`.

`useQueryEngineTranslation`, `createQueryEngineResources`,
`queryEngineBaseResources`, `QUERYENGINE_TRANSLATION_NAMESPACE` and the
`QueryEngineResources` types are no longer exported from this package — import
them from `@vireocodedev/starter-localization` instead. Translation keys are
unchanged, so only import specifiers need updating.

`i18next` and `react-i18next` are no longer peer dependencies, and the package
no longer depends on `@vireocodedev/starter-localization`.
