---
"@vireocodedev/starter-shell": minor
---

`shell.mobileBottomNavigation` is now optional.

The bottom bar only exists in `dashboard` mode, but the config demanded
`authenticatedItems`, `loginItem` and `moreItem` from every app regardless. A
`bare` or `public` app had to invent three items it would never render just to
satisfy the type.

The key may now be omitted. `AppMobileBottomNavigation` renders nothing when it
is absent, and `validateAppConfig` only checks the block when it is present.

Additive — apps that declare it are unaffected.

Closes gap F6 (roadmap 2.4, work item W7).
