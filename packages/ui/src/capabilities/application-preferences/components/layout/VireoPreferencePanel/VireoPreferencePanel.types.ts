import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Accordion, AccordionDetails, AccordionSummary, Box, Card, CardProps, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoPreferencePanelClasses, type VireoPreferencePanelClassKey } from "./VireoPreferencePanel.classes";
import type { VIREO_PREFERENCE_PANEL_NAME, VireoPreferencePanelSlotName } from "./VireoPreferencePanel.identity";

export type VireoPreferenceItemDefinition = {
  id: string;
  title: string;
  description?: string;
  searchKeywords?: readonly string[];
  icon?: React.ReactNode;
  control: React.ReactNode;
};

export type VireoPreferenceSectionDefinition = {
  id: string;
  title: string;
  action?: React.ReactNode;
  items: readonly VireoPreferenceItemDefinition[];
};

export type VireoPreferencePanelOwnerState = {
  controlWidth: number | string;
  hasVisibleItems: boolean;
  isCompact: boolean;
  isFiltering: boolean;
  stickySectionHeaders: boolean;
};

export interface VireoPreferencePanelRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelSectionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelSectionHeaderSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelSectionSummarySlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelSectionActionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelSectionDetailsSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelItemSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelItemIconSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelItemContentSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelItemTitleSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelItemDescriptionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelItemControlSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoPreferencePanelEmptyStateSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoPreferencePanel}. */
export type VireoPreferencePanelSlots = {
  [TSlotName in VireoPreferencePanelSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoPreferencePanel}. */
export type VireoPreferencePanelSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoPreferencePanelSlots,
  {
    /** @default Card */
    root: SlotProps<typeof Card, VireoPreferencePanelRootSlotPropsOverrides, VireoPreferencePanelOwnerState>;
    /** @default Accordion */
    section: SlotProps<typeof Accordion, VireoPreferencePanelSectionSlotPropsOverrides, VireoPreferencePanelOwnerState>;
    /** @default Box */
    sectionHeader: SlotProps<
      typeof Box,
      VireoPreferencePanelSectionHeaderSlotPropsOverrides,
      VireoPreferencePanelOwnerState
    >;
    /** @default AccordionSummary */
    sectionSummary: SlotProps<
      typeof AccordionSummary,
      VireoPreferencePanelSectionSummarySlotPropsOverrides,
      VireoPreferencePanelOwnerState
    >;
    /** @default Box */
    sectionAction: SlotProps<
      typeof Box,
      VireoPreferencePanelSectionActionSlotPropsOverrides,
      VireoPreferencePanelOwnerState
    >;
    /** @default AccordionDetails */
    sectionDetails: SlotProps<
      typeof AccordionDetails,
      VireoPreferencePanelSectionDetailsSlotPropsOverrides,
      VireoPreferencePanelOwnerState
    >;
    /** @default Box */
    item: SlotProps<typeof Box, VireoPreferencePanelItemSlotPropsOverrides, VireoPreferencePanelOwnerState>;
    /** @default Box */
    itemIcon: SlotProps<typeof Box, VireoPreferencePanelItemIconSlotPropsOverrides, VireoPreferencePanelOwnerState>;
    /** @default Box */
    itemContent: SlotProps<
      typeof Box,
      VireoPreferencePanelItemContentSlotPropsOverrides,
      VireoPreferencePanelOwnerState
    >;
    /** @default Typography */
    itemTitle: SlotProps<
      typeof Typography,
      VireoPreferencePanelItemTitleSlotPropsOverrides,
      VireoPreferencePanelOwnerState
    >;
    /** @default Typography */
    itemDescription: SlotProps<
      typeof Typography,
      VireoPreferencePanelItemDescriptionSlotPropsOverrides,
      VireoPreferencePanelOwnerState
    >;
    /** @default Box */
    itemControl: SlotProps<
      typeof Box,
      VireoPreferencePanelItemControlSlotPropsOverrides,
      VireoPreferencePanelOwnerState
    >;
    /** @default Box */
    emptyState: SlotProps<typeof Box, VireoPreferencePanelEmptyStateSlotPropsOverrides, VireoPreferencePanelOwnerState>;
  }
>;

/** Props owned by {@link VireoPreferencePanel}. */
export type VireoPreferencePanelOwnProps = VireoPreferencePanelSlotsAndSlotProps & {
  sections: readonly VireoPreferenceSectionDefinition[];
  emptyState: React.ReactNode;
  searchQuery?: string;
  expandedSectionIds?: readonly string[];
  defaultExpandedSectionIds?: readonly string[];
  onExpandedSectionIdsChange?: (ids: readonly string[]) => void;
  controlWidth?: number | string;
  stickySectionHeaders?: boolean;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoPreferencePanelClasses>;
};

/** Props VireoPreferencePanel inherits from its default root after excluding component-owned props. */
export type VireoPreferencePanelInheritedProps = Omit<CardProps, "children" | "component">;

/** Props accepted by {@link VireoPreferencePanel}. */
export type VireoPreferencePanelProps = VireoPreferencePanelOwnProps & VireoPreferencePanelInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_PREFERENCE_PANEL_NAME]?: VireoThemeComponent<
      VireoPreferencePanelProps,
      VireoPreferencePanelClassKey,
      VireoPreferencePanelOwnerState,
      Theme
    >;
  }
}
