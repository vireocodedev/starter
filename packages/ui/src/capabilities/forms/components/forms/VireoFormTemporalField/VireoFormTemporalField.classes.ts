import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_TEMPORAL_FIELD_NAME,
  VIREO_FORM_TEMPORAL_FIELD_SLOTS,
  type VireoFormTemporalFieldSlotName,
} from "./VireoFormTemporalField.identity";

/** Utility classes available to VireoFormTemporalField. */
export type VireoFormTemporalFieldClasses = Record<
  | VireoFormTemporalFieldSlotName
  | "dirty"
  | "touched"
  | "invalid"
  | "errorVisible"
  | "validating"
  | "submitting"
  | "disabled"
  | "readOnly"
  | "hasValue",
  string
>;

/** Valid keys for VireoFormTemporalField utility classes and theme style overrides. */
export type VireoFormTemporalFieldClassKey = keyof VireoFormTemporalFieldClasses;

/** Returns the generated utility class name for a VireoFormTemporalField slot or state. */
export function getVireoFormTemporalFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_TEMPORAL_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormTemporalField class key. */
export const vireoFormTemporalFieldClasses: VireoFormTemporalFieldClasses = generateUtilityClasses(
  VIREO_FORM_TEMPORAL_FIELD_NAME,
  [
    ...VIREO_FORM_TEMPORAL_FIELD_SLOTS,
    "dirty",
    "touched",
    "invalid",
    "errorVisible",
    "validating",
    "submitting",
    "disabled",
    "readOnly",
    "hasValue",
  ],
);
