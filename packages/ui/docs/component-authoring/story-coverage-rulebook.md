# Vireo story coverage rulebook

This rulebook determines which stories a first-class Vireo component needs. It complements [Vireo component story files](./stories-files.md), which defines file placement, executable-source wiring, metadata, naming, theme compatibility, and other mechanical authoring contracts.

The objective is minimum sufficient coverage: every story must teach or prove a distinct consumer-visible part of the public contract, and the complete set must omit scenarios that add maintenance without adding useful documentation.

## Coverage audit statuses

Audit each coverage question with exactly one status:

- **Covered**: the current story set demonstrates the contract clearly and accurately.
- **Needs improvement**: a related story exists, but its fixture, context, interaction, source, or focus does not teach the contract well enough.
- **Missing**: the contract matters to consumers and no story demonstrates it.
- **N/A**: the question does not apply to the component. Never invent a story merely to avoid this status.

Record a short evidence-based reason for every status. Story count is not a quality target: a focused component may need two stories while a behavioral component may need six.

## The twelve coverage questions

Evaluate the public component, types, tests, and current stories against all twelve questions before selecting a final story set.

### 1. Canonical usage

Does the literal `Default` story show the simplest realistic use that exercises the component's actual purpose?

The canonical story must make the component itself the subject. A fallback, no-op, empty, or non-triggering state is not a good default when it hides the defining behavior. Keep advanced customization and exceptional context out of `Default`.

### 2. Meaningful variants

Which visually or semantically distinct public variants must a consumer compare?

Combine closely related variants into one labelled comparison when that makes their relationship clearer. Do not create one story for every enum member or prop value when a single scenario can communicate the complete distinction.

### 3. Meaningful states

Which states materially change anatomy, behavior, or consumer decisions?

Examples include selected, expanded, loading, empty, disabled, invalid, and completed states. Cover meaningful transitions or outcomes, not every boolean permutation.

### 4. Content and data boundaries

What content shapes deliberately affect the component?

Consider short and long text, rich React content, empty data, large collections, unbroken values, optional regions, and other boundaries the component explicitly owns. Use realistic product-neutral fixtures.

### 5. User interactions

Which interactions are necessary to understand the component's public behavior?

Use a `play` function when exercising the interaction proves meaningful behavior. Query through accessible roles and names, assert consumer-observable results, and keep Autodocs stable after the play function completes.

### 6. Async and data loading

Does the component own loading, success, empty, error, retry, or asynchronous transition behavior?

Mark this N/A for purely synchronous components. Do not add mock requests or artificial delays when asynchronous behavior belongs to the consuming application.

### 7. State ownership

Does the component support controlled and uncontrolled state, or coordinate state with its consumer?

Document both models only when the distinction changes how consumers integrate the component. A controlled example should make the external owner visible rather than merely copying internal state into a wrapper.

### 8. Responsive structural behavior

Does container size or viewport size change anatomy, visibility, layout, or interaction?

Prefer explicit, deterministic demonstrations such as labelled preview widths or a genuinely resizable container. The story must show the component responding to the relevant boundary; descriptive text that only claims responsiveness is insufficient.

### 9. Surrounding context

Does the component require a surface, layout, selection state, overlay, form, or other context to be understood correctly?

Add only the smallest realistic context that exposes the contract. Context should clarify the component rather than turn the story into a miniature application.

### 10. Accessibility-critical behavior

Which accessible name, role, state, relationship, focus, keyboard, or announcement behavior must consumers understand?

Prefer visible context plus accessible queries. Add a dedicated story when correct accessible use cannot be inferred from the canonical scenario, such as a standalone color marker that needs an explicit label.

### 11. Realistic edge cases

Which valid but difficult inputs or layouts is the component designed to handle?

An edge-case story must represent a supported consumer scenario, not malformed props or an implementation curiosity already protected by unit tests.

### 12. Real-world composition

Does behavior change when the component is composed inside another interactive or structural primitive?

Use composition stories for contracts such as event propagation, nested layout constraints, selected surfaces, overlay placement, or coordinated controls. Keep the composition product-neutral and focused on the Vireo component.

## Selecting the final story set

After the audit, propose the smallest set that resolves every applicable gap. Apply these rules:

1. Every component has one literal `Default` story.
2. Every additional story answers at least one coverage question that `Default` cannot answer clearly.
3. Prefer one coherent scenario over separate stories for individual props.
4. Prefer consumer-visible behavior over implementation detail.
5. Do not duplicate a scenario solely because unit tests cover more permutations. Stories teach and demonstrate; tests exhaustively protect behavior.
6. Merge stories that differ only in fixture wording, generic styling, or incidental layout.
7. Remove obsolete stories when stronger scenarios supersede them.
8. Keep fixtures deterministic, product-neutral, and independent of networks, current time, mutable external state, and consuming applications.
9. Use public package APIs only. A story must never require private styled slots or production internals.
10. End interactive stories in a stable, understandable Autodocs state.

For each proposed removal, record why the story is redundant, generic, misleading, or outside the component's contract.

## Controls and executable source

Vireo stories never expose Storybook Controls. Controls can create a canvas state that no longer matches the displayed executable module, weakening the copy-paste guarantee. Disable them at component metadata level:

```tsx
parameters: {
  controls: { disable: true },
}
```

Fixed `args` remain useful for type-safe baseline data, callback spies, and `play` assertions, but users do not edit them through Controls.

Every story, including the simplest one, displays a complete executable TSX module from its matching `internal/storybook/StoryNameExample.tsx` file. The same module renders the canvas and supplies `docs.source.code`; generated JSX or a serialization of a private render wrapper is not an acceptable substitute. See [Executable displayed source](./stories-files.md#executable-displayed-source) for the wiring contract.

## Conditional customization stories

`CustomizedSlots` and `ThemeCustomization` are not mandatory names or checklist items.

Add a slot story only when a non-root replacement slot or owner-state-aware slot prop demonstrates a credible extension consumers need. Generic root replacement, borders, padding, colors, or data attributes do not justify a dedicated story.

Add a theme story only when component-specific `defaultProps`, variants, or per-slot overrides reveal a meaningful global theming contract. Generic root color, border, radius, or spacing changes do not justify one.

Customization may instead appear in another focused story when it supports that story's consumer scenario without becoming its subject.

## Lessons from the approved pilots

The initial pilots establish practical reference points rather than mandatory story counts.

### VireoStatusDot

Its four stories cover canonical labelled use, all semantic statuses in one comparison, selected-surface contrast, and the accessibility requirement for a standalone marker. The pilot shows that closely related variants belong together and that accessibility deserves a separate story only when usage changes materially.

### VireoIconContainer

Its two stories cover canonical normalization and aspect-ratio preservation. The pilot shows that a narrow transformation primitive needs only its defining behavior and most important geometry boundary. Reusable Storybook presentation helpers are appropriate when they make a comparison legible while leaving the public Vireo invocation visible in executable source.

### VireoTruncatedContent

Its six stories cover canonical disclosure, content that fits without truncation, horizontal overflow, container-responsive measurement, controlled ownership, and propagation-safe composition inside a clickable row. The pilot shows that behavioral components may need more stories, that `Default` must activate the defining behavior, and that realistic composition is more valuable than generic slot or theme decoration.

## Audit record template

Use this structure during a story review:

```md
| Coverage question      | Status            | Evidence or gap                                                    |
| ---------------------- | ----------------- | ------------------------------------------------------------------ |
| Canonical usage        | Needs improvement | Default renders a fallback state instead of the defining behavior. |
| Meaningful variants    | Covered           | One labelled comparison shows all semantic variants.               |
| Async and data loading | N/A               | The component owns no asynchronous behavior.                       |
```

Follow the matrix with:

1. the proposed final story names and the distinct contract each covers;
2. stories to merge, rename, or remove and the reason for each decision;
3. relevant verification, including interaction assertions where meaningful.

Add component-family-specific rules only after several approved components demonstrate a stable recurring need. Do not encode speculative family requirements from a single component.
