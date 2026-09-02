# Design system

Vireo's design system is a set of stable interaction and presentation contracts for operational applications. It helps teams make dense, data-rich workflows feel calm, legible, and reliable across wide and compact screens. It is not a product-branding system: applications still own their visual identity, domain language, navigation choices, and task-specific workflows.

## Use the system as a contract

The system defines outcomes and boundaries rather than prescribing a single page design:

- semantic surfaces make hierarchy and contrast predictable in every color scheme;
- responsive compositions preserve the task when space changes instead of shrinking a desktop layout;
- motion, loading, focus, and status feedback make state changes understandable without being distracting;
- forms, errors, and localized copy retain context and accessible names; and
- Storybook and release checks turn the most important visual and interaction states into verifiable evidence.

Use public package entry points and the [TypeScript API reference](/reference/typescript/) for exact exports. The conventions in this section describe how to compose those capabilities. Application-specific route registries, field component names, feature folders, and theme files are examples of a starter-derived application architecture, not framework APIs.

## Ownership

Vireo owns reusable primitives, semantic contracts, and their documented accessibility behavior. An application owns product theme choices within those roles, content, authorization, domain validation, data semantics, and any policy that only makes sense for that product. See [ownership boundaries](/docs/concepts/ownership-boundaries/) before moving application behavior into a shared layer.

## Read by decision

| If you are deciding                                       | Start here                                                                  |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| How a page should communicate hierarchy                   | [Visual language](/docs/design-system/visual-language/)                     |
| How the shell, navigation, and data views adapt           | [Responsive shell](/docs/design-system/responsive-shell/)                   |
| How feedback should move or stay still                    | [Motion](/docs/design-system/motion/)                                       |
| How async work preserves context and geometry             | [Loading states](/docs/design-system/loading-states/)                       |
| How a workflow edits, validates, and presents records     | [Forms and validation](/docs/design-system/forms-and-validation/)           |
| How session and service failures reach a user             | [Authentication and errors](/docs/design-system/authentication-and-errors/) |
| How copy, dates, numbers, and messages reach every locale | [Localization and copy](/docs/design-system/localization/)                  |
| How a UI change earns release confidence                  | [Quality and release](/docs/design-system/quality-and-release/)             |

The [accessibility guide](/docs/accessibility/) remains normative for keyboard, semantics, focus, and responsive-task completeness. This section makes those requirements concrete for visual composition and stateful workflows.

## Source provenance

These public contracts are translated from pinned implementation evidence so the documentation line remains reviewable:

- [Visual language](https://github.com/vireocodedev/vireo-template/blob/cef67cc74af3d28028fba424e1d5c6a92faa6fc9/frontend/docs/VISUAL_LANGUAGE.md), [responsive shell](https://github.com/vireocodedev/vireo-template/blob/cef67cc74af3d28028fba424e1d5c6a92faa6fc9/frontend/docs/architecture/routing-and-shell.md), and [motion](https://github.com/vireocodedev/vireo-template/blob/cef67cc74af3d28028fba424e1d5c6a92faa6fc9/frontend/docs/INTERACTION_MOTION.md) use the current 0.8.6 Template reference composition.
- [Loading states](https://github.com/vireocodedev/vireo/blob/main/docs/LOADING_STATE_STANDARD.md) use the normative Vireo loading-state standard.
- [Forms and validation](https://github.com/vireocodedev/vireo-template/blob/cef67cc74af3d28028fba424e1d5c6a92faa6fc9/frontend/docs/architecture/models-forms-and-validation.md), [authentication and errors](https://github.com/vireocodedev/vireo-template/blob/cef67cc74af3d28028fba424e1d5c6a92faa6fc9/frontend/docs/architecture/authentication-and-errors.md), and [localization](https://github.com/vireocodedev/vireo-template/blob/cef67cc74af3d28028fba424e1d5c6a92faa6fc9/frontend/docs/architecture/localization.md) are Template reference conventions.
- [Quality and release](https://github.com/vireocodedev/vireo-template/blob/cef67cc74af3d28028fba424e1d5c6a92faa6fc9/frontend/docs/architecture/storybook-and-testing.md) records the associated verification model.
