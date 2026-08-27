# Verification performance policy

The authoritative TypeScript/documentation gate records wall-clock duration and GNU
time peak resident set size for every stage. The machine policy is
[`contracts/verification-budget-policy.json`](../contracts/verification-budget-policy.json);
CI retains each run's `.verification-evidence/latest.json` for 90 days.

## Comparable evidence

- **Canonical host:** GitHub-hosted Ubuntu 24.04 x86-64.
- **Cache state:** clean checkout and `npm ci`; ordinary hosted tool caches may be
  restored, and the evidence records the observed host.
- **Duration:** one wall-clock measurement per stage and for the complete gate.
- **Memory:** GNU time maximum RSS in KiB for each stage process tree; complete-gate
  peak RSS is the maximum stage value, not a sum.
- **Baseline method:** the checked-in initial verified reference is replaced by the
  median of the latest five successful canonical-host runs when five comparable
  artifacts exist.

Developer-host observations are diagnostic. Only canonical-host artifacts may change
the reviewed baseline.

## Regression behavior

Each stage and the complete gate declare a baseline, warning threshold, and failure
threshold for both duration and peak RSS.

- Crossing a warning threshold keeps the gate green but emits a visible warning that
  must be reviewed before release.
- Crossing a failure threshold fails the gate.
- One noisy run does not justify increasing a threshold. Investigate the stage and
  compare the latest five canonical artifacts first.
- Lower thresholds whenever the five-run median and normal variance show sustained
  headroom.

The initial complete-gate reference is 165 seconds and 6.96 GiB peak RSS. Warning
thresholds are 270 seconds and 8 GiB; failure thresholds are 360 seconds and 10 GiB.
Stage-specific limits remain machine-readable to avoid duplicating a table that can
drift.

## Exceptions

A threshold increase requires a reviewed change that records:

1. the affected stage and canonical run artifacts;
2. the five-run median, range, and cache state;
3. the product or dependency change that caused the increase;
4. optimization or lane-splitting alternatives considered;
5. the smallest justified new warning/failure values; and
6. an owner and review date no more than 90 days later.

Emergency exceptions may prevent a release gate from blocking only when an incident
or unavailable hosted dependency makes the measurement invalid. They must be
time-bounded, must not delete evidence, and must restore or publicly revise the
affected support claim.
