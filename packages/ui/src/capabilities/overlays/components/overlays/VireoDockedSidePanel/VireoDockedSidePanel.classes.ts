import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_DOCKED_SIDE_PANEL_NAME,
  VIREO_DOCKED_SIDE_PANEL_SLOTS,
  type VireoDockedSidePanelSlotName,
} from "./VireoDockedSidePanel.identity";

/** Utility classes available to VireoDockedSidePanel. */
export type VireoDockedSidePanelClasses = Record<VireoDockedSidePanelSlotName, string>;

/** Valid keys for VireoDockedSidePanel utility classes and theme style overrides. */
export type VireoDockedSidePanelClassKey = keyof VireoDockedSidePanelClasses;

/** Returns the generated utility class name for a VireoDockedSidePanel slot or state. */
export function getVireoDockedSidePanelUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_DOCKED_SIDE_PANEL_NAME, slot);
}

/** Generated utility class names keyed by each public VireoDockedSidePanel class key. */
export const vireoDockedSidePanelClasses: VireoDockedSidePanelClasses = generateUtilityClasses(
  VIREO_DOCKED_SIDE_PANEL_NAME,
  [...VIREO_DOCKED_SIDE_PANEL_SLOTS],
);
