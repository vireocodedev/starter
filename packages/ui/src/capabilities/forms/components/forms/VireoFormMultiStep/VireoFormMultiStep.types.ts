import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoFormMultiStepLocaleText } from "@/capabilities/forms/types/vireoMultiStep.types";
import { type VireoFormMultiStepClasses, type VireoFormMultiStepClassKey } from "./VireoFormMultiStep.classes";
import type { VIREO_FORM_MULTI_STEP_NAME, VireoFormMultiStepSlotName } from "./VireoFormMultiStep.identity";

export type VireoFormMultiStepOwnerState = {
  keepMounted: boolean;
};

export interface VireoFormMultiStepRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoFormMultiStep}. */
export type VireoFormMultiStepSlots = {
  [TSlotName in VireoFormMultiStepSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoFormMultiStep}. */
export type VireoFormMultiStepSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormMultiStepSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoFormMultiStepRootSlotPropsOverrides, VireoFormMultiStepOwnerState>;
  }
>;

/** Props owned by {@link VireoFormMultiStep}. */
export type VireoFormMultiStepOwnProps = VireoFormMultiStepSlotsAndSlotProps & {
  children?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFormMultiStepClasses>;
  /** Keeps applicable inactive steps mounted with the native hidden attribute. @default false */
  keepMounted?: boolean;
  /** Overrides built-in English progress and navigation copy for this multi-step boundary. */
  localeText?: Partial<VireoFormMultiStepLocaleText>;
};

/** Props VireoFormMultiStep inherits from its default root after excluding component-owned props. */
export type VireoFormMultiStepInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoFormMultiStep}. */
export type VireoFormMultiStepProps = VireoFormMultiStepOwnProps & VireoFormMultiStepInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_MULTI_STEP_NAME]?: VireoThemeComponent<
      VireoFormMultiStepProps,
      VireoFormMultiStepClassKey,
      VireoFormMultiStepOwnerState,
      Theme
    >;
  }
}
