# @vireocodedev/starter

Shared frontend libraries for the vireocodedev **starter** product. npm workspaces
monorepo; each library under `packages/*` is published to **GitHub Packages** under
the `@vireocodedev` scope.

## Packages

| Package                                                       | Description                                               |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| [`@vireocodedev/starter-localization`](packages/localization) | Foundation i18n toolkit + shared `platform` translations. |

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

## Release (Changesets)

1. `npx changeset` — describe the change and pick the semver bump per package.
2. Merge to `main`. The **Release** workflow opens a "Version Packages" PR.
3. Merge that PR → the workflow builds and publishes to GitHub Packages.

Versioning is a contract per package: **adding** a key/locale is a minor,
**removing/renaming** one is a major. Contract tests guard the surfaces.

> First-time setup: run `npm install` once and commit the generated
> `package-lock.json` so CI's `npm ci` has a lockfile.
