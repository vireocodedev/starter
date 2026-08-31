# Frontend-only project profile

Status: introduced in `create-vireo@0.4.0` on 2026-08-28; current public contract
is `create-vireo@0.7.0`.

Vireo remains a React + Spring Boot full-stack framework by default. The
`frontend` project profile is a supported secondary adoption path for organizations
whose frontend and backend teams own separate repositories, release trains, or
technology choices. It creates an ordinary standalone React/Vite repository and
does not copy Java, Gradle, Flyway, or database configuration.

## Create and run

```bash
npm create vireo@latest operations-ui -- --profile frontend
cd operations-ui
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

The generated `.env.development` selects `VITE_API_MODE=mock`, so the application
works before a backend exists. The included in-memory implementation supports the
seeded login (`demo` / `demo123`), Item search and CRUD, query metadata, and an
empty history feed. Mock state lasts only for the browser session and is not an
integration or persistence guarantee.

Switch to `VITE_API_MODE=http` when the company API is available. Environment
validation refuses unknown modes.

## Stable application-owned adapter boundary

Screens, queries, and mutations depend on small TypeScript interfaces, not directly
on Spring Boot or a particular HTTP client. Configure any subset before React
renders:

```ts
import { configureAppAdapters } from "@/app/adapters/public";

configureAppAdapters({
  auth: companyAuthApi,
  items: companyItemApi,
  history: companyHistoryApi,
  query: companyQueryApi,
});
```

The default adapters preserve the existing Vireo REST behavior. A company adapter
may use `fetch`, Axios, GraphQL, a BFF, or an OpenAPI-generated client. Keep the
generated client behind the Vireo interface so regeneration does not spread
transport details through components. Parse untrusted data and translate errors at
this boundary.

Adapters use stable proxy identities. Reconfiguration therefore does not invalidate
query functions or modules that captured an adapter reference during import.

## Frontend-owned generation

In a frontend-profile project, entity generation infers the frontend target:

```bash
corepack npm run vireo -- generate entity .vireo/examples/purchase-order.entity.json
corepack npm run generate:check
```

It generates the TypeScript domain/transport models, configurable HTTP adapter,
page, navigation and capability registrations, translations, Storybook story,
contract test, schema copy, wire contract, and ownership manifest. It does not
generate Java or database files.

A full-stack project can make the same explicit choice when only its frontend team
owns the capability:

```bash
corepack npm run vireo -- generate entity schema.json --target frontend
```

The version-1 entity schema remains shared across both targets. Backend-specific
schema fields are retained for format compatibility and ignored by the frontend
renderer. The generated wire contract records adapter-owned error and numeric
precision semantics rather than claiming Spring or `BigDecimal` behavior.

## Team and CI boundary

A practical split is:

```text
frontend repository                 backend repository
React pages and Vireo packages      API implementation and persistence
domain/transport schemas            authoritative authorization policy
Vireo adapter interfaces            OpenAPI or equivalent API contract
mock adapters and component tests   service and integration tests
contract-version pin  <---------->  published contract/version
shared-environment integration lane (owned jointly)
```

Normal frontend pull requests run the generated project's `verify` command without
a backend checkout. A separate integration lane points `VITE_API_MODE=http` at a
shared or ephemeral API and verifies the versioned contract. Backend teams remain
authoritative for authentication, authorization, audit retention, and transactional
behavior.

If the backend lacks saved queries, history, or offline synchronization, replace or
disable those adapters and capabilities explicitly. Vireo never infers safe offline
mutation, conflict, money, or 64-bit integer semantics for an arbitrary backend.

## Existing frontend adoption

Teams do not have to regenerate an existing React repository. They can adopt
individual `@vireocodedev/*` packages, copy the adapter-slot pattern, and introduce
Vireo screens incrementally. The generated profile is the supported clean-project
reference and CI fixture; it is not a requirement that Vireo own the repository.

## Evidence and release boundary

The public `create-vireo@0.7.0` CLI unit suite covers profile validation, projection, generation, checking,
idempotence, collisions, and ejection. The hosted `Generated frontend-only fixture`
CI job downloads the pinned public Template, creates a clean standalone project,
generates a capability twice, checks the contract, proves that no backend artifact
exists, installs public dependencies, runs the doctor, type-checks, executes the
wire test, and builds the production application.

This profile broadens organizational adoption, not the production-readiness claim.
The same public `0.x`, compatibility, accessibility, security, and external-user
evaluation boundaries apply.
