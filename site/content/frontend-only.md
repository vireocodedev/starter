# Frontend-only applications

The frontend profile generates a standalone React application with no Java, Gradle, Flyway or database artifacts. It runs immediately against application-owned in-memory adapters.

## Create and run

```bash
npm create vireo@latest operations-ui -- --profile frontend
cd operations-ui
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

The default `.env.development` selects `VITE_API_MODE=mock`. Use `demo` / `demo123` to exercise login, Item search and CRUD, query metadata and the history boundary.

## Connect the company API

Switch the environment deliberately:

```text
VITE_API_MODE=http
VITE_API_BASE_URL=https://api.example.internal
```

Then configure the stable adapter slots exported from `src/app/adapters/public.ts`:

```ts
import { configureAppAdapters } from "@/app/adapters/public";

configureAppAdapters({
  auth: companyAuthAdapter,
  items: companyItemAdapter,
  query: companyQueryAdapter,
  history: companyHistoryAdapter,
});
```

Adapters translate company transport and identity conventions into the narrow application contracts used by the UI. They are a seam, not a second domain layer.

## Generate frontend capabilities

The project profile is inferred automatically:

```bash
corepack npm run vireo -- generate entity schema.json
corepack npm run generate:check
```

A full-stack repository can request the same output explicitly:

```bash
corepack npm run vireo -- generate entity schema.json --target frontend
```

Generated output includes typed models, an API boundary, capability metadata, page composition, English and Croatian localization, Storybook coverage, wire-contract tests and Vireo management metadata.

## Production ownership

The backend remains authoritative for authorization, validation, transactions, audit guarantees, money and identifier semantics. The frontend may improve UX with validation and optimistic behavior, but it must not be the security boundary.

Continue with [Adapters and company APIs](/docs/concepts/adapters/) or [Entity generation](/docs/cli/generate/).
