# Evaluate Vireo

Vireo is for small teams building operational business applications that need a
coherent React and Spring Boot starting point, responsive CRUD surfaces, explicit
cross-stack contracts, and optional offline mechanisms without surrendering
ownership of application code.

## Guided first-run path

The public Template is the canonical evaluation surface because it consumes Vireo
through the same npm and Maven boundaries as an independent application.

```bash
git clone https://github.com/vireocodedev/starter-template.git
cd starter-template
cp .env.example .env
cd frontend
corepack npm ci
cd ..
```

Start the API and frontend in separate terminals:

```bash
set -a && source .env && set +a
./gradlew bootRun
```

```bash
cd frontend
corepack npm run dev
```

Open <http://localhost:3000>, sign in with `demo` / `demo123`, and create, edit,
filter, and delete an Item. The development profile is the only profile that seeds
those accounts; never deploy it publicly.

To evaluate engineering quality rather than only the UI, run the Template's
authoritative gate:

```bash
./scripts/verify.sh
```

It checks architecture, formatting, lint, types, unit/integration/Storybook tests,
the production bundle, browser smoke behavior, the JVM build, and public-contract
drift. The same command is exercised on clean hosted runners.

## What to inspect

1. Trace the Item slice from the React page through its API client to the Spring
   controller, service, repository, and migration.
2. Inspect where application policy remains local: authorization, schema, mapping,
   localization resources, and deployment secrets.
3. Review the [public API map](PUBLIC_API.md) before choosing individual packages.
4. Review [compatibility](COMPATIBILITY.md), [support](../SUPPORT.md), and
   [security](../SECURITY.md) before an adoption decision.

## Fit and limitations

Vireo is a reasonable fit when a team wants ordinary application code plus reviewed
conventions for React/Spring business software. It is not currently a fit when the
decision depends on any of these being complete:

- a create/doctor/upgrade CLI or a full-stack entity generator;
- a production-readiness or long-term-support guarantee;
- arbitrary offline synchronization without application-owned eligibility and
  conflict policy;
- a hosted backend, managed database, or deployment control plane;
- stable `1.x` APIs or automatic application upgrades.

The current `0.x` contract still treats incompatible exported API removal as a
major change and publishes exact Template/framework compatibility. “Production
shaped” means the repository demonstrates the engineering boundary; it is not a
claim that an unreviewed clone is safe for a particular production workload.

## Continue by use case

- Full application: [Template customization](https://github.com/vireocodedev/starter-template/blob/main/docs/customizing-the-template.md)
- Frontend packages and subpaths: [public API map](PUBLIC_API.md#frontend-entry-points)
- React design system: [Starter UI classified surface](../packages/ui/docs/PUBLIC_SURFACE.md)
- JVM modules and BOM: [public API map](PUBLIC_API.md#jvm-entry-points)
- Package compatibility and upgrades: [compatibility policy](COMPATIBILITY.md)
