---
"@vireocodedev/starter-ui": major
---

Add the explicit `@vireocodedev/starter-ui/localization` entry point with `VireoTemporalLocalizationProvider`, scoped Day.js locale resolution, bundled English and Croatian picker text, regional fallback, and consumer overrides. Require this provider for `field.TemporalField` and add temporal locale support to `VireoStorybookProvider`.

Remove `RgoLocalizationProvider`, `configureI18nClient`, `RgoLocale`, the `rgo-ui` resources and ambient augmentation, `useTranslationLocal`, and the browser language-detector dependency. Applications now own i18next initialization and translation resources.
