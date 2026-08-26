import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/utils/muiutils";
import type { BoxProps, CircularProgress } from "@mui/material";
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
export interface VireoInitializationBoundaryLoadingIndicatorSlotPropsOverrides {
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
    /** @default CircularProgress */
    loadingIndicator: SlotProps<
      typeof CircularProgress,
      VireoInitializationBoundaryLoadingIndicatorSlotPropsOverrides,
      VireoInitializationBoundaryOwnerState
    >;
  }
>;

/** Props owned by {@link VireoInitializationBoundary}. */
export type VireoInitializationBoundaryOwnProps = VireoInitializationBoundarySlotsAndSlotProps & {
  children: React.ReactNode;
  initialize: VireoInitializer;
  /** Whether prolonged initialization is announced. Disable for a boundary covered by an announcing ancestor. @default true */
  announceLoading?: boolean;
  /** Content rendered after the shared reveal delay. When omitted, a decorative Level C progress indicator is used. */
  fallback?: React.ReactNode;
  /** Concise status announced after the reveal delay. @default 'Initializing' */
  loadingLabel?: React.ReactNode;
  /** Delay before fallback content and the loading announcement become visible. @default VIREO_LOADING_TOKENS.revealDelay */
  loadingRevealDelay?: number;
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
