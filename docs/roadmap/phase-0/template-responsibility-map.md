# Starter Template responsibility map

Audited against sibling repository `starter-template` at commit
`f73df577a0568a4a6aaedb7d39b0e21c37c38160` on 2026-08-26. The misspelled local
directory name is not treated as a public naming decision.

The Template currently proves considerably more than a minimal starter. This map
defines ownership categories before Phase 2 decides what stays in the golden path
and what moves to a separate examples application.

## Responsibility categories

| Category               | Meaning                                                                             | Default disposition                                                  |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Framework composition  | Wiring required to make the published Vireo libraries work together                 | Keep minimal and make the boundary executable.                       |
| Replaceable adapter    | Application-owned integration behind a Vireo contract                               | Keep one documented default with a clear replacement seam.           |
| Product example        | Concrete business behavior demonstrating the golden path                            | Keep one coherent vertical slice, not a catalog.                     |
| Developer tool/example | Teaching, diagnostics, or capability demonstration outside the shipped product      | Move to or expose through a dedicated examples/kitchen-sink surface. |
| Reusable candidate     | Composition that may belong in Starter after independent API and maintenance review | Do not extract merely to reduce Template code.                       |

## Frontend map

| Path/area                                                                                                      | Responsibility                                       | Notes                                                                                                               |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `frontend/src/app/` providers, clients, page registry, shell, theme, localization, preferences, and PWA wiring | Framework composition and replaceable adapters       | This is the main integration contract. App-specific clients and policy must remain replaceable.                     |
| `frontend/src/features/item/`                                                                                  | Product example                                      | The only complete domain slice and therefore the strongest golden-path proof.                                       |
| `frontend/src/features/history/`                                                                               | Replaceable adapter plus product-example integration | Proves history contracts against the Item flow.                                                                     |
| `frontend/src/features/entity-query-filters/`                                                                  | Reusable candidate                                   | Valuable cross-entity composition, but extraction needs a stable public contract and a second consumer.             |
| `frontend/src/pages/home/`                                                                                     | Product example                                      | Overview/landing content is Template-specific.                                                                      |
| `frontend/src/pages/items/`                                                                                    | Product example                                      | Route composition for the Item vertical slice.                                                                      |
| `frontend/src/pages/login/`, `settings/`, `forbidden/`, `not-found/`                                           | Framework composition plus product presentation      | Keep only the behavior necessary to explain auth, preferences, and routing.                                         |
| `frontend/src/pages/dev-tools/` and its capability pages                                                       | Developer tool/example                               | Fifteen broad demonstrations make the Template a kitchen sink. They should not define the minimal adoption surface. |
| Storybook stories, mocks, and test providers                                                                   | Developer tool/example                               | Keep with the component or scenario they verify; distinguish public examples from internal fixtures.                |
| Page headers, layouts, route-loading compositions, and async-state patterns                                    | Reusable candidates                                  | Evaluate through repeated consumers and component-authoring contracts before moving into Starter UI.                |

The page registry currently combines one eager Overview route with lazy Item,
settings, developer-tool, and example routes. Route ownership should remain explicit
when the minimal/examples split is designed.

## Backend map

| Path/area                                                                   | Responsibility                                 | Notes                                                                                    |
| --------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `backend/src/main/.../MainApplication.java` and Gradle/configuration wiring | Framework composition                          | Minimal executable Spring Boot host.                                                     |
| `app/auth/`                                                                 | Replaceable adapter                            | Application security expressions and role policy around Starter auth contracts.          |
| `app/history/`                                                              | Replaceable adapter                            | Actor and persistence integration for history.                                           |
| `app/query/`                                                                | Replaceable adapter                            | Domain query resolver integration.                                                       |
| `app/item/`                                                                 | Product example                                | Full CRUD vertical slice and cross-stack contract proof.                                 |
| `config/Health*`, `Session*`, security configuration                        | Framework composition and replaceable adapters | Production defaults need explicit support and threat-model decisions.                    |
| `config/DevBootstrapConfig`                                                 | Developer tool/example                         | Development-only sample data/bootstrap behavior.                                         |
| H2 and PostgreSQL migrations                                                | Product example plus framework proof           | Demonstrate supported persistence, but the supported database policy is not yet settled. |
| Backend tests and fixtures                                                  | Inherit owner                                  | A test belongs with the production responsibility it proves.                             |

## Cross-repository boundaries

| Boundary                                    | Current enforcement                                            | Baseline status                                                                     |
| ------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Published versus local Starter dependencies | Template architecture and published-boundary checks            | Strong partial: private registries prevent credential-free proof.                   |
| TypeScript public API                       | Per-package `api-surface.json` snapshots and API checks        | Strong, with a large UI surface that needs deliberate review.                       |
| JVM public API                              | Per-module `api-surface.txt` snapshots and API checks          | Strong.                                                                             |
| Shared wire contracts                       | `contracts/history-record.json`                                | Partial: history is covered, but no comprehensive cross-stack schema policy exists. |
| Loading-state behavior                      | Shared loading standard and automated geometry/contract checks | Strong for current audited flows; not yet a universal component-authoring gate.     |
| Generator ownership                         | Starter owns a React component generator                       | Partial: no project create/doctor/upgrade or full-stack entity generator.           |

## Phase 2 decision to make

Recommended target:

1. keep the framework composition small and explicit;
2. retain one replaceable default per integration seam;
3. retain the Item flow as the single end-to-end product example;
4. move the broad developer-tool catalog to an examples/kitchen-sink application;
5. extract reusable candidates only when their API is independently valuable,
   documented, tested, and supported by more than one real composition.

The map is evidence for decision D-107, not approval of that target. Observed
onboarding must show whether the split improves comprehension and time to first
successful change.
