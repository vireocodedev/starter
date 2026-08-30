import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps, Button, type ButtonProps, Typography, type TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_LABELED_ICON_BUTTON_NAME } from "./VireoLabeledIconButton.identity";
import { type VireoLabeledIconButtonOwnerState } from "./VireoLabeledIconButton.types";

type OwnerProps = StyledSlotProps<VireoLabeledIconButtonOwnerState>;
type Slot<T extends object> = StyledSlotComponent<T, VireoLabeledIconButtonOwnerState>;

export const VireoLabeledIconButtonRoot: Slot<ButtonProps> = styled(Button, {
  name: VIREO_LABELED_ICON_BUTTON_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<OwnerProps>(({ theme }) => ({
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius,
  gap: theme.spacing(0.5),
  minWidth: theme.spacing(11),
  maxWidth: theme.spacing(11),
  textTransform: theme.typography.button.textTransform,
}));
export const VireoLabeledIconButtonVisual: Slot<BoxProps> = styled(Box, {
  name: VIREO_LABELED_ICON_BUTTON_NAME,
  slot: "Visual",
  overridesResolver: (_p, s) => s.visual,
})<OwnerProps>(({ theme }) => ({
  borderRadius: "50%",
  padding: theme.spacing(1),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
}));
export const VireoLabeledIconButtonStatusDot: Slot<BoxProps> = styled(Box, {
  name: VIREO_LABELED_ICON_BUTTON_NAME,
  slot: "StatusDot",
  overridesResolver: (_p, s) => s.statusDot,
})<OwnerProps>(({ theme }) => ({
  width: theme.spacing(2),
  height: theme.spacing(2),
  borderRadius: "50%",
  backgroundColor: theme.palette.success.main,
}));
export const VireoLabeledIconButtonLabel: Slot<TypographyProps> = styled(Typography, {
  name: VIREO_LABELED_ICON_BUTTON_NAME,
  slot: "Label",
  overridesResolver: (_p, s) => s.label,
})<OwnerProps>(({ ownerState, theme }) => ({
  ...theme.typography.caption,
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
  color: ownerState.disabled
    ? theme.palette.text.disabled
    : ownerState.selected
      ? theme.palette.text.primary
      : theme.palette.text.secondary,
}));
