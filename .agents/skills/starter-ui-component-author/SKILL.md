---
name: starter-ui-component-author
description: Create, migrate, or complete first-class public Vireo React components in @vireocodedev/starter-ui using its generator and component-authoring contracts. Use for Vireo design-system component work, not application-specific compositions, internal helpers, or ordinary UI edits.
---

# Starter UI Component Author

Build a finished, publishable Vireo component—not merely a compiling scaffold. Work from the `@vireocodedev/starter` repository root and preserve the user's requested behavior, compatibility, and scope.

## Canonical sources

The repository documentation is authoritative. Read the guide for every file or contract the task touches; read all of them for a new or full component migration:

- New scaffolds and CLI constraints: [generator.md](../../../packages/ui/docs/component-authoring/generator.md)
- Runtime implementation and prop precedence: [component-files.md](../../../packages/ui/docs/component-authoring/component-files.md)
- Public types, slots, owner state, and MUI augmentation: [types-files.md](../../../packages/ui/docs/component-authoring/types-files.md)
- Canonical name and ordered slot tuple: [identity-files.md](../../../packages/ui/docs/component-authoring/identity-files.md)
- Utility-class contract: [classes-files.md](../../../packages/ui/docs/component-authoring/classes-files.md)
- Styled slots and root semantics: [styled-files.md](../../../packages/ui/docs/component-authoring/styled-files.md)
- Capability-driven unit coverage: [test-files.md](../../../packages/ui/docs/component-authoring/test-files.md)
- Storybook documentation and interactions: [stories-files.md](../../../packages/ui/docs/component-authoring/stories-files.md)
- Component and package public barrels: [index-files.md](../../../packages/ui/docs/component-authoring/index-files.md)

Use the cited reference components from those guides when a concrete pattern is needed. Do not copy an older `Rgo*` implementation when it conflicts with the current Vireo contracts.

## New components

Use the repository generator for a new first-class component. Do not hand-create the eight-file structure while the `react-component` template is available.

1. Choose an unprefixed PascalCase input such as `StatusBadge`; the generator adds `Vireo`.
2. Choose an existing output parent under `packages/ui/src`. Infer the Storybook category from that directory or set it explicitly when the navigation label should differ.
3. Inspect destinations before writing:

```bash
npm run generate -- react-component StatusBadge \
  --output packages/ui/src/components/data-display \
  --set storybookCategory="Data Display" \
  --dry-run
```

4. If the plan is correct and no destination exists, rerun without `--dry-run`.

The generator deliberately refuses to overwrite an existing component. For an existing or partially migrated component, edit it in place and use the file guides as the completion checklist.

## Complete the scaffold

Generation establishes structure only. Before treating the component as complete:

- Replace every `TODO(component-author)` description and placeholder behavior.
- Decide whether a public Vireo abstraction is justified. Do not force internal helpers or application compositions into this contract.
- Choose the correct native or MUI root semantics, matching inherited props and forwarded-ref type.
- Define the real public anatomy. Keep `root` first and remaining slots in rendered DOM order across identity, types, classes, styled slots, implementation, tests, and stories.
- Normalize public defaults into one owner-state object shared by utility classes, slot-prop callbacks, styled slots, and variants.
- Preserve the documented root/non-root prop precedence, ref composition, and slot-event cancellation rules.
- Encode accessibility dependencies in types when possible and protect required runtime semantics from late prop spreads.
- Keep default CSS in `*.styled.ts`; expose only styling regions that are genuine public slots or state classes.
- Replace baseline tests with capability-driven coverage for behavior, events, accessibility, refs, slots, classes, theme integration, and regressions actually owned by the component.
- Replace baseline stories with useful default, state, edge-case, interaction, slot, and theme examples as supported by the component. Start the main component description with a one-sentence summary, then add `### Why it exists` covering the recurring problem, why Vireo owns the abstraction, and its use-or-avoid boundary. A story build is not a substitute for behavior tests.
- Export only the component, classes, and types from the local barrel unless another API is intentionally public. Add the component directory to `packages/ui/src/index.ts` only when ready to publish.
- Add an appropriate changeset for a published API change. Preserve compatibility aliases when the migration requires them.

## Validation

Run focused checks first and broaden them in proportion to the change. For a new public component, the expected final gate is:

```bash
npm exec --workspace @vireocodedev/starter-ui vitest run <path-to-component-test>
npm run typecheck --workspace @vireocodedev/starter-ui
npm run test --workspace @vireocodedev/starter-ui
npm run build --workspace @vireocodedev/starter-ui
npm run build-storybook --workspace @vireocodedev/starter-ui
npm run types:strict
npm run surface
npm run lint
npm run format:check
git diff --check
```

If `npm run surface` differs only because of an intentional public export, run `npm run surface:update`, inspect the snapshot diff, and rerun `npm run surface`. Run `npm run generate:test` when changing the generator or its templates, not for an ordinary generated component.

Do not report the component complete while generated placeholders remain, required public-surface changes are unexplained, or relevant checks are failing. Distinguish pre-existing failures and routine Storybook dependency/chunk warnings from regressions introduced by the component.
