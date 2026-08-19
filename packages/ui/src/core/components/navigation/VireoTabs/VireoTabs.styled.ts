import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, Tab, Tabs, type BoxProps, type TabProps, type TabsProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_TABS_NAME } from "./VireoTabs.identity";
import type { VireoTabsOwnerState } from "./VireoTabs.types";

type Owner = StyledSlotProps<VireoTabsOwnerState>;

export const VireoTabsRoot: StyledSlotComponent<BoxProps, VireoTabsOwnerState> = styled(Box, {
  name: VIREO_TABS_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<Owner>({ minWidth: 0 });
export const VireoTabsList: StyledSlotComponent<TabsProps, VireoTabsOwnerState> = styled(Tabs, {
  name: VIREO_TABS_NAME,
  slot: "Tabs",
  overridesResolver: (_p, s) => s.tabs,
})<Owner>({ marginBottom: 24 });
export const VireoTabsTab: StyledSlotComponent<TabProps, VireoTabsOwnerState> = styled(Tab, {
  name: VIREO_TABS_NAME,
  slot: "Tab",
  overridesResolver: (_p, s) => s.tab,
})<Owner>({ minWidth: 0 });
export const VireoTabsPanel: StyledSlotComponent<BoxProps, VireoTabsOwnerState> = styled(Box, {
  name: VIREO_TABS_NAME,
  slot: "Panel",
  overridesResolver: (_p, s) => s.panel,
})<Owner>({ minWidth: 0 });
