# Public API governance

This repository treats every exported npm symbol and every public/protected JVM
declaration as a compatibility promise. The machine-readable policy is
`contracts/public-api-policy.json`; `corepack npm run api:policy` enforces it.

## UI surface decision

`@vireocodedev/ui` 7.1.0 is already published. Removing its large root or
forms barrels without a major release would break consumers, so the current line
uses a freeze-and-migrate policy:

- the root entry point is capped at 757 symbols;
- `./forms` is capped at 539 symbols;
- every other explicit UI entry point is capped at its reviewed current size;
- exceeding a cap requires a deliberate policy diff, API snapshot update,
  changeset, and reviewer explanation of the consumer task that needs the growth;
- compatible implementation work may reduce a cap when symbols are deprecated and
  removed through the appropriate major-release process; and
- wildcard exports and undocumented deep imports remain forbidden.

The cap is not a quality target. It prevents the already-large obligation from
growing while a curated next-major surface is designed from consumer tasks.

## Storybook authoring exports

The four Storybook entry points remain supported in the published 7.x line because
they are already public:

- `./storybook`;
- `./storybook/VireoDockedSidePanel`;
- `./storybook/VireoIconContainer`; and
- `./storybook/VireoResponsiveOverlayFrame`.

Their policy disposition is `extract-next-major`. Before removing them from
`starter-ui`, create and validate a dedicated authoring package (provisionally
`@vireocodedev/ui-storybook`), migrate this repository's Storybook, publish
deprecation guidance for the old subpaths, and supply a major changeset. Do not
duplicate the helpers indefinitely across both packages without an owner and
removal release.

## New TypeScript APIs

Prefer the smallest cohesive entry point that serves a real consumer runtime.
Before exporting a symbol:

1. identify the consumer task and runtime (`browser` or `worker`);
2. decide whether it belongs to application API, an optional integration, or
   authoring tooling;
3. avoid exporting implementation classes, generated helpers, styling internals,
   example fixtures, or types reachable only because of `export *`;
4. add/update strict packed-consumer coverage;
5. update the surface snapshot and budget only after reviewing the diff; and
6. add the required changeset and documentation.

## JVM declaration intent

All 111 declarations currently recorded in the five JVM API snapshots map to an
approved package intent. The policy rejects a declaration in a new package until
that package is classified, and caps each module at its reviewed declaration count.

The package-level classes are:

- base domain/mapping contracts;
- Spring auto-configuration and properties;
- migration extension contracts;
- security expressions;
- explicit consumer SPI seams;
- HTTP/error contracts;
- authentication HTTP/configuration;
- query language/persistence;
- offline protocol/persistence; and
- history recording/query APIs.

Generated MapStruct implementations and nested Spring configuration classes still
appear in the current snapshots. They therefore remain compatibility-accountable
until a reviewed major release hides or replaces them. A package-intent label does
not imply that every current type is ideal.

## Breaking-surface procedure

For a deliberate removal or incompatible signature change:

1. record affected entry points/types and known consumers;
2. add a replacement and deprecation path where practical;
3. update examples and a migration guide before release;
4. include a major changeset for npm or bump/document the JVM major line;
5. update snapshots, budgets, and package intents in the same pull request; and
6. verify packed/published consumers for both the migration path and the resulting
   clean surface.

Never shrink a snapshot merely to make a compatibility check pass.
