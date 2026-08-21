import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Button, ButtonProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormResetButtonClasses, type VireoFormResetButtonClassKey } from "./VireoFormResetButton.classes";
import type { VIREO_FORM_RESET_BUTTON_NAME, VireoFormResetButtonSlotName } from "./VireoFormResetButton.identity";

export type VireoFormResetButtonOwnerState = {
  dirty: boolean;
  disabled: boolean;
  pristine: boolean;
};

export interface VireoFormResetButtonRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoFormResetButton}. */
export type VireoFormResetButtonSlots = {
  [TSlotName in VireoFormResetButtonSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoFormResetButton}. */
export type VireoFormResetButtonSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormResetButtonSlots,
  {
    /** @default Button */
    root: SlotProps<typeof Button, VireoFormResetButtonRootSlotPropsOverrides, VireoFormResetButtonOwnerState>;
  }
>;

/** Props owned by {@link VireoFormResetButton}. */
export type VireoFormResetButtonOwnProps = VireoFormResetButtonSlotsAndSlotProps & {
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFormResetButtonClasses>;
};

/** Props VireoFormResetButton inherits from its default root after excluding component-owned props. */
export type VireoFormResetButtonInheritedProps = Omit<ButtonProps, "component" | "href" | "type">;

/** Props accepted by {@link VireoFormResetButton}. */
export type VireoFormResetButtonProps = VireoFormResetButtonOwnProps & VireoFormResetButtonInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_RESET_BUTTON_NAME]?: VireoThemeComponent<
      VireoFormResetButtonProps,
      VireoFormResetButtonClassKey,
      VireoFormResetButtonOwnerState,
      Theme
    >;
  }
}
