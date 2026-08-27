# Contributing to Vireo Starter

## Toolchain

- Node.js 24.15 or newer
- npm 12 (the exact supported version is recorded in `package.json`)
- Java 21

Enable Corepack when available, then install the frontend workspace with
`corepack npm ci`. Corepack reads the exact npm version from `package.json`; the
Starter workspace itself does not require a package-read token.

## Development gate

Run the same complete cross-language gate used for release review:

```bash
corepack npm run verify:all
```

Frontend-only work may iterate with `corepack npm run verify -- silent`; JVM-only work
may iterate with `./jvm/gradlew -p jvm build aggregateJavadoc`.

Public API changes require updated surface snapshots and the appropriate
Changeset or JVM version bump. Follow the package-authoring documentation under
`docs/package-authoring/` and add tests and live documentation with the change.
Public-contract changes must follow [the compatibility and deprecation
policy](docs/COMPATIBILITY.md). Use the structured issue forms and the routing in
[SUPPORT.md](SUPPORT.md) before proposing a substantial change.

## Pull requests

- Keep commits focused and preserve unrelated worktree changes.
- Describe user-visible behavior and verification performed.
- Classify every new or changed async visual surface under the loading-state standard, declare its geometry level, and include the applicable canonical stories or documented omissions.
- Do not commit credentials, generated build output, or local caches.
- Obtain review before merging to `main`.

Maintainers make final merge and release decisions under
[GOVERNANCE.md](GOVERNANCE.md). Contributions do not imply a response or delivery
commitment.
