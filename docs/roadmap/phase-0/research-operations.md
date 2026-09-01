# Phase 0E research operations runbook

Prepared: 2026-08-26

Status: fieldwork-ready and deferred to public beta; zero participants recruited and
zero sessions completed

The 2026-08-27 owner-approved Phase 0 AI-proxy variance did not execute or satisfy
this human-research runbook. Retain it for the D-110 during/after-beta checkpoint and the D-101
and D-102 revisit after the first three independent adopters or before a 1.0
commitment, whichever comes first.

This runbook operationalizes the [validation protocol](validation-protocol.md). It
does not replace participant evidence, legal/privacy review, or the threshold rules
in that protocol. Do not mark Phase 0E complete from internal dry runs.

## Roles and separation of duties

| Role        | Responsibility                                                                                                           | Must not do                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Study owner | Approves cohort, compensation, privacy handling, schedule, and checkpoint decisions                                      | Change hypotheses after seeing individual results without recording the change |
| Recruiter   | Sources candidates, applies the screener, and maintains the identity/contact key outside Git                             | Reveal message candidates or coach candidates toward qualification             |
| Facilitator | Reads the consent script, conducts the session, and records interventions                                                | Sell Vireo, defend design decisions, or turn questions into a demo             |
| Note taker  | Timestamps behavior and quotes, scores only after the participant answers, and separates observation from interpretation | Fill gaps from memory after discussing the participant with maintainers        |
| Synthesizer | Aggregates anonymized evidence at checkpoints and records counterevidence                                                | Publish participant-level data or average away severe findings                 |

One person may hold multiple roles, but the recruiter identity key and raw session
materials remain separate from repository evidence. When possible, use a facilitator
who did not design the feature under test.

## Before outreach

The study owner must record outside the public repository:

1. the accountable person for participant privacy and deletion requests;
2. the approved storage locations for contact data, consent records, raw notes, and
   recordings;
3. access control, encryption, backup, retention, and deletion dates;
4. whether recording is necessary and which media are captured;
5. one fixed compensation rule per session type and how it is paid;
6. the applicable organizational/legal review for the participant jurisdictions;
7. the recruitment sources and conflict-of-interest policy; and
8. the withdrawal deadline before irreversible aggregation/publication.

The repository contains no participant identities, contact details, consent forms,
raw notes, recordings, calendar links, payment records, IP addresses, employer
secrets, credentials, or production data.

## Recruitment targets

Recruit 12–15 qualified unfamiliar participants using the cohort minima in the
validation protocol. The first checkpoint requires five completed Session A studies
from the primary persona; it is not a convenience-sample checkpoint.

Plan a wider funnel than the completion target. Track, outside Git, counts for:

- approached;
- responded;
- screened;
- qualified;
- scheduled;
- completed;
- cancelled/no-show;
- excluded, with a non-identifying reason category; and
- declined recording but accepted notes-only participation.

Do not recruit Vireo contributors, close collaborators, direct reports of the study
owner, or people already briefed on the architecture into the validation cohort.
They may participate in a separately labeled pilot that does not count toward gates.

### Neutral outreach copy

> We are researching how developers build and maintain operational business
> applications with React and Spring Boot. We are looking for people with recent
> hands-on experience to discuss a real project and evaluate several short product
> explanations. This is product research, not a sales call or skills test. The
> session takes about 60 minutes. We will explain compensation, recording, privacy,
> and withdrawal before scheduling. Please do not share employer-confidential or
> production information.

Do not name Vireo, offline-first, generation, or the preferred positioning wedge in
initial outreach.

## Qualification screener

Ask in this order and retain answers outside Git:

1. In the last two years, have you personally shipped or maintained an application
   using both React and Spring Boot?
2. What was your role, and which frontend and backend changes did you personally
   make?
3. Was the application record/workflow-heavy operational software, another kind of
   business application, or a consumer/content product?
4. Roughly how large was the team, and who owned integration and production issues?
5. Have you delivered more than one similar application for clients or internal
   teams?
6. Did any workflow operate on unreliable networks or require useful disconnected
   behavior? Describe only the category, not confidential details.
7. Which starters, generators, admin frameworks, or full-stack frameworks did you
   evaluate or use?
8. What is your relationship to Vireo, its maintainers, or the recruiting source?
9. Are you comfortable discussing a past project without sharing protected employer
   information?
10. Are you available for a 60-minute research session and potentially a separate
    90-minute observed setup session?

### Qualification decision

A primary participant must provide a concrete recent React + Spring Boot application
and describe personal responsibility for at least one cross-stack or production
outcome. Tutorial-only, hypothetical, or supervision-only experience does not pass.

Assign secondary cohorts only after primary qualification is decided. Record a
single reason code for exclusion; do not preserve unnecessary narrative about an
excluded candidate.

## Enrollment and consent script

Send logistics only after qualification. At session start, read and confirm:

> We are testing our understanding and materials, not testing you. Participation is
> voluntary; you can skip a question or stop at any time without losing agreed
> compensation. Please do not disclose credentials, personal data, employer secrets,
> or production records. We will capture [notes / audio / screen / video] for the
> stated research purpose, restrict raw access to [roles], retain it until [date],
> and then delete it according to our study plan. The public repository may receive
> aggregate findings and short anonymized quotations only when separately permitted.
> You may request withdrawal until [date/process]. Do you understand and consent to
> participate? Do you separately consent to each recording type? Do you separately
> permit anonymized quotation?

Record separate yes/no decisions for participation, each recording type, and public
quotation. Notes-only participation is valid. If participation consent is absent,
stop. If recording consent is absent, disable recording before continuing.

This script is a research safeguard, not a substitute for any consent language or
privacy process required by the responsible organization or jurisdiction.

## Message-order assignment

Freeze candidates A, B, and C from the product strategy before the first session.
Use repeating balanced six-participant blocks:

| Assignment | First exposure | Remaining order |
| ---------- | -------------- | --------------- |
| 1          | A              | B, C            |
| 2          | B              | C, A            |
| 3          | C              | A, B            |
| 4          | A              | C, B            |
| 5          | B              | A, C            |
| 6          | C              | B, A            |

Shuffle qualified participant codes before assigning the next unused row. Do not
select an order based on cohort or predicted preference. If copy changes after a
checkpoint, increment the protocol version and start a new block; never combine
scores across materially different copy without labeling the versions.

## Session A field checklist

Before admitting the participant:

- qualification and relationship checks passed;
- participant code assigned outside the identity key;
- message assignment locked;
- facilitator copy contains no participant-specific coaching;
- consent and recording controls tested;
- timer and timestamped notes ready; and
- compensation is independent of the participant's opinions.

During the session:

1. read consent and confirm safe-data boundaries;
2. ask past-behavior questions before revealing Vireo;
3. show the assigned message for exactly 60 seconds, remove it, then ask unaided
   comprehension questions;
4. score only the participant's words, preserving uncertainty;
5. show the remaining candidates in the assigned order;
6. ask for a concrete project and voluntary next action without offering an extra
   incentive; and
7. invite suitable participants to Session B only after intent questions finish.

After the session, the facilitator and note taker independently write observations
before discussing interpretation. Resolve scoring disagreements by retaining both
scores plus the reason; do not silently average them.

## Session B field checklist

Use the unchanged equipment-inspection scenario in the validation protocol. Record
the exact repository/release, docs entry URL, machine/toolchain, credential state,
and known product limitations before the session.

The observer may intervene only for:

- credential or personal-data exposure;
- a destructive command or unsafe system state;
- an environment outage unrelated to the product; or
- participant-requested termination.

Every other hint is a rescue. Record its timestamp, trigger, wording, and effect.
Private package access may be provided when necessary, but the run cannot count as
credential-free onboarding proof.

## Five-session checkpoint gate

After five qualified primary Session A completions:

1. freeze additional sessions until raw records are internally complete;
2. verify cohort qualification, consent, message balance, and missing data;
3. publish one aggregate checkpoint using the
   [repository template](../research/CHECKPOINT_TEMPLATE.md);
4. calculate comprehension results without rewriting ambiguous answers;
5. report concrete past problems separately from feature requests and opinions;
6. list every blocker/major finding and explicit counterexample;
7. decide `continue unchanged`, `revise protocol/copy`, or `stop and revisit the
product hypothesis`;
8. update gaps, but leave D-101 and D-102 open unless their full decision thresholds
   have been met; and
9. resume with a new protocol version if materials changed.

No participant-level report enters Git. Suppress or combine small cohort cells that
could identify a person, and do not publish a quotation without explicit quotation
permission.

## Operational readiness checklist

Phase 0E fieldwork may start only when all are true:

- [ ] accountable study/privacy owner named outside Git;
- [ ] storage, access, retention, deletion, and withdrawal process approved;
- [ ] compensation rule approved;
- [ ] recruiter and facilitator assigned;
- [ ] recruitment sources chosen with unfamiliar participants available;
- [ ] screener and neutral outreach copy frozen;
- [ ] message candidates and balanced order frozen;
- [ ] consent and recording controls tested;
- [ ] Session A pilot completed with a non-counting participant;
- [ ] first five qualified primary participants scheduled; and
- [ ] checkpoint date and decision owners booked.

Until these items and real sessions exist, the correct Phase 0E status is **in
progress; awaiting external evidence**.
