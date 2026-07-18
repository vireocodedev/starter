# @vireocodedev/starter-localization

Foundation i18n toolkit and shared **platform** translations for the vireocodedev
**starter** product.

It owns the generic UI strings (`common`, `network`, `pwa`) under the `platform`
i18next namespace and exports the reusable utilities (`createPlatformResources`,
`createNamespaceResources`, `deepMerge`, types) that other `starter` libraries
build on.

This package does **not** initialize i18next, own a provider, or manage locale
persistence — those stay in the consuming app. It contributes typed resources, a
namespace hook, and merge utilities to a single, app-owned i18next instance.

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

Build the platform resources for the locales your app supports and merge them
into the object you pass to i18next:

```ts
import { createPlatformResources } from "@vireocodedev/starter-localization";

const APP_LOCALES = ["en", "hr"] as const;

const platform = createPlatformResources({ locales: APP_LOCALES });

const resources = {
  en: { translation: appEn, ...platform.en }, // { platform: {...} }
  hr: { translation: appHr, ...platform.hr },
};
```

Consume translations with the namespace hook:

```tsx
import { usePlatformTranslation } from "@vireocodedev/starter-localization";

function SaveButton() {
  const { t } = usePlatformTranslation();
  return <button>{t("common.save")}</button>;
}
```

## Overriding shipped values

Pass per-locale overrides. They are deep-merged over the shipped base, so partial
overrides never drop keys:

```ts
createPlatformResources({
  locales: ["en", "hr"],
  overrides: {
    en: { common: { save: "Store" } },
  },
});
```

## Adding a new language

Locales the package does not ship are **seeded** from a base locale (`en` by
default), so every key is always present — untranslated keys fall back to the
seed until you translate them:

```ts
createPlatformResources({
  locales: ["en", "hr", "de"],
  seedFrom: "en",
  overrides: {
    de: { common: { save: "Speichern", cancel: "Abbrechen" } },
  },
});
```

For a fully robust setup, also set i18next `fallbackLng` to a base locale.

## Type safety

Augment i18next with the exported resource type so `t()` gets autocomplete and
strict key checks:

```ts
import type { PlatformResources } from "@vireocodedev/starter-localization";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      // ...your app namespace(s)
      platform: PlatformResources;
    };
  }
}
```

## Public API

| Export                                                                         | Purpose                                                              |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `usePlatformTranslation()`                                                     | `react-i18next` hook bound to the `platform` namespace.              |
| `createPlatformResources({ locales, seedFrom?, overrides? })`                  | Build fully-populated platform resources per locale.                 |
| `registerPlatformResources(i18n, config)`                                      | Imperatively add platform resources to an existing i18next instance. |
| `platformBaseResources`, `PLATFORM_BASE_LOCALES`                               | The shipped base resources and locales.                              |
| `PLATFORM_TRANSLATION_NAMESPACE`                                               | The namespace string (`"platform"`).                                 |
| `createNamespaceResources`, `deepMerge`                                        | Generic toolkit reused by other starter libraries.                   |
| `PlatformResources`, `PlatformResourcesOverride`, `DeepPartial`, `WidenLeaves` | Types.                                                               |

## Versioning contract

The platform key set is a contract:

- **Adding** a key or locale → minor release.
- **Renaming/removing** a key or dropping a base locale → major (breaking).

The contract test (`tests/platformLocalization.contract.test.ts`) guards the key
surface and locale set against accidental changes.

## Scripts

- `npm run build` — Vite lib build → `dist/index.js` + bundled `dist/index.d.ts`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run test` — Vitest (contract test).

Internal imports use the package-scoped `@/*` alias (`tsconfig.json` `paths`
→ `./src/*`); the Vite build inlines them, so nothing but the public entry ships.
