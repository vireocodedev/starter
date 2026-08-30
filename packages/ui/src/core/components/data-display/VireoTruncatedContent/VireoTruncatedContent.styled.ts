import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, Button, type BoxProps, type ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_TRUNCATED_CONTENT_NAME } from "./VireoTruncatedContent.identity";
import { type VireoTruncatedContentOwnerState } from "./VireoTruncatedContent.types";

type VireoTruncatedContentStyledSlotProps = StyledSlotProps<VireoTruncatedContentOwnerState>;
type VireoTruncatedContentStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoTruncatedContentOwnerState
>;

export const VireoTruncatedContentRoot: VireoTruncatedContentStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_TRUNCATED_CONTENT_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoTruncatedContentStyledSlotProps>({ minWidth: 0, position: "relative" });

export const VireoTruncatedContentViewport: VireoTruncatedContentStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_TRUNCATED_CONTENT_NAME,
  slot: "Viewport",
  overridesResolver: (_props, styles) => styles.viewport,
})<VireoTruncatedContentStyledSlotProps>(({ ownerState }) => ({
  maxHeight: ownerState.expanded ? "none" : ownerState.collapsedHeight,
  minWidth: 0,
  overflow: ownerState.expanded ? "visible" : "hidden",
}));

export const VireoTruncatedContentContent: VireoTruncatedContentStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_TRUNCATED_CONTENT_NAME,
  slot: "Content",
  overridesResolver: (_props, styles) => styles.content,
})<VireoTruncatedContentStyledSlotProps>({ minWidth: 0 });

export const VireoTruncatedContentToggle: VireoTruncatedContentStyledSlotComponent<ButtonProps> = styled(Button, {
  name: VIREO_TRUNCATED_CONTENT_NAME,
  slot: "Toggle",
  overridesResolver: (_props, styles) => styles.toggle,
})<VireoTruncatedContentStyledSlotProps>(({ ownerState }) => ({
  minWidth: 24,
  minHeight: 24,
  padding: 0,
  fontSize: "0.75rem",
  lineHeight: 1.5,
  textTransform: "none",
  ...(ownerState.expanded
    ? { display: "flex", marginLeft: "auto", marginTop: 2 }
    : {
        position: "absolute",
        right: 0,
        bottom: 0,
        paddingInline: 4,
        backgroundColor: "var(--mui-palette-surface-base)",
      }),
}));
