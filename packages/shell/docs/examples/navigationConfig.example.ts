import { createShellSitemap, defineShellConfig, defineShellPages, shellNavigation } from "@vireocodedev/shell";

export function runNavigationConfigExample() {
  const pages = defineShellPages({
    dashboard: { routePath: "", label: "Dashboard", icon: "home" },
    audit: { routePath: "audit", label: "Audit", icon: "history", permission: "audit:view" },
  });
  const sitemap = createShellSitemap([pages.dashboard, pages.audit] as const);
  const entries = [
    shellNavigation.item(pages.dashboard),
    shellNavigation.heading("operations", "Operations"),
    shellNavigation.item(pages.audit),
    shellNavigation.divider(),
    shellNavigation.action("support", "Contact support", { icon: "help" }),
  ];
  const config = defineShellConfig(
    {
      mode: "dashboard",
      sitemap,
      entryPage: pages.dashboard,
      navigation: { authenticated: entries },
    },
    { permissions: ["audit:view"] },
  );

  return config.navigation?.authenticated?.map(entry => entry.type);
}
