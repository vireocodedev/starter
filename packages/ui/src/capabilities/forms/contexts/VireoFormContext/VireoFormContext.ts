import React from "react";
import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";

export type VireoFormContextValue = {
  errorDisplay: VireoFormErrorDisplay;
  formatError?: VireoFormErrorFormatter;
  submissionAttempts: number;
};

export const VireoFormContext = React.createContext<VireoFormContextValue | undefined>(undefined);

export function useVireoFormContext(): VireoFormContextValue {
  const context = React.useContext(VireoFormContext);

  if (!context) {
    throw new Error("Vireo form field components must be rendered inside form.Form.");
  }

  return context;
}
