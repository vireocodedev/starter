import type { VireoCanvasTransform } from "@/capabilities/infinite-canvas/types/infiniteCanvas.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoInfiniteCanvasClasses, VireoInfiniteCanvasClassKey } from "./VireoInfiniteCanvas.classes";
import type { VIREO_INFINITE_CANVAS_NAME, VireoInfiniteCanvasSlotName } from "./VireoInfiniteCanvas.identity";

export type VireoInfiniteCanvasOwnerState = {
  transform: VireoCanvasTransform;
  gridSize: number;
  horizontalGridFactor: number;
  verticalGridFactor: number;
  panning: boolean;
};
export interface VireoInfiniteCanvasRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoInfiniteCanvasSlots = { [TSlotName in VireoInfiniteCanvasSlotName]: React.ElementType };
export type VireoInfiniteCanvasSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoInfiniteCanvasSlots,
  { root: SlotProps<"div", VireoInfiniteCanvasRootSlotPropsOverrides, VireoInfiniteCanvasOwnerState> }
>;
export type VireoInfiniteCanvasOwnProps = VireoInfiniteCanvasSlotsAndSlotProps & {
  children?: React.ReactNode;
  transform?: VireoCanvasTransform;
  defaultTransform?: VireoCanvasTransform;
  onTransformChange?: (transform: VireoCanvasTransform) => void;
  minScale?: number;
  maxScale?: number;
  zoomStep?: number;
  gridSize?: number;
  horizontalGridFactor?: number;
  verticalGridFactor?: number;
  panEnabled?: boolean;
  wheelZoomEnabled?: boolean;
  classes?: Partial<VireoInfiniteCanvasClasses>;
};
export type VireoInfiniteCanvasInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "onChange">;
export type VireoInfiniteCanvasProps = VireoInfiniteCanvasOwnProps & VireoInfiniteCanvasInheritedProps;
declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_INFINITE_CANVAS_NAME]?: VireoThemeComponent<
      VireoInfiniteCanvasProps,
      VireoInfiniteCanvasClassKey,
      VireoInfiniteCanvasOwnerState,
      Theme
    >;
  }
}
