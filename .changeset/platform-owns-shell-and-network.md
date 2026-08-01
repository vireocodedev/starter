---
"@vireocodedev/starter-localization": minor
"@vireocodedev/starter-core": minor
---

Move the offline/network vocabulary and the app-shell accessibility labels into the `platform` namespace, and resolve them inside `starter-core` via `usePlatformTranslation`.

`starter-core`'s shell previously called `t("common.skipToMainContent")`, `t("common.mainNavigation")`, `t("common.closeNavigation")`, `t("common.collapse")`, `t("common.expand")`, `t("common.bottomNavigation")` and `t("common.loading")` through the app-injected `runtime.i18n.t`. Those keys were declared nowhere, so a consumer that did not happen to define them rendered raw key strings in its navigation landmarks and mobile bottom navigation. They now ship with `platform` and are resolved by the package itself.

`platform.network` additionally gained the full offline-queue and sync-command vocabulary (status, queue state, and the `OfflineSyncCommandRecord` column labels), so consumers no longer need to author it.

App-supplied nav entry labels, breadcrumbs and control labels still resolve through `runtime.i18n.t` — that contract is unchanged.
