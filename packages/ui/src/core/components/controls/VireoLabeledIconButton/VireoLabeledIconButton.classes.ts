import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_LABELED_ICON_BUTTON_NAME,
  VIREO_LABELED_ICON_BUTTON_SLOTS,
  type VireoLabeledIconButtonSlotName,
} from "./VireoLabeledIconButton.identity";

/** Utility classes available to VireoLabeledIconButton. */
export type VireoLabeledIconButtonClasses = Record<VireoLabeledIconButtonSlotName, string>;

/** Valid keys for VireoLabeledIconButton utility classes and theme style overrides. */
export type VireoLabeledIconButtonClassKey = keyof VireoLabeledIconButtonClasses;

/** Returns the generated utility class name for a VireoLabeledIconButton slot or state. */
export function getVireoLabeledIconButtonUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_LABELED_ICON_BUTTON_NAME, slot);
}

/** Generated utility class names keyed by each public VireoLabeledIconButton class key. */
export const vireoLabeledIconButtonClasses: VireoLabeledIconButtonClasses = generateUtilityClasses(
  VIREO_LABELED_ICON_BUTTON_NAME,
  [...VIREO_LABELED_ICON_BUTTON_SLOTS],
);
