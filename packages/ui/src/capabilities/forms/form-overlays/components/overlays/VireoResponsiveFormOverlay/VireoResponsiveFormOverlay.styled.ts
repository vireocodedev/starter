import { VireoResponsiveOverlayFrame, type VireoResponsiveOverlayFrameProps } from "@/capabilities/overlays/public";
import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { DialogActions, DialogContent, type DialogActionsProps, type DialogContentProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_RESPONSIVE_FORM_OVERLAY_NAME } from "./VireoResponsiveFormOverlay.identity";
import { type VireoResponsiveFormOverlayOwnerState } from "./VireoResponsiveFormOverlay.types";

type VireoResponsiveFormOverlayStyledSlotProps = StyledSlotProps<VireoResponsiveFormOverlayOwnerState>;
type VireoResponsiveFormOverlayStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoResponsiveFormOverlayOwnerState
>;

export const VireoResponsiveFormOverlayRoot: VireoResponsiveFormOverlayStyledSlotComponent<
  VireoResponsiveOverlayFrameProps & React.RefAttributes<HTMLDivElement>
> = styled(VireoResponsiveOverlayFrame, {
  name: VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoResponsiveFormOverlayStyledSlotProps>({});

export const VireoResponsiveFormOverlayContent: VireoResponsiveFormOverlayStyledSlotComponent<DialogContentProps> =
  styled(DialogContent, {
    name: VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
    slot: "Content",
    overridesResolver: (_props, styles) => styles.content,
  })<VireoResponsiveFormOverlayStyledSlotProps>({ minWidth: 0 });

export const VireoResponsiveFormOverlayActions: VireoResponsiveFormOverlayStyledSlotComponent<DialogActionsProps> =
  styled(DialogActions, {
    name: VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
    slot: "Actions",
    overridesResolver: (_props, styles) => styles.actions,
  })<VireoResponsiveFormOverlayStyledSlotProps>({});
