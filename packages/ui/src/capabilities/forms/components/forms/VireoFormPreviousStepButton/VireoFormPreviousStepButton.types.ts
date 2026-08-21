import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Button, ButtonProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type {
  VireoFormPreviousStepButtonClasses,
  VireoFormPreviousStepButtonClassKey,
} from "./VireoFormPreviousStepButton.classes";
import type {
  VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME,
  VireoFormPreviousStepButtonSlotName,
} from "./VireoFormPreviousStepButton.identity";

export type VireoFormPreviousStepButtonOwnerState = {
  disabled: boolean;
  firstStep: boolean;
  visibility: "auto" | "always";
};
export interface VireoFormPreviousStepButtonRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoFormPreviousStepButtonSlots = { [T in VireoFormPreviousStepButtonSlotName]: React.ElementType };
export type VireoFormPreviousStepButtonSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormPreviousStepButtonSlots,
  {
    /** @default Button */
    root: SlotProps<
      typeof Button,
      VireoFormPreviousStepButtonRootSlotPropsOverrides,
      VireoFormPreviousStepButtonOwnerState
    >;
  }
>;
export type VireoFormPreviousStepButtonOwnProps = VireoFormPreviousStepButtonSlotsAndSlotProps & {
  children?: React.ReactNode;
  classes?: Partial<VireoFormPreviousStepButtonClasses>;
  /** Hides the action on the first step or leaves it disabled. @default 'auto' */
  visibility?: "auto" | "always";
};
export type VireoFormPreviousStepButtonInheritedProps = Omit<ButtonProps, "component" | "href" | "type">;
export type VireoFormPreviousStepButtonProps = VireoFormPreviousStepButtonOwnProps &
  VireoFormPreviousStepButtonInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_PREVIOUS_STEP_BUTTON_NAME]?: VireoThemeComponent<
      VireoFormPreviousStepButtonProps,
      VireoFormPreviousStepButtonClassKey,
      VireoFormPreviousStepButtonOwnerState,
      Theme
    >;
  }
}
