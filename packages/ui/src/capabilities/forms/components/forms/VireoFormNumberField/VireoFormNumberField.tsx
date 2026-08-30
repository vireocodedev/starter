import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { VireoFormReadOnlyValue } from "@/capabilities/forms/components/data-display/VireoFormReadOnlyValue/VireoFormReadOnlyValue";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses, type SxProps, type TextFieldProps } from "@mui/material";
import { type Theme, useTheme, useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import { type VireoFormNumberFieldClassKey, getVireoFormNumberFieldUtilityClass } from "./VireoFormNumberField.classes";
import { VIREO_FORM_NUMBER_FIELD_NAME, type VireoFormNumberFieldSlotName } from "./VireoFormNumberField.identity";
import {
  VireoFormNumberFieldFilledInput,
  VireoFormNumberFieldFormHelperText,
  VireoFormNumberFieldInputLabel,
  VireoFormNumberFieldOutlinedInput,
  VireoFormNumberFieldRoot,
  VireoFormNumberFieldStandardInput,
} from "./VireoFormNumberField.styled";
import { type VireoFormNumberFieldOwnerState, type VireoFormNumberFieldProps } from "./VireoFormNumberField.types";

type InputChangeHandler = NonNullable<TextFieldProps["onChange"]>;
type InputBlurHandler = NonNullable<TextFieldProps["onBlur"]>;

const EDITABLE_NUMBER_PATTERN = /^-?\d*(?:\.\d*)?$/;
const COMPLETE_NUMBER_PATTERN = /^-?(?:\d+|\d*\.\d+)$/;
const TRAILING_DECIMAL_PATTERN = /^-?\d+\.$/;

function clampNumber(value: number, min?: number, max?: number): number {
  return Math.min(max ?? value, Math.max(min ?? value, value));
}

function formatNumber(value: number | null): string {
  return value === null || !Number.isFinite(value) ? "" : String(value);
}

function useUtilityClasses(ownerState: VireoFormNumberFieldOwnerState, classes?: VireoFormNumberFieldProps["classes"]) {
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
      ],
      inputLabel: ["inputLabel"],
      input: ["input"],
      htmlInput: ["htmlInput"],
      formHelperText: ["formHelperText"],
    } as const satisfies UtilityClassSlotMap<VireoFormNumberFieldSlotName, VireoFormNumberFieldClassKey>,
    getVireoFormNumberFieldUtilityClass,
    classes,
  );
}

function isAriaInvalid(value: unknown): boolean {
  return value === true || value === "true";
}

function resolveHtmlInputThemeSx(
  theme: Theme,
  props: VireoFormNumberFieldProps,
  ownerState: VireoFormNumberFieldOwnerState,
): SxProps<Theme> | undefined {
  const styleOverride = theme.components?.[VIREO_FORM_NUMBER_FIELD_NAME]?.styleOverrides?.htmlInput;

  if (typeof styleOverride === "function") {
    return styleOverride({ ...props, ownerState, theme }) as SxProps<Theme>;
  }

  return styleOverride as SxProps<Theme> | undefined;
}

/**
 * Binds MUI TextField anatomy to a `number | null` form value while preserving incomplete numeric editing text.
 *
 * Consumers render it as `field.NumberField`; the raw runtime remains internal to the forms capability.
 */
export const VireoFormNumberField = React.forwardRef<HTMLDivElement, VireoFormNumberFieldProps>(
  function VireoFormNumberField(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_NUMBER_FIELD_NAME });
    const theme = useTheme();
    const {
      className,
      classes: classesProp,
      disabled = false,
      error = false,
      errorDisplay: errorDisplayProp,
      formatError: formatErrorProp,
      fullWidth = true,
      helperText = " ",
      inputRef,
      label,
      max,
      min,
      onBlur,
      onChange,
      readOnly = false,
      readOnlyEmptyValue,
      renderReadOnlyValue,
      required = false,
      slotProps = {},
      slots = {},
      style,
      sx,
      variant = "outlined",
      ...other
    } = props;
    const field = useVireoFieldContext<number | null>();
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
    const effectiveReadOnly = formContext.readOnly || readOnly;
    const [inputValue, setInputValue] = React.useState(() => formatNumber(fieldState.value));

    React.useEffect(() => {
      if (effectiveReadOnly || fieldState.value === null || !Number.isFinite(fieldState.value)) {
        setInputValue("");
        return;
      }

      const clampedValue = clampNumber(fieldState.value, min, max);
      setInputValue(current => (current !== "" && Number(current) === clampedValue ? current : String(clampedValue)));
      if (clampedValue !== fieldState.value) field.handleChange(clampedValue);
    }, [effectiveReadOnly, field, fieldState.value, max, min]);

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
    const ownerState: VireoFormNumberFieldOwnerState = {
      dirty: fieldState.dirty,
      disabled,
      errorVisible,
      invalid: fieldState.invalid,
      readOnly: effectiveReadOnly,
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
    const { className: inputLabelSlotClassName, ...inputLabelSlotOther } = resolvedInputLabelSlotProps;
    const resolvedInputSlotProps = resolveSlotProps(slotProps.input, ownerState);
    const {
      className: inputSlotClassName,
      onBlur: inputSlotOnBlur,
      onChange: inputSlotOnChange,
      readOnly: inputSlotReadOnly,
      ...inputSlotOther
    } = resolvedInputSlotProps;
    const resolvedHtmlInputSlotProps = resolveSlotProps(slotProps.htmlInput, ownerState);
    const {
      "aria-invalid": htmlInputAriaInvalid,
      className: htmlInputSlotClassName,
      inputMode: _htmlInputInputMode,
      onBlur: htmlInputSlotOnBlur,
      onChange: htmlInputSlotOnChange,
      ref: htmlInputSlotRef,
      sx: htmlInputSlotSx,
      type: _htmlInputType,
      ...htmlInputSlotOther
    } = resolvedHtmlInputSlotProps;
    void _htmlInputInputMode;
    void _htmlInputType;
    const resolvedFormHelperTextSlotProps = resolveSlotProps(slotProps.formHelperText, ownerState);
    const { className: formHelperTextSlotClassName, ...formHelperTextSlotOther } = resolvedFormHelperTextSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const nativeInputRef = useForkRef(inputRef, htmlInputSlotRef);

    if (effectiveReadOnly) {
      const empty = fieldState.value === null || !Number.isFinite(fieldState.value);
      return (
        <VireoFormReadOnlyValue
          {...rootSlotOther}
          ref={rootRef}
          aria-label={htmlInputSlotOther["aria-label"] as string | undefined}
          className={joinClassNames(classes.root, className, rootSlotClassName)}
          empty={empty}
          emptyValue={readOnlyEmptyValue ?? formContext.readOnlyEmptyValue}
          label={label}
          style={{ ...style, ...rootSlotStyle }}
          sx={mergeSx(sx, rootSlotSx)}
        >
          {fieldState.value === null
            ? null
            : (renderReadOnlyValue?.(fieldState.value) ?? formatNumber(fieldState.value))}
        </VireoFormReadOnlyValue>
      );
    }

    const handleChange: InputChangeHandler = event => {
      (htmlInputSlotOnChange as InputChangeHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      (inputSlotOnChange as InputChangeHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      onChange?.(event);
      if (event.defaultPrevented) return;

      const nextInputValue = event.target.value.replace(/,/g, ".");
      if (!EDITABLE_NUMBER_PATTERN.test(nextInputValue)) return;

      if (nextInputValue === "") {
        setInputValue("");
        field.handleChange(null);
        return;
      }

      setInputValue(nextInputValue);
      if (!COMPLETE_NUMBER_PATTERN.test(nextInputValue)) return;

      const parsedValue = Number(nextInputValue);
      if (!Number.isFinite(parsedValue)) return;
      const clampedValue = clampNumber(parsedValue, min, max);
      if (clampedValue !== parsedValue) setInputValue(String(clampedValue));
      field.handleChange(clampedValue);
    };

    const handleBlur: InputBlurHandler = event => {
      (htmlInputSlotOnBlur as InputBlurHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      (inputSlotOnBlur as InputBlurHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      onBlur?.(event);
      if (event.defaultPrevented) return;

      if (TRAILING_DECIMAL_PATTERN.test(inputValue)) {
        const parsedValue = Number(inputValue.slice(0, -1));
        const clampedValue = clampNumber(parsedValue, min, max);
        field.handleChange(clampedValue);
        setInputValue(formatNumber(clampedValue));
      } else {
        setInputValue(formatNumber(field.state.value));
      }
      field.handleBlur();
    };

    const effectiveError = error || fieldState.invalid;
    const effectiveHelperText = errorVisible ? formattedError : helperText;

    return (
      <VireoFormNumberFieldRoot
        {...(other as TextFieldProps)}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        disabled={disabled}
        error={effectiveError}
        fullWidth={fullWidth}
        helperText={effectiveHelperText}
        inputRef={nativeInputRef}
        name={field.name}
        onBlur={handleBlur}
        onChange={handleChange}
        label={label}
        required={required}
        slots={
          {
            ...slots,
            inputLabel: slots.inputLabel ?? VireoFormNumberFieldInputLabel,
            input:
              slots.input ??
              (variant === "filled"
                ? VireoFormNumberFieldFilledInput
                : variant === "standard"
                  ? VireoFormNumberFieldStandardInput
                  : VireoFormNumberFieldOutlinedInput),
            htmlInput: slots.htmlInput,
            formHelperText: slots.formHelperText ?? VireoFormNumberFieldFormHelperText,
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
            },
            input: {
              ...inputSlotOther,
              className: joinClassNames(classes.input, inputSlotClassName),
              readOnly: effectiveReadOnly || inputSlotReadOnly,
            },
            htmlInput: {
              ...htmlInputSlotOther,
              "aria-invalid": effectiveError || isAriaInvalid(htmlInputAriaInvalid) || undefined,
              className: joinClassNames(classes.htmlInput, htmlInputSlotClassName),
              inputMode: "decimal",
              max,
              min,
              sx: mergeSx(htmlInputThemeSx, htmlInputSlotSx),
              type: "text",
            },
            formHelperText: {
              ...formHelperTextSlotOther,
              className: joinClassNames(classes.formHelperText, formHelperTextSlotClassName),
            },
          } as TextFieldProps["slotProps"]
        }
        value={inputValue}
        variant={variant}
      />
    );
  },
);

VireoFormNumberField.displayName = VIREO_FORM_NUMBER_FIELD_NAME;
