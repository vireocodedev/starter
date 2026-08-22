import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses, type RadioGroupProps } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import {
  type VireoFormRadioGroupFieldClassKey,
  getVireoFormRadioGroupFieldUtilityClass,
} from "./VireoFormRadioGroupField.classes";
import {
  VIREO_FORM_RADIO_GROUP_FIELD_NAME,
  type VireoFormRadioGroupFieldSlotName,
} from "./VireoFormRadioGroupField.identity";
import {
  VireoFormRadioGroupFieldFormControlLabel,
  VireoFormRadioGroupFieldFormHelperText,
  VireoFormRadioGroupFieldOptionLabel,
  VireoFormRadioGroupFieldRadio,
  VireoFormRadioGroupFieldRadioGroup,
  VireoFormRadioGroupFieldRoot,
} from "./VireoFormRadioGroupField.styled";
import {
  type VireoFormRadioGroupFieldOwnerState,
  type VireoFormRadioGroupFieldProps,
  type VireoFormRadioGroupFieldValue,
} from "./VireoFormRadioGroupField.types";

type RadioGroupBlurHandler = NonNullable<RadioGroupProps["onBlur"]>;
type RadioGroupChangeHandler = NonNullable<RadioGroupProps["onChange"]>;

function useUtilityClasses(
  ownerState: VireoFormRadioGroupFieldOwnerState,
  classes?: VireoFormRadioGroupFieldProps["classes"],
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
        ownerState.row && "row",
        ownerState.hasValue && "hasValue",
      ],
      radioGroup: ["radioGroup"],
      formControlLabel: ["formControlLabel"],
      radio: ["radio"],
      optionLabel: ["optionLabel"],
      formHelperText: ["formHelperText"],
    } as const satisfies UtilityClassSlotMap<VireoFormRadioGroupFieldSlotName, VireoFormRadioGroupFieldClassKey>,
    getVireoFormRadioGroupFieldUtilityClass,
    classes,
  );
}

function encodeOptionValue(value: VireoFormRadioGroupFieldValue): string {
  return `${typeof value}:${String(value)}`;
}

function isAriaInvalid(value: unknown): boolean {
  return value === true || value === "true";
}

function joinIds(...ids: Array<string | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}

function VireoFormRadioGroupFieldImpl<TOption, TValue extends VireoFormRadioGroupFieldValue>(
  inProps: VireoFormRadioGroupFieldProps<TOption, TValue>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({
    props: inProps,
    name: VIREO_FORM_RADIO_GROUP_FIELD_NAME,
  }) as VireoFormRadioGroupFieldProps<TOption, TValue>;
  const {
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    className,
    classes: classesProp,
    disabled = false,
    error = false,
    errorDisplay: errorDisplayProp,
    formatError: formatErrorProp,
    fullWidth = true,
    getOptionDisabled,
    getOptionValue,
    helperText,
    labelPlacement = "end",
    onBlur,
    onChange,
    onValueChange,
    options,
    renderOption,
    required = false,
    row = false,
    slotProps = {},
    slots = {},
    style,
    sx,
    ...other
  } = props;
  const field = useVireoFieldContext<TValue | null>();
  const formContext = useVireoFormContext();
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
  const ownerState: VireoFormRadioGroupFieldOwnerState = {
    dirty: fieldState.dirty,
    disabled,
    errorVisible,
    hasValue: fieldState.value !== null,
    invalid: fieldState.invalid,
    row,
    submitting,
    touched: fieldState.touched,
    validating: fieldState.validating,
  };
  const classes = useUtilityClasses(ownerState, classesProp);

  const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
  const {
    className: rootSlotClassName,
    ref: rootSlotRef,
    style: rootSlotStyle,
    sx: rootSlotSx,
    ...rootSlotOther
  } = resolvedRootSlotProps;
  const resolvedRadioGroupSlotProps = resolveSlotProps(slotProps.radioGroup, ownerState);
  const {
    "aria-describedby": radioGroupSlotAriaDescribedBy,
    "aria-invalid": radioGroupSlotAriaInvalid,
    "aria-label": radioGroupSlotAriaLabel,
    "aria-labelledby": radioGroupSlotAriaLabelledBy,
    className: radioGroupSlotClassName,
    onBlur: radioGroupSlotOnBlur,
    onChange: radioGroupSlotOnChange,
    ...radioGroupSlotOther
  } = resolvedRadioGroupSlotProps;
  const resolvedFormControlLabelSlotProps = resolveSlotProps(slotProps.formControlLabel, ownerState);
  const {
    className: formControlLabelSlotClassName,
    disabled: formControlLabelSlotDisabled,
    ...formControlLabelSlotOther
  } = resolvedFormControlLabelSlotProps;
  const resolvedRadioSlotProps = resolveSlotProps(slotProps.radio, ownerState);
  const {
    checked: _radioSlotChecked,
    className: radioSlotClassName,
    defaultChecked: _radioSlotDefaultChecked,
    disabled: radioSlotDisabled,
    name: _radioSlotName,
    value: _radioSlotValue,
    ...radioSlotOther
  } = resolvedRadioSlotProps;
  void _radioSlotChecked;
  void _radioSlotDefaultChecked;
  void _radioSlotName;
  void _radioSlotValue;
  const resolvedOptionLabelSlotProps = resolveSlotProps(slotProps.optionLabel, ownerState);
  const { className: optionLabelSlotClassName, ...optionLabelSlotOther } = resolvedOptionLabelSlotProps;
  const resolvedFormHelperTextSlotProps = resolveSlotProps(slotProps.formHelperText, ownerState);
  const {
    className: formHelperTextSlotClassName,
    id: formHelperTextSlotId,
    ...formHelperTextSlotOther
  } = resolvedFormHelperTextSlotProps;
  const rootRef = useForkRef(forwardedRef, rootSlotRef);

  const effectiveError = error || fieldState.invalid;
  const effectiveHelperText = errorVisible ? formattedError : helperText;
  const formHelperTextId = formHelperTextSlotId ?? generatedHelperTextId;
  const groupDescribedBy = joinIds(
    ariaDescribedBy,
    radioGroupSlotAriaDescribedBy,
    effectiveHelperText !== undefined ? formHelperTextId : undefined,
  );
  const encodedValue = fieldState.value === null ? "" : encodeOptionValue(fieldState.value);

  const handleChange: RadioGroupChangeHandler = (event, nextEncodedValue) => {
    const restoreCheckedValue = () => {
      const group = event.currentTarget;
      queueMicrotask(() => {
        group.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(input => {
          input.checked = input.value === encodedValue;
        });
      });
    };

    radioGroupSlotOnChange?.(event, nextEncodedValue);
    if (event.defaultPrevented) {
      restoreCheckedValue();
      return;
    }
    onChange?.(event, nextEncodedValue);
    if (event.defaultPrevented) {
      restoreCheckedValue();
      return;
    }

    const selectedOption = options.find(option => encodeOptionValue(getOptionValue(option)) === nextEncodedValue);
    if (selectedOption === undefined) return;

    const nextValue = getOptionValue(selectedOption);
    onValueChange?.(nextValue);
    field.handleChange(nextValue);
  };

  const handleBlur: RadioGroupBlurHandler = event => {
    radioGroupSlotOnBlur?.(event);
    if (event.defaultPrevented) return;
    onBlur?.(event);
    if (event.defaultPrevented) return;
    field.handleBlur();
  };

  return (
    <VireoFormRadioGroupFieldRoot
      {...other}
      {...rootSlotOther}
      as={slots.root}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootSlotClassName)}
      disabled={disabled}
      error={effectiveError}
      fullWidth={fullWidth}
      required={required}
      style={{ ...style, ...rootSlotStyle }}
      sx={mergeSx(sx, rootSlotSx)}
    >
      <VireoFormRadioGroupFieldRadioGroup
        {...radioGroupSlotOther}
        as={slots.radioGroup}
        ownerState={ownerState}
        aria-describedby={groupDescribedBy}
        aria-invalid={effectiveError || isAriaInvalid(radioGroupSlotAriaInvalid) || undefined}
        aria-label={ariaLabel ?? radioGroupSlotAriaLabel}
        aria-labelledby={ariaLabelledBy ?? radioGroupSlotAriaLabelledBy}
        className={joinClassNames(classes.radioGroup, radioGroupSlotClassName)}
        name={field.name}
        onBlur={handleBlur}
        onChange={handleChange}
        row={row}
        value={encodedValue}
      >
        {options.map(option => {
          const optionValue = getOptionValue(option);
          const optionDisabled =
            disabled ||
            radioSlotDisabled === true ||
            formControlLabelSlotDisabled === true ||
            getOptionDisabled?.(option);

          return (
            <VireoFormRadioGroupFieldFormControlLabel
              {...formControlLabelSlotOther}
              as={slots.formControlLabel}
              key={encodeOptionValue(optionValue)}
              ownerState={ownerState}
              className={joinClassNames(classes.formControlLabel, formControlLabelSlotClassName)}
              control={
                <VireoFormRadioGroupFieldRadio
                  {...radioSlotOther}
                  as={slots.radio}
                  ownerState={ownerState}
                  className={joinClassNames(classes.radio, radioSlotClassName)}
                  disabled={optionDisabled}
                  name={field.name}
                  required={required}
                  value={encodeOptionValue(optionValue)}
                />
              }
              disabled={optionDisabled}
              disableTypography
              label={
                <VireoFormRadioGroupFieldOptionLabel
                  {...optionLabelSlotOther}
                  as={slots.optionLabel}
                  ownerState={ownerState}
                  className={joinClassNames(classes.optionLabel, optionLabelSlotClassName)}
                  component="span"
                >
                  {renderOption(option)}
                </VireoFormRadioGroupFieldOptionLabel>
              }
              labelPlacement={labelPlacement}
              value={encodeOptionValue(optionValue)}
            />
          );
        })}
      </VireoFormRadioGroupFieldRadioGroup>
      {effectiveHelperText !== undefined && (
        <VireoFormRadioGroupFieldFormHelperText
          {...formHelperTextSlotOther}
          as={slots.formHelperText}
          id={formHelperTextId}
          ownerState={ownerState}
          className={joinClassNames(classes.formHelperText, formHelperTextSlotClassName)}
        >
          {effectiveHelperText}
        </VireoFormRadioGroupFieldFormHelperText>
      )}
    </VireoFormRadioGroupFieldRoot>
  );
}

type VireoFormRadioGroupFieldComponent = {
  <TOption, TValue extends VireoFormRadioGroupFieldValue>(
    props: VireoFormRadioGroupFieldProps<TOption, TValue> & React.RefAttributes<HTMLDivElement>,
  ): React.ReactElement;
  displayName?: string;
};

/**
 * Binds typed scalar radio options to the current TanStack Form field and shared validation policy.
 *
 * Consumers render it as `field.RadioGroupField`; the raw runtime remains internal to the forms capability.
 */
export const VireoFormRadioGroupField = React.forwardRef(
  VireoFormRadioGroupFieldImpl,
) as VireoFormRadioGroupFieldComponent;

VireoFormRadioGroupField.displayName = VIREO_FORM_RADIO_GROUP_FIELD_NAME;
