# Accessibility

Vireo components provide a tested baseline for keyboard, focus, semantics and responsive behavior. Applications remain responsible for the accessibility of their domain workflows and content.

## Required application behavior

- Every interactive control has an accessible name.
- Keyboard order follows the visible task order.
- Focus remains visible and moves deliberately after overlays or navigation.
- Errors are associated with the affected fields and summarized when appropriate.
- Loading, empty and failure states are announced without excessive interruption.
- Color is not the only indicator of meaning.
- Narrow layouts retain the complete task, not merely a compressed desktop view.

## Tables and mobile layouts

Data tables need meaningful headers and row context. When a wide table becomes unusable on mobile, switch to a deliberate card or list presentation rather than hiding essential columns without explanation.

## Overlays

Dialogs and responsive drawers must trap focus appropriately, provide a clear close action, restore focus and prevent background interaction. Test destructive and unsaved-change paths with keyboard only.

## Testing

Combine automated semantic checks with manual keyboard, zoom, screen-reader and narrow-viewport evaluation. Automation catches regressions; it does not determine whether a complex workflow is understandable.

Use [Storybook](/storybook/) to inspect isolated states, then validate the composed workflow in the real application.
