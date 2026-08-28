# Current platform support

The machine-readable contract in
[`contracts/platform-support-policy.json`](../contracts/platform-support-policy.json)
is the current public-alpha support matrix. It narrows the broader Phase 0 target to
what Vireo can evidence today. A row is called **supported** only when a required
automated lane exists at the stated cadence.

- **Supported** failures block merge or release while evidence is current.
- **Compatible** rows run advisory recurring suites but do not carry the same release
  obligation.
- **Experimental** rows are opt-in and may change during the `0.x` line.
- **Untested** rows make no compatibility promise; manual evidence is a prerequisite
  for promotion, not evidence that already exists.

## Enforced matrix

| Policy row                  | Current status | Evidence requirement | Cadence   |
| --------------------------- | -------------- | -------------------- | --------- |
| `node-npm`                  | supported      | required             | merge     |
| `java-boot-gradle`          | supported      | required             | merge     |
| `frontend-stack`            | supported      | required             | merge     |
| `chromium-tab`              | supported      | required             | merge     |
| `postgresql`                | supported      | required             | scheduled |
| `h2-development`            | supported      | required             | merge     |
| `ubuntu-24-x64`             | supported      | required             | merge     |
| `public-artifact-consumers` | supported      | required             | scheduled |
| `linux-x64-deployment`      | supported      | required             | merge     |
| `java-25-runtime`           | compatible     | advisory             | scheduled |
| `firefox-webkit-engines`    | compatible     | advisory             | scheduled |
| `advanced-browser-storage`  | experimental   | advisory             | merge     |
| `installed-pwa`             | experimental   | advisory             | merge     |
| `ubuntu-26`                 | untested       | none                 | manual    |
| `macos-apple-silicon`       | untested       | manual               | manual    |
| `windows-11-wsl2`           | untested       | manual               | manual    |
| `branded-browsers`          | untested       | manual               | manual    |
| `physical-mobile`           | untested       | manual               | manual    |
| `linux-arm64`               | untested       | none                 | manual    |

The policy check verifies every row, status, evidence mode, cadence, local workflow
job, and documentation row. It also drives the exact Node/npm/Java/Gradle/Spring
Boot/frontend ranges checked against manifests, wrappers, and CI.

## Clean-room consumers

Two separate boundaries must remain green:

1. Starter's scheduled `public-consumers` job resolves the public npm packages and
   Maven BOM/modules anonymously from fresh consumer caches, compiles/types/bundles
   them, and records provenance/signature evidence.
2. Template's merge and weekly CI starts from a clean checkout, installs with the
   committed lockfile, resolves public npm/Maven dependencies, runs the full
   browser/JVM gate, and starts the production-like OCI/PostgreSQL deployment.

Neither lane may use organization membership, private registry credentials, workspace
substitution, or an unpublished local Maven repository.

## Evidence freshness

Merge evidence is current for 48 hours, scheduled evidence for eight days, and manual
evidence for 35 days. A stale required row is release-blocking until rerun or publicly
reclassified. Advisory/manual failures do not silently become supported claims.

The Template keeps an identical policy snapshot and its scheduled
`platform-policy-sync` lane compares that snapshot with the public canonical file.
