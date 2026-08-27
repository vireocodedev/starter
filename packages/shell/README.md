# @vireocodedev/shell

Framework-free contracts for application sitemap construction, navigation metadata, authentication redirects, and browser overlay-history coordination.

## Install

```bash
npm install @vireocodedev/shell zod
```

The package is published publicly on npm; installation requires no registry
authentication. TypeScript declarations are verified from the packed artifact
with TypeScript 6, `moduleResolution: "Bundler"`, and `skipLibCheck: false`.
Relative source maps with embedded source content are published intentionally
for debugging.

## Primary workflow

```ts
import {
  createShellSitemap,
  defineShellConfig,
  defineShellPages,
  defineShellSections,
  shellNavigation,
} from "@vireocodedev/shell";

const pages = defineShellPages({
  dashboard: { routePath: "", label: "Dashboard", icon: "home" },
  customer: { routePath: ":customerId", label: "Customer", permission: "customers:view" },
});

const sections = defineShellSections({ customers: { routePath: "customers", label: "Customers" } });
const sitemap = createShellSitemap([
  pages.dashboard,
  { node: sections.customers, children: [pages.customer] },
] as const);

export const shellConfig = defineShellConfig(
  {
    mode: "dashboard",
    sitemap,
    entryPage: pages.dashboard,
    navigation: { authenticated: [shellNavigation.item(pages.dashboard)] },
  },
  { permissions: ["customers:view"] },
);

sitemap.getPath(pages.customer, { customerId: 42 }); // /customers/42
```

## Ownership boundary

Shell is deliberately independent of React, React Router, MUI, TanStack Query, PWA plugins, and Starter UI. It describes an application shell; it does not render one.

Applications own router adaptation, permission evaluation, responsive layouts, PWA prompts, unsaved-change prompts, and navigation presentation. Reusable React presentation belongs in `@vireocodedev/ui`, not this package.

## Public areas

- Sitemap: immutable page and section definitions, a flattened route registry, typed path resolution, redirects, and duplicate detection.
- Config and navigation: serializable navigation intent plus Zod-backed validation of modes, mounted pages, identifiers, and permission registries.
- Authentication redirects: router-neutral internal return-path creation and open-redirect protection.
- Overlay history: pure stack reconciliation and an instance-scoped observable registry; applications adapt its actions to their router.

Importing the package creates no global store, browser listener, router, cache, or UI.
