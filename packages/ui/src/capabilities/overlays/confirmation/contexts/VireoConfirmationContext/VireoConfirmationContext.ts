import type { ButtonProps, DialogProps } from "@mui/material";
import React from "react";

export type VireoConfirmationOptions = {
  title: React.ReactNode;
  message: React.ReactNode;
  closeLabel?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmColor?: ButtonProps["color"];
  maxWidth?: DialogProps["maxWidth"];
};

export type VireoConfirm = (options: VireoConfirmationOptions) => Promise<boolean>;

/** Internal context consumed through useVireoConfirmation. */
export const VireoConfirmationContext = React.createContext<VireoConfirm | null>(null);
