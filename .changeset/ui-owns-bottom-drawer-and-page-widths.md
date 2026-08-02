---
"@vireocodedev/starter-ui": minor
"@vireocodedev/starter-core": minor
---

Invert the core/ui dependency so ui sits below core.

`AppBottomDrawer` and the `APP_PAGE_CONTENT_*` width constants move from
`starter-core` to `starter-ui`. They were the only things ui needed from core,
and keeping them in core forced ui to depend upwards on the app shell.

`starter-core` now depends on `starter-ui` instead of the reverse, and builds
after it. Core re-exports both moved modules from its barrel, so existing
`@vireocodedev/starter-core` import paths keep working — but new code should
import them from `@vireocodedev/starter-ui` directly.

This is groundwork for absorbing `@rgo/front-ui` into `starter-ui`: core imports
front-ui components today, so with the old edge direction that merge would have
produced a `core → ui → core` cycle.
