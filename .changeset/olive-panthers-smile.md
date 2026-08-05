---
"@vireocodedev/starter-ui": minor
---

Fix two published declarations that only compiled inside this repository.

`useRgoTypedFieldArray` leaned on a `@ts-expect-error` above its return
annotation. Suppressions do not travel into the emitted `.d.ts`, so the error
they hid was live for every consumer and invisible to us. The signature now
constrains its element type and spells the field name so the
`FieldArrayPath` constraint is satisfied by construction.

`RgoTranslationFn` was declared as `TFunction<typeof RGO_LOCALE_NAMESPACE>`. The
`"rgo-ui"` namespace is declared in an ambient augmentation under `src/@types`,
which `tsc` does not copy to `dist` — and shipping it is not an option, since it
would overwrite the consumer's own `CustomTypeOptions.resources`. Any consumer
that augments i18next narrows `Namespace` away from `string`, at which point the
published type asserted a namespace they had never declared. It is now
parameterised by `Namespace`.

Minor rather than patch: `RgoTranslationFn` is exported and its shape changes,
including where it appears as a default type parameter on `useRgoForm`.
