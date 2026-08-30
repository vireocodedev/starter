import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { ContentCopy } from "@mui/icons-material";
import type { BoxProps, IconButton } from "@mui/material";
import type { VireoThemeComponent } from "@/core/utils/muiutils";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoJsonViewerClasses, type VireoJsonViewerClassKey } from "./VireoJsonViewer.classes";
import type { VIREO_JSON_VIEWER_NAME, VireoJsonViewerSlotName } from "./VireoJsonViewer.identity";

export type VireoJsonViewerOwnerState = {
  copied: boolean;
  copyStatus: "idle" | "copied" | "failed";
  maxHeight: string | number;
};

export interface VireoJsonViewerRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoJsonViewerToolbarSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoJsonViewerCopyButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoJsonViewerCopyIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoJsonViewerStatusSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoJsonViewerContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoJsonViewer}. */
export type VireoJsonViewerSlots = {
  [TSlotName in VireoJsonViewerSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoJsonViewer}. */
export type VireoJsonViewerSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoJsonViewerSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoJsonViewerRootSlotPropsOverrides, VireoJsonViewerOwnerState>;
    /** @default 'div' */
    toolbar: SlotProps<"div", VireoJsonViewerToolbarSlotPropsOverrides, VireoJsonViewerOwnerState>;
    /** @default IconButton */
    copyButton: SlotProps<typeof IconButton, VireoJsonViewerCopyButtonSlotPropsOverrides, VireoJsonViewerOwnerState>;
    /** @default ContentCopy */
    copyIcon: SlotProps<typeof ContentCopy, VireoJsonViewerCopyIconSlotPropsOverrides, VireoJsonViewerOwnerState>;
    /** Visually hidden polite live region for copy success and failure feedback. @default 'span' */
    status: SlotProps<"span", VireoJsonViewerStatusSlotPropsOverrides, VireoJsonViewerOwnerState>;
    /** @default 'pre' */
    content: SlotProps<"pre", VireoJsonViewerContentSlotPropsOverrides, VireoJsonViewerOwnerState>;
  }
>;

/** Props owned by {@link VireoJsonViewer}. */
export type VireoJsonViewerOwnProps = VireoJsonViewerSlotsAndSlotProps & {
  /** Arbitrary value serialized for read-only inspection. */
  data: unknown;
  /** Accessible label shown while the JSON is ready to copy. */
  copyLabel: string;
  /** Accessible feedback shown briefly after copying succeeds. */
  copiedLabel: string;
  /** Accessible feedback shown briefly after clipboard access fails. */
  copyErrorLabel: string;
  /** Maximum height of the scrollable JSON content. @default '24rem' */
  maxHeight?: string | number;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoJsonViewerClasses>;
};

/** Props VireoJsonViewer inherits from its default root after excluding component-owned props. */
export type VireoJsonViewerInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "maxHeight">;

/** Props accepted by {@link VireoJsonViewer}. */
export type VireoJsonViewerProps = VireoJsonViewerOwnProps & VireoJsonViewerInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_JSON_VIEWER_NAME]?: VireoThemeComponent<
      VireoJsonViewerProps,
      VireoJsonViewerClassKey,
      VireoJsonViewerOwnerState,
      Theme
    >;
  }
}
