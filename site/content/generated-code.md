# Generated code ownership

Vireo generation is deterministic and review-first. Every write is planned, collisions are refused by default and management metadata records what may be regenerated.

## Managed artifacts

Generated files are tracked under `.vireo/generated/` with schema and output digests. `vireo check` compares the canonical schema, derived contract and managed artifacts.

Do not treat the manifest as a lock on your application. It is an explicit statement of which files Vireo currently manages.

## Safe workflow

```bash
corepack npm run vireo -- generate entity schema.json --dry-run
corepack npm run vireo -- generate entity schema.json
corepack npm run generate:check
git diff
corepack npm run verify
```

Commit the schema, contract, generated output and migration together. Review generated code with the same standards as handwritten code.

## Schema changes

If a schema changes, the CLI reports the planned updates. It refuses collisions or modified managed files unless the user explicitly acknowledges overwrite behavior.

Use `--force --accept-overwrite` only after reviewing what will be replaced.

## Ejection

When a capability needs application-specific structure that no longer fits regeneration:

```bash
corepack npm run vireo -- eject purchase-orders --dry-run
corepack npm run vireo -- eject purchase-orders
```

Ejection retains the application code while removing Vireo management metadata and generated route registration. After ejection, the team owns upgrades and contract alignment for that capability.

## Keep product policy outside generated files

Prefer application services, adapter composition and adjacent domain modules for product rules. This reduces regeneration conflicts and makes the ownership boundary visible.
