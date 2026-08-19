import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_JSON_VIEWER_NAME,
  VIREO_JSON_VIEWER_SLOTS,
  type VireoJsonViewerSlotName,
} from "./VireoJsonViewer.identity";

/** Utility classes available to VireoJsonViewer. */
export type VireoJsonViewerClasses = Record<VireoJsonViewerSlotName, string>;

/** Valid keys for VireoJsonViewer utility classes and theme style overrides. */
export type VireoJsonViewerClassKey = keyof VireoJsonViewerClasses;

/** Returns the generated utility class name for a VireoJsonViewer slot or state. */
export function getVireoJsonViewerUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_JSON_VIEWER_NAME, slot);
}

/** Generated utility class names keyed by each public VireoJsonViewer class key. */
export const vireoJsonViewerClasses: VireoJsonViewerClasses = generateUtilityClasses(VIREO_JSON_VIEWER_NAME, [
  ...VIREO_JSON_VIEWER_SLOTS,
]);
