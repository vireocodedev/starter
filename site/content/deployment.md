# Deployment

Vireo does not require one hosting provider. The generated full-stack template includes production-shaped descriptors and health boundaries; the frontend profile builds an ordinary static React artifact.

## Frontend-only deployment

Build the production artifact:

```bash
corepack npm run build
```

Deploy `dist/` to a static host or reverse proxy. Configure the production API mode and base URL through reviewed environment values. Do not bake credentials into `VITE_*` variables—browser-delivered configuration is public.

## Full-stack deployment

The complete application requires:

- A supported Java runtime
- An explicit Spring production profile
- A managed database and migration process
- Secrets provided outside source control
- Backend and frontend health checks
- A reverse proxy or platform ingress with HTTPS
- A rollback plan compatible with database changes

## Health and readiness

Use separate liveness and readiness semantics where the platform supports them. A process being alive does not mean its database or required dependencies are ready for traffic.

## Database migrations

Run migrations exactly once per deployment boundary and rehearse rollback or forward recovery. Never assume rolling application rollback is safe after an irreversible schema change.

## Public demo versus production

The flagship demo uses a bounded public sandbox, seeded credentials and scheduled reset. Those choices demonstrate Vireo; they are not defaults for a private production application.

## Deployment checklist

- Pin the exact Vireo release mapping.
- Run the authoritative verification from a clean checkout.
- Scan the final artifacts and dependency graph.
- Configure HTTPS and security headers.
- Verify health endpoints from outside the host.
- Exercise login and one representative workflow.
- Record rollback and incident ownership.

Read [Security](/docs/security/) before exposing an application publicly.
