import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormStepClasses, type VireoFormStepClassKey } from "./VireoFormStep.classes";
import type { VIREO_FORM_STEP_NAME, VireoFormStepSlotName } from "./VireoFormStep.identity";

export type VireoFormStepOwnerState = {
  active: boolean;
  current: boolean;
  keepMounted: boolean;
};

export interface VireoFormStepRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFormStepLabelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoFormStep}. */
export type VireoFormStepSlots = {
  [TSlotName in VireoFormStepSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoFormStep}. */
export type VireoFormStepSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormStepSlots,
  {
    /** @default 'div' */
    root: SlotProps<"section", VireoFormStepRootSlotPropsOverrides, VireoFormStepOwnerState>;
    /** @default Typography */
    label: SlotProps<typeof Typography, VireoFormStepLabelSlotPropsOverrides, VireoFormStepOwnerState>;
  }
>;

/** Props owned by {@link VireoFormStep}. */
export type VireoFormStepOwnProps = VireoFormStepSlotsAndSlotProps & {
  children?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFormStepClasses>;
  /** Stable configured step id. */
  id: string;
};

/** Props VireoFormStep inherits from its default root after excluding component-owned props. */
export type VireoFormStepInheritedProps = Omit<BoxProps<"section">, "children" | "component" | "id">;

/** Props accepted by {@link VireoFormStep}. */
export type VireoFormStepProps = VireoFormStepOwnProps & VireoFormStepInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_STEP_NAME]?: VireoThemeComponent<
      VireoFormStepProps,
      VireoFormStepClassKey,
      VireoFormStepOwnerState,
      Theme
    >;
  }
}
