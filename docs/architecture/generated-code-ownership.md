# Generated-code ownership

Status: accepted for the Phase 3 entity generator. This decision closes the engineering portion of G-206.

Vireo generates ordinary application code. It does not retain an invisible runtime model and it does not assume it can overwrite developer changes.

## Two ownership classes

`generated-once` files include the Flyway migration, Java entity/DTO/mapper/repository/service/controller and registrations, TypeScript model/API/page, translations, Storybook story, tests, and capability documentation. Their first line carries the schema version and digest. Once written, these files are application-owned and may be edited normally.

`regenerated` files are mechanical indexes and contract artifacts: `.vireo/schemas/*`, `.vireo/contracts/*`, `.vireo/generated/*`, and `frontend/src/generated/vireo.capabilities.ts`. These carry an explicit regenerated marker. They must not contain application logic.

The manifest records every emitted path, ownership class, role, and SHA-256 digest. An identical rerun performs zero writes. An unmanaged collision fails with `VIR-GEN-003`; a changed schema fails with `VIR-GEN-004`; and customized managed files fail with `VIR-GEN-005`.

## Safe paths

- `--dry-run` validates and prints every status without writing.
- `--diff` is the human-oriented dry-run alias.
- `--output <directory>` renders a standalone tree for inspection.
- `--force` acknowledges schema regeneration and obsolete generated files.
- `--force --accept-overwrite` is the only path that replaces customized or unmanaged files. It is intended for an unadopted local generation, never an already-applied production migration.
- `vireo eject <plural>` removes Vireo's manifest, schema, contract, and route registration while retaining all generated-once code. Markers change to `@vireo-ejected`.

Ejection is the standard escape hatch. After ejection, code is indistinguishable in operation from handwritten React and Spring Boot code and `vireo check` no longer governs it.

## Schema evolution boundary

Schema v1 creates a vertical slice once. It does not rewrite an already-applied Flyway migration. For an adopted capability, edit the application-owned code, add a normal forward migration, and eject if the canonical generation contract no longer describes the capability. A future upgrade/migration workflow remains G-203 and must not silently expand this contract.
