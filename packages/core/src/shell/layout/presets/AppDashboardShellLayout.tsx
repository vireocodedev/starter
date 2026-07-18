import { type AppConfig } from "@/config/app.config.types";
import { type AppShellRuntime } from "@/shell/app.shell-runtime.types";
import { AppShellLayout } from "@/shell/AppShellLayout";

export type AppDashboardShellLayoutProps = {
  config: AppConfig;
  runtime: AppShellRuntime;
};

export function AppDashboardShellLayout({ config, runtime }: AppDashboardShellLayoutProps) {
  return <AppShellLayout config={config} runtime={runtime} />;
}
