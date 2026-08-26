import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_ACTION_PREVIEW_BUTTON_NAME,
  VIREO_ACTION_PREVIEW_BUTTON_SLOTS,
  type VireoActionPreviewButtonSlotName,
} from "./VireoActionPreviewButton.identity";

/** Utility classes available to VireoActionPreviewButton. */
export type VireoActionPreviewButtonClasses = Record<VireoActionPreviewButtonSlotName, string>;

/** Valid keys for VireoActionPreviewButton utility classes and theme style overrides. */
export type VireoActionPreviewButtonClassKey = keyof VireoActionPreviewButtonClasses;

/** Returns the generated utility class name for a VireoActionPreviewButton slot or state. */
export function getVireoActionPreviewButtonUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_ACTION_PREVIEW_BUTTON_NAME, slot);
}

/** Generated utility class names keyed by each public VireoActionPreviewButton class key. */
export const vireoActionPreviewButtonClasses: VireoActionPreviewButtonClasses = generateUtilityClasses(
  VIREO_ACTION_PREVIEW_BUTTON_NAME,
  [...VIREO_ACTION_PREVIEW_BUTTON_SLOTS],
);
