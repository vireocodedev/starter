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
})<OwnerProps>({ flexDirection: "column", borderRadius: 8, gap: 4, minWidth: 88, maxWidth: 88, textTransform: "none" });
export const VireoLabeledIconButtonVisual: Slot<BoxProps> = styled(Box, {
  name: VIREO_LABELED_ICON_BUTTON_NAME,
  slot: "Visual",
  overridesResolver: (_p, s) => s.visual,
})<OwnerProps>({
  borderRadius: "50%",
  padding: 8,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});
export const VireoLabeledIconButtonStatusDot: Slot<BoxProps> = styled(Box, {
  name: VIREO_LABELED_ICON_BUTTON_NAME,
  slot: "StatusDot",
  overridesResolver: (_p, s) => s.statusDot,
})<OwnerProps>(({ theme }) => ({
  width: 16,
  height: 16,
  borderRadius: "50%",
  backgroundColor: theme.palette.success.main,
}));
export const VireoLabeledIconButtonLabel: Slot<TypographyProps> = styled(Typography, {
  name: VIREO_LABELED_ICON_BUTTON_NAME,
  slot: "Label",
  overridesResolver: (_p, s) => s.label,
})<OwnerProps>(({ ownerState, theme }) => ({
  fontWeight: 400,
  fontSize: "0.75rem",
  lineHeight: "1.25rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
  color: ownerState.disabled
    ? theme.palette.text.disabled
    : ownerState.selected
      ? theme.palette.text.primary
      : theme.palette.text.secondary,
}));
