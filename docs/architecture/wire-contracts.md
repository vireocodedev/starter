# Generated wire contracts

Status: accepted for Phase 3. This decision closes the engineering portion of G-205.

REST remains Vireo's canonical application boundary. The entity schema is the single generation input; the derived `.vireo/contracts/<plural>.contract.json` records endpoint methods and paths, field types and nullability, enum members, validation limits, pagination shape, and temporal/decimal/error semantics.

The backend DTO and controller and the frontend transport schema and API adapter are contract-critical generated files. `vireo check` recomputes the canonical schema and wire-contract digests and verifies those files, the Flyway migration, and the contract artifact against the generation manifest. A one-sided change therefore fails before merge when the check is run in CI.

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

JavaScript cannot exactly represent arbitrary decimal or 64-bit integer values. Schema v1 is therefore appropriate only when API values stay within JavaScript's safe numeric range and decimal display/rounding does not require a string-based money model. The limitation is explicit rather than hidden.

## Compatibility

The schema and contract formats are both version 1. Additive nullable response fields are the safe rolling-deployment shape. Removing or renaming fields, narrowing nullability, changing scalar types or enum members, or moving endpoints is breaking and requires coordinated deployment. Generator overwrite flags do not claim to automate that rollout.

The generated fixture CI job creates a clean app, generates Purchase Order, confirms byte-for-byte idempotence and contract integrity, compiles the frontend and backend, runs the Zod contract tests, and executes the Spring API lifecycle test.
