import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Close } from "@mui/icons-material";
import {
  Box,
  type BoxProps,
  IconButton,
  type IconButtonProps,
  type SvgIconProps,
  Typography,
  type TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_OVERLAY_HEADER_NAME } from "./VireoOverlayHeader.identity";
import { type VireoOverlayHeaderOwnerState } from "./VireoOverlayHeader.types";

type VireoOverlayHeaderStyledSlotProps = StyledSlotProps<VireoOverlayHeaderOwnerState>;
type VireoOverlayHeaderStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoOverlayHeaderOwnerState
>;

export const VireoOverlayHeaderRoot: VireoOverlayHeaderStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_OVERLAY_HEADER_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoOverlayHeaderStyledSlotProps>(({ ownerState, theme }) => ({
  boxSizing: "border-box",
  width: "100%",
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 2, 1.5, 3),
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  ...(ownerState.sticky && {
    position: "sticky",
    top: 0,
    zIndex: 1,
  }),
}));

export const VireoOverlayHeaderLeadingAction: VireoOverlayHeaderStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_OVERLAY_HEADER_NAME,
  slot: "LeadingAction",
  overridesResolver: (_props, styles) => styles.leadingAction,
})<VireoOverlayHeaderStyledSlotProps>({
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
});

export const VireoOverlayHeaderTitle: VireoOverlayHeaderStyledSlotComponent<TypographyProps> = styled(Typography, {
  name: VIREO_OVERLAY_HEADER_NAME,
  slot: "Title",
  overridesResolver: (_props, styles) => styles.title,
})<VireoOverlayHeaderStyledSlotProps>(({ theme }) => ({
  minWidth: 0,
  flex: "1 1 auto",
  color: theme.palette.text.primary,
  overflowWrap: "anywhere",
}));

export const VireoOverlayHeaderActions: VireoOverlayHeaderStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_OVERLAY_HEADER_NAME,
  slot: "Actions",
  overridesResolver: (_props, styles) => styles.actions,
})<VireoOverlayHeaderStyledSlotProps>(({ theme }) => ({
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const VireoOverlayHeaderCloseButton: VireoOverlayHeaderStyledSlotComponent<IconButtonProps> = styled(
  IconButton,
  {
    name: VIREO_OVERLAY_HEADER_NAME,
    slot: "CloseButton",
    overridesResolver: (_props, styles) => styles.closeButton,
  },
)<VireoOverlayHeaderStyledSlotProps>(({ theme }) => ({
  flex: "0 0 auto",
  color: theme.palette.action.active,
}));

export const VireoOverlayHeaderCloseIcon: VireoOverlayHeaderStyledSlotComponent<SvgIconProps> = styled(Close, {
  name: VIREO_OVERLAY_HEADER_NAME,
  slot: "CloseIcon",
  overridesResolver: (_props, styles) => styles.closeIcon,
})<VireoOverlayHeaderStyledSlotProps>({});
