# Generated wire contracts

Status: accepted for Phase 3 and extended to frontend-only generation on 2026-08-28.
This decision closes the engineering portion of G-205.

REST remains Vireo's canonical application boundary. The entity schema is the single generation input; the derived `.vireo/contracts/<plural>.contract.json` records endpoint methods and paths, field types and nullability, enum members, validation limits, pagination shape, and temporal/decimal/error semantics.

For the full-stack target, the backend DTO/controller and frontend transport
schema/API adapter are contract-critical generated files. For the frontend target,
the transport schema and adapter are critical while backend and migration artifacts
are deliberately absent. `vireo check` derives the target from each manifest,
recomputes the canonical schema and wire-contract digests, and verifies exactly that
target's managed files. A one-sided change therefore fails before merge when the
check is run in CI.

Transport and domain types remain separate even when schema v1 maps them one-to-one. Backend input uses Jakarta validation. Frontend input is parsed with Zod at the HTTP trust boundary. Unknown response fields are stripped. Optional values cross the wire as explicit JSON `null`.

## Canonical scalar semantics

| Schema type                      | Java                      | JSON                      | TypeScript/Zod                     |
| -------------------------------- | ------------------------- | ------------------------- | ---------------------------------- |
| `long`, `integer`                | `Long`, `Integer`         | integer                   | `number().int()`                   |
| `decimal`                        | `BigDecimal`              | number                    | `number()`                         |
| `string`, `text`, `enum`, `uuid` | matching Java scalar/enum | string                    | matching string schema             |
| `date`                           | `LocalDate`               | ISO-8601 calendar date    | `z.iso.date()`                     |
| `timestamp`                      | `Instant`                 | ISO-8601 offset timestamp | `z.iso.datetime({ offset: true })` |
| `boolean`                        | `Boolean`                 | boolean                   | `z.boolean()`                      |

JavaScript cannot exactly represent arbitrary decimal or 64-bit integer values.
Schema v1 is therefore appropriate only when API values stay within JavaScript's
safe numeric range and decimal display/rounding does not require a string-based
money model. Full-stack contracts record the reference Spring/`BigDecimal`
semantics. Frontend-target contracts record that precision and errors belong to the
external adapter; they do not claim behavior for a backend Vireo does not own. The
limitation is explicit rather than hidden.

## Compatibility

The schema and contract formats are both version 1. Additive nullable response fields are the safe rolling-deployment shape. Removing or renaming fields, narrowing nullability, changing scalar types or enum members, or moving endpoints is breaking and requires coordinated deployment. Generator overwrite flags do not claim to automate that rollout.

The generated fixture CI jobs cover both targets. One compiles the frontend and
backend, runs the Zod contract tests, and executes the Spring API lifecycle test.
The other creates a standalone mock-backed frontend, proves that no backend file is
present, and runs doctor, type checking, contract tests, and a production build.
