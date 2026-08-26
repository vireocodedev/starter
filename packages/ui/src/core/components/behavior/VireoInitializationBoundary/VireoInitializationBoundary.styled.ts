import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps, CircularProgress, type CircularProgressProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_INITIALIZATION_BOUNDARY_NAME } from "./VireoInitializationBoundary.identity";
import { type VireoInitializationBoundaryOwnerState } from "./VireoInitializationBoundary.types";

type VireoInitializationBoundaryStyledSlotProps = StyledSlotProps<VireoInitializationBoundaryOwnerState>;
type VireoInitializationBoundaryStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoInitializationBoundaryOwnerState
>;

export const VireoInitializationBoundaryRoot: VireoInitializationBoundaryStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_INITIALIZATION_BOUNDARY_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoInitializationBoundaryStyledSlotProps>({ display: "contents" });

export const VireoInitializationBoundaryLoadingIndicator: VireoInitializationBoundaryStyledSlotComponent<CircularProgressProps> =
  styled(CircularProgress, {
    name: VIREO_INITIALIZATION_BOUNDARY_NAME,
    slot: "LoadingIndicator",
    overridesResolver: (_props, styles) => styles.loadingIndicator,
  })<VireoInitializationBoundaryStyledSlotProps>({});
