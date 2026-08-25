import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import {
  InputAdornment,
  unstable_composeClasses as composeClasses,
  type IconButtonProps,
  type OutlinedInputProps,
} from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import {
  type VireoFormCounterFieldClassKey,
  getVireoFormCounterFieldUtilityClass,
} from "./VireoFormCounterField.classes";
import { VIREO_FORM_COUNTER_FIELD_NAME, type VireoFormCounterFieldSlotName } from "./VireoFormCounterField.identity";
import {
  VireoFormCounterFieldDecrementButton,
  VireoFormCounterFieldDecrementIcon,
  VireoFormCounterFieldFormHelperText,
  VireoFormCounterFieldHtmlInput,
  VireoFormCounterFieldIncrementButton,
  VireoFormCounterFieldIncrementIcon,
  VireoFormCounterFieldInput,
  VireoFormCounterFieldRoot,
} from "./VireoFormCounterField.styled";
import type { VireoFormCounterFieldOwnerState, VireoFormCounterFieldProps } from "./VireoFormCounterField.types";

type InputChangeHandler = React.ChangeEventHandler<HTMLInputElement>;
type InputKeyDownHandler = React.KeyboardEventHandler<HTMLInputElement>;
type InputWheelHandler = React.WheelEventHandler<HTMLInputElement>;
type RootBlurHandler = React.FocusEventHandler<HTMLDivElement>;

const EDITABLE_NUMBER_PATTERN = /^-?\d*(?:\.\d*)?$/;
const COMPLETE_NUMBER_PATTERN = /^-?(?:\d+|\d*\.\d+)$/;

function useUtilityClasses(
  ownerState: VireoFormCounterFieldOwnerState,
  classes?: VireoFormCounterFieldProps["classes"],
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
        ownerState.atMin && "atMin",
        ownerState.atMax && "atMax",
      ],
      input: ["input"],
      decrementButton: ["decrementButton"],
      decrementIcon: ["decrementIcon"],
      htmlInput: ["htmlInput"],
      incrementButton: ["incrementButton"],
      incrementIcon: ["incrementIcon"],
      formHelperText: ["formHelperText"],
    } as const satisfies UtilityClassSlotMap<VireoFormCounterFieldSlotName, VireoFormCounterFieldClassKey>,
    getVireoFormCounterFieldUtilityClass,
    classes,
  );
}

function assertFiniteConfiguration(name: string, value: number | undefined): void {
  if (value !== undefined && !Number.isFinite(value)) {
    throw new Error(`${VIREO_FORM_COUNTER_FIELD_NAME} ${name} must be a finite number.`);
  }
}

function validateConfiguration(step: number, min: number | undefined, max: number | undefined): void {
  assertFiniteConfiguration("step", step);
  assertFiniteConfiguration("min", min);
  assertFiniteConfiguration("max", max);
  if (step <= 0) throw new Error(`${VIREO_FORM_COUNTER_FIELD_NAME} step must be greater than zero.`);
  if (min !== undefined && max !== undefined && min > max) {
    throw new Error(`${VIREO_FORM_COUNTER_FIELD_NAME} min must be less than or equal to max.`);
  }
}

function clampValue(value: number, min: number | undefined, max: number | undefined): number {
  return Math.min(max ?? value, Math.max(min ?? value, value));
}

function normalizeNumber(value: number): number {
  const normalized = Number(value.toPrecision(15));
  return Object.is(normalized, -0) ? 0 : normalized;
}

function steppedValue(
  value: number | null,
  direction: -1 | 1,
  step: number,
  min: number | undefined,
  max: number | undefined,
): number {
  const baseline = value ?? 0;
  return normalizeNumber(clampValue(baseline + direction * step, min, max));
}

function formatValue(value: number | null): string {
  return value === null ? "" : String(Object.is(value, -0) ? 0 : value);
}

function joinIds(...ids: Array<string | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}

function isAriaInvalid(value: unknown): boolean {
  return value === true || value === "true";
}

/**
 * Binds an editable, button-stepped numeric counter to the current TanStack Form `number | null` field.
 *
 * Consumers render it as `field.CounterField`; the raw runtime remains internal to the forms capability.
 */
export const VireoFormCounterField = React.forwardRef<HTMLDivElement, VireoFormCounterFieldProps>(
  function VireoFormCounterField(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_COUNTER_FIELD_NAME });
    const {
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      className,
      classes: classesProp,
      decrementLabel = "Decrease",
      disabled = false,
      error = false,
      errorDisplay: errorDisplayProp,
      formatError: formatErrorProp,
      fullWidth = true,
      helperText = " ",
      incrementLabel = "Increase",
      inputRef,
      max,
      min,
      onBlur,
      onChange,
      onValueChange,
      readOnly = false,
      required = false,
      size = "medium",
      slotProps = {},
      slots = {},
      step = 1,
      style,
      sx,
      ...other
    } = props;
    validateConfiguration(step, min, max);

    const field = useVireoFieldContext<number | null>();
    const formContext = useVireoFormContext();
    const generatedInputId = React.useId();
    const generatedHelperTextId = React.useId();
    const fieldState = useStore(field.store, current => ({
      dirty: current.meta.isDirty,
      errors: current.meta.errors as readonly unknown[],
      invalid: !current.meta.isValid,
      touched: current.meta.isTouched,
      validating: current.meta.isValidating,
      value: current.value,
    }));
    const submitting = useStore(field.form.store, current => current.isSubmitting);

    if (fieldState.value !== null && !Number.isFinite(fieldState.value)) {
      throw new Error(`${VIREO_FORM_COUNTER_FIELD_NAME} requires a finite number or null field value.`);
    }

    const [inputValue, setInputValue] = React.useState(() => formatValue(fieldState.value));
    React.useEffect(() => {
      setInputValue(current => {
        if (COMPLETE_NUMBER_PATTERN.test(current) && Object.is(normalizeNumber(Number(current)), fieldState.value)) {
          return current;
        }
        return formatValue(fieldState.value);
      });
    }, [fieldState.value]);

    const errorDisplay = errorDisplayProp ?? formContext.errorDisplay;
    const validationErrorVisible =
      fieldState.invalid &&
      shouldDisplayVireoFormError(errorDisplay, {
        submissionAttempts: formContext.submissionAttempts,
        touched: fieldState.touched,
      });
    const formattedError = validationErrorVisible
      ? formatFirstVireoFormError(fieldState.errors, formatErrorProp ?? formContext.formatError)
      : undefined;
    const hasValue = fieldState.value !== null;
    const atMin = hasValue && min !== undefined && fieldState.value! <= min;
    const atMax = hasValue && max !== undefined && fieldState.value! >= max;
    const decrementDisabled = disabled || readOnly || atMin;
    const incrementDisabled = disabled || readOnly || atMax;
    const ownerState: VireoFormCounterFieldOwnerState = {
      atMax,
      atMin,
      decrementDisabled,
      dirty: fieldState.dirty,
      disabled,
      errorVisible: error || validationErrorVisible,
      fullWidth,
      hasValue,
      incrementDisabled,
      invalid: fieldState.invalid,
      max,
      min,
      readOnly,
      required,
      size,
      step,
      submitting,
      touched: fieldState.touched,
      validating: fieldState.validating,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      "aria-label": _rootSlotAriaLabel,
      "aria-labelledby": _rootSlotAriaLabelledBy,
      className: rootSlotClassName,
      onBlur: rootSlotOnBlur,
      ref: rootSlotRef,
      role: _rootSlotRole,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    void _rootSlotAriaLabel;
    void _rootSlotAriaLabelledBy;
    void _rootSlotRole;

    const resolvedInputSlotProps = resolveSlotProps(slotProps.input, ownerState);
    const {
      className: inputSlotClassName,
      endAdornment: _inputSlotEndAdornment,
      inputComponent: _inputSlotInputComponent,
      inputProps: _inputSlotInputProps,
      onChange: inputSlotOnChange,
      onKeyDown: inputSlotOnKeyDown,
      onWheel: inputSlotOnWheel,
      ref: inputSlotRef,
      startAdornment: _inputSlotStartAdornment,
      value: _inputSlotValue,
      ...inputSlotOther
    } = resolvedInputSlotProps;
    void _inputSlotEndAdornment;
    void _inputSlotInputComponent;
    void _inputSlotInputProps;
    void _inputSlotStartAdornment;
    void _inputSlotValue;

    const resolvedDecrementButtonSlotProps = resolveSlotProps(slotProps.decrementButton, ownerState);
    const {
      "aria-controls": _decrementSlotAriaControls,
      "aria-label": _decrementSlotAriaLabel,
      children: _decrementSlotChildren,
      className: decrementButtonSlotClassName,
      disabled: _decrementSlotDisabled,
      onClick: decrementButtonSlotOnClick,
      ref: decrementButtonSlotRef,
      type: _decrementSlotType,
      ...decrementButtonSlotOther
    } = resolvedDecrementButtonSlotProps;
    void _decrementSlotAriaControls;
    void _decrementSlotAriaLabel;
    void _decrementSlotChildren;
    void _decrementSlotDisabled;
    void _decrementSlotType;

    const resolvedDecrementIconSlotProps = resolveSlotProps(slotProps.decrementIcon, ownerState);
    const {
      "aria-hidden": _decrementIconSlotAriaHidden,
      children: _decrementIconSlotChildren,
      className: decrementIconSlotClassName,
      ref: decrementIconSlotRef,
      ...decrementIconSlotOther
    } = resolvedDecrementIconSlotProps;
    void _decrementIconSlotAriaHidden;
    void _decrementIconSlotChildren;

    const resolvedHtmlInputSlotProps = resolveSlotProps(slotProps.htmlInput, ownerState);
    const {
      "aria-describedby": htmlInputSlotAriaDescribedBy,
      "aria-invalid": htmlInputSlotAriaInvalid,
      "aria-label": _htmlInputSlotAriaLabel,
      "aria-labelledby": _htmlInputSlotAriaLabelledBy,
      className: htmlInputSlotClassName,
      id: htmlInputSlotId,
      inputMode: _htmlInputSlotInputMode,
      onChange: htmlInputSlotOnChange,
      onKeyDown: htmlInputSlotOnKeyDown,
      onWheel: htmlInputSlotOnWheel,
      readOnly: _htmlInputSlotReadOnly,
      ref: htmlInputSlotRef,
      role: _htmlInputSlotRole,
      type: _htmlInputSlotType,
      value: _htmlInputSlotValue,
      ...htmlInputSlotOther
    } = resolvedHtmlInputSlotProps;
    void _htmlInputSlotAriaLabel;
    void _htmlInputSlotAriaLabelledBy;
    void _htmlInputSlotInputMode;
    void _htmlInputSlotReadOnly;
    void _htmlInputSlotRole;
    void _htmlInputSlotType;
    void _htmlInputSlotValue;

    const resolvedIncrementButtonSlotProps = resolveSlotProps(slotProps.incrementButton, ownerState);
    const {
      "aria-controls": _incrementSlotAriaControls,
      "aria-label": _incrementSlotAriaLabel,
      children: _incrementSlotChildren,
      className: incrementButtonSlotClassName,
      disabled: _incrementSlotDisabled,
      onClick: incrementButtonSlotOnClick,
      ref: incrementButtonSlotRef,
      type: _incrementSlotType,
      ...incrementButtonSlotOther
    } = resolvedIncrementButtonSlotProps;
    void _incrementSlotAriaControls;
    void _incrementSlotAriaLabel;
    void _incrementSlotChildren;
    void _incrementSlotDisabled;
    void _incrementSlotType;

    const resolvedIncrementIconSlotProps = resolveSlotProps(slotProps.incrementIcon, ownerState);
    const {
      "aria-hidden": _incrementIconSlotAriaHidden,
      children: _incrementIconSlotChildren,
      className: incrementIconSlotClassName,
      ref: incrementIconSlotRef,
      ...incrementIconSlotOther
    } = resolvedIncrementIconSlotProps;
    void _incrementIconSlotAriaHidden;
    void _incrementIconSlotChildren;

    const resolvedHelperTextSlotProps = resolveSlotProps(slotProps.formHelperText, ownerState);
    const {
      className: helperTextSlotClassName,
      id: helperTextSlotId,
      ...helperTextSlotOther
    } = resolvedHelperTextSlotProps;

    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const nativeInputRef = useForkRef(inputRef, htmlInputSlotRef);
    const inputId = htmlInputSlotId ?? generatedInputId;
    const helperTextId = helperTextSlotId ?? generatedHelperTextId;
    const effectiveHelperText = validationErrorVisible ? formattedError : helperText;
    const describedBy = joinIds(
      ariaDescribedBy,
      htmlInputSlotAriaDescribedBy,
      effectiveHelperText !== undefined ? helperTextId : undefined,
    );
    const effectiveError = error || validationErrorVisible;

    const emitValue = (nextValue: number | null): void => {
      const normalizedValue = nextValue === null ? null : normalizeNumber(nextValue);
      if (Object.is(normalizedValue, fieldState.value)) return;
      onValueChange?.(normalizedValue);
      field.handleChange(normalizedValue);
    };

    const performStep = (direction: -1 | 1): void => {
      if (disabled || readOnly || (direction < 0 ? atMin : atMax)) return;
      const nextValue = steppedValue(fieldState.value, direction, step, min, max);
      setInputValue(formatValue(nextValue));
      emitValue(nextValue);
    };

    const handleChange: InputChangeHandler = event => {
      (htmlInputSlotOnChange as InputChangeHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      (inputSlotOnChange as InputChangeHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      onChange?.(event);
      if (event.defaultPrevented || disabled || readOnly) return;

      const nextInputValue = event.target.value.replace(/,/g, ".");
      if (!EDITABLE_NUMBER_PATTERN.test(nextInputValue)) return;
      setInputValue(nextInputValue);

      if (nextInputValue === "") {
        emitValue(null);
        return;
      }
      if (!COMPLETE_NUMBER_PATTERN.test(nextInputValue)) return;

      const parsedValue = Number(nextInputValue);
      if (!Number.isFinite(parsedValue)) return;
      const clampedValue = normalizeNumber(clampValue(parsedValue, min, max));
      if (!Object.is(clampedValue, parsedValue)) setInputValue(formatValue(clampedValue));
      emitValue(clampedValue);
    };

    const handleKeyDown: InputKeyDownHandler = event => {
      (htmlInputSlotOnKeyDown as InputKeyDownHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      (inputSlotOnKeyDown as InputKeyDownHandler | undefined)?.(event);
      if (event.defaultPrevented || disabled || readOnly) return;
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      performStep(event.key === "ArrowUp" ? 1 : -1);
    };

    const handleWheel: InputWheelHandler = event => {
      (htmlInputSlotOnWheel as InputWheelHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      (inputSlotOnWheel as InputWheelHandler | undefined)?.(event);
      if (!event.defaultPrevented) event.preventDefault();
    };

    const handleRootBlur: RootBlurHandler = event => {
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
      (rootSlotOnBlur as RootBlurHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      onBlur?.(event);
      if (event.defaultPrevented) return;
      setInputValue(formatValue(field.state.value));
      field.handleBlur();
    };

    const handleDecrementClick: NonNullable<IconButtonProps["onClick"]> = event => {
      decrementButtonSlotOnClick?.(event);
      if (!event.defaultPrevented) performStep(-1);
    };

    const handleIncrementClick: NonNullable<IconButtonProps["onClick"]> = event => {
      incrementButtonSlotOnClick?.(event);
      if (!event.defaultPrevented) performStep(1);
    };

    const decrementAdornment = (
      <InputAdornment position="start">
        <VireoFormCounterFieldDecrementButton
          {...decrementButtonSlotOther}
          as={slots.decrementButton}
          ref={decrementButtonSlotRef}
          ownerState={ownerState}
          aria-controls={inputId}
          aria-label={decrementLabel}
          className={joinClassNames(classes.decrementButton, decrementButtonSlotClassName)}
          disabled={decrementDisabled}
          onClick={handleDecrementClick}
          size={size}
          type="button"
        >
          <VireoFormCounterFieldDecrementIcon
            {...decrementIconSlotOther}
            as={slots.decrementIcon}
            ref={decrementIconSlotRef}
            ownerState={ownerState}
            aria-hidden="true"
            className={joinClassNames(classes.decrementIcon, decrementIconSlotClassName)}
            fontSize={size}
          />
        </VireoFormCounterFieldDecrementButton>
      </InputAdornment>
    );

    const incrementAdornment = (
      <InputAdornment position="end">
        <VireoFormCounterFieldIncrementButton
          {...incrementButtonSlotOther}
          as={slots.incrementButton}
          ref={incrementButtonSlotRef}
          ownerState={ownerState}
          aria-controls={inputId}
          aria-label={incrementLabel}
          className={joinClassNames(classes.incrementButton, incrementButtonSlotClassName)}
          disabled={incrementDisabled}
          onClick={handleIncrementClick}
          size={size}
          type="button"
        >
          <VireoFormCounterFieldIncrementIcon
            {...incrementIconSlotOther}
            as={slots.incrementIcon}
            ref={incrementIconSlotRef}
            ownerState={ownerState}
            aria-hidden="true"
            className={joinClassNames(classes.incrementIcon, incrementIconSlotClassName)}
            fontSize={size}
          />
        </VireoFormCounterFieldIncrementButton>
      </InputAdornment>
    );
    const HtmlInputComponent = (slots.htmlInput ?? VireoFormCounterFieldHtmlInput) as NonNullable<
      OutlinedInputProps["inputComponent"]
    >;

    return (
      <VireoFormCounterFieldRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        disabled={disabled}
        error={effectiveError}
        fullWidth={fullWidth}
        onBlur={handleRootBlur}
        required={required}
        role="group"
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <VireoFormCounterFieldInput
          {...inputSlotOther}
          as={slots.input}
          ref={inputSlotRef}
          ownerState={ownerState}
          className={joinClassNames(classes.input, inputSlotClassName)}
          disabled={disabled}
          endAdornment={incrementAdornment}
          error={effectiveError}
          fullWidth={fullWidth}
          inputComponent={HtmlInputComponent}
          inputProps={{
            ...htmlInputSlotOther,
            ownerState,
            "aria-describedby": describedBy,
            "aria-invalid": error || fieldState.invalid || isAriaInvalid(htmlInputSlotAriaInvalid) || undefined,
            "aria-label": ariaLabel,
            "aria-labelledby": ariaLabelledBy,
            "aria-readonly": readOnly || undefined,
            "aria-required": required || undefined,
            "aria-valuemax": max,
            "aria-valuemin": min,
            "aria-valuenow": fieldState.value ?? undefined,
            className: joinClassNames(classes.htmlInput, htmlInputSlotClassName),
            "data-vireo-field-focus-target": "true",
            id: inputId,
            inputMode: "decimal",
            onKeyDown: handleKeyDown,
            onWheel: handleWheel,
            readOnly,
            role: "spinbutton",
            type: "text",
          }}
          inputRef={nativeInputRef}
          name={field.name}
          onChange={handleChange as NonNullable<OutlinedInputProps["onChange"]>}
          readOnly={readOnly}
          size={size}
          startAdornment={decrementAdornment}
          value={inputValue}
        />
        {effectiveHelperText !== undefined && (
          <VireoFormCounterFieldFormHelperText
            {...helperTextSlotOther}
            as={slots.formHelperText}
            id={helperTextId}
            ownerState={ownerState}
            className={joinClassNames(classes.formHelperText, helperTextSlotClassName)}
          >
            {effectiveHelperText}
          </VireoFormCounterFieldFormHelperText>
        )}
      </VireoFormCounterFieldRoot>
    );
  },
);

VireoFormCounterField.displayName = VIREO_FORM_COUNTER_FIELD_NAME;
