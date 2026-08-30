# Vireo website

This directory owns the Vireo Framework product and documentation website served
from `https://vireocode.com`. It is the canonical home for task-oriented guides,
concepts, examples, project versions, roadmap, and community entry points.

The GitHub Pages artifact remains the exact-release host for interactive Storybook,
generated TypeScript exports, aggregate Javadocs, and historical machine snapshots.

## Source and version contract

- `site-policy.json` owns product-site copy boundaries, canonical URL, maturity,
  and public destinations.
- `../contracts/documentation-release-policy.json` owns current npm, JVM, source,
  template, compatibility, exact-release, and friendly documentation versions.
- `content/manifest.json` owns information architecture, navigation, canonical
  routes, summaries, source provenance, and the content-version declaration.
- `content/*.md` is the canonical user-guide source migrated from framework and
  Template repository documentation.
- `app.mjs` contains the React-rendered documentation and product UI.
- `markdown.mjs` renders the trusted source Markdown without client execution.
- `build.mjs` pre-renders current and version-specific routes into `site/dist`,
  builds search/version feeds and validates internal links.
- `verify.mjs` prevents content, link, maturity, canonical-host, route-count, and
  release-version drift.

The generated `site.json` is the machine-readable public summary. `versions.json`
maps friendly Vireo documentation lines to exact CLI/npm/JVM/Template snapshots,
and `search-index.json` covers every canonical content page. The site never
hardcodes an independent package-version table.

## Documentation ownership

User education belongs on the main website. Package and repository READMEs retain
a short installation/entry summary and point to the canonical guide. Contributor,
release, evidence, and deep implementation material may remain repository-owned.

Storybook owns interactive component states. Generated TypeScript and Java pages
own exhaustive signatures. Neither replaces explanatory website content.

The current alias is `/docs/`; the friendly snapshot is `/docs/0.3/`. Exact
reference snapshots keep the independent machine release identifier used by the
GitHub Pages portal.

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
