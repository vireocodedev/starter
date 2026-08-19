import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_TOGGLE_BUTTON_GROUP_NAME,
  VIREO_TOGGLE_BUTTON_GROUP_SLOTS,
  type VireoToggleButtonGroupSlotName,
} from "./VireoToggleButtonGroup.identity";

/** Utility classes available to VireoToggleButtonGroup. */
export type VireoToggleButtonGroupClasses = Record<VireoToggleButtonGroupSlotName, string>;

/** Valid keys for VireoToggleButtonGroup utility classes and theme style overrides. */
export type VireoToggleButtonGroupClassKey = keyof VireoToggleButtonGroupClasses;

/** Returns the generated utility class name for a VireoToggleButtonGroup slot or state. */
export function getVireoToggleButtonGroupUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_TOGGLE_BUTTON_GROUP_NAME, slot);
}

/** Generated utility class names keyed by each public VireoToggleButtonGroup class key. */
export const vireoToggleButtonGroupClasses: VireoToggleButtonGroupClasses = generateUtilityClasses(
  VIREO_TOGGLE_BUTTON_GROUP_NAME,
  [...VIREO_TOGGLE_BUTTON_GROUP_SLOTS],
);
