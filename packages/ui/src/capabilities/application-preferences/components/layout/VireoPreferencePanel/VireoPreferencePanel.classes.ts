import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_PREFERENCE_PANEL_NAME,
  VIREO_PREFERENCE_PANEL_SLOTS,
  type VireoPreferencePanelSlotName,
} from "./VireoPreferencePanel.identity";

/** Utility classes available to VireoPreferencePanel. */
export type VireoPreferencePanelClasses = Record<VireoPreferencePanelSlotName, string>;

/** Valid keys for VireoPreferencePanel utility classes and theme style overrides. */
export type VireoPreferencePanelClassKey = keyof VireoPreferencePanelClasses;

/** Returns the generated utility class name for a VireoPreferencePanel slot or state. */
export function getVireoPreferencePanelUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_PREFERENCE_PANEL_NAME, slot);
}

/** Generated utility class names keyed by each public VireoPreferencePanel class key. */
export const vireoPreferencePanelClasses: VireoPreferencePanelClasses = generateUtilityClasses(
  VIREO_PREFERENCE_PANEL_NAME,
  [...VIREO_PREFERENCE_PANEL_SLOTS],
);
