import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { VireoFormReadOnlyValue } from "@/capabilities/forms/components/data-display/VireoFormReadOnlyValue/VireoFormReadOnlyValue";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses, type CheckboxProps } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import {
  type VireoFormCheckboxFieldClassKey,
  getVireoFormCheckboxFieldUtilityClass,
} from "./VireoFormCheckboxField.classes";
import { VIREO_FORM_CHECKBOX_FIELD_NAME, type VireoFormCheckboxFieldSlotName } from "./VireoFormCheckboxField.identity";
import {
  VireoFormCheckboxFieldFormControlLabel,
  VireoFormCheckboxFieldFormHelperText,
  VireoFormCheckboxFieldLabel,
  VireoFormCheckboxFieldRoot,
  VireoFormCheckboxFieldCheckbox,
} from "./VireoFormCheckboxField.styled";
import {
  type VireoFormCheckboxFieldOwnerState,
  type VireoFormCheckboxFieldProps,
} from "./VireoFormCheckboxField.types";

type CheckboxChangeHandler = NonNullable<CheckboxProps["onChange"]>;
type CheckboxBlurHandler = NonNullable<CheckboxProps["onBlur"]>;

function useUtilityClasses(
  ownerState: VireoFormCheckboxFieldOwnerState,
  classes?: VireoFormCheckboxFieldProps["classes"],
) {
  return composeClasses(
    {
      root: [
        "root",
        ownerState.checked && "checked",
        ownerState.dirty && "dirty",
        ownerState.touched && "touched",
        ownerState.invalid && "invalid",
        ownerState.errorVisible && "errorVisible",
        ownerState.validating && "validating",
        ownerState.submitting && "submitting",
        ownerState.disabled && "disabled",
        ownerState.readOnly && "readOnly",
      ],
      formControlLabel: ["formControlLabel"],
      checkbox: ["checkbox"],
      label: ["label"],
      formHelperText: ["formHelperText"],
    } as const satisfies UtilityClassSlotMap<VireoFormCheckboxFieldSlotName, VireoFormCheckboxFieldClassKey>,
    getVireoFormCheckboxFieldUtilityClass,
    classes,
  );
}

function isAriaInvalid(value: unknown): boolean {
  return value === true || value === "true";
}

function joinIds(...ids: Array<string | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

/**
 * Binds a labelled MUI Checkbox to the current TanStack Form boolean field and shared validation policy.
 *
 * Consumers render it as `field.CheckboxField`; the raw runtime remains internal to the forms capability.
 */
export const VireoFormCheckboxField = React.forwardRef<HTMLDivElement, VireoFormCheckboxFieldProps>(
  function VireoFormCheckboxField(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_CHECKBOX_FIELD_NAME });
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
      labelPlacement = "end",
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
      ...other
    } = props;
    const field = useVireoFieldContext<boolean>();
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
    const ownerState: VireoFormCheckboxFieldOwnerState = {
      checked: fieldState.value === true,
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

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const resolvedFormControlLabelSlotProps = resolveSlotProps(slotProps.formControlLabel, ownerState);
    const {
      className: formControlLabelSlotClassName,
      onChange: formControlLabelSlotOnChange,
      ...formControlLabelSlotOther
    } = resolvedFormControlLabelSlotProps;
    const resolvedCheckboxSlotProps = resolveSlotProps(slotProps.checkbox, ownerState);
    const {
      className: checkboxSlotClassName,
      inputProps: checkboxSlotInputProps,
      inputRef: checkboxSlotInputRef,
      slotProps: checkboxMuiSlotProps,
      onBlur: checkboxSlotOnBlur,
      onChange: checkboxSlotOnChange,
      ...checkboxSlotOther
    } = resolvedCheckboxSlotProps;
    const resolvedLabelSlotProps = resolveSlotProps(slotProps.label, ownerState);
    const { className: labelSlotClassName, ...labelSlotOther } = resolvedLabelSlotProps;
    const resolvedFormHelperTextSlotProps = resolveSlotProps(slotProps.formHelperText, ownerState);
    const {
      className: formHelperTextSlotClassName,
      id: formHelperTextSlotId,
      ...formHelperTextSlotOther
    } = resolvedFormHelperTextSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const nativeInputRef = useForkRef(inputRef, checkboxSlotInputRef);
    const effectiveError = error || fieldState.invalid;
    const effectiveHelperText = errorVisible ? formattedError : helperText;
    const formHelperTextId = formHelperTextSlotId ?? generatedHelperTextId;
    const inputDescribedBy = joinIds(
      checkboxSlotInputProps?.["aria-describedby"],
      effectiveHelperText !== undefined ? formHelperTextId : undefined,
    );

    if (effectiveReadOnly) {
      const empty = fieldState.value == null;
      return (
        <VireoFormReadOnlyValue
          {...other}
          {...rootSlotOther}
          ref={rootRef}
          aria-label={checkboxSlotInputProps?.["aria-label"]}
          className={joinClassNames(classes.root, className, rootSlotClassName)}
          empty={empty}
          emptyValue={readOnlyEmptyValue ?? formContext.readOnlyEmptyValue}
          label={label}
          style={{ ...style, ...rootSlotStyle }}
          sx={mergeSx(sx, rootSlotSx)}
        >
          {renderReadOnlyValue?.(fieldState.value) ?? (fieldState.value ? "Yes" : "No")}
        </VireoFormReadOnlyValue>
      );
    }

    const handleChange: CheckboxChangeHandler = (event, checked) => {
      const restoreCheckedValue = () => {
        const input = event.currentTarget;
        queueMicrotask(() => {
          input.checked = ownerState.checked;
        });
      };

      formControlLabelSlotOnChange?.(event, checked);
      if (event.defaultPrevented) {
        restoreCheckedValue();
        return;
      }
      checkboxSlotOnChange?.(event, checked);
      if (event.defaultPrevented) {
        restoreCheckedValue();
        return;
      }
      onChange?.(event, checked);
      if (event.defaultPrevented) {
        restoreCheckedValue();
        return;
      }
      field.handleChange(checked);
    };

    const handleBlur: CheckboxBlurHandler = event => {
      checkboxSlotOnBlur?.(event);
      if (event.defaultPrevented) return;
      onBlur?.(event);
      if (event.defaultPrevented) return;
      field.handleBlur();
    };

    return (
      <VireoFormCheckboxFieldRoot
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
        <VireoFormCheckboxFieldFormControlLabel
          {...formControlLabelSlotOther}
          as={slots.formControlLabel}
          ownerState={ownerState}
          className={joinClassNames(classes.formControlLabel, formControlLabelSlotClassName)}
          control={
            <VireoFormCheckboxFieldCheckbox
              {...checkboxSlotOther}
              as={slots.checkbox}
              ownerState={ownerState}
              checked={ownerState.checked}
              className={joinClassNames(classes.checkbox, checkboxSlotClassName)}
              disabled={disabled}
              slotProps={{
                ...checkboxMuiSlotProps,
                input: muiOwnerState => {
                  const muiInputProps =
                    typeof checkboxMuiSlotProps?.input === "function"
                      ? checkboxMuiSlotProps.input(muiOwnerState)
                      : checkboxMuiSlotProps?.input;
                  return {
                    ...muiInputProps,
                    ...checkboxSlotInputProps,
                    "aria-describedby": inputDescribedBy,
                    "aria-invalid":
                      effectiveError || isAriaInvalid(checkboxSlotInputProps?.["aria-invalid"]) || undefined,
                    ref: (node: HTMLInputElement | null) => {
                      assignRef(muiInputProps?.ref, node);
                      assignRef(nativeInputRef, node);
                    },
                  };
                },
              }}
              name={field.name}
              onBlur={handleBlur}
              onChange={handleChange}
              required={required}
            />
          }
          disabled={disabled}
          disableTypography
          label={
            <VireoFormCheckboxFieldLabel
              {...labelSlotOther}
              as={slots.label}
              ownerState={ownerState}
              className={joinClassNames(classes.label, labelSlotClassName)}
              component="span"
            >
              {label}
            </VireoFormCheckboxFieldLabel>
          }
          labelPlacement={labelPlacement}
          onChange={undefined}
          required={required}
        />
        {effectiveHelperText !== undefined && (
          <VireoFormCheckboxFieldFormHelperText
            {...formHelperTextSlotOther}
            as={slots.formHelperText}
            id={formHelperTextId}
            ownerState={ownerState}
            className={joinClassNames(classes.formHelperText, formHelperTextSlotClassName)}
          >
            {effectiveHelperText}
          </VireoFormCheckboxFieldFormHelperText>
        )}
      </VireoFormCheckboxFieldRoot>
    );
  },
);

VireoFormCheckboxField.displayName = VIREO_FORM_CHECKBOX_FIELD_NAME;
