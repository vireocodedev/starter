import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type {
  VireoDndDropProposal,
  VireoDndMode,
  VireoDropZoneId,
} from "@/integrations/hello-pangea-dnd/types/dnd.types";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoDropZoneClasses, type VireoDropZoneClassKey } from "./VireoDropZone.classes";
import type { VIREO_DROP_ZONE_NAME, VireoDropZoneSlotName } from "./VireoDropZone.identity";

export type VireoDropZoneState = "candidate" | "idle" | "over" | "rejected";

export type VireoDropZoneOwnerState = {
  direction: "horizontal" | "vertical";
  disabled: boolean;
  disableDefaultFeedback: boolean;
  dropState: VireoDropZoneState;
  mode: VireoDndMode;
};

export interface VireoDropZoneRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoDropZone}. */
export type VireoDropZoneSlots = {
  [TSlotName in VireoDropZoneSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoDropZone}. */
export type VireoDropZoneSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoDropZoneSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoDropZoneRootSlotPropsOverrides, VireoDropZoneOwnerState>;
  }
>;

/** Props owned by {@link VireoDropZone}. */
export type VireoDropZoneOwnProps = VireoDropZoneSlotsAndSlotProps & {
  children?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoDropZoneClasses>;
  /** Determines whether the active draggable is accepted by this compatible zone. */
  canDrop?: (proposal: VireoDndDropProposal) => boolean;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  disableDefaultFeedback?: boolean;
  /** @default 'vertical' */
  direction?: "horizontal" | "vertical";
  /** Native compatibility group. Zones exchange items only inside the same group. @default 'default' */
  group?: string;
  /** Structured identifier unique within the nearest provider. */
  id: VireoDropZoneId;
  /** Controls insertion semantics at this destination. */
  mode: VireoDndMode;
};

/** Props VireoDropZone inherits from its default root after excluding component-owned props. */
export type VireoDropZoneInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "id">;

/** Props accepted by {@link VireoDropZone}. */
export type VireoDropZoneProps = VireoDropZoneOwnProps & VireoDropZoneInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_DROP_ZONE_NAME]?: VireoThemeComponent<
      VireoDropZoneProps,
      VireoDropZoneClassKey,
      VireoDropZoneOwnerState,
      Theme
    >;
  }
}
