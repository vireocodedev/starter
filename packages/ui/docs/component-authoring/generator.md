# Vireo component generator

The repository generator creates a complete root-only scaffold for a first-class Vireo React component from the canonical templates in `packages/ui/templates/react-component`.

## Generate a component

Run the command from the repository root with an unprefixed PascalCase name and an existing output parent directory:

```bash
npm run generate -- react-component Badge --output packages/ui/src/components
```

This creates:

```text
packages/ui/src/components/VireoBadge/
├── VireoBadge.classes.ts
├── VireoBadge.identity.ts
├── VireoBadge.stories.tsx
├── VireoBadge.styled.ts
├── VireoBadge.test.tsx
├── VireoBadge.tsx
├── VireoBadge.types.ts
└── index.ts
```

Do not include the `Vireo` prefix in the input. The generator rejects `VireoBadge`, `badge`, names containing separators, and destinations outside `packages/ui/src`.

## Storybook category

The Storybook category defaults to the output directory's display name. For example, `data-display` becomes `Data Display` and `overlay` becomes `Overlay`.

Override it when the directory name is not the desired navigation category:

```bash
npm run generate -- react-component Badge \
  --output packages/ui/src/components \
  --set storybookCategory="Data Display"
```

## Dry run

Inspect every destination without writing files:

```bash
npm run generate -- react-component Badge --output packages/ui/src/components --dry-run
```

List registered template families:

```bash
npm run generate -- --list
```

## Safety and validation

Before writing, the generator validates the template definition, declared inputs, every placeholder in file contents and destination paths, output-root containment, duplicate destinations, existing output, and rendered formatting.

All files are rendered and formatted before a staging directory is created. The completed staging directory is renamed into its final location only after every write succeeds. Existing component directories are never overwritten.

Run the generator tests with:

```bash
npm run generate:test
```

## Generated scaffold boundary

Name-only generation can create the complete structural contract, but it cannot infer the component's real semantics. The generated component therefore starts with a `div`-based MUI `Box` root and renders its full component name as text.

Before considering a generated component complete:

- Replace the component and Storybook `TODO(component-author)` descriptions.
- Decide whether the default root has the correct native semantics and props type.
- Define the real public props, owner state, slots, accessibility contract, behavior, and styling.
- Replace or extend the baseline tests and stories for those capabilities.
- Add the component directory to the package-level public barrel when it is ready to publish.
- Add the appropriate changeset.

The generated files are a compiling implementation scaffold, not evidence that the new abstraction is justified or finished.
