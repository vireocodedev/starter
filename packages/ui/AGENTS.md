# Vireo UI

`@vireocodedev/ui` is a public design system, not an application component folder. New public components must use the generator and current component-authoring contracts; ordinary application composition and private helpers do not need the public component structure.

- Use `$starter-ui-component-author` for a new, migrated, or incomplete public UI component.
- Preserve owner boundaries, slot order, public types, utility classes, and MUI augmentation as one contract.
- Treat accessibility semantics, dark-theme Storybook rendering, executable source panels, and loading-state declarations as part of component completion.
- Add or update a changeset whenever a published API changes. Do not expose a component from a public barrel until it is complete.

Read `docs/component-authoring/generator.md` before scaffolding and the file-specific component-authoring guides for touched surfaces.
