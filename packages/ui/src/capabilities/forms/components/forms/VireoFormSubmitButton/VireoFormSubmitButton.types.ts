import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Button, ButtonProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormSubmitButtonClasses, type VireoFormSubmitButtonClassKey } from "./VireoFormSubmitButton.classes";
import type { VIREO_FORM_SUBMIT_BUTTON_NAME, VireoFormSubmitButtonSlotName } from "./VireoFormSubmitButton.identity";

export type VireoFormSubmitButtonOwnerState = {
  disabled: boolean;
  loading: boolean;
  submitting: boolean;
};

export interface VireoFormSubmitButtonRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoFormSubmitButton}. */
export type VireoFormSubmitButtonSlots = {
  [TSlotName in VireoFormSubmitButtonSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoFormSubmitButton}. */
export type VireoFormSubmitButtonSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormSubmitButtonSlots,
  {
    /** @default Button */
    root: SlotProps<typeof Button, VireoFormSubmitButtonRootSlotPropsOverrides, VireoFormSubmitButtonOwnerState>;
  }
>;

/** Props owned by {@link VireoFormSubmitButton}. */
export type VireoFormSubmitButtonOwnProps = VireoFormSubmitButtonSlotsAndSlotProps & {
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFormSubmitButtonClasses>;
  /** Adds a consumer-owned loading condition to the form's submission state. @default false */
  loading?: boolean | null;
};

/** Props VireoFormSubmitButton inherits from its default root after excluding component-owned props. */
export type VireoFormSubmitButtonInheritedProps = Omit<ButtonProps, "component" | "href" | "loading" | "type">;

/** Props accepted by {@link VireoFormSubmitButton}. */
export type VireoFormSubmitButtonProps = VireoFormSubmitButtonOwnProps & VireoFormSubmitButtonInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_SUBMIT_BUTTON_NAME]?: VireoThemeComponent<
      VireoFormSubmitButtonProps,
      VireoFormSubmitButtonClassKey,
      VireoFormSubmitButtonOwnerState,
      Theme
    >;
  }
}
