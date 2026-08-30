# Quality and release

Vireo treats visual and interaction behavior as a release contract. A polished UI is not established by a happy-path screenshot; it is demonstrated across states, input methods, responsive compositions, and recovery paths.

## Evidence layers

Use three complementary layers:

1. Focused unit and integration checks for models, services, hooks, and composition.
2. Storybook interaction, accessibility, and visual-state coverage for reusable and state-rich UI contracts.
3. End-to-end workflows for boot, session recovery, shell navigation, record changes, and explicit forbidden/not-found behavior.

Stories use deterministic data, application providers, and mocked feature APIs. Do not make a live backend a prerequisite for component evidence. Async-capable components and pages document their applicable `Loaded`, `Loading`, `Refreshing`, `Empty`, `Error`, and `AlignmentContract` states. Any omitted state is intentional and recorded.

## What to verify

For loading-capable surfaces, declare their category and geometry level. Exact geometry compares the outer frame, primary heading, first content anchor, repeated item or card boundaries, and primary action region. It also checks unexpected layout shift. Run relevant stories in compact and wide modes, supported page-width preferences, light and dark schemes, ordinary and reduced motion, default and longest supported locale, and accessibility checks.

Before release, exercise desktop, coarse-pointer mobile, keyboard-only use, lower-end mobile performance, installed PWA behavior where applicable, offline/reconnect, back/forward navigation, success and rollback, and reduced motion. Watch specifically for focus loss, layout shifts, content flashes, dropped frames, long tasks, duplicate announcements, and unnecessary bundle growth.

## Review checklist

- Hierarchy uses semantic surfaces, intentional color roles, readable type, and explicit divider/focus treatment.
- Compact composition preserves every task and provides a deliberate data-list alternative where a table no longer fits.
- Controls have accessible names, visible focus, sufficient target size, and non-color state cues.
- Pending work preserves usable content, keeps a single accessible boundary, and avoids invented skeleton geometry.
- Forms preserve submitted values and context, expose errors at the right time, and prevent unsafe duplicate actions.
- Failure states are normalized, recoverable, localized, and scoped to the affected boundary.
- Motion explains state while ordinary and reduced-motion experiences remain equally usable.
- Any exception to a required design or loading rule records its user-visible consequence, owner, and review condition.

Use the [interactive Storybook](/storybook/) to inspect public components, then validate the composed workflow. See [accessibility](/docs/accessibility/) and [ownership boundaries](/docs/concepts/ownership-boundaries/) for responsibilities that no visual test can infer.
