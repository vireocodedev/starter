# Ecosystem release contract

[`contracts/ecosystem-release-contract.json`](../contracts/ecosystem-release-contract.json) is the machine-owned identity for the current Vireo product line. It records product and repository identities, exact npm and Maven artifacts, the CLI-to-Template pin, supported compatibility sets, local and hosted gates, release channels, support-line status, and the policy files that own evidence freshness and public-beta qualification.

Artifact versions remain independent. A compatibility set is an admitted combination, not a requirement that every `@vireocodedev/*` package share one version. The current set is public alpha; beta remains `HOLD` until the external evidence policy passes.

Run the semantic contract check after changing a package version, JVM version, Template pin, documentation release, attestation subject, toolchain, workflow job, or support line:

```bash
corepack npm run ecosystem:check
```

The check compares relationships rather than searching for version tokens. It rejects drift between package manifests, Gradle properties, `create-vireo`, documentation releases, attestation scope, platform policy, and hosted gate jobs. Downstream Doctor, projection, documentation, upgrade, and release tooling should consume this contract instead of introducing a new current-version map.
