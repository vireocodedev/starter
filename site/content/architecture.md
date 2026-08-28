# Architecture

Vireo separates reusable framework behavior, generated capability boundaries and application-owned product decisions. The separation is designed to stay visible in code, tests and release metadata.

## Major layers

| Layer                   | Responsibility                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Application composition | Routes, adapters, product theme, authorization decisions and domain workflows                    |
| Generated capability    | Reviewable transport, page and optional backend skeleton derived from a versioned schema         |
| Frontend packages       | UI behavior, query conventions, history, localization, shell and offline primitives              |
| JVM modules             | Core contracts, auth helpers, query, history and offline-supporting primitives                   |
| CLI                     | Project creation, diagnostics integration, generation, checking, ejection and supported upgrades |

No layer is intended to hide the domain. Generated code creates a consistent place for domain work; it does not make domain decisions.

## Frontend request path

```text
Page and form
  → application capability API
  → configured adapter slot
  → mock adapter or company HTTP adapter
  → authoritative backend
```

The UI depends on the application contract rather than importing Axios calls throughout the component tree. That makes ownership and testing explicit.

## Full-stack request path

```text
React page
  → typed frontend transport
  → Spring controller DTO
  → application service
  → repository and database
```

The generated wire contract detects accidental divergence between the transport edges. Domain validation and authorization remain server responsibilities.

## Independent release lines

Frontend npm packages, the CLI and JVM modules use independent semantic versions. A friendly Vireo documentation release maps those exact artifacts into one tested snapshot. See [Versions](/versions/).

## Escape hatches

- Replace adapters without forking framework packages.
- Consume only selected npm or JVM modules.
- Generate a standalone output tree with `--output` before adoption.
- Eject a capability to retain its code while removing Vireo management.
- Keep application-owned behavior outside generated files.

Next, read [Ownership boundaries](/docs/concepts/ownership-boundaries/) and [Wire contracts](/docs/concepts/wire-contracts/).
