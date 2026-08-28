# Phase 3 — killer vertical-slice workflow

Phase 3 converts the handwritten Item proof into a reproducible, application-owned full-stack capability. Engineering completion and the external-user exit gate are tracked separately.

| ID      | Deliverable                  | Definition of done                                                                                                                                                      | Status                        |
| ------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `P3-00` | Scope and CLI coordinate     | The existing `create-vireo` package also ships `vireo`; no second unpublished package or hidden runtime is introduced.                                                  | Done                          |
| `P3-01` | Ownership contract (`G-206`) | Generated-once versus regenerated files, markers, hashes, collision/refusal rules, overwrite confirmation, and ejection are documented and tested.                      | Done                          |
| `P3-02` | Canonical entity schema      | Versioned JSON Schema and runtime validation cover names, fields, validation, query/UI metadata, permissions, capabilities, API, database, and localization.            | Done for schema v1            |
| `P3-03` | Wire contract (`G-205`)      | REST semantics, transport/domain separation, Zod parsing, derived contract artifacts, hashes, and one-sided drift checks are executable.                                | Done                          |
| `P3-04` | Backend generation           | Migration, entity, enums, DTO, mapper, repository, service, controller, query/history registration, and integration test are emitted.                                   | Done                          |
| `P3-05` | Frontend generation          | Models, API adapter, query-backed responsive CRUD page, route/navigation, localization, Storybook, and contract test are emitted.                                       | Done                          |
| `P3-06` | Generator safety             | Dry run, diff-plan alias, output directory, deterministic/idempotent output, unmanaged collision refusal, customization refusal, explicit overwrite, and ejection pass. | Done                          |
| `P3-07` | Generated fixture CI         | A realistic Purchase Order slice compiles and executes on frontend and backend from a clean created project.                                                            | Done; hosted fixture is green |
| `P3-08` | Documentation                | Schema, ownership, wire semantics, CLI workflow, limitations, and customization/ejection path are published.                                                            | Done                          |
| `P3-09` | External exit gate           | Unfamiliar users independently generate, run, customize, and report meaningful time saved.                                                                              | External validation required  |

## Schema v1 admission boundary

Schema v1 intentionally supports a generated Long identifier and scalar/enum fields. It refuses relationships, compound identifiers, Unicode/reserved identifiers, and offline generation with actionable errors. This prevents plausible-looking partial code. Relationship admission requires a second compiled relational fixture; offline generation follows Phase 4's guarantees and conflict model.

## Gate

The engineering gate is satisfied when local and hosted generated-fixture verification are green. Phase 3 itself remains externally unvalidated until `P3-09` is completed by unfamiliar humans; automated or AI runs do not count.
