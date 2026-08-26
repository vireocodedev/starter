# Package portability contract

Vireo packages are built and tested as registry-independent artifacts. A
consumer selects its approved registry and authentication mechanism outside the
dependency declaration; package documentation therefore uses ordinary package
names and does not bake a registry hostname or token into installation steps.

## TypeScript consumers

The supported declaration-consumer baseline is checked from extracted npm
tarballs with TypeScript 6, `skipLibCheck: false`, and this resolver shape:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2022"
  }
}
```

Applications may use equivalent modern bundler configurations. A successful
source-workspace typecheck is not accepted as package evidence: every declared
entry point must compile from an isolated consumer after the real tarballs are
extracted. Non-UI packages are also imported through native Node ESM, and UI
entry points are bundled through Vite.

Imports are supported only through package entry points declared in `exports`.
Paths visible beneath `dist` are implementation details unless an export maps
them explicitly.

## Source maps

The six Vite-bundled framework packages publish version 3 JavaScript source maps
with embedded source content. This is an explicit debugging and production
diagnostics feature for an open-source codebase. Published map sources must be
relative and the complete tarball remains subject to credential, private-key,
and absolute-workstation-path scanning.

Starter UI deliberately does not publish source maps. It emits JavaScript and
declarations file-for-file and is already the largest npm artifact; publishing
maps would substantially duplicate its public source without improving its
entry-point contract.

The machine-readable decision lives in
`contracts/package-portability-policy.json` and is enforced by
`corepack npm run release:smoke` against the packed artifacts.

## Distribution changes

Changing a registry, trusted-publishing provider, signing service, or release
channel must not require source-code import changes. Registry migration is a
release operation: verify coordinate ownership, update publication metadata and
CI credentials, then rerun the artifact, isolated-consumer, provenance, and
rollback gates before publishing.
