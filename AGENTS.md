# Vireo Starter

This repository publishes the Vireo TypeScript packages, JVM modules, and `create-vireo`. Treat published APIs, generated-project contracts, package coordinates, and documentation releases as public contracts.

## Routing

- UI design-system components: read `packages/ui/AGENTS.md` and use `$starter-ui-component-author` when the work creates or completes a public component.
- Project creation, entity generation, projection, or upgrades: read `packages/create-vireo/AGENTS.md`.
- JVM modules or Maven publication: read `jvm/AGENTS.md`.
- Repository policies, release evidence, and verification scripts: read `scripts/AGENTS.md`.

## Durable invariants

- Preserve the public package/API surface unless the requested change includes its migration, compatibility strategy, and release intent.
- Keep the checked-in application projection contract and `packages/create-vireo/schema` mirror byte-identical. Classify every new Template path before it can be projected.
- Keep normal development against published artifacts. Local Template integration is explicit and must not silently alter default resolution.
- Use focused checks while editing; reserve repository-wide, Storybook, browser, and Gradle gates for coordinated final verification.
- Do not publish, deploy, alter external release settings, or resolve application-owned upgrade work without explicit user authorization.

Authoritative architecture and release routing live in `docs/ARCHITECTURE.md`, `docs/ECOSYSTEM_CONTRACT.md`, and `docs/RELEASE_LIFECYCLE.md`.
