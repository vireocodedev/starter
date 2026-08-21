import { VireoPageLayoutContext } from "@/capabilities/page-layout/contexts/VireoPageLayoutContext/VireoPageLayoutContext";
import type { VireoPageLayout } from "@/capabilities/page-layout/types/pageLayout.types";
import React from "react";

export type VireoPageLayoutProviderProps = { value: VireoPageLayout; children: React.ReactNode };

/** Supplies an explicitly controlled page-layout mode to a subtree. */
export function VireoPageLayoutProvider({ value, children }: VireoPageLayoutProviderProps) {
  return <VireoPageLayoutContext.Provider value={value}>{children}</VireoPageLayoutContext.Provider>;
}
