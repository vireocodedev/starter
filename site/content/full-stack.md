# Full-stack applications

The default profile composes the Vireo React application with a Spring Boot backend, Flyway migrations and either embedded H2 development storage or PostgreSQL.

## Create the application

```bash
npm create vireo@latest operations-app
cd operations-app
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

The development command starts the backend on port `8080` and the frontend on port `3000`. The frontend development server proxies API traffic to Spring Boot.

## Database choice

H2 is the lowest-friction evaluation path and requires no container. PostgreSQL is the production-shaped option and requires Docker Compose for the generated local environment.

The selected database is recorded in `.vireo/project.json`; Doctor validates the corresponding prerequisites.

## Generate a coordinated slice

```bash
corepack npm run vireo -- generate entity .vireo/examples/purchase-order.entity.json
corepack npm run generate:check
corepack npm run verify
```

The generator produces a reviewed frontend transport and UI together with the Spring DTO, controller, service, persistence and migration boundaries. It does not invent business policy.

## Preserve the application boundary

Vireo-managed files may be regenerated when their schema remains authoritative. Product rules, authorization policy, integrations and special transaction behavior belong in application-owned code. Use [Generated code ownership](/docs/concepts/generated-code/) before customizing generated output.

Continue with [Architecture](/docs/concepts/architecture/) or the [30-minute vertical slice](/docs/guides/30-minute-vertical-slice/).
