---
"@vireocodedev/starter-localization": minor
---

Promote the auth and shell-settings vocabulary into the platform namespace.

- `auth` (12 keys) — sign-in form, session expiry, and the confirm dialog shown
  when signing out would discard unsynced offline changes. That last group pairs
  with the offline queue the platform already owns via `network`.
- `settings` (10 keys) — the shell preferences an app exposes in its settings
  screen: `lockNavigationBar` (the shell's `navLocked`), the `pageBodyMaxWidth`
  label plus one per `AppShellPageBodyMaxWidth` variant, `noMaxWidth`, and the
  screen title and save confirmation.

Only the shell-owned settings move. Preferences with no starter equivalent —
side-panel resize and desktop surface display — stay with the app.

Shared vocabulary only: no starter package resolves these itself, so apps keep
rendering them through their own translation hook via the `platformBaseResources`
spread.
