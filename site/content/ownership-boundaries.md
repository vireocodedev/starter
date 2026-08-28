# Ownership boundaries

Vireo is useful when its guarantees are clear and its non-guarantees are equally clear. Treating a starter as an invisible platform usually creates accidental coupling; Vireo records the boundaries instead.

## Framework-owned

- Published package entry points and semantic-version commitments
- Reusable component behavior and accessibility contracts
- Generator schema validation and deterministic rendering
- Generated-file manifests and drift checking
- Supported project-upgrade pairs
- Release provenance, compatibility metadata and documentation snapshots

## Replaceable application seams

- Authentication adapter
- Data and query adapters
- History source
- Product theme and navigation composition
- Deployment integration
- Observability integration

Vireo supplies working defaults or examples for these seams, but the application chooses their production implementation.

## Application-owned

- Domain invariants and calculations
- Authorization policy and resource-level access
- Sensitive-data classification and retention
- Transaction boundaries and idempotency
- Conflict semantics and offline eligibility
- Company API mapping and failure semantics
- Product copy, workflows and visual identity

## Generated does not mean framework-owned forever

A generated capability remains Vireo-managed only while its schema is authoritative and the team accepts regeneration. `vireo check` reports drift. `vireo eject` converts the generated result into ordinary application code when customization becomes more important than regeneration.

## A practical review question

Before adding behavior, ask: **Would two unrelated Vireo applications need this exact policy?** If not, it probably belongs in the application or an adapter rather than a framework package.

Continue with [Generated code ownership](/docs/concepts/generated-code/) or [Adapters](/docs/concepts/adapters/).
