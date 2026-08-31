# Phase 0 audience and positioning validation protocol

Protocol version: 1.0

Prepared: 2026-08-26

Status: human fieldwork deferred to public beta; no participants recruited and no
sessions completed

> Owner-approved variance — 2026-08-27: Phase 0 used isolated AI evaluators as a
> proxy for message comprehension, public onboarding, documentation, positioning
> plausibility, and technical feasibility. That evidence does not satisfy the human
> demand thresholds below. The protocol runs during/after beta at the D-110
> checkpoint (after three independent adopters or before 1.0), not as a public-beta
> promotion gate, and no
> human session is recorded as complete.

This protocol tests the [product strategy](product-strategy.md) rather than seeking
agreement with it. It separates problem interviews, message comprehension, and
observed onboarding so a compelling pitch cannot hide a weak product experience.
Recruitment, consent, scheduling, facilitation, and checkpoint operations are in the
[Phase 0E research runbook](research-operations.md).

## Research questions

1. Which recurring integration and maintenance problems are painful enough to make
   a React/Spring team adopt a framework?
2. Is the strongest adoption wedge cohesive full-stack workflow, polished
   operational UX, intermittent connectivity, or another job?
3. Can unfamiliar developers describe Vireo accurately after sixty seconds?
4. Which claims create concrete desire to try, and which trigger skepticism?
5. What skill, lock-in, maturity, scope, security, or operations objections block
   adoption?
6. Can a target developer start and change the product without maintainer rescue?

## Participant plan

Recruit 12–15 unfamiliar participants. The first checkpoint occurs after five
qualified primary-persona sessions; do not stop there if findings remain unstable.

| Cohort                                     | Minimum | Qualification                                                                           |
| ------------------------------------------ | ------: | --------------------------------------------------------------------------------------- |
| Primary full-stack developers              |       6 | Shipped or maintained a React + Spring Boot business application in the last two years  |
| Java-heavy teams adopting React            |       2 | Own Spring production work and contribute to or closely collaborate on a React frontend |
| Agency/repeated-app developers             |       2 | Delivered at least two record/workflow-heavy client applications                        |
| Field/intermittent-connectivity developers |       2 | Own a workflow used on unreliable networks or mobile/field devices                      |

Participants may satisfy multiple cohorts, but the primary minimum still applies.

Exclude Vireo contributors, close collaborators who know its architecture, people
without recent business-application experience, and participants whose only
relevant work is tutorial or hobby code. Record recruiting source and relationship
so convenience bias is visible.

## Ethics and evidence handling

- Explain the research purpose, recording method, and intended use before consent.
- Participation is voluntary and may stop at any time.
- Do not collect employer secrets, production data, credentials, or unnecessary
  personal information.
- Store raw recordings/notes outside the public repository with restricted access.
- Commit anonymized findings, counts, and short quotations only with permission.
- Identify participants as `P01`, `P02`, and so on; keep the identity key separate.
- Compensate participants consistently when practical and disclose incentives.

## Session A: problem interview and message test

Length: 45–60 minutes. Use one interviewer and, when possible, one silent note
taker. Do not demo Vireo before the past-behavior questions.

### 1. Context and recent behavior — 15 minutes

Ask for concrete recent examples:

1. Tell me about the last operational business application you shipped or changed.
2. Which parts did your team assemble before domain work could begin?
3. What did you copy from another repository or private starter?
4. Which integration failed or drifted later? What did that cost?
5. What frontend behavior repeatedly required special handling on mobile, during
   loading/failure, or for accessibility?
6. When was network reliability a product constraint? What could users still do?
7. How did you handle queued writes, retries, conflicts, and user-visible recovery?
8. Which framework or starter did you evaluate? Why did you adopt or reject it?
9. What makes adding a framework dependency feel too risky?
10. What did the last major upgrade cost?

Follow with “what happened?”, “show me the sequence,” and “how often?” Avoid “would
you like” questions until past behavior is exhausted.

### 2. Blind message exposure — 60 seconds

Randomize candidates A, B, and C from the product strategy across participants.
Show only one candidate for sixty seconds, then remove it.

Ask:

1. What is Vireo?
2. Who is it for?
3. What problem does it solve?
4. What do you believe it would create or own?
5. What do you think “offline-capable” means here?
6. What would still be your team's responsibility?
7. What is unclear or unbelievable?

Do not correct the participant until all comprehension answers are recorded.

### 3. Comparative reaction — 10 minutes

Show the other two candidates in randomized order.

- Rank the three by relevance to a real current or recent project.
- Identify the words that increased and reduced trust.
- Ask what evidence would be required before trying each claim.
- Ask which alternative they would compare first and why.
- Ask whether Vireo sounds like a library, template, generator, platform, or
  proprietary runtime.

### 4. Concrete intent — 5 minutes

Ask, without offering an incentive:

- Which specific project, if any, would you try this on?
- What would you need to see before spending thirty minutes on it?
- What would prevent you from installing it this month?
- May we invite you to an observed setup/change session?

Interest counts only when attached to a concrete project or evaluation action.

## Session B: observed onboarding and first change

Length: up to 90 minutes. Run after the participant has not seen maintainer setup
instructions. Use a credential-free release candidate when available. If temporary
private access is unavoidable, record every credential step and do not count that
run as proof of the public installation target.

### Scenario

> You are starting a small equipment-inspection application. Run Vireo, inspect the
> architecture, and add an `Inspection` record with equipment reference, result,
> notes, inspected-at time, validation, and role-restricted editing. Explain how you
> would make the workflow safe through a temporary network loss.

### Observer rules

- Ask participants to think aloud.
- Provide the public entry URL only; do not narrate the happy path.
- Let recoverable errors stand for at least three minutes.
- A maintainer hint is rescue and must be recorded with timestamp and reason.
- Do not blame participant skill; classify the product/documentation failure.
- Stop for unsafe credential handling, destructive commands, or an unrecoverable
  environment issue.

### Capture

- time to understand prerequisites;
- time to first successful run;
- time to locate the change boundary;
- time to first working vertical-slice change;
- commands, docs pages, errors, backtracks, and maintainer rescues;
- architecture comprehension and ability to identify application-owned policy;
- mobile/loading/error/offline considerations raised without prompting;
- confidence, adoption blockers, and expected upgrade/escape cost.

Until the full-stack generator exists, run this scenario against the Template and
label generation-specific measurements unavailable. Repeat it against the Phase 3
release candidate without changing the task.

## Scoring rubric

### Message comprehension

Score each item 0, 1, or 2:

| Dimension | 0                                        | 1                                       | 2                                                               |
| --------- | ---------------------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| Category  | Incorrect category                       | Partially identifies framework/template | Opinionated React + Spring full-stack framework                 |
| Audience  | Wrong or generic audience                | Business developers generally           | Small teams building operational business apps                  |
| Outcome   | Repeats features only                    | Mentions speed or consistency           | Explains reduced recurring integration/maintenance work         |
| Ownership | Assumes low-code or hidden runtime       | Uncertain boundaries                    | Ordinary code plus explicit application policy/escape hatches   |
| Offline   | Assumes magic full offline or cache only | Understands partial network value       | Recognizes queued/replayed work and application-owned conflicts |

An accurate description requires at least 8/10 with no zero for category or
ownership.

### Evidence classification

Tag every finding:

- `PROBLEM`: painful repeated work backed by a concrete example;
- `MESSAGE`: comprehension or terminology issue;
- `PRODUCT`: missing/incorrect capability or boundary;
- `PROOF`: claim is plausible but lacks trusted evidence;
- `DOCS`: discovery, explanation, or task guidance failure;
- `DX`: setup, diagnostic, generation, or upgrade friction;
- `SCOPE`: participant/project lies outside the intended envelope;
- `OBJECTION`: lock-in, maturity, security, performance, support, or cost concern.

Record severity (`blocker`, `major`, `minor`), frequency, cohort, and the evidence
link. Never turn a single comment directly into a feature request.

## Decision thresholds

The Phase 0 positioning gate requires all of the following:

1. At least five unfamiliar qualified developers accurately describe Vireo after a
   sixty-second exposure.
2. At least three identify a concrete project and voluntary next step they want to
   take.
3. At least 60% of 10 or more participants report a concrete recurring problem that
   the primary job addresses.
4. No more than 20% interpret Vireo as low-code, a proprietary runtime, or magical
   conflict resolution after the final candidate copy.
5. One claim ranks first for at least half the primary cohort, or the hierarchy is
   explicitly revised as inconclusive.
6. Every blocker objection has an owner in the gap register; no unresolved identity
   or distribution feasibility blocker is hidden.

Observed onboarding gates are tracked separately because current private
distribution and missing generation would otherwise predetermine failure.

## Synthesis and decision process

After sessions 5, 10, and the final session:

1. aggregate rubric scores and cohort counts;
2. affinity-map evidence by tag without exposing identities;
3. separate frequent painful jobs from requested solutions;
4. compare message ranking with past behavior and concrete intent;
5. update the competitor matrix when participants name an alternative;
6. accept, revise, or reject D-101 and D-102 with evidence;
7. add or update gap-register items and proof gates;
8. publish an anonymized research summary and explicit counterevidence.

Do not average away a severe security, data-loss, accessibility, or lock-in concern.

## External raw session record template

Copy this template into the approved restricted research system. Never commit a
completed participant record, identity mapping, raw note, or recording to this
repository.

```text
Participant: P__
Date / interviewer / note taker:
Cohort and qualifying evidence:
Consent and recording status:
Recent application context:

Past-behavior evidence:
-

Message candidate and randomized order:
Comprehension scores: category __ / audience __ / outcome __ / ownership __ / offline __
Verbatim misunderstandings and objections:
-

Concrete project and voluntary next step:
Session B invitation/result:

Findings (tag / severity / evidence):
-

Counterevidence to current strategy:
-

Maintainer interpretation (kept separate from participant evidence):
-
```

Aggregate research summaries follow the
[research evidence rules](../research/README.md) and should live under
`docs/roadmap/research/YYYY-MM/` once the minimum checkpoint sample exists. Empty,
individual, or invented participant records must never be committed.
