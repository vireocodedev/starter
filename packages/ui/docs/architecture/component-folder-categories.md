# Component folder categories

## Goal

Keep every architectural `components` directory predictable and classify components by their primary responsibility instead of their current screen, MUI primitive, or legacy location.

## Scope

These rules apply to every `components` structural folder under `core`, a top-level capability, or a child capability.

They do not apply to a provider, hook, context, service, or state module merely because it returns React elements. Those artifacts use their own structural folders and module contracts.

## Required structure

Every component receives its own PascalCase directory beneath exactly one approved category:

```text
components/
  <category>/
    PascalCaseComponent/
```

The following rules are mandatory:

1. Do not place files or component directories directly inside `components`.
2. Use only the approved categories below.
3. Create a category only when occupied.
4. Keep exactly one category level between `components` and the component directory.
5. Classify by primary responsibility.
6. Keep hooks, providers, contexts, services, state, shared types, styles, constants, models, and utilities outside `components`.
7. Split independently reusable components before classifying them.
8. Public component directories and exports use `Vireo`-prefixed PascalCase names.

## Public Vireo component contract

Every public React component under `components` is a first-class Vireo component with exactly these eight canonical root files:

```text
VireoComponent/
  VireoComponent.classes.ts
  VireoComponent.identity.ts
  VireoComponent.stories.tsx
  VireoComponent.styled.ts
  VireoComponent.test.tsx
  VireoComponent.tsx
  VireoComponent.types.ts
  index.ts
```

The root contract remains unchanged even when a component needs extra private implementation. Put that implementation under the optional `internal` directory described in [Capability structure](./capability-structure.md).

The [component-authoring guides](../component-authoring/component-files.md) are the canonical specification for the contents of these eight files. This guide governs placement and classification rather than duplicating those rules.

Temporary deprecated `Rgo*` aliases may remain as thin compatibility exceptions during migration. A private component promoted to the public API must first adopt the complete Vireo contract.

## Approved categories

| Category       | Responsibility                                                                          | Typical examples                                                                 |
| -------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `behavior`     | Nonvisual rendering, presence, lifecycle, timing, or measurement behavior.              | Delayed rendering, conditional presence, focus boundaries, measurement wrappers. |
| `controls`     | Actions, filters, search controls, toolbars, and workflow-level configuration surfaces. | Search toolbars, filter panels, export controls, action groups.                  |
| `data-display` | Primarily read-only presentation of data.                                               | Tables, values, status text, timelines, summaries, document viewers.             |
| `feedback`     | Loading, progress, error, empty, status, or notification surfaces.                      | Loaders, skeletons, error displays, progress, snack content.                     |
| `forms`        | Complete forms, form sections, or form-state-specific components.                       | Entity forms, guarded form shells, field groups, validation summaries.           |
| `inputs`       | Value-level editing or selection controls.                                              | Text, date, select, autocomplete, switch, slider, value picker.                  |
| `layout`       | Substantial structural arrangement of a region.                                         | Page bodies, grids, split panes, screen stacks, structural shells.               |
| `navigation`   | Movement between views, sections, or steps.                                             | Tabs, breadcrumbs, steppers, navigation menus.                                   |
| `overlays`     | Dialogs, drawers, sheets, popovers, and layered or adjacent surfaces.                   | Dialog headers, bottom sheets, side panels, overlay frames.                      |
| `surfaces`     | Visual containment, boundary, or elevation without a more specific responsibility.      | Cards, panels, framed containers, icon containers.                               |

`providers` is not a component category. Providers live in the owning boundary's `providers` structural folder. `utility` is not a category; use the specific `behavior` responsibility when appropriate.

Do not add a capability name or catch-all category such as `common`, `shared`, `misc`, or `utils`.

## Classification precedence

When more than one category seems plausible, apply the first matching rule:

1. `behavior` for primarily nonvisual rendering, lifecycle, timing, presence, or measurement behavior.
2. `overlays` for dialogs, drawers, sheets, popovers, and overlay coordinators, even when they contain a form.
3. `forms` for a complete form, form section, or component coupled to form state.
4. `inputs` for direct value editing or selection.
5. `controls` for actions, search, filters, toolbars, and workflow-level configuration.
6. `feedback` for loading, error, empty, progress, status, and operation-result surfaces.
7. `navigation` for movement among views, sections, or steps.
8. `surfaces` for generic visual containment or elevation.
9. `layout` for substantial structural arrangement.
10. `data-display` for read-only representation.

The precedence resolves ambiguity; it does not override ownership. First choose core or the capability that owns the behavior, then choose the component category inside that boundary.

## Classification examples

| Component               | Owner    | Category       | Reason                                                                               |
| ----------------------- | -------- | -------------- | ------------------------------------------------------------------------------------ |
| `VireoDelayedRender`    | Core     | `behavior`     | It controls render timing without presenting a visual surface.                       |
| `VireoIconContainer`    | Core     | `surfaces`     | Its primary purpose is visual containment around an icon.                            |
| `VireoLabelBox`         | Core     | `data-display` | It presents a label/content relationship without owning value editing or form state. |
| `VireoTruncatedContent` | Core     | `data-display` | It presents content with truncation and access to the complete value.                |
| `VireoOverlayHeader`    | Overlays | `overlays`     | It is a structural part of layered overlay surfaces.                                 |
| `VireoDockedSidePanel`  | Overlays | `overlays`     | It reserves workspace layout for an adjacent overlay surface.                        |

Further precedence examples:

- A form dialog belongs in `overlays`; its independently reusable inner form belongs in `forms`.
- A value-level date picker belongs in `inputs`; a report-configuration picker belongs in `controls`.
- An invoice totals card belongs in `data-display`; a generic card shell belongs in `surfaces`.
- A skeleton belongs in `feedback`; a delay wrapper around it belongs in `behavior`.
- Form sections belong to the forms capability even when their local category is `forms`, not core layout.

## Private components

Private components below a named module's `internal/components` folder:

- each receive a PascalCase directory;
- are flat and uncategorized;
- use only the files they actually need;
- use a local component `index.ts`;
- are not exported from the owner;
- do not receive standalone stories.

Example:

```text
VireoComplexComponent/
  # canonical eight root files
  internal/
    components/
      PrivatePart/
        PrivatePart.tsx
        index.ts
```

## Tests and stories

- Public Vireo tests and stories are part of the eight-file component root.
- Story-only or test-only fixtures live under `internal/fixtures` when they are too large to keep in the story or test.
- Private behavior is exercised through the public owner.
- Package-contract and cross-capability tests live under `packages/ui/tests`, not inside a component category.
- Existing Rgo stories remain only while the corresponding compatibility API is intentionally documented.

## Automated enforcement target

The architecture check will reject:

- files or component directories placed directly in `components`;
- unapproved or empty category directories;
- missing PascalCase component directories;
- public component names without the `Vireo` prefix;
- incomplete or expanded Vireo root-file contracts;
- category-level barrels;
- exported internals;
- deeper category or component nesting outside the allowed `internal` boundary.

Legacy violations remain only through individually documented migration allowlist entries. New and moved components must comply immediately.

## Review checklist

- Is ownership decided before category?
- Does the component have exactly one primary responsibility?
- Is it in an approved category?
- Does it have its own PascalCase directory?
- Does a public component use the Vireo name and eight-file contract?
- Are private additions below `internal` rather than added to the Vireo root?
- Are providers and non-component modules outside `components`?
- Are empty and catch-all categories absent?
