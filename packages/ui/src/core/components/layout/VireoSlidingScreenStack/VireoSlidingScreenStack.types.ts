import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { Box, BoxProps } from "@mui/material";
import type { VireoThemeComponent } from "@/core/utils/muiutils";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoSlidingScreenStackClasses,
  type VireoSlidingScreenStackClassKey,
} from "./VireoSlidingScreenStack.classes";
import type {
  VIREO_SLIDING_SCREEN_STACK_NAME,
  VireoSlidingScreenStackSlotName,
} from "./VireoSlidingScreenStack.identity";

/** One stable, keyed screen rendered by VireoSlidingScreenStack. */
export type VireoSlidingScreenStackScreen = {
  id: string;
  children: React.ReactNode;
};
export type VireoSlidingScreenStackOwnerState = { activeScreenIndex: number; screenCount: number };
export interface VireoSlidingScreenStackRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSlidingScreenStackTrackSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoSlidingScreenStackScreenSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoSlidingScreenStackSlots = { [T in VireoSlidingScreenStackSlotName]: React.ElementType };
export type VireoSlidingScreenStackSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoSlidingScreenStackSlots,
  {
    /** @default 'div' */ root: SlotProps<
      typeof Box,
      VireoSlidingScreenStackRootSlotPropsOverrides,
      VireoSlidingScreenStackOwnerState
    >;
    /** @default 'div' */ track: SlotProps<
      typeof Box,
      VireoSlidingScreenStackTrackSlotPropsOverrides,
      VireoSlidingScreenStackOwnerState
    >;
    /** @default 'div' */ screen: SlotProps<
      typeof Box,
      VireoSlidingScreenStackScreenSlotPropsOverrides,
      VireoSlidingScreenStackOwnerState
    >;
  }
>;
export type VireoSlidingScreenStackOwnProps = VireoSlidingScreenStackSlotsAndSlotProps & {
  /** Screen id currently positioned in the viewport. Unknown ids fall back to the first screen. */
  activeScreen: string;
  /** Ordered screens retained in the DOM while the track moves between them. */
  screens: readonly VireoSlidingScreenStackScreen[];
  classes?: Partial<VireoSlidingScreenStackClasses>;
};
/** Props VireoSlidingScreenStack inherits from its default root after excluding component-owned props. */
export type VireoSlidingScreenStackInheritedProps = Omit<BoxProps<"div">, "children" | "component">;
/** Props accepted by {@link VireoSlidingScreenStack}. */
export type VireoSlidingScreenStackProps = VireoSlidingScreenStackOwnProps & VireoSlidingScreenStackInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_SLIDING_SCREEN_STACK_NAME]?: VireoThemeComponent<
      VireoSlidingScreenStackProps,
      VireoSlidingScreenStackClassKey,
      VireoSlidingScreenStackOwnerState,
      Theme
    >;
  }
}
