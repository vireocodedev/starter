# Full-stack entity generator

Build `create-vireo`, then run its application CLI from a Vireo project root:

```bash
corepack npm run build --workspace=create-vireo
node /path/to/starter/packages/create-vireo/dist/vireo-cli.js \
  generate entity .vireo/examples/purchase-order.entity.json \
  --project . \
  --dry-run
```

After `create-vireo@0.2.0` is public, generated applications expose the shorter form:

```bash
corepack npm run vireo -- generate entity .vireo/examples/purchase-order.entity.json --dry-run
corepack npm run vireo -- generate entity .vireo/examples/purchase-order.entity.json
corepack npm run vireo -- check
```

The schema is validated twice conceptually: the shipped JSON Schema documents editor/tooling shape, and the CLI applies portable Java/TypeScript naming, uniqueness, reserved-word, regex, capability, and minimum searchable-field rules. `--json` provides machine-readable plans and checks.

## Generated vertical slice

- Flyway table migration and indexes.
- JPA entity, Jakarta validation, enums, DTO, MapStruct mapper, repository, Vireo service, secured REST controller, query registration, and history identity.
- Separate Zod transport/domain schemas, mapper functions, validated API adapter, TanStack Query CRUD page, responsive empty/loading/error/list/form states, route/navigation registration, English/Croatian resources, Storybook story, and contract test.
- Spring API integration test, capability documentation, canonical schema copy, wire contract, and hash manifest.

The v1 identifier is a generated `Long`. Explicit singular/plural names avoid English pluralization guesses. Acronyms are accepted when portable. Relationships, compound identifiers, and offline replay are represented as deliberate admission boundaries rather than partially generated code. Offline guarantees belong to Phase 4; relationship generation requires an admitted relational fixture.

See [generated-code ownership](../architecture/generated-code-ownership.md) before regeneration and [wire contracts](../architecture/wire-contracts.md) before changing transport fields.
