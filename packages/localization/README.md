# @vireocodedev/starter-localization

Foundation i18n toolkit and **the single home for every `@vireocodedev` shared
translation** in the **starter** product.

It owns three i18next namespaces — `platform` (generic UI: `common`, `network`,
`pwa`), `queryengine` (filter builder / dev tools) and `history` (entity history
views) — and exports the reusable utilities (`createStarterResources`,
`createNamespaceResources`, `deepMerge`, types) that other `starter` libraries
build on.

Other starter packages (`starter-ui`, `starter-queryengine`, `starter-shell`) do
**not** ship translations; they depend on this package for both resources and
namespace hooks. App consumers therefore wire i18n once and inherit every shared
string instead of restating it.

This package does **not** initialize i18next, own a provider, or manage locale
persistence — those stay in the consuming app. It contributes typed resources,
namespace hooks, and merge utilities to a single, app-owned i18next instance.

## Install

Published to **GitHub Packages** under the `@vireocodedev` scope. Point the scope
at the GitHub registry (e.g. in the consuming project's `.npmrc`) and authenticate
with a token that has `read:packages`:

```ini
# .npmrc
@vireocodedev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @vireocodedev/starter-localization
```

`i18next`, `react-i18next`, and `react` are **peer dependencies** — the package
must run against the app's single i18next instance, never a bundled copy. When
linking locally, dedupe those in your bundler (e.g. Vite `resolve.dedupe`).

## Quick start

Build **every** starter namespace for the locales your app supports and spread
one object per locale into the resources you pass to i18next:

```ts
import { createStarterResources } from "@vireocodedev/starter-localization";

const APP_LOCALES = ["en", "hr"] as const;

const starter = createStarterResources({ locales: APP_LOCALES });

const resources = {
  en: { translation: appEn, ...starter.en }, // { platform, queryengine, history }
  hr: { translation: appHr, ...starter.hr },
};
```

Adding a new starter namespace later is a zero-diff change in your app.
Per-namespace factories (`createPlatformResources`, `createQueryEngineResources`,
`createHistoryResources`) remain available if you only want a subset.

Consume translations with the matching namespace hook:

```tsx
import { usePlatformTranslation } from "@vireocodedev/starter-localization";

function SaveButton() {
  const { t } = usePlatformTranslation();
  return <button>{t("common.save")}</button>;
}
```

## Overriding shipped values

Pass per-locale, per-namespace overrides. They are deep-merged over the shipped
base, so partial overrides never drop keys:

```ts
createStarterResources({
  locales: ["en", "hr"],
  overrides: {
    en: {
      platform: { common: { save: "Store" } },
      history: { title: "Audit trail" },
    },
  },
});
```

## Adding a new language

Locales the package does not ship are **seeded** from a base locale (`en` by
default), so every key is always present — untranslated keys fall back to the
seed until you translate them:

```ts
createStarterResources({
  locales: ["en", "hr", "de"],
  seedFrom: "en",
  overrides: {
    de: { platform: { common: { save: "Speichern", cancel: "Abbrechen" } } },
  },
});
```

For a fully robust setup, also set i18next `fallbackLng` to a base locale.

## Type safety

Augment i18next with the exported resource types so `t()` gets autocomplete and
strict key checks:

```ts
import type { HistoryResources, PlatformResources, QueryEngineResources } from "@vireocodedev/starter-localization";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      // ...your app namespace(s)
      platform: PlatformResources;
      queryengine: QueryEngineResources;
      history: HistoryResources;
    };
  }
}
```

## Public API

| Export                                                                                        | Purpose                                                              |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `createStarterResources({ locales, seedFrom?, overrides? })`                                  | Build every starter namespace per locale in one call.                |
| `registerStarterResources(i18n, config)`                                                      | Imperatively add every starter namespace to a live i18next instance. |
| `usePlatformTranslation()` / `useQueryEngineTranslation()` / `useHistoryTranslation()`        | `react-i18next` hooks bound to their namespace.                      |
| `createPlatformResources` / `createQueryEngineResources` / `createHistoryResources`           | Per-namespace resource builders.                                     |
| `STARTER_TRANSLATION_NAMESPACES`, `STARTER_BASE_LOCALES`                                      | The shipped namespace and locale sets.                               |
| `platformBaseResources`, `queryEngineBaseResources`, `historyBaseResources`                   | The shipped base resources.                                          |
| `PLATFORM_/QUERYENGINE_/HISTORY_TRANSLATION_NAMESPACE`                                        | The namespace strings.                                               |
| `createNamespaceResources`, `deepMerge`                                                       | Generic toolkit reused by other starter libraries.                   |
| `PlatformResources`, `QueryEngineResources`, `HistoryResources`, `DeepPartial`, `WidenLeaves` | Types.                                                               |

## Versioning contract

Every shipped key set is a contract:

- **Adding** a key, namespace or locale → minor release.
- **Renaming/removing** a key or dropping a base locale → major (breaking).

The contract test (`tests/starterLocalization.contract.test.ts`) guards the key
surface, namespace set and locale set against accidental changes.

## Scripts

- `npm run build` — Vite lib build → `dist/index.js` + bundled `dist/index.d.ts`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run test` — Vitest (contract test).

Internal imports use the package-scoped `@/*` alias (`tsconfig.json` `paths`
→ `./src/*`); the Vite build inlines them, so nothing but the public entry ships.
