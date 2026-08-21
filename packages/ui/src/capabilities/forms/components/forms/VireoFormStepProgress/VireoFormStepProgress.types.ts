import type { VireoMultiStepStepState } from "@/capabilities/forms/types/vireoMultiStep.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Box, BoxProps, ButtonBase, LinearProgress, Menu, MenuItem, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoFormStepProgressClasses, VireoFormStepProgressClassKey } from "./VireoFormStepProgress.classes";
import type { VIREO_FORM_STEP_PROGRESS_NAME, VireoFormStepProgressSlotName } from "./VireoFormStepProgress.identity";

export type VireoFormStepProgressLayout = "responsive" | "horizontal" | "compact";
export type VireoFormStepProgressNavigation = "none" | "visited" | "all";

export type VireoFormStepProgressOwnerState = {
  compactBreakpoint: number;
  layout: VireoFormStepProgressLayout;
  navigation: VireoFormStepProgressNavigation;
  step?: VireoMultiStepStepState<string>;
};

export interface VireoFormStepProgressRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressListSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressStepSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressStepButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressStatusIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressStepLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressConnectorSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressCompactRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressCompactTriggerSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressCompactLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressCompactCountSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressCompactProgressSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressMenuSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormStepProgressMenuItemSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export type VireoFormStepProgressSlots = { [T in VireoFormStepProgressSlotName]: React.ElementType };
export type VireoFormStepProgressSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormStepProgressSlots,
  {
    /** @default 'nav' */
    root: SlotProps<typeof Box, VireoFormStepProgressRootSlotPropsOverrides, VireoFormStepProgressOwnerState>;
    /** @default 'ol' */
    list: SlotProps<typeof Box, VireoFormStepProgressListSlotPropsOverrides, VireoFormStepProgressOwnerState>;
    /** @default 'li' */
    step: SlotProps<typeof Box, VireoFormStepProgressStepSlotPropsOverrides, VireoFormStepProgressOwnerState>;
    /** @default ButtonBase */
    stepButton: SlotProps<
      typeof ButtonBase,
      VireoFormStepProgressStepButtonSlotPropsOverrides,
      VireoFormStepProgressOwnerState
    >;
    /** @default 'span' */
    statusIcon: SlotProps<
      typeof Box,
      VireoFormStepProgressStatusIconSlotPropsOverrides,
      VireoFormStepProgressOwnerState
    >;
    /** @default 'span' */
    stepLabel: SlotProps<
      typeof Typography,
      VireoFormStepProgressStepLabelSlotPropsOverrides,
      VireoFormStepProgressOwnerState
    >;
    /** @default 'span' */
    connector: SlotProps<typeof Box, VireoFormStepProgressConnectorSlotPropsOverrides, VireoFormStepProgressOwnerState>;
    /** @default Box */
    compactRoot: SlotProps<
      typeof Box,
      VireoFormStepProgressCompactRootSlotPropsOverrides,
      VireoFormStepProgressOwnerState
    >;
    /** @default ButtonBase */
    compactTrigger: SlotProps<
      typeof ButtonBase,
      VireoFormStepProgressCompactTriggerSlotPropsOverrides,
      VireoFormStepProgressOwnerState
    >;
    /** @default 'span' */
    compactLabel: SlotProps<
      typeof Typography,
      VireoFormStepProgressCompactLabelSlotPropsOverrides,
      VireoFormStepProgressOwnerState
    >;
    /** @default 'span' */
    compactCount: SlotProps<
      typeof Typography,
      VireoFormStepProgressCompactCountSlotPropsOverrides,
      VireoFormStepProgressOwnerState
    >;
    /** @default LinearProgress */
    compactProgress: SlotProps<
      typeof LinearProgress,
      VireoFormStepProgressCompactProgressSlotPropsOverrides,
      VireoFormStepProgressOwnerState
    >;
    /** @default Menu */
    menu: SlotProps<typeof Menu, VireoFormStepProgressMenuSlotPropsOverrides, VireoFormStepProgressOwnerState>;
    /** @default MenuItem */
    menuItem: SlotProps<
      typeof MenuItem,
      VireoFormStepProgressMenuItemSlotPropsOverrides,
      VireoFormStepProgressOwnerState
    >;
  }
>;

export type VireoFormStepProgressOwnProps = VireoFormStepProgressSlotsAndSlotProps & {
  /** Container width at which responsive progress changes to its compact presentation. @default 600 */
  compactBreakpoint?: number;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFormStepProgressClasses>;
  /** Chooses the wide, compact, or container-responsive presentation. @default 'responsive' */
  layout?: VireoFormStepProgressLayout;
  /** Controls which steps can be selected directly from progress navigation. @default 'visited' */
  navigation?: VireoFormStepProgressNavigation;
};
export type VireoFormStepProgressInheritedProps = Omit<BoxProps<"nav">, "component" | "ref">;
export type VireoFormStepProgressProps = VireoFormStepProgressOwnProps & VireoFormStepProgressInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_STEP_PROGRESS_NAME]?: VireoThemeComponent<
      VireoFormStepProgressProps,
      VireoFormStepProgressClassKey,
      VireoFormStepProgressOwnerState,
      Theme
    >;
  }
}
