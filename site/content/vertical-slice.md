# Build a vertical slice

This tutorial creates a Purchase Order capability from a reviewed schema, inspects the complete write plan and verifies the result.

## 1. Create a project

```bash
npm create vireo@latest purchase-workspace
cd purchase-workspace
corepack npm run setup
corepack npm run doctor
```

Use `-- --profile frontend` if the backend is separately owned.

## 2. Inspect the example schema

The generated project includes `.vireo/examples/purchase-order.entity.json`. Review entity naming, fields, constraints, query behavior and UI hints before generating.

The schema describes transport and scaffolding. It does not describe approval rules, purchasing authority or accounting policy.

## 3. Preview the write plan

```bash
corepack npm run vireo -- generate entity .vireo/examples/purchase-order.entity.json --diff
```

No files are written. Review every planned create or update operation.

## 4. Generate

```bash
corepack npm run vireo -- generate entity .vireo/examples/purchase-order.entity.json
```

The frontend profile creates models, API boundary, page, localization, story and contract test. The full-stack profile also creates the backend and migration boundaries.

## 5. Verify integrity

```bash
corepack npm run generate:check
corepack npm run verify
```

`generate:check` confirms the schema and derived wire artifacts still agree. `verify` exercises the wider application contract.

## 6. Run and inspect

```bash
corepack npm run dev
```

Inspect the new route, responsive behavior, empty/loading states and generated Storybook example. Then identify which product-specific behavior belongs outside generated files.

## 7. Commit one coherent change

Commit the schema, contract, generated code, optional migration and tests together. A reviewer should be able to understand the transport change and the application boundary from one diff.
