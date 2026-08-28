# create-vireo

Creates a full-stack Vireo application from an immutable, reviewed commit of the public [Vireo Starter Template](https://github.com/vireocodedev/starter-template).

```bash
npm create vireo@latest my-app
cd my-app
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

The interactive path asks for the project name, Java package, database, and Git initialization. PostgreSQL is the generated-app default; `--database h2` selects the zero-service embedded development database.

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

## Generate a full-stack capability

Version 0.2 adds a second executable, `vireo`, while preserving `npm create vireo`:

```bash
vireo generate entity .vireo/examples/purchase-order.entity.json --dry-run
vireo generate entity .vireo/examples/purchase-order.entity.json
vireo check
```

Generation emits a Flyway migration, Spring CRUD/query/history slice, Zod transport/domain models, API adapter, responsive React CRUD page, route/navigation registration, localization, Storybook story, and frontend/backend tests. The canonical schema and wire-contract formats are versioned and shipped with the package.

Use `--output <directory>` to inspect a standalone tree. An identical rerun is byte-for-byte idempotent. Schema changes require `--force`; collisions or customized files additionally require `--accept-overwrite`. `vireo eject <plural>` keeps application code and removes Vireo management.

The detailed contracts are in [entity schema](../../docs/generators/entity-schema.md), [generated ownership](../../docs/architecture/generated-code-ownership.md), and [wire contracts](../../docs/architecture/wire-contracts.md).
