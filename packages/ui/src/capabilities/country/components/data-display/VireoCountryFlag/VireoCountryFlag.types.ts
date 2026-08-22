import type { CountryCode } from "@/capabilities/country/models/countryCode.models";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps, Tooltip } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoCountryFlagClasses, type VireoCountryFlagClassKey } from "./VireoCountryFlag.classes";
import type { VIREO_COUNTRY_FLAG_NAME } from "./VireoCountryFlag.identity";

/** Known country codes retain autocomplete while arbitrary strings remain renderable as unknown flags. */
export type VireoCountryFlagCode = CountryCode | (string & {});

export type VireoCountryFlagOwnerState = {
  countryCode: string;
  enableTooltip: boolean;
  known: boolean;
  width: number | string;
};

export interface VireoCountryFlagRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoCountryFlagFlagSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoCountryFlagTooltipSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoCountryFlag}. */
export type VireoCountryFlagSlots = {
  /** @default 'span' */
  root: React.ElementType;
  /** @default country-flag-icons SVG or the Vireo unknown-flag SVG */
  flag: React.ElementType;
  /** @default Tooltip */
  tooltip: React.ElementType;
};

/** Slot props exposed by {@link VireoCountryFlag}. */
export type VireoCountryFlagSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoCountryFlagSlots,
  {
    root: SlotProps<"span", VireoCountryFlagRootSlotPropsOverrides, VireoCountryFlagOwnerState>;
    flag: SlotProps<"svg", VireoCountryFlagFlagSlotPropsOverrides, VireoCountryFlagOwnerState>;
    tooltip: SlotProps<typeof Tooltip, VireoCountryFlagTooltipSlotPropsOverrides, VireoCountryFlagOwnerState>;
  }
>;

/** Props owned by {@link VireoCountryFlag}. */
export type VireoCountryFlagOwnProps = VireoCountryFlagSlotsAndSlotProps & {
  /** Country or subdivision identifier. Unknown strings render the fallback flag. */
  countryCode: VireoCountryFlagCode;
  /** Accessible flag label and, when enabled, tooltip content. */
  label?: string;
  /** Shows a country-name tooltip. @default false */
  enableTooltip?: boolean;
  /** Rendered width. Height follows the flag's 3:2 aspect ratio. @default 24 */
  width?: number | string;
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoCountryFlagClasses>;
};

/** Props VireoCountryFlag inherits from its default root after excluding protected component-owned props. */
export type VireoCountryFlagInheritedProps = Omit<
  BoxProps<"span">,
  "aria-hidden" | "aria-label" | "children" | "component" | "dangerouslySetInnerHTML" | "role" | "title"
>;

/** Props accepted by {@link VireoCountryFlag}. */
export type VireoCountryFlagProps = VireoCountryFlagOwnProps & VireoCountryFlagInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_COUNTRY_FLAG_NAME]?: VireoThemeComponent<
      VireoCountryFlagProps,
      VireoCountryFlagClassKey,
      VireoCountryFlagOwnerState,
      Theme
    >;
  }
}
