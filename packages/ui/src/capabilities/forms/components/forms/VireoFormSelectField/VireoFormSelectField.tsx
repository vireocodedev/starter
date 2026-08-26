import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import Close from "@mui/icons-material/Close";
import {
  InputAdornment,
  Typography,
  unstable_composeClasses as composeClasses,
  type SelectProps,
  type SxProps,
  type TextFieldProps,
} from "@mui/material";
import { type Theme, useTheme, useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import { type VireoFormSelectFieldClassKey, getVireoFormSelectFieldUtilityClass } from "./VireoFormSelectField.classes";
import { VIREO_FORM_SELECT_FIELD_NAME, type VireoFormSelectFieldSlotName } from "./VireoFormSelectField.identity";
import {
  VireoFormSelectFieldClearButton,
  VireoFormSelectFieldFilledInput,
  VireoFormSelectFieldFormHelperText,
  VireoFormSelectFieldInputLabel,
  VireoFormSelectFieldOption,
  VireoFormSelectFieldOptionText,
  VireoFormSelectFieldOutlinedInput,
  VireoFormSelectFieldRoot,
  VireoFormSelectFieldSelect,
  VireoFormSelectFieldStandardInput,
} from "./VireoFormSelectField.styled";
import {
  type VireoFormSelectFieldOwnerState,
  type VireoFormSelectFieldProps,
  type VireoFormSelectFieldValue,
} from "./VireoFormSelectField.types";

type SelectBlurHandler = NonNullable<SelectProps<unknown>["onBlur"]>;
type SelectChangeHandler = NonNullable<SelectProps<unknown>["onChange"]>;

function useUtilityClasses(ownerState: VireoFormSelectFieldOwnerState, classes?: VireoFormSelectFieldProps["classes"]) {
  return composeClasses(
    {
      root: [
        "root",
        ownerState.dirty && "dirty",
        ownerState.touched && "touched",
        ownerState.invalid && "invalid",
        ownerState.errorVisible && "errorVisible",
        ownerState.validating && "validating",
        ownerState.submitting && "submitting",
        ownerState.disabled && "disabled",
        ownerState.readOnly && "readOnly",
        ownerState.hasValue && "hasValue",
      ],
      inputLabel: ["inputLabel"],
      input: ["input"],
      htmlInput: ["htmlInput"],
      select: ["select"],
      option: ["option"],
      optionText: ["optionText"],
      clearButton: ["clearButton"],
      formHelperText: ["formHelperText"],
    } as const satisfies UtilityClassSlotMap<VireoFormSelectFieldSlotName, VireoFormSelectFieldClassKey>,
    getVireoFormSelectFieldUtilityClass,
    classes,
  );
}

function isAriaInvalid(value: unknown): boolean {
  return value === true || value === "true";
}

function resolveHtmlInputThemeSx<TOption, TValue extends VireoFormSelectFieldValue>(
  theme: Theme,
  props: VireoFormSelectFieldProps<TOption, TValue>,
  ownerState: VireoFormSelectFieldOwnerState,
): SxProps<Theme> | undefined {
  const styleOverride = theme.components?.[VIREO_FORM_SELECT_FIELD_NAME]?.styleOverrides?.htmlInput;

  if (typeof styleOverride === "function") {
    return styleOverride({ ...props, ownerState, theme } as never) as SxProps<Theme>;
  }

  return styleOverride as SxProps<Theme> | undefined;
}

function VireoFormSelectFieldImpl<TOption, TValue extends VireoFormSelectFieldValue>(
  inProps: VireoFormSelectFieldProps<TOption, TValue>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({ props: inProps, name: VIREO_FORM_SELECT_FIELD_NAME }) as VireoFormSelectFieldProps<
    TOption,
    TValue
  >;
  const theme = useTheme();
  const {
    className,
    classes: classesProp,
    clearIcon,
    clearLabel = "Clear selection",
    disabled = false,
    disableClearable = false,
    error = false,
    errorDisplay: errorDisplayProp,
    formatError: formatErrorProp,
    fullWidth = true,
    getOptionDisabled,
    getOptionValue,
    helperText = " ",
    inputRef,
    label,
    onBlur,
    onValueChange,
    options,
    placeholder,
    readOnly = false,
    renderOption,
    required = false,
    slotProps = {},
    slots = {},
    style,
    sx,
    variant = "outlined",
    ...other
  } = props;
  const field = useVireoFieldContext<TValue | null>();
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
  const ownerState: VireoFormSelectFieldOwnerState = {
    dirty: fieldState.dirty,
    disabled,
    errorVisible,
    hasValue: fieldState.value !== null,
    invalid: fieldState.invalid,
    readOnly,
    submitting,
    touched: fieldState.touched,
    validating: fieldState.validating,
  };
  const classes = useUtilityClasses(ownerState, classesProp);
  const htmlInputThemeSx = resolveHtmlInputThemeSx(theme, props, ownerState);

  const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
  const {
    className: rootSlotClassName,
    ref: rootSlotRef,
    style: rootSlotStyle,
    sx: rootSlotSx,
    ...rootSlotOther
  } = resolvedRootSlotProps;
  const resolvedInputLabelSlotProps = resolveSlotProps(slotProps.inputLabel, ownerState);
  const {
    className: inputLabelSlotClassName,
    shrink: inputLabelSlotShrink,
    ...inputLabelSlotOther
  } = resolvedInputLabelSlotProps;
  const resolvedInputSlotProps = resolveSlotProps(slotProps.input, ownerState);
  const {
    className: inputSlotClassName,
    endAdornment: inputSlotEndAdornment,
    readOnly: inputSlotReadOnly,
    ...inputSlotOther
  } = resolvedInputSlotProps;
  const resolvedHtmlInputSlotProps = resolveSlotProps(slotProps.htmlInput, ownerState);
  const {
    "aria-invalid": htmlInputAriaInvalid,
    className: htmlInputSlotClassName,
    ref: htmlInputSlotRef,
    sx: htmlInputSlotSx,
    ...htmlInputSlotOther
  } = resolvedHtmlInputSlotProps;
  const resolvedSelectSlotProps = resolveSlotProps(slotProps.select, ownerState);
  const {
    SelectDisplayProps: selectSlotDisplayProps,
    className: selectSlotClassName,
    displayEmpty: _selectSlotDisplayEmpty,
    inputProps: selectSlotInputProps,
    multiple: _selectSlotMultiple,
    native: _selectSlotNative,
    onBlur: selectSlotOnBlur,
    onChange: selectSlotOnChange,
    renderValue: selectSlotRenderValue,
    ...selectSlotOther
  } = resolvedSelectSlotProps;
  void _selectSlotDisplayEmpty;
  void _selectSlotMultiple;
  void _selectSlotNative;
  const resolvedOptionSlotProps = resolveSlotProps(slotProps.option, ownerState);
  const { className: optionSlotClassName, disabled: optionSlotDisabled, ...optionSlotOther } = resolvedOptionSlotProps;
  const resolvedOptionTextSlotProps = resolveSlotProps(slotProps.optionText, ownerState);
  const { className: optionTextSlotClassName, ...optionTextSlotOther } = resolvedOptionTextSlotProps;
  const resolvedClearButtonSlotProps = resolveSlotProps(slotProps.clearButton, ownerState);
  const {
    children: clearButtonSlotChildren,
    className: clearButtonSlotClassName,
    onClick: clearButtonSlotOnClick,
    onMouseDown: clearButtonSlotOnMouseDown,
    ...clearButtonSlotOther
  } = resolvedClearButtonSlotProps;
  const resolvedFormHelperTextSlotProps = resolveSlotProps(slotProps.formHelperText, ownerState);
  const { className: formHelperTextSlotClassName, ...formHelperTextSlotOther } = resolvedFormHelperTextSlotProps;
  const rootRef = useForkRef(forwardedRef, rootSlotRef);
  const nativeInputRef = useForkRef(inputRef, htmlInputSlotRef);

  const selectedOption = options.find(option => getOptionValue(option) === fieldState.value);
  const effectiveError = error || fieldState.invalid;
  const effectiveHelperText = errorVisible ? formattedError : helperText;
  const clearable = ownerState.hasValue && !disabled && !readOnly && !disableClearable;

  const handleChange: SelectChangeHandler = (event, child) => {
    selectSlotOnChange?.(event, child);
    if (event.defaultPrevented) return;

    const nextValue = event.target.value === "" ? null : (event.target.value as TValue);
    onValueChange?.(nextValue);
    field.handleChange(nextValue);
  };

  const handleBlur: SelectBlurHandler = event => {
    selectSlotOnBlur?.(event);
    if (event.defaultPrevented) return;
    onBlur?.(event);
    if (event.defaultPrevented) return;
    field.handleBlur();
  };

  const handleClearMouseDown: React.MouseEventHandler<HTMLButtonElement> = event => {
    clearButtonSlotOnMouseDown?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClearClick: React.MouseEventHandler<HTMLButtonElement> = event => {
    clearButtonSlotOnClick?.(event);
    if (event.defaultPrevented) return;
    event.stopPropagation();
    onValueChange?.(null);
    field.handleChange(null);
  };

  const renderSelectedValue = (value: unknown): React.ReactNode => {
    if (selectSlotRenderValue) return selectSlotRenderValue(value);
    if (selectedOption) return renderOption(selectedOption);
    return placeholder === undefined ? null : <Typography color="text.secondary">{placeholder}</Typography>;
  };

  const clearAdornment = clearable ? (
    <InputAdornment position="end">
      <VireoFormSelectFieldClearButton
        {...clearButtonSlotOther}
        as={slots.clearButton}
        ownerState={ownerState}
        aria-label={clearLabel}
        className={joinClassNames(classes.clearButton, clearButtonSlotClassName)}
        onClick={handleClearClick}
        onMouseDown={handleClearMouseDown}
        size="small"
      >
        {clearButtonSlotChildren ?? clearIcon ?? <Close fontSize="small" />}
      </VireoFormSelectFieldClearButton>
    </InputAdornment>
  ) : null;

  return (
    <VireoFormSelectFieldRoot
      {...(other as TextFieldProps)}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootSlotClassName)}
      disabled={disabled}
      error={effectiveError}
      fullWidth={fullWidth}
      helperText={effectiveHelperText}
      inputRef={nativeInputRef}
      label={label}
      name={field.name}
      required={required}
      select
      slots={
        {
          root: slots.root,
          inputLabel: slots.inputLabel ?? VireoFormSelectFieldInputLabel,
          input:
            slots.input ??
            (variant === "filled"
              ? VireoFormSelectFieldFilledInput
              : variant === "standard"
                ? VireoFormSelectFieldStandardInput
                : VireoFormSelectFieldOutlinedInput),
          htmlInput: slots.htmlInput,
          formHelperText: slots.formHelperText ?? VireoFormSelectFieldFormHelperText,
          select: slots.select ?? VireoFormSelectFieldSelect,
        } as TextFieldProps["slots"]
      }
      slotProps={
        {
          root: {
            ...rootSlotOther,
            style: { ...style, ...rootSlotStyle },
            sx: mergeSx(sx, rootSlotSx),
          },
          inputLabel: {
            ...inputLabelSlotOther,
            className: joinClassNames(classes.inputLabel, inputLabelSlotClassName),
            shrink: inputLabelSlotShrink ?? (ownerState.hasValue || placeholder !== undefined),
          },
          input: {
            ...inputSlotOther,
            className: joinClassNames(classes.input, inputSlotClassName),
            endAdornment: (
              <>
                {inputSlotEndAdornment}
                {clearAdornment}
              </>
            ),
            readOnly: readOnly || inputSlotReadOnly,
          },
          htmlInput: {
            ...htmlInputSlotOther,
            "aria-invalid": effectiveError || isAriaInvalid(htmlInputAriaInvalid) || undefined,
            className: joinClassNames(classes.htmlInput, htmlInputSlotClassName),
            sx: mergeSx(htmlInputThemeSx, htmlInputSlotSx),
          },
          select: {
            ...selectSlotOther,
            SelectDisplayProps: {
              ...selectSlotDisplayProps,
              "aria-invalid": effectiveError || isAriaInvalid(selectSlotDisplayProps?.["aria-invalid"]) || undefined,
            },
            className: joinClassNames(classes.select, selectSlotClassName),
            displayEmpty: true,
            inputProps: {
              ...selectSlotInputProps,
              "aria-invalid": effectiveError || isAriaInvalid(selectSlotInputProps?.["aria-invalid"]) || undefined,
              name: field.name,
              readOnly,
            },
            multiple: false,
            native: false,
            onBlur: handleBlur,
            onChange: handleChange,
            renderValue: renderSelectedValue,
          },
          formHelperText: {
            ...formHelperTextSlotOther,
            className: joinClassNames(classes.formHelperText, formHelperTextSlotClassName),
          },
        } as TextFieldProps["slotProps"]
      }
      value={fieldState.value ?? ""}
      variant={variant}
    >
      {options.map(option => {
        const optionValue = getOptionValue(option);
        const optionContent = renderOption(option);
        return (
          <VireoFormSelectFieldOption
            {...optionSlotOther}
            as={slots.option}
            key={optionValue}
            ownerState={ownerState}
            className={joinClassNames(classes.option, optionSlotClassName)}
            disabled={optionSlotDisabled || getOptionDisabled?.(option)}
            value={optionValue}
          >
            {typeof optionContent === "string" ? (
              <VireoFormSelectFieldOptionText
                {...optionTextSlotOther}
                as={slots.optionText}
                ownerState={ownerState}
                className={joinClassNames(classes.optionText, optionTextSlotClassName)}
                primary={optionContent}
              />
            ) : (
              optionContent
            )}
          </VireoFormSelectFieldOption>
        );
      })}
    </VireoFormSelectFieldRoot>
  );
}

type VireoFormSelectFieldComponent = {
  <TOption, TValue extends VireoFormSelectFieldValue>(
    props: VireoFormSelectFieldProps<TOption, TValue> & React.RefAttributes<HTMLDivElement>,
  ): React.ReactElement;
  displayName?: string;
};

/**
 * Binds typed scalar options to the current TanStack Form field and shared validation policy.
 *
 * Consumers render it as `field.SelectField`; the raw runtime remains internal to the forms capability.
 */
export const VireoFormSelectField = React.forwardRef(VireoFormSelectFieldImpl) as VireoFormSelectFieldComponent;

VireoFormSelectField.displayName = VIREO_FORM_SELECT_FIELD_NAME;
