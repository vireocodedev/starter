---
"@vireocodedev/starter-core": minor
---

Add accessible landmark semantics to the app shell and its layout presets:

- The dashboard, public, and bare shell presets now render their routed
  content inside a `<main id="main-content" tabIndex={-1}>` landmark.
- A new `AppSkipToContentLink` renders at the top of every shell preset,
  labelled via `common.skipToMainContent`, and moves focus to `#main-content`
  on activation instead of relying on native hash-navigation focus behavior.
- `AppLayoutHeader`'s root now renders as a real `<header>` element, and its
  route breadcrumb is now the page's single `<h1>` (was a plain `<span>`) —
  visual styling is unchanged.
- `AppLayoutNav` (desktop sidebar + mobile drawer nav) and
  `AppMobileBottomNavigation` now render as `<nav>` landmarks with an
  `aria-label` (`common.mainNavigation` / `common.bottomNavigation`).
- `AppPublicShellLayout`'s existing `<nav>` now has an `aria-label`
  (`common.mainNavigation`) and its `<main>` gained `id="main-content"` +
  `tabIndex={-1}`.

Consuming apps must add the `common.mainNavigation`, `common.bottomNavigation`,
and `common.skipToMainContent` translation keys.
