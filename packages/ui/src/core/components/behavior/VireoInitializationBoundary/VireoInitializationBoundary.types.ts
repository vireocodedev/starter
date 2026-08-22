import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoInitializationBoundaryClasses,
  type VireoInitializationBoundaryClassKey,
} from "./VireoInitializationBoundary.classes";
import type {
  VIREO_INITIALIZATION_BOUNDARY_NAME,
  VireoInitializationBoundarySlotName,
} from "./VireoInitializationBoundary.identity";

export type VireoInitializationBoundaryStatus = "pending" | "ready";

export type VireoInitializationBoundaryOwnerState = {
  status: VireoInitializationBoundaryStatus;
};

export type VireoInitializationContext = { signal: AbortSignal };
export type VireoInitializationCleanup = () => void | Promise<void>;
export type VireoInitializer = (
  context: VireoInitializationContext,
) => void | VireoInitializationCleanup | Promise<void | VireoInitializationCleanup>;

export interface VireoInitializationBoundaryRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoInitializationBoundary}. */
export type VireoInitializationBoundarySlots = {
  [TSlotName in VireoInitializationBoundarySlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoInitializationBoundary}. */
export type VireoInitializationBoundarySlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoInitializationBoundarySlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoInitializationBoundaryRootSlotPropsOverrides, VireoInitializationBoundaryOwnerState>;
  }
>;

/** Props owned by {@link VireoInitializationBoundary}. */
export type VireoInitializationBoundaryOwnProps = VireoInitializationBoundarySlotsAndSlotProps & {
  children: React.ReactNode;
  initialize: VireoInitializer;
  /** Content rendered while initialization is pending. @default null */
  fallback?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoInitializationBoundaryClasses>;
};

/** Props VireoInitializationBoundary inherits from its default root after excluding component-owned props. */
export type VireoInitializationBoundaryInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoInitializationBoundary}. */
export type VireoInitializationBoundaryProps = VireoInitializationBoundaryOwnProps &
  VireoInitializationBoundaryInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_INITIALIZATION_BOUNDARY_NAME]?: VireoThemeComponent<
      VireoInitializationBoundaryProps,
      VireoInitializationBoundaryClassKey,
      VireoInitializationBoundaryOwnerState,
      Theme
    >;
  }
}
