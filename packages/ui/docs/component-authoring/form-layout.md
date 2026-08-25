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
      <Button onClick={onCancel}>Cancel</Button>
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
  variant="divided"
>
  {/* fields */}
</form.Section>
```

Defaults are `headingLevel={2}`, `layout="grid"`, `maxColumns={2}`, and `variant="divided"`.

The grid responds to usable section-content width, not viewport width:

- Below `36rem`: one column.
- At `36rem`: two columns when `maxColumns` permits them.
- At `60rem`: three columns when `maxColumns={3}`.

`maxColumns` is a ceiling, never a forced count. Use `layout="stack"` when the content must remain one vertical sequence.

The divided variant is the standard form presentation. It keeps fields directly on the owning form or overlay canvas and places one semantic divider plus consistent vertical rhythm between adjacent divided sections. It does not introduce a nested background, outline, radius, or field-area padding.

The outlined variant is an explicit opt-in for a genuinely independent subgroup. It supplies the Vireo base surface (falling back to the MUI paper background), divider border, theme radius, `16px` narrow padding, and `24px` padding from `30rem`. The plain variant retains semantics and layout while removing both the outlined surface and automatic sibling dividers. Do not use outlined sections merely to group ordinary fields inside a dialog, drawer, side panel, or page form.

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
  <Button onClick={onCancel}>Cancel</Button>
  <form.SubmitButton variant="contained">Save customer</form.SubmitButton>
</form.Actions>
```

Actions always remain in one full-width horizontal row on every surface. Every ordinary direct action receives the same share of the available width, so the standard Cancel and Submit pair is an equal `50 / 50` composition after accounting for the gap. Actions never wrap or stack at narrow widths.

Whole-form Reset actions are intentionally unsupported. A standard form exposes Cancel followed by Submit. If a workflow needs more than those two actions, keep the row intact and place exceptional secondary commands in a compact `IconButton` that opens a menu or popover; direct MUI icon buttons retain their intrinsic width while the ordinary actions continue to share the remaining space equally.

Keep direct children ordered from least prominent to most prominent and do not use CSS ordering: visual, reading, and keyboard order must remain the same. The action component does not assign button types, inspect action semantics, or add landmark roles. The bound submit button continues to own its form-state behavior; Cancel remains an application or overlay-close decision.

## Responsive overlay forms

`VireoResponsiveFormOverlay` owns the standard overlay-form chrome: a raised header, a sunken independently scrolling content canvas, and an optional persistent raised action footer. Compose fields inside `form.Section`; pass global actions to the overlay rather than placing them inside a section.

Use `renderForm` to place the content and footer inside one semantic form and use the functional `actions` form when Cancel must participate in guarded close behavior:

```tsx
<VireoResponsiveFormOverlay
  open={open}
  onClose={onClose}
  title="Create customer"
  closeLabel="Close customer form"
  closeDisabled={saving}
  renderForm={children => (
    <form.Form layoutWidth="full" unsavedChangesGuard>
      {children}
    </form.Form>
  )}
  actions={({ requestClose }) => (
    <form.Actions>
      <Button onClick={requestClose}>Cancel</Button>
      <form.SubmitButton variant="contained">Create customer</form.SubmitButton>
    </form.Actions>
  )}
>
  <form.Section label="Customer details">{/* fields */}</form.Section>
</VireoResponsiveFormOverlay>
```

The header remains outside the form. The form wrapper contains one internal zero-gap layout region that owns the scrolling content and footer, so the form's normal section gap cannot create space between those surfaces. Dialogs remain content-sized until constrained; desktop side panels fill their available height; mobile sheets grow until their configured maximum. In every surface, only the content canvas scrolls while the header and footer remain visible.

Static action nodes remain supported for non-form decisions. Form-bound submit buttons require `renderForm`. Use the supplied `requestClose` for Cancel so header close, backdrop click, Escape, Cancel, and responsive surface transitions share the same unsaved-change confirmation. `closeDisabled` blocks those overlay-owned exits; submission and post-success reset or closure remain application responsibilities.

## Multi-step forms

Use `useVireoMultiStepForm` when one typed form, schema, and submission are presented across several steps. Step descriptors own stable IDs, labels, optional field ownership, and optional value-driven availability. Keep the descriptor order and field ownership stable for the lifetime of the mounted form.

```tsx
const form = useVireoMultiStepForm({
  defaultValues: { name: "", email: "" },
  steps: [
    { id: "profile", label: "Profile", fields: ["name"] },
    { id: "contact", label: "Contact", fields: ["email"] },
  ],
  onSubmit: ({ value }) => saveAccount(value),
});

return (
  <form.Form>
    <form.MultiStep>
      <form.StepProgress />
      <form.ErrorSummary scope="all" />
      <form.Step id="profile">{/* profile sections */}</form.Step>
      <form.Step id="contact">{/* contact sections */}</form.Step>
      <form.Actions>
        <form.PreviousStepButton />
        <form.NextStepButton />
        <form.SubmitButton>Save account</form.SubmitButton>
      </form.Actions>
    </form.MultiStep>
  </form.Form>
);
```

Forward navigation validates the fields owned by the current step. Backward navigation does not revalidate. `NextStepButton` and `PreviousStepButton` hide automatically at their unavailable boundaries; `SubmitButton` appears only on the final step. Set `visibility="always"` only when a stable action footprint is required, in which case the unavailable action remains disabled.

Progress uses visited-step navigation by default and switches between horizontal and compact presentations according to its container width. Use `navigation="none"` for strictly linear workflows or `navigation="all"` only when direct forward navigation is intentional; intermediate incomplete steps are still validation-gated. `keepMounted` preserves inactive step subtrees while hiding them and should be reserved for integrations whose local UI state cannot be reconstructed from form values.

## Direct exports and customization

`VireoFormSection`, `VireoFormSectionItem`, and `VireoFormActions` are also direct public exports for native-form compositions. Their bound `form.*` properties use those same implementations.

Use semantic props for ordinary layout decisions. Every component still supports `classes`, `slots`, `slotProps`, `sx`, and MUI theme overrides for real exceptions. Do not reach into styled internals or reproduce the container-query CSS in consumers.

## Story standard

Executable form and bound-field stories use `form.Form`, `form.Section`, optional `form.SectionItem`, and `form.Actions` instead of manually rebuilding the standard with MUI `Stack`, `Grid`, grid-oriented `Box`, viewport breakpoints, or resize observers. The existing `VireoLabelBox` rules for input-like `field.*` stories remain mandatory.
