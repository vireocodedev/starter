import { createShellSitemap, defineShellConfig, defineShellPages, shellNavigation } from "@vireocodedev/starter-shell";
import { ZodError } from "zod";

function errorMessage(run: () => unknown): string {
  try {
    run();
    return "No error";
  } catch (error) {
    if (error instanceof ZodError) return error.issues.map(issue => issue.message).join(" ");
    return error instanceof Error ? error.message : "Unknown failure";
  }
}

export function runFailureSemanticsExample() {
  const pages = defineShellPages({
    home: { routePath: "", label: "Home" },
    detached: { routePath: "detached", label: "Detached" },
  });
  const sitemap = createShellSitemap([pages.home]);

  return {
    detachedEntry: errorMessage(() => defineShellConfig({ mode: "dashboard", sitemap, entryPage: pages.detached })),
    duplicateNavigationId: errorMessage(() =>
      defineShellConfig({
        mode: "dashboard",
        sitemap,
        entryPage: pages.home,
        navigation: {
          authenticated: [
            shellNavigation.action("support", "Support"),
            shellNavigation.action("support", "Support again"),
          ],
        },
      }),
    ),
  };
}
