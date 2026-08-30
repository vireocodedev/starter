import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { ContentCopy } from "@mui/icons-material";
import { Box, type BoxProps, IconButton, type IconButtonProps, type SvgIconProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_JSON_VIEWER_NAME } from "./VireoJsonViewer.identity";
import { type VireoJsonViewerOwnerState } from "./VireoJsonViewer.types";

type VireoJsonViewerStyledSlotProps = StyledSlotProps<VireoJsonViewerOwnerState>;
type VireoJsonViewerStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoJsonViewerOwnerState>;

export const VireoJsonViewerRoot: VireoJsonViewerStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_JSON_VIEWER_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoJsonViewerStyledSlotProps>(({ theme }) => ({
  position: "relative",
  width: "100%",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

export const VireoJsonViewerToolbar: VireoJsonViewerStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_JSON_VIEWER_NAME,
  slot: "Toolbar",
  overridesResolver: (_props, styles) => styles.toolbar,
})<VireoJsonViewerStyledSlotProps>(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(0.5),
  right: theme.spacing(0.5),
  zIndex: 1,
  display: "flex",
  gap: theme.spacing(0.5),
}));

export const VireoJsonViewerCopyButton: VireoJsonViewerStyledSlotComponent<IconButtonProps> = styled(IconButton, {
  name: VIREO_JSON_VIEWER_NAME,
  slot: "CopyButton",
  overridesResolver: (_props, styles) => styles.copyButton,
})<VireoJsonViewerStyledSlotProps>({});

export const VireoJsonViewerCopyIcon: VireoJsonViewerStyledSlotComponent<SvgIconProps> = styled(ContentCopy, {
  name: VIREO_JSON_VIEWER_NAME,
  slot: "CopyIcon",
  overridesResolver: (_props, styles) => styles.copyIcon,
})<VireoJsonViewerStyledSlotProps>({
  fontSize: 16,
});

export const VireoJsonViewerStatus: VireoJsonViewerStyledSlotComponent<BoxProps<"span">> = styled(Box, {
  name: VIREO_JSON_VIEWER_NAME,
  slot: "Status",
  overridesResolver: (_props, styles) => styles.status,
})<VireoJsonViewerStyledSlotProps>({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
});

export const VireoJsonViewerContent: VireoJsonViewerStyledSlotComponent<React.ComponentPropsWithoutRef<"pre">> = styled(
  "pre",
  {
    name: VIREO_JSON_VIEWER_NAME,
    slot: "Content",
    overridesResolver: (_props, styles) => styles.content,
  },
)<VireoJsonViewerStyledSlotProps>(({ ownerState, theme }) => ({
  boxSizing: "border-box",
  maxHeight: ownerState.maxHeight,
  margin: 0,
  padding: theme.spacing(1, 6, 1, 1.5),
  overflow: "auto",
  color: theme.palette.text.primary,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: "0.8125rem",
  lineHeight: 1.4,
  whiteSpace: "pre",
  wordBreak: "normal",
}));
