import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import {
  acceptsVireoDragType,
  acceptsVireoFile,
  formatVireoFileSize,
  truncateVireoFileName,
} from "@/capabilities/forms/components/forms/VireoFormFileField/internal/fileField.utils";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import CloseIcon from "@mui/icons-material/Close";
import { unstable_composeClasses as composeClasses, type ButtonProps, type IconButtonProps } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import { type VireoFormFileFieldClassKey, getVireoFormFileFieldUtilityClass } from "./VireoFormFileField.classes";
import { VIREO_FORM_FILE_FIELD_NAME, type VireoFormFileFieldSlotName } from "./VireoFormFileField.identity";
import {
  VireoFormFileFieldClearButton,
  VireoFormFileFieldDropOverlay,
  VireoFormFileFieldFileName,
  VireoFormFileFieldFileSize,
  VireoFormFileFieldHelperText,
  VireoFormFileFieldInput,
  VireoFormFileFieldMetadata,
  VireoFormFileFieldPreviewContainer,
  VireoFormFileFieldRoot,
  VireoFormFileFieldSelectButton,
  VireoFormFileFieldSelection,
} from "./VireoFormFileField.styled";
import type {
  VireoFileRejection,
  VireoFormFileFieldOwnerState,
  VireoFormFileFieldProps,
} from "./VireoFormFileField.types";

function useUtilityClasses(ownerState: VireoFormFileFieldOwnerState, classes?: VireoFormFileFieldProps["classes"]) {
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
      ],
      selection: ["selection"],
      input: ["input"],
      selectButton: ["selectButton"],
      metadata: ["metadata"],
      fileName: ["fileName"],
      fileSize: ["fileSize"],
      clearButton: ["clearButton"],
      dropOverlay: ["dropOverlay"],
      previewContainer: ["previewContainer"],
      helperText: ["helperText"],
    } as const satisfies UtilityClassSlotMap<VireoFormFileFieldSlotName, VireoFormFileFieldClassKey>,
    getVireoFormFileFieldUtilityClass,
    classes,
  );
}

function resolveMessage<TArgs extends unknown[]>(
  value: React.ReactNode | ((...args: TArgs) => React.ReactNode),
  ...args: TArgs
): React.ReactNode {
  return typeof value === "function" ? value(...args) : value;
}

function useDisplayedFileName(
  fileName: string | undefined,
  mode: NonNullable<VireoFormFileFieldProps["fileNameTruncation"]>,
) {
  const elementRef = React.useRef<HTMLElement | null>(null);
  const [displayed, setDisplayed] = React.useState(fileName ?? "");

  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element || !fileName) {
      setDisplayed(fileName ?? "");
      return;
    }

    const update = () => {
      const width = element.clientWidth;
      if (width <= 0) {
        setDisplayed(fileName);
        return;
      }
      const style = window.getComputedStyle(element);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        setDisplayed(fileName);
        return;
      }
      context.font = style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      setDisplayed(truncateVireoFileName(fileName, mode, width, candidate => context.measureText(candidate).width));
    };

    update();
    if (typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fileName, mode]);

  return { displayed, elementRef };
}

/** Binds single-file picker, drop, rejection, metadata, and optional preview behavior to `form.Field`. */
export const VireoFormFileField = React.forwardRef<HTMLDivElement, VireoFormFileFieldProps>(
  function VireoFormFileField(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_FILE_FIELD_NAME });
    const {
      accept,
      capture,
      chooseFileLabel = "Choose file",
      className,
      classes: classesProp,
      clearable = true,
      clearFileLabel = "Clear selected file",
      disabled = false,
      disableDrop = false,
      dropActiveText = "Drop file here",
      emptyText = "No file selected",
      error = false,
      errorDisplay: errorDisplayProp,
      fileNameTruncation = "middle",
      fileTooLargeText = (_file: File, maximum: number) => `File must be ${formatVireoFileSize(maximum)} or smaller.`,
      formatError: formatErrorProp,
      formatFileSize = formatVireoFileSize,
      helperText,
      hideFileSize = false,
      inputRef,
      maxSize,
      onFileRejected,
      previewRenderer: PreviewRenderer,
      readOnly = false,
      replaceFileLabel = "Replace file",
      required = false,
      slotProps = {},
      slots = {},
      style,
      sx,
      unsupportedTypeText = "This file type is not accepted.",
      ...other
    } = props;
    const field = useVireoFieldContext<File | null>();
    const formContext = useVireoFormContext();
    const fieldState = useStore(field.store, current => ({
      errors: current.meta.errors as readonly unknown[],
      invalid: !current.meta.isValid,
      touched: current.meta.isTouched,
      validating: current.meta.isValidating,
      value: current.value,
    }));
    const submitting = useStore(field.form.store, current => current.isSubmitting);
    const [rejection, setRejection] = React.useState<VireoFileRejection>();
    const [dragActive, setDragActive] = React.useState(false);
    const [dragReject, setDragReject] = React.useState(false);
    const dragDepth = React.useRef(0);
    const nativeInput = React.useRef<HTMLInputElement | null>(null);
    const generatedInputId = React.useId();
    const generatedHelperId = React.useId();
    const value = typeof File !== "undefined" && fieldState.value instanceof File ? fieldState.value : null;
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
    const rejectionMessage = rejection
      ? rejection.reason === "type"
        ? resolveMessage(unsupportedTypeText, rejection.file)
        : resolveMessage(fileTooLargeText, rejection.file, maxSize ?? 0)
      : undefined;
    const effectiveHelperText = rejectionMessage ?? formattedError ?? helperText;
    const ownerState: VireoFormFileFieldOwnerState = {
      disabled,
      dragActive,
      dragReject,
      empty: value === null,
      errorVisible,
      invalid: error || fieldState.invalid,
      populated: value !== null,
      readOnly,
      rejected: rejection !== undefined,
      submitting,
      touched: fieldState.touched,
      validating: fieldState.validating,
    };
    const classes = useUtilityClasses(ownerState, classesProp);
    const { displayed: displayedFileName, elementRef: fileNameRef } = useDisplayedFileName(
      value?.name,
      fileNameTruncation,
    );

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const resolvedSelectionSlotProps = resolveSlotProps(slotProps.selection, ownerState);
    const { className: selectionSlotClassName, ...selectionSlotOther } = resolvedSelectionSlotProps;
    const resolvedInputSlotProps = resolveSlotProps(slotProps.input, ownerState);
    const {
      className: inputSlotClassName,
      id: inputSlotId,
      onChange: inputSlotOnChange,
      ref: inputSlotRef,
      ...inputSlotOther
    } = resolvedInputSlotProps;
    const resolvedSelectButtonSlotProps = resolveSlotProps(slotProps.selectButton, ownerState);
    const {
      className: selectButtonSlotClassName,
      onBlur: selectButtonSlotOnBlur,
      onClick: selectButtonSlotOnClick,
      ...selectButtonSlotOther
    } = resolvedSelectButtonSlotProps;
    const resolvedMetadataSlotProps = resolveSlotProps(slotProps.metadata, ownerState);
    const { className: metadataSlotClassName, ...metadataSlotOther } = resolvedMetadataSlotProps;
    const resolvedFileNameSlotProps = resolveSlotProps(slotProps.fileName, ownerState);
    const { className: fileNameSlotClassName, ref: fileNameSlotRef, ...fileNameSlotOther } = resolvedFileNameSlotProps;
    const resolvedFileSizeSlotProps = resolveSlotProps(slotProps.fileSize, ownerState);
    const { className: fileSizeSlotClassName, ...fileSizeSlotOther } = resolvedFileSizeSlotProps;
    const resolvedClearButtonSlotProps = resolveSlotProps(slotProps.clearButton, ownerState);
    const {
      className: clearButtonSlotClassName,
      onClick: clearButtonSlotOnClick,
      ...clearButtonSlotOther
    } = resolvedClearButtonSlotProps;
    const resolvedDropOverlaySlotProps = resolveSlotProps(slotProps.dropOverlay, ownerState);
    const { className: dropOverlaySlotClassName, ...dropOverlaySlotOther } = resolvedDropOverlaySlotProps;
    const resolvedPreviewContainerSlotProps = resolveSlotProps(slotProps.previewContainer, ownerState);
    const { className: previewContainerSlotClassName, ...previewContainerSlotOther } =
      resolvedPreviewContainerSlotProps;
    const resolvedHelperTextSlotProps = resolveSlotProps(slotProps.helperText, ownerState);
    const {
      className: helperTextSlotClassName,
      id: helperTextSlotId,
      ...helperTextSlotOther
    } = resolvedHelperTextSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const mergedInputRef = useForkRef(nativeInput, inputRef, inputSlotRef);
    const mergedFileNameRef = useForkRef(fileNameRef, fileNameSlotRef);
    const inputId = inputSlotId ?? generatedInputId;
    const helperId = helperTextSlotId ?? generatedHelperId;
    const interactive = !disabled && !readOnly;

    React.useEffect(() => {
      if (nativeInput.current) nativeInput.current.value = "";
    }, [value]);

    const reject = React.useCallback(
      (file: File, reason: VireoFileRejection["reason"]) => {
        const next = { file, reason } satisfies VireoFileRejection;
        setRejection(next);
        onFileRejected?.(next);
      },
      [onFileRejected],
    );

    const selectFile = React.useCallback(
      (file: File) => {
        if (!acceptsVireoFile(file, accept)) return reject(file, "type");
        if (maxSize !== undefined && file.size > maxSize) return reject(file, "size");
        setRejection(undefined);
        field.handleChange(file);
      },
      [accept, field, maxSize, reject],
    );

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
      inputSlotOnChange?.(event);
      if (!event.defaultPrevented && interactive) {
        const file = event.currentTarget.files?.[0];
        if (file) selectFile(file);
      }
      event.currentTarget.value = "";
    };

    const handleSelectClick: NonNullable<ButtonProps["onClick"]> = event => {
      selectButtonSlotOnClick?.(event);
      if (!event.defaultPrevented && interactive) nativeInput.current?.click();
    };

    const handleClearClick: NonNullable<IconButtonProps["onClick"]> = event => {
      clearButtonSlotOnClick?.(event);
      if (event.defaultPrevented || !interactive) return;
      setRejection(undefined);
      field.handleChange(null);
      if (nativeInput.current) nativeInput.current.value = "";
    };

    const handleDragEnter: React.DragEventHandler<HTMLDivElement> = event => {
      if (!interactive || disableDrop || !event.dataTransfer.types.includes("Files")) return;
      event.preventDefault();
      dragDepth.current += 1;
      const type = event.dataTransfer.items[0]?.type ?? "";
      setDragReject(!acceptsVireoDragType(type, accept));
      setDragActive(true);
    };
    const handleDragOver: React.DragEventHandler<HTMLDivElement> = event => {
      if (!interactive || disableDrop || !event.dataTransfer.types.includes("Files")) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };
    const handleDragLeave: React.DragEventHandler<HTMLDivElement> = event => {
      if (!dragActive) return;
      event.preventDefault();
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) {
        setDragActive(false);
        setDragReject(false);
      }
    };
    const handleDrop: React.DragEventHandler<HTMLDivElement> = event => {
      if (!interactive || disableDrop) return;
      event.preventDefault();
      dragDepth.current = 0;
      setDragActive(false);
      setDragReject(false);
      const file = event.dataTransfer.files[0];
      if (file) selectFile(file);
    };

    return (
      <VireoFormFileFieldRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <VireoFormFileFieldSelection
          {...selectionSlotOther}
          as={slots.selection}
          ownerState={ownerState}
          className={joinClassNames(classes.selection, selectionSlotClassName)}
        >
          <VireoFormFileFieldInput
            {...inputSlotOther}
            as={slots.input ?? "input"}
            ref={mergedInputRef}
            ownerState={ownerState}
            accept={accept}
            aria-describedby={effectiveHelperText ? helperId : undefined}
            aria-invalid={ownerState.rejected || ownerState.invalid || undefined}
            capture={capture}
            className={joinClassNames(classes.input, inputSlotClassName)}
            disabled={disabled}
            id={inputId}
            multiple={false}
            name={field.name}
            onChange={handleInputChange}
            required={required}
            tabIndex={-1}
            type="file"
          />
          <VireoFormFileFieldSelectButton
            {...selectButtonSlotOther}
            as={slots.selectButton}
            ownerState={ownerState}
            aria-controls={inputId}
            className={joinClassNames(classes.selectButton, selectButtonSlotClassName)}
            disabled={!interactive}
            onBlur={event => {
              selectButtonSlotOnBlur?.(event);
              if (!event.defaultPrevented) field.handleBlur();
            }}
            onClick={handleSelectClick}
            variant="outlined"
          >
            {value ? replaceFileLabel : chooseFileLabel}
          </VireoFormFileFieldSelectButton>
          <VireoFormFileFieldMetadata
            {...metadataSlotOther}
            as={slots.metadata}
            ownerState={ownerState}
            className={joinClassNames(classes.metadata, metadataSlotClassName)}
          >
            <VireoFormFileFieldFileName
              {...fileNameSlotOther}
              as={slots.fileName}
              ref={mergedFileNameRef}
              ownerState={ownerState}
              aria-label={value?.name}
              className={joinClassNames(classes.fileName, fileNameSlotClassName)}
              title={value?.name}
              variant="body2"
            >
              {value ? displayedFileName : emptyText}
            </VireoFormFileFieldFileName>
            {value && !hideFileSize && (
              <VireoFormFileFieldFileSize
                {...fileSizeSlotOther}
                as={slots.fileSize}
                ownerState={ownerState}
                className={joinClassNames(classes.fileSize, fileSizeSlotClassName)}
                variant="caption"
              >
                {formatFileSize(value.size)}
              </VireoFormFileFieldFileSize>
            )}
          </VireoFormFileFieldMetadata>
          {value && clearable && (
            <VireoFormFileFieldClearButton
              {...clearButtonSlotOther}
              as={slots.clearButton}
              ownerState={ownerState}
              aria-label={clearFileLabel}
              className={joinClassNames(classes.clearButton, clearButtonSlotClassName)}
              disabled={!interactive}
              onClick={handleClearClick}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </VireoFormFileFieldClearButton>
          )}
        </VireoFormFileFieldSelection>
        {dragActive && (
          <VireoFormFileFieldDropOverlay
            {...dropOverlaySlotOther}
            as={slots.dropOverlay}
            ownerState={ownerState}
            aria-hidden="true"
            className={joinClassNames(classes.dropOverlay, dropOverlaySlotClassName)}
          >
            {dragReject
              ? typeof unsupportedTypeText === "function"
                ? "This file type is not accepted."
                : unsupportedTypeText
              : dropActiveText}
          </VireoFormFileFieldDropOverlay>
        )}
        {value && PreviewRenderer && (
          <VireoFormFileFieldPreviewContainer
            {...previewContainerSlotOther}
            as={slots.previewContainer}
            ownerState={ownerState}
            className={joinClassNames(classes.previewContainer, previewContainerSlotClassName)}
          >
            <PreviewRenderer file={value} />
          </VireoFormFileFieldPreviewContainer>
        )}
        {effectiveHelperText !== undefined && effectiveHelperText !== null && (
          <VireoFormFileFieldHelperText
            {...helperTextSlotOther}
            as={slots.helperText}
            ownerState={ownerState}
            className={joinClassNames(classes.helperText, helperTextSlotClassName)}
            error={ownerState.rejected || ownerState.invalid}
            id={helperId}
            role={ownerState.rejected ? "alert" : undefined}
          >
            {effectiveHelperText}
          </VireoFormFileFieldHelperText>
        )}
      </VireoFormFileFieldRoot>
    );
  },
);

VireoFormFileField.displayName = VIREO_FORM_FILE_FIELD_NAME;
