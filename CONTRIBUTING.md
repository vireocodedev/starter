# Contributing to Vireo Starter

## Toolchain

- Node.js 24.15 or newer
- npm 12 (the exact supported version is recorded in `package.json`)
- Java 21

Enable Corepack when available, then install the frontend workspace with
`npm ci`. GitHub Packages requires `NODE_AUTH_TOKEN` with `read:packages`.

## Development gate

Run the same complete cross-language gate used for release review:

```bash
npm run verify:all
```

Frontend-only work may iterate with `npm run verify -- silent`; JVM-only work
may iterate with `./jvm/gradlew -p jvm build aggregateJavadoc`.

Public API changes require updated surface snapshots and the appropriate
Changeset or JVM version bump. Follow the package-authoring documentation under
`docs/package-authoring/` and add tests and live documentation with the change.

## Pull requests

- Keep commits focused and preserve unrelated worktree changes.
- Describe user-visible behavior and verification performed.
- Do not commit credentials, generated build output, or local caches.
- Obtain review before merging to `main`.
