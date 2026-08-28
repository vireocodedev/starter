# Wire contracts

A wire contract records the values that cross a frontend/backend boundary. It exists to catch accidental transport drift without pretending that a schema describes the whole business domain.

## What is checked

For a managed capability, `vireo check` verifies the canonical entity schema and hashes of derived artifacts. Depending on the target, those artifacts include:

- JSON schema and contract metadata
- Frontend model and API transport
- Contract tests
- Spring DTO and controller boundary
- Database migration identity

Formatting differences are normalized where the format is semantic, so checks focus on contract meaning rather than incidental whitespace.

## What is not inferred

Wire contracts do not decide:

- Who may perform an action
- Which state transitions are legal
- Whether an operation needs a transaction
- How monetary rounding works
- Whether data may be cached or queued offline
- How long sensitive data may be retained

Those remain application and backend responsibilities.

## Review flow

```bash
corepack npm run vireo -- generate entity schema.json --dry-run
corepack npm run vireo -- generate entity schema.json
corepack npm run generate:check
```

Use `--diff` for a complete per-file plan. A schema change that would overwrite reviewed customizations requires explicit `--force --accept-overwrite`; the CLI does not silently claim those files.

## Separate-team use

In a frontend-only project, the generated contract becomes a reviewed integration artifact between teams. The backend does not have to use Vireo, Java or the same repository. It only needs to honor the agreed wire behavior.

See [Entity generation](/docs/cli/generate/) and [Generated code ownership](/docs/concepts/generated-code/).
