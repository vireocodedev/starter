# Vireo documentation

Vireo is a production-shaped foundation for operational React applications. It provides responsive UI conventions, replaceable integration seams, generated vertical slices and an optional coordinated Spring Boot path. It does **not** take ownership of your product domain.

## Start with a working application

Choose the path that matches the way your teams already work:

| Path          | Use it when                                     | First command                                       |
| ------------- | ----------------------------------------------- | --------------------------------------------------- |
| Frontend-only | A separate team or system owns the API          | `npm create vireo@latest app -- --profile frontend` |
| Full-stack    | One product team owns React and Spring together | `npm create vireo@latest app`                       |

Continue with [Getting started](/docs/getting-started/) or compare the profiles in [Choose a project profile](/docs/getting-started/choose-your-profile/).

## Learn in layers

The main documentation is organized around decisions and tasks:

- **Start** gets an application running and explains the two ownership profiles.
- **Core concepts** explains architecture, adapters, contracts and generated-code ownership.
- **Build** covers the frontend, Spring modules, offline behavior and components.
- **Design system** records Vireo's visual language, responsive composition, motion, async states, forms, recovery, localization and release-quality contracts.
- **CLI** covers creation, diagnostics, generation, integrity checks, ejection and upgrades.
- **Operate** covers deployment, security, accessibility and troubleshooting.

Use [Storybook](/storybook/) when an interactive state is more useful than prose. Use the [TypeScript and Java reference](/reference/) when you need an exact exported signature or JVM member.

For product-facing UI decisions, start with the [Design system](/docs/design-system/). It makes the accessibility and component principles concrete without taking ownership of your product identity or workflows.

## What Vireo owns

Vireo owns framework-level primitives and executable contracts: page composition, reusable UI behavior, query and history conventions, replaceable adapter slots, generator output rules, version metadata and supported migrations.

Your application owns domain rules, authorization policy, sensitive-data classification, transaction boundaries, conflict resolution and the meaning of its data. [Ownership boundaries](/docs/concepts/ownership-boundaries/) makes this distinction explicit.

## Current documentation line

You are reading the current **Vireo {{DOCS_VERSION}}** documentation. It maps to `create-vireo {{CREATE_VIREO_VERSION}}`, JVM modules `{{JVM_VERSION}}` and the exact release snapshot `{{EXACT_RELEASE_ID}}`.

The friendly documentation version is intentionally separate from individual package versions. See [Versions](/versions/) for the complete mapping.
