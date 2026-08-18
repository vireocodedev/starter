import type { VireoDataAttributeValue } from "@/utils/muiutils";
import type { Close } from "@mui/icons-material";
import type { BoxProps, IconButton, Typography } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoOverlayHeaderClasses, type VireoOverlayHeaderClassKey } from "./VireoOverlayHeader.classes";
import type { VIREO_OVERLAY_HEADER_NAME, VireoOverlayHeaderSlotName } from "./VireoOverlayHeader.identity";

export type VireoOverlayHeaderOwnerState = {
  sticky: boolean;
  closable: boolean;
  closeDisabled: boolean;
  hasLeadingAction: boolean;
  hasActions: boolean;
};

export interface VireoOverlayHeaderRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoOverlayHeaderLeadingActionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoOverlayHeaderTitleSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoOverlayHeaderActionsSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoOverlayHeaderCloseButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoOverlayHeaderCloseIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoOverlayHeader}. */
export type VireoOverlayHeaderSlots = {
  [TSlotName in VireoOverlayHeaderSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoOverlayHeader}. */
export type VireoOverlayHeaderSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoOverlayHeaderSlots,
  {
    /** @default 'header' */
    root: SlotProps<"header", VireoOverlayHeaderRootSlotPropsOverrides, VireoOverlayHeaderOwnerState>;
    /** @default 'div' */
    leadingAction: SlotProps<"div", VireoOverlayHeaderLeadingActionSlotPropsOverrides, VireoOverlayHeaderOwnerState>;
    /** @default Typography */
    title: SlotProps<typeof Typography, VireoOverlayHeaderTitleSlotPropsOverrides, VireoOverlayHeaderOwnerState>;
    /** @default 'div' */
    actions: SlotProps<"div", VireoOverlayHeaderActionsSlotPropsOverrides, VireoOverlayHeaderOwnerState>;
    /** @default IconButton */
    closeButton: SlotProps<
      typeof IconButton,
      VireoOverlayHeaderCloseButtonSlotPropsOverrides,
      VireoOverlayHeaderOwnerState
    >;
    /** @default Close */
    closeIcon: SlotProps<typeof Close, VireoOverlayHeaderCloseIconSlotPropsOverrides, VireoOverlayHeaderOwnerState>;
  }
>;

/** Props shared by closable and non-closable overlay headers. */
export type VireoOverlayHeaderOwnProps = VireoOverlayHeaderSlotsAndSlotProps & {
  /** Visible overlay title. String values are rendered as text, never parsed as HTML. */
  title: React.ReactNode;
  /** ID applied to the title and referenced by the containing overlay surface. */
  titleId?: string;
  /** Optional leading navigation or action control. */
  leadingAction?: React.ReactNode;
  /** Optional status or action content rendered after the title. */
  actions?: React.ReactNode;
  /** Keeps the header above scrolling overlay content. @default true */
  sticky?: boolean;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoOverlayHeaderClasses>;
};

/** Props VireoOverlayHeader inherits from its default root after excluding component-owned props. */
export type VireoOverlayHeaderInheritedProps = Omit<BoxProps<"header">, "children" | "component" | "onClose" | "title">;

/** A close button is only valid when both its callback and accessible label are provided. */
export type VireoOverlayHeaderCloseProps =
  | {
      onClose: React.MouseEventHandler<HTMLButtonElement>;
      closeLabel: string;
      closeDisabled?: boolean;
    }
  | {
      onClose?: undefined;
      closeLabel?: never;
      closeDisabled?: never;
    };

/** Props accepted by {@link VireoOverlayHeader}. */
export type VireoOverlayHeaderProps = VireoOverlayHeaderOwnProps &
  VireoOverlayHeaderCloseProps &
  VireoOverlayHeaderInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_OVERLAY_HEADER_NAME]: VireoOverlayHeaderProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_OVERLAY_HEADER_NAME]: VireoOverlayHeaderClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_OVERLAY_HEADER_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_OVERLAY_HEADER_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_OVERLAY_HEADER_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_OVERLAY_HEADER_NAME];
    };
  }
}
