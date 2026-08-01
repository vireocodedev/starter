---
"@vireocodedev/starter-localization": minor
---

Promote the routing, unsaved-changes and required-field vocabulary into the platform namespace.

Adds three groups that every app was otherwise retyping verbatim:

- `routing` (11 keys) — route error boundary, not-found and unauthorized copy.
- `unsavedChanges` (6 keys) — the navigation-blocking confirm dialog, including
  its saving-in-progress variant.
- `validation.thisFieldIsRequired` — the single string every zod schema in an
  app reaches for.

These are shared vocabulary only; no starter package resolves them itself, so
apps keep rendering them through their own translation hook via the
`platformBaseResources` spread.
