import { RgoConfirmContext } from "@/providers/RgoConfirmProvider/RgoConfirmProvider";
import React from "react";

export function useRgoConfirm() {
  const confirmAction = React.useContext(RgoConfirmContext);
  if (!confirmAction) throw new Error("useRgoConfirm must be used within a ConfirmProvider");
  return confirmAction;
}
