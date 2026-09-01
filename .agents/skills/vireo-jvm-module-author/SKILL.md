---
name: vireo-jvm-module-author
description: Use for public Vireo JVM modules, BOMs, and Spring integrations; not private application backend work.
---

# Vireo JVM Module Author

Use this skill for `jvm/` module APIs, Spring auto-configuration, BOM alignment, documentation examples, or Maven publication behavior. Do not use it for an application's private backend implementation.

- Read [JVM packages](../../../docs/package-authoring/JVM_PACKAGES.md), [JVM live documentation](../../../docs/package-authoring/JVM_LIVE_DOCUMENTATION.md), and the touched module README.
- Keep BOM versions, module coordinates, auto-configuration metadata, public types, and docs examples aligned.
- Preserve normal Maven Central consumption. Local Maven resolution is an explicit integration mode, not a default consumer path.
- Add focused tests and examples for changed public behavior; coordinate multi-module Gradle checks rather than starting them opportunistically.

Publishing, signing, and Maven Central verification require explicit release authorization.
