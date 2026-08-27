import {
  createShellSitemap,
  defineShellConfig,
  defineShellPages,
  defineShellSections,
  shellNavigation,
} from "@vireocodedev/shell";

export function runPrimaryWorkflowExample() {
  const pages = defineShellPages({
    dashboard: { routePath: "", label: "Dashboard", icon: "home" },
    customer: { routePath: ":customerId", label: "Customer", permission: "customers:view" },
  });
  const sections = defineShellSections({
    customers: { routePath: "customers", label: "Customers", icon: "people" },
  });
  const sitemap = createShellSitemap([
    pages.dashboard,
    { node: sections.customers, children: [pages.customer] },
  ] as const);
  const config = defineShellConfig(
    {
      mode: "dashboard",
      sitemap,
      entryPage: pages.dashboard,
      navigation: { authenticated: [shellNavigation.item(pages.dashboard)] },
    },
    { permissions: ["customers:view"] },
  );

  return {
    mode: config.mode,
    customerPath: sitemap.getPath(pages.customer, { customerId: 42 }),
    routePatterns: sitemap.routes.map(route => route.pathPattern),
  };
}
