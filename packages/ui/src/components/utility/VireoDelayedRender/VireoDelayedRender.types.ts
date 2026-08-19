import type { VireoDataAttributeValue } from "@/utils/muiutils";
import type { BoxProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoDelayedRenderClasses, type VireoDelayedRenderClassKey } from "./VireoDelayedRender.classes";
import type { VIREO_DELAYED_RENDER_NAME, VireoDelayedRenderSlotName } from "./VireoDelayedRender.identity";

export type VireoDelayedRenderOwnerState = {
  delay: number;
};

export interface VireoDelayedRenderRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoDelayedRender}. */
export type VireoDelayedRenderSlots = {
  [TSlotName in VireoDelayedRenderSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoDelayedRender}. */
export type VireoDelayedRenderSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoDelayedRenderSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoDelayedRenderRootSlotPropsOverrides, VireoDelayedRenderOwnerState>;
  }
>;

/** Props owned by {@link VireoDelayedRender}. */
export type VireoDelayedRenderOwnProps = VireoDelayedRenderSlotsAndSlotProps & {
  /** Content mounted after the delay elapses. */
  children: React.ReactNode;
  /** Time in milliseconds to wait before mounting the content. @default 200 */
  delay?: number;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoDelayedRenderClasses>;
};

/** Props VireoDelayedRender inherits from its default root after excluding component-owned props. */
export type VireoDelayedRenderInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoDelayedRender}. */
export type VireoDelayedRenderProps = VireoDelayedRenderOwnProps & VireoDelayedRenderInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_DELAYED_RENDER_NAME]: VireoDelayedRenderProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_DELAYED_RENDER_NAME]: VireoDelayedRenderClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_DELAYED_RENDER_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_DELAYED_RENDER_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_DELAYED_RENDER_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_DELAYED_RENDER_NAME];
    };
  }
}
