import React from "react";

export type VireoApplicationNavigationMode = "compact" | "expanded";

export type VireoApplicationNavigationContextValue = {
  mode: VireoApplicationNavigationMode;
};

export const VireoApplicationNavigationContext = React.createContext<VireoApplicationNavigationContextValue>({
  mode: "expanded",
});
