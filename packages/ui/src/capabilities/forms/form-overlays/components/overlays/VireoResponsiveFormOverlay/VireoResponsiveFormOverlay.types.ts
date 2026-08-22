import type {
  VireoOverlayHeader,
  VireoResponsiveOverlayFrame,
  VireoResponsiveOverlayFrameProps,
} from "@/capabilities/overlays/public";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { DialogActions, DialogContent } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoResponsiveFormOverlayClasses,
  type VireoResponsiveFormOverlayClassKey,
} from "./VireoResponsiveFormOverlay.classes";
import type {
  VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
  VireoResponsiveFormOverlaySlotName,
} from "./VireoResponsiveFormOverlay.identity";

export type VireoResponsiveFormOverlayOwnerState = {
  open: boolean;
  closeDisabled: boolean;
  hasActions: boolean;
};

export interface VireoResponsiveFormOverlayRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoResponsiveFormOverlayHeaderSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoResponsiveFormOverlayContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoResponsiveFormOverlayActionsSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoResponsiveFormOverlay}. */
export type VireoResponsiveFormOverlaySlots = {
  [TSlotName in VireoResponsiveFormOverlaySlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoResponsiveFormOverlay}. */
export type VireoResponsiveFormOverlaySlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoResponsiveFormOverlaySlots,
  {
    /** @default VireoResponsiveOverlayFrame */
    root: SlotProps<
      typeof VireoResponsiveOverlayFrame,
      VireoResponsiveFormOverlayRootSlotPropsOverrides,
      VireoResponsiveFormOverlayOwnerState
    >;
    /** @default VireoOverlayHeader */
    header: SlotProps<
      typeof VireoOverlayHeader,
      VireoResponsiveFormOverlayHeaderSlotPropsOverrides,
      VireoResponsiveFormOverlayOwnerState
    >;
    /** @default DialogContent */
    content: SlotProps<
      typeof DialogContent,
      VireoResponsiveFormOverlayContentSlotPropsOverrides,
      VireoResponsiveFormOverlayOwnerState
    >;
    /** @default DialogActions */
    actions: SlotProps<
      typeof DialogActions,
      VireoResponsiveFormOverlayActionsSlotPropsOverrides,
      VireoResponsiveFormOverlayOwnerState
    >;
  }
>;

/** Props owned by {@link VireoResponsiveFormOverlay}. */
export type VireoResponsiveFormOverlayOwnProps = VireoResponsiveFormOverlaySlotsAndSlotProps & {
  /** Visible overlay heading. */
  title: React.ReactNode;
  /** Accessible label for the close action. */
  closeLabel: string;
  /** Prevents dismissal while a form operation is in progress. @default false */
  closeDisabled?: boolean;
  /** Form content rendered inside the responsive surface. */
  children: React.ReactNode;
  /** Optional action row rendered after the content. */
  actions?: React.ReactNode;
  /** Whether close requests participate in the nearest unsaved-changes scope. @default true */
  guardUnsavedChanges?: boolean;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoResponsiveFormOverlayClasses>;
};

/** Props VireoResponsiveFormOverlay inherits from its default root after excluding component-owned props. */
export type VireoResponsiveFormOverlayInheritedProps = Omit<
  VireoResponsiveOverlayFrameProps,
  "children" | "classes" | "onClose" | "open" | "slotProps" | "slots" | "title"
> & {
  open: boolean;
  onClose: () => void;
};

/** Props accepted by {@link VireoResponsiveFormOverlay}. */
export type VireoResponsiveFormOverlayProps = VireoResponsiveFormOverlayOwnProps &
  VireoResponsiveFormOverlayInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_RESPONSIVE_FORM_OVERLAY_NAME]?: VireoThemeComponent<
      VireoResponsiveFormOverlayProps,
      VireoResponsiveFormOverlayClassKey,
      VireoResponsiveFormOverlayOwnerState,
      Theme
    >;
  }
}
