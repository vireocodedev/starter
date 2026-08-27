# Phase 0 AI-proxy evaluation record

Evaluation date: 2026-08-27

Status: complete for the owner-approved D-110 Phase 0 variance; not human research

## Decision boundary

This record supports a provisional product/audience decision and a technical Phase 0
closure. It records no interview, participant, adoption intent, purchase intent,
production use, or product-market-fit signal. All evaluators were AI agents placed
in fresh, context-free sessions. Human target-developer validation remains deferred
to public beta after the first three independent adopters or before a 1.0
commitment, whichever comes first.

The public evaluation baseline was frozen before local remediation:

- framework: `4ff38f697403af977fd7825cbe2967c0f9968f45`;
- Template: `ee5ecd251fa30655133e833b93de681bf2171c5c`;
- source access date: 2026-08-27; and
- no evaluator received the local roadmap, private credentials, pre-existing
  workspace, or another evaluator's conclusions.

Local closure commits are evidence of remediation, not the blind baseline. They
remain unpushed at the time of this record.

## Environment and public-boundary proof

The technical runs used Ubuntu Linux 6.8 x86_64 in Europe/Zagreb with Java 21.0.2,
Node 24.18.1, npm 12.0.2, Git 2.34.1, and repository Gradle 9.7.1 wrappers. The
competitor run also recorded Maven 3.6.3, pnpm 8.15.7, and Docker 29.1.3.

- Anonymous `git ls-remote` resolved both public repositories at the frozen commits.
- `corepack npm run release:verify-public` passed at `2026-08-27T11:08:10Z`:
  seven `0.2.1` packages, 22 entry points, a cold anonymous install, 162 verified
  registry signatures, and 55 verified provenance attestations.
- `./jvm/scripts/verify-central-consumer.sh 0.2.0` passed with a fresh temporary
  Gradle home against only Maven Central: six BOM/module coordinates and three
  consumer tasks.
- The public Template referenced only the six required npm `^0.2.1` packages and
  Maven BOM/modules `0.2.0`; no organization credential or local substitution was
  required.

## Blind message comparison

Six fresh evaluators received only one of three candidate messages: two each for A,
B, and C. They were asked to identify category, audience, repeated work/outcome,
framework versus application ownership, offline limits, and objections. No evaluator
was rescued or shown another answer.

The maintainer's rubric synthesis was:

| Candidate                       | Evaluators | Category | Audience | Outcome | Ownership | Offline limit | Total     |
| ------------------------------- | ---------- | -------- | -------- | ------- | --------- | ------------- | --------- |
| Original A, cohesive foundation | 2          | 1        | 1        | 2       | 1         | 1             | 6/10 each |
| B, intermittent connectivity    | 2          | 1        | 1        | 1       | 1         | 1             | 5/10 each |
| C, vertical-slice generation    | 2          | 1        | 1        | 1       | 1         | 1             | 5/10 each |

Original A conveyed the broad React/Spring foundation and repeated-work outcome but
underspecified category, the small-team audience, ownership, and offline boundaries.
B explained queue/replay mechanics but made the product sound like an offline
library. C conveyed cross-stack coherence but implied a generator that does not
exist and omitted offline limits.

The revised message was then frozen and shown independently to five new evaluators:

> Ship polished operational apps without rebuilding the React/Spring foundation.
>
> Vireo Framework is an opinionated full-stack framework for small teams building
> operational business apps with React and Spring Boot. It supplies a
> production-shaped application path, responsive UI, explicit cross-stack
> contracts, and offline building blocks so teams avoid rebuilding integration
> foundations. Applications remain ordinary React and Spring Boot code: teams own
> domain rules, authorization policy, and conflict resolution, and can replace
> subsystems. Offline-capable means selected workflows can read local data and queue
> and replay work through temporary network loss; it does not mean arbitrary
> workflows synchronize or resolve conflicts automatically.

All five independently identified category, audience, outcome, ownership, and the
offline boundary: `2/2` on each dimension, `10/10` each. They also consistently
objected that “polished,” “production-shaped,” explicit contracts, replaceability,
selected-workflow limits, and reduced integration work require concrete proof. This
passes the AI comprehension threshold but provides no human demand evidence.

## Isolated public onboarding

The clean evaluator used a unique temporary directory and caches, the public
Template URL, no local repository, no credentials, and no maintainer hints or
rescue. Its task was to inspect the project, follow the documented setup, make one
bounded change, and locate the application-ownership escape hatch.

The run used Template commit `ee5ecd251fa30655133e833b93de681bf2171c5c`
from `2026-08-27T12:57:15+02:00` to approximately
`2026-08-27T13:29:00+02:00` in `/tmp/vireo-clean-onboarding-k9hlAC`. It used empty
task-specific npm, Corepack, and Gradle homes. No local workspace, substitution,
private token, or GitHub Packages credential was used.

The evaluator chose `README.md` first, then the getting-started and customization
guides. It understood Vireo as a production-shaped React/Vite PWA plus Spring Boot
starter, with application composition and domain slices in the Template and
reusable behavior in published npm/Maven artifacts.

| Milestone                                 | Result from session start                                     |
| ----------------------------------------- | ------------------------------------------------------------- |
| Public clone                              | Pass, about 5.2 s                                             |
| Empty-cache `npm ci`                      | Pass, about 12.8 s; 691 packages; no reported vulnerabilities |
| Frontend                                  | Pass at about 4m01s; Vite ready in 143 ms                     |
| Backend on documented H2 path             | Pass at about 6m15s                                           |
| Existing browser login and Item lifecycle | Pass by about 7m12s                                           |

The first frontend bind failed with sandbox `EPERM`; the first backend launch found
a transient port-8080 collision. Each was retained for at least three minutes before
retry and neither required a Vireo hint. Registry credentials were never requested.
The backend's useful port error was buried under extensive Spring debug output; npm
also warned about a blocked esbuild install script even though dev/build passed.

Afterward, the evaluator correctly separated application-owned backend slices,
migrations, policy, registries, frontend routes/features/localization/theme, and
presentation from framework-owned Maven and npm primitives. Published Axios/query
wrappers and localization setup appeared hybrid. No rescue or maintainer knowledge
was provided during first run.

### First realistic change

The evaluator located the Item-shaped extension boundary in under one minute and
implemented an Inspection capability with equipment reference,
`PASS`/`FAIL`/`FOLLOW_UP`, notes, inspected-at time, validation, and role-restricted
editing. The temporary clone gained:

- a Flyway migration and backend entity, enum, DTO, repository, mapper, service,
  controller, history/query registrations, and authorization expressions;
- frontend Zod/API/query/form code, routes, navigation, localization, and a
  responsive card list;
- backend integration tests for privileged writes, ordinary-user read/forbidden
  write, blank equipment reference, and future inspected-at rejection; and
- frontend model tests plus an Inspection browser scenario.

Backend authorization was authoritative; frontend role checks only hid edit
affordances. The evaluator correctly kept writes network-only: failure remains
visible and the form stays open. It described durable offline writes as future work
requiring encrypted persistence, idempotency, ordered replay, server authorization
recheck, conflict/pending UX, and reconciliation.

The change required more than 1,050 handwritten lines, 24 new core/test files, and
manual registry edits. Four fields were repeated across Java DTO/entity/mapper,
TypeScript/Zod/API/form/localization, registries, and tests. No full-stack entity
generator existed; only the Starter UI component generator was found. This is a
cost and Phase 3 opportunity, not a Phase 0 blocker because current messaging no
longer promises generation.

Typecheck, backend 14-test suite, architecture gate, lint, format check, three model
tests, full 31-file/92-test frontend suite, production/PWA build, bundle budget, and
`git diff --check` passed. The final new Inspection browser rerun is explicitly
unverified: three attempts exposed a login race, missing public Day.js UTC/locale
initialization, and an exact-seconds parser requirement. The evaluator fixed the
default from minute to second precision and reran targeted type/model checks, but
the parent stopped further exploration before a fourth full-stack attempt.

Those temporal failures are a major Phase 1 documentation/API finding. The public
package's `sideEffects` behavior removes expected Day.js initialization, and a
minute-precision `datetime-local` value produces only the generic “Enter a valid
date time” diagnostic. An application author had to infer both from runtime logs and
installed artifacts.

### Escape hatch

The evaluator directly implemented the Inspection presentation as an app-owned,
181-line MUI card grid instead of `VireoResponsiveTable`. API, queries, models,
validation, and form code were unaffected. This demonstrates low presentation/data
coupling, with moderate continuing coupling to MUI and Vireo shell/form/overlay/query
contracts. The team must reimplement or forego table sorting, preferences, compact
pagination/infinite-query behavior, and table-specific accessibility when taking
that escape hatch.

No rescue, credential exposure, local-repository access, commit, or push occurred.
The dirty temporary clone was retained only until its findings could be recorded.

## Adversarial competitor review

One fresh evaluator used official sources and bounded clean quickstarts for Vireo,
Hilla/Vaadin React, JHipster, Refine, react-admin, and a manual Vite/React baseline.
The full controlled neutral-fixture protocol and independent human replication were
not run, so the evidence supports tradeoff boundaries rather than superiority.

Observed hands-on results included:

- Vireo Template: npm install passed in 7.51 s; Spring started against documented
  H2 in 4.525 s after Gradle/dependency work; Vite was ready in 164 ms; public probes
  returned HTTP 200; production build passed in 14.59 s with a >500 kB chunk warning.
- Hilla: its public skeleton generated a TypeScript endpoint client from Java and
  ran through one Maven-coordinated workflow after an unrelated port collision.
- JHipster 9.2.0: default React application generation passed in 20.38 s and produced
  a substantially broader secured full-stack foundation.
- Refine: the exact official v5 example failed reproducibly because npm could not
  resolve `@refinedev/core@^5.1.0`; this is bounded to that example/date.
- react-admin: scaffold passed in 24.47 s and build in 4.97 s, with a >500 kB chunk
  warning; official guidance includes persisted queries and resumable standard CRUD
  mutations.
- Manual Vite/React: scaffold passed in 0.70 s, install in 4.74 s, and build in
  1.43 s; full-stack integration remained application work.

The strongest counterevidence was retained:

- Hilla is stronger at generated Java-to-TypeScript endpoint contracts.
- JHipster is stronger at full-stack entity generation and upgrade automation.
- Refine and react-admin are stronger at headless/frontend provider breadth.
- Manual assembly gives maximum ownership and a much smaller blank frontend.
- Vireo's Java DTO, TypeScript/Zod model, and Axios client are manually duplicated.
- Vireo has no public application/entity generator or Template upgrade command.
- react-admin weakens any claim that resumable frontend CRUD is unique.
- Vireo's offline libraries are credible, but the public Template did not consume
  them; its page labeled “Offline-first CRUD” only mutated `localStorage` state.
- “Production-shaped” is supportable; “production-ready,” “offline-first out of the
  box,” “contract-generated,” and “full-stack generator” are not.

The defensible wedge is a public, independently deployable React/Spring product
baseline with modular artifacts, app-owned composition, and unusually explicit
responsive/loading/error conventions. Offline remains an opt-in browser/server
primitive set until a public application wires it end to end.

## Remediation triggered by evaluation

The closure work corrected evidence-backed public contradictions:

- replaced stale private-registry/prerequisite/version language with the active
  public npm/Maven boundary and precise `0.x` maturity language;
- stated that teams own domain rules, authorization policy, conflict resolution,
  and manual upstream Template ports;
- renamed the Template page to “Offline state simulation” and disclosed that replay
  changes local display state only, with no server, idempotency, or conflict logic;
- localized the simulation page and session-expiry toast;
- explicitly loaded the Croatian Day.js locale;
- preserved the UI package's Day.js UTC/locale initializer through consumer tree
  shaking, added a packed-tarball bundle regression assertion, and documented exact
  canonical seconds; and
- added an explicit Template UTC initialization guard for published `0.2.x`.

Template typecheck, lint, 89 tests, and production build passed after those changes.
The known >500 kB chunk warning remains public evidence rather than being hidden.

## Rescues and finding classification

No evaluator received a product hint, code path, command, local package, credential,
or expected answer. The clean evaluator's sandbox bind retry and unrestricted
Gradle/server execution were environment permissions, not Vireo guidance; both
original failures remained visible for at least three minutes. The coordinating
agent stopped further change exploration after the bounded evidence was sufficient,
so the final new Inspection browser rerun is unverified rather than represented as
a pass. A separately started redundant clean run was stopped and contributed no
evidence.

- **Blockers:** none remained after public npm/Maven verification and bounded
  documentation/source remediation.
- **Major, fixed:** misleading Template offline label; hard-coded/localization
  contradictions; tree-shaken UI temporal runtime setup; stale private/public
  distribution and maturity wording.
- **Major, registered/deferred:** zero human demand evidence; professional identity
  clearance; stale external GitHub metadata; missing full controlled competitor
  replication; comprehensive executable temporal docs; broader security/SBOM/
  recovery and supported-platform evidence; unintegrated public offline workflow.
- **Minor/observational:** verbose Spring failure output, esbuild script-policy and
  Flyway/H2 warnings, >500 kB chunks, manual version pairing/upstream ports, and
  incomplete new-probe mobile/accessibility/Storybook/browser coverage.

## Acceptance criteria

| #   | Result                  | Evidence                                                                                                                                       |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pass                    | Anonymous npm and Maven consumers passed.                                                                                                      |
| 2   | Pass                    | Frozen public Template used only registry npm/Maven artifacts.                                                                                 |
| 3   | Pass                    | Five of five final evaluators scored `10/10`, with category and ownership `2/2`.                                                               |
| 4   | Pass                    | Fresh public evaluator reached frontend, backend, and working browser app without rescue.                                                      |
| 5   | Pass                    | Distribution/coordinates are active; professional clearance is disclosed as G-002.                                                             |
| 6   | Pass at closure commits | Ownership/offline/maturity/generation/production wording and temporal runtime behavior were corrected; commits remain unpushed by instruction. |
| 7   | Pass                    | Every blocker/major issue is fixed, accepted under D-110, or assigned to a gap/phase.                                                          |
| 8   | Pass                    | D-101/D-102 are provisionally resolved from combined evidence.                                                                                 |
| 9   | Pass                    | Human demand validation is explicitly deferred and never marked complete.                                                                      |
| 10  | Pass                    | Phase 1 backlog closes published-artifact work and estimates only the current remainder.                                                       |

## Phase 0 interpretation

| Question                                                             | AI-proxy finding               | Limitation carried forward                              |
| -------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------- |
| Is the final category/audience/ownership/offline message understood? | Yes, 5/5 at 10/10              | No human demand or preference signal                    |
| Can public artifacts be consumed without organization credentials?   | Yes                            | Public support still requires wider clean-room evidence |
| Can an isolated evaluator follow the public Template path?           | See clean run above            | One AI run is not a human onboarding rate               |
| Is the positioning honest against alternatives?                      | Provisionally, after narrowing | Full neutral-fixture and human replication deferred     |
| Is the product production-ready or offline-first out of the box?     | No                             | Phase 4 guarantees and integrated public proof remain   |

This evidence is sufficient only for the exact D-110 variance. It must not be cited
as target-user validation, comparative superiority, independent adoption, or legal
clearance.
