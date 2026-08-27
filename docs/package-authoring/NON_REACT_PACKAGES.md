# Non-React package authoring

This guide defines the target contract for every Starter frontend package other
than `@vireocodedev/ui`. It applies to new packages immediately and to
existing packages as they are migrated. `starter-history` is the pilot that
proves the rules before they are applied to the remaining packages.

## Boundary

A non-UI package owns framework-independent data, validation, algorithms,
protocols, persistence, or browser infrastructure. It must not own presentation.

- Do not import or expose React, React DOM, MUI, JSX, React elements, component
  types, hooks, contexts, providers, or renderer-shaped callbacks.
- Do not add `.tsx` source files.
- Move any reusable React component or React-specific adapter to
  `@vireocodedev/ui` under the appropriate core, capability, or
  integration boundary.
- Prefer serializable or framework-neutral results. A formatter may return text;
  it must not return a UI node.
- Keep framework-free guarantees mechanical through package tests and the
  repository public-surface gate.

The rule concerns both runtime and declarations. A type-only React dependency is
still a boundary violation because it forces consumers to install React and
makes the public contract presentation-aware.

## Source structure

Treat a focused package as one capability. Organize `src` by domain
responsibility rather than copying the UI package's component taxonomy.

```text
src/
  definitions/
  diff/
  records/
  index.ts
tests/
  definitions/
  diff/
  records/
  contracts/
```

Only create directories that have a real responsibility. A small package does
not need `core`, `capabilities`, `components`, `hooks`, `providers`, or
`integrations` merely for symmetry with UI.

- Use descriptive camel-case TypeScript filenames such as
  `createHistoryNodes.ts` and `historyNode.types.ts`.
- Avoid legacy multi-dot ownership names such as `history.engine.diff.ts`.
- Avoid internal `index.ts` barrels. Internal code imports the owning module
  directly so dependency direction remains visible.
- The root `src/index.ts` is the package's explicit public entry point. Add a
  subpath only when it represents a genuine runtime or capability boundary.
- Keep tests outside `src`: focused behavior tests mirror the source
  responsibility; `tests/contracts` owns package-wide rules.

## Public API

- Export consumer concepts, not implementation conveniences.
- Keep erased `Any*` aliases, traversal helpers, and internal builder machinery
  private unless a consumer must name them.
- Prefer direct, intention-revealing factories over factories suffixed with
  `Fn` or wrappers that return a one-property object.
- Every export addition, removal, or rename must update `api-surface.json` and
  carry the appropriate Changeset.
- Declare one source of truth for each concept. Schemas may infer their matching
  types when that produces an accurate contract.
- Validate invalid configuration early with descriptive errors instead of
  silently discarding or overwriting data.

## Dependency policy

- A leaf package must not acquire a Starter workspace dependency without an
  architecture decision.
- Runtime dependencies belong in `dependencies`; host-owned compatible runtimes
  belong in `peerDependencies`; test/build-only tools belong in
  `devDependencies`.
- Do not retain unused externals in the bundler configuration.
- Set `sideEffects: false` only while module evaluation is genuinely free of
  observable side effects.
- Framework-free packages should be loadable in Node and Web Workers unless
  their documented purpose requires a browser API.

## Testing contract

Each package must cover four layers:

1. Focused unit tests for every meaningful algorithm branch and failure policy.
2. Schema/type tests for accepted, rejected, and inferred data shapes.
3. A public contract test covering the intended consumer workflow.
4. An architecture test proving the package contains no forbidden framework
   dependency or `.tsx` source.

For tree-producing algorithms, test complete deterministic results rather than
only checking that a result exists. Cover ordering, nesting, empty values,
identity collisions, unchanged values, and invalid input.

## Documentation contract

The package README must state:

- what the package owns and deliberately does not own;
- installation and actual peer dependencies;
- a copy-pastable primary workflow;
- the public concepts and their relationship;
- failure and identity semantics that affect correctness;
- the framework/runtime guarantee.

Examples must compile against the current public API. Generated output and old
changelog prose are not architectural authority.

Packages contribute live documentation through the shared Vireo Starter
Storybook according to [Non-React live documentation](./NON_REACT_LIVE_DOCUMENTATION.md).
React rendering remains owned by the UI documentation host; package examples
remain framework-free TypeScript outside `src`.

## Pilot: `starter-history`

The history pilot separates these responsibilities:

- `records`: validates transport-neutral history records and snapshots;
- `definitions`: describes typed entity identity, labels, fields, and optional
  string formatting;
- `diff`: compares validated snapshots and emits framework-neutral nodes whose
  values preserve both `raw` and `formatted` representations;
- `starter-ui`: exclusively owns React presentation through
  `VireoHistoryEntry`.

The pilot removes React from dependencies and declarations, replaces
`render(...): ReactNode` with `format(...): string`, makes empty strings real
values rather than missing values, rejects duplicate array identities, narrows
the public surface, and establishes focused coverage for all diff modes.

## Pilot: `starter-localization`

The localization pilot separates resource ownership from React consumption:

- `starter-localization` owns namespace constants, translations, resource
  factories, registration, merge utilities, and locale-neutral formatters;
- `starter-ui/react-i18next` exclusively owns the `react-i18next` namespace
  hooks and other React localization adapters;
- applications continue to own i18next initialization, locale selection,
  persistence, detection, and provider placement.

The framework-free package must be safe to load in Node and Web Workers. Its
resource factories return deeply isolated locale objects, reject invalid
configuration, and never depend on DOM globals. Shared translation keys remain
versioned public contracts guarded by explicit key-surface tests.
