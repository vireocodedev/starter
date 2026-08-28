# Getting started

The fastest way to understand Vireo is to create an ordinary project, run its diagnostics and use the seeded workflow before changing anything.

## Prerequisites

- Node.js 24.15 or newer, but below Node 25
- Corepack with the project-declared npm version
- Git if you want the generated repository initialized
- Java 21 or 25 only for the full-stack profile
- Docker Compose only when selecting PostgreSQL

The generated project includes a Doctor command that reports exact failures and remedies.

## Create a project

For the complete React and Spring Boot path:

```bash
npm create vireo@latest operations-app
cd operations-app
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

For a standalone React project:

```bash
npm create vireo@latest operations-ui -- --profile frontend
cd operations-ui
corepack npm run setup
corepack npm run doctor
corepack npm run dev
```

Open `http://localhost:3000` and sign in with `demo` / `demo123`.

## Establish the development loop

Before adapting the project, run the authoritative verification command:

```bash
corepack npm run verify
```

The exact steps differ by profile, but the command checks formatting, lint, types, tests, production builds, bundle boundaries and generated contracts where applicable.

## Continue

- [Choose a project profile](/docs/getting-started/choose-your-profile/)
- [Connect a frontend-only project](/docs/getting-started/frontend-only/)
- [Understand the complete application](/docs/getting-started/full-stack/)
- [Build a generated vertical slice](/docs/guides/30-minute-vertical-slice/)

> Keep the first run unchanged. A clean baseline makes later integration problems much easier to locate.
