---
"@vireocodedev/starter-localization": major
"@vireocodedev/starter-ui": patch
---

Complete the Localization package audit with accurately widened resource types,
literal namespace preservation, portable source imports, strict locale
configuration validation, translation-value and interpolation integrity
contracts, and comprehensive executable documentation in the shared Vireo
Starter Storybook.

Remove the redundant `PlatformResourcesShape`, `QueryEngineResourcesShape`, and
`HistoryResourcesShape` aliases; their correctly widened `*Resources` types are
now the single source of truth.
