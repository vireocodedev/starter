import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { VireoOverlayHeader } from "@/capabilities/overlays/components/overlays/VireoOverlayHeader/VireoOverlayHeader";
import type { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type {
  VireoConfirmationDialogClasses,
  VireoConfirmationDialogClassKey,
} from "./VireoConfirmationDialog.classes";
import type {
  VIREO_CONFIRMATION_DIALOG_NAME,
  VireoConfirmationDialogSlotName,
} from "./VireoConfirmationDialog.identity";

export type VireoConfirmationDialogOwnerState = {
  open: boolean;
  loading: boolean;
  confirmColor: ButtonProps["color"];
};

export interface VireoConfirmationDialogRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoConfirmationDialogHeaderSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoConfirmationDialogContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoConfirmationDialogActionsSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoConfirmationDialogCancelButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoConfirmationDialogConfirmButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoConfirmationDialog}. */
export type VireoConfirmationDialogSlots = { [TSlotName in VireoConfirmationDialogSlotName]: React.ElementType };

/** Slot props exposed by {@link VireoConfirmationDialog}. */
export type VireoConfirmationDialogSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoConfirmationDialogSlots,
  {
    root: SlotProps<typeof Dialog, VireoConfirmationDialogRootSlotPropsOverrides, VireoConfirmationDialogOwnerState>;
    header: SlotProps<
      typeof VireoOverlayHeader,
      VireoConfirmationDialogHeaderSlotPropsOverrides,
      VireoConfirmationDialogOwnerState
    >;
    content: SlotProps<
      typeof DialogContent,
      VireoConfirmationDialogContentSlotPropsOverrides,
      VireoConfirmationDialogOwnerState
    >;
    actions: SlotProps<
      typeof DialogActions,
      VireoConfirmationDialogActionsSlotPropsOverrides,
      VireoConfirmationDialogOwnerState
    >;
    cancelButton: SlotProps<
      typeof Button,
      VireoConfirmationDialogCancelButtonSlotPropsOverrides,
      VireoConfirmationDialogOwnerState
    >;
    confirmButton: SlotProps<
      typeof Button,
      VireoConfirmationDialogConfirmButtonSlotPropsOverrides,
      VireoConfirmationDialogOwnerState
    >;
  }
>;

/** Props owned by {@link VireoConfirmationDialog}. */
export type VireoConfirmationDialogOwnProps = VireoConfirmationDialogSlotsAndSlotProps & {
  open: boolean;
  title: React.ReactNode;
  message: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  closeLabel?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmColor?: ButtonProps["color"];
  loading?: boolean;
  classes?: Partial<VireoConfirmationDialogClasses>;
};

/** Props VireoConfirmationDialog inherits from MUI Dialog after excluding component-owned props. */
export type VireoConfirmationDialogInheritedProps = Omit<
  DialogProps,
  "children" | "open" | "onClose" | "slots" | "slotProps" | "title"
>;
export type VireoConfirmationDialogProps = VireoConfirmationDialogOwnProps & VireoConfirmationDialogInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_CONFIRMATION_DIALOG_NAME]?: VireoThemeComponent<
      VireoConfirmationDialogProps,
      VireoConfirmationDialogClassKey,
      VireoConfirmationDialogOwnerState,
      Theme
    >;
  }
}
