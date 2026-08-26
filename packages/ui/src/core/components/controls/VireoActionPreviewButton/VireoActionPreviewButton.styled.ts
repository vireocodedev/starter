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
})<VireoActionPreviewButtonStyledSlotProps>(({ ownerState }) => ({
  alignItems: "center",
  justifyContent: ownerState.align === "center" ? "center" : "flex-start",
  minHeight: 56,
  paddingBlock: 7,
  textAlign: ownerState.align === "center" ? "center" : "start",
  textTransform: "none",
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
)<VireoActionPreviewButtonStyledSlotProps>({
  color: "inherit",
  fontSize: "0.875rem",
  fontWeight: 750,
  lineHeight: 1.25,
});

export const VireoActionPreviewButtonPreview: VireoActionPreviewButtonStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_ACTION_PREVIEW_BUTTON_NAME,
    slot: "Preview",
    overridesResolver: (_props, styles) => styles.preview,
  },
)<VireoActionPreviewButtonStyledSlotProps>({
  color: "inherit",
  fontSize: "0.75rem",
  fontWeight: 500,
  lineHeight: 1.3,
  opacity: 0.72,
});
