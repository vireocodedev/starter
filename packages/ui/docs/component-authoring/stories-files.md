# Vireo component story files

Every first-class public Vireo component has a colocated `VireoComponent.stories.tsx` file. The file is the component's live visual documentation: it presents the default usage and the meaningful public states, behavior, edge cases, and customization contracts a consumer needs to understand.

[`VireoOverlayHeader.stories.tsx`](../../src/overlay/VireoOverlayHeader/VireoOverlayHeader.stories.tsx) is the reference story file.

## File placement

Keep the story beside the component it documents:

```text
VireoComponent/
├── VireoComponent.tsx
├── VireoComponent.stories.tsx
└── ...
```

The story file is private documentation infrastructure. Do not export it from the component `index.ts` or package entry point, and exclude it from the published build.

## Module shape

Order a story file as follows:

1. Imports
2. Optional story-only fixtures, wrappers, or themes
3. Typed component metadata
4. Default export and derived `Story` type
5. Mandatory `Default` story
6. Common states and edge cases
7. Interactive stories
8. Slot customization
9. Theme customization

Preserve a clear progression from basic usage to advanced customization. Dependency order takes precedence when a shared fixture or theme must be declared before metadata.

## Typed metadata

Connect Storybook directly to the public component type:

```tsx
const meta = {
  title: "Core/Data Display/VireoComponent",
  component: VireoComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A concise sentence explaining what the component does.\n\n### Why it exists\n\nExplain the recurring problem, why Vireo owns the abstraction, and its use-or-avoid boundary.",
      },
    },
  },
} satisfies Meta<typeof VireoComponent>;

export default meta;
type Story = StoryObj<typeof meta>;
```

Prefer this form together with `StoryObj<typeof meta>`.

### Discriminated-union exception

Storybook treats story args as independently editable partial values. For a component with correlated discriminated-union props, `StoryObj<typeof meta>` can therefore reduce its args to `never`. Preserve the stricter component API and create a story-only adapter derived from its public contracts:

```tsx
type VireoComponentStoryArgs = VireoComponentOwnProps & {
  [TPropName in keyof VireoComponentConditionalProps]?: VireoComponentConditionalProps[TPropName];
};

const meta: Meta<typeof VireoComponent> = {
  component: VireoComponent,
  // ...
};

export default meta;
type Story = StoryObj<VireoComponentStoryArgs>;
```

Use a named `Meta<typeof VireoComponent>` annotation in this exception when the inferred metadata type would otherwise trigger TypeScript's non-portable declaration error for nested MUI types. Keep `component` pointed directly at the real component without a cast.

The adapter may relax only the correlated contract that Storybook must edit independently. Derive its fields from public types; do not manually copy the complete component prop surface. Every predefined story must still supply a valid runtime combination. Introduce a typed story-only render wrapper only when controls can otherwise produce an invalid runtime or accessibility state.

## Stable architecture-aware navigation title

Use the explicit hierarchy derived from the component's architectural owner and approved category:

```text
Core/[Category]/VireoComponent
[Top-level capability]/[Category]/VireoComponent
[Top-level capability]/[Child capability]/[Category]/VireoComponent
```

For example:

```ts
title: "Core/Behavior/VireoDelayedRender";
title: "Table/Management Table/Controls/VireoMobileToolbar";
```

### Bound form-field grouping

Components exposed through the `useVireoForm` `field.*` facade intentionally use one additional `Fields` navigation directory beneath the forms component category:

```ts
title: "Forms/Forms/Fields/VireoFormTextField";
```

This grouping currently contains `VireoFormCheckboxField`, `VireoFormFileField`, `VireoFormFileListField`, `VireoFormNumberField`, `VireoFormRadioGroupField`, `VireoFormSelectField`, `VireoFormSelectMultipleField`, `VireoFormSwitchField`, `VireoFormTemporalField`, and `VireoFormTextField`. Form-level components such as `VireoForm`, `VireoFormActions`, `VireoFormResetButton`, `VireoFormSection`, `VireoFormSectionItem`, and `VireoFormSubmitButton` remain directly under `Forms/Forms`.

The Vireo Storybook navigation sorts component files before child directories at every level. Within those two groups, entries remain alphabetical. Consequently, `Forms/Forms` lists its four form-level components first and the `Fields` directory afterward.

The owner and category must match the source architecture rather than an invented Storybook-only grouping. Storybook 9 statically indexes CSF files and requires `meta.title` to be a string literal. This literal is the deliberate exception to importing the canonical identity everywhere the component name is used. Keep its final segment identical to `VIREO_COMPONENT_NAME`; the generator derives the initial title and identity from the same inputs.

## Autodocs and component description

Every public component enables Storybook Autodocs:

```ts
tags: ["autodocs"];
```

Structure the main `parameters.docs.description.component` as:

1. One concise opening sentence explaining what the component does.
2. The literal Markdown heading `### Why it exists`.
3. A short paragraph explaining the recurring consumer problem, why Vireo owns the shared abstraction, and its important use-or-avoid boundary.

The final paragraph should say when to prefer the component and, when useful, when to keep using the underlying MUI primitive, native element, or simpler helper. Keep the rationale focused on current consumer value rather than implementation history.

Describe the public abstraction, not its internal styled slots or implementation history. TypeScript and component JSDoc remain the source of truth for individual prop types; do not manually reproduce the full API in prose.

## Mandatory Default story

Every component exports one story named `Default`. It demonstrates the simplest realistic normal usage and resolves to only required props whenever that produces meaningful output:

```tsx
export const Default: Story = {
  args: {
    label: "Account",
  },
};
```

Required baseline args may instead live in metadata when every story needs them:

```tsx
const meta = {
  // ...
  args: {
    label: "Account",
  },
} satisfies Meta<typeof VireoComponent>;

export const Default: Story = {};
```

Do not set an optional prop merely to restate its component default. The Default story should visibly exercise the real default behavior, without replacement slots, custom theme values, or advanced styling.

## Args and controls

Prefer serializable `args` over a custom `render` function. Args keep controls, generated source, URL state, and story reuse working naturally.

Allow Storybook to infer ordinary controls from the component's public types. Configure `argTypes` only when inference needs help or a value cannot be represented meaningfully:

```ts
argTypes: {
  title: { control: "text" },
  leadingAction: { control: false },
  onClose: { control: false },
  slots: { control: false },
  slotProps: { control: false },
}
```

React nodes, callbacks, slot components, and complex slot-prop objects commonly need disabled controls or a deliberately simpler control. Do not duplicate accurate TypeScript descriptions and defaults manually in `argTypes`.

Use Storybook action spies such as `fn()` for callback args. Do not trigger real application side effects.

## Render functions, decorators, and fixtures

Add a custom `render` function only when the story needs local state, coordinated elements, or another structure that args and decorators cannot express. Keep its props derived from the real component rather than copying the public contract.

Use decorators for shared visual context such as a constrained surface, provider, or theme. Keep the context minimal and make the component remain the subject of the story.

Story-only fixtures must be deterministic, product-neutral, and local to the story unless several components genuinely share them. Stories must not depend on a consuming application, network data, current time, or mutable external state.

## Executable displayed source

The code panel is consumer documentation, not a serialization of Storybook's private render tree. Its displayed source must be a complete TSX module that a consumer can copy into a project with `@vireocodedev/starter-ui` installed, compile without private imports, and render to reproduce the story's initial canvas.

For a direct args-only story, generated source may be retained only when it already meets that complete-module standard. When a story uses a render wrapper, coordinated fixture, local state, or presentation chrome, create one executable example file and import that same file both normally and through Vite's `?raw` query:

```text
VireoComponent/
  internal/
    storybook/
      DefaultExample.tsx
  VireoComponent.stories.tsx
```

```tsx
import DefaultExample from "@/core/components/data-display/VireoComponent/internal/storybook/DefaultExample";
import defaultExampleSource from "@/core/components/data-display/VireoComponent/internal/storybook/DefaultExample.tsx?raw";

export const Default: Story = {
  render: () => <DefaultExample />,
  parameters: {
    docs: {
      source: {
        code: defaultExampleSource,
        language: "tsx",
        type: "code",
      },
    },
  },
};
```

The executable example is the sole source of truth. Never maintain a second handwritten template string containing the same JSX. Keep the file product-neutral and include all of its consumer imports; it must not import the story file, `internal` production modules, private styled slots, Storybook packages, or repository-only aliases.

The story file itself follows the source architecture and reaches the nested example through the `@/` alias. The executable example deliberately imports the public package entry points because its contents are consumer code; the architecture checker permits that exception only below a component's `internal/storybook/` directory.

`tests/storySourceContract.test.ts` enforces this connection for every Vireo story. It requires a matching `StoryNameExample.tsx`, verifies that the story renders its normal import and displays its `?raw` import, rejects orphan example modules, and prevents the displayed module from depending on repository-private or Storybook-runtime imports.

The generator initially gives each example a `TODO(component-author)` repository-alias import so the unfinished, not-yet-exported scaffold continues to type-check. Once the component is complete and exported from its owner boundary, replace that temporary import with `@vireocodedev/starter-ui`. A component is not finished while any executable example retains the repository alias or its TODO.

Presentation infrastructure that is genuinely reusable across components may be published from `@vireocodedev/starter-ui/storybook`. A helper created specifically for one component uses a PascalCase component subpath, for example:

```tsx
import { VireoIconContainerComparisonFrame } from "@vireocodedev/starter-ui/storybook/VireoIconContainer";
```

Published Storybook helpers may own comparison layout, review surfaces, labels, or providers, but must leave the documented Vireo invocation visible in the executable example. They are explicit developer-tooling APIs, are never re-exported from the package root, and must have no runtime dependency on Storybook itself.

## Shared dark Storybook theme

The Vireo review Storybook supplies one shared dark MUI theme. Every story, including its fixtures, decorators, portals, and theme-customization example, must remain visually coherent with that outer theme.

- Use semantic palette tokens such as `background.default`, `background.paper`, `text.primary`, `text.secondary`, `divider`, and `action.hover` for neutral story surfaces and text.
- Do not hardcode `white`, light grey palette values, or other light-only neutral colors in story fixtures.
- Deliberate brand or state accents may use explicit colors, but they must retain suitable contrast on the shared dark surfaces.
- A theme-customization story must extend the outer theme. Do not pass a standalone `createTheme({ ... })` result to `ThemeProvider`, because that silently resets the story to MUI's default light mode.

Use an outer-theme callback when demonstrating component theme customization:

```tsx
import { ThemeProvider, createTheme, type Theme } from "@mui/material";

function createCustomizedTheme(outerTheme: Theme): Theme {
  return createTheme(outerTheme, {
    components: {
      VireoComponent: {
        styleOverrides: {
          root: {
            borderColor: "#a78bfa",
          },
        },
      },
    },
  });
}

export const ThemeCustomization: Story = {
  decorators: [
    Story => (
      <ThemeProvider theme={createCustomizedTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
```

The dark review theme is the baseline, but semantic tokens are still preferred so fixtures remain correct if the shared theme evolves.

## Capability-driven stories

The Default story is the minimum, not the complete documentation for every component. Add stories only for public distinctions a consumer needs to see or exercise.

### Bound form-field validation

Every form input exposed through a `useVireoForm` field façade, such as `field.TextField` or `field.NumberField`, includes both of these executable stories:

1. `ZodFieldValidation` passes a Zod schema through that field's `validators` prop.
2. `ZodFormValidation` passes one Zod object schema through `useVireoForm` and leaves the individual fields without validators.

Use realistic invalid and valid values, render the corresponding bound `field.*` component, and retain the form's actual validation timing. Together the stories must show both supported schema scopes and prove that form-level path-aware issues reach the matching fields without repeated schemas.

### Bound form-field composition

Every executable story for an input-like `field.*` component composes the input inside `VireoLabelBox`. Put the visible field label on `VireoLabelBox`, not on the underlying MUI input label. Suppress that internal label and retain an accessible name on the actual control through its supported slot props.

```tsx
<form.Field name="projectName">
  {field => (
    <VireoLabelBox label="Project name">
      <field.TextField placeholder="Northstar" slotProps={{ htmlInput: { "aria-label": "Project name" } }} />
    </VireoLabelBox>
  )}
</form.Field>
```

Mirror visible required state on `VireoLabelBox` when the field is required. Keep validation errors and field-specific helper text on the bound input unless a story is explicitly demonstrating `VireoLabelBox` helper anatomy.

Exceptions must be explicit and narrowly justified by control anatomy. The current whitelist contains `field.SwitchField` and `field.CheckboxField`: their visible labels are integral to MUI's switch or checkbox control-label composition, so their stories retain the field label and do not add `VireoLabelBox`. Add future exceptions to this list before using them.

### Standard form layout

Executable form and bound-field stories follow the [Vireo form layout](./form-layout.md) contract. Compose examples with `form.Form`, `form.Section`, optional `form.SectionItem`, and `form.Actions`; do not rebuild their spacing, grid, responsive breakpoints, or action layout with MUI `Stack`, `Grid`, grid-oriented `Box`, viewport media queries, or resize observers.

Keep ordinary fields as direct section children. Use `form.SectionItem` only for one-cell compositions or full-row content. Keep action children ordered from least prominent to most prominent so mobile and desktop reading order remain consistent.

### Common states

Show meaningful normal variants and conditional anatomy, such as closable, selected, expanded, loading, empty, or disabled states. Do not create one story for every boolean combination.

### Edge cases

Demonstrate content and layout boundaries the component deliberately handles, including long text, overflow, dense content, narrow surfaces, or responsive mode changes.

### Interactive behavior

Use a `play` function when interaction materially demonstrates the contract:

```tsx
export const Interactive: Story = {
  args: { onAction: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Perform action" }));
    await expect(args.onAction).toHaveBeenCalledOnce();
  },
};
```

Query the canvas through accessible roles and names. A play function is required only when it adds useful interactive documentation; it does not replace the component's unit tests.

### Slots and slot props

For a component with a meaningful slot API, include a representative customization story showing replacement slots and `slotProps` together. Demonstrate the supported public extension mechanism without importing private styled slots.

### Theme customization

For a MUI theme-integrated component, include a representative theme story demonstrating `defaultProps` or per-slot `styleOverrides`. Keep the theme local and make the customization visually obvious without turning the story into a product-specific design.

## Story naming and order

Use concise PascalCase export names that describe the visible contract. Order stories as follows when the corresponding categories exist:

1. `Default`
2. Common states
3. Edge cases
4. Interactive behavior
5. Slot customization
6. Theme customization

Story display names normally derive from their exports. Set an explicit `name` only when the generated label would be unclear.

## Public API boundary

Exercise the same API available to a component consumer:

- Public props and callbacks.
- `slots` and `slotProps`.
- The `classes` contract when visually relevant.
- MUI theme `defaultProps`, `styleOverrides`, and variants.

Do not import private styled slots, call private helpers, or reproduce component behavior inside the story. Importing the private identity constant is appropriate for a local MUI theme key, but Storybook's static indexer requires the navigation title to remain a literal.

## Relationship to tests

Stories explain usage, states, and appearance. Unit tests protect detailed behavioral, accessibility, precedence, and ref contracts. Some overlap is useful, but the two files have different primary purposes.

Do not add invisible edge cases solely to inflate story coverage. Conversely, do not rely on a manually viewed story as the only protection for behavior that can regress programmatically.

## Review checklist

- The file is named `VireoComponent.stories.tsx` and is colocated with the component.
- It is excluded from the published build and absent from public barrels.
- Metadata directly satisfies or is explicitly annotated as `Meta<typeof VireoComponent>`.
- The literal title follows the owner/category hierarchy, matches the component's source ownership, and ends with the canonical identity.
- `component` references the public component without a cast.
- `tags: ["autodocs"]` is present.
- The component description opens with a one-sentence summary and includes `### Why it exists` with the recurring problem, Vireo rationale, and use-or-avoid boundary.
- A `Default` story demonstrates the simplest realistic normal usage.
- The Default story does not restate optional defaults unnecessarily.
- Args and inferred controls are preferred over custom render logic.
- Complex or misleading controls are configured deliberately.
- Any story-only args adapter is derived from public types and relaxes only a Storybook-incompatible correlated contract.
- Fixtures and decorators are deterministic, minimal, and product-neutral.
- Every code panel shows a complete, copy-pastable TSX module rather than private render wrappers or serialized React fragments.
- Complex examples import one executable example normally and with `?raw`; no duplicate handwritten source string exists.
- Executable examples use only consumer-resolvable imports and keep the documented Vireo invocation visible.
- Published Storybook helpers use explicit shared or PascalCase component subpaths and have no Storybook runtime dependency.
- Fixtures use semantic theme tokens and remain coherent with the shared dark Storybook theme.
- Theme-customization decorators extend the outer theme instead of replacing it with a standalone light theme.
- Additional stories correspond to meaningful public states or customization contracts.
- Every bound `field.*` input includes executable `ZodFieldValidation` and `ZodFormValidation` stories.
- Every non-whitelisted input-like `field.*` story composes the control inside `VireoLabelBox`, puts its visible label there, suppresses the MUI input label, and preserves an accessible control name.
- The bound-field story whitelist is explicit; currently only `field.SwitchField` and `field.CheckboxField` are exempt from `VireoLabelBox` composition.
- Interactive stories use accessible canvas queries.
- Slot and theme stories use only supported public customization APIs.
- Stories are ordered from fundamental usage toward advanced customization.
- Private styled slots and helpers are not imported.
