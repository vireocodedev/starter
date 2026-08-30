# Release lifecycle

Vireo publishes independently versioned npm packages and a versioned Maven BOM. The machine-readable source for release channels and supported lines is [`contracts/release-lifecycle-policy.json`](../contracts/release-lifecycle-policy.json); this page explains the operator contract.

## Channels

- Stable npm releases use the `latest` dist-tag and plain semantic versions. Stable Maven artifacts use the same plain semantic-version form.
- Prereleases, once enabled, use the `next` dist-tag and an `-alpha.N`, `-beta.N`, or `-rc.N` suffix for every affected npm and Maven coordinate. A prerelease must never overwrite or retag a stable coordinate.
- Promotion is a new release decision from verified candidate bytes. It does not mutate an already published coordinate.

The prerelease channel is currently `not-enabled`. Enabling it requires a reviewed lifecycle-contract change and release validation that calls `validateReleaseCoordinates` for the selected channel.

## Supported lines

Every line records when it began, when its current status became effective, its maintenance scope, compatibility policy, and withdrawal guide. Valid transitions are `active` → `deprecated` → `eol`; a deprecated line must publish both its deprecation and EOL dates at least 30 days apart.

The current `0.3-alpha` line is active and receives security and critical-correctness fixes. Alpha compatibility remains governed by [`docs/COMPATIBILITY.md`](COMPATIBILITY.md).

For withdrawal, publish the replacement line (or explicitly state that none exists), mark the old line deprecated with dates, keep its exact-version documentation available, and provide upgrade or containment guidance. At EOL, public artifacts remain immutable, but no further fixes or compatibility claims are made.

Run `corepack npm run release:lifecycle:check` before changing a channel or support-line record.
