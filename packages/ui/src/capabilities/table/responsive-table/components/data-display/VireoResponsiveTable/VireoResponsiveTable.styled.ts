import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_RESPONSIVE_TABLE_NAME } from "./VireoResponsiveTable.identity";
import { type VireoResponsiveTableOwnerState } from "./VireoResponsiveTable.types";

type VireoResponsiveTableStyledSlotProps = StyledSlotProps<VireoResponsiveTableOwnerState>;
type VireoResponsiveTableStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoResponsiveTableOwnerState
>;

export const VireoResponsiveTableRoot: VireoResponsiveTableStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_RESPONSIVE_TABLE_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoResponsiveTableStyledSlotProps>({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  minWidth: 0,
  width: "100%",
});
