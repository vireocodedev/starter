# Troubleshooting

Start with the project-local diagnostic command:

```bash
corepack npm run doctor
```

Doctor reports stable codes and remedies without changing the project.

## Wrong Node or npm version

Use Node 24.15 or newer, below 25, and the project-declared npm release through Corepack. Avoid installing dependencies with another package manager and then diagnosing the resulting lockfile drift.

## Port already in use

The default frontend port is `3000`; the full-stack backend uses `8080`. Stop the conflicting process or deliberately reconfigure the application and proxy together.

## PostgreSQL project will not start

Confirm `docker compose version`, start the generated database service and inspect container health before restarting Spring. H2 projects do not require Docker.

## Frontend cannot reach the API

Check `VITE_API_MODE`, `VITE_API_BASE_URL`, development proxy configuration, backend health, authentication cookies/headers and browser network errors. Mock success does not prove the HTTP adapter is configured.

## Generated check fails

Run:

```bash
corepack npm run vireo -- check --json
git diff
```

Identify whether the canonical schema, contract or managed output changed. Do not delete management metadata to suppress a legitimate mismatch. Regenerate deliberately or eject the capability.

## PWA behaves like an older build

First close all application tabs, reconnect, reload once, and allow the deliberate update lifecycle to complete. Then inspect the active service worker and its cache in browser developer tools; production service-worker behavior is intentionally different from ordinary development mode.

If the worker itself must be unregistered, do that before considering storage removal. **Clearing site data removes application-owned offline state**, including cached data and any locally queued commands. Only do it after the application has offered any lawful export or support-safe inspection and the user has confirmed the purge. See [Offline behavior](/docs/offline/) for the recovery and update boundaries.

## Ask for help

Include the Doctor JSON report, operating system, exact command, relevant logs and a minimal reproduction. Remove credentials and sensitive business data before sharing.

Visit [Community](/community/) for support routes.
