# Third-party license policy

Vireo blocks release candidates unless every resolved third-party dependency in the published npm and JVM graphs has an allowed license or an active, owned review exception. The machine-readable policy is [`contracts/third-party-license-policy.json`](../../contracts/third-party-license-policy.json).

## Scope and decisions

- **Allowed** licenses pass and carry their recorded notice/source obligations into the inventory.
- **Review** licenses fail unless an exception pins the ecosystem, package, version, and exact detected license declarations. Exceptions require an accountable owner, tracking reference, rationale, accepted obligations, and future expiry.
- **Denied** and unknown licenses always fail. An exception cannot override them.
- `OR` expressions take the least restrictive classified option; `AND` expressions take the most restrictive option. Multiple independent SBOM declarations are treated as alternatives because CycloneDX uses that representation for dual licensing.

The npm inventory starts at every public workspace in the ecosystem release contract, follows exact `package-lock.json` `dependencies` and `optionalDependencies`, and records direct and transitive packages. Peer dependencies are not included because they are selected and installed by the consumer rather than shipped in the package's release dependency graph.

The JVM inventory starts at every public Java library module except the dependency-only BOM and traverses the aggregate CycloneDX graph produced from the consumer compile/runtime configurations. That intentionally includes API-visible dependencies as well as runtime dependencies; build plugins and test-only dependencies are outside the release graph.

## Release gate and evidence

Run the checks locally with:

```sh
corepack npm run license:check:npm
corepack npm run license:check:jvm
corepack npm run license:test
```

The fast gate checks the npm graph. The full gate and Maven workflow check the JVM graph. Release-evidence generation checks both graphs again and writes `licenses/third-party-license-inventory.json`, which is hashed into the release manifest beside both CycloneDX SBOMs. A dependency update, new license spelling, missing license, expired exception, or graph-resolution failure blocks the relevant gate.

This engineering classification supports release controls; it is not legal advice. The security owner must involve counsel before accepting a new reciprocal, source-available, custom, or ambiguous license.

## Reviewed JVM exceptions

The current exceptions cover unmodified runtime/specification artifacts whose upstream metadata selects EPL, LGPL, or GPL with the Classpath Exception: Logback, Jakarta Annotation, Jakarta Transaction, and AspectJ Weaver. Their exact coordinates, accepted obligations, owners, and expiry dates live in the policy contract. Renewals require a new review before expiry; version or license drift never inherits an old approval.
