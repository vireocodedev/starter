# create-vireo

## 0.6.0

### Minor Changes

- Generate contract-driven full-stack and frontend projects from the pinned Template release, with application-owned identity validation, release readiness commands, and app-safe verification guidance.

## 0.5.1

### Patch Changes

- b068ba6: Render generated PWA identity from the shared policy, preserve frontend PWA checks
  and update-lifecycle fixtures, and include PWA diagnostics in the frontend Doctor.

## 0.5.0

### Minor Changes

- 348989f: Add a content-addressed, dry-run-first `vireo remove-example` workflow for removing the generated sample domain without overwriting customized files.

### Patch Changes

- 05fb1fd: Report the supported Ubuntu verification host in generated frontend Doctor output and surface it beside project prerequisites.
- 706cac2: Standardize Vireo Framework product terminology and publish canonical documentation, issue, and source routes in registry metadata.

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
