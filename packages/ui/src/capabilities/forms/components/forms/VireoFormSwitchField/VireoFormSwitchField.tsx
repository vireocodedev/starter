import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { VireoFormReadOnlyValue } from "@/capabilities/forms/components/data-display/VireoFormReadOnlyValue/VireoFormReadOnlyValue";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses, type SwitchProps } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import { type VireoFormSwitchFieldClassKey, getVireoFormSwitchFieldUtilityClass } from "./VireoFormSwitchField.classes";
import { VIREO_FORM_SWITCH_FIELD_NAME, type VireoFormSwitchFieldSlotName } from "./VireoFormSwitchField.identity";
import {
  VireoFormSwitchFieldFormControlLabel,
  VireoFormSwitchFieldFormHelperText,
  VireoFormSwitchFieldLabel,
  VireoFormSwitchFieldRoot,
  VireoFormSwitchFieldSwitch,
} from "./VireoFormSwitchField.styled";
import { type VireoFormSwitchFieldOwnerState, type VireoFormSwitchFieldProps } from "./VireoFormSwitchField.types";

type SwitchChangeHandler = NonNullable<SwitchProps["onChange"]>;
type SwitchBlurHandler = NonNullable<SwitchProps["onBlur"]>;

function useUtilityClasses(ownerState: VireoFormSwitchFieldOwnerState, classes?: VireoFormSwitchFieldProps["classes"]) {
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
      switch: ["switch"],
      label: ["label"],
      formHelperText: ["formHelperText"],
    } as const satisfies UtilityClassSlotMap<VireoFormSwitchFieldSlotName, VireoFormSwitchFieldClassKey>,
    getVireoFormSwitchFieldUtilityClass,
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
 * Binds a labelled MUI Switch to the current TanStack Form boolean field and shared validation policy.
 *
 * Consumers render it as `field.SwitchField`; the raw runtime remains internal to the forms capability.
 */
export const VireoFormSwitchField = React.forwardRef<HTMLDivElement, VireoFormSwitchFieldProps>(
  function VireoFormSwitchField(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_SWITCH_FIELD_NAME });
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
    const ownerState: VireoFormSwitchFieldOwnerState = {
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
    const resolvedSwitchSlotProps = resolveSlotProps(slotProps.switch, ownerState);
    const {
      className: switchSlotClassName,
      inputProps: switchSlotInputProps,
      inputRef: switchSlotInputRef,
      slotProps: switchMuiSlotProps,
      onBlur: switchSlotOnBlur,
      onChange: switchSlotOnChange,
      ...switchSlotOther
    } = resolvedSwitchSlotProps;
    const resolvedLabelSlotProps = resolveSlotProps(slotProps.label, ownerState);
    const { className: labelSlotClassName, ...labelSlotOther } = resolvedLabelSlotProps;
    const resolvedFormHelperTextSlotProps = resolveSlotProps(slotProps.formHelperText, ownerState);
    const {
      className: formHelperTextSlotClassName,
      id: formHelperTextSlotId,
      ...formHelperTextSlotOther
    } = resolvedFormHelperTextSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const nativeInputRef = useForkRef(inputRef, switchSlotInputRef);
    const effectiveError = error || fieldState.invalid;
    const effectiveHelperText = errorVisible ? formattedError : helperText;
    const formHelperTextId = formHelperTextSlotId ?? generatedHelperTextId;
    const inputDescribedBy = joinIds(
      switchSlotInputProps?.["aria-describedby"],
      effectiveHelperText !== undefined ? formHelperTextId : undefined,
    );

    if (effectiveReadOnly) {
      const empty = fieldState.value == null;
      return (
        <VireoFormReadOnlyValue
          {...other}
          {...rootSlotOther}
          ref={rootRef}
          aria-label={switchSlotInputProps?.["aria-label"]}
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

    const handleChange: SwitchChangeHandler = (event, checked) => {
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
      switchSlotOnChange?.(event, checked);
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

    const handleBlur: SwitchBlurHandler = event => {
      switchSlotOnBlur?.(event);
      if (event.defaultPrevented) return;
      onBlur?.(event);
      if (event.defaultPrevented) return;
      field.handleBlur();
    };

    return (
      <VireoFormSwitchFieldRoot
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
        <VireoFormSwitchFieldFormControlLabel
          {...formControlLabelSlotOther}
          as={slots.formControlLabel}
          ownerState={ownerState}
          className={joinClassNames(classes.formControlLabel, formControlLabelSlotClassName)}
          control={
            <VireoFormSwitchFieldSwitch
              {...switchSlotOther}
              as={slots.switch}
              ownerState={ownerState}
              checked={ownerState.checked}
              className={joinClassNames(classes.switch, switchSlotClassName)}
              disabled={disabled}
              slotProps={{
                ...switchMuiSlotProps,
                input: muiOwnerState => {
                  const muiInputProps =
                    typeof switchMuiSlotProps?.input === "function"
                      ? switchMuiSlotProps.input(muiOwnerState)
                      : switchMuiSlotProps?.input;
                  return {
                    ...muiInputProps,
                    ...switchSlotInputProps,
                    "aria-describedby": inputDescribedBy,
                    "aria-invalid":
                      effectiveError || isAriaInvalid(switchSlotInputProps?.["aria-invalid"]) || undefined,
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
            <VireoFormSwitchFieldLabel
              {...labelSlotOther}
              as={slots.label}
              ownerState={ownerState}
              className={joinClassNames(classes.label, labelSlotClassName)}
              component="span"
            >
              {label}
            </VireoFormSwitchFieldLabel>
          }
          labelPlacement={labelPlacement}
          onChange={undefined}
          required={required}
        />
        {effectiveHelperText !== undefined && (
          <VireoFormSwitchFieldFormHelperText
            {...formHelperTextSlotOther}
            as={slots.formHelperText}
            id={formHelperTextId}
            ownerState={ownerState}
            className={joinClassNames(classes.formHelperText, formHelperTextSlotClassName)}
          >
            {effectiveHelperText}
          </VireoFormSwitchFieldFormHelperText>
        )}
      </VireoFormSwitchFieldRoot>
    );
  },
);

VireoFormSwitchField.displayName = VIREO_FORM_SWITCH_FIELD_NAME;
