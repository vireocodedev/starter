# Vireo component test files

Every first-class public Vireo component has a colocated `VireoComponent.test.tsx` file. The suite protects the component's public rendering, behavior, accessibility, and customization contracts without testing private implementation details.

[`VireoOverlayHeader.test.tsx`](../../src/overlay/VireoOverlayHeader/VireoOverlayHeader.test.tsx) is the reference suite.

## File placement

Keep the test beside the component it covers:

```text
VireoComponent/
├── VireoComponent.tsx
├── VireoComponent.test.tsx
└── ...
```

The test file is private implementation infrastructure. Do not export it from the component `index.ts` or the package entry point. It must be discovered by Vitest and excluded from the published build.

## Mandatory minimal rendering test

Every component must have at least one test that renders it with only its required props and verifies its essential semantic output:

```tsx
describe(VIREO_COMPONENT_NAME, () => {
  it("renders its essential default semantics with only required props", () => {
    render(<VireoComponent label="Account" />);

    expect(screen.getByRole("region", { name: "Account" })).toBeInTheDocument();
  });
});
```

Rendering successfully already proves that the component did not throw. Assert an observable public result rather than using only `expect(() => render(...)).not.toThrow()`.

The assertion should establish the component's core default contract, such as:

- Its semantic root or primary role.
- Its required visible content.
- Its default accessible name or heading level.
- The absence of optional UI when that absence is essential to the default state.

Prefer accessible queries such as `getByRole`, `getByLabelText`, and `getByText`. Use a test ID only when the component has no suitable semantic or user-visible query.

## Capability-driven coverage

The mandatory rendering test is the minimum, not the complete definition of adequate coverage. Add focused tests for every public contract the component actually owns.

### Public behavior

Test defaults, conditional rendering, disabled states, controlled behavior, and other component-owned state transitions. Do not duplicate behavior that belongs entirely to React, the browser, or MUI.

### Events

Test each public callback and any documented event-composition rules. When slot handlers can prevent component-owned follow-up behavior, verify both the normal and prevented paths.

Use `vi.fn()` to observe callbacks and Testing Library interactions to exercise them through the rendered UI.

### Accessibility

Test semantics and accessibility relationships owned by the component, including roles, accessible names, heading levels, IDs, `aria-*` relationships, disabled state, and keyboard behavior where applicable.

Querying by role is useful evidence, but it does not replace assertions for component-specific accessibility contracts.

### Forwarded root ref

When the component forwards its root ref, verify that it resolves to the rendered root element:

```tsx
const ref = React.createRef<HTMLElement>();

render(<VireoComponent ref={ref} label="Account" />);

expect(ref.current).toBe(screen.getByRole("region", { name: "Account" }));
```

If `slotProps.root.ref` is public, also cover ref composition when that behavior is not already proven by a focused integration test.

### Slots and slot props

For a slotted component, prove that representative replacement slots and static or owner-state callback `slotProps` reach the intended elements. One representative test may cover the shared mechanism; test individual slots separately only when their contracts differ.

Always test slot-specific accessibility, events, precedence, or conditional rendering when those behaviors are unique to a slot.

### Utility classes

When the public `classes` API is exposed, verify that consumer classes are composed onto their matching slots without removing the generated Vireo utility classes.

Prefer the exported `vireoComponentClasses` record over hard-coded generated class strings.

### Theme integration

When the component supports MUI theme customization, verify meaningful `defaultProps` and representative per-slot `styleOverrides`. Test that the integration reaches the correct slot or owner state; do not exhaustively test CSS properties already owned by MUI or the browser.

### Regression coverage

Every fixed defect should receive the smallest test that would have failed before the fix. Keep that test after the implementation changes so the behavior cannot regress silently.

## Suite structure

Use the canonical component identity for the suite name:

```tsx
describe(VIREO_COMPONENT_NAME, () => {
  // tests
});
```

Order tests from the fundamental contract toward more specialized customization:

1. Mandatory minimal rendering
2. Default and conditional rendering behavior
3. Events and disabled behavior
4. Accessibility-specific behavior
5. Ref and root-prop composition
6. Slots and slot props
7. Utility classes
8. Theme integration
9. Focused regressions near the behavior they protect

This order is guidance rather than a reason to split closely related behavior across distant tests.

## Assertion boundaries

Assert behavior visible through the public API or rendered output. Avoid coupling tests to:

- Private helper functions.
- Styled-component implementation names.
- Emotion-generated class names.
- Internal React state.
- Incidental DOM nesting not promised by the component.
- Large snapshots that obscure the behavior under test.

DOM order is appropriate to assert when it is part of the public component anatomy, accessibility, or layout contract. Default slot elements, Vireo utility classes, and documented prop precedence are also legitimate public contracts.

Keep each test focused enough that its name explains the protected behavior. A test may contain several assertions when they jointly prove one contract.

## Visual behavior

Unit tests are not the primary proof for responsive layout, color, spacing, animation, hover appearance, or visual regression. Demonstrate visual states in `VireoComponent.stories.tsx` and use dedicated visual testing when available.

Use DOM style assertions only for specific programmable contracts, such as verifying that a theme `styleOverrides` rule reaches the intended slot.

## Review checklist

- The file is named `VireoComponent.test.tsx` and is colocated with the component.
- It is discovered by Vitest, excluded from the published build, and absent from public barrels.
- The suite name uses the canonical component identity constant.
- At least one test renders only the required props and verifies essential semantic output.
- Queries prefer accessible roles, names, labels, and visible content.
- Every component-owned public behavior has proportionate coverage.
- Events cover relevant normal, prevented, and disabled paths.
- Component-owned accessibility guarantees are asserted.
- Forwarded refs, slots, classes, and theme integration are tested when exposed.
- Tests assert public contracts rather than private implementation details.
- Visual behavior remains in stories or dedicated visual tests.
- Every regression fix adds focused permanent coverage.
