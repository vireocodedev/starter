import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoStopwatchClasses, type VireoStopwatchClassKey } from "./VireoStopwatch.classes";
import type { VIREO_STOPWATCH_NAME, VireoStopwatchSlotName } from "./VireoStopwatch.identity";

export type VireoStopwatchTimestamp = Date | number;

export type VireoStopwatchOwnerState = {
  running: boolean;
  valid: boolean;
};

export interface VireoStopwatchRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoStopwatch}. */
export type VireoStopwatchSlots = {
  [TSlotName in VireoStopwatchSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoStopwatch}. */
export type VireoStopwatchSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoStopwatchSlots,
  {
    /** @default 'span' */
    root: SlotProps<"span", VireoStopwatchRootSlotPropsOverrides, VireoStopwatchOwnerState>;
  }
>;

/** Props owned by {@link VireoStopwatch}. */
export type VireoStopwatchOwnProps = VireoStopwatchSlotsAndSlotProps & {
  /** Timestamp at which elapsed-time measurement stops. Omit or set to null for a live stopwatch. */
  endDate?: VireoStopwatchTimestamp | null;
  /** Accessible description announced together with the formatted duration. @default 'Elapsed time' */
  label?: string;
  /** Timestamp from which elapsed time is measured. Omit or set to null to start when the component mounts. */
  startDate?: VireoStopwatchTimestamp | null;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoStopwatchClasses>;
};

/** Props VireoStopwatch inherits from its default root after excluding component-owned props. */
export type VireoStopwatchInheritedProps = Omit<
  BoxProps<"span">,
  "aria-atomic" | "aria-label" | "children" | "component" | "role"
>;

/** Props accepted by {@link VireoStopwatch}. */
export type VireoStopwatchProps = VireoStopwatchOwnProps & VireoStopwatchInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_STOPWATCH_NAME]: VireoStopwatchProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_STOPWATCH_NAME]: VireoStopwatchClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_STOPWATCH_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_STOPWATCH_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_STOPWATCH_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_STOPWATCH_NAME];
    };
  }
}
