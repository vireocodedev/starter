# Ecosystem release contract

[`contracts/ecosystem-release-contract.json`](../contracts/ecosystem-release-contract.json) is the machine-owned identity for the current Vireo product line. It records product and repository identities, exact npm and Maven artifacts, the CLI-to-Template pin, supported compatibility sets, local and hosted gates, release channels, support-line status, and the policy files that own evidence freshness and public-beta qualification.

Artifact versions remain independent. A compatibility set is an admitted combination, not a requirement that every `@vireocodedev/*` package share one version. The current set is public alpha; beta remains `HOLD` until the external evidence policy passes.

Run the semantic contract check after changing a package version, JVM version, Template pin, documentation release, attestation subject, toolchain, workflow job, or support line:

```bash
corepack npm run ecosystem:check
```

The check compares relationships rather than searching for version tokens. It rejects drift between package manifests, Gradle properties, `create-vireo`, documentation releases, attestation scope, platform policy, and hosted gate jobs. Downstream Doctor, projection, documentation, upgrade, and release tooling should consume this contract instead of introducing a new current-version map.

For coordinated publication, the immutable Template release comes first, followed
by the exact Maven release and anonymous six-coordinate Maven consumer proof. Only
then may npm publication be dispatched and approved. The protected npm verify job
derives this Maven prerequisite from `current.maven.version` in this contract, so a
missing or mismatched Maven publication blocks npm publication but never blocks a
release pull-request merge.

Execute the declared gates through `corepack npm run gate:fast`, `corepack npm run
gate:full`, or `corepack npm run gate:release`. The same manifest owns each gate's
shell-free invocation, required tool classes, evidence subjects, hosted workflow
job, and hosted command. The release gate validates registry state, runs the merge
gate against packed candidates, and generates the uploadable candidate evidence.
