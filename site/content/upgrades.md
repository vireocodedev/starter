# Project upgrades

Vireo upgrades are declared migrations between supported `create-vireo` releases. They modify only the Vireo-managed boundary and require explicit acknowledgement of application-owned work.

## Preview first

```bash
corepack npm run vireo -- upgrade --to VERSION --dry-run
```

Dry run is the default. It validates project metadata, the supported source/target pair and the planned file operations without writing.

## Apply a supported migration

```bash
corepack npm run vireo -- upgrade --to VERSION --apply --accept-application-owned
```

The acknowledgement does not give the CLI permission to rewrite arbitrary product code. It records that the team understands manual application-owned changes may remain.

## Refusal is a feature

The CLI refuses:

- Unknown project metadata
- Unsupported source/target pairs
- Ambiguous ownership
- Missing explicit apply acknowledgement
- Unsafe file collisions

Create a branch, commit the clean starting state and review the complete migration diff.

## After applying

1. Install the resulting dependency graph.
2. Run Doctor.
3. Run generated-contract checks.
4. Run the authoritative project verification.
5. Review application-owned integration notes.
6. Commit the migration as a focused change.

The compatibility and migration contracts are linked from [Versions](/versions/).
