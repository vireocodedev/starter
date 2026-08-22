import { VireoIconRegistryContext } from "@/core/providers/VireoIconRegistryProvider/VireoIconRegistryProvider";
import React from "react";

/** Returns the icon components registered by VireoIconRegistryProvider. */
export function useVireoIcons() {
  const context = React.useContext(VireoIconRegistryContext);
  if (!context) throw new Error("useVireoIcons must be used within VireoIconRegistryProvider");
  return context;
}
