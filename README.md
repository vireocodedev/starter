# @vireocodedev/starter

Shared frontend libraries for the vireocodedev **starter** product. npm workspaces
monorepo; each library under `packages/*` is published to **GitHub Packages** under
the `@vireocodedev` scope.

## Packages

| Package                                                           | Version | Description                                                                                                                                             |
| ----------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@vireocodedev/starter-ui`](packages/ui)                         | 2.1.0   | MUI-based component library: responsive cards, mobile tables, overlays, providers, hooks, formatters.                                                   |
| [`@vireocodedev/starter-queryengine`](packages/queryengine)       | 1.1.0   | Framework-agnostic query engine client (models, api, react-query, signals) for server-driven filtering/sorting/paging.                                  |
| [`@vireocodedev/starter-core`](packages/core)                     | 0.9.0   | App-shell framework: config/sitemap/routing scaffolding, route guards, the responsive shell + navigation, and layout presets.                           |
| [`@vireocodedev/starter-localization`](packages/localization)     | 0.8.0   | Foundation i18n toolkit + shared `platform` translations.                                                                                               |
| [`@vireocodedev/starter-sqlite`](packages/sqlite)                 | 0.5.0   | SQLite worker/client runtime primitives for offline persistence (OPFS).                                                                                 |
| [`@vireocodedev/starter-history`](packages/history)               | 0.4.0   | Framework-agnostic entity history engine (diff/build/render definitions) and generic history models.                                                    |
| [`@vireocodedev/starter-infrastructure`](packages/infrastructure) | 0.4.0   | Frontend infrastructure utilities: network status, persistent signals, date/array helpers, session-expiry events, axios helpers, tanstack query client. |

Versions above are the currently published ones; `packages/*/package.json` is the source of truth.

### Dependency graph

Only two packages depend on siblings — the rest are leaves and can be consumed on their own:

```txt
core  ->  ui, localization, infrastructure
ui    ->  history, localization

history · localization · infrastructure · queryengine · sqlite   (no starter dependencies)
```

## Prerequisites

Working with (or installing) these packages requires a GitHub token with
`read:packages` (and `write:packages` to publish). The scope is wired to GitHub
Packages via [`.npmrc`](.npmrc); provide the token as `NODE_AUTH_TOKEN`:

```bash
export NODE_AUTH_TOKEN=<github-token>
```

## Develop

```bash
npm install            # installs all workspaces, generates package-lock.json
npm run typecheck
npm run test
npm run build
```

`npm run dev` watches every package. Note that watch mode never deletes from
`dist` — deleting or renaming a source file leaves its old output behind, so take
a one-shot `npm run build` whenever a file disappears.

To try a change in a consuming app before publishing it, that app aliases the
package specifiers to these `dist` directories. The consumer side of that loop —
including why the aliases redirect the runtime but not the types — is documented
in the leather-production repository under `docs/STARTER_WORKFLOW.md`.

## Release (Changesets)

1. `npx changeset` — describe the change and pick the semver bump per package.
2. Merge to `main`. The **Release** workflow opens a "Version Packages" PR.
3. Merge that PR → the workflow builds and publishes to GitHub Packages.

Versioning is a contract per package:

| Change                                                | Bump  |
| ----------------------------------------------------- | ----- |
| Adding an export, component, prop, i18n key or locale | minor |
| Removing or renaming any of the above                 | major |
| Widening a peer dependency range                      | minor |
| Raising a peer dependency floor                       | major |
| Behaviour-preserving fixes and internal refactors     | patch |

Contract tests guard the surfaces, so a change that breaks a contract fails CI
until the bump is made deliberately rather than by accident.

> First-time setup: run `npm install` once and commit the generated
> `package-lock.json` so CI's `npm ci` has a lockfile.
