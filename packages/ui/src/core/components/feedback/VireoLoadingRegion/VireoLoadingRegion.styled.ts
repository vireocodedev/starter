import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_LOADING_REGION_NAME } from "./VireoLoadingRegion.identity";
import { type VireoLoadingRegionOwnerState } from "./VireoLoadingRegion.types";

type VireoLoadingRegionStyledSlotProps = StyledSlotProps<VireoLoadingRegionOwnerState>;
type VireoLoadingRegionStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoLoadingRegionOwnerState
>;

export const VireoLoadingRegionRoot: VireoLoadingRegionStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_LOADING_REGION_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoLoadingRegionStyledSlotProps>({ minWidth: 0 });

export const VireoLoadingRegionStatus: VireoLoadingRegionStyledSlotComponent<BoxProps<"span">> = styled(Box, {
  name: VIREO_LOADING_REGION_NAME,
  slot: "Status",
  overridesResolver: (_props, styles) => styles.status,
})<VireoLoadingRegionStyledSlotProps>({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
});
