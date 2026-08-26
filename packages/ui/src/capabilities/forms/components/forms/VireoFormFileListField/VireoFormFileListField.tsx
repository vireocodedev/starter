import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import {
  acceptsVireoDragType,
  acceptsVireoFile,
  formatVireoFileSize,
  truncateVireoFileName,
} from "@/capabilities/forms/utils/vireoFile";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { unstable_composeClasses as composeClasses, type ButtonProps } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import {
  type VireoFormFileListFieldClassKey,
  getVireoFormFileListFieldUtilityClass,
} from "./VireoFormFileListField.classes";
import {
  VIREO_FORM_FILE_LIST_FIELD_NAME,
  type VireoFormFileListFieldSlotName,
} from "./VireoFormFileListField.identity";
import {
  VireoFormFileListFieldCapacityText,
  VireoFormFileListFieldChooser,
  VireoFormFileListFieldClearAllButton,
  VireoFormFileListFieldDropHint,
  VireoFormFileListFieldFileCount,
  VireoFormFileListFieldFileName,
  VireoFormFileListFieldFileRow,
  VireoFormFileListFieldFileSize,
  VireoFormFileListFieldHelperText,
  VireoFormFileListFieldInput,
  VireoFormFileListFieldList,
  VireoFormFileListFieldLiveRegion,
  VireoFormFileListFieldMetadata,
  VireoFormFileListFieldPreviewContainer,
  VireoFormFileListFieldRejectionItem,
  VireoFormFileListFieldRejectionList,
  VireoFormFileListFieldRemoveButton,
  VireoFormFileListFieldReorderHandle,
  VireoFormFileListFieldRoot,
  VireoFormFileListFieldSelectButton,
  VireoFormFileListFieldToolbar,
} from "./VireoFormFileListField.styled";
import type {
  VireoFileListCapacityReason,
  VireoFileListRejection,
  VireoFormFileListFieldOwnerState,
  VireoFormFileListFieldProps,
  VireoFormFileListFieldRejectionOwnerState,
  VireoFormFileListFieldRowOwnerState,
} from "./VireoFormFileListField.types";

const INTERNAL_REORDER_TYPE = "application/x-vireo-file-list-row";

function useUtilityClasses(
  ownerState: VireoFormFileListFieldOwnerState,
  classes?: VireoFormFileListFieldProps["classes"],
) {
  return composeClasses(
    {
      root: [
        "root",
        ownerState.empty && "empty",
        ownerState.populated && "populated",
        ownerState.dragActive && "dragActive",
        ownerState.dragReject && "dragReject",
        ownerState.rejected && "rejected",
        ownerState.invalid && "invalid",
        ownerState.disabled && "disabled",
        ownerState.readOnly && "readOnly",
        ownerState.required && "required",
        ownerState.fullWidth && "fullWidth",
        ownerState.reorderable && "reorderable",
        ownerState.capacityReached && "capacityReached",
        ownerState.reordering && "reordering",
        ownerState.submitting && "submitting",
        ownerState.validating && "validating",
      ],
      input: ["input"],
      chooser: ["chooser"],
      selectButton: ["selectButton"],
      dropHint: ["dropHint"],
      capacityText: ["capacityText"],
      toolbar: ["toolbar"],
      fileCount: ["fileCount"],
      clearAllButton: ["clearAllButton"],
      list: ["list"],
      fileRow: ["fileRow"],
      reorderHandle: ["reorderHandle"],
      metadata: ["metadata"],
      fileName: ["fileName"],
      fileSize: ["fileSize"],
      removeButton: ["removeButton"],
      previewContainer: ["previewContainer"],
      rejectionList: ["rejectionList"],
      rejectionItem: ["rejectionItem"],
      helperText: ["helperText"],
      liveRegion: ["liveRegion"],
    } as const satisfies UtilityClassSlotMap<VireoFormFileListFieldSlotName, VireoFormFileListFieldClassKey>,
    getVireoFormFileListFieldUtilityClass,
    classes,
  );
}

function resolveMessage<TArgs extends unknown[]>(
  value: React.ReactNode | ((...args: TArgs) => React.ReactNode),
  ...args: TArgs
): React.ReactNode {
  return typeof value === "function" ? value(...args) : value;
}

function defaultFileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
}

function defaultFileCount(count: number, maximum: number | undefined): React.ReactNode {
  if (maximum !== undefined) return `${count} of ${maximum} files`;
  return `${count} ${count === 1 ? "file" : "files"}`;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

function useFileRowIds(files: readonly File[]): readonly string[] {
  const ids = React.useRef(new WeakMap<File, string>());
  const sequence = React.useRef(0);
  return React.useMemo(() => {
    const occurrences = new Map<string, number>();
    return files.map(file => {
      let base = ids.current.get(file);
      if (!base) {
        sequence.current += 1;
        base = `file-${sequence.current}`;
        ids.current.set(file, base);
      }
      const occurrence = occurrences.get(base) ?? 0;
      occurrences.set(base, occurrence + 1);
      return `${base}-${occurrence}`;
    });
  }, [files]);
}

function useDisplayedFileNames(
  files: readonly File[],
  rowIds: readonly string[],
  mode: NonNullable<VireoFormFileListFieldProps["fileNameTruncation"]>,
  hideFileSize: boolean,
) {
  const metadataElements = React.useRef(new Map<string, HTMLElement>());
  const fileNameElements = React.useRef(new Map<string, HTMLElement>());
  const fileSizeElements = React.useRef(new Map<string, HTMLElement>());
  const [displayed, setDisplayed] = React.useState<Record<string, string>>({});

  React.useLayoutEffect(() => {
    const update = () => {
      const next: Record<string, string> = {};
      files.forEach((file, index) => {
        const rowId = rowIds[index];
        const metadata = metadataElements.current.get(rowId);
        const fileName = fileNameElements.current.get(rowId);
        if (!metadata || !fileName) {
          next[rowId] = file.name;
          return;
        }
        const fileSize = hideFileSize ? undefined : fileSizeElements.current.get(rowId);
        const metadataStyle = window.getComputedStyle(metadata);
        const gap = fileSize ? Number.parseFloat(metadataStyle.columnGap || metadataStyle.gap) || 0 : 0;
        const availableWidth = Math.max(0, metadata.clientWidth - (fileSize?.clientWidth ?? 0) - gap);
        const context = document.createElement("canvas").getContext("2d");
        if (!context || availableWidth <= 0) {
          next[rowId] = file.name;
          return;
        }
        const style = window.getComputedStyle(fileName);
        context.font = style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        next[rowId] = truncateVireoFileName(file.name, mode, availableWidth, candidate => {
          return context.measureText(candidate).width;
        });
      });
      setDisplayed(current => {
        const currentKeys = Object.keys(current);
        const nextKeys = Object.keys(next);
        if (
          currentKeys.length === nextKeys.length &&
          nextKeys.every(key => Object.prototype.hasOwnProperty.call(current, key) && current[key] === next[key])
        )
          return current;
        return next;
      });
    };

    update();
    if (typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(update);
    metadataElements.current.forEach(element => observer.observe(element));
    fileSizeElements.current.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [files, hideFileSize, mode, rowIds]);

  const register = <TElement extends HTMLElement>(
    registry: React.MutableRefObject<Map<string, HTMLElement>>,
    rowId: string,
    externalRef: React.Ref<unknown> | undefined,
  ) => {
    return (element: TElement | null) => {
      if (element) registry.current.set(rowId, element);
      else registry.current.delete(rowId);
      assignRef(externalRef, element);
    };
  };

  return {
    displayed,
    metadataRef: (rowId: string, externalRef?: React.Ref<unknown>) => register(metadataElements, rowId, externalRef),
    fileNameRef: (rowId: string, externalRef?: React.Ref<unknown>) => register(fileNameElements, rowId, externalRef),
    fileSizeRef: (rowId: string, externalRef?: React.Ref<unknown>) => register(fileSizeElements, rowId, externalRef),
  };
}

/** Binds an ordered browser `File[]` collection to `form.Field` through `field.FileListField`. */
export const VireoFormFileListField = React.forwardRef<HTMLDivElement, VireoFormFileListFieldProps>(
  function VireoFormFileListField(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_FILE_LIST_FIELD_NAME });
    const {
      accept,
      addMoreFilesLabel = "Add more files",
      allowDuplicates = false,
      capacityReachedText = (reason: VireoFileListCapacityReason, limit: number) =>
        reason === "maxFiles" ? `Maximum of ${limit} files selected` : "Maximum total file size reached",
      capture,
      chooseFilesLabel = "Choose files",
      className,
      classes: classesProp,
      clearable = true,
      clearAllFilesLabel = "Clear all selected files",
      clearAllLabel = "Clear all",
      disabled = false,
      disableDrop = false,
      dropActiveText = "Drop files here",
      dropHint = "or drag and drop files here",
      duplicateFileText = "This file is already selected.",
      error = false,
      errorDisplay: errorDisplayProp,
      fileNameTruncation = "middle",
      filePositionText = (file: File, index: number, count: number) => `${file.name}, file ${index + 1} of ${count}`,
      fileTooLargeText = (_file: File, maximum: number) => `File must be ${formatVireoFileSize(maximum)} or smaller.`,
      formatError: formatErrorProp,
      formatFileCount = defaultFileCount,
      formatFileSize = formatVireoFileSize,
      fullWidth = true,
      getFileKey = defaultFileKey,
      helperText = " ",
      hideClearAll = false,
      hideFileSize = false,
      inputRef,
      maxFiles,
      maxFilesText = (_file: File, maximum: number) => `Only ${maximum} files can be selected.`,
      maxSize,
      maxTotalSize,
      maxTotalSizeText = (_file: File, maximum: number) =>
        `Selected files must total ${formatVireoFileSize(maximum)} or less.`,
      onFilesAdded,
      onFilesCleared,
      onFilesRejected,
      onFileRemoved,
      previewRenderer: PreviewRenderer,
      readOnly = false,
      removeFileLabel = (file: File) => `Remove ${file.name}`,
      reorderAnnouncement = (file: File, _previousIndex: number, nextIndex: number, count: number) =>
        `Moved ${file.name} to position ${nextIndex + 1} of ${count}.`,
      reorderable = false,
      reorderFileLabel = (file: File, index: number, count: number) =>
        `Reorder ${file.name}, file ${index + 1} of ${count}`,
      required = false,
      slotProps = {},
      slots = {},
      style,
      sx,
      unsupportedTypeText = "This file type is not accepted.",
      ...other
    } = props;
    const normalizedMaxFiles = maxFiles === undefined ? undefined : Math.max(0, Math.floor(maxFiles));
    const normalizedMaxSize = maxSize === undefined ? undefined : Math.max(0, maxSize);
    const normalizedMaxTotalSize = maxTotalSize === undefined ? undefined : Math.max(0, maxTotalSize);
    const field = useVireoFieldContext<File[]>();
    const formContext = useVireoFormContext();
    const fieldState = useStore(field.store, current => ({
      dirty: current.meta.isDirty,
      errors: current.meta.errors as readonly unknown[],
      invalid: !current.meta.isValid,
      touched: current.meta.isTouched,
      validating: current.meta.isValidating,
      value: current.value,
    }));
    const submitting = useStore(field.form.store, current => current.isSubmitting);
    const files = React.useMemo(
      () =>
        Array.isArray(fieldState.value)
          ? fieldState.value.filter((value): value is File => typeof File !== "undefined" && value instanceof File)
          : [],
      [fieldState.value],
    );
    const totalSize = files.reduce((total, file) => total + file.size, 0);
    const maxFilesReached = normalizedMaxFiles !== undefined && files.length >= normalizedMaxFiles;
    const maxTotalSizeReached = normalizedMaxTotalSize !== undefined && totalSize >= normalizedMaxTotalSize;
    const capacityReason: VireoFileListCapacityReason | undefined = maxFilesReached
      ? "maxFiles"
      : maxTotalSizeReached
        ? "maxTotalSize"
        : undefined;
    const capacityReached = capacityReason !== undefined;
    const [rejections, setRejections] = React.useState<readonly VireoFileListRejection[]>([]);
    const [dragActive, setDragActive] = React.useState(false);
    const [dragReject, setDragReject] = React.useState(false);
    const [draggingIndex, setDraggingIndex] = React.useState<number>();
    const [announcement, setAnnouncement] = React.useState("");
    const dragDepth = React.useRef(0);
    const nativeInput = React.useRef<HTMLInputElement | null>(null);
    const generatedInputId = React.useId();
    const generatedHelperId = React.useId();
    const generatedRejectionId = React.useId();
    const errorDisplay = errorDisplayProp ?? formContext.errorDisplay;
    const errorVisible =
      fieldState.invalid &&
      shouldDisplayVireoFormError(errorDisplay, {
        submissionAttempts: formContext.submissionAttempts,
        touched: fieldState.touched,
      });
    const formattedError = errorVisible
      ? formatFirstVireoFormError(fieldState.errors, formatErrorProp ?? formContext.formatError)
      : undefined;
    const ownerState: VireoFormFileListFieldOwnerState = {
      capacityReached,
      clearable,
      disabled,
      dragActive,
      dragReject,
      dropDisabled: disableDrop,
      empty: files.length === 0,
      errorVisible,
      fileCount: files.length,
      fullWidth,
      invalid: error || fieldState.invalid,
      maxFiles: normalizedMaxFiles,
      maxTotalSize: normalizedMaxTotalSize,
      populated: files.length > 0,
      readOnly,
      rejected: rejections.length > 0,
      reordering: draggingIndex !== undefined,
      reorderable,
      required,
      submitting,
      totalSize,
      touched: fieldState.touched,
      validating: fieldState.validating,
    };
    const classes = useUtilityClasses(ownerState, classesProp);
    const rowIds = useFileRowIds(files);
    const displayedNames = useDisplayedFileNames(files, rowIds, fileNameTruncation, hideFileSize);
    const interactive = !disabled && !readOnly;
    const additionsEnabled = interactive && !capacityReached;

    React.useEffect(() => {
      if (nativeInput.current) nativeInput.current.value = "";
    }, [fieldState.value]);

    React.useEffect(() => {
      if (!fieldState.dirty) setRejections([]);
    }, [fieldState.dirty]);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const resolvedInputSlotProps = resolveSlotProps(slotProps.input, ownerState);
    const {
      className: inputSlotClassName,
      id: inputSlotId,
      onChange: inputSlotOnChange,
      ref: inputSlotRef,
      ...inputSlotOther
    } = resolvedInputSlotProps;
    const resolvedChooserSlotProps = resolveSlotProps(slotProps.chooser, ownerState);
    const {
      className: chooserSlotClassName,
      onDragEnter: chooserSlotOnDragEnter,
      onDragLeave: chooserSlotOnDragLeave,
      onDragOver: chooserSlotOnDragOver,
      onDrop: chooserSlotOnDrop,
      ...chooserSlotOther
    } = resolvedChooserSlotProps;
    const resolvedSelectButtonSlotProps = resolveSlotProps(slotProps.selectButton, ownerState);
    const {
      className: selectButtonSlotClassName,
      onBlur: selectButtonSlotOnBlur,
      onClick: selectButtonSlotOnClick,
      ...selectButtonSlotOther
    } = resolvedSelectButtonSlotProps;
    const resolvedDropHintSlotProps = resolveSlotProps(slotProps.dropHint, ownerState);
    const { className: dropHintSlotClassName, ...dropHintSlotOther } = resolvedDropHintSlotProps;
    const resolvedCapacityTextSlotProps = resolveSlotProps(slotProps.capacityText, ownerState);
    const { className: capacityTextSlotClassName, ...capacityTextSlotOther } = resolvedCapacityTextSlotProps;
    const resolvedToolbarSlotProps = resolveSlotProps(slotProps.toolbar, ownerState);
    const { className: toolbarSlotClassName, ...toolbarSlotOther } = resolvedToolbarSlotProps;
    const resolvedFileCountSlotProps = resolveSlotProps(slotProps.fileCount, ownerState);
    const { className: fileCountSlotClassName, ...fileCountSlotOther } = resolvedFileCountSlotProps;
    const resolvedClearAllButtonSlotProps = resolveSlotProps(slotProps.clearAllButton, ownerState);
    const {
      className: clearAllButtonSlotClassName,
      onClick: clearAllButtonSlotOnClick,
      ...clearAllButtonSlotOther
    } = resolvedClearAllButtonSlotProps;
    const resolvedListSlotProps = resolveSlotProps(slotProps.list, ownerState);
    const { className: listSlotClassName, ...listSlotOther } = resolvedListSlotProps;
    const resolvedRejectionListSlotProps = resolveSlotProps(slotProps.rejectionList, ownerState);
    const { className: rejectionListSlotClassName, ...rejectionListSlotOther } = resolvedRejectionListSlotProps;
    const resolvedHelperTextSlotProps = resolveSlotProps(slotProps.helperText, ownerState);
    const {
      className: helperTextSlotClassName,
      id: helperTextSlotId,
      ...helperTextSlotOther
    } = resolvedHelperTextSlotProps;
    const resolvedLiveRegionSlotProps = resolveSlotProps(slotProps.liveRegion, ownerState);
    const { className: liveRegionSlotClassName, ...liveRegionSlotOther } = resolvedLiveRegionSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const mergedInputRef = useForkRef(nativeInput, inputRef, inputSlotRef);
    const inputId = inputSlotId ?? generatedInputId;
    const helperId = helperTextSlotId ?? generatedHelperId;
    const describedBy =
      [rejections.length > 0 ? generatedRejectionId : undefined, formattedError || helperText ? helperId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;

    const processFiles = React.useCallback(
      (candidates: readonly File[]) => {
        const accepted: File[] = [];
        const rejected: VireoFileListRejection[] = [];
        const identities = new Set(files.map(getFileKey));
        let nextTotalSize = totalSize;
        for (const file of candidates) {
          let reason: VireoFileListRejection["reason"] | undefined;
          if (!acceptsVireoFile(file, accept)) reason = "type";
          else if (normalizedMaxSize !== undefined && file.size > normalizedMaxSize) reason = "size";
          else if (!allowDuplicates && identities.has(getFileKey(file))) reason = "duplicate";
          else if (normalizedMaxFiles !== undefined && files.length + accepted.length >= normalizedMaxFiles)
            reason = "maxFiles";
          else if (normalizedMaxTotalSize !== undefined && nextTotalSize + file.size > normalizedMaxTotalSize)
            reason = "totalSize";

          if (reason) {
            rejected.push({ file, reason });
            continue;
          }
          accepted.push(file);
          identities.add(getFileKey(file));
          nextTotalSize += file.size;
        }

        const nextFiles = [...files, ...accepted];
        if (accepted.length > 0) {
          field.handleChange(nextFiles);
          onFilesAdded?.(accepted, nextFiles);
        }
        setRejections(rejected);
        if (rejected.length > 0) onFilesRejected?.(rejected);
      },
      [
        accept,
        allowDuplicates,
        field,
        files,
        getFileKey,
        normalizedMaxFiles,
        normalizedMaxSize,
        normalizedMaxTotalSize,
        onFilesAdded,
        onFilesRejected,
        totalSize,
      ],
    );

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
      inputSlotOnChange?.(event);
      if (!event.defaultPrevented && additionsEnabled) processFiles(Array.from(event.currentTarget.files ?? []));
      event.currentTarget.value = "";
    };

    const handleSelectClick: NonNullable<ButtonProps["onClick"]> = event => {
      selectButtonSlotOnClick?.(event);
      if (!event.defaultPrevented && additionsEnabled) nativeInput.current?.click();
    };

    const handleClearAllClick: NonNullable<ButtonProps["onClick"]> = event => {
      clearAllButtonSlotOnClick?.(event);
      if (event.defaultPrevented || !interactive || !clearable) return;
      const cleared = [...files];
      setRejections([]);
      field.handleChange([]);
      onFilesCleared?.(cleared);
    };

    const externalFileDrag = (event: React.DragEvent) => event.dataTransfer.types.includes("Files");
    const handleDragEnter: React.DragEventHandler<HTMLDivElement> = event => {
      chooserSlotOnDragEnter?.(event);
      if (event.defaultPrevented || !additionsEnabled || disableDrop || !externalFileDrag(event)) return;
      event.preventDefault();
      dragDepth.current += 1;
      const items = Array.from(event.dataTransfer.items);
      setDragReject(items.some(item => !acceptsVireoDragType(item.type, accept)));
      setDragActive(true);
    };
    const handleDragOver: React.DragEventHandler<HTMLDivElement> = event => {
      chooserSlotOnDragOver?.(event);
      if (event.defaultPrevented || !additionsEnabled || disableDrop || !externalFileDrag(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };
    const handleDragLeave: React.DragEventHandler<HTMLDivElement> = event => {
      chooserSlotOnDragLeave?.(event);
      if (event.defaultPrevented || !dragActive) return;
      event.preventDefault();
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) {
        setDragActive(false);
        setDragReject(false);
      }
    };
    const handleDrop: React.DragEventHandler<HTMLDivElement> = event => {
      chooserSlotOnDrop?.(event);
      if (event.defaultPrevented || !additionsEnabled || disableDrop || !externalFileDrag(event)) return;
      event.preventDefault();
      dragDepth.current = 0;
      setDragActive(false);
      setDragReject(false);
      processFiles(Array.from(event.dataTransfer.files));
    };

    const moveFile = (from: number, to: number) => {
      if (
        !interactive ||
        !reorderable ||
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= files.length ||
        to >= files.length
      )
        return;
      const next = [...files];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      field.handleChange(next);
      setAnnouncement(reorderAnnouncement(moved, from, to, next.length));
    };

    const rejectionMessage = (rejection: VireoFileListRejection): React.ReactNode => {
      switch (rejection.reason) {
        case "type":
          return resolveMessage(unsupportedTypeText, rejection.file);
        case "size":
          return resolveMessage(fileTooLargeText, rejection.file, normalizedMaxSize ?? 0);
        case "duplicate":
          return resolveMessage(duplicateFileText, rejection.file);
        case "maxFiles":
          return resolveMessage(maxFilesText, rejection.file, normalizedMaxFiles ?? 0);
        case "totalSize":
          return resolveMessage(maxTotalSizeText, rejection.file, normalizedMaxTotalSize ?? 0);
      }
    };

    return (
      <VireoFormFileListFieldRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <VireoFormFileListFieldInput
          {...inputSlotOther}
          as={slots.input ?? "input"}
          ref={mergedInputRef}
          ownerState={ownerState}
          accept={accept}
          aria-describedby={describedBy}
          aria-invalid={ownerState.rejected || ownerState.invalid || undefined}
          aria-required={required || undefined}
          capture={capture}
          className={joinClassNames(classes.input, inputSlotClassName)}
          disabled={!additionsEnabled}
          id={inputId}
          multiple
          name={field.name}
          onChange={handleInputChange}
          tabIndex={-1}
          type="file"
        />
        <VireoFormFileListFieldChooser
          {...chooserSlotOther}
          as={slots.chooser}
          ownerState={ownerState}
          aria-disabled={!additionsEnabled || undefined}
          className={joinClassNames(classes.chooser, chooserSlotClassName)}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <VireoFormFileListFieldSelectButton
            {...selectButtonSlotOther}
            as={slots.selectButton}
            ownerState={ownerState}
            aria-controls={inputId}
            className={joinClassNames(classes.selectButton, selectButtonSlotClassName)}
            disabled={!additionsEnabled}
            onBlur={event => {
              selectButtonSlotOnBlur?.(event);
              if (!event.defaultPrevented) field.handleBlur();
            }}
            onClick={handleSelectClick}
            variant="outlined"
          >
            {files.length > 0 ? addMoreFilesLabel : chooseFilesLabel}
          </VireoFormFileListFieldSelectButton>
          {capacityReason ? (
            <VireoFormFileListFieldCapacityText
              {...capacityTextSlotOther}
              as={slots.capacityText}
              ownerState={ownerState}
              className={joinClassNames(classes.capacityText, capacityTextSlotClassName)}
              variant="body2"
            >
              {resolveMessage(
                capacityReachedText,
                capacityReason,
                capacityReason === "maxFiles" ? (normalizedMaxFiles ?? 0) : (normalizedMaxTotalSize ?? 0),
              )}
            </VireoFormFileListFieldCapacityText>
          ) : (
            <VireoFormFileListFieldDropHint
              {...dropHintSlotOther}
              as={slots.dropHint}
              ownerState={ownerState}
              className={joinClassNames(classes.dropHint, dropHintSlotClassName)}
              variant="body2"
            >
              {dragActive ? (dragReject ? "Some files are not accepted." : dropActiveText) : dropHint}
            </VireoFormFileListFieldDropHint>
          )}
        </VireoFormFileListFieldChooser>
        <VireoFormFileListFieldToolbar
          {...toolbarSlotOther}
          as={slots.toolbar}
          ownerState={ownerState}
          className={joinClassNames(classes.toolbar, toolbarSlotClassName)}
        >
          <VireoFormFileListFieldFileCount
            {...fileCountSlotOther}
            as={slots.fileCount}
            ownerState={ownerState}
            className={joinClassNames(classes.fileCount, fileCountSlotClassName)}
            variant="caption"
          >
            {formatFileCount(files.length, normalizedMaxFiles)}
            {normalizedMaxTotalSize !== undefined && (
              <>
                {" "}
                · {formatFileSize(totalSize)} of {formatFileSize(normalizedMaxTotalSize)}
              </>
            )}
          </VireoFormFileListFieldFileCount>
          {files.length >= 2 && clearable && !hideClearAll && (
            <VireoFormFileListFieldClearAllButton
              {...clearAllButtonSlotOther}
              as={slots.clearAllButton}
              ownerState={ownerState}
              aria-label={clearAllFilesLabel}
              className={joinClassNames(classes.clearAllButton, clearAllButtonSlotClassName)}
              disabled={!interactive}
              onClick={handleClearAllClick}
              size="small"
            >
              {clearAllLabel}
            </VireoFormFileListFieldClearAllButton>
          )}
        </VireoFormFileListFieldToolbar>
        {files.length > 0 && (
          <VireoFormFileListFieldList
            {...listSlotOther}
            as={slots.list}
            component="ul"
            ownerState={ownerState}
            className={joinClassNames(classes.list, listSlotClassName)}
          >
            {files.map((file, index) => {
              const rowId = rowIds[index];
              const rowOwnerState: VireoFormFileListFieldRowOwnerState = {
                ...ownerState,
                count: files.length,
                dragging: draggingIndex === index,
                file,
                first: index === 0,
                index,
                last: index === files.length - 1,
                previewed: PreviewRenderer !== undefined,
              };
              const rowProps = resolveSlotProps(slotProps.fileRow, rowOwnerState);
              const { className: rowClassName, onDragOver: rowOnDragOver, onDrop: rowOnDrop, ...rowOther } = rowProps;
              const reorderProps = resolveSlotProps(slotProps.reorderHandle, rowOwnerState);
              const {
                className: reorderClassName,
                onDragEnd: reorderOnDragEnd,
                onDragStart: reorderOnDragStart,
                onKeyDown: reorderOnKeyDown,
                ...reorderOther
              } = reorderProps;
              const metadataProps = resolveSlotProps(slotProps.metadata, rowOwnerState);
              const { className: metadataClassName, ref: metadataRef, ...metadataOther } = metadataProps;
              const nameProps = resolveSlotProps(slotProps.fileName, rowOwnerState);
              const { className: nameClassName, ref: nameRef, ...nameOther } = nameProps;
              const sizeProps = resolveSlotProps(slotProps.fileSize, rowOwnerState);
              const { className: sizeClassName, ref: sizeRef, ...sizeOther } = sizeProps;
              const removeProps = resolveSlotProps(slotProps.removeButton, rowOwnerState);
              const { className: removeClassName, onClick: removeOnClick, ...removeOther } = removeProps;
              const previewProps = resolveSlotProps(slotProps.previewContainer, rowOwnerState);
              const { className: previewClassName, ...previewOther } = previewProps;
              const canReorder = interactive && reorderable && files.length > 1;

              return (
                <VireoFormFileListFieldFileRow
                  {...rowOther}
                  as={slots.fileRow}
                  component="li"
                  key={rowId}
                  ownerState={rowOwnerState}
                  aria-label={filePositionText(file, index, files.length)}
                  className={joinClassNames(classes.fileRow, rowClassName)}
                  data-dragging={rowOwnerState.dragging}
                  data-file-index={index}
                  data-previewed={rowOwnerState.previewed}
                  onDragOver={event => {
                    rowOnDragOver?.(event);
                    if (!event.defaultPrevented && draggingIndex !== undefined) {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }
                  }}
                  onDrop={event => {
                    rowOnDrop?.(event);
                    if (!event.defaultPrevented && draggingIndex !== undefined) {
                      event.preventDefault();
                      moveFile(draggingIndex, index);
                      setDraggingIndex(undefined);
                    }
                  }}
                >
                  {reorderable && (
                    <VireoFormFileListFieldReorderHandle
                      {...reorderOther}
                      as={slots.reorderHandle}
                      ownerState={rowOwnerState}
                      aria-keyshortcuts="ArrowUp ArrowDown"
                      aria-label={reorderFileLabel(file, index, files.length)}
                      className={joinClassNames(classes.reorderHandle, reorderClassName)}
                      disabled={!canReorder}
                      draggable={canReorder}
                      onDragEnd={event => {
                        reorderOnDragEnd?.(event);
                        if (!event.defaultPrevented) setDraggingIndex(undefined);
                      }}
                      onDragStart={event => {
                        reorderOnDragStart?.(event);
                        if (event.defaultPrevented || !canReorder) return;
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData(INTERNAL_REORDER_TYPE, String(index));
                        setDraggingIndex(index);
                      }}
                      onKeyDown={event => {
                        reorderOnKeyDown?.(event);
                        if (event.defaultPrevented || !canReorder) return;
                        if (event.key === "ArrowUp" && index > 0) {
                          event.preventDefault();
                          moveFile(index, index - 1);
                        } else if (event.key === "ArrowDown" && index < files.length - 1) {
                          event.preventDefault();
                          moveFile(index, index + 1);
                        }
                      }}
                      size="small"
                    >
                      <DragIndicatorIcon fontSize="small" />
                    </VireoFormFileListFieldReorderHandle>
                  )}
                  <VireoFormFileListFieldMetadata
                    {...metadataOther}
                    as={slots.metadata}
                    ref={displayedNames.metadataRef(rowId, metadataRef)}
                    ownerState={rowOwnerState}
                    className={joinClassNames(classes.metadata, metadataClassName)}
                  >
                    <VireoFormFileListFieldFileName
                      {...nameOther}
                      as={slots.fileName}
                      ref={displayedNames.fileNameRef(rowId, nameRef)}
                      ownerState={rowOwnerState}
                      aria-label={file.name}
                      className={joinClassNames(classes.fileName, nameClassName)}
                      title={file.name}
                      variant="body2"
                    >
                      {displayedNames.displayed[rowId] ?? file.name}
                    </VireoFormFileListFieldFileName>
                    {!hideFileSize && (
                      <VireoFormFileListFieldFileSize
                        {...sizeOther}
                        as={slots.fileSize}
                        ref={displayedNames.fileSizeRef(rowId, sizeRef)}
                        ownerState={rowOwnerState}
                        className={joinClassNames(classes.fileSize, sizeClassName)}
                        variant="caption"
                      >
                        {formatFileSize(file.size)}
                      </VireoFormFileListFieldFileSize>
                    )}
                  </VireoFormFileListFieldMetadata>
                  {clearable && (
                    <VireoFormFileListFieldRemoveButton
                      {...removeOther}
                      as={slots.removeButton}
                      ownerState={rowOwnerState}
                      aria-label={removeFileLabel(file, index)}
                      className={joinClassNames(classes.removeButton, removeClassName)}
                      disabled={!interactive}
                      onClick={event => {
                        removeOnClick?.(event);
                        if (event.defaultPrevented || !interactive) return;
                        const next = files.filter((_item, itemIndex) => itemIndex !== index);
                        setRejections([]);
                        field.handleChange(next);
                        onFileRemoved?.(file, index);
                      }}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </VireoFormFileListFieldRemoveButton>
                  )}
                  {PreviewRenderer && (
                    <VireoFormFileListFieldPreviewContainer
                      {...previewOther}
                      as={slots.previewContainer}
                      ownerState={rowOwnerState}
                      className={joinClassNames(classes.previewContainer, previewClassName)}
                    >
                      <PreviewRenderer file={file} />
                    </VireoFormFileListFieldPreviewContainer>
                  )}
                </VireoFormFileListFieldFileRow>
              );
            })}
          </VireoFormFileListFieldList>
        )}
        {rejections.length > 0 && (
          <VireoFormFileListFieldRejectionList
            {...rejectionListSlotOther}
            as={slots.rejectionList}
            component="ul"
            ownerState={ownerState}
            aria-live="polite"
            className={joinClassNames(classes.rejectionList, rejectionListSlotClassName)}
            id={generatedRejectionId}
          >
            {rejections.map((rejection, index) => {
              const rejectionOwnerState: VireoFormFileListFieldRejectionOwnerState = {
                ...ownerState,
                index,
                rejection,
              };
              const itemProps = resolveSlotProps(slotProps.rejectionItem, rejectionOwnerState);
              const { className: itemClassName, ...itemOther } = itemProps;
              return (
                <VireoFormFileListFieldRejectionItem
                  {...itemOther}
                  as={slots.rejectionItem}
                  component="li"
                  key={`${getFileKey(rejection.file)}-${rejection.reason}-${index}`}
                  ownerState={rejectionOwnerState}
                  className={joinClassNames(classes.rejectionItem, itemClassName)}
                  title={rejection.file.name}
                  variant="caption"
                >
                  <strong>{rejection.file.name}</strong> — {rejectionMessage(rejection)}
                </VireoFormFileListFieldRejectionItem>
              );
            })}
          </VireoFormFileListFieldRejectionList>
        )}
        {(formattedError !== undefined || helperText !== undefined) && (
          <VireoFormFileListFieldHelperText
            {...helperTextSlotOther}
            as={slots.helperText}
            ownerState={ownerState}
            className={joinClassNames(classes.helperText, helperTextSlotClassName)}
            error={ownerState.invalid}
            id={helperId}
          >
            {formattedError ?? helperText}
          </VireoFormFileListFieldHelperText>
        )}
        <VireoFormFileListFieldLiveRegion
          {...liveRegionSlotOther}
          as={slots.liveRegion}
          ownerState={ownerState}
          aria-live="polite"
          className={joinClassNames(classes.liveRegion, liveRegionSlotClassName)}
        >
          {announcement}
        </VireoFormFileListFieldLiveRegion>
      </VireoFormFileListFieldRoot>
    );
  },
);

VireoFormFileListField.displayName = VIREO_FORM_FILE_LIST_FIELD_NAME;
