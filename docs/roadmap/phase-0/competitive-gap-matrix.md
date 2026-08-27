# Phase 0 competitive gap matrix

Research date: 2026-08-26

Method: current official product and documentation sources

Status: desk-research baseline plus bounded 2026-08-27 AI hands-on review; complete
controlled replication remains a public-beta requirement

## 2026-08-27 adversarial update

An isolated research evaluator used current official sources and bounded clean
quickstarts. This is an AI proxy, not the protocol's independent human replication:

- Hilla generated a TypeScript endpoint client from Java and remains stronger than
  Vireo's manually duplicated Java DTO, TypeScript/Zod model, and Axios client.
- JHipster generated the broadest Spring/React application foundation and documents
  entity plus branch/merge upgrade generators; Vireo has neither full-stack entity
  generation nor a Template upgrade command.
- Refine remains stronger at headless provider/UI flexibility. Its exact documented
  v5 starter failed on a missing registry version during this bounded run; that is a
  version-specific result, not a universal product claim.
- react-admin's current official data-provider guidance includes persisted queries
  and resumable standard mutations. Vireo must not claim that frontend resumable
  CRUD is unique; its narrower distinction is coordinated browser/server
  idempotency and hydration primitives, which the public Template does not yet wire
  together.
- The manual Vite baseline was extremely fast and small, while leaving all
  full-stack integration decisions to the application.
- Vireo's best-evidenced distinction is its public, independently deployable
  React/Spring product baseline and unusually explicit responsive, loading, error,
  and application-ownership conventions.

Counterevidence remains explicit: “contract” must not imply generated Java-to-
TypeScript types, the former Template “Offline-first CRUD” page was only a
`localStorage` state simulation, app-owned code also means manual Template upgrade
work, and production/offline/bundle claims remain narrower than the architecture's
ambition.

This matrix compares target-developer outcomes, not component counts. It records
where established alternatives are stronger and where Vireo may earn a distinct
tradeoff. Absence from an official overview is not proof that a capability does not
exist.

## Outcome comparison

| Alternative                                                                                 | Officially emphasized strength                                                                                                   | What a target developer gets                                                                                                                | Vireo implication                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [JHipster](https://www.jhipster.tech/)                                                      | Broad generation for applications, entities, microservices, frontend choices, and deployments                                    | A mature, community-backed platform with unusually wide application and deployment generation; JDL can describe entities and deployments    | Do not compete on option count. Vireo must be smaller, more coherent, and visibly better at its chosen React/Spring operational-PWA workflow                                                                            |
| [Hilla](https://vaadin.com/hilla)                                                           | Direct Spring-to-React integration, generated TypeScript services/types, shared validation, routing, security, and UI components | The closest one-stack alternative for Java teams; Java browser-callable services become typed frontend calls                                | Treat Hilla as the strongest direct comparison. Vireo must prove value in conventional boundaries, MUI/TanStack composition, explicit offline workflow, and subsystem escape—not claim generic React/Spring superiority |
| [Refine](https://refine.dev/core/docs/)                                                     | Headless CRUD logic, backend/UI/router adapters, live behavior, and flexible React composition                                   | Rapid data-intensive React applications across many backend and UI choices; its CLI/browser scaffolder lowers evaluation friction           | Do not copy adapter breadth. Vireo must win only when Spring ownership, a cohesive visual system, and cross-stack operational behavior matter more than frontend agnosticism                                            |
| [React-admin](https://marmelab.com/react-admin/documentation.html)                          | Mature admin/B2B primitives, data providers, customization, documentation, demos, and commercial support                         | A deep and proven frontend framework for CRUD-heavy B2B SPAs with many integrations and stable learning material                            | Do not compete on frontend primitive count. Vireo needs credible full-stack and intermittent-connectivity outcomes while learning from react-admin's documentation and support maturity                                 |
| Manual [Spring Boot](https://spring.io/quickstart/) + [React/Vite](https://vite.dev/guide/) | Maximum ownership and direct access to each ecosystem                                                                            | Teams assemble exactly their preferred frontend, backend, API, auth, UI, offline, test, and deployment choices with no framework dependency | This is the default competitor. Vireo must save recurring integration and maintenance time while keeping code ordinary enough that adoption costs less than a private starter                                           |

## Capability and tradeoff detail

| Outcome                              | JHipster                                                                  | Hilla                                                                                                              | Refine                                                    | React-admin                                                                           | Manual stack                                         | Vireo baseline                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Create a full-stack React/Spring app | Major generator use case, with broader stack choices                      | First-class combined framework                                                                                     | Frontend scaffolder; backend supplied separately          | Frontend create paths; backend supplied separately                                    | Two ecosystems assembled by the team                 | Template exists but private; no create command                                               |
| Generate a complete domain slice     | Entity generator creates server and CRUD client files                     | Typed service/model generation and UI helpers; not the same ownership model as an ejectable domain-slice generator | CRUD UI generation from API/data structure                | Resource composition accelerates CRUD UI                                              | Application team writes or creates its own generator | Handwritten Item proof only; Phase 3 generator missing                                       |
| Java-to-TypeScript contract          | Generated application/client code varies by selected architecture         | Core strength: generated TypeScript endpoints and models from Java/OpenAPI                                         | Backend adapters and application-owned types              | Backend-agnostic data-provider contract and TypeScript APIs                           | Team selects OpenAPI/codegen/manual mapping          | One history fixture and parallel APIs; comprehensive strategy missing                        |
| Polished business UI                 | Generated frontend depends on selected stack and theme                    | Vaadin UI ecosystem plus arbitrary React components                                                                | Headless core with several supported UI frameworks        | Deep mature B2B component and hook catalog                                            | Entirely application-owned                           | Deep MUI-based system and Template proof; public demo/audit matrix missing                   |
| PWA/offline behavior                 | PWA options exist; exact data mutation guarantees require hands-on review | PWA shell/offline views are documented; arbitrary offline data workflows are not implied                           | Not a defining official overview claim                    | Cached queries and offline states exist; full mutation-sync guarantees require review | Entirely application-owned                           | SQLite/offline/history mechanisms exist; guarantees, conflicts, recovery, and pilots missing |
| Deployment breadth                   | Strong generated Docker/Kubernetes/OpenShift story                        | Production deployment documented inside Vaadin ecosystem                                                           | Follows selected React/runtime platform                   | Static/SPA deployment around chosen API                                               | Unlimited but manually integrated                    | Backend image and independent frontend artifacts; one canonical public path missing          |
| Escape and replacement               | Generated ordinary code, but breadth creates a large option surface       | Opinionated endpoint/build/runtime integration                                                                     | Headless adapters are a core design                       | Data/auth providers and hooks are established extension seams                         | Maximum flexibility                                  | Ordinary libraries/adapters are promising; formal extension model and eject story remain     |
| Adoption proof                       | Long-running project and large contributor community                      | Maintained and commercially supported by Vaadin                                                                    | Public docs, examples, community, and current scaffolding | Mature docs, demos, ecosystem, and paid support                                       | Ubiquitous ecosystem knowledge                       | Private pre-alpha; no independent adopter evidence                                           |

## Strategic conclusions

1. **Hilla prevents a vague “React + Spring, but integrated” position.** Vireo's
   differentiation must include conventional application ownership, its selected
   UI/data stack, explicit offline mechanisms, and tested escape hatches.
2. **JHipster prevents a breadth-led generation position.** Vireo should generate
   one excellent modular-monolith vertical slice before considering variants.
3. **Refine and react-admin prevent a component-count or CRUD-speed position.** Vireo
   must connect frontend quality to backend and offline outcomes those frameworks do
   not centrally own.
4. **The manual stack sets the adoption-cost ceiling.** Vireo loses if learning,
   credentials, upgrades, or abstraction cost more than maintaining a team's own
   starter.
5. **Offline alone is not yet a safe category claim.** PWA shells, cached reads, and
   offline pages exist elsewhere. Vireo needs demonstrable mutation queues,
   conflict ownership, replay, recovery, and field evidence.

## Capabilities Vireo should intentionally not copy

- JHipster's frontend/backend/deployment option breadth;
- Refine's and react-admin's backend-adapter breadth;
- a proprietary endpoint/runtime model as the only supported application boundary;
- a component-count race;
- generic microservice orchestration;
- claims that cached reads or an installable shell equal offline workflow safety;
- commercial-support expectations before maintainer capacity exists.

## Hands-on follow-up

The [hands-on benchmark protocol](competitor-benchmark-protocol.md) defines the
controlled conditions, shared equipment-inspection scenario, scoring, evidence,
bias controls, and publication gate. Before final positioning, run the same public
scenario against each alternative:

1. create a React/Spring inventory application;
2. add one related entity with validation and authorization;
3. make list/form behavior usable on a narrow viewport;
4. represent loading, failure, and reconnect behavior;
5. customize one subsystem outside the golden path;
6. build and deploy production artifacts;
7. record elapsed time, generated/handwritten code, failures, documentation hops,
   escape cost, and upgrade guidance.

The results must update this matrix at least twice yearly and before a major
positioning change.

## Primary sources

- JHipster: [platform overview](https://www.jhipster.tech/),
  [entity generation](https://www.jhipster.tech/creating-an-entity/),
  [JDL applications](https://www.jhipster.tech/jdl/applications/), and
  [JDL deployments](https://www.jhipster.tech/jdl/deployments/)
- Hilla: [product overview](https://vaadin.com/hilla),
  [Java endpoints](https://vaadin.com/docs/latest/hilla/guides/endpoints),
  [TypeScript generation](https://vaadin.com/docs/latest/hilla/lit/reference/endpoint-generator),
  and [PWA behavior](https://vaadin.com/docs/latest/flow/configuration/pwa)
- Refine: [framework overview](https://refine.dev/core/docs/) and
  [quick start](https://refine.dev/core/docs/getting-started/quickstart/)
- React-admin: [documentation index](https://marmelab.com/react-admin/documentation.html),
  [features](https://marmelab.com/react-admin/doc/5.9/Features.html), and
  [caching](https://marmelab.com/react-admin/doc/5.9/Caching.html)
- Manual stack: [Spring Quickstart](https://spring.io/quickstart/) and
  [Vite Getting Started](https://vite.dev/guide/)
