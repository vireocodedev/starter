# Roadmap research evidence

This directory contains sanitized, aggregate research evidence used by roadmap
decisions. It is not a participant-data store.

## Allowed content

- dated aggregate checkpoint reports after the minimum checkpoint sample exists;
- cohort counts large enough not to identify a participant;
- scoring totals and distributions;
- paraphrased findings;
- short anonymized quotations with explicit quotation permission;
- protocol version, recruiting-source categories, limitations, and counterevidence;
- decision recommendations and links to updated gaps; and
- reproducible competitor benchmark summaries without credentials or personal data.

## Prohibited content

Never commit:

- names, usernames, email addresses, phone numbers, calendar links, or payment data;
- employer/client names when they could identify a participant;
- identity-to-participant-code mappings;
- consent records, signatures, recordings, transcripts, screen captures, or raw
  session notes;
- IP addresses, device identifiers, credentials, tokens, private repository URLs,
  production data, or employer-confidential information;
- participant-level profiles or individual-session files, even under a code, when
  combinations of facts could re-identify someone; or
- invented, placeholder, or empty participant records.

Raw materials belong in the approved restricted research system described by the
[operations runbook](../phase-0/research-operations.md), with a separate identity
key and documented retention/deletion process.

## Directory convention

After real sessions exist:

```text
docs/roadmap/research/
  YYYY-MM/
    checkpoint-05.md
    checkpoint-10.md
    final-summary.md
    competitor-benchmark.md
```

Create only the reports that contain evidence. Do not pre-create month directories
or participant files.

## Publication checklist

Before committing a report:

1. confirm the protocol version and minimum checkpoint sample;
2. remove direct identifiers and unnecessary quasi-identifiers;
3. suppress or combine cohort cells smaller than three;
4. verify every quotation has separate public-quotation permission;
5. separate observation, participant interpretation, and maintainer interpretation;
6. include exclusions, missing data, rescues, private-credential use, and other
   limitations;
7. include counterevidence and severe minority findings;
8. have the study owner and privacy/data-handling owner review the diff; and
9. link decisions and gap changes without claiming thresholds that were not met.

Use [CHECKPOINT_TEMPLATE.md](CHECKPOINT_TEMPLATE.md) for aggregate checkpoints.
