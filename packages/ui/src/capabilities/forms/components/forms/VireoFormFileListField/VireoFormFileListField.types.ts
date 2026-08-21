import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";
import type { VireoFilePreviewRenderer, VireoFormFileNameTruncation } from "@/capabilities/forms/types/vireoFile.types";
import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { Box, BoxProps, Button, FormHelperText, IconButton, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import {
  type VireoFormFileListFieldClasses,
  type VireoFormFileListFieldClassKey,
} from "./VireoFormFileListField.classes";
import type {
  VIREO_FORM_FILE_LIST_FIELD_NAME,
  VireoFormFileListFieldSlotName,
} from "./VireoFormFileListField.identity";

export type VireoFileListRejectionReason = "type" | "size" | "duplicate" | "maxFiles" | "totalSize";
export type VireoFileListRejection = { file: File; reason: VireoFileListRejectionReason };
export type VireoFileListCapacityReason = "maxFiles" | "maxTotalSize";

export type VireoFormFileListFieldOwnerState = {
  capacityReached: boolean;
  clearable: boolean;
  disabled: boolean;
  dragActive: boolean;
  dragReject: boolean;
  dropDisabled: boolean;
  empty: boolean;
  errorVisible: boolean;
  fileCount: number;
  fullWidth: boolean;
  invalid: boolean;
  maxFiles: number | undefined;
  maxTotalSize: number | undefined;
  populated: boolean;
  readOnly: boolean;
  rejected: boolean;
  reordering: boolean;
  reorderable: boolean;
  required: boolean;
  submitting: boolean;
  totalSize: number;
  touched: boolean;
  validating: boolean;
};

export type VireoFormFileListFieldRowOwnerState = VireoFormFileListFieldOwnerState & {
  count: number;
  dragging: boolean;
  file: File;
  first: boolean;
  index: number;
  last: boolean;
  previewed: boolean;
};

export type VireoFormFileListFieldRejectionOwnerState = VireoFormFileListFieldOwnerState & {
  index: number;
  rejection: VireoFileListRejection;
};

export interface VireoFormFileListFieldRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldInputSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldChooserSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldSelectButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldDropHintSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldCapacityTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldToolbarSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldFileCountSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldClearAllButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldListSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldFileRowSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldReorderHandleSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldMetadataSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldFileNameSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldFileSizeSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldRemoveButtonSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldPreviewContainerSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldRejectionListSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldRejectionItemSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldHelperTextSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}
export interface VireoFormFileListFieldLiveRegionSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export type VireoFormFileListFieldSlots = {
  [TSlotName in VireoFormFileListFieldSlotName]: React.ElementType;
};

export type VireoFormFileListFieldSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFormFileListFieldSlots,
  {
    /** @default Box */
    root: SlotProps<typeof Box, VireoFormFileListFieldRootSlotPropsOverrides, VireoFormFileListFieldOwnerState>;
    /** @default 'input' */
    input: SlotProps<"input", VireoFormFileListFieldInputSlotPropsOverrides, VireoFormFileListFieldOwnerState>;
    /** @default Box */
    chooser: SlotProps<typeof Box, VireoFormFileListFieldChooserSlotPropsOverrides, VireoFormFileListFieldOwnerState>;
    /** @default Button */
    selectButton: SlotProps<
      typeof Button,
      VireoFormFileListFieldSelectButtonSlotPropsOverrides,
      VireoFormFileListFieldOwnerState
    >;
    /** @default Typography */
    dropHint: SlotProps<
      typeof Typography,
      VireoFormFileListFieldDropHintSlotPropsOverrides,
      VireoFormFileListFieldOwnerState
    >;
    /** @default Typography */
    capacityText: SlotProps<
      typeof Typography,
      VireoFormFileListFieldCapacityTextSlotPropsOverrides,
      VireoFormFileListFieldOwnerState
    >;
    /** @default Box */
    toolbar: SlotProps<typeof Box, VireoFormFileListFieldToolbarSlotPropsOverrides, VireoFormFileListFieldOwnerState>;
    /** @default Typography */
    fileCount: SlotProps<
      typeof Typography,
      VireoFormFileListFieldFileCountSlotPropsOverrides,
      VireoFormFileListFieldOwnerState
    >;
    /** @default Button */
    clearAllButton: SlotProps<
      typeof Button,
      VireoFormFileListFieldClearAllButtonSlotPropsOverrides,
      VireoFormFileListFieldOwnerState
    >;
    /** @default Box */
    list: SlotProps<typeof Box, VireoFormFileListFieldListSlotPropsOverrides, VireoFormFileListFieldOwnerState>;
    /** @default Box */
    fileRow: SlotProps<
      typeof Box,
      VireoFormFileListFieldFileRowSlotPropsOverrides,
      VireoFormFileListFieldRowOwnerState
    >;
    /** @default IconButton */
    reorderHandle: SlotProps<
      typeof IconButton,
      VireoFormFileListFieldReorderHandleSlotPropsOverrides,
      VireoFormFileListFieldRowOwnerState
    >;
    /** @default Box */
    metadata: SlotProps<
      typeof Box,
      VireoFormFileListFieldMetadataSlotPropsOverrides,
      VireoFormFileListFieldRowOwnerState
    >;
    /** @default Typography */
    fileName: SlotProps<
      typeof Typography,
      VireoFormFileListFieldFileNameSlotPropsOverrides,
      VireoFormFileListFieldRowOwnerState
    >;
    /** @default Typography */
    fileSize: SlotProps<
      typeof Typography,
      VireoFormFileListFieldFileSizeSlotPropsOverrides,
      VireoFormFileListFieldRowOwnerState
    >;
    /** @default IconButton */
    removeButton: SlotProps<
      typeof IconButton,
      VireoFormFileListFieldRemoveButtonSlotPropsOverrides,
      VireoFormFileListFieldRowOwnerState
    >;
    /** @default Box */
    previewContainer: SlotProps<
      typeof Box,
      VireoFormFileListFieldPreviewContainerSlotPropsOverrides,
      VireoFormFileListFieldRowOwnerState
    >;
    /** @default Box */
    rejectionList: SlotProps<
      typeof Box,
      VireoFormFileListFieldRejectionListSlotPropsOverrides,
      VireoFormFileListFieldOwnerState
    >;
    /** @default Typography */
    rejectionItem: SlotProps<
      typeof Typography,
      VireoFormFileListFieldRejectionItemSlotPropsOverrides,
      VireoFormFileListFieldRejectionOwnerState
    >;
    /** @default FormHelperText */
    helperText: SlotProps<
      typeof FormHelperText,
      VireoFormFileListFieldHelperTextSlotPropsOverrides,
      VireoFormFileListFieldOwnerState
    >;
    /** @default Typography */
    liveRegion: SlotProps<
      typeof Typography,
      VireoFormFileListFieldLiveRegionSlotPropsOverrides,
      VireoFormFileListFieldOwnerState
    >;
  }
>;

export type VireoFormFileListFieldOwnProps = VireoFormFileListFieldSlotsAndSlotProps & {
  /** Native file-accept filter enforced for picker and drop selection. */
  accept?: string;
  /** Content of the selection action after files exist. @default 'Add more files' */
  addMoreFilesLabel?: React.ReactNode;
  /** Allows files with the same resolved identity. @default false */
  allowDuplicates?: boolean;
  /** Native camera or microphone capture hint. */
  capture?: boolean | "user" | "environment";
  /** Content shown when additions are unavailable because capacity is exhausted. */
  capacityReachedText?: React.ReactNode | ((reason: VireoFileListCapacityReason, limit: number) => React.ReactNode);
  /** Content of the selection action while the collection is empty. @default 'Choose files' */
  chooseFilesLabel?: React.ReactNode;
  /** Override or extend the utility classes applied to each slot and state. */
  classes?: Partial<VireoFormFileListFieldClasses>;
  /** Whether selected files can be removed. @default true */
  clearable?: boolean;
  /** Visible clear-all action content. @default 'Clear all' */
  clearAllLabel?: React.ReactNode;
  /** Accessible label for clear-all. @default 'Clear all selected files' */
  clearAllFilesLabel?: string;
  disabled?: boolean;
  /** Disables external drag-and-drop selection while preserving the picker. @default false */
  disableDrop?: boolean;
  /** Content shown while acceptable files are dragged over the chooser. @default 'Drop files here' */
  dropActiveText?: React.ReactNode;
  /** Persistent guidance shown in the chooser. @default 'or drag and drop files here' */
  dropHint?: React.ReactNode;
  /** Adds an error presentation state without suppressing validation or rejection errors. */
  error?: boolean;
  /** Overrides the enclosing form's error-display policy for this field. */
  errorDisplay?: VireoFormErrorDisplay;
  /** Responsive filename-overflow strategy. @default 'middle' */
  fileNameTruncation?: VireoFormFileNameTruncation;
  /** Describes one file's position to assistive technology. */
  filePositionText?: (file: File, index: number, count: number) => string;
  /** Message shown when an otherwise accepted file exceeds `maxSize`. */
  fileTooLargeText?: React.ReactNode | ((file: File, maxSize: number) => React.ReactNode);
  /** Overrides the enclosing form's validation-error formatter for this field. */
  formatError?: VireoFormErrorFormatter;
  /** Formats the compact collection count. */
  formatFileCount?: (count: number, maxFiles: number | undefined) => React.ReactNode;
  /** Formats individual and total byte sizes. Uses decimal units by default. */
  formatFileSize?: (bytes: number) => React.ReactNode;
  /** Resolves duplicate identity. Defaults to name, size, lastModified, and type. */
  getFileKey?: (file: File) => string;
  /** Shown beneath local rejections and the list. */
  helperText?: React.ReactNode;
  /** Hides the clear-all action. @default false */
  hideClearAll?: boolean;
  /** Hides per-file size metadata. @default false */
  hideFileSize?: boolean;
  /** Ref forwarded to the hidden native file input. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Maximum number of accepted files. */
  maxFiles?: number;
  /** Message shown for a candidate beyond `maxFiles`. */
  maxFilesText?: React.ReactNode | ((file: File, maxFiles: number) => React.ReactNode);
  /** Maximum accepted size of one file in bytes. */
  maxSize?: number;
  /** Maximum accepted aggregate size in bytes. */
  maxTotalSize?: number;
  /** Message shown when a candidate would exceed `maxTotalSize`. */
  maxTotalSizeText?: React.ReactNode | ((file: File, maxTotalSize: number) => React.ReactNode);
  /** Message shown when a candidate duplicates another selected file. */
  duplicateFileText?: React.ReactNode | ((file: File) => React.ReactNode);
  /** Observes files accepted from one picker or drop operation. */
  onFilesAdded?: (addedFiles: readonly File[], nextFiles: readonly File[]) => void;
  /** Observes files cleared together. */
  onFilesCleared?: (files: readonly File[]) => void;
  /** Observes all candidates rejected by one picker or drop operation. */
  onFilesRejected?: (rejections: readonly VireoFileListRejection[]) => void;
  /** Observes one removed file. */
  onFileRemoved?: (file: File, index: number) => void;
  /** Opt-in renderer placed on a dedicated row beneath each file's metadata. */
  previewRenderer?: VireoFilePreviewRenderer;
  /** Prevents picker, drop, removal, clear-all, and reordering while retaining normal presentation. */
  readOnly?: boolean;
  /** Accessible label for one reorder handle. */
  reorderFileLabel?: (file: File, index: number, count: number) => string;
  /** Announcement emitted after a successful reorder. */
  reorderAnnouncement?: (file: File, previousIndex: number, nextIndex: number, count: number) => string;
  /** Enables pointer and keyboard reordering. @default false */
  reorderable?: boolean;
  /** Accessible label for one remove action. */
  removeFileLabel?: (file: File, index: number) => string;
  /** Marks the collection as required for presentation and accessibility. */
  required?: boolean;
  /** Controls whether the root fills its containing width. @default true */
  fullWidth?: boolean;
  /** Message shown when a candidate does not match `accept`. */
  unsupportedTypeText?: React.ReactNode | ((file: File) => React.ReactNode);
};

/** Props VireoFormFileListField inherits from its default root after excluding component-owned props. */
export type VireoFormFileListFieldInheritedProps = Omit<
  BoxProps<"div">,
  "children" | "component" | "onChange" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop"
>;

/** Props accepted by `field.FileListField`. */
export type VireoFormFileListFieldProps = VireoFormFileListFieldOwnProps & VireoFormFileListFieldInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FORM_FILE_LIST_FIELD_NAME]?: VireoThemeComponent<
      VireoFormFileListFieldProps,
      VireoFormFileListFieldClassKey,
      VireoFormFileListFieldOwnerState,
      Theme
    >;
  }
}
