# G-108 verification trend review — 2026-09-01

Status: **closed for machine-controlled evidence**.

This review uses the five latest successful comparable GitHub-hosted Ubuntu 24.04
x64 verification artifacts. Every record uses a clean checkout and `npm ci`; normal
hosted tool caches may have been restored. Each artifact uses the schema-2 duration
and GNU-time peak-RSS method defined in
[`contracts/verification-budget-policy.json`](../../../../contracts/verification-budget-policy.json).

| Reviewed run artifacts |
| --- |
| [33440023686](https://github.com/vireocodedev/vireo/actions/runs/33440023686), [33440878972](https://github.com/vireocodedev/vireo/actions/runs/33440878972), [33442126458](https://github.com/vireocodedev/vireo/actions/runs/33442126458), [33442975048](https://github.com/vireocodedev/vireo/actions/runs/33442975048), and [33447355845](https://github.com/vireocodedev/vireo/actions/runs/33447355845) |

| Reviewed metric | Median | Range / observation |
| --- | ---: | --- |
| Complete duration | 496,601 ms | 314,005–519,511 ms |
| Complete peak RSS | 4,270,372 KiB | 4,158,624–4,557,684 KiB |
| Tests duration | 190,278 ms | 109,495–202,055 ms |
| Tests peak RSS | 2,138,236 KiB | median |
| Lint peak RSS | 948,524 KiB | one 1,715,284 KiB transient |

The artifacts retain `.verification-evidence/latest.json` for 90 days, including
host identity, cache statement, schema version, stage durations, and peak RSS. All
five completed successfully. The apparent lint RSS spike occurred once and remains
below its failure threshold; it is retained as a transient observation rather than a
reason to loosen memory limits.

## Decision

The test-and-contract-check duration moved materially above its initial 62-second
reference across the review window. The checked-in policy therefore adopts the
190,278 ms median and the smallest practical warning/failure values of 220,000 ms
and 270,000 ms. Complete-gate and RSS warning/failure thresholds are unchanged:
the records were clean and offer no evidence for a broader relaxation. Review again
after the next five comparable canonical-host records or before changing a relevant
gate.

This closes G-108's machine evidence. It does not change any unfamiliar-user,
independent-review, physical-device, assistive-technology, recovery-witness, or
adopter gate.
