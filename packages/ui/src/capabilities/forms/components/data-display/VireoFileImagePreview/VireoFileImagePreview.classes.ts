import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_FILE_IMAGE_PREVIEW_NAME,
  VIREO_FILE_IMAGE_PREVIEW_SLOTS,
  type VireoFileImagePreviewSlotName,
} from "./VireoFileImagePreview.identity";

/** Utility classes available to VireoFileImagePreview. */
export type VireoFileImagePreviewClasses = Record<VireoFileImagePreviewSlotName | "unavailable", string>;

/** Valid keys for VireoFileImagePreview utility classes and theme style overrides. */
export type VireoFileImagePreviewClassKey = keyof VireoFileImagePreviewClasses;

/** Returns the generated utility class name for a VireoFileImagePreview slot or state. */
export function getVireoFileImagePreviewUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_FILE_IMAGE_PREVIEW_NAME, slot);
}

/** Generated utility class names keyed by each public VireoFileImagePreview class key. */
export const vireoFileImagePreviewClasses: VireoFileImagePreviewClasses = generateUtilityClasses(
  VIREO_FILE_IMAGE_PREVIEW_NAME,
  [...VIREO_FILE_IMAGE_PREVIEW_SLOTS, "unavailable"],
);
