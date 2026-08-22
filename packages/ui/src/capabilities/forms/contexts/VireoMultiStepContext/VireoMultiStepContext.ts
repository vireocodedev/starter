import type { VireoFormMultiStepLocaleText } from "@/capabilities/forms/types/vireoMultiStep.types";
import type { VireoMultiStepStore } from "@/capabilities/forms/state/vireoMultiStepStore/vireoMultiStepStore";
import React from "react";

export type VireoMultiStepContextValue = {
  controller: VireoMultiStepStore;
  keepMounted: boolean;
  localeText: VireoFormMultiStepLocaleText;
};

export const VireoMultiStepContext = React.createContext<VireoMultiStepContextValue | undefined>(undefined);

export function useOptionalVireoMultiStepContext(): VireoMultiStepContextValue | undefined {
  return React.useContext(VireoMultiStepContext);
}

export function useVireoMultiStepContext(): VireoMultiStepContextValue {
  const context = React.useContext(VireoMultiStepContext);
  if (!context) throw new Error("Vireo multi-step components must be rendered inside form.MultiStep.");
  return context;
}
