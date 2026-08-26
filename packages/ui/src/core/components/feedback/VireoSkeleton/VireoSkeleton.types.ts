import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/utils/muiutils";
import type { SkeletonProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoSkeletonClasses, type VireoSkeletonClassKey } from "./VireoSkeleton.classes";
import type { VIREO_SKELETON_NAME, VireoSkeletonSlotName } from "./VireoSkeleton.identity";

export type VireoSkeletonVariant = NonNullable<SkeletonProps["variant"]>;

export type VireoSkeletonOwnerState = {
  hasChildren: boolean;
  variant: VireoSkeletonVariant;
};

export interface VireoSkeletonRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoSkeleton}. */
export type VireoSkeletonSlots = {
  [TSlotName in VireoSkeletonSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoSkeleton}. */
export type VireoSkeletonSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoSkeletonSlots,
  {
    /** @default MUI Skeleton */
    root: SlotProps<"span", VireoSkeletonRootSlotPropsOverrides, VireoSkeletonOwnerState>;
  }
>;

/** Props owned by {@link VireoSkeleton}. */
export type VireoSkeletonOwnProps = VireoSkeletonSlotsAndSlotProps & {
  /** Optional content whose rendered geometry the skeleton should preserve. */
  children?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoSkeletonClasses>;
  /** Shape of the placeholder. @default 'text' */
  variant?: VireoSkeletonVariant;
};

/** Props VireoSkeleton inherits from its default root after excluding component-owned props. */
export type VireoSkeletonInheritedProps = Omit<
  SkeletonProps,
  "animation" | "children" | "classes" | "component" | "variant"
>;

/** Props accepted by {@link VireoSkeleton}. */
export type VireoSkeletonProps = VireoSkeletonOwnProps & VireoSkeletonInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_SKELETON_NAME]?: VireoThemeComponent<
      VireoSkeletonProps,
      VireoSkeletonClassKey,
      VireoSkeletonOwnerState,
      Theme
    >;
  }
}
