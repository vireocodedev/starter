---
"@vireocodedev/starter-ui": minor
---

Consume `AppBottomDrawer` and the shell content-width constants from
`@vireocodedev/starter-core` instead of bundling private copies. These two
symbols are no longer re-exported from `@vireocodedev/starter-ui`; import them
from `@vireocodedev/starter-core`. Also adds ported component tests
(`useResponsiveProps`, `ResponsiveMonthYearPicker`).
