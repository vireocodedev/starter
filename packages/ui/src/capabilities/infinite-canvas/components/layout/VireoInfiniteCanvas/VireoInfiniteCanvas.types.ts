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
  keyboardControlsEnabled: boolean;
  keyboardPanStep: number;
  panEnabled: boolean;
  touchPanEnabled: boolean;
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
  /** Enables focus and the built-in Arrow-key pan, +/- zoom, and 0 reset shortcuts. @default true */
  keyboardControlsEnabled?: boolean;
  /** Positive distance, in CSS pixels, that an Arrow key pans the viewport. Invalid values fall back to 40. @default 40 */
  keyboardPanStep?: number;
  /** Runs after `slotProps.root.onKeyDown` and before a built-in keyboard action. Prevent the event to cancel that action. */
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  /** Captures single-finger touch gestures for canvas panning. Keep disabled when the canvas is embedded in a scrollable page. @default false */
  touchPanEnabled?: boolean;
  /** Captures wheel gestures for pointer-centered zooming. Keep disabled when the canvas is embedded in a scrollable page. @default false */
  wheelZoomEnabled?: boolean;
  classes?: Partial<VireoInfiniteCanvasClasses>;
};

/** Accessible-name alternatives accepted by VireoInfiniteCanvas. */
export type VireoInfiniteCanvasAccessibleNameProps =
  | {
      /** Localized accessible name for the canvas region. */
      "aria-label": string;
      "aria-labelledby"?: never;
    }
  | {
      "aria-label"?: never;
      /** ID of visible text that provides the localized accessible name for the canvas region. */
      "aria-labelledby": string;
    };

/** Props VireoInfiniteCanvas inherits from its default root after excluding component-owned props. */
export type VireoInfiniteCanvasInheritedProps = Omit<
  BoxProps<"div">,
  "aria-label" | "aria-labelledby" | "children" | "component" | "onChange" | "onKeyDown" | "role" | "tabIndex"
>;

/** Props accepted by {@link VireoInfiniteCanvas}. */
export type VireoInfiniteCanvasProps = VireoInfiniteCanvasOwnProps &
  VireoInfiniteCanvasAccessibleNameProps &
  VireoInfiniteCanvasInheritedProps;
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
