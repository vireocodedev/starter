import { createShellSitemap, defineShellPages, defineShellSections } from "@vireocodedev/shell";

export function runSitemapExample() {
  const pages = defineShellPages({
    customer: { routePath: ":customerId", label: "Customer" },
    customerTab: { routePath: ":tab?", label: "Customer tab" },
  });
  const sections = defineShellSections({ customers: { routePath: "customers", label: "Customers" } });
  const sitemap = createShellSitemap([
    {
      node: sections.customers,
      redirectTo: pages.customer,
      children: [{ node: pages.customer, children: [pages.customerTab] }],
    },
  ] as const);

  return {
    customer: sitemap.getPath(pages.customer, { customerId: "northstar" }),
    historyTab: sitemap.getPath(pages.customerTab, { customerId: "northstar", tab: "history" }),
    customerPattern: sitemap.getPathPattern(pages.customer),
    redirect: sitemap.getRoute("customers")?.redirectToPattern,
  };
}
