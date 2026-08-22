# Non-React live documentation

This guide defines how framework-free Starter packages contribute live
documentation to the single Vireo Starter Storybook.

## Ownership boundary

`@vireocodedev/starter-ui` owns the shared Storybook runtime, React rendering
support, theme, navigation, and build. A non-React package owns only its
documentation content and framework-free executable examples.

This preserves the non-React package contract:

- no React, JSX, Storybook, or UI imports in the package's `src`;
- no `.tsx` examples in the package;
- no Storybook dependency in the package manifest;
- documentation and examples are excluded from the published `dist` package;
- React exists only in the UI-owned documentation host.

## Package structure

```text
packages/<package>/
  src/
  tests/
  docs/
    examples/
      <workflow>.example.ts
    storybook/
      Overview.mdx
      <Workflow>.mdx
```

`docs/examples` contains ordinary TypeScript modules that import only public
package APIs. `docs/storybook` contains standalone MDX pages discovered by the
shared Storybook.

## Navigation

Non-React packages live below the `Libraries` root:

```text
Libraries/<Package>/<Page>
```

Every package begins with `Overview`. Remaining pages follow the package's
consumer workflow and correctness boundaries, not its internal source folders.
UI components remain under the established `Core`, `Capabilities`, and
`Integrations` roots.

## Executable source contract

Every live example must execute the exact source shown to the reader:

1. Put the complete consumer example in one `.example.ts` file.
2. Export a zero-argument `run...Example` function. It may return a value or a
   promise.
3. Import that function into MDX and pass it to the shared
   `ExecutablePackageExample` renderer.
4. Import the same file with Vite's `?raw` suffix and pass it as `source`.

```mdx
import { ExecutablePackageExample } from "@vireo-storybook/documentation";
import { runResourceExample } from "../examples/resource.example";
import resourceSource from "../examples/resource.example.ts?raw";

<ExecutablePackageExample run={runResourceExample} source={resourceSource} />
```

The renderer executes `runResourceExample`, displays its resolved value, and
shows `resourceSource`. There is no separately maintained code string.

## Example rules

- Import the package through its published package name, never a private source
  path.
- Use deterministic local data. Do not depend on network requests, current
  time, randomness, browser storage, or application state.
- Return serializable output whenever possible. Errors may be demonstrated by
  returning their stable public message.
- Keep each example independently copy-pastable and focused on one consumer
  decision.
- Do not use Storybook controls. Multiple meaningful scenarios are separate
  examples or pages.
- Do not place display-only React wrappers in the non-React package. Extend the
  UI-owned Storybook renderer when a new result presentation is genuinely
  reusable.

## Minimum package coverage

Before a migrated non-React package is considered documented, it must have:

1. an overview stating ownership and non-ownership;
2. an executable primary workflow;
3. documentation for important validation or failure semantics;
4. links to any UI-owned presentation or React adapter;
5. navigation and source-contract tests;
6. a successful production Storybook build.

Additional pages are selected during that package's audit. The History pilot
establishes the initial layout and is reviewed before this standard is rolled
out package by package.
