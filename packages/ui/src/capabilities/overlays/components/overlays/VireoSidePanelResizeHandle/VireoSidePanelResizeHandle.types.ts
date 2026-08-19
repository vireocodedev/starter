import type { VireoDataAttributeValue } from "@/core/public";
import type { BoxProps } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
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
  /** Restores the owning panel's initial width. */
  onResizeDoubleClick: React.MouseEventHandler<HTMLDivElement>;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoSidePanelResizeHandleClasses>;
};

/** Props VireoSidePanelResizeHandle inherits from its default root after excluding component-owned props. */
export type VireoSidePanelResizeHandleInheritedProps = Omit<
  BoxProps<"div">,
  "children" | "component" | "onDoubleClick" | "onMouseDown" | "role"
>;

/** Props accepted by {@link VireoSidePanelResizeHandle}. */
export type VireoSidePanelResizeHandleProps = VireoSidePanelResizeHandleOwnProps &
  VireoSidePanelResizeHandleInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME]: VireoSidePanelResizeHandleProps;
  }

  interface ComponentNameToClassKey {
    [VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME]: VireoSidePanelResizeHandleClassKey;
  }

  interface Components<Theme = unknown> {
    [VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME];
    };
  }
}
