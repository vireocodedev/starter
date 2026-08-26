import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoLoadingRegionClasses, type VireoLoadingRegionClassKey } from "./VireoLoadingRegion.classes";
import type { VIREO_LOADING_REGION_NAME, VireoLoadingRegionSlotName } from "./VireoLoadingRegion.identity";

export type VireoLoadingRegionRenderState = {
  loading: boolean;
  loadingVisible: boolean;
};

export type VireoLoadingRegionOwnerState = VireoLoadingRegionRenderState & {
  announce: boolean;
  revealDelay: number;
};

export interface VireoLoadingRegionRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoLoadingRegionStatusSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoLoadingRegion}. */
export type VireoLoadingRegionSlots = {
  [TSlotName in VireoLoadingRegionSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoLoadingRegion}. */
export type VireoLoadingRegionSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoLoadingRegionSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoLoadingRegionRootSlotPropsOverrides, VireoLoadingRegionOwnerState>;
    /** @default 'span' */
    status: SlotProps<"span", VireoLoadingRegionStatusSlotPropsOverrides, VireoLoadingRegionOwnerState>;
  }
>;

/** Props owned by {@link VireoLoadingRegion}. */
export type VireoLoadingRegionOwnProps = VireoLoadingRegionSlotsAndSlotProps & {
  /** Whether this boundary should announce prolonged loading. Nested visual-only regions should disable this. @default true */
  announce?: boolean;
  /** Stable content or a render function receiving the normalized loading state. */
  children: React.ReactNode | ((state: VireoLoadingRegionRenderState) => React.ReactNode);
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoLoadingRegionClasses>;
  /** Whether this region is waiting for content. */
  loading: boolean;
  /** Concise status announced after the reveal delay. */
  loadingLabel: React.ReactNode;
  /** Delay before visual placeholders and the status announcement become visible. */
  revealDelay?: number;
};

/** Props VireoLoadingRegion inherits from its default root after excluding component-owned props. */
export type VireoLoadingRegionInheritedProps = Omit<BoxProps<"div">, "aria-busy" | "children" | "component">;

/** Props accepted by {@link VireoLoadingRegion}. */
export type VireoLoadingRegionProps = VireoLoadingRegionOwnProps & VireoLoadingRegionInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_LOADING_REGION_NAME]?: VireoThemeComponent<
      VireoLoadingRegionProps,
      VireoLoadingRegionClassKey,
      VireoLoadingRegionOwnerState,
      Theme
    >;
  }
}
