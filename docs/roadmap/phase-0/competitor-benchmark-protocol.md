# Phase 0E hands-on competitor benchmark protocol

Prepared: 2026-08-26

Status: bounded AI-proxy quickstarts completed 2026-08-27; full controlled human
replication deferred to public beta

The Phase 0 AI-proxy run inspected every official quickstart and ownership model and
performed bounded hands-on checks where practical. It did not use the frozen neutral
API fixture, exhaust the 180-minute scenario for every alternative, or satisfy the
human/independent replication publication gate below. Comparative superiority claims
therefore remain prohibited.

This protocol converts the [desk-research comparison](competitive-gap-matrix.md)
into reproducible hands-on evidence. Maintainer runs inform product strategy but do
not replace unfamiliar-user interviews or onboarding sessions.

## Question

For the same operational React + Spring Boot workflow, what does each alternative
own, accelerate, complicate, or leave to the application team—and what evidence
would make Vireo worth its added dependency and learning cost?

The benchmark compares outcomes and ownership boundaries, not raw feature counts.

## Alternatives and starting boundary

| Alternative  | Starting point                                                                             | Boundary rule                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| JHipster     | Current stable official React monolith/gateway quickstart appropriate to the scenario      | Use generated backend/frontend/deployment capabilities without adding unofficial blueprints                       |
| Hilla        | Current stable official Spring Boot + React starter                                        | Use Hilla's supported endpoint/type/UI workflow and documented production build                                   |
| Refine       | Current stable official scaffold                                                           | Pair with the frozen neutral Spring Boot API fixture; do not credit the fixture as Refine functionality           |
| React-admin  | Current stable official scaffold                                                           | Pair with the same frozen neutral Spring Boot API fixture; do not credit the fixture as react-admin functionality |
| Manual stack | Current stable Spring Initializr project plus current stable Vite React TypeScript project | No private starter, copied Vireo code, or organization-specific generator                                         |
| Vireo        | Audited Starter Template in published-package mode                                         | Record private credentials and missing generator steps as product friction; do not use local-source shortcuts     |

The neutral API fixture for frontend-only alternatives contains only ordinary Spring
Boot CRUD endpoints, authentication test identities, validation responses, and an
OpenAPI description for the benchmark domain. It must not include Vireo packages,
frontend-specific adapters, generated clients, offline queues, responsive UI, or
benchmark answers. Freeze its commit before the first run.

## Standard scenario

Build an equipment-inspection application with:

- `Equipment`: identifier, display name, location, and active state;
- `Inspection`: equipment reference, result enum (`PASS`, `FAIL`, `FOLLOW_UP`),
  notes with a 2,000-character maximum, inspected-at timestamp, inspector identity,
  and version;
- role-restricted create/edit for `INSPECTOR`, read access for `VIEWER`, and
  server-enforced authorization;
- database migration and restart-safe persistence;
- equipment and inspection list views with pagination, sorting, text/result/date
  filters, empty/loading/error states, and narrow-viewport usability;
- create/edit validation shown at useful fields and for server/business errors;
- one test each for backend authorization, validation/wire behavior, frontend form
  behavior, and a browser happy path;
- an explicit reconnect design for an inspection submitted during temporary network
  loss, including what is queued, retried, conflicted, or rejected; and
- production frontend/backend artifacts plus the documented deployment entry point.

Offline mutation implementation is recorded when the alternative owns a supported
path. Otherwise the evaluator must document the missing mechanism and application
work; a speculative design does not count as completion.

## Escape-hatch task

After the golden path works, replace or bypass one material subsystem without
forking the framework. Use the closest meaningful task for the alternative:

- replace the default list/table presentation while preserving data behavior;
- call an application-owned Spring endpoint outside generated CRUD;
- customize authorization with a domain rule; or
- replace a generated/client abstraction at one boundary.

Record which files and contracts are framework-owned, generated-and-editable,
application-owned, or opaque. A documented extension point scores differently from
patching generated output that will be overwritten.

## Controlled conditions

Each run must use:

1. the same machine class, network class, database major, Git configuration, editor,
   and container policy;
2. empty project, dependency, build, and browser caches unless a warm-cache run is
   explicitly separate;
3. stable releases available on the recorded run date—no nightly, beta, snapshot,
   local fork, or unreleased fix;
4. the alternative's official quickstart and documentation as the initial entry;
5. ordinary web search, issue trackers, and built-in command help, with every
   documentation hop recorded;
6. no generative AI, maintainer backchannel, paid consulting, or product-specific
   expert assistance in the canonical run;
7. no code copied between alternatives except the frozen domain specification and
   neutral API fixture where assigned; and
8. a 180-minute active-work timebox, pausing the active timer for deterministic
   dependency downloads/build waits while retaining wall-clock time.

If an alternative cannot complete the scenario inside the timebox, retain the
partial result and mark every unfinished outcome. Do not continue privately and
report only the finished state.

## Run sequence

1. Capture machine, toolchain, alternative version, official starting URL, cache
   state, and start time.
2. Create and run the unmodified starter; record time to first browser success.
3. Locate architecture, data, authorization, test, and deployment boundaries.
4. Implement the domain and persistence model.
5. Implement API, authorization, validation, and wire behavior.
6. Implement desktop/narrow UI and async/error states.
7. Add the required tests.
8. Address the reconnect/offline task.
9. Complete the escape-hatch task.
10. Produce and inspect deployment artifacts.
11. Locate version compatibility, upgrade, migration, and troubleshooting guidance.
12. Run verification, capture failures/artifacts, and stop the clocks.

Do not reorder failed steps to hide a blocker. Later independent work may proceed if
the evaluator records the deviation and its reason.

## Evidence captured per run

### Quantitative

- active and wall time to first run and each scenario milestone;
- dependency/install/build wait time;
- commands executed and failed commands;
- documentation pages/searches/issues opened;
- generated, scaffolded, and handwritten files changed;
- maintainer/evaluator interventions and retries;
- tests created and passing/failing counts;
- frontend raw/gzip output, backend artifact, container image, and build-context
  sizes where comparable; and
- production build and deployment-smoke outcome.

Line counts are descriptive only. Generated volume does not imply value, and fewer
lines do not imply maintainability.

### Qualitative

- clarity of ownership and overwrite boundaries;
- validation and authorization consistency;
- responsive/loading/error behavior supplied versus application-authored;
- type/wire drift prevention;
- offline/reconnect guarantees and missing policy;
- error actionability and recovery path;
- degree of lock-in and escape cost;
- production, security, compatibility, and upgrade guidance; and
- surprising strengths, failures, and counterevidence to Vireo's positioning.

## Outcome scoring

Score only after preserving raw observations. Each dimension is 0–3:

| Score | Meaning                                                                                       |
| ----: | --------------------------------------------------------------------------------------------- |
|     0 | Not completed or no supported path found in the timebox                                       |
|     1 | Possible with substantial custom work, unclear ownership, or rescue                           |
|     2 | Completed with documented application work and understandable boundaries                      |
|     3 | Completed through a first-class supported path with strong verification and recovery guidance |

Dimensions:

1. create and first run;
2. complete cross-stack domain change;
3. wire/type/validation coherence;
4. authorization correctness and clarity;
5. polished responsive async workflow;
6. reconnect/offline mechanism and honesty;
7. tests and failure diagnostics;
8. escape/customization ownership;
9. production artifacts and operations guidance; and
10. compatibility/upgrade guidance.

Never collapse the result into a single winner score without the dimension table.
The strategic question is which tradeoff fits the target job.

## Replication and bias controls

- Run the manual stack first to calibrate the task, but randomize the five framework
  alternatives afterward.
- The person most familiar with Vireo must not be the only evaluator. Label
  maintainer-authored runs and repeat decisive findings with an independent
  evaluator before using them publicly.
- Repeat any run affected by an upstream outage, corrupt cache, rate limit, or
  unrelated machine failure; retain both records.
- Let alternative maintainers review factual descriptions after the report is
  drafted, without giving them control over Vireo conclusions.
- Report version/date limitations and avoid generalizing one failed command to an
  entire product.
- Rerun before a major positioning change and at least twice yearly after public
  launch.

## Publication gate

A comparative result may enter public positioning only when:

1. every alternative has a complete or timeboxed run under the same protocol;
2. source links, versions, commands, measurements, and failure artifacts are
   retained;
3. at least one evaluator not responsible for Vireo implementation has replicated
   the decisive scenarios;
4. claims describe the tested versions and outcome rather than universal product
   superiority;
5. security-sensitive data and credentials have been removed; and
6. the competitive matrix records counterevidence and changes to Vireo strategy.

Until then, results are internal benchmark evidence and the existing desk-research
matrix remains explicitly provisional.
