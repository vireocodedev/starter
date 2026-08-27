# Phase 2 decisions

## D-107 — minimal Template boundary

**Accepted 2026-08-27.** The generated Template contains one replaceable default at each integration seam and one end-to-end Item capability. Home, login, settings, access/error routes, and shell infrastructure support that slice; the former dev-tool catalog and broad page demonstrations do not belong in the golden path.

Reusable behavior belongs in a published package only after its contract is independently valuable. Broad demonstrations may later live in `vireocodedev/vireo-examples`, but Phase 2 does not create a repository merely to preserve unsupported sample volume.

## D-108 — canonical package manager and create command

**Accepted 2026-08-27.** npm is the only Phase 2 package manager because both repositories already pin and enforce npm, its `npm create <name>` convention resolves directly to `create-<name>`, and adding another lockfile/toolchain would multiply clean-room and support cost without user evidence.

The canonical command is:

```bash
npm create vireo@latest my-app
```

It resolves to the unscoped public package `create-vireo`. The package pins a full public Template commit rather than a moving branch. It performs no telemetry. Existing targets are never overwritten, and failed staging is removed before the command exits.

The package coordinate is technically implemented but cannot be described as anonymously consumable until its one-time first npm publication is complete and its trusted publisher is configured.
