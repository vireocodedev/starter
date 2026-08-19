import type { VireoDataAttributeValue } from "@/core/utils/muiutils";
import type { Box, BoxProps, Tab, Tabs } from "@mui/material";
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from "@mui/material/styles";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoTabsClasses, type VireoTabsClassKey } from "./VireoTabs.classes";
import type { VIREO_TABS_NAME, VireoTabsSlotName } from "./VireoTabs.identity";

export type VireoTabItem = { value: string; label: React.ReactNode; content: React.ReactNode; disabled?: boolean };
export type VireoTabsOwnerState = { value: string; tabCount: number };
export interface VireoTabsRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoTabsTabsSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoTabsTabSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoTabsPanelSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoTabsSlots = { [T in VireoTabsSlotName]: React.ElementType };
export type VireoTabsSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoTabsSlots,
  {
    /** @default 'div' */ root: SlotProps<typeof Box, VireoTabsRootSlotPropsOverrides, VireoTabsOwnerState>;
    /** @default Tabs */ tabs: SlotProps<typeof Tabs, VireoTabsTabsSlotPropsOverrides, VireoTabsOwnerState>;
    /** @default Tab */ tab: SlotProps<typeof Tab, VireoTabsTabSlotPropsOverrides, VireoTabsOwnerState>;
    /** @default 'div' */ panel: SlotProps<typeof Box, VireoTabsPanelSlotPropsOverrides, VireoTabsOwnerState>;
  }
>;
export type VireoTabsOwnProps = VireoTabsSlotsAndSlotProps & {
  tabs: readonly VireoTabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: React.SyntheticEvent) => void;
  classes?: Partial<VireoTabsClasses>;
};
export type VireoTabsInheritedProps = Omit<BoxProps<"div">, "children" | "component" | "defaultValue" | "onChange">;
export type VireoTabsProps = VireoTabsOwnProps & VireoTabsInheritedProps;

declare module "@mui/material/styles" {
  interface ComponentsPropsList {
    [VIREO_TABS_NAME]: VireoTabsProps;
  }
  interface ComponentNameToClassKey {
    [VIREO_TABS_NAME]: VireoTabsClassKey;
  }
  interface Components<Theme = unknown> {
    [VIREO_TABS_NAME]?: {
      defaultProps?: ComponentsProps[typeof VIREO_TABS_NAME];
      styleOverrides?: ComponentsOverrides<Theme>[typeof VIREO_TABS_NAME];
      variants?: ComponentsVariants<Theme>[typeof VIREO_TABS_NAME];
    };
  }
}
