# Visual language

Vireo interfaces are command interfaces: immediate, information-rich, and professional. They make the current task, state, and next safe action obvious without turning an operational application into a decorative dashboard or a game skin.

## Hierarchy and semantic color

Use the current Starter Template reference color mapping consistently:

| Reference color | Meaning                                                                                 |
| --------------- | --------------------------------------------------------------------------------------- |
| Vireo blue      | Current location, primary action, visible focus, and the most important active readout. |
| Green           | Healthy or completed state.                                                             |
| Indigo          | Secondary capability or supporting information.                                         |
| Gold            | Caution, warning, or review.                                                            |
| Red             | Destructive state and action.                                                           |

Do not use the primary accent as passive decoration, and do not use color as the only carrier of meaning. Selected navigation and important panels may use a narrow accent rail; surrounding every region with an accent border weakens the hierarchy. Status, module identity, and table headings can use compact uppercase metadata, while actions and ordinary content use sentence case.

## Surface roles

Every background has one semantic role. Theme values may change between light and dark schemes, but roles and their nesting order do not.

| Role       | Purpose                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `canvas`   | The wide-screen environment. It may carry a quiet grid treatment, but is not a content surface. |
| `screen`   | The continuous compact-screen environment, without the canvas grid.                             |
| `content`  | Primary working panels, command bars, table bodies, preference rows, and ordinary cards.        |
| `recessed` | A subordinate readout or intentionally inset group inside content.                              |
| `control`  | Inputs, selects, text areas, and equivalent field surfaces.                                     |
| `elevated` | Content that visually sits above an ordinary working surface.                                   |
| `chrome`   | Persistent structure such as headers and navigation.                                            |
| `overlay`  | Temporary dialogs, drawers, and side panels.                                                    |

Use these compositions as the baseline:

```text
wide page:    canvas -> content
compact page: screen -> screen sections + true content cards
command bar:  content -> control
table:        content -> elevated header + content rows
preferences:  content -> elevated section header + content rows -> control
inset group:  content -> recessed -> control
overlay:      overlay -> recessed body -> control
```

Controls must not sit directly on a parent with the same visual role. On wide screens, working panels use `content` above the `canvas`; on compact screens, primary wrappers flatten into `screen` sections while controls retain the `control` role. Reserve recessed cards for genuinely inset readouts such as metrics; ordinary actionable cards remain outlined content surfaces.

## Command surfaces and boundaries

Command surfaces are compact, bordered working regions with subtle hierarchy. Use them for page-level filtering, operational summaries, data views, and focused entry workflows. Keep their primary action and current state obvious.

The environmental grid belongs to the page canvas only. Do not repeat it inside cards, forms, dialogs, or table rows. Do not use product-specific textures, ornamental HUD chrome, meters, or game terminology as a substitute for hierarchy.

Structural borders use the semantic divider color unless they communicate focus, selection, warning, or error. Supply an explicit semantic color with any border shorthand: an omitted color can resolve to `currentColor` and accidentally inherit text color. Default field outlines must meet non-text contrast requirements; focus uses the primary accent. Hover-only treatments apply only where hover is available.

## Action clarity and accessibility

Use a consequence preview when an action's result, quantity, or permanence needs explanation before commitment. Keep the description short, concrete, and programmatically associated with the action. An action whose label already describes its full result does not need extra helper copy.

Do not gain density by reducing touch targets, readable type, contrast, or focus visibility. In the current reference composition, coarse-pointer icon buttons have a 44 × 44 CSS-pixel minimum; relevant menu items and medium settings actions use a 48 px minimum height. Custom controls still need target-size and surrounding-context verification. The visual system is inseparable from the [accessibility contract](/docs/accessibility/) and from the [motion policy](/docs/design-system/motion/).
