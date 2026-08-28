# Phase 5 public-beta evidence criteria

Status: **engineering scope substantially complete; public-beta decision HOLD**.

## Public evaluation contract

| Claim surface        | Required evidence                                                                                | Current disposition                       |
| -------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| First run            | Anonymous `npm create vireo@latest`, doctor, setup, and clean verification                       | Automated evidence exists; human row open |
| Killer workflow      | Generate, run, customize, eject, and upgrade a realistic application-owned vertical slice        | Automated fixture exists; human row open  |
| Flagship quality     | Responsive seeded application, accessible critical journey, explicit supported/unsupported scope | Engineering evidence complete             |
| Hosted evaluation    | Public revision, health, journey, reset policy, monitoring history, and incident contact         | Complete; best effort, no SLA             |
| Production readiness | Phase 4 independent security/manual accessibility/device/field/target-environment evidence       | Open; no public-beta readiness claim      |
| Independent adoption | Three unaffiliated active teams and one maintained production-like deployment through an upgrade | No qualifying team recorded               |
| Feedback evidence    | Structured privacy-safe intake, triage, aggregate validation, and explicit gate status           | Engineering evidence complete; gate HOLD  |

## Qualifying external workflow session

A session counts only when the participant is unfamiliar with the implementation,
uses public instructions and artifacts, receives no hidden credentials, and is not
guided through the successful path. Record only privacy-reviewed aggregate data:

- task attempted and public revision;
- completion, time, help required, and blocking diagnostic code;
- application-owned change and whether it survived regeneration or upgrade;
- perceived time saved and the participant's most important objection;
- opt-in follow-up status without committing identity or confidential source.

## Qualifying active team

An active team controls a non-fixture application, makes application-owned changes,
has used Vireo across at least two working sessions, and consents to an anonymized
aggregate record. A production-like deployment must additionally exercise the
documented database, backup/restore, monitoring, and upgrade path under that team's
control.

## Hold conditions

Do not declare public beta ready when any of these is true:

- a critical/high security finding is unresolved;
- public creation, verification, provenance, or the supported upgrade pair is red;
- the flagship lacks an honest reset/privacy/availability boundary;
- fewer than three qualifying teams are active or no qualifying deployment exists;
- known limitations or support boundaries are contradicted by public copy.
