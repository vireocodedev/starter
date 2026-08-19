import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_TRUNCATED_CONTENT_NAME,
  VIREO_TRUNCATED_CONTENT_SLOTS,
  type VireoTruncatedContentSlotName,
} from "./VireoTruncatedContent.identity";

/** Utility classes available to VireoTruncatedContent. */
export type VireoTruncatedContentClasses = Record<VireoTruncatedContentSlotName, string>;

/** Valid keys for VireoTruncatedContent utility classes and theme style overrides. */
export type VireoTruncatedContentClassKey = keyof VireoTruncatedContentClasses;

/** Returns the generated utility class name for a VireoTruncatedContent slot or state. */
export function getVireoTruncatedContentUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_TRUNCATED_CONTENT_NAME, slot);
}

/** Generated utility class names keyed by each public VireoTruncatedContent class key. */
export const vireoTruncatedContentClasses: VireoTruncatedContentClasses = generateUtilityClasses(
  VIREO_TRUNCATED_CONTENT_NAME,
  [...VIREO_TRUNCATED_CONTENT_SLOTS],
);
