# Phase 4 — production hardening

Phase 4 turns existing production-oriented implementation into explicit, tested,
public contracts. Automation and independent/manual evidence are tracked
separately: a green CI lane cannot stand in for a security assessor, a physical
device, or a screen-reader user.

| ID      | Deliverable                           | Definition of done                                                                                                                                            | Current state                              |
| ------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `P4-00` | Readiness baseline and gate           | A dated baseline maps each claim to automation, manual evidence, an explicit limitation, and the Phase 4 gate.                                                | Done                                       |
| `P4-01` | Security posture (`G-301`)            | Threat model, deployment hardening guide, remediation policy, abuse cases, and automated authentication/security-header tests exist. Independent review open. | Engineering done; independent review open  |
| `P4-02` | Offline contract (`G-302`)            | Supported reads/mutations, durability, ordering, retries, conflicts, identity isolation, schema/version limits, recovery, diagnostics, and adversarial tests. | Done for the explicitly supported scope    |
| `P4-03` | Accessibility and platforms (`G-303`) | WCAG 2.2 AA target, automated axe/browser/PWA evidence, release checklist, and honest branded-browser/device/manual-AT evidence matrix.                       | Automation done; manual/device rows open   |
| `P4-04` | Performance budgets (`G-304`)         | Reproducible production-build and browser measurements enforce declared payload/runtime budgets; field and physical low-end evidence remain explicit.         | Lab budgets done; field/device rows open   |
| `P4-05` | Production operations (`G-305`)       | Backup, restore, supported PostgreSQL major upgrade, rollback, observability, deployment, and incident runbooks are exercised against real PostgreSQL.        | Automation done; target witness open       |
| `P4-06` | Release/project upgrades (`G-203`)    | Supported release-pair fixtures detect dependency, migration, wire-contract, generated-contract, and application-owned upgrade incompatibility.               | Engineering done; publish/hosted run open  |
| `P4-07` | Closure review                        | Production-readiness criteria are evaluated, known limitations are public, closed gaps cite reproducible evidence, and external/manual gates remain open.     | Done; production-readiness gate stays open |

## Evidence classes

- **Required merge automation:** deterministic checks that must pass on every
  relevant change.
- **Scheduled compatibility evidence:** costly real-database or cross-browser
  checks whose artifact records identify the tested version and command.
- **Manual evidence:** dated device, branded-browser, assistive-technology,
  recovery, or incident rehearsal performed from the published checklist.
- **Independent evidence:** review performed by someone who did not author the
  control being assessed.
- **Explicit limitation:** a behavior Vireo does not support or cannot honestly
  claim yet.

## Exit gate

Phase 4 closes only when the
[production-readiness criteria](production-readiness-criteria.md) pass. In
particular, automated evidence may close engineering work but cannot close the
independent security review, physical-device, branded Safari, manual
assistive-technology, or field-performance rows.

Phase 3's `P3-09` human workflow gate and Phase 4 execution may overlap. Neither
gate is silently waived by progress in the other phase.

See the dated [Phase 4 closure review](closure-review-2026-08-28.md). The
maintainer-automatable implementation is complete, but the Phase 4 exit gate is not:
independent, manual, physical-device, field, target-environment, and first hosted
0.3.0 release evidence remain open.
