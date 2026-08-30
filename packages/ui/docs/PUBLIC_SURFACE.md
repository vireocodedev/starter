# Starter UI public surface

Every symbol reachable through an `@vireocodedev/ui` package export is public for
SemVer purposes. This document classifies those exports by entry point. Every symbol
behind an entry point inherits its row's stability; the machine policy checks that
the entry-point list, symbol count, growth disposition, and classification match the
published package manifest and `api-surface.json` snapshot.

## Stability meanings

- **supported** — intended for ordinary application use on the current `0.x` line;
  additions are minor changes and removals or incompatible behavior are major.
- **advanced** — supported when the named optional integration is deliberately
  adopted, but the application owns the peer library and integration policy.
- **deprecated** — still present for compatibility but excluded from new
  application code; migration guidance applies before removal in a future major.
- **pending-decision** — public by reachability but not yet endorsed. No current
  entry point remains in this state.

`internal` code is never an exported classification. Anything intended to be
internal must remain unreachable through `package.json#exports`.

## Classified entry points

| Entry point                               | Stability  | Exported symbols | Growth disposition   |
| ----------------------------------------- | ---------- | ---------------- | -------------------- |
| `.`                                       | supported  | 757              | `freeze-growth`      |
| `./country`                               | supported  | 21               | `retain`             |
| `./event-source`                          | advanced   | 7                | `retain`             |
| `./forms`                                 | supported  | 539              | `freeze-growth`      |
| `./hello-pangea-dnd`                      | advanced   | 56               | `retain`             |
| `./localization`                          | supported  | 5                | `retain`             |
| `./react-i18next`                         | advanced   | 3                | `retain`             |
| `./sonner`                                | advanced   | 19               | `retain`             |
| `./tanstack-query`                        | advanced   | 30               | `retain`             |
| `./theme`                                 | supported  | 10               | `retain`             |
| `./storybook`                             | deprecated | 5                | `extract-next-major` |
| `./storybook/VireoIconContainer`          | deprecated | 2                | `extract-next-major` |
| `./storybook/VireoDockedSidePanel`        | deprecated | 2                | `extract-next-major` |
| `./storybook/VireoResponsiveOverlayFrame` | deprecated | 4                | `extract-next-major` |

The root and forms entry points are intentionally under a growth freeze because
their large existing type surfaces are already compatibility commitments. New
features should reuse existing contracts or justify a focused subpath instead of
silently widening either barrel.

## Consumer guidance

- Start with the root entry point for components, providers, layout, tables, and
  shared hooks.
- Use `./forms` when a consumer needs the form contract without treating the root
  barrel as its primary dependency.
- Use `./localization` around every Vireo temporal field.
- Use `./theme` to create the canonical light or dark Vireo consumer theme without importing the component barrel.
- Adopt the advanced integration subpaths only when the application already owns
  the corresponding peer and its runtime policy.
- Do not add dependencies on `./storybook*`. Keep equivalent frames local until a
  dedicated authoring package exists.

The normative machine classification lives in
[`contracts/public-api-policy.json`](../../../contracts/public-api-policy.json).
Run `corepack npm run api:policy` after any entry-point or classification change.
