# @vireocodedev/starter-localization

Framework-free localization resources and tooling shared by the Starter
packages. It is the single owner of the `platform`, `queryengine`, and `history`
i18next namespaces.

The package owns translation resources, namespace constants, resource
factories, imperative registration, deep-merge utilities, and locale-neutral
number formatting. It deliberately does not own React hooks, providers,
i18next initialization, locale detection, persistence, or application locale
policy.

The package has no React dependency and is safe to load in Node and Web Workers.
React consumers import namespace hooks from
`@vireocodedev/starter-ui/react-i18next`.

## Install

Published to GitHub Packages under the `@vireocodedev` scope. Configure the
scope and authenticate with a token that has `read:packages`:

```ini
@vireocodedev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @vireocodedev/starter-localization i18next react-i18next
```

`i18next` is the only peer dependency. The package runs against the consuming
application's instance and never bundles its own copy.

## Primary workflow

Create every Starter namespace for the locales your app supports, add the
application's own namespace, then pass the combined resources to an app-owned
i18next instance:

```ts
import { createStarterResources } from "@vireocodedev/starter-localization";
import { createInstance } from "i18next";

const locales = ["en", "hr"] as const;
const starterResources = createStarterResources({ locales });
const resources = {
  en: { app: { home: { title: "Overview" } }, ...starterResources.en },
  hr: { app: { home: { title: "Pregled" } }, ...starterResources.hr },
};

const i18next = createInstance();
await i18next.init({
  defaultNS: "app",
  initAsync: false,
  lng: "hr",
  fallbackLng: "en",
  resources,
});
```

Locales not shipped by Starter are seeded from English by default. Partial
overrides are deeply merged, so untranslated keys retain the seed value. Set
`seedFrom: "hr"` to use Croatian as the seed instead.

Every generated locale owns an isolated resource tree. Mutating one result does
not mutate the shipped base resources or another locale.

## Registering resources after initialization

Use `registerStarterResources` when an initialized instance needs the resources
later in its lifecycle:

```ts
import { registerStarterResources } from "@vireocodedev/starter-localization";

registerStarterResources(i18next, {
  locales: ["en", "hr"],
});
```

The function registers every Starter namespace. Per-namespace factories remain
available when a consumer intentionally needs only one namespace.

## React consumption

React adapters belong to Starter UI. In a React application, install
`initReactI18next` on the same app-owned instance **before its single call to
`init`**, then expose that instance through `I18nextProvider`; Starter UI's
hooks read that provider:

```tsx
import type { PropsWithChildren } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { usePlatformTranslation } from "@vireocodedev/starter-ui/react-i18next";

const reactI18next = createInstance();
void reactI18next.use(initReactI18next).init({
  defaultNS: "app",
  fallbackLng: "en",
  initAsync: false,
  lng: "en",
  resources,
});

export function AppLocalizationProvider({ children }: PropsWithChildren) {
  return <I18nextProvider i18n={reactI18next}>{children}</I18nextProvider>;
}

export function SaveButton() {
  const { t } = usePlatformTranslation();
  return <button>{t("common.save")}</button>;
}
```

`useQueryEngineTranslation` and `useHistoryTranslation` are available from the
same UI subpath. This package itself remains usable without React.

## Type safety

Augment i18next with the exported namespace resource types for strict keys and
autocomplete:

```ts
import type { HistoryResources, PlatformResources, QueryEngineResources } from "@vireocodedev/starter-localization";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      platform: PlatformResources;
      queryengine: QueryEngineResources;
      history: HistoryResources;
    };
  }
}
```

## Public API

| Export                                                                      | Purpose                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `createStarterResources`                                                    | Build every Starter namespace for requested locales.                |
| `registerStarterResources`                                                  | Register every namespace on a caller-owned i18next instance.        |
| `createPlatformResources`                                                   | Build only the `platform` namespace.                                |
| `createQueryEngineResources`                                                | Build only the `queryengine` namespace.                             |
| `createHistoryResources`                                                    | Build only the `history` namespace.                                 |
| `STARTER_TRANSLATION_NAMESPACES`, `STARTER_BASE_LOCALES`                    | Shipped namespace and locale contracts.                             |
| `*_TRANSLATION_NAMESPACE`, `*_BASE_LOCALES`                                 | Per-namespace constants.                                            |
| `platformBaseResources`, `queryEngineBaseResources`, `historyBaseResources` | Shipped resource maps.                                              |
| `createNamespaceResources`                                                  | Build a complete custom namespace from shipped seeds and overrides. |
| `deepMerge`                                                                 | Immutable, prototype-safe merge used by resource factories.         |
| `formatIntlNumber`                                                          | Format a number with caller-owned locale and fallback policy.       |
| Resource/configuration utility types                                        | Type namespace shapes, overrides, and custom factories.             |

## Failure and versioning policy

Resource factories reject blank namespaces, empty locale sets, blank or
duplicate locale identifiers, missing seed locales, and overrides targeting a
locale that was not requested. Prototype-mutating override keys are ignored.

Translation keys and base locales are versioned contracts:

- adding a key, namespace, or locale is a minor release;
- renaming/removing a key or dropping a base locale is breaking;
- changing a shipped translation value is reviewed as user-visible behavior.

Explicit contract tests guard namespace keys and locale parity.

## Live documentation

The shared Vireo Starter Storybook contains the package's executable primary
workflow, late-registration path, custom-namespace toolkit, number formatting,
and failure semantics. Every displayed example imports this package through its
published entry point, is typechecked with the package, and executes from the
same source shown to readers.

## Scripts

- `npm run build` — build the ESM runtime and bundled declarations.
- `npm run typecheck` — typecheck source and tests without emitting.
- `npm run test` — run behavior, workflow, resource-contract, and architecture tests.
