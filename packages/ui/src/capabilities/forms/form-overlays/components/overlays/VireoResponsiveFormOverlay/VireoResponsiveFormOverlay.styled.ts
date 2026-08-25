import {
  VireoOverlayHeader,
  type VireoOverlayHeaderProps,
  VireoResponsiveOverlayFrame,
  type VireoResponsiveOverlayFrameProps,
} from "@/capabilities/overlays/public";
import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  Box,
  type BoxProps,
  DialogActions,
  DialogContent,
  type DialogActionsProps,
  type DialogContentProps,
} from "@mui/material";
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

export const VireoResponsiveFormOverlayHeader: VireoResponsiveFormOverlayStyledSlotComponent<
  VireoOverlayHeaderProps & React.RefAttributes<HTMLElement>
> = styled(VireoOverlayHeader, {
  name: VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
  slot: "Header",
  overridesResolver: (_props, styles) => styles.header,
})<VireoResponsiveFormOverlayStyledSlotProps>(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    paddingInline: theme.spacing(3),
  },
}));

export const VireoResponsiveFormOverlayBody: VireoResponsiveFormOverlayStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
  slot: "Body",
  overridesResolver: (_props, styles) => styles.body,
})<VireoResponsiveFormOverlayStyledSlotProps>(({ ownerState }) => ({
  containerName: "vireo-responsive-form-overlay-body",
  containerType: "inline-size",
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  minHeight: 0,
  minWidth: 0,
  overflow: "hidden",
  ...(ownerState.hasFormWrapper && {
    "& > *": {
      display: "flex",
      flex: "1 1 auto",
      flexDirection: "column",
      gap: 0,
      margin: 0,
      marginInline: 0,
      maxHeight: "100%",
      maxWidth: "none",
      minHeight: 0,
      minWidth: 0,
      overflow: "hidden",
      width: "100%",
    },
  }),
}));

export const VireoResponsiveFormOverlayFormRegions = styled(Box)({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  gap: 0,
  minHeight: 0,
  minWidth: 0,
  overflow: "hidden",
  width: "100%",
});

export const VireoResponsiveFormOverlayContent: VireoResponsiveFormOverlayStyledSlotComponent<DialogContentProps> =
  styled(DialogContent, {
    name: VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
    slot: "Content",
    overridesResolver: (_props, styles) => styles.content,
  })<VireoResponsiveFormOverlayStyledSlotProps>(({ theme }) => ({
    backgroundColor: `var(--mui-palette-surface-sunken, ${theme.palette.background.default})`,
    flex: "1 1 auto",
    minHeight: 0,
    minWidth: 0,
    overflowY: "auto",
    padding: theme.spacing(2),
    "@container vireo-responsive-form-overlay-body (min-width: 30rem)": {
      padding: theme.spacing(3),
    },
  }));

export const VireoResponsiveFormOverlayActions: VireoResponsiveFormOverlayStyledSlotComponent<DialogActionsProps> =
  styled(DialogActions, {
    name: VIREO_RESPONSIVE_FORM_OVERLAY_NAME,
    slot: "Actions",
    overridesResolver: (_props, styles) => styles.actions,
  })<VireoResponsiveFormOverlayStyledSlotProps>(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    flex: "0 0 auto",
    justifyContent: "flex-end",
    padding: theme.spacing(2),
    paddingBottom: `calc(${theme.spacing(2)} + env(safe-area-inset-bottom, 0px))`,
    "@container vireo-responsive-form-overlay-body (min-width: 30rem)": {
      paddingInline: theme.spacing(3),
    },
  }));
