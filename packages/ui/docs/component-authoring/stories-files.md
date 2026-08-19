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
  title: "Components/Category/VireoComponent",
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

## Stable navigation title

Use an explicit title with this hierarchy:

```text
Components/[Category]/VireoComponent
```

Choose a stable functional category such as `Overlay`, `Navigation`, `Input`, or `Layout`. Storybook 9 statically indexes CSF files and requires `meta.title` to be a string literal:

```ts
title: "Components/Overlay/VireoComponent";
```

An explicit title prevents Storybook navigation from changing when a source file moves. This literal is the deliberate exception to importing the canonical identity everywhere the component name is used. Keep its final segment identical to `VIREO_COMPONENT_NAME`; a template generator should derive both values from the same component-name input.

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

## Capability-driven stories

The Default story is the minimum, not the complete documentation for every component. Add stories only for public distinctions a consumer needs to see or exercise.

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
- The literal title follows `Components/[Category]/VireoComponent` and its final segment matches the canonical identity.
- `component` references the public component without a cast.
- `tags: ["autodocs"]` is present.
- The component description opens with a one-sentence summary and includes `### Why it exists` with the recurring problem, Vireo rationale, and use-or-avoid boundary.
- A `Default` story demonstrates the simplest realistic normal usage.
- The Default story does not restate optional defaults unnecessarily.
- Args and inferred controls are preferred over custom render logic.
- Complex or misleading controls are configured deliberately.
- Any story-only args adapter is derived from public types and relaxes only a Storybook-incompatible correlated contract.
- Fixtures and decorators are deterministic, minimal, and product-neutral.
- Additional stories correspond to meaningful public states or customization contracts.
- Interactive stories use accessible canvas queries.
- Slot and theme stories use only supported public customization APIs.
- Stories are ordered from fundamental usage toward advanced customization.
- Private styled slots and helpers are not imported.
