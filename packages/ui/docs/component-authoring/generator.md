# Vireo component generator

The repository generator creates the required eight-file top-level component scaffold plus private executable Storybook examples from the canonical templates in `packages/ui/templates/react-component`.

The React component command is architecture-aware. It derives the output path from a required owner and component category rather than accepting an arbitrary `--output` directory.

## Generate a core component

Run the command from the repository root with an unprefixed PascalCase name:

```bash
npm run generate -- react-component Badge \
  --owner core \
  --category data-display
```

This creates:

```text
packages/ui/src/core/components/data-display/VireoBadge/
├── VireoBadge.classes.ts
├── VireoBadge.identity.ts
├── VireoBadge.stories.tsx
├── VireoBadge.styled.ts
├── VireoBadge.test.tsx
├── VireoBadge.tsx
├── VireoBadge.types.ts
├── index.ts
└── internal/
    └── storybook/
        ├── CustomizedSlotsExample.tsx
        ├── DefaultExample.tsx
        └── ThemeCustomizationExample.tsx
```

Do not include the `Vireo` prefix in the input. The generator rejects `VireoBadge`, `badge`, and names containing separators.

## Owners

Use one of these owner forms:

```text
core
capabilities/<top-level-capability>
capabilities/<parent>/<child>
```

Examples:

```bash
npm run generate -- react-component TableHeader \
  --owner capabilities/table \
  --category data-display

npm run generate -- react-component MobileToolbar \
  --owner capabilities/table/management-table \
  --category controls
```

Owner names use kebab-case. Capability nesting is limited to one child level. Reserved structural names such as `components`, `hooks`, and `types` cannot be used as child capability names.

The owner directory must already exist. Core and the owning top-level capability must already have their required `public.ts`; generation does not invent architectural boundaries. The generator creates `components/<category>` atomically when it receives that category's first component.

## Categories

`--category` is required and accepts only:

- `behavior`
- `controls`
- `data-display`
- `feedback`
- `forms`
- `inputs`
- `layout`
- `navigation`
- `overlays`
- `surfaces`

Choose ownership and category using the [source structure](../architecture/source-structure.md) and [component folder categories](../architecture/component-folder-categories.md) guides before running the command.

## Storybook title

The default Storybook hierarchy is derived from the public owner. Core keeps its
responsibility category; focused capabilities and integrations are flattened so
source folders do not become redundant navigation levels:

```text
Core/Data Display/VireoBadge
Capabilities/Table/VireoTableHeader
Capabilities/Table/Management Table/VireoMobileToolbar
Integrations/Maps/VireoMap
```

Override the hierarchy when the approved developer-facing group differs from
the source owner, such as a bound form field or an integration whose task and
vendor should both remain visible:

```bash
npm run generate -- react-component EmailField \
  --owner capabilities/forms \
  --category forms \
  --set storybookCategory="Capabilities/Forms/Fields"
```

## Dry run

Inspect every destination without writing files:

```bash
npm run generate -- react-component Badge \
  --owner core \
  --category data-display \
  --dry-run
```

The React component template rejects `--output`. List registered template families with:

```bash
npm run generate -- --list
```

## Safety and validation

Before writing, the generator validates:

- the owner form, depth, existence, and public boundary;
- the approved component category;
- the template definition and declared inputs;
- every placeholder in contents and destination paths;
- output-root containment and duplicate destinations;
- existing output and rendered formatting.

All files are rendered and formatted before a staging directory is created. Missing category parents are created immediately before the completed staging directory is renamed into its destination. Failed writes clean up temporary and newly created empty directories. Existing component directories are never overwritten.

Run generator tests with:

```bash
npm run generate:test
```

## Generated scaffold boundary

Generation establishes structure only. The scaffold starts with a `div`-based MUI `Box` root and placeholder behavior.

Before considering it complete:

- Replace every `TODO(component-author)` implementation and Storybook description.
- Keep the main story description's one-sentence summary and `### Why it exists` section.
- Replace each generated example's temporary `@/` component import with the public `@vireocodedev/starter-ui` import after adding the completed component to its owner boundary. The temporary import keeps the unfinished scaffold type-checkable; it is not valid final code-panel output.
- Keep each executable example as the single source for both its story render and `docs.source.code`; do not introduce duplicate source strings.
- Decide whether the public Vireo abstraction is justified.
- Choose the correct native root semantics and inherited props.
- Define the real props, owner state, slots, accessibility, behavior, and styling.
- Replace or extend baseline tests and stories with capability-driven coverage.
- Export the component from its owner `public.ts` only when ready to publish.
- Re-export the owner boundary from `src/index.ts` when introducing the boundary.
- Add the appropriate changeset for a published API change.

The generated files are a compiling implementation scaffold, not evidence that the abstraction is justified or finished.
