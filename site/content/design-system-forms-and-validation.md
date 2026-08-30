# Forms and validation

Vireo form guidance keeps models, validation, fields, actions, and server authority clearly separated. These are starter-derived application conventions for reliable workflow design; application code owns its domain schemas and wording, and package APIs remain defined by the [TypeScript reference](/reference/typescript/).

## Model and validation boundaries

Use one canonical frontend model for each entity and submodel. Parse incoming API data into that model, derive fresh defaults from a function, and derive validated schemas from the structural model rather than rebuilding field constructors. Outgoing API mapping owns transport shape; incoming responses are parsed before feature code uses them.

Validation-schema factories are pure. Pass translations and all runtime validation inputs explicitly as readonly plain data—primitives, enums, identifiers, immutable snapshots, or explicit versions. Do not let them read hooks, React context, services, query results, stores, or mutable references. Backend validation and authorization remain authoritative; frontend validation improves interaction quality but is not a security boundary.

## Form modes and ownership

Entity workflows distinguish create, update, and read modes. Treat those modes as a shared application contract instead of scattering raw string checks. Create and update may expose different fields when the schema, defaults, and validation behavior explicitly support that difference. Read mode presents display values under the same semantic form boundary.

Separate the host from the field group:

- The host owns the semantic form element, route-level heading and description, submission/cancel actions, and the read-only policy.
- The field group owns the complete responsive field layout, feature option loading, legitimate mode-dependent field visibility, and domain-specific read-only formatting.
- Bound fields own helper text and validation-error rendering. A field group does not create duplicate manual errors, submit buttons, or its own form boundary.

Every input has a visible label or an equivalent accessible name. Required markers appear only when a field is editable, and autofocus is limited to intentional create flows. Read-only values have an explicit empty-value treatment that preserves meaningful `0` and `false` values.

## Validation timing and state preservation

Use submit-first validation: mount, blur, and contextual changes do not expose errors before a real submission attempt. Once submitted, a change in validation context revalidates without remounting the form or resetting values, dirty state, or touched state. Callers provide values and mode; the form integration owns schema construction, primitive dependency tracking, submission, and context-change revalidation.

Submission uses busy-action behavior: prevent duplicate submission when necessary, keep the form and target context visible, and show operation-appropriate success or recoverable error feedback. Unsaved-change protection belongs at the route and shell boundary, where navigation, overlays, and browser history can coordinate it.

## Required coverage

For each entity workflow, verify create, update, and read behavior: labels, required markers, autofocus, editable controls and display values, explicit empty values, meaningful falsy values, and mode-specific fields. For contextual validation, prove submit-first behavior and post-submit revalidation while preserving values, dirty state, and touched state. Include loading, failure, and assistive-technology behavior where remote options or submission are involved.

Use [loading states](/docs/design-system/loading-states/) for asynchronous forms, [localization](/docs/design-system/localization/) for validation copy, and [accessibility](/docs/accessibility/) for semantic error and focus requirements.
