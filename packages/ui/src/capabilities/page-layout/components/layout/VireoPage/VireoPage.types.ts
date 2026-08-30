import type { VireoPageLayoutMode } from "@/capabilities/page-layout/types/pageLayout.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { VireoPageClasses, VireoPageClassKey } from "./VireoPage.classes";
import type { VIREO_PAGE_NAME, VireoPageSlotName } from "./VireoPage.identity";

export type VireoPageOwnerState = { mode: VireoPageLayoutMode };
export interface VireoPageRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export type VireoPageSlots = { [TSlotName in VireoPageSlotName]: React.ElementType };
export type VireoPageSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoPageSlots,
  { root: SlotProps<"div", VireoPageRootSlotPropsOverrides, VireoPageOwnerState> }
>;
export type VireoPageOwnProps = VireoPageSlotsAndSlotProps & {
  children: React.ReactNode;
  /** Controls the page-layout mode without measuring a container. */
  mode?: VireoPageLayoutMode;
  /** Resolves compact mode without measuring a container. @default false */
  forceCompact?: boolean;
  /** Measures the page's parent instead of the page root. @default false */
  measureParent?: boolean;
  /** Suspends measurement while preserving the last resolved mode. @default false */
  measurementPaused?: boolean;
  /** Inline space to subtract from the measured container width. @default 0 */
  reservedInlineSize?: number;
  classes?: Partial<VireoPageClasses>;
};
export type VireoPageInheritedProps = Omit<BoxProps<"div">, "children" | "component">;
export type VireoPageProps = VireoPageOwnProps & VireoPageInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_PAGE_NAME]?: VireoThemeComponent<VireoPageProps, VireoPageClassKey, VireoPageOwnerState, Theme>;
  }
}
