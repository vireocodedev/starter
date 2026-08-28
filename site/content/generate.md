# Entity generation

The generator turns one versioned entity schema into a deterministic, reviewable capability. It supports frontend-only and full-stack targets.

## Generate

```bash
corepack npm run vireo -- generate entity schema.json
```

The target defaults to the project profile. Override it when needed:

```bash
corepack npm run vireo -- generate entity schema.json --target frontend
corepack npm run vireo -- generate entity schema.json --target full-stack
```

## Preview without writing

```bash
corepack npm run vireo -- generate entity schema.json --dry-run
corepack npm run vireo -- generate entity schema.json --diff
```

`--diff` is a dry run with per-file statuses. Use `--output directory` to render a standalone tree for review outside the project.

## Check managed capabilities

```bash
corepack npm run vireo -- check
```

The command verifies canonical schema, derived wire contract and applicable frontend/backend artifact hashes. A clean check means managed artifacts agree; it does not prove application business behavior.

## Regeneration safety

The generator refuses collisions and reviewed customizations by default. A schema change can be applied with `--force`, but overwriting collisions also requires `--accept-overwrite`.

Always preview, inspect `git diff` and run project verification.

## Eject

```bash
corepack npm run vireo -- eject purchase-orders --dry-run
corepack npm run vireo -- eject purchase-orders
```

Ejection keeps application code and removes Vireo management. Use it when a capability's product-specific structure matters more than future deterministic regeneration.

See [Wire contracts](/docs/concepts/wire-contracts/) and [Generated code ownership](/docs/concepts/generated-code/).
