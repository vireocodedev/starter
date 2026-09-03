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
  builds current and version-scoped search feeds, fingerprints executable assets,
  emits the manifest/service worker, and validates internal links.
- `content/snapshots/<friendly-version>.json` is a compact Brotli archive of the
  rendered article records, navigation, provenance, and federated documentation/API
  search entries for every retained line. The build emits all retained `/docs/<version>/`
  routes from those archives; it verifies the current archive still matches source.
- `verify.mjs` prevents content, link, maturity, canonical-host, route-count, and
  release-version drift.

The generated `site.json` is the machine-readable public summary. `versions.json`
maps friendly Vireo documentation lines to exact CLI/npm/JVM/Template snapshots,
and `search-index.json` covers every canonical content page. Each versioned route
uses `/docs/<version>/search-index.json`, whose documentation links stay under that
versioned URL. The site never hardcodes an independent package-version table.

## Documentation ownership

User education belongs on the main website. Package and repository READMEs retain
a short installation/entry summary and point to the canonical guide. Contributor,
release, evidence, and deep implementation material may remain repository-owned.

Storybook owns interactive component states. Generated TypeScript and Java pages
own exhaustive signatures. Neither replaces explanatory website content.

The current alias is `/docs/`; the friendly snapshot is `/docs/0.3/`. Exact
reference snapshots keep the independent machine release identifier used by the
GitHub Pages portal.

## Offline website and release workflow

The documentation website is intentionally an offline-capable static PWA. After
one successful load, its generated worker precaches same-origin pages, versioned
search indexes, and local assets. It does not cache external links, the demo, or
arbitrary network responses. A new worker waits for existing pages to close; the
site never forces activation or reload.

For a documentation release, first publish the exact framework/Template policy,
then add the friendly version and generate `content/snapshots/<version>.json` with
`corepack npm run site:snapshot`. For a reviewed change to the current snapshot,
update the Markdown/manifest and regenerate that archive in the same review. Do
not rewrite a retained historical archive to hide drift: release a new documentation
version when the public meaning has changed. Static deployment serves HTML, manifests, workers, search metadata,
and asset metadata with `no-cache`; content-addressed CSS/JS may be cached
immutably.

The checked-in Caddy matchers make fingerprinted CSS/JS and mutable assets
mutually exclusive. Verify final response headers on the deployment host with the
installed Caddy binary and an HTTPS request; local source checks cannot prove host
configuration or intermediary-cache behavior.
Future changes to this Caddyfile are a privileged host change: review the diff and
rerun the root installer (or an equivalently reviewed manual host procedure) so it
validates, reloads, and restores the prior site fragment on failure.

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

## VPS continuous deployment

The checked-in `Caddyfile` serves release directories through the atomic
`/srv/www/vireocode/current` symlink. One privileged host setup is required. On
the VPS, from a reviewed checkout, install the forced-command receiver with the
dedicated GitHub deployment public key:

```bash
sudo sh site/install-vps-cd.sh deploy /path/to/github-website-deploy.pub
```

The receiver accepts only `status`, bounded digest-checked `upload`, and typed
`stage`, `activate`, `accept`, or `rollback` verbs. Its authorized key is forced
to `/usr/local/libexec/vireo-website-receiver`; no CI job receives a shell. The
root-owned controller validates the repository, commit, archive, and embedded
revision proof, serializes mutations, atomically switches the symlink, and keeps
the accepted and rollback releases only.

Before enabling CI, create protected `website-deployment` with the declared secret
and variables in `.github/environments/website-deployment.live-assertions.json`.
The `website.yml` main build downloads its own verified artifact, produces a
deterministic bounded envelope, verifies public `/healthz`, routes, security
headers, and `/.well-known/vireo-deployment.json`, then accepts or rolls back the
exact transaction. Legacy direct SSH scripts now fail closed.

If a runner is interrupted after staging or activation, the scheduled protected
reconciliation job rolls back that old exact-run pending transaction to its last
accepted (including legacy) target; it does not build or deploy new bytes. A manual
**Build Vireo website** dispatch from `main` is safe for an already accepted
content identity, but never clears a different pending transaction. On its first
use, the controller records an existing `current` symlink as a legacy rollback
predecessor; a failed first qualification restores that symlink before any cleanup.
Incoming archives are short-lived, bounded, and copied into a root-private
controller snapshot by exact byte count before validation; trailing or truncated
uploads are rejected. The deployment proof's `siteDigest` is SHA-256 over compact
UTF-8 JSON of sorted `[printable-ASCII path, file SHA-256]` pairs, excluding the
proof itself. CI never receives a shell or site credentials.
