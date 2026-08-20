import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, Typography, type BoxProps, type TypographyProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FILE_IMAGE_PREVIEW_NAME } from "./VireoFileImagePreview.identity";
import { type VireoFileImagePreviewOwnerState } from "./VireoFileImagePreview.types";

type VireoFileImagePreviewStyledSlotProps = StyledSlotProps<VireoFileImagePreviewOwnerState>;
type VireoFileImagePreviewStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFileImagePreviewOwnerState
>;

export const VireoFileImagePreviewRoot: VireoFileImagePreviewStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FILE_IMAGE_PREVIEW_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFileImagePreviewStyledSlotProps>(({ theme }) => ({
  alignItems: "center",
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  justifyContent: "center",
  minHeight: 120,
  overflow: "hidden",
  width: "100%",
}));

export const VireoFileImagePreviewImage: VireoFileImagePreviewStyledSlotComponent<
  React.ImgHTMLAttributes<HTMLImageElement>
> = styled("img", {
  name: VIREO_FILE_IMAGE_PREVIEW_NAME,
  slot: "Image",
  overridesResolver: (_props, styles) => styles.image,
})<VireoFileImagePreviewStyledSlotProps>(({ ownerState }) => ({
  display: "block",
  maxHeight: 240,
  maxWidth: "100%",
  objectFit: ownerState.objectFit,
  width: "100%",
}));

export const VireoFileImagePreviewFallback: VireoFileImagePreviewStyledSlotComponent<TypographyProps> = styled(
  Typography,
  {
    name: VIREO_FILE_IMAGE_PREVIEW_NAME,
    slot: "Fallback",
    overridesResolver: (_props, styles) => styles.fallback,
  },
)<VireoFileImagePreviewStyledSlotProps>(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: theme.spacing(3),
  textAlign: "center",
}));
