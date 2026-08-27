import { createShellSitemap, defineShellConfig, defineShellPages, shellNavigation } from "@vireocodedev/shell";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("Shell config", () => {
  const pages = defineShellPages({
    home: { routePath: "", label: "Home", permission: "home:view" },
    login: { routePath: "login", label: "Log in" },
  });
  const sitemap = createShellSitemap([pages.home, pages.login]);

  it("validates mounted pages, permissions, and navigation identifiers", () => {
    const config = defineShellConfig(
      {
        mode: "dashboard",
        sitemap,
        entryPage: pages.home,
        loginPage: pages.login,
        navigation: {
          authenticated: [shellNavigation.item(pages.home), shellNavigation.action("help", "Help")],
        },
      },
      { permissions: ["home:view"] },
    );

    expect(config.mode).toBe("dashboard");
    expect(Object.isFrozen(config)).toBe(true);
  });

  it("reports all configuration violations as Zod issues", () => {
    const detached = defineShellPages({ detached: { routePath: "detached", label: "Detached" } });

    expect(() =>
      defineShellConfig(
        {
          mode: "dashboard",
          sitemap,
          entryPage: detached.detached,
          navigation: {
            authenticated: [
              shellNavigation.action("duplicate", "First", { permission: "admin:view" }),
              shellNavigation.action("duplicate", "Second"),
            ],
          },
        },
        { permissions: ["home:view"] },
      ),
    ).toThrow(ZodError);
  });
});
