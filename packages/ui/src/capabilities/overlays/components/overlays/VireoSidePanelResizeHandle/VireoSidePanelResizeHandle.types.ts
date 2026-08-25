import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoSidePanelResizeHandleClasses,
  type VireoSidePanelResizeHandleClassKey,
} from "./VireoSidePanelResizeHandle.classes";
import type {
  VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME,
  VireoSidePanelResizeHandleSlotName,
} from "./VireoSidePanelResizeHandle.identity";

export type VireoSidePanelResizeHandleOwnerState = {
  enabled: boolean;
  isResizing: boolean;
};

export interface VireoSidePanelResizeHandleRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoSidePanelResizeHandle}. */
export type VireoSidePanelResizeHandleSlots = {
  [TSlotName in VireoSidePanelResizeHandleSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoSidePanelResizeHandle}. */
export type VireoSidePanelResizeHandleSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoSidePanelResizeHandleSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoSidePanelResizeHandleRootSlotPropsOverrides, VireoSidePanelResizeHandleOwnerState>;
  }
>;

/** Props owned by {@link VireoSidePanelResizeHandle}. */
export type VireoSidePanelResizeHandleOwnProps = VireoSidePanelResizeHandleSlotsAndSlotProps & {
  /** Whether the resize handle is rendered. @default true */
  enabled?: boolean;
  /** Whether an active pointer resize is in progress. @default false */
  isResizing?: boolean;
  /** Starts pointer-driven resizing. */
  onResizeStart: React.MouseEventHandler<HTMLDivElement>;
  /** Handles keyboard-driven resizing when value metadata is also provided. */
  onResizeKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  /** Restores the owning panel's initial width. */
  onResizeDoubleClick: React.MouseEventHandler<HTMLDivElement>;
  /** Smallest keyboard-adjustable width. */
  valueMin?: number;
  /** Largest keyboard-adjustable width. */
  valueMax?: number;
  /** Current keyboard-adjustable width. */
  valueNow?: number;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoSidePanelResizeHandleClasses>;
};

/** Props VireoSidePanelResizeHandle inherits from its default root after excluding component-owned props. */
export type VireoSidePanelResizeHandleInheritedProps = Omit<
  BoxProps<"div">,
  "children" | "component" | "onDoubleClick" | "onKeyDown" | "onMouseDown" | "onPointerDown" | "role" | "tabIndex"
>;

/** Props accepted by {@link VireoSidePanelResizeHandle}. */
export type VireoSidePanelResizeHandleProps = VireoSidePanelResizeHandleOwnProps &
  VireoSidePanelResizeHandleInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME]?: VireoThemeComponent<
      VireoSidePanelResizeHandleProps,
      VireoSidePanelResizeHandleClassKey,
      VireoSidePanelResizeHandleOwnerState,
      Theme
    >;
  }
}
