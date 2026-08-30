import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FORM_RADIO_GROUP_FIELD_NAME,
  VIREO_FORM_RADIO_GROUP_FIELD_SLOTS,
  type VireoFormRadioGroupFieldSlotName,
} from "./VireoFormRadioGroupField.identity";

type VireoFormRadioGroupFieldStateClassKey =
  | "dirty"
  | "touched"
  | "invalid"
  | "errorVisible"
  | "validating"
  | "submitting"
  | "disabled"
  | "readOnly"
  | "row"
  | "hasValue";

/** Utility classes available to VireoFormRadioGroupField. */
export type VireoFormRadioGroupFieldClasses = Record<
  VireoFormRadioGroupFieldSlotName | VireoFormRadioGroupFieldStateClassKey,
  string
>;

/** Valid keys for VireoFormRadioGroupField utility classes and theme style overrides. */
export type VireoFormRadioGroupFieldClassKey = keyof VireoFormRadioGroupFieldClasses;

/** Returns the generated utility class name for a VireoFormRadioGroupField slot or state. */
export function getVireoFormRadioGroupFieldUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FORM_RADIO_GROUP_FIELD_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFormRadioGroupField class key. */
export const vireoFormRadioGroupFieldClasses: VireoFormRadioGroupFieldClasses = generateUtilityClasses(
  VIREO_FORM_RADIO_GROUP_FIELD_NAME,
  [
    ...VIREO_FORM_RADIO_GROUP_FIELD_SLOTS,
    "dirty",
    "touched",
    "invalid",
    "errorVisible",
    "validating",
    "submitting",
    "disabled",
    "readOnly",
    "row",
    "hasValue",
  ],
);
