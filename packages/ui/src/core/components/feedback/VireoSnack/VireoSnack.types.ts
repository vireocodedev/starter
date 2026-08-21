import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { Box, BoxProps, Typography } from "@mui/material";
import type { VireoThemeComponent } from "@/core/utils/muiutils";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoSnackClasses, type VireoSnackClassKey } from "./VireoSnack.classes";
import type { VIREO_SNACK_NAME, VireoSnackSlotName } from "./VireoSnack.identity";

export type VireoSnackVariant = "default" | "error" | "info" | "success" | "warning";

export type VireoSnackOwnerState = {
  variant: VireoSnackVariant;
  hasStartAdornment: boolean;
  hasEndAdornment: boolean;
};

export interface VireoSnackRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSnackStartAdornmentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSnackMessageSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSnackEndAdornmentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export type VireoSnackSlots = { [TSlotName in VireoSnackSlotName]: React.ElementType };

export type VireoSnackSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoSnackSlots,
  {
    /** @default 'div' */
    root: SlotProps<typeof Box, VireoSnackRootSlotPropsOverrides, VireoSnackOwnerState>;
    /** @default 'span' */
    startAdornment: SlotProps<typeof Box, VireoSnackStartAdornmentSlotPropsOverrides, VireoSnackOwnerState>;
    /** @default Typography */
    message: SlotProps<typeof Typography, VireoSnackMessageSlotPropsOverrides, VireoSnackOwnerState>;
    /** @default 'span' */
    endAdornment: SlotProps<typeof Box, VireoSnackEndAdornmentSlotPropsOverrides, VireoSnackOwnerState>;
  }
>;

export type VireoSnackOwnProps = VireoSnackSlotsAndSlotProps & {
  message: React.ReactNode;
  /** @default 'default' */
  variant?: VireoSnackVariant;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  classes?: Partial<VireoSnackClasses>;
};

/** Props VireoSnack inherits from its default root after excluding component-owned props. */
export type VireoSnackInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "role">;

/** Props accepted by {@link VireoSnack}. */
export type VireoSnackProps = VireoSnackOwnProps & VireoSnackInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_SNACK_NAME]?: VireoThemeComponent<VireoSnackProps, VireoSnackClassKey, VireoSnackOwnerState, Theme>;
  }
}
