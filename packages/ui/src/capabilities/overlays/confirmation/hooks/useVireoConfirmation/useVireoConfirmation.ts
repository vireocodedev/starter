import { VireoConfirmationContext } from "@/capabilities/overlays/confirmation/contexts/VireoConfirmationContext/VireoConfirmationContext";
import React from "react";

/** Opens the nearest shared confirmation dialog and resolves the user's decision. */
export function useVireoConfirmation() {
  const confirm = React.useContext(VireoConfirmationContext);
  if (!confirm) throw new Error("useVireoConfirmation must be used within VireoConfirmationProvider");
  return confirm;
}
