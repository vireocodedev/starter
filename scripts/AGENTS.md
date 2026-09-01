# Starter policy scripts

Scripts under this directory encode public contracts and release evidence. Prefer extending the existing policy closest to the changed behavior instead of adding overlapping checks.

- Keep checks deterministic, offline where possible, and useful in CI and local development.
- Add focused Node tests for policy behavior, including negative cases when a new invariant is introduced.
- Do not weaken a release, security, licensing, identity, or projection policy only to unblock a change; resolve the underlying contract or make an explicit migration.
- Treat release evidence generation, publishing adapters, and deployment helpers as externally mutating operations requiring explicit authorization.

The root package scripts are the canonical invocation surface; keep any new checker narrow enough to run independently.
