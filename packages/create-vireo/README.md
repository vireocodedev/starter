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
