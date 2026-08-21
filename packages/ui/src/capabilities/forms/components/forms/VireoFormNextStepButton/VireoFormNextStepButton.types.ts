import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Button, ButtonProps, CircularProgress } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type {
  VireoFormNextStepButtonClasses,
  VireoFormNextStepButtonClassKey,
} from "./VireoFormNextStepButton.classes";
import type {
  VIREO_FORM_NEXT_STEP_BUTTON_NAME,
  VireoFormNextStepButtonSlotName,
} from "./VireoFormNextStepButton.identity";

export type VireoFormNextStepButtonOwnerState = {
  disabled: boolean;
  lastStep: boolean;
  loading: boolean;
  visibility: "auto" | "always";
};
export interface VireoFormNextStepButtonRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormNextStepButtonLoadingIndicatorSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoFormNextStepButtonSlots = { [T in VireoFormNextStepButtonSlotName]: React.ElementType };
export type VireoFormNextStepButtonSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormNextStepButtonSlots,
  {
    /** @default Button */
    root: SlotProps<typeof Button, VireoFormNextStepButtonRootSlotPropsOverrides, VireoFormNextStepButtonOwnerState>;
    /** @default CircularProgress */
    loadingIndicator: SlotProps<
      typeof CircularProgress,
      VireoFormNextStepButtonLoadingIndicatorSlotPropsOverrides,
      VireoFormNextStepButtonOwnerState
    >;
  }
>;
export type VireoFormNextStepButtonOwnProps = VireoFormNextStepButtonSlotsAndSlotProps & {
  children?: React.ReactNode;
  classes?: Partial<VireoFormNextStepButtonClasses>;
  /** Adds a consumer-owned loading condition to step validation. @default false */
  loading?: boolean | null;
  /** Hides the next action on the final step or leaves it disabled. @default 'auto' */
  visibility?: "auto" | "always";
};
export type VireoFormNextStepButtonInheritedProps = Omit<
  ButtonProps,
  "component" | "href" | "loading" | "loadingIndicator" | "type"
>;
export type VireoFormNextStepButtonProps = VireoFormNextStepButtonOwnProps & VireoFormNextStepButtonInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_NEXT_STEP_BUTTON_NAME]?: VireoThemeComponent<
      VireoFormNextStepButtonProps,
      VireoFormNextStepButtonClassKey,
      VireoFormNextStepButtonOwnerState,
      Theme
    >;
  }
}
