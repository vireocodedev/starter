import React from "react";

export type AppPageContentMode = "compact" | "regular" | "wide";

export type AppPageContentLayout = {
  mode: AppPageContentMode;
  isCompact: boolean;
  isRegular: boolean;
  isWide: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AppPageContentLayoutContext = React.createContext<AppPageContentLayout | null>(null);

export type AppPageContentLayoutProviderProps = {
  value: AppPageContentLayout;
  children: React.ReactNode;
};

export function AppPageContentLayoutProvider({ value, children }: AppPageContentLayoutProviderProps) {
  return <AppPageContentLayoutContext.Provider value={value}>{children}</AppPageContentLayoutContext.Provider>;
}
