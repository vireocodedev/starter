# Doctor diagnostics

Doctor is a project-local, read-only preflight command:

```bash
corepack npm run doctor
```

It reports stable diagnostic codes, pass/warn/fail status and a concrete remedy. It never installs tools or rewrites project files.

## Full-stack checks

- Supported Node and exact project npm versions
- Java 21 or 25
- Git availability
- Valid `.vireo` project metadata
- Installed frontend dependencies
- Aligned Vireo package versions
- Ports `3000` and `8080`
- Docker Compose when PostgreSQL is selected
- PWA configuration

## Frontend-only checks

- Supported Node version
- Frontend profile metadata
- Installed dependencies and compatible Vireo packages
- Explicit `VITE_API_MODE=mock` or `http`
- Port `3000`

Java, Docker and backend port checks are intentionally absent from the frontend profile.

## JSON mode

The full-stack template also exposes:

```bash
corepack npm run doctor:json
```

Use the structured report in support automation or CI diagnostics. Do not treat Doctor as a replacement for `verify`; Doctor checks readiness, while verification exercises code and build contracts.

## Typical flow

1. Run `setup` after project creation.
2. Run `doctor` before the first development session.
3. Follow the reported remedy for every failure.
4. Run `verify` before submitting a change.
