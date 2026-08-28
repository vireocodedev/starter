# Frontend foundations

Vireo's frontend packages provide production-shaped behavior for operational React applications. They are published as ordinary npm packages and can be adopted individually.

## Package family

| Package                        | Primary responsibility                                        |
| ------------------------------ | ------------------------------------------------------------- |
| `@vireocodedev/ui`             | Responsive page, form, table, overlay and feedback components |
| `@vireocodedev/query`          | Query models, filter composition and transport conventions    |
| `@vireocodedev/history`        | History contracts and presentation primitives                 |
| `@vireocodedev/localization`   | Locale and translation foundations                            |
| `@vireocodedev/shell`          | Application shell composition                                 |
| `@vireocodedev/sqlite`         | Explicit local persistence primitives                         |
| `@vireocodedev/infrastructure` | Shared infrastructure contracts                               |

Use only public package entry points. Deep imports into package source are not supported.

## UI philosophy

Vireo components target dense, responsive business workflows rather than generic marketing layouts. The important contracts include keyboard access, explicit loading and empty states, mobile alternatives to wide tables, predictable overlay behavior and application-owned copy.

Use the [component guide](/docs/components/) for curated decisions and [Storybook](/storybook/) for interactive states.

## Data access

Pages should depend on capability APIs or configured adapters, not scatter transport calls throughout the tree. TanStack Query integration remains replaceable at the application edge while query keys, filters and response semantics stay testable.

## Forms and validation

Frontend validation improves interaction quality; it is not an authorization or security boundary. Share wire-compatible constraints where useful, but repeat authoritative validation on the backend.

## Localization and temporal values

Keep stored and transported values independent from display locale. Format at presentation boundaries, preserve timezone/offset meaning and avoid converting identifiers or money through lossy JavaScript numbers.

For exact exports, open the [TypeScript API reference](/reference/typescript/).
