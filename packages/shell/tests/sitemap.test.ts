import { createShellSitemap, defineShellPages, defineShellSections, generateShellPath } from "@vireocodedev/shell";
import { describe, expect, it } from "vitest";

describe("Shell sitemap", () => {
  const pages = defineShellPages({
    dashboard: { routePath: "", label: "Dashboard", icon: "home" },
    customer: { routePath: ":customerId", label: "Customer" },
    settings: { routePath: "settings/:tab?", label: "Settings" },
  });
  const sections = defineShellSections({ customers: { routePath: "customers", label: "Customers" } });

  it("builds a framework-neutral route registry and strongly typed paths", () => {
    const sitemap = createShellSitemap([
      pages.dashboard,
      {
        node: sections.customers,
        redirectTo: pages.customer,
        children: [pages.customer],
      },
      pages.settings,
    ] as const);

    expect(sitemap.routes.map(route => [route.key, route.pathPattern])).toEqual([
      ["dashboard", "/"],
      ["customers", "/customers"],
      ["customer", "/customers/:customerId"],
      ["settings", "/settings/:tab?"],
    ]);
    expect(sitemap.getRoute("customers")?.redirectToPattern).toBe("/customers/:customerId");
    expect(sitemap.getPath(pages.customer, { customerId: 42 })).toBe("/customers/42");
    expect(sitemap.getPath(pages.settings, {})).toBe("/settings");
    expect(sitemap.getPath(pages.settings, { tab: "team access" })).toBe("/settings/team%20access");
  });

  it("rejects duplicate route keys, duplicate patterns, and missing redirects", () => {
    expect(() => createShellSitemap([pages.dashboard, pages.dashboard])).toThrow('Route key "dashboard"');

    const duplicate = defineShellPages({ duplicate: { routePath: "", label: "Duplicate" } });
    expect(() => createShellSitemap([pages.dashboard, duplicate.duplicate])).toThrow('Route pattern "/"');

    expect(() => createShellSitemap([{ node: sections.customers, redirectTo: pages.customer }])).toThrow(
      'Redirect target "customer"',
    );
  });

  it("generates optional and catch-all route parameters without a router dependency", () => {
    expect(generateShellPath("/reports/:year?", {})).toBe("/reports");
    expect(generateShellPath("/files/:path*", { path: "contracts/2026 final.pdf" })).toBe(
      "/files/contracts/2026%20final.pdf",
    );
    expect(() => generateShellPath("/customers/:customerId")).toThrow('Missing required route parameter "customerId"');
  });
});
