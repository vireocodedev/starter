import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_RESPONSIVE_OVERLAY_FRAME_NAME } from "./VireoResponsiveOverlayFrame.identity";
import { type VireoResponsiveOverlayFrameOwnerState } from "./VireoResponsiveOverlayFrame.types";

type VireoResponsiveOverlayFrameStyledSlotProps = StyledSlotProps<VireoResponsiveOverlayFrameOwnerState>;
type VireoResponsiveOverlayFrameStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoResponsiveOverlayFrameOwnerState
>;

export const VireoResponsiveOverlayFrameRoot: VireoResponsiveOverlayFrameStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_RESPONSIVE_OVERLAY_FRAME_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoResponsiveOverlayFrameStyledSlotProps>({ display: "contents" });
