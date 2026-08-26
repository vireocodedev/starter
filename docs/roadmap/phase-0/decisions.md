# Phase 0 decision queue

This log separates accepted execution decisions from product decisions that still
need evidence. Dates use UTC.

## Accepted

| ID    | Date       | Decision                                                                                                             | Reason                                                                                     |
| ----- | ---------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| D-001 | 2026-08-26 | Use the master roadmap as strategic intent and `docs/roadmap/` as the operational evidence layer.                    | Avoid turning a long-lived strategy document into a noisy task tracker.                    |
| D-002 | 2026-08-26 | Execute roadmap phases through focused, reviewable milestones with explicit exit evidence.                           | Keeps changes auditable and prevents unrelated checklist work from bypassing dependencies. |
| D-003 | 2026-08-26 | Treat the primary audience in the master roadmap as a working hypothesis, not a settled fact.                        | No unfamiliar target-developer interviews have been completed.                             |
| D-004 | 2026-08-26 | Keep exhaustive public API names in the existing machine-checked surface snapshots and index them from the baseline. | A copied export list would drift while adding no enforcement.                              |

## Open decisions

| ID    | Target   | Decision required                                                                                                                               | Evidence required before approval                              |
| ----- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| D-101 | Phase 0B | Primary and secondary personas, excluded personas, and supported project scale                                                                  | Maintainer goals plus target-developer interviews              |
| D-102 | Phase 0B | Top three product claims and the primary wedge: offline, vertical-slice generation, cohesive UX, production readiness, or cross-stack contracts | Message testing and competitor gap matrix                      |
| D-103 | Phase 0C | Public product name, domain, organization, social handles, npm scope, and Maven group                                                           | Trademark/search/package/domain checks                         |
| D-104 | Phase 0C | Canonical repository topology for framework, template, CLI, website, examples, and fixtures                                                     | Contributor and release-boundary analysis                      |
| D-105 | Phase 0D | Supported Node, npm, Java, Spring Boot, React, MUI, PostgreSQL, OS, and browser windows                                                         | Clean-room and CI matrix cost analysis                         |
| D-106 | Phase 1  | Public distribution targets and migration path away from private GitHub Packages                                                                | npm/Maven publication and provenance options                   |
| D-107 | Phase 2  | Minimal Template boundary versus separate examples/kitchen-sink application                                                                     | Template responsibility map and observed onboarding            |
| D-108 | Phase 2  | Canonical package manager and create-command name                                                                                               | Target-user expectations and supported matrix cost             |
| D-109 | Phase 3  | Canonical full-stack schema and generated-code ownership model                                                                                  | Smallest vertical-slice prototype and customization experiment |

## Decision discipline

Every approved product decision must record alternatives, evidence, consequences,
reversal cost, and the roadmap gate it unlocks. Decisions are revisited when new
external evidence contradicts their assumptions.
