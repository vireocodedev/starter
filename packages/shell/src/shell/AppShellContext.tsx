import { type AppConfig } from "@/config/app.config.types";
import { type AppShellRuntime } from "@/shell/app.shell-runtime.types";
import React from "react";

export type AppShellContextValue = {
  config: AppConfig;
  runtime: AppShellRuntime;
};

const AppShellContext = React.createContext<AppShellContextValue | undefined>(undefined);

export type AppShellProviderProps = AppShellContextValue & {
  children: React.ReactNode;
};

export { AppShellContext };

export function AppShellProvider({ children, config, runtime }: AppShellProviderProps) {
  return <AppShellContext.Provider value={{ config, runtime }}>{children}</AppShellContext.Provider>;
}
