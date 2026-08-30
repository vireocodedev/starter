# Components

The component guide explains the intent of Vireo's public React component families. Storybook remains the interactive catalogue for props, states, controls and responsive examples.

Use the [Design system](/docs/design-system/) for the cross-component contracts: semantic surfaces, responsive composition, motion, async behavior, forms, recovery, localization, and release evidence.

## Page and navigation composition

Use page-layout and application-navigation primitives to keep title, actions, loading, empty states and narrow-screen behavior consistent. Product routes and authorization decisions remain application composition.

[Open page-layout examples in Storybook]({{STORYBOOK_URL}}?path=/docs/capabilities-page-layout--docs)

## Tables and data presentation

Vireo table capabilities target operational data: filters, action placement, loading boundaries and mobile alternatives. Do not force a desktop grid into a narrow viewport when a card/list representation communicates the task better.

[Open table examples in Storybook]({{STORYBOOK_URL}}?path=/docs/capabilities-table--docs)

## Forms and overlays

Form sections, actions and responsive overlays keep validation and submission states visible. Use domain-specific field labels and errors; components cannot infer the language of your workflow.

[Open form examples in Storybook]({{STORYBOOK_URL}}?path=/docs/capabilities-forms--docs)

## Feedback and loading

Loading regions, skeletons, initialization boundaries and status indicators distinguish initial load, background refresh, empty state and failure. Avoid replacing every state with an undifferentiated spinner.

The [loading-state standard](/docs/design-system/loading-states/) defines boundary ownership, geometry, timing, accessible announcements, and the required state evidence.

## Hooks and utilities

The public UI entry point also includes carefully bounded hooks for online status, search-parameter state, fullscreen behavior and transition presence, plus formatting and theme utilities.

Use the [TypeScript API reference](/reference/typescript/) only when the curated guide and Storybook do not answer an exact signature question.

> Storybook documents available components; this page documents the decisions around using them.
