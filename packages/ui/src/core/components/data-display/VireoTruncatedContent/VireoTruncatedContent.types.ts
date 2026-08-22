import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { BoxProps, Button } from "@mui/material";
import type { VireoThemeComponent } from "@/core/utils/muiutils";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoTruncatedContentClasses, type VireoTruncatedContentClassKey } from "./VireoTruncatedContent.classes";
import type { VIREO_TRUNCATED_CONTENT_NAME, VireoTruncatedContentSlotName } from "./VireoTruncatedContent.identity";

export type VireoTruncatedContentOwnerState = {
  collapsedHeight: number;
  expanded: boolean;
  canExpand: boolean;
};

export interface VireoTruncatedContentRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoTruncatedContentContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoTruncatedContentViewportSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoTruncatedContentToggleSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoTruncatedContent}. */
export type VireoTruncatedContentSlots = {
  [TSlotName in VireoTruncatedContentSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoTruncatedContent}. */
export type VireoTruncatedContentSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoTruncatedContentSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoTruncatedContentRootSlotPropsOverrides, VireoTruncatedContentOwnerState>;
    /** @default 'div' */
    viewport: SlotProps<"div", VireoTruncatedContentViewportSlotPropsOverrides, VireoTruncatedContentOwnerState>;
    /** @default 'div' */
    content: SlotProps<"div", VireoTruncatedContentContentSlotPropsOverrides, VireoTruncatedContentOwnerState>;
    /** @default Button */
    toggle: SlotProps<typeof Button, VireoTruncatedContentToggleSlotPropsOverrides, VireoTruncatedContentOwnerState>;
  }
>;

/** Props owned by {@link VireoTruncatedContent}. */
export type VireoTruncatedContentOwnProps = VireoTruncatedContentSlotsAndSlotProps & {
  /** Content that is collapsed only when its rendered dimensions overflow the configured height or available width. */
  children: React.ReactNode;
  /** Maximum visible height while collapsed. @default 40 */
  collapsedHeight?: number;
  /** Accessible label rendered by the toggle while content is collapsed. */
  expandLabel: React.ReactNode;
  /** Accessible label rendered by the toggle while content is expanded. */
  collapseLabel: React.ReactNode;
  /** Initial expansion state when expansion is uncontrolled. @default false */
  defaultExpanded?: boolean;
  /** Controlled expansion state. */
  expanded?: boolean;
  /** Called when the user requests a change to the expansion state. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Stops toggle click propagation, useful inside clickable rows. @default false */
  stopPropagation?: boolean;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoTruncatedContentClasses>;
};

/** Props VireoTruncatedContent inherits from its default root after excluding component-owned props. */
export type VireoTruncatedContentInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoTruncatedContent}. */
export type VireoTruncatedContentProps = VireoTruncatedContentOwnProps & VireoTruncatedContentInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_TRUNCATED_CONTENT_NAME]?: VireoThemeComponent<
      VireoTruncatedContentProps,
      VireoTruncatedContentClassKey,
      VireoTruncatedContentOwnerState,
      Theme
    >;
  }
}
