import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { ButtonProps, DialogProps } from "@mui/material";
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

interface DataAttributes {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoConfirmationDialogRootSlotPropsOverrides extends DataAttributes {}
export interface VireoConfirmationDialogHeaderSlotPropsOverrides extends DataAttributes {}
export interface VireoConfirmationDialogContentSlotPropsOverrides extends DataAttributes {}
export interface VireoConfirmationDialogActionsSlotPropsOverrides extends DataAttributes {}
export interface VireoConfirmationDialogCancelButtonSlotPropsOverrides extends DataAttributes {}
export interface VireoConfirmationDialogConfirmButtonSlotPropsOverrides extends DataAttributes {}

/** Replaceable semantic regions exposed by {@link VireoConfirmationDialog}. */
export type VireoConfirmationDialogSlots = { [TSlotName in VireoConfirmationDialogSlotName]: React.ElementType };

/** Slot props exposed by {@link VireoConfirmationDialog}. */
export type VireoConfirmationDialogSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoConfirmationDialogSlots,
  {
    root: SlotProps<
      typeof import("@mui/material").Dialog,
      VireoConfirmationDialogRootSlotPropsOverrides,
      VireoConfirmationDialogOwnerState
    >;
    header: SlotProps<
      typeof import("@/capabilities/overlays/components/overlays/VireoOverlayHeader/VireoOverlayHeader").VireoOverlayHeader,
      VireoConfirmationDialogHeaderSlotPropsOverrides,
      VireoConfirmationDialogOwnerState
    >;
    content: SlotProps<
      typeof import("@mui/material").DialogContent,
      VireoConfirmationDialogContentSlotPropsOverrides,
      VireoConfirmationDialogOwnerState
    >;
    actions: SlotProps<
      typeof import("@mui/material").DialogActions,
      VireoConfirmationDialogActionsSlotPropsOverrides,
      VireoConfirmationDialogOwnerState
    >;
    cancelButton: SlotProps<
      typeof import("@mui/material").Button,
      VireoConfirmationDialogCancelButtonSlotPropsOverrides,
      VireoConfirmationDialogOwnerState
    >;
    confirmButton: SlotProps<
      typeof import("@mui/material").Button,
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
