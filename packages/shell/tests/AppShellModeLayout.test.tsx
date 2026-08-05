import { type AppConfig } from "@/config/app.config.types";
import { useAppShellMode } from "@/shell/hooks/useAppShellMode";
import { AppShellModeLayout } from "@/shell/layout/presets/AppShellModeLayout";
import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

let matches: { handle?: unknown }[] = [];

vi.mock("react-router", () => ({
  useMatches: () => matches,
}));

vi.mock("@/shell/layout/presets/AppBareShellLayout", () => ({
  AppBareShellLayout: () => <div>bare layout</div>,
}));

vi.mock("@/shell/layout/presets/AppDashboardShellLayout", () => ({
  AppDashboardShellLayout: () => <div>dashboard layout</div>,
}));

vi.mock("@/shell/layout/presets/AppPublicShellLayout", () => ({
  AppPublicShellLayout: () => <div>public layout</div>,
}));

/**
 * `shell.mode` used to be a single app-wide value that nothing actually read.
 * These pin the two halves of the fix: the config value now selects a preset,
 * and a route may override it.
 */

const config = (mode: AppConfig["shell"]["mode"]) => ({ shell: { mode } }) as AppConfig;

function renderMode(mode: AppConfig["shell"]["mode"]) {
  return renderHook(() => useAppShellMode(config(mode))).result.current;
}

describe("useAppShellMode", () => {
  it("falls back to the app-wide mode when no route overrides it", () => {
    matches = [{ handle: undefined }, { handle: { permission: "any" } }];

    expect(renderMode("dashboard")).toBe("dashboard");
  });

  it("uses a route override in place of the app-wide mode", () => {
    matches = [{ handle: undefined }, { handle: { shellMode: "bare" } }];

    expect(renderMode("dashboard")).toBe("bare");
  });

  it("lets the deepest override win", () => {
    matches = [{ handle: { shellMode: "public" } }, { handle: { shellMode: "bare" } }];

    expect(renderMode("dashboard")).toBe("bare");
  });

  it("keeps an ancestor override when the leaf declares none", () => {
    matches = [{ handle: { shellMode: "bare" } }, { handle: {} }];

    expect(renderMode("dashboard")).toBe("bare");
  });
});

describe("AppShellModeLayout", () => {
  it("renders the preset for the resolved mode", () => {
    matches = [];

    render(<AppShellModeLayout config={config("public")} runtime={{} as never} />);

    expect(screen.getByText("public layout")).toBeInTheDocument();
  });

  it("renders the bare preset when a route asks for it", () => {
    matches = [{ handle: { shellMode: "bare" } }];

    render(<AppShellModeLayout config={config("dashboard")} runtime={{} as never} />);

    expect(screen.getByText("bare layout")).toBeInTheDocument();
    expect(screen.queryByText("dashboard layout")).not.toBeInTheDocument();
  });
});
