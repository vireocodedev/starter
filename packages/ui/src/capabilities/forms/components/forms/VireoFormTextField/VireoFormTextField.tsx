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
import { type VireoFormTextFieldClassKey, getVireoFormTextFieldUtilityClass } from "./VireoFormTextField.classes";
import { VIREO_FORM_TEXT_FIELD_NAME, type VireoFormTextFieldSlotName } from "./VireoFormTextField.identity";
import {
  VireoFormTextFieldFilledInput,
  VireoFormTextFieldFormHelperText,
  VireoFormTextFieldInputLabel,
  VireoFormTextFieldOutlinedInput,
  VireoFormTextFieldRoot,
  VireoFormTextFieldSelect,
  VireoFormTextFieldStandardInput,
} from "./VireoFormTextField.styled";
import { type VireoFormTextFieldOwnerState, type VireoFormTextFieldProps } from "./VireoFormTextField.types";

type InputChangeHandler = NonNullable<TextFieldProps["onChange"]>;
type InputBlurHandler = NonNullable<TextFieldProps["onBlur"]>;

function useUtilityClasses(ownerState: VireoFormTextFieldOwnerState, classes?: VireoFormTextFieldProps["classes"]) {
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
      select: ["select"],
    } as const satisfies UtilityClassSlotMap<VireoFormTextFieldSlotName, VireoFormTextFieldClassKey>,
    getVireoFormTextFieldUtilityClass,
    classes,
  );
}

function isAriaInvalid(value: unknown): boolean {
  return value === true || value === "true";
}

function resolveHtmlInputThemeSx(
  theme: Theme,
  props: VireoFormTextFieldProps,
  ownerState: VireoFormTextFieldOwnerState,
): SxProps<Theme> | undefined {
  const styleOverride = theme.components?.[VIREO_FORM_TEXT_FIELD_NAME]?.styleOverrides?.htmlInput;

  if (typeof styleOverride === "function") {
    return styleOverride({ ...props, ownerState, theme }) as SxProps<Theme>;
  }

  return styleOverride as SxProps<Theme> | undefined;
}

/**
 * Binds MUI TextField anatomy and customization to the current `form.Field` string value.
 *
 * Consumers render it as `field.TextField`; the raw runtime remains internal to the forms capability.
 */
export const VireoFormTextField = React.forwardRef<HTMLDivElement, VireoFormTextFieldProps>(
  function VireoFormTextField(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_TEXT_FIELD_NAME });
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
      onBlur,
      onChange,
      readOnly = false,
      readOnlyEmptyValue,
      renderReadOnlyValue,
      required = false,
      select = false,
      slotProps = {},
      slots = {},
      style,
      sx,
      variant = "outlined",
      ...other
    } = props;
    const field = useVireoFieldContext<string>();
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
    const ownerState: VireoFormTextFieldOwnerState = {
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
      onBlur: htmlInputSlotOnBlur,
      onChange: htmlInputSlotOnChange,
      ref: htmlInputSlotRef,
      sx: htmlInputSlotSx,
      ...htmlInputSlotOther
    } = resolvedHtmlInputSlotProps;
    const resolvedFormHelperTextSlotProps = resolveSlotProps(slotProps.formHelperText, ownerState);
    const { className: formHelperTextSlotClassName, ...formHelperTextSlotOther } = resolvedFormHelperTextSlotProps;
    const resolvedSelectSlotProps = resolveSlotProps(slotProps.select, ownerState);
    const {
      className: selectSlotClassName,
      onBlur: selectSlotOnBlur,
      onChange: selectSlotOnChange,
      ...selectSlotOther
    } = resolvedSelectSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const nativeInputRef = useForkRef(inputRef, htmlInputSlotRef);

    if (effectiveReadOnly) {
      const empty = fieldState.value.trim().length === 0;

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
          {renderReadOnlyValue?.(fieldState.value) ?? fieldState.value}
        </VireoFormReadOnlyValue>
      );
    }

    const handleChange: InputChangeHandler = event => {
      (htmlInputSlotOnChange as InputChangeHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      (inputSlotOnChange as InputChangeHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      if (select) (selectSlotOnChange as InputChangeHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      onChange?.(event);
      if (event.defaultPrevented) return;
      field.handleChange(event.target.value);
    };

    const handleBlur: InputBlurHandler = event => {
      (htmlInputSlotOnBlur as InputBlurHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      (inputSlotOnBlur as InputBlurHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      if (select) (selectSlotOnBlur as InputBlurHandler | undefined)?.(event);
      if (event.defaultPrevented) return;
      onBlur?.(event);
      if (event.defaultPrevented) return;
      field.handleBlur();
    };

    const effectiveError = error || fieldState.invalid;
    const effectiveHelperText = errorVisible ? formattedError : helperText;

    return (
      <VireoFormTextFieldRoot
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
        required={required}
        label={label}
        select={select}
        slots={
          {
            ...slots,
            inputLabel: slots.inputLabel ?? VireoFormTextFieldInputLabel,
            input:
              slots.input ??
              (variant === "filled"
                ? VireoFormTextFieldFilledInput
                : variant === "standard"
                  ? VireoFormTextFieldStandardInput
                  : VireoFormTextFieldOutlinedInput),
            // Keep MUI's internal InputBaseInput when the consumer does not replace this slot.
            // It owns the native-input reset that makes TextField variants render correctly.
            htmlInput: slots.htmlInput,
            formHelperText: slots.formHelperText ?? VireoFormTextFieldFormHelperText,
            select: slots.select ?? VireoFormTextFieldSelect,
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
              sx: mergeSx(htmlInputThemeSx, htmlInputSlotSx),
            },
            formHelperText: {
              ...formHelperTextSlotOther,
              className: joinClassNames(classes.formHelperText, formHelperTextSlotClassName),
            },
            select: {
              ...selectSlotOther,
              className: joinClassNames(classes.select, selectSlotClassName),
            },
          } as TextFieldProps["slotProps"]
        }
        value={fieldState.value}
        variant={variant}
      />
    );
  },
);

VireoFormTextField.displayName = VIREO_FORM_TEXT_FIELD_NAME;
