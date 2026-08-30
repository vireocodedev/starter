# Motion

Motion explains a state change; it must never be required to understand one. Vireo favors short, calm transitions that preserve orientation and reduce visual noise in operational work.

## What may move

Use transform and opacity for route and surface transitions. Restrict color animation to small local feedback. Keep a route transition short and let unsupported browsers navigate immediately. Mobile navigation and full-screen workflows may use a spatial overlay transition when it improves orientation.

Do not use `transition: all`, animate ambient grids or shadows, or animate every row because a list refreshed, sorted, filtered, or hydrated. A resize interaction should update visual width once per animation frame, not on every input event. Sound is absent by default. Haptics, if a product adds them, must be capability-checked, user-controlled, rare, and supplementary to visible and assistive feedback.

## Current reference tokens

The following are current Starter Template reference values, not public package APIs. Applications may evolve their own tokens while preserving the motion and reduced-motion outcomes above.

| Token group   | Reference values                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| Duration      | instant 0 ms; micro 110 ms; exit 150 ms; standard 180 ms; enter 210 ms; emphasized 270 ms                  |
| Easing        | standard `cubic-bezier(0.2, 0, 0, 1)`; enter `cubic-bezier(0, 0, 0, 1)`; exit `cubic-bezier(0.3, 0, 1, 1)` |
| Distance      | micro 4 px; component 8 px; surface 16 px                                                                  |
| Pressed scale | 0.98                                                                                                       |

## Reduced motion is a complete state

Every application-authored keyframe and nonessential transition needs a `prefers-reduced-motion: reduce` path. Reduced motion removes travel, scale, and indeterminate decorative animation without removing status, feedback, or affordance. Progress that must communicate active indeterminate work may remain only in its least distracting supported form.

Use one semantic motion token set rather than per-component literal durations and easings. Loading treatment uses the shared timing described in [loading states](/docs/design-system/loading-states/): no transient visual before its reveal delay, no forced minimum skeleton display time, and no stale-content replacement during refresh.

## Interaction feedback

The authenticated shell remains present while a lazy route loads; only the pending page region changes. Initial empty data may use a shape-matched skeleton when structure is known. Refresh retains usable data and provides contextual progress. Mutations communicate pending state at the initiating action, preserve enough target context to understand a destructive operation, reconcile optimistic updates with the server, and restore the prior state when an operation fails.

Validate normal and reduced motion with keyboard-only and coarse-pointer use. Watch for focus loss, content flashes, layout shift, long tasks, dropped frames, and feedback that disappears when animation is disabled. The [quality and release checklist](/docs/design-system/quality-and-release/) turns those expectations into release evidence.
