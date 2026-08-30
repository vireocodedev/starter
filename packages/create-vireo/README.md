# create-vireo

Creates either a full-stack Vireo application or a standalone Vireo frontend from
an immutable, reviewed commit of the public
[Vireo Starter Template](https://github.com/vireocodedev/starter-template).

```bash
npm create vireo@latest my-app
cd my-app
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

The interactive path asks for the project name, Java package, database, and Git initialization. PostgreSQL is the generated-app default; `--database h2` selects the zero-service embedded development database.

For a frontend team with a separately owned backend:

```bash
npm create vireo@latest operations-ui -- --profile frontend
cd operations-ui
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

This profile contains no Java, Gradle, Flyway, or database configuration. It starts
against application-owned mock adapters; use `demo` / `demo123`, then replace the
adapters or select HTTP mode when the company API is ready.

For automation:

```bash
npm create vireo@latest my-app -- \
  --yes \
  --name my-app \
  --java-package com.example.myapp \
  --database postgresql \
  --no-git
```

Use `--dry-run --json` to validate inputs without creating a directory. Creation stages outside the final target and renames only after success. An existing target is never overwritten, and failed staging directories are removed.

## Programmatic API

```ts
import { createVireo } from "create-vireo";

await createVireo({ directory: "my-app", database: "h2", git: false });
```

The package performs no telemetry and prints no environment variables or credentials.

## Generate a capability

The package includes a second executable, `vireo`, while preserving
`npm create vireo`:

```bash
vireo generate entity .vireo/examples/purchase-order.entity.json --dry-run
vireo generate entity .vireo/examples/purchase-order.entity.json
vireo check
```

Full-stack generation emits a Flyway migration, Spring CRUD/query/history slice,
Zod transport/domain models, configurable API adapter, responsive React CRUD page,
route/navigation registration, localization, Storybook story, and frontend/backend
tests. A frontend-profile project automatically emits only the React-side artifacts:

```bash
vireo generate entity .vireo/examples/purchase-order.entity.json
# or, from a full-stack project:
vireo generate entity schema.json --target frontend
```

The canonical schema and target-aware wire-contract formats are versioned and
shipped with the package.

Use `--output <directory>` to inspect a standalone tree. An identical rerun is byte-for-byte idempotent. Schema changes require `--force`; collisions or customized files additionally require `--accept-overwrite`. `vireo eject <plural>` keeps application code and removes Vireo management.

The detailed contracts are in [frontend-only profile](../../docs/architecture/frontend-only-profile.md), [entity schema](../../docs/generators/entity-schema.md), [generated ownership](../../docs/architecture/generated-code-ownership.md), and [wire contracts](../../docs/architecture/wire-contracts.md).

## Remove the generated example

New projects include a content-addressed ownership manifest for the sample domain.
Inspect the complete plan first, or ask only for its current state:

```bash
vireo remove-example --status
vireo remove-example --dry-run
vireo remove-example --apply
```

Dry run is the default. Apply proceeds only when every example-owned file still
matches its generation-time digest and there are no unowned sample references.
It removes the sample route, navigation, localization, adapters, frontend/backend
domain files, migration, seed, tests, stories, and documentation references while
retaining a minimal home surface. If a file was customized, move that work into a
new capability or reconcile it manually; the command will not overwrite it.

## Upgrade a generated project

Version 0.3 introduces the first supported release pair, from a project created by
`create-vireo` 0.2.0 to 0.3.0. The command is non-writing by default:

```bash
vireo upgrade --to 0.3.0 --dry-run
vireo upgrade --to 0.3.0 --apply --accept-application-owned
```

The preflight refuses unknown source commits, changed Vireo dependency declarations,
lockfile drift, invalid/duplicate Flyway migration versions, and managed generated or
wire-contract drift. Apply changes only Vireo-managed metadata and the pinned CLI
script. Template files, domain logic, deployment, data migration, and adopted/ejected
code remain application-owned and must be reviewed against the target Template
commit `685e535fe07329c223696e07c108194f0c3dd589`. A managed dependency apply can
leave a 0.2 project unable to compile: that project does not already contain the
target Template's navigation, responsive-table, accessible-name, or surface-palette
work. Complete the printed pending checklist before calling the upgrade complete:

- navigation landmarks, localized labels, and real links;
- responsive-table live announcements in both catalogues;
- accessible names for overlays and frames;
- the UI-owned `appSurface` palette contract; and
- frontend lock refresh, setup, typecheck, and full verification.

Historical 0.2 generated manifests are admitted only
through their recorded raw schema digest, persisted wire-contract digest, and
contract-critical file hashes; upgrading never regenerates them. Regenerating that
capability later uses the current strict schema rules, including a constraint-valid
example for every patterned field. The generated application contains the complete
review, verification, and rollback procedure in `docs/project-upgrades.md`.
