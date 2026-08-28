# Vireo website

This directory owns the standalone Vireo Framework product website served from
`https://vireocode.com`. It is deliberately separate from the versioned
documentation artifact published at `https://vireocodedev.github.io/starter`.

## Source and version contract

- `site-policy.json` owns product-site copy boundaries, canonical URL, maturity,
  and public destinations.
- `../contracts/documentation-release-policy.json` owns current npm, JVM, source,
  compatibility, and documentation release information.
- `build.mjs` combines those sources into `site/dist`.
- `verify.mjs` prevents link, maturity, canonical-host, and release-version drift.

The generated `site.json` is the machine-readable public summary. The site never
hardcodes an independent package-version table.

## Local build

```bash
corepack npm run site:check
corepack npm run site:build
corepack npm run site:check:artifact
```

Serve `site/dist` with any static server. For example:

```bash
python3 -m http.server 4173 --directory site/dist
```

## Hosted build

The `website.yml` workflow validates and builds the standalone artifact on every
relevant `main` change. It uploads the exact static output for inspection and VPS
deployment; it does not replace or deploy through GitHub Pages.

## VPS activation

The checked-in `Caddyfile` serves release directories through the atomic
`/srv/www/vireocode/current` symlink. One privileged host setup is required.
Build and stage the first release from the development machine:

```bash
corepack npm run site:build
corepack npm run site:check:artifact
corepack npm run site:stage:vps
```

The staging command prints one `sudo sh .../bootstrap-vps.sh ...` command to run
on the VPS. That reviewed bootstrap creates `/srv/www/vireocode` and its release
directory as `deploy`, activates the staged release, installs the Caddy site,
validates the complete Caddy configuration, and reloads Caddy. It leaves the
staged copy in `/tmp` for inspection and eventual system cleanup.

After that one-time setup, deployments do not require root:

```bash
corepack npm run site:build
corepack npm run site:check:artifact
corepack npm run site:deploy:vps
```

The deploy script uploads a new revision-and-time directory and atomically switches
the `current` symlink. It intentionally does not delete older releases; retention
must be added only with a reviewed rollback policy.
