---
"@vireocodedev/starter-core": major
"@vireocodedev/starter-ui": major
---

Remove duplicated exports so each symbol has exactly one home.

**Breaking changes**

- `@vireocodedev/starter-core` no longer re-exports `AppBottomDrawer`, `AppBottomDrawerProps` or the `APP_PAGE_CONTENT_*` width constants. Import them from `@vireocodedev/starter-ui`, where they are defined.
- `@vireocodedev/starter-ui` no longer exports `AppConfirmProvider`. It was a pass-through wrapper that rendered `RgoConfirmProvider` and added nothing — use `RgoConfirmProvider` directly.
