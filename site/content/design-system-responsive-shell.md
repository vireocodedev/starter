# Responsive shell

Responsive behavior preserves the user's task, state, and accessibility semantics as available space changes. It is not a rule to shrink a desktop composition until it fits.

## Compose for the available task space

Wide layouts use the `canvas -> content` relationship to distinguish the working panel from the environment. Compact layouts use a continuous `screen` with sections separated by spacing and standard dividers. A desktop panel must not become a visually identical card with its radius and border merely removed. Units that remain local and movable in meaning—metric tiles, selectable options, record previews—remain true cards.

Use component or container space to decide when a data view changes anatomy. A table becomes a record-list composition before titles, metadata, or actions compete for width; this can happen while the containing page still has a wide layout. Never hide essential columns simply to preserve a grid. See [accessibility guidance for tables](/docs/accessibility/#tables-and-mobile-layouts).

## Shell and navigation

The application shell remains mounted while authenticated route content changes. It owns persistent chrome, responsive navigation, page-width preferences, route-level waiting surfaces, session recovery, and unsaved-change coordination. Product routes, information architecture, and authorization decisions remain application-owned.

Derive wide and compact navigation from one route or navigation model so labels, destinations, and access rules cannot drift. Hidden routes may remain directly addressable but must not become accidental navigation entries. Preserve safe areas for compact navigation and full-screen workflows. Restore the correct contained scroll position for browser history; new destinations start at the top.

Routes can be eager when their synchronous composition is already required by the shell, or lazy when feature/access boundaries materially reduce the entry load. That loading decision is independent of visual loading policy. A lazy route must explicitly retain the established destination, reserve bounded progress, use a shared known structure, or intentionally show no waiting surface. The [loading-state standard](/docs/design-system/loading-states/) defines those choices.

## User preferences

Presentation preferences are validated local data, not authorization or domain state. Preserve a safe default and reset path for locale, light/dark scheme, table density, page width, desktop form surface (dialog, overlay side panel, or docked side panel), side-panel resize permission, expanded/compact navigation, navigation width, and navigation lock. If persisted storage is unavailable, malformed, or cannot be written, report a non-blocking diagnostic, continue with safe defaults, and let the application remain usable.

The current Starter Template reference composition provides a wide, resizable navigation area that can be locked at a chosen width, and a compact bottom navigation. Those are reference choices, not mandatory product information architecture. Products may choose another navigation model when it preserves task access, focus order, safe-area behavior, and the preference/recovery outcomes above.

## Layout and interaction constraints

- Preserve the shell and stable page frame while a route or query is pending.
- Keep known localized headers, navigation, actions, and page-width constraints stable during loading.
- Prefer intent prefetch for likely navigation over large eager bundles; unsupported platform features must degrade to immediate, usable navigation.
- Preserve keyboard order, visible focus, overlay focus restoration, and all task actions across layout modes.
- Apply hover affordances only for hover-capable pointers; compact and coarse-pointer layouts require equally clear non-hover cues.
- Write continuous resize state at most once per animation frame and avoid animating every row during sorting, filtering, pagination, or realtime updates.

Use [visual language](/docs/design-system/visual-language/) for semantic surface composition and [quality and release](/docs/design-system/quality-and-release/) for the required compact, coarse-pointer, and navigation checks.
