import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/utils/muiutils";
import type { Box, Button, ButtonProps, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoActionPreviewButtonClasses,
  type VireoActionPreviewButtonClassKey,
} from "./VireoActionPreviewButton.classes";
import type {
  VIREO_ACTION_PREVIEW_BUTTON_NAME,
  VireoActionPreviewButtonSlotName,
} from "./VireoActionPreviewButton.identity";

export type VireoActionPreviewButtonAlignment = "center" | "start";

export type VireoActionPreviewButtonOwnerState = {
  align: VireoActionPreviewButtonAlignment;
  disabled: boolean;
};

export interface VireoActionPreviewButtonRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoActionPreviewButtonContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoActionPreviewButtonLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoActionPreviewButtonPreviewSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoActionPreviewButton}. */
export type VireoActionPreviewButtonSlots = {
  [TSlotName in VireoActionPreviewButtonSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoActionPreviewButton}. */
export type VireoActionPreviewButtonSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoActionPreviewButtonSlots,
  {
    /** @default Button */
    root: SlotProps<typeof Button, VireoActionPreviewButtonRootSlotPropsOverrides, VireoActionPreviewButtonOwnerState>;
    /** @default 'span' */
    content: SlotProps<
      typeof Box,
      VireoActionPreviewButtonContentSlotPropsOverrides,
      VireoActionPreviewButtonOwnerState
    >;
    /** @default Typography */
    label: SlotProps<
      typeof Typography,
      VireoActionPreviewButtonLabelSlotPropsOverrides,
      VireoActionPreviewButtonOwnerState
    >;
    /** @default Typography */
    preview: SlotProps<
      typeof Typography,
      VireoActionPreviewButtonPreviewSlotPropsOverrides,
      VireoActionPreviewButtonOwnerState
    >;
  }
>;

/** Props owned by {@link VireoActionPreviewButton}. */
export type VireoActionPreviewButtonOwnProps = VireoActionPreviewButtonSlotsAndSlotProps & {
  /** Horizontal alignment for the action label and its consequence preview. @default 'start' */
  align?: VireoActionPreviewButtonAlignment;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoActionPreviewButtonClasses>;
  /** Primary action label. */
  label: React.ReactNode;
  /** Short statement describing the result or scope of the action before it is committed. */
  preview: React.ReactNode;
};

/** Props VireoActionPreviewButton inherits from its default root after excluding component-owned props. */
export type VireoActionPreviewButtonInheritedProps = Omit<ButtonProps, "children" | "component">;

/** Props accepted by {@link VireoActionPreviewButton}. */
export type VireoActionPreviewButtonProps = VireoActionPreviewButtonOwnProps & VireoActionPreviewButtonInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_ACTION_PREVIEW_BUTTON_NAME]?: VireoThemeComponent<
      VireoActionPreviewButtonProps,
      VireoActionPreviewButtonClassKey,
      VireoActionPreviewButtonOwnerState,
      Theme
    >;
  }
}
