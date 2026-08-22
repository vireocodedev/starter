import type { VireoInfiniteCanvasOverlayPosition } from "@/capabilities/infinite-canvas/types/infiniteCanvas.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type {
  VireoInfiniteCanvasOverlayClasses,
  VireoInfiniteCanvasOverlayClassKey,
} from "./VireoInfiniteCanvasOverlay.classes";
import type {
  VIREO_INFINITE_CANVAS_OVERLAY_NAME,
  VireoInfiniteCanvasOverlaySlotName,
} from "./VireoInfiniteCanvasOverlay.identity";
export type VireoInfiniteCanvasOverlayOwnerState = { position: VireoInfiniteCanvasOverlayPosition };
export interface VireoInfiniteCanvasOverlayRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoInfiniteCanvasOverlayContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoInfiniteCanvasOverlaySlots = { [TSlotName in VireoInfiniteCanvasOverlaySlotName]: React.ElementType };
export type VireoInfiniteCanvasOverlaySlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoInfiniteCanvasOverlaySlots,
  {
    root: SlotProps<"div", VireoInfiniteCanvasOverlayRootSlotPropsOverrides, VireoInfiniteCanvasOverlayOwnerState>;
    content: SlotProps<
      "div",
      VireoInfiniteCanvasOverlayContentSlotPropsOverrides,
      VireoInfiniteCanvasOverlayOwnerState
    >;
  }
>;
export type VireoInfiniteCanvasOverlayOwnProps = VireoInfiniteCanvasOverlaySlotsAndSlotProps & {
  children: React.ReactNode;
  position?: VireoInfiniteCanvasOverlayPosition;
  offset?: number;
  classes?: Partial<VireoInfiniteCanvasOverlayClasses>;
};
export type VireoInfiniteCanvasOverlayInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "position">;
export type VireoInfiniteCanvasOverlayProps = VireoInfiniteCanvasOverlayOwnProps &
  VireoInfiniteCanvasOverlayInheritedProps;
declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_INFINITE_CANVAS_OVERLAY_NAME]?: VireoThemeComponent<
      VireoInfiniteCanvasOverlayProps,
      VireoInfiniteCanvasOverlayClassKey,
      VireoInfiniteCanvasOverlayOwnerState,
      Theme
    >;
  }
}
