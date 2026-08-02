---
"@vireocodedev/starter-localization": minor
---

Promote the last of the generic UI vocabulary into the platform and history namespaces.

- `platform.common` gains 16 generic strings every app was retyping: `actions`,
  `back`, `dark`, `delete`, `discard`, `download`, `edit`, `language`, `light`,
  `logout`, `month`, `name`, `profile`, `settings`, `theme`, `year`.
- `history` gains `viewHistory`, the label for the action that opens a record's
  history — it belongs with the rest of the history vocabulary rather than in
  `platform`.

Strings that read as generic but are not stay with the app: locale names, and
anything naming a domain concept or an app-specific label (for example an
`Overview` home label).
