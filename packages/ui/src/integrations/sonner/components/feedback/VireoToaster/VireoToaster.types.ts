import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { SxProps, Theme } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import type { Toaster, ToasterProps } from "sonner";
import { type VireoToasterClasses, type VireoToasterClassKey } from "./VireoToaster.classes";
import type { VIREO_TOASTER_NAME, VireoToasterSlotName } from "./VireoToaster.identity";

export type VireoToasterOwnerState = {
  mobile: boolean;
  themeMode: "light" | "dark";
  direction: NonNullable<ToasterProps["dir"]>;
  position: NonNullable<ToasterProps["position"]>;
  closeButton: boolean;
  expand: boolean;
  richColors: boolean;
};

export interface VireoToasterRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoToaster}. */
export type VireoToasterSlots = {
  [TSlotName in VireoToasterSlotName]: React.ElementType;
};

/** Slot props exposed by {@link VireoToaster}. */
export type VireoToasterSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoToasterSlots,
  {
    /** @default Sonner Toaster */
    root: SlotProps<typeof Toaster, VireoToasterRootSlotPropsOverrides, VireoToasterOwnerState>;
  }
>;

/** Props owned by {@link VireoToaster}. */
export type VireoToasterOwnProps = VireoToasterSlotsAndSlotProps & {
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoToasterClasses>;
  /** Styles applied to Sonner's generated toaster root without introducing wrapper DOM. */
  sx?: SxProps<Theme>;
};

/** Props VireoToaster inherits from its default root after excluding component-owned props. */
export type VireoToasterInheritedProps = Omit<ToasterProps, "className" | "style" | "theme"> & {
  className?: string;
  style?: React.CSSProperties;
};

/** Props accepted by {@link VireoToaster}. */
export type VireoToasterProps = VireoToasterOwnProps & VireoToasterInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_TOASTER_NAME]?: VireoThemeComponent<VireoToasterProps, VireoToasterClassKey, VireoToasterOwnerState, Theme>;
  }
}
