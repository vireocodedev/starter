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
import { VIREO_FORM_FILE_LIST_FIELD_NAME } from "./VireoFormFileListField.identity";
import type {
  VireoFormFileListFieldOwnerState,
  VireoFormFileListFieldRejectionOwnerState,
  VireoFormFileListFieldRowOwnerState,
} from "./VireoFormFileListField.types";

type OwnerProps = StyledSlotProps<VireoFormFileListFieldOwnerState>;
type OwnerSlot<TProps extends object> = StyledSlotComponent<TProps, VireoFormFileListFieldOwnerState>;
type RowProps = StyledSlotProps<VireoFormFileListFieldRowOwnerState>;
type RowSlot<TProps extends object> = StyledSlotComponent<TProps, VireoFormFileListFieldRowOwnerState>;
type RejectionProps = StyledSlotProps<VireoFormFileListFieldRejectionOwnerState>;
type RejectionSlot<TProps extends object> = StyledSlotComponent<TProps, VireoFormFileListFieldRejectionOwnerState>;

export const VireoFormFileListFieldRoot: OwnerSlot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
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
    ownerState.required && styles.required,
    ownerState.fullWidth && styles.fullWidth,
    ownerState.reorderable && styles.reorderable,
    ownerState.capacityReached && styles.capacityReached,
    ownerState.reordering && styles.reordering,
    ownerState.submitting && styles.submitting,
    ownerState.validating && styles.validating,
  ],
})<OwnerProps>(({ theme, ownerState }) => ({
  containerName: "vireo-file-list-field",
  containerType: "inline-size",
  display: "grid",
  gap: theme.spacing(1.25),
  minWidth: 0,
  position: "relative",
  width: ownerState.fullWidth ? "100%" : "auto",
  ...(ownerState.disabled && { opacity: theme.palette.action.disabledOpacity }),
}));

export const VireoFormFileListFieldInput: OwnerSlot<
  React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
> = styled("input", {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
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

export const VireoFormFileListFieldChooser: OwnerSlot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "Chooser",
  overridesResolver: (_props, styles) => styles.chooser,
})<OwnerProps>(({ theme, ownerState }) => ({
  alignItems: "center",
  backgroundColor: ownerState.dragActive ? theme.palette.action.hover : theme.palette.background.paper,
  border: `1px dashed ${
    ownerState.dragReject
      ? theme.palette.error.main
      : ownerState.dragActive
        ? theme.palette.primary.main
        : theme.palette.divider
  }`,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  minWidth: 0,
  padding: theme.spacing(1.5),
  transition: theme.transitions.create(["background-color", "border-color"]),
}));

export const VireoFormFileListFieldSelectButton: OwnerSlot<ButtonProps> = styled(Button, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "SelectButton",
  overridesResolver: (_props, styles) => styles.selectButton,
})<OwnerProps>({ whiteSpace: "nowrap", "@container vireo-file-list-field (max-width: 29.999rem)": { width: "100%" } });

export const VireoFormFileListFieldDropHint: OwnerSlot<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "DropHint",
  overridesResolver: (_props, styles) => styles.dropHint,
})<OwnerProps>(({ theme, ownerState }) => ({
  color: ownerState.dragReject ? theme.palette.error.main : theme.palette.text.secondary,
  minWidth: 0,
}));

export const VireoFormFileListFieldCapacityText: OwnerSlot<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "CapacityText",
  overridesResolver: (_props, styles) => styles.capacityText,
})<OwnerProps>(({ theme }) => ({ color: theme.palette.text.secondary }));

export const VireoFormFileListFieldToolbar: OwnerSlot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "Toolbar",
  overridesResolver: (_props, styles) => styles.toolbar,
})<OwnerProps>(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  gap: theme.spacing(1),
  justifyContent: "space-between",
  minWidth: 0,
}));

export const VireoFormFileListFieldFileCount: OwnerSlot<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "FileCount",
  overridesResolver: (_props, styles) => styles.fileCount,
})<OwnerProps>(({ theme }) => ({ color: theme.palette.text.secondary }));

export const VireoFormFileListFieldClearAllButton: OwnerSlot<ButtonProps> = styled(Button, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "ClearAllButton",
  overridesResolver: (_props, styles) => styles.clearAllButton,
})<OwnerProps>({ flexShrink: 0 });

export const VireoFormFileListFieldList: OwnerSlot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "List",
  overridesResolver: (_props, styles) => styles.list,
})<OwnerProps>(({ theme }) => ({ display: "grid", gap: theme.spacing(1), listStyle: "none", margin: 0, padding: 0 }));

export const VireoFormFileListFieldFileRow: RowSlot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "FileRow",
  overridesResolver: (_props, styles) => styles.fileRow,
})<RowProps>(({ theme, ownerState }) => ({
  alignItems: "center",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${ownerState.dragging ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: "grid",
  gap: theme.spacing(1),
  gridTemplateColumns: ownerState.reorderable ? "auto minmax(0, 1fr) auto" : "minmax(0, 1fr) auto",
  minWidth: 0,
  padding: theme.spacing(1.25),
  ...(ownerState.dragging && { opacity: 0.72 }),
}));

export const VireoFormFileListFieldReorderHandle: RowSlot<IconButtonProps> = styled(IconButton, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "ReorderHandle",
  overridesResolver: (_props, styles) => styles.reorderHandle,
})<RowProps>({ cursor: "grab", flexShrink: 0, touchAction: "none", "&:active": { cursor: "grabbing" } });

export const VireoFormFileListFieldMetadata: RowSlot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "Metadata",
  overridesResolver: (_props, styles) => styles.metadata,
})<RowProps>(({ theme }) => ({ alignItems: "baseline", display: "flex", gap: theme.spacing(0.75), minWidth: 0 }));

export const VireoFormFileListFieldFileName: RowSlot<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "FileName",
  overridesResolver: (_props, styles) => styles.fileName,
})<RowProps>({ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });

export const VireoFormFileListFieldFileSize: RowSlot<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "FileSize",
  overridesResolver: (_props, styles) => styles.fileSize,
})<RowProps>(({ theme }) => ({ color: theme.palette.text.secondary, flexShrink: 0, whiteSpace: "nowrap" }));

export const VireoFormFileListFieldRemoveButton: RowSlot<IconButtonProps> = styled(IconButton, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "RemoveButton",
  overridesResolver: (_props, styles) => styles.removeButton,
})<RowProps>({ flexShrink: 0 });

export const VireoFormFileListFieldPreviewContainer: RowSlot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "PreviewContainer",
  overridesResolver: (_props, styles) => styles.previewContainer,
})<RowProps>(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  gridColumn: "1 / -1",
  minWidth: 0,
  paddingTop: theme.spacing(1.25),
}));

export const VireoFormFileListFieldRejectionList: OwnerSlot<BoxProps> = styled(Box, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "RejectionList",
  overridesResolver: (_props, styles) => styles.rejectionList,
})<OwnerProps>(({ theme }) => ({ display: "grid", gap: theme.spacing(0.5), listStyle: "none", margin: 0, padding: 0 }));

export const VireoFormFileListFieldRejectionItem: RejectionSlot<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "RejectionItem",
  overridesResolver: (_props, styles) => styles.rejectionItem,
})<RejectionProps>(({ theme }) => ({ color: theme.palette.error.main, overflowWrap: "anywhere" }));

export const VireoFormFileListFieldHelperText: OwnerSlot<FormHelperTextProps> = styled(FormHelperText, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "HelperText",
  overridesResolver: (_props, styles) => styles.helperText,
})<OwnerProps>({ margin: 0 });

export const VireoFormFileListFieldLiveRegion: OwnerSlot<TypographyProps> = styled(Typography, {
  name: VIREO_FORM_FILE_LIST_FIELD_NAME,
  slot: "LiveRegion",
  overridesResolver: (_props, styles) => styles.liveRegion,
})<OwnerProps>({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});
