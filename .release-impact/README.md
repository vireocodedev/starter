# Release-impact records

Changesets remain the release metadata for publishable npm packages. This
directory contains one JSON record per affected JVM/application artifact or npm
no-release exemption. Records are reviewed through CODEOWNERS and only records
changed by the pull request can satisfy the semantic gate.

See [`docs/RELEASE_IMPACT.md`](../docs/RELEASE_IMPACT.md) for the schema and
workflow.
