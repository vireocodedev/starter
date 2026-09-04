# Vireo Framework

Vireo is an opinionated foundation for operational React applications, with an
optional Spring Boot golden path for teams that own both halves. It provides typed
UI, frontend infrastructure, cross-stack contracts, history, localization, and
offline primitives while generated applications remain ordinary application code.

Vireo is public `0.x`: its published surfaces and compatibility policy are real
contracts, but it is not a blanket production-readiness claim. Applications own
their domain model, authorization, data sensitivity, deployment, offline
eligibility, and conflict resolution.

## Create a project

```bash
# Full stack: React, Spring Boot, and the Vireo Template baseline
npm create vireo@latest operations

# Frontend only: React with mock adapters and no Java or database
npm create vireo@latest operations-ui -- --profile frontend
```

Choose a profile before installing: [full stack](https://vireocode.com/docs/getting-started/)
or [frontend only](https://vireocode.com/docs/getting-started/frontend-only/).

## Learn and evaluate

- [Vireo documentation](https://vireocode.com/docs/)
- [Live flagship demo](https://demo.vireocode.com)
- [Profile and ownership boundaries](https://vireocode.com/docs/getting-started/choose-your-profile/)
- [Interactive Storybook](https://vireocode.com/storybook/)
- [TypeScript and Java reference](https://vireocode.com/reference/)
- [Current package and template versions](https://vireocode.com/versions/)
- [Vireo Template](https://github.com/vireocodedev/vireo-template)

The documentation site is the canonical adopter guide. Read the
[offline guarantees](docs/OFFLINE_GUARANTEES.md) before treating SQLite, queues,
hydration, or server replay as an application-level offline promise.

## Repository map

- `packages/*` — the public npm libraries and `create-vireo` CLI.
- `jvm/*` — the coordinated Spring Boot libraries published under
  `com.vireocode`.
- `site/` — the content and build for [vireocode.com](https://vireocode.com).
- [Vireo Template](https://github.com/vireocodedev/vireo-template) — the
  independently versioned full-stack application baseline.

The frontend and JVM builds are intentionally independent; read the
[architecture](docs/ARCHITECTURE.md) for their package boundaries.

## Contribute

```bash
corepack npm ci
corepack npm run verify
```

Use `corepack npm run verify:all` instead of `verify` for JVM or cross-stack
changes. Focused commands and prerequisites are in
[CONTRIBUTING.md](CONTRIBUTING.md).

For project and release boundaries, see [SUPPORT.md](SUPPORT.md),
[GOVERNANCE.md](GOVERNANCE.md), and [SECURITY.md](SECURITY.md).

## Public contracts and evidence

- [Compatibility and upgrades](docs/COMPATIBILITY.md)
- [Evaluation path and public-beta evidence](docs/EVALUATION.md)
- [Public API map](docs/PUBLIC_API.md) and [UI export surface](packages/ui/docs/PUBLIC_SURFACE.md)
- [Temporal values](docs/TEMPORAL_VALUES.md) and [platform support](docs/PLATFORM_SUPPORT.md)
- [Verification performance](docs/VERIFICATION_PERFORMANCE.md) and [documentation portal](docs/DOCUMENTATION_PORTAL.md)
- [Independent adopter feedback and evidence](docs/roadmap/phase-5/feedback-and-evidence.md)
