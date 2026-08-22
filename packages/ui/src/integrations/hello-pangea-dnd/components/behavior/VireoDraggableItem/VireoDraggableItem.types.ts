import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { VireoDraggableId } from "@/integrations/hello-pangea-dnd/types/dnd.types";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoDraggableItemClasses, type VireoDraggableItemClassKey } from "./VireoDraggableItem.classes";
import type { VIREO_DRAGGABLE_ITEM_NAME, VireoDraggableItemSlotName } from "./VireoDraggableItem.identity";

export type VireoDraggableItemOwnerState = {
  disabled: boolean;
  disableDefaultFeedback: boolean;
  dragHandle: "explicit" | "root";
  isDragging: boolean;
};

export interface VireoDraggableItemRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoDraggableItem}. */
export type VireoDraggableItemSlots = {
  [TSlotName in VireoDraggableItemSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoDraggableItem}. */
export type VireoDraggableItemSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoDraggableItemSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoDraggableItemRootSlotPropsOverrides, VireoDraggableItemOwnerState>;
  }
>;

/** Props owned by {@link VireoDraggableItem}. */
export type VireoDraggableItemOwnProps = VireoDraggableItemSlotsAndSlotProps & {
  /** Allows a drag to begin from interactive descendants. @default false */
  allowDragFromInteractiveElements?: boolean;
  children?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoDraggableItemClasses>;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  disableDefaultFeedback?: boolean;
  /** @default 'root' */
  dragHandle?: "explicit" | "root";
  /** Structured identifier unique within the nearest provider. */
  id: VireoDraggableId;
  /** Current zero-based position inside its source zone. */
  index: number;
  /** @default true */
  respectForcePress?: boolean;
};

/** Props VireoDraggableItem inherits from its default root after excluding component-owned props. */
export type VireoDraggableItemInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "id" | "onDragStart">;

/** Props accepted by {@link VireoDraggableItem}. */
export type VireoDraggableItemProps = VireoDraggableItemOwnProps & VireoDraggableItemInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_DRAGGABLE_ITEM_NAME]?: VireoThemeComponent<
      VireoDraggableItemProps,
      VireoDraggableItemClassKey,
      VireoDraggableItemOwnerState,
      Theme
    >;
  }
}
