# Architecture

Vireo has two independently consumable library families in one repository:

- public npm packages and `create-vireo` under `packages/*`; and
- a coordinated Spring Boot module family under `jvm/*`, published as
  `com.vireocode` artifacts.

The repository is shared for review and release coordination, not because the
builds are coupled. npm and Gradle have separate dependency resolution,
verification, publication, and consumer qualification paths.

Application-level composition and ownership boundaries are documented in the
[frontend-only profile](architecture/frontend-only-profile.md),
[wire-contract guide](architecture/wire-contracts.md), and public
[Vireo documentation](https://vireocode.com/docs/).

## Frontend package graph

Workspace manifests are the source of truth. The npm package graph is deliberately
flat: only `@vireocodedev/ui` depends on sibling Vireo packages.

```mermaid
graph TD
  ui[@vireocodedev/ui] --> history[@vireocodedev/history]
  ui --> infrastructure[@vireocodedev/infrastructure]
  ui --> localization[@vireocodedev/localization]
  ui --> query[@vireocodedev/query]
  create[create-vireo]
  shell[@vireocodedev/shell]
  sqlite[@vireocodedev/sqlite]
```

| Package                        | Vireo sibling dependencies                           |
| ------------------------------ | ---------------------------------------------------- |
| `create-vireo`                 | None                                                 |
| `@vireocodedev/history`        | None                                                 |
| `@vireocodedev/infrastructure` | None                                                 |
| `@vireocodedev/localization`   | None                                                 |
| `@vireocodedev/query`          | None                                                 |
| `@vireocodedev/shell`          | None                                                 |
| `@vireocodedev/sqlite`         | None                                                 |
| `@vireocodedev/ui`             | `history`, `infrastructure`, `localization`, `query` |

This keeps each non-UI library independently consumable. The public API policy
and package export maps, rather than source layout, define supported imports.

## JVM modules

The JVM family is aligned through `com.vireocode:vireo-bom`. Applications import
the BOM and select only the modules they use; no module is an executable
application. The current modules and consumer guidance are in the
[Spring Boot guide](https://vireocode.com/docs/spring/) and
[public API map](PUBLIC_API.md).

## Contract boundaries

- Applications own domain behavior, authorization, data, deployment, and offline
  conflict policy.
- `create-vireo` projects an immutable Vireo Template baseline; generated source
  becomes application-owned except for explicitly managed surfaces.
- Public npm exports, JVM declarations, generators, schemas, and documented wire
  contracts change only with their declared compatibility and release intent.

See [the ecosystem contract](ECOSYSTEM_CONTRACT.md) for cross-repository release
ownership and [compatibility](COMPATIBILITY.md) for the versioning promise.
