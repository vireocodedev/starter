import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps, type SxProps, type Theme } from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_COUNTRY_FLAG_NAME } from "./VireoCountryFlag.identity";
import type { VireoCountryFlagOwnerState } from "./VireoCountryFlag.types";

type VireoCountryFlagStyledSlotProps = StyledSlotProps<VireoCountryFlagOwnerState>;
type VireoCountryFlagStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoCountryFlagOwnerState
>;
type VireoCountryFlagFlagProps = React.SVGProps<SVGSVGElement> & { sx?: SxProps<Theme> };

export const VireoCountryFlagRoot: VireoCountryFlagStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_COUNTRY_FLAG_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.known ? styles.known : styles.unknown,
    ownerState.enableTooltip && styles.tooltipEnabled,
  ],
})<VireoCountryFlagStyledSlotProps>(({ ownerState, theme }) => ({
  "--VireoCountryFlag-unknownBackground": theme.palette.action.disabledBackground,
  "--VireoCountryFlag-unknownForeground": theme.palette.text.disabled,
  display: "inline-flex",
  flexShrink: 0,
  width: ownerState.width,
  aspectRatio: "3 / 2",
  lineHeight: 0,
  overflow: "hidden",
  verticalAlign: "middle",
  borderRadius: 2,
  boxShadow: `inset 0 0 0 1px ${theme.palette.divider}`,
}));

export const VireoCountryFlagFlag: VireoCountryFlagStyledSlotComponent<VireoCountryFlagFlagProps> = styled("svg", {
  name: VIREO_COUNTRY_FLAG_NAME,
  slot: "Flag",
  overridesResolver: (_props, styles) => styles.flag,
})<VireoCountryFlagStyledSlotProps>({
  display: "block",
  width: "100%",
  height: "100%",
});
