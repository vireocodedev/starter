import { generateUtilityClass, generateUtilityClasses } from "@mui/material";
import {
  VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME,
  VIREO_SIDE_PANEL_RESIZE_HANDLE_SLOTS,
  type VireoSidePanelResizeHandleSlotName,
} from "./VireoSidePanelResizeHandle.identity";

/** Utility classes available to VireoSidePanelResizeHandle. */
export type VireoSidePanelResizeHandleClasses = Record<VireoSidePanelResizeHandleSlotName | "resizing", string>;

/** Valid keys for VireoSidePanelResizeHandle utility classes and theme style overrides. */
export type VireoSidePanelResizeHandleClassKey = keyof VireoSidePanelResizeHandleClasses;

/** Returns the generated utility class name for a VireoSidePanelResizeHandle slot or state. */
export function getVireoSidePanelResizeHandleUtilityClass(slot: string): string {
  return generateUtilityClass(VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME, slot);
}

/** Generated utility class names keyed by each public VireoSidePanelResizeHandle class key. */
export const vireoSidePanelResizeHandleClasses: VireoSidePanelResizeHandleClasses = generateUtilityClasses(
  VIREO_SIDE_PANEL_RESIZE_HANDLE_NAME,
  [...VIREO_SIDE_PANEL_RESIZE_HANDLE_SLOTS, "resizing"],
);
