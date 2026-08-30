import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_READ_ONLY_VALUE_NAME,
  VIREO_FORM_READ_ONLY_VALUE_SLOTS,
  type VireoFormReadOnlyValueSlotName,
} from "./VireoFormReadOnlyValue.identity";

/** Utility classes available to VireoFormReadOnlyValue. */
export type VireoFormReadOnlyValueClasses = Record<VireoFormReadOnlyValueSlotName | "empty" | "hasLabel", string>;

/** Valid keys for VireoFormReadOnlyValue utility classes and theme style overrides. */
export type VireoFormReadOnlyValueClassKey = keyof VireoFormReadOnlyValueClasses;

/** Returns the generated utility class name for a VireoFormReadOnlyValue slot or state. */
export function getVireoFormReadOnlyValueUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_READ_ONLY_VALUE_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormReadOnlyValue class key. */
export const vireoFormReadOnlyValueClasses: VireoFormReadOnlyValueClasses = generateUtilityClasses(
  VIREO_FORM_READ_ONLY_VALUE_NAME,
  [...VIREO_FORM_READ_ONLY_VALUE_SLOTS, "empty", "hasLabel"],
);
