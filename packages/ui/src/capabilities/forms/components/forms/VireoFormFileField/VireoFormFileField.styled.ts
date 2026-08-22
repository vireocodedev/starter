import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import {
  Box,
  Button,
  FormHelperText,
  IconButton,
  Typography,
  type BoxProps,
  type ButtonProps,
  type FormHelperTextProps,
  type IconButtonProps,
  type TypographyProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_FORM_FILE_FIELD_NAME } from "./VireoFormFileField.identity";
import { type VireoFormFileFieldOwnerState } from "./VireoFormFileField.types";

type OwnerProps = StyledSlotProps<VireoFormFileFieldOwnerState>;
type Slot<TProps extends object> = StyledSlotComponent<TProps, VireoFormFileFieldOwnerState>;

export const VireoFormFileFieldRoot: Slot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.empty && styles.empty,
    ownerState.populated && styles.populated,
    ownerState.dragActive && styles.dragActive,
    ownerState.dragReject && styles.dragReject,
    ownerState.rejected && styles.rejected,
    ownerState.invalid && styles.invalid,
    ownerState.disabled && styles.disabled,
    ownerState.readOnly && styles.readOnly,
  ],
})<OwnerProps>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${
    ownerState.rejected || ownerState.invalid
      ? theme.palette.error.main
      : ownerState.dragActive
        ? theme.palette.primary.main
        : theme.palette.divider
  }`,
  borderRadius: theme.shape.borderRadius,
  containerName: "vireo-file-field",
  containerType: "inline-size",
  minWidth: 0,
  padding: theme.spacing(1.5),
  position: "relative",
  transition: theme.transitions.create(["background-color", "border-color"]),
  ...(ownerState.dragActive && { backgroundColor: theme.palette.action.hover }),
  ...(ownerState.dragReject && { borderColor: theme.palette.error.main }),
  ...(ownerState.disabled && { opacity: theme.palette.action.disabledOpacity }),
}));

export const VireoFormFileFieldSelection: Slot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "Selection",
  overridesResolver: (_props, styles) => styles.selection,
})<OwnerProps>(({ theme }) => ({
  alignItems: "center",
  display: "grid",
  gap: theme.spacing(1),
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  minWidth: 0,
  "@container vireo-file-field (max-width: 29.999rem)": { gridTemplateColumns: "minmax(0, 1fr) auto" },
}));

export const VireoFormFileFieldInput: Slot<
  React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
> = styled("input", {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "Input",
  overridesResolver: (_props, styles) => styles.input,
})<OwnerProps>({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

export const VireoFormFileFieldSelectButton: Slot<ButtonProps> = styled(Button, {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "SelectButton",
  overridesResolver: (_props, styles) => styles.selectButton,
})<OwnerProps>({
  whiteSpace: "nowrap",
  "@container vireo-file-field (max-width: 29.999rem)": { gridColumn: "1 / -1", width: "100%" },
});

export const VireoFormFileFieldMetadata: Slot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "Metadata",
  overridesResolver: (_props, styles) => styles.metadata,
})<OwnerProps>(({ theme }) => ({ alignItems: "baseline", display: "flex", gap: theme.spacing(0.75), minWidth: 0 }));

export const VireoFormFileFieldFileName: Slot<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "FileName",
  overridesResolver: (_props, styles) => styles.fileName,
})<OwnerProps>({ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });

export const VireoFormFileFieldFileSize: Slot<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "FileSize",
  overridesResolver: (_props, styles) => styles.fileSize,
})<OwnerProps>(({ theme }) => ({ color: theme.palette.text.secondary, flexShrink: 0, whiteSpace: "nowrap" }));

export const VireoFormFileFieldClearButton: Slot<IconButtonProps> = styled(IconButton, {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "ClearButton",
  overridesResolver: (_props, styles) => styles.clearButton,
})<OwnerProps>({ flexShrink: 0 });

export const VireoFormFileFieldDropOverlay: Slot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "DropOverlay",
  overridesResolver: (_props, styles) => styles.dropOverlay,
})<OwnerProps>(({ theme, ownerState }) => ({
  alignItems: "center",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "inherit",
  color: ownerState.dragReject ? theme.palette.error.main : theme.palette.primary.main,
  display: "flex",
  fontWeight: theme.typography.fontWeightMedium,
  inset: 0,
  justifyContent: "center",
  padding: theme.spacing(2),
  pointerEvents: "none",
  position: "absolute",
  textAlign: "center",
  zIndex: 1,
}));

export const VireoFormFileFieldPreviewContainer: Slot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "PreviewContainer",
  overridesResolver: (_props, styles) => styles.previewContainer,
})<OwnerProps>(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(1.5),
  paddingTop: theme.spacing(1.5),
}));

export const VireoFormFileFieldHelperText: Slot<FormHelperTextProps> = styled(FormHelperText, {
  name: VIREO_FORM_FILE_FIELD_NAME,
  slot: "HelperText",
  overridesResolver: (_props, styles) => styles.helperText,
})<OwnerProps>(({ theme }) => ({ margin: theme.spacing(1, 0, 0) }));
