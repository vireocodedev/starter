import type { VireoIconName } from "@/core/providers/VireoIconRegistryProvider/VireoIconRegistryProvider";
import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import { Box, Button, type ButtonProps, Typography } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoLabeledIconButtonClasses,
  type VireoLabeledIconButtonClassKey,
} from "./VireoLabeledIconButton.classes";
import type { VIREO_LABELED_ICON_BUTTON_NAME, VireoLabeledIconButtonSlotName } from "./VireoLabeledIconButton.identity";

export type VireoLabeledIconButtonOwnerState = {
  disabled: boolean;
  selected: boolean;
  showStatusDot: boolean;
  hasIcon: boolean;
};

export interface VireoLabeledIconButtonRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoLabeledIconButtonVisualSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoLabeledIconButtonStatusDotSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoLabeledIconButtonLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export type VireoLabeledIconButtonSlots = { [TSlotName in VireoLabeledIconButtonSlotName]: React.ElementType };
export type VireoLabeledIconButtonSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoLabeledIconButtonSlots,
  {
    /** @default Button */ root: SlotProps<
      typeof Button,
      VireoLabeledIconButtonRootSlotPropsOverrides,
      VireoLabeledIconButtonOwnerState
    >;
    /** @default 'span' */ visual: SlotProps<
      typeof Box,
      VireoLabeledIconButtonVisualSlotPropsOverrides,
      VireoLabeledIconButtonOwnerState
    >;
    /** @default 'span' */ statusDot: SlotProps<
      typeof Box,
      VireoLabeledIconButtonStatusDotSlotPropsOverrides,
      VireoLabeledIconButtonOwnerState
    >;
    /** @default Typography */ label: SlotProps<
      typeof Typography,
      VireoLabeledIconButtonLabelSlotPropsOverrides,
      VireoLabeledIconButtonOwnerState
    >;
  }
>;

export type VireoLabeledIconButtonOwnProps = VireoLabeledIconButtonSlotsAndSlotProps & {
  label: React.ReactNode;
  icon?: VireoIconName | React.ReactElement;
  selected?: boolean;
  showStatusDot?: boolean;
  classes?: Partial<VireoLabeledIconButtonClasses>;
};

/** Props VireoLabeledIconButton inherits from its default root after excluding component-owned props. */
export type VireoLabeledIconButtonInheritedProps = Omit<ButtonProps, "children" | "component" | "selected">;
/** Props accepted by {@link VireoLabeledIconButton}. */
export type VireoLabeledIconButtonProps = VireoLabeledIconButtonOwnProps & VireoLabeledIconButtonInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_LABELED_ICON_BUTTON_NAME]: VireoLabeledIconButtonProps;
  }
  interface ComponentNameToClassKey {
    [VIREO_LABELED_ICON_BUTTON_NAME]: VireoLabeledIconButtonClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_LABELED_ICON_BUTTON_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_LABELED_ICON_BUTTON_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_LABELED_ICON_BUTTON_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_LABELED_ICON_BUTTON_NAME];
    };
  }
}
