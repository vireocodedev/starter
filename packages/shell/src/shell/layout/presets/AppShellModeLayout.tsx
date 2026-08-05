import { type AppConfig, type AppShellMode } from "@/config/app.config.types";
import { type AppShellRuntime } from "@/shell/app.shell-runtime.types";
import { useAppShellMode } from "@/shell/hooks/useAppShellMode";
import { AppBareShellLayout } from "@/shell/layout/presets/AppBareShellLayout";
import { AppDashboardShellLayout } from "@/shell/layout/presets/AppDashboardShellLayout";
import { AppPublicShellLayout } from "@/shell/layout/presets/AppPublicShellLayout";
import type React from "react";

const LAYOUT_BY_MODE: Record<AppShellMode, React.ComponentType<{ config: AppConfig; runtime: AppShellRuntime }>> = {
  bare: AppBareShellLayout,
  dashboard: AppDashboardShellLayout,
  public: AppPublicShellLayout,
};

export type AppShellModeLayoutProps = {
  config: AppConfig;
  runtime: AppShellRuntime;
};

/**
 * Renders the layout preset that matches the resolved shell mode.
 *
 * Use this in place of a hardcoded preset when the mode should follow the
 * config, or vary by route.
 */
export function AppShellModeLayout({ config, runtime }: AppShellModeLayoutProps) {
  const Layout = LAYOUT_BY_MODE[useAppShellMode(config)];

  return <Layout config={config} runtime={runtime} />;
}
