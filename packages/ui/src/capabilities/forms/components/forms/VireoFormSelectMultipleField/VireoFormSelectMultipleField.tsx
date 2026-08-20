import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import Close from "@mui/icons-material/Close";
import {
  InputAdornment,
  unstable_composeClasses as composeClasses,
  type SelectProps,
  type SxProps,
  type TextFieldProps,
} from "@mui/material";
import { type Theme, useTheme, useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import {
  type VireoFormSelectMultipleFieldClassKey,
  getVireoFormSelectMultipleFieldUtilityClass,
} from "./VireoFormSelectMultipleField.classes";
import {
  VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
  type VireoFormSelectMultipleFieldSlotName,
} from "./VireoFormSelectMultipleField.identity";
import {
  VireoFormSelectMultipleFieldClearButton,
  VireoFormSelectMultipleFieldFilledInput,
  VireoFormSelectMultipleFieldFormHelperText,
  VireoFormSelectMultipleFieldInputLabel,
  VireoFormSelectMultipleFieldOption,
  VireoFormSelectMultipleFieldOptionCheckbox,
  VireoFormSelectMultipleFieldOptionText,
  VireoFormSelectMultipleFieldOutlinedInput,
  VireoFormSelectMultipleFieldRoot,
  VireoFormSelectMultipleFieldSelect,
  VireoFormSelectMultipleFieldSelectionSummary,
  VireoFormSelectMultipleFieldStandardInput,
} from "./VireoFormSelectMultipleField.styled";
import {
  type VireoFormSelectMultipleFieldOwnerState,
  type VireoFormSelectMultipleFieldProps,
  type VireoFormSelectMultipleFieldValue,
} from "./VireoFormSelectMultipleField.types";

type SelectBlurHandler = NonNullable<SelectProps<unknown[]>["onBlur"]>;
type SelectChangeHandler = NonNullable<SelectProps<unknown[]>["onChange"]>;

function useUtilityClasses(
  ownerState: VireoFormSelectMultipleFieldOwnerState,
  classes?: VireoFormSelectMultipleFieldProps["classes"],
) {
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
      selectionSummary: ["selectionSummary"],
      option: ["option"],
      optionCheckbox: ["optionCheckbox"],
      optionText: ["optionText"],
      clearButton: ["clearButton"],
      formHelperText: ["formHelperText"],
    } as const satisfies UtilityClassSlotMap<
      VireoFormSelectMultipleFieldSlotName,
      VireoFormSelectMultipleFieldClassKey
    >,
    getVireoFormSelectMultipleFieldUtilityClass,
    classes,
  );
}

function isAriaInvalid(value: unknown): boolean {
  return value === true || value === "true";
}

function normalizeMaxDisplayedOptions(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 2;
}

function resolveHtmlInputThemeSx<TOption, TValue extends VireoFormSelectMultipleFieldValue>(
  theme: Theme,
  props: VireoFormSelectMultipleFieldProps<TOption, TValue>,
  ownerState: VireoFormSelectMultipleFieldOwnerState,
): SxProps<Theme> | undefined {
  const styleOverride = theme.components?.[VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME]?.styleOverrides?.htmlInput;

  if (typeof styleOverride === "function") {
    return styleOverride({ ...props, ownerState, theme } as never) as SxProps<Theme>;
  }

  return styleOverride as SxProps<Theme> | undefined;
}

function VireoFormSelectMultipleFieldImpl<TOption, TValue extends VireoFormSelectMultipleFieldValue>(
  inProps: VireoFormSelectMultipleFieldProps<TOption, TValue>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({
    props: inProps,
    name: VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME,
  }) as VireoFormSelectMultipleFieldProps<TOption, TValue>;
  const theme = useTheme();
  const {
    className,
    classes: classesProp,
    clearIcon,
    clearLabel = "Clear selections",
    disabled = false,
    disableClearable = false,
    error = false,
    errorDisplay: errorDisplayProp,
    formatError: formatErrorProp,
    fullWidth = true,
    getOptionDisabled,
    getOptionValue,
    helperText,
    inputRef,
    label,
    maxDisplayedOptions: maxDisplayedOptionsProp = 2,
    onBlur,
    onValueChange,
    options,
    placeholder,
    readOnly = false,
    renderOption,
    renderSelectedOptions,
    required = false,
    slotProps = {},
    slots = {},
    style,
    sx,
    variant = "outlined",
    ...other
  } = props;
  const maxDisplayedOptions = normalizeMaxDisplayedOptions(maxDisplayedOptionsProp);
  const field = useVireoFieldContext<TValue[]>();
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
  const ownerState: VireoFormSelectMultipleFieldOwnerState = {
    dirty: fieldState.dirty,
    disabled,
    errorVisible,
    hasValue: fieldState.value.length > 0,
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
    renderValue: _selectSlotRenderValue,
    ...selectSlotOther
  } = resolvedSelectSlotProps;
  void _selectSlotDisplayEmpty;
  void _selectSlotMultiple;
  void _selectSlotNative;
  void _selectSlotRenderValue;
  const resolvedSelectionSummarySlotProps = resolveSlotProps(slotProps.selectionSummary, ownerState);
  const { className: selectionSummarySlotClassName, ...selectionSummarySlotOther } = resolvedSelectionSummarySlotProps;
  const resolvedOptionSlotProps = resolveSlotProps(slotProps.option, ownerState);
  const { className: optionSlotClassName, disabled: optionSlotDisabled, ...optionSlotOther } = resolvedOptionSlotProps;
  const resolvedOptionCheckboxSlotProps = resolveSlotProps(slotProps.optionCheckbox, ownerState);
  const { className: optionCheckboxSlotClassName, ...optionCheckboxSlotOther } = resolvedOptionCheckboxSlotProps;
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

  const selectedOptions = fieldState.value
    .map(value => options.find(option => getOptionValue(option) === value))
    .filter((option): option is TOption => option !== undefined);
  const displayedOptions = selectedOptions.slice(0, maxDisplayedOptions);
  const hiddenCount = selectedOptions.length - displayedOptions.length;
  const effectiveError = error || fieldState.invalid;
  const effectiveHelperText = errorVisible ? formattedError : helperText;
  const clearable = ownerState.hasValue && !disabled && !readOnly && !disableClearable;

  const normalizeChangedValue = (value: unknown): TValue[] => {
    if (Array.isArray(value)) return value as TValue[];
    if (typeof value !== "string") return [];

    return value
      .split(",")
      .map(serialized => options.find(option => String(getOptionValue(option)) === serialized))
      .filter((option): option is TOption => option !== undefined)
      .map(getOptionValue);
  };

  const handleChange: SelectChangeHandler = (event, child) => {
    selectSlotOnChange?.(event, child);
    if (event.defaultPrevented) return;

    const nextValue = normalizeChangedValue(event.target.value);
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
    onValueChange?.([]);
    field.handleChange([]);
  };

  const renderSelectedValue = (): React.ReactNode => {
    const SelectionSummary = slots.selectionSummary ?? VireoFormSelectMultipleFieldSelectionSummary;

    if (selectedOptions.length === 0) {
      return placeholder === undefined ? null : (
        <SelectionSummary
          {...selectionSummarySlotOther}
          ownerState={ownerState}
          className={joinClassNames(classes.selectionSummary, selectionSummarySlotClassName)}
          color="text.secondary"
          component="span"
        >
          {placeholder}
        </SelectionSummary>
      );
    }

    let content: React.ReactNode;
    if (renderSelectedOptions) {
      content = renderSelectedOptions({
        selectedOptions,
        displayedOptions,
        hiddenCount,
        maxDisplayedOptions,
      });
    } else if (maxDisplayedOptions === 0) {
      content = `${selectedOptions.length} selected`;
    } else {
      content = (
        <>
          {displayedOptions.map((option, index) => (
            <React.Fragment key={getOptionValue(option)}>
              {index > 0 ? ", " : null}
              {renderOption(option)}
            </React.Fragment>
          ))}
          {hiddenCount > 0 ? ` +${hiddenCount}` : null}
        </>
      );
    }

    return (
      <SelectionSummary
        {...selectionSummarySlotOther}
        ownerState={ownerState}
        className={joinClassNames(classes.selectionSummary, selectionSummarySlotClassName)}
        component="span"
      >
        {content}
      </SelectionSummary>
    );
  };

  const clearAdornment = clearable ? (
    <InputAdornment position="end">
      <VireoFormSelectMultipleFieldClearButton
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
      </VireoFormSelectMultipleFieldClearButton>
    </InputAdornment>
  ) : null;

  return (
    <VireoFormSelectMultipleFieldRoot
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
          inputLabel: slots.inputLabel ?? VireoFormSelectMultipleFieldInputLabel,
          input:
            slots.input ??
            (variant === "filled"
              ? VireoFormSelectMultipleFieldFilledInput
              : variant === "standard"
                ? VireoFormSelectMultipleFieldStandardInput
                : VireoFormSelectMultipleFieldOutlinedInput),
          htmlInput: slots.htmlInput,
          formHelperText: slots.formHelperText ?? VireoFormSelectMultipleFieldFormHelperText,
          select: slots.select ?? VireoFormSelectMultipleFieldSelect,
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
            multiple: true,
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
      value={fieldState.value}
      variant={variant}
    >
      {options.map(option => {
        const optionValue = getOptionValue(option);
        const optionContent = renderOption(option);
        const selected = fieldState.value.includes(optionValue);
        return (
          <VireoFormSelectMultipleFieldOption
            {...optionSlotOther}
            as={slots.option}
            key={optionValue}
            ownerState={ownerState}
            className={joinClassNames(classes.option, optionSlotClassName)}
            disabled={optionSlotDisabled || getOptionDisabled?.(option)}
            value={optionValue}
          >
            <VireoFormSelectMultipleFieldOptionCheckbox
              {...optionCheckboxSlotOther}
              as={slots.optionCheckbox}
              ownerState={ownerState}
              aria-hidden="true"
              checked={selected}
              className={joinClassNames(classes.optionCheckbox, optionCheckboxSlotClassName)}
              disableRipple
              tabIndex={-1}
            />
            {typeof optionContent === "string" ? (
              <VireoFormSelectMultipleFieldOptionText
                {...optionTextSlotOther}
                as={slots.optionText}
                ownerState={ownerState}
                className={joinClassNames(classes.optionText, optionTextSlotClassName)}
                primary={optionContent}
              />
            ) : (
              optionContent
            )}
          </VireoFormSelectMultipleFieldOption>
        );
      })}
    </VireoFormSelectMultipleFieldRoot>
  );
}

type VireoFormSelectMultipleFieldComponent = {
  <TOption, TValue extends VireoFormSelectMultipleFieldValue>(
    props: VireoFormSelectMultipleFieldProps<TOption, TValue> & React.RefAttributes<HTMLDivElement>,
  ): React.ReactElement;
  displayName?: string;
};

/**
 * Binds an ordered array of typed options to the current TanStack Form field and shared validation policy.
 *
 * Consumers render it as `field.SelectMultipleField`; the raw runtime remains internal to the forms capability.
 */
export const VireoFormSelectMultipleField = React.forwardRef(
  VireoFormSelectMultipleFieldImpl,
) as VireoFormSelectMultipleFieldComponent;

VireoFormSelectMultipleField.displayName = VIREO_FORM_SELECT_MULTIPLE_FIELD_NAME;
