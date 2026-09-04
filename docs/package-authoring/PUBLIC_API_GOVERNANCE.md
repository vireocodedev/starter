# Public API governance

Every exported npm symbol and every public or protected JVM declaration is a
compatibility promise. [`contracts/public-api-policy.json`](../../contracts/public-api-policy.json)
is the machine-readable source of truth; `corepack npm run api:policy` validates
the policy, package exports, and checked API snapshots.

## UI surface governance

Each declared `@vireocodedev/ui` entry point has an explicit audience, runtime,
stability classification, and reviewed symbol budget in the policy. The root UI
entry point and `./forms` are `freeze-growth`: they may not grow without a
deliberate policy, snapshot, documentation, release-intent, and reviewer change.

The legacy Storybook entry points are `deprecated` and `extract-next-major`. Do
not add application dependencies on them. Before removing them, provide a
dedicated authoring boundary or a documented application-owned replacement,
migrate repository Storybook usage, publish deprecation guidance, and make the
removal in a major release.

Other explicit UI subpaths remain supported or advanced only as their policy
classification states. Wildcard exports, undocumented deep imports, and exporting
implementation helpers by accident are forbidden.

## New TypeScript APIs

Before exporting a symbol:

1. identify the consumer task, audience, and runtime;
2. choose an existing entry point or add a narrow, documented one deliberately;
3. keep implementation classes, generated helpers, styling internals, and example
   fixtures private;
4. add or update packed-consumer coverage;
5. review and update the API snapshot and policy only with the intended surface
   change; and
6. record the required release intent and user-facing documentation.

## JVM declaration governance

Each public JVM module has a declaration budget and approved Java-package intents
in the policy. The snapshots cover public and protected declarations, including
generated declarations that are already exposed by published JARs. A declaration
in a new package must be classified before it can become public.

Package-intent labels describe the supported consumer role; they do not make every
current declaration an ideal long-term shape. Treat an exposed generated type or
framework configuration class as compatibility-accountable until a reviewed major
release hides or replaces it.

## Breaking-surface procedure

For a deliberate removal or incompatible signature change:

1. record affected entry points or types and known consumers;
2. provide a replacement and deprecation path where practical;
3. update examples and migration guidance before release;
4. declare the required major release intent;
5. update snapshots, budgets, and package intents in the same pull request; and
6. verify packed or published consumers for the migration path and clean surface.

Never shrink a snapshot merely to make a compatibility check pass.
