---
name: vireo-generator-maintainer
description: Use for create-vireo generation, projection, and project upgrades; not ordinary consumer application feature work.
---

# Vireo Generator Maintainer

Use this skill for `create-vireo`, entity schemas/rendering, projection rules, Template fixtures, or declared project upgrade edges. Do not use it for ordinary application feature work.

## Before changing behavior

- Read [application projection](../../../docs/APPLICATION_PROJECTION.md), [generated-code ownership](../../../docs/architecture/generated-code-ownership.md), and [entity schemas](../../../docs/generators/entity-schema.md).
- Identify whether each touched file is managed, application-owned, optional, substitution-required, or excluded for each profile.
- Preserve atomic writes, dry-run behavior, output containment, manifest checks, and collision refusal. An upgrade must never silently replace application-owned or ejected work.

## Required evidence

- Keep `contracts/application-projection-contract.json` and `packages/create-vireo/schema/application-projection-contract.json` byte-identical.
- Add focused fixture coverage for a new projection path, generator shape, or upgrade edge. Exercise full-stack and frontend behavior when the path can differ.
- Use a temporary fixture or `--dry-run`; do not mutate a real consumer app while validating the generator.

Use `corepack npm run projection:check` and targeted create-vireo/generator tests before escalating to broader verification.
