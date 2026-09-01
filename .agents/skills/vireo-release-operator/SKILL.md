---
name: vireo-release-operator
description: Use for coordinated Vireo release preparation and review; not publishing or deployment without explicit authorization.
---

# Vireo Release Operator

Use this skill for release preparation, release-impact review, publication evidence, or recovery planning. Do not use it to publish or deploy without explicit authorization.

- Read [release impact](../../../docs/RELEASE_IMPACT.md), [release lifecycle](../../../docs/RELEASE_LIFECYCLE.md), [npm release](../../../docs/NPM_RELEASE.md), and [Maven Central release](../../../docs/MAVEN_CENTRAL_RELEASE.md).
- Start by identifying affected npm packages, JVM modules, `create-vireo`, Template coordinates, changesets, documentation release, and compatible upgrade edges.
- Treat CI publication as automation with human gates: approvals, credentials, external registry/Central state, release notes, and production communication are not inferred.
- Preserve evidence and recovery paths. Never retry a publish, tag, deployment, or credential-changing action blindly.

Use release-impact and lifecycle checks to prepare evidence; invoke external publishing only after the user explicitly authorizes the exact release.
