import { type AppConfig, type AppShellNavEntry } from "@/config/app.config.types";
import { validateAppConfig } from "@/config/app.config.validation";
import { definePages } from "@/sitemap/definePages";
import { describe, expect, it, vi } from "vitest";

vi.mock("@vireocodedev/starter-ui", () => ({ RgoIcon: () => null }));

/**
 * `validateAppConfig` is the boot-time gate that turns config mistakes into a
 * single readable error instead of a broken nav or a dead route. It aggregates
 * every issue it finds, so these tests assert on the message contents.
 */

const pages = definePages({
  home: { routePath: "home", label: () => "Home", icon: "check-circle", Component: () => null },
  login: { routePath: "login", label: () => "Login", icon: "check-circle", Component: () => null },
  unauthorized: { routePath: "403", label: () => "Denied", icon: "check-circle", Component: () => null },
  orphan: { routePath: "orphan", label: () => "Orphan", icon: "check-circle", Component: () => null },
});

/** Keyed by `routePath` - the fake resolver treats anything else as unreachable. */
const knownPaths: Record<string, string> = {
  home: "/home",
  login: "/login",
  "403": "/403",
};

function createConfig(
  overrides: {
    shell?: Partial<AppConfig["shell"]>;
    routes?: Partial<AppConfig["routes"]>;
  } = {},
): AppConfig {
  return {
    brand: { name: "Test" } as AppConfig["brand"],
    routes: {
      login: { path: "login" },
      authenticated: [{ path: "home" }],
      getPath: page => {
        const path = knownPaths[page.routePath];
        if (!path) throw new Error(`Page "${page.routePath}" is not part of the route tree.`);
        return path;
      },
      getPathPattern: page => page.routePath,
      loginPage: pages.login,
      authenticatedEntryPage: pages.home,
      unauthorizedPage: pages.unauthorized,
      ...overrides.routes,
    },
    shell: {
      mode: "dashboard",
      navEntries: [],
      loginNavEntries: [],
      mobileBottomNavigation: {
        authenticatedItems: [],
        loginItem: { value: "login", page: pages.login, label: () => "Login", icon: "check-circle" },
        moreItem: { value: "more", label: () => "More", icon: "check-circle" },
      },
      ...overrides.shell,
    },
  };
}

function expectIssues(config: AppConfig, options?: Parameters<typeof validateAppConfig>[1]): string {
  try {
    validateAppConfig(config, options);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }

  throw new Error("Expected validateAppConfig to throw, but it did not.");
}

const navItem = (name: string, permission?: string): AppShellNavEntry => ({
  type: "item",
  label: () => name,
  icon: "check-circle",
  to: `/${name}`,
  permission,
});

describe("validateAppConfig", () => {
  it("accepts a well-formed config", () => {
    expect(() => validateAppConfig(createConfig())).not.toThrow();
  });

  describe("shell mode", () => {
    it("accepts every supported mode", () => {
      for (const mode of ["dashboard", "public", "bare"] as const) {
        expect(() => validateAppConfig(createConfig({ shell: { mode } }))).not.toThrow();
      }
    });

    it("rejects an unsupported mode", () => {
      const message = expectIssues(createConfig({ shell: { mode: "kiosk" as AppConfig["shell"]["mode"] } }));

      expect(message).toContain('shell.mode: Unsupported shell mode "kiosk".');
    });
  });

  describe("permission registry", () => {
    const config = createConfig({ shell: { navEntries: [navItem("admin", "admin:read")] } });

    it("allows any permission when no registry is configured", () => {
      expect(() => validateAppConfig(config)).not.toThrow();
    });

    it("accepts a permission present in an array registry", () => {
      expect(() => validateAppConfig(config, { permissions: ["admin:read"] })).not.toThrow();
    });

    it("accepts a permission present in a Set registry", () => {
      expect(() => validateAppConfig(config, { permissions: new Set(["admin:read"]) })).not.toThrow();
    });

    it("accepts a permission present in a record registry", () => {
      expect(() => validateAppConfig(config, { permissions: { "admin:read": true } })).not.toThrow();
    });

    it("rejects a permission missing from the registry", () => {
      const message = expectIssues(config, { permissions: ["other:read"] });

      expect(message).toContain('shell.navEntries[0].permission: Unknown permission "admin:read".');
    });

    it("checks route handle permissions recursively", () => {
      const message = expectIssues(
        createConfig({
          routes: {
            authenticated: [
              {
                path: "home",
                children: [{ path: "nested", handle: { breadcrumb: () => "Nested", permission: "ghost" } }],
              },
            ],
          },
        }),
        { permissions: [] },
      );

      expect(message).toContain("routes.authenticated[0].children[0].handle.permission");
    });

    it("checks registered nav control permissions", () => {
      const message = expectIssues(
        createConfig({
          shell: {
            navControls: {
              theme: { label: () => "Theme", icon: "check-circle", Component: () => null, permission: "ghost" },
            },
          },
        }),
        { permissions: [] },
      );

      expect(message).toContain("shell.navControls.theme.permission");
    });
  });

  describe("nav entry wiring", () => {
    it("reports a slot with no registered component", () => {
      const message = expectIssues(createConfig({ shell: { navEntries: [{ type: "slot", id: "account" }] } }));

      expect(message).toContain('shell.navEntries[0]: Missing nav slot component for slot id "account".');
    });

    it("reports a control with no registered config", () => {
      const message = expectIssues(createConfig({ shell: { navEntries: [{ type: "control", id: "theme" }] } }));

      expect(message).toContain('shell.navEntries[0]: Missing nav control config for control id "theme".');
    });

    it("reports duplicate entry ids", () => {
      const message = expectIssues(
        createConfig({
          shell: {
            navEntries: [
              { type: "separator", id: "admin", label: () => "Admin" },
              { type: "separator", id: "admin", label: () => "Admin" },
            ],
          },
        }),
      );

      expect(message).toContain('shell.navEntries.id: Duplicate value "admin".');
    });

    it("validates public nav entries when present", () => {
      const message = expectIssues(createConfig({ shell: { publicNavEntries: [{ type: "slot", id: "account" }] } }));

      expect(message).toContain("shell.publicNavEntries[0]");
    });
  });

  describe("page paths", () => {
    it("reports a nav item pointing at a page outside the route tree", () => {
      const message = expectIssues(
        createConfig({
          shell: {
            navEntries: [{ type: "item", label: () => "Orphan", icon: "check-circle", page: pages.orphan }],
          },
        }),
      );

      expect(message).toContain('shell.navEntries[0].page: Page "orphan" is not part of the route tree.');
    });

    it("reports an unresolvable entry page", () => {
      const message = expectIssues(createConfig({ routes: { authenticatedEntryPage: pages.orphan } }));

      expect(message).toContain("routes.authenticatedEntryPage");
    });
  });

  describe("mobile bottom navigation", () => {
    const item = (value: string, permission?: string) => ({
      value,
      page: pages.home,
      label: () => value,
      icon: "check-circle" as const,
      permission,
    });

    it("reports duplicate item values", () => {
      const message = expectIssues(
        createConfig({
          shell: {
            mobileBottomNavigation: {
              authenticatedItems: [item("home"), item("home")],
              loginItem: { value: "login", page: pages.login, label: () => "Login", icon: "check-circle" },
              moreItem: { value: "more", label: () => "More", icon: "check-circle" },
            },
          },
        }),
      );

      expect(message).toContain('shell.mobileBottomNavigation.authenticatedItems.value: Duplicate value "home".');
    });

    it("checks item permissions", () => {
      const message = expectIssues(
        createConfig({
          shell: {
            mobileBottomNavigation: {
              authenticatedItems: [item("home", "ghost")],
              loginItem: { value: "login", page: pages.login, label: () => "Login", icon: "check-circle" },
              moreItem: { value: "more", label: () => "More", icon: "check-circle" },
            },
          },
        }),
        { permissions: [] },
      );

      expect(message).toContain("shell.mobileBottomNavigation.authenticatedItems[0].permission");
    });
  });

  it("aggregates every issue into a single error", () => {
    const message = expectIssues(
      createConfig({
        shell: {
          mode: "kiosk" as AppConfig["shell"]["mode"],
          navEntries: [
            { type: "slot", id: "account" },
            { type: "control", id: "theme" },
          ],
        },
      }),
    );

    expect(message.startsWith("APP_CONFIG validation failed:")).toBe(true);
    expect(message.split("\n")).toHaveLength(4);
  });
});
