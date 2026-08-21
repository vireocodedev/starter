import { type AppShellNavControlConfig, type AppShellNavSlotConfig } from "@/config/app.config.types";
import { type NavEntry } from "@/shell/layout/nav/nav.types";
import { useVisibleNavEntries } from "@/shell/layout/nav/useVisibleNavEntries";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@vireocodedev/starter-ui", () => ({ VireoIcon: () => null }));

/**
 * `useVisibleNavEntries` is the only thing standing between a permission the
 * user does not hold and a nav link to it. Controls are gated twice - by the
 * entry's own permission and by the registered control's permission - so both
 * paths are pinned here.
 */

const item = (name: string, permission?: string, permissionScope?: Record<string, unknown>): NavEntry => ({
  type: "item",
  label: () => name,
  icon: "check-circle",
  to: `/${name}`,
  permission,
  permissionScope,
});

const control = (id: string, permission?: string, permissionScope?: Record<string, unknown>): NavEntry => ({
  type: "control",
  id,
  permission,
  permissionScope,
});
const slot = (id: string, permission?: string, permissionScope?: Record<string, unknown>): NavEntry => ({
  type: "slot",
  id,
  permission,
  permissionScope,
});
const separator = (id: string, hideWhenCollapsed?: boolean): NavEntry => ({
  type: "separator",
  id,
  label: () => id,
  hideWhenCollapsed,
});

const controlConfig = (permission?: string): AppShellNavControlConfig => ({
  label: () => "control",
  icon: "check-circle",
  Component: () => null,
  permission,
});

const slotConfig: AppShellNavSlotConfig = { Component: () => null };

function renderEntries(overrides: Partial<Parameters<typeof useVisibleNavEntries>[0]> & { navEntries: NavEntry[] }) {
  const { result } = renderHook(() =>
    useVisibleNavEntries({
      canAccess: () => true,
      collapsedSections: {},
      isCollapsed: false,
      loginMode: false,
      loginNavEntries: [],
      navControls: undefined,
      navSlots: undefined,
      ...overrides,
    }),
  );

  return result.current;
}

function labels(entries: NavEntry[]): string[] {
  return entries.map(entry => {
    if (entry.type === "item") return entry.to ?? "";
    return "id" in entry ? entry.id : entry.type;
  });
}

describe("useVisibleNavEntries", () => {
  describe("permissions", () => {
    it("hides items the user cannot access", () => {
      const entries = renderEntries({
        navEntries: [item("home"), item("admin", "admin:read")],
        canAccess: permission => permission !== "admin:read",
      });

      expect(labels(entries)).toEqual(["/home"]);
    });

    it("keeps items with no permission requirement", () => {
      // `canAccess` is contractually passed `undefined` for unrestricted
      // entries; consumers implement it as `!permission || can(...)`.
      const entries = renderEntries({
        navEntries: [item("home"), item("admin", "admin:read")],
        canAccess: permission => !permission,
      });

      expect(labels(entries)).toEqual(["/home"]);
    });

    it("hides a control when the entry's own permission is denied", () => {
      const entries = renderEntries({
        navEntries: [control("theme", "settings:read")],
        navControls: { theme: controlConfig() },
        canAccess: permission => permission !== "settings:read",
      });

      expect(entries).toEqual([]);
    });

    it("hides a control when the registered control's permission is denied", () => {
      const entries = renderEntries({
        navEntries: [control("theme")],
        navControls: { theme: controlConfig("settings:write") },
        canAccess: permission => permission !== "settings:write",
      });

      expect(entries).toEqual([]);
    });

    it("hides a slot when its permission is denied", () => {
      const entries = renderEntries({
        navEntries: [slot("account", "account:read")],
        navSlots: { account: slotConfig },
        canAccess: permission => permission !== "account:read",
      });

      expect(entries).toEqual([]);
    });
  });

  describe("registration", () => {
    it("hides controls that have no registered config", () => {
      const entries = renderEntries({ navEntries: [item("home"), control("theme")] });

      expect(labels(entries)).toEqual(["/home"]);
    });

    it("hides slots that have no registered config", () => {
      const entries = renderEntries({ navEntries: [item("home"), slot("account")] });

      expect(labels(entries)).toEqual(["/home"]);
    });

    it("keeps registered and permitted controls and slots", () => {
      const entries = renderEntries({
        navEntries: [control("theme"), slot("account")],
        navControls: { theme: controlConfig() },
        navSlots: { account: slotConfig },
      });

      expect(labels(entries)).toEqual(["theme", "account"]);
    });
  });

  describe("collapsing", () => {
    it("hides separators flagged hideWhenCollapsed while collapsed", () => {
      const entries = renderEntries({
        navEntries: [separator("admin", true), item("users")],
        isCollapsed: true,
      });

      expect(labels(entries)).toEqual(["/users"]);
    });

    it("keeps those separators while expanded", () => {
      const entries = renderEntries({
        navEntries: [separator("admin", true), item("users")],
        isCollapsed: false,
      });

      expect(labels(entries)).toEqual(["admin", "/users"]);
    });

    it("hides the entries inside a collapsed section but keeps its header", () => {
      const entries = renderEntries({
        navEntries: [item("home"), separator("admin"), item("users")],
        collapsedSections: { admin: true },
      });

      expect(labels(entries)).toEqual(["/home", "admin"]);
    });

    it("stops collapsing at the next section", () => {
      const entries = renderEntries({
        navEntries: [separator("admin"), item("users"), separator("reports"), item("sales")],
        collapsedSections: { admin: true },
      });

      expect(labels(entries)).toEqual(["admin", "reports", "/sales"]);
    });
  });

  describe("login mode", () => {
    it("renders the login entries instead of the authenticated ones", () => {
      const entries = renderEntries({
        navEntries: [item("home")],
        loginNavEntries: [item("register")],
        loginMode: true,
      });

      expect(labels(entries)).toEqual(["/register"]);
    });
  });

  it("drops section headers left empty by permission filtering", () => {
    const entries = renderEntries({
      navEntries: [item("home"), separator("admin"), item("users", "admin:read")],
      canAccess: permission => permission !== "admin:read",
    });

    expect(labels(entries)).toEqual(["/home"]);
  });

  describe("permission scopes", () => {
    it("passes an item's scope to the checker", () => {
      const canAccess = vi.fn().mockReturnValue(true);

      renderEntries({
        navEntries: [item("area", "area:read", { companyId: "acme" })],
        canAccess,
      });

      expect(canAccess).toHaveBeenCalledWith("area:read", { companyId: "acme" });
    });

    it("hides an item allowed globally but denied in its scope", () => {
      const entries = renderEntries({
        navEntries: [
          item("mine", "area:read", { companyId: "acme" }),
          item("theirs", "area:read", { companyId: "other" }),
        ],
        canAccess: (_permission, scope) => scope?.companyId === "acme",
      });

      expect(labels(entries)).toEqual(["/mine"]);
    });

    it("gates a control on both its own scope and the registered control's scope", () => {
      const canAccess = vi.fn().mockReturnValue(true);

      renderEntries({
        navEntries: [control("theme", "theme:read", { siteId: 1 })],
        navControls: { theme: { ...controlConfig("theme:write"), permissionScope: { siteId: 2 } } },
        canAccess,
      });

      expect(canAccess).toHaveBeenCalledWith("theme:read", { siteId: 1 });
      expect(canAccess).toHaveBeenCalledWith("theme:write", { siteId: 2 });
    });

    it("passes a slot's scope to the checker", () => {
      const canAccess = vi.fn().mockReturnValue(true);

      renderEntries({
        navEntries: [slot("account", "account:read", { shiftId: 9 })],
        navSlots: { account: slotConfig },
        canAccess,
      });

      expect(canAccess).toHaveBeenCalledWith("account:read", { shiftId: 9 });
    });

    it("leaves the scope undefined when none is declared", () => {
      const canAccess = vi.fn().mockReturnValue(true);

      renderEntries({ navEntries: [item("home", "home:read")], canAccess });

      expect(canAccess).toHaveBeenCalledWith("home:read", undefined);
    });
  });
});
