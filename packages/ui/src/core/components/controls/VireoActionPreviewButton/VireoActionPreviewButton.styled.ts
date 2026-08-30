import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps, Button, type ButtonProps, Typography, type TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_ACTION_PREVIEW_BUTTON_NAME } from "./VireoActionPreviewButton.identity";
import { type VireoActionPreviewButtonOwnerState } from "./VireoActionPreviewButton.types";

type VireoActionPreviewButtonStyledSlotProps = StyledSlotProps<VireoActionPreviewButtonOwnerState>;
type VireoActionPreviewButtonStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoActionPreviewButtonOwnerState
>;

export const VireoActionPreviewButtonRoot: VireoActionPreviewButtonStyledSlotComponent<ButtonProps> = styled(Button, {
  name: VIREO_ACTION_PREVIEW_BUTTON_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoActionPreviewButtonStyledSlotProps>(({ ownerState, theme }) => ({
  alignItems: "center",
  justifyContent: ownerState.align === "center" ? "center" : "flex-start",
  minHeight: theme.spacing(7),
  paddingBlock: theme.spacing(0.875),
  textAlign: ownerState.align === "center" ? "center" : "start",
  textTransform: theme.typography.button.textTransform,
}));

export const VireoActionPreviewButtonContent: VireoActionPreviewButtonStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_ACTION_PREVIEW_BUTTON_NAME,
  slot: "Content",
  overridesResolver: (_props, styles) => styles.content,
})<VireoActionPreviewButtonStyledSlotProps>(({ ownerState }) => ({
  alignItems: ownerState.align === "center" ? "center" : "flex-start",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
}));

export const VireoActionPreviewButtonLabel: VireoActionPreviewButtonStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_ACTION_PREVIEW_BUTTON_NAME,
    slot: "Label",
    overridesResolver: (_props, styles) => styles.label,
  },
)<VireoActionPreviewButtonStyledSlotProps>(({ theme }) => ({
  ...theme.typography.button,
  color: "inherit",
}));

export const VireoActionPreviewButtonPreview: VireoActionPreviewButtonStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_ACTION_PREVIEW_BUTTON_NAME,
    slot: "Preview",
    overridesResolver: (_props, styles) => styles.preview,
  },
)<VireoActionPreviewButtonStyledSlotProps>(({ theme }) => ({
  ...theme.typography.caption,
  color: "inherit",
  opacity: 0.72,
}));
