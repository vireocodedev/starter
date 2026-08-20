# Vireo form layout

## Purpose

Vireo forms express layout through form concepts rather than consumer-authored `Stack`, `Grid`, viewport breakpoints, or resize observers. The standard components respond to the width of the surface that actually contains them, so the same form composition works in pages, dialogs, drawers, side panels, and embedded regions.

Obtain the bound API from `useVireoForm`:

```tsx
const form = useVireoForm({
  defaultValues: { email: "" },
  onSubmit: ({ value }) => saveProfile(value),
});

return (
  <form.Form>
    <form.Section label="Profile" description="Account contact details.">
      <form.Field name="email">
        {field => (
          <VireoLabelBox label="Email">
            <field.TextField slotProps={{ htmlInput: { "aria-label": "Email" } }} />
          </VireoLabelBox>
        )}
      </form.Field>
    </form.Section>

    <form.Actions>
      <form.ResetButton>Discard changes</form.ResetButton>
      <form.SubmitButton variant="contained">Save profile</form.SubmitButton>
    </form.Actions>
  </form.Form>
);
```

## Form boundary

`form.Form` owns the form's width, centering, minimum-width safety, and vertical rhythm. It has no default padding because the containing page or overlay owns its gutters.

Use `layoutWidth` to select a standard maximum:

| Value        | Maximum width | Intended use                                           |
| ------------ | ------------- | ------------------------------------------------------ |
| `"standard"` | `48rem`       | Ordinary create and edit forms; this is the default.   |
| `"wide"`     | `72rem`       | Data-dense administrative forms.                       |
| `"full"`     | None          | Consumer-managed, drawer, dialog, or embedded layouts. |

All presets retain `width: 100%`, `min-width: 0`, automatic inline centering, and a `24px` gap between direct children. Use `sx` for a genuinely exceptional maximum rather than adding one-off width presets.

## Sections

`form.Section` requires `label`, renders a named HTML section, generates its heading and description relationships, and owns a container-responsive field layout.

```tsx
<form.Section
  label="Contract"
  description="Dates and recurring billing policy."
  headingLevel={2}
  layout="grid"
  maxColumns={3}
  variant="outlined"
>
  {/* fields */}
</form.Section>
```

Defaults are `headingLevel={2}`, `layout="grid"`, `maxColumns={2}`, and `variant="outlined"`.

The grid responds to usable section-content width, not viewport width:

- Below `36rem`: one column.
- At `36rem`: two columns when `maxColumns` permits them.
- At `60rem`: three columns when `maxColumns={3}`.

`maxColumns` is a ceiling, never a forced count. Use `layout="stack"` when the content must remain one vertical sequence.

The outlined variant supplies a paper background, divider border, theme radius, `16px` narrow padding, and `24px` padding from `30rem`. The plain variant retains semantics and layout while removing the surface background, border, and padding.

## Section items

Ordinary fields render directly inside `form.Section`. Use `form.SectionItem` only when multiple elements form one cell or content must span the complete current row.

```tsx
<form.SectionItem span="full">
  <Alert severity="warning">Changing country recalculates taxes.</Alert>
</form.SectionItem>
```

`span` defaults to `"auto"`; `"full"` always spans the active row, regardless of whether the section currently has one, two, or three columns. Numeric spans are intentionally unsupported because they have ambiguous responsive behavior.

Conditional children mount normally and the grid reflows without reserved positions. The layout components never clone, reorder, register, or preserve field state.

For a genuinely nested section, use a full-row item, increment the heading level, and prefer the plain variant:

```tsx
<form.SectionItem span="full">
  <form.Section label="Advanced billing" headingLevel={3} variant="plain">
    {/* fields */}
  </form.Section>
</form.SectionItem>
```

Prefer sibling top-level sections when the content does not logically belong to the parent.

## Actions

`form.Actions` preserves DOM order from least prominent to most prominent:

```tsx
<form.Actions>
  <form.ResetButton>Discard changes</form.ResetButton>
  <form.SubmitButton variant="contained">Save customer</form.SubmitButton>
</form.Actions>
```

Below `30rem` of container width, actions stack vertically at full width. At `30rem` and above, they use natural widths in an end-aligned row. Do not use CSS ordering: visual, reading, and keyboard order must remain the same.

The action component does not assign button types, inspect children, or add landmark roles. Bound submit and reset buttons continue to own their form-state behavior.

## Direct exports and customization

`VireoFormSection`, `VireoFormSectionItem`, and `VireoFormActions` are also direct public exports for native-form compositions. Their bound `form.*` properties use those same implementations.

Use semantic props for ordinary layout decisions. Every component still supports `classes`, `slots`, `slotProps`, `sx`, and MUI theme overrides for real exceptions. Do not reach into styled internals or reproduce the container-query CSS in consumers.

## Story standard

Executable form and bound-field stories use `form.Form`, `form.Section`, optional `form.SectionItem`, and `form.Actions` instead of manually rebuilding the standard with MUI `Stack`, `Grid`, grid-oriented `Box`, viewport breakpoints, or resize observers. The existing `VireoLabelBox` rules for input-like `field.*` stories remain mandatory.
