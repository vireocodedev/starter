import type { VireoCanvasTransform } from "@/capabilities/infinite-canvas/types/infiniteCanvas.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type {
  VireoInfiniteCanvasBodyClasses,
  VireoInfiniteCanvasBodyClassKey,
} from "./VireoInfiniteCanvasBody.classes";
import type {
  VIREO_INFINITE_CANVAS_BODY_NAME,
  VireoInfiniteCanvasBodySlotName,
} from "./VireoInfiniteCanvasBody.identity";
export type VireoInfiniteCanvasBodyOwnerState = { transform: VireoCanvasTransform };
export interface VireoInfiniteCanvasBodyRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoInfiniteCanvasBodySlots = { [TSlotName in VireoInfiniteCanvasBodySlotName]: React.ElementType };
export type VireoInfiniteCanvasBodySlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoInfiniteCanvasBodySlots,
  { root: SlotProps<"div", VireoInfiniteCanvasBodyRootSlotPropsOverrides, VireoInfiniteCanvasBodyOwnerState> }
>;
export type VireoInfiniteCanvasBodyOwnProps = VireoInfiniteCanvasBodySlotsAndSlotProps & {
  children: React.ReactNode;
  classes?: Partial<VireoInfiniteCanvasBodyClasses>;
};
export type VireoInfiniteCanvasBodyInheritedProps = Omit<BoxProps<"div">, "children" | "component">;
export type VireoInfiniteCanvasBodyProps = VireoInfiniteCanvasBodyOwnProps & VireoInfiniteCanvasBodyInheritedProps;
declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_INFINITE_CANVAS_BODY_NAME]?: VireoThemeComponent<
      VireoInfiniteCanvasBodyProps,
      VireoInfiniteCanvasBodyClassKey,
      VireoInfiniteCanvasBodyOwnerState,
      Theme
    >;
  }
}
