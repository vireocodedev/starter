---
"@vireocodedev/starter-ui": major
"@vireocodedev/starter-core": minor
---

Absorb `@rgo/front-ui` into `starter-ui`.

The whole `@rgo/front-ui` source tree now lives in this package: the `Rgo*`
inputs, tables, layout, feedback and data-display components, the `useRgo*`
hooks, the providers (`RgoProviders`, theme/localization/query-client/snackbar/
confirm/icons), the `RgoLocalStorageService` / `RgoOfflineCacheService` /
`RgoWebWorkerService` services, the `axios` / `@tanstack/react-query` /
`i18next` / `@hello-pangea/dnd` / `tseep` feature adapters, and the `utils`
modules. Every former `@rgo/front-ui` export is re-exported from the
`@vireocodedev/starter-ui` barrel under the same name, and the unbundled `dist`
keeps the same subpath layout — `@rgo/front-ui/utils/apiutils` becomes
`@vireocodedev/starter-ui/utils/apiutils`.

**Breaking:** the package now requires the peers front-ui used to own —
`@emotion/react`, `@emotion/styled`, `@tanstack/react-query`, `axios`,
`i18next`, `react-i18next` and `zod` — and drops the `@rgo/front-ui` peer.
Consumers no longer need the `@rgo` registry routed in `.npmrc`.

Storybook moves across with the source: 70 stories and the documentation MDX
now build from this package (`npm run storybook`).

One latent type error surfaced in the move: `RgoTablePagination` passed
i18next's reserved `count` interpolation as a string. It is now passed as the
number i18next expects; the rendered output is unchanged. front-ui never caught
this because its `typecheck` script resolved to a project with no input files.

`starter-core` follows: it imports `RgoIcon` and augments the icon registry
through `@vireocodedev/starter-ui` instead, and drops `@rgo/front-ui` entirely.
