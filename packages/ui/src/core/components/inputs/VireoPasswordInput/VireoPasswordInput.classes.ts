import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_PASSWORD_INPUT_NAME,
  VIREO_PASSWORD_INPUT_SLOTS,
  type VireoPasswordInputSlotName,
} from "./VireoPasswordInput.identity";

/** Utility classes available to VireoPasswordInput. */
export type VireoPasswordInputClasses = Record<VireoPasswordInputSlotName, string>;

/** Valid keys for VireoPasswordInput utility classes and theme style overrides. */
export type VireoPasswordInputClassKey = keyof VireoPasswordInputClasses;

/** Returns the generated utility class name for a VireoPasswordInput slot or state. */
export function getVireoPasswordInputUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_PASSWORD_INPUT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoPasswordInput class key. */
export const vireoPasswordInputClasses: VireoPasswordInputClasses = generateUtilityClasses(VIREO_PASSWORD_INPUT_NAME, [
  ...VIREO_PASSWORD_INPUT_SLOTS,
]);
