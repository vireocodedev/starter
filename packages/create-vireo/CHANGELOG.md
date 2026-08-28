# create-vireo

## 0.4.2

### Patch Changes

- 39c471d: Emit the standalone frontend doctor and generated TypeScript, JSON, Markdown, and
  contract files in repository-standard Prettier format so a project's complete
  `verify` command passes without source edits before and after entity generation.

## 0.4.1

### Patch Changes

- 36c3c37: Pin project creation to the verified Template revision that preserves adapter method
  introspection for test spies and satisfies the complete mock-adapter lint contract.

## 0.4.0

### Minor Changes

- 803fa6f: Add a standalone frontend project profile, swappable API adapters, mock-backed local development, and frontend-only entity generation.

## 0.3.0

### Minor Changes

- 53bae10: Add a dry-run-first `vireo upgrade` workflow for the supported 0.2.0-to-0.3.0
  release pair, including dependency, lockfile, migration, generated/wire-contract,
  and application-owned boundary checks plus an explicit managed apply step.

## 0.2.0

### Minor Changes

- 5dea382: Add the Vireo Phase 3 full-stack entity generator, canonical schema, wire-contract drift checks, safe regeneration, and ejection workflow.
