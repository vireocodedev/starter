import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoFilePreviewRenderer, VireoFormFileNameTruncation } from "@/capabilities/forms/types/vireoFile.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Box, BoxProps, Button, FormHelperText, IconButton, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFormFileFieldClasses, type VireoFormFileFieldClassKey } from "./VireoFormFileField.classes";
import type { VIREO_FORM_FILE_FIELD_NAME, VireoFormFileFieldSlotName } from "./VireoFormFileField.identity";

export type {
  VireoFilePreviewRenderer,
  VireoFilePreviewRendererProps,
  VireoFormFileNameTruncation,
} from "@/capabilities/forms/types/vireoFile.types";
export type VireoFileRejectionReason = "type" | "size";
export type VireoFileRejection = { file: File; reason: VireoFileRejectionReason };

export type VireoFormFileFieldOwnerState = {
  disabled: boolean;
  dragActive: boolean;
  dragReject: boolean;
  empty: boolean;
  errorVisible: boolean;
  invalid: boolean;
  populated: boolean;
  readOnly: boolean;
  rejected: boolean;
  submitting: boolean;
  touched: boolean;
  validating: boolean;
};

export interface VireoFormFileFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileFieldSelectionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileFieldInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileFieldSelectButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileFieldMetadataSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileFieldFileNameSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileFieldFileSizeSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileFieldClearButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileFieldDropOverlaySlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileFieldPreviewContainerSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileFieldHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export type VireoFormFileFieldSlots = { [TSlotName in VireoFormFileFieldSlotName]: React.ElementType };

export type VireoFormFileFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormFileFieldSlots,
  {
    /** @default Box */
    root: SlotProps<typeof Box, VireoFormFileFieldRootSlotPropsOverrides, VireoFormFileFieldOwnerState>;
    /** @default Box */
    selection: SlotProps<typeof Box, VireoFormFileFieldSelectionSlotPropsOverrides, VireoFormFileFieldOwnerState>;
    /** @default 'input' */
    input: SlotProps<"input", VireoFormFileFieldInputSlotPropsOverrides, VireoFormFileFieldOwnerState>;
    /** @default Button */
    selectButton: SlotProps<
      typeof Button,
      VireoFormFileFieldSelectButtonSlotPropsOverrides,
      VireoFormFileFieldOwnerState
    >;
    /** @default Box */
    metadata: SlotProps<typeof Box, VireoFormFileFieldMetadataSlotPropsOverrides, VireoFormFileFieldOwnerState>;
    /** @default Typography */
    fileName: SlotProps<typeof Typography, VireoFormFileFieldFileNameSlotPropsOverrides, VireoFormFileFieldOwnerState>;
    /** @default Typography */
    fileSize: SlotProps<typeof Typography, VireoFormFileFieldFileSizeSlotPropsOverrides, VireoFormFileFieldOwnerState>;
    /** @default IconButton */
    clearButton: SlotProps<
      typeof IconButton,
      VireoFormFileFieldClearButtonSlotPropsOverrides,
      VireoFormFileFieldOwnerState
    >;
    /** @default Box */
    dropOverlay: SlotProps<typeof Box, VireoFormFileFieldDropOverlaySlotPropsOverrides, VireoFormFileFieldOwnerState>;
    /** @default Box */
    previewContainer: SlotProps<
      typeof Box,
      VireoFormFileFieldPreviewContainerSlotPropsOverrides,
      VireoFormFileFieldOwnerState
    >;
    /** @default FormHelperText */
    helperText: SlotProps<
      typeof FormHelperText,
      VireoFormFileFieldHelperTextSlotPropsOverrides,
      VireoFormFileFieldOwnerState
    >;
  }
>;

export type VireoFormFileFieldOwnProps = VireoFormFileFieldSlotsAndSlotProps & {
  /** Native file-accept filter. Exact MIME types, MIME wildcards, and extensions are enforced for picker and drop selection. */
  accept?: string;
  /** Native camera or microphone capture hint. */
  capture?: boolean | "user" | "environment";
  /** Content of the selection action while the value is empty. @default 'Choose file' */
  chooseFileLabel?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoFormFileFieldClasses>;
  /** Whether a selected file can be cleared. @default true */
  clearable?: boolean;
  /** Accessible label for the clear action. @default 'Clear selected file' */
  clearFileLabel?: string;
  disabled?: boolean;
  /** Disables drag-and-drop selection while preserving the picker action. @default false */
  disableDrop?: boolean;
  /** Content shown over the field while an acceptable file is dragged across it. @default 'Drop file here' */
  dropActiveText?: React.ReactNode;
  /** Metadata text shown while the bound value is null. @default 'No file selected' */
  emptyText?: React.ReactNode;
  /** Adds an error presentation state without suppressing validation or rejection errors. */
  error?: boolean;
  /** Overrides the enclosing form's error-display policy for this field. */
  errorDisplay?: VireoFormErrorDisplay;
  /** Responsive filename-overflow strategy. @default 'middle' */
  fileNameTruncation?: VireoFormFileNameTruncation;
  /** Message shown when an otherwise accepted file exceeds `maxSize`. */
  fileTooLargeText?: React.ReactNode | ((file: File, maxSize: number) => React.ReactNode);
  /** Overrides the enclosing form's validation-error formatter for this field. */
  formatError?: VireoFormErrorFormatter;
  /** Formats the selected file's byte size. Uses decimal units by default. */
  formatFileSize?: (bytes: number) => React.ReactNode;
  /** Shown when neither a local rejection nor a visible form error takes precedence. Defaults to a reserved line; pass `null` to remove it. @default ' ' */
  helperText?: React.ReactNode;
  /** Hides selected-file size metadata. @default false */
  hideFileSize?: boolean;
  /** Ref forwarded to the hidden native file input. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Maximum accepted file size in bytes. */
  maxSize?: number;
  /** Observes a locally rejected file after type or size checks. */
  onFileRejected?: (rejection: VireoFileRejection) => void;
  /** Opt-in renderer placed on a dedicated row beneath selected-file metadata. */
  previewRenderer?: VireoFilePreviewRenderer;
  /** Prevents picker, drop, and clear changes while retaining normal presentation. */
  readOnly?: boolean;
  readOnlyEmptyValue?: React.ReactNode;
  renderReadOnlyValue?: (file: File) => React.ReactNode;
  /** Content of the selection action while a value exists. @default 'Replace file' */
  replaceFileLabel?: React.ReactNode;
  /** Adds native required semantics; validation remains owned by TanStack Form or the supplied schema. */
  required?: boolean;
  /** Message shown when a file does not match `accept`. @default 'This file type is not accepted.' */
  unsupportedTypeText?: React.ReactNode | ((file: File) => React.ReactNode);
};

/** Props VireoFormFileField inherits from its default root after excluding component-owned props. */
export type VireoFormFileFieldInheritedProps = Omit<
  BoxProps<"div">,
  "children" | "component" | "onChange" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop"
>;

/** Props accepted by `field.FileField`. */
export type VireoFormFileFieldProps = VireoFormFileFieldOwnProps & VireoFormFileFieldInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_FILE_FIELD_NAME]?: VireoThemeComponent<
      VireoFormFileFieldProps,
      VireoFormFileFieldClassKey,
      VireoFormFileFieldOwnerState,
      Theme
    >;
  }
}
