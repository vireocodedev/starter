import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import {
  unstable_composeClasses as composeClasses,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import {
  type VireoFormToggleButtonGroupFieldClassKey,
  getVireoFormToggleButtonGroupFieldUtilityClass,
} from "./VireoFormToggleButtonGroupField.classes";
import {
  VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME,
  type VireoFormToggleButtonGroupFieldSlotName,
} from "./VireoFormToggleButtonGroupField.identity";
import {
  VireoFormToggleButtonGroupFieldFormHelperText,
  VireoFormToggleButtonGroupFieldRoot,
  VireoFormToggleButtonGroupFieldToggleButton,
  VireoFormToggleButtonGroupFieldToggleButtonGroup,
} from "./VireoFormToggleButtonGroupField.styled";
import type {
  VireoFormToggleButtonGroupFieldOption,
  VireoFormToggleButtonGroupFieldOptionState,
  VireoFormToggleButtonGroupFieldOwnerState,
  VireoFormToggleButtonGroupFieldProps,
  VireoFormToggleButtonGroupFieldValue,
} from "./VireoFormToggleButtonGroupField.types";

type GroupBlurHandler = NonNullable<ToggleButtonGroupProps["onBlur"]>;
type GroupChangeHandler = NonNullable<ToggleButtonGroupProps["onChange"]>;

function useUtilityClasses(
  ownerState: VireoFormToggleButtonGroupFieldOwnerState,
  classes?: VireoFormToggleButtonGroupFieldProps["classes"],
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
        ownerState.multiple && "multiple",
      ],
      toggleButtonGroup: ["toggleButtonGroup"],
      toggleButton: ["toggleButton"],
      formHelperText: ["formHelperText"],
    } as const satisfies UtilityClassSlotMap<
      VireoFormToggleButtonGroupFieldSlotName,
      VireoFormToggleButtonGroupFieldClassKey
    >,
    getVireoFormToggleButtonGroupFieldUtilityClass,
    classes,
  );
}

function valuesEqual(left: VireoFormToggleButtonGroupFieldValue, right: unknown): boolean {
  return Object.is(left, right);
}

function optionKey(value: VireoFormToggleButtonGroupFieldValue): string {
  return `${typeof value}:${String(value)}`;
}

function hasDuplicateValues<TValue extends VireoFormToggleButtonGroupFieldValue>(
  options: readonly VireoFormToggleButtonGroupFieldOption<TValue>[],
): boolean {
  return options.some((option, index) =>
    options.slice(0, index).some(previous => valuesEqual(previous.value, option.value)),
  );
}

function joinIds(...ids: Array<string | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}

function isAriaInvalid(value: unknown): boolean {
  return value === true || value === "true";
}

function VireoFormToggleButtonGroupFieldImpl<TValue extends VireoFormToggleButtonGroupFieldValue>(
  inProps: VireoFormToggleButtonGroupFieldProps<TValue>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({
    props: inProps,
    name: VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME,
  }) as VireoFormToggleButtonGroupFieldProps<TValue>;
  const {
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    className,
    classes: classesProp,
    color = "standard",
    disabled = false,
    disableClearable = false,
    error = false,
    errorDisplay: errorDisplayProp,
    formatError: formatErrorProp,
    fullWidth = true,
    getOptionProps,
    helperText = " ",
    multiple = false,
    onBlur,
    onChange,
    onValueChange,
    options,
    orientation = "horizontal",
    readOnly = false,
    renderOption,
    required = false,
    size = "medium",
    slotProps = {},
    slots = {},
    style,
    sx,
    ...other
  } = props;

  if (hasDuplicateValues(options)) {
    throw new Error(`${VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME} options must have unique values.`);
  }

  const field = useVireoFieldContext<TValue | null | TValue[]>();
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
  const multipleValue = Array.isArray(fieldState.value) ? fieldState.value : [];
  const exclusiveValue = Array.isArray(fieldState.value) || fieldState.value === undefined ? null : fieldState.value;
  const hasValue = multiple ? multipleValue.length > 0 : exclusiveValue !== null;
  const ownerState: VireoFormToggleButtonGroupFieldOwnerState = {
    color,
    dirty: fieldState.dirty,
    disabled,
    disableClearable,
    errorVisible: error || errorVisible,
    fullWidth,
    hasValue,
    invalid: fieldState.invalid,
    multiple,
    orientation,
    readOnly,
    required,
    size,
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
  const resolvedGroupSlotProps = resolveSlotProps(slotProps.toggleButtonGroup, ownerState);
  const {
    "aria-describedby": groupSlotAriaDescribedBy,
    "aria-invalid": groupSlotAriaInvalid,
    "aria-label": groupSlotAriaLabel,
    "aria-labelledby": groupSlotAriaLabelledBy,
    className: groupSlotClassName,
    exclusive: _groupSlotExclusive,
    onBlur: groupSlotOnBlur,
    onChange: groupSlotOnChange,
    ref: groupSlotRef,
    value: _groupSlotValue,
    ...groupSlotOther
  } = resolvedGroupSlotProps;
  void _groupSlotExclusive;
  void _groupSlotValue;
  const resolvedToggleButtonSlotProps = resolveSlotProps(slotProps.toggleButton, ownerState);
  const {
    children: _toggleButtonSlotChildren,
    className: toggleButtonSlotClassName,
    disabled: toggleButtonSlotDisabled,
    onChange: _toggleButtonSlotOnChange,
    selected: _toggleButtonSlotSelected,
    value: _toggleButtonSlotValue,
    ...toggleButtonSlotOther
  } = resolvedToggleButtonSlotProps;
  void _toggleButtonSlotChildren;
  void _toggleButtonSlotOnChange;
  void _toggleButtonSlotSelected;
  void _toggleButtonSlotValue;
  const resolvedHelperSlotProps = resolveSlotProps(slotProps.formHelperText, ownerState);
  const { className: helperSlotClassName, id: helperSlotId, ...helperSlotOther } = resolvedHelperSlotProps;
  const rootRef = useForkRef(forwardedRef, rootSlotRef);

  const effectiveError = error || fieldState.invalid;
  const effectiveHelperText = errorVisible ? formattedError : helperText;
  const helperTextId = helperSlotId ?? generatedHelperTextId;
  const describedBy = joinIds(
    ariaDescribedBy,
    groupSlotAriaDescribedBy,
    effectiveHelperText !== undefined ? helperTextId : undefined,
  );

  const isSelected = (value: TValue): boolean =>
    multiple
      ? multipleValue.some(selectedValue => valuesEqual(value, selectedValue))
      : valuesEqual(value, exclusiveValue);

  const normalizeMultipleValue = (candidate: unknown): TValue[] => {
    const values = Array.isArray(candidate) ? candidate : [];
    return options.filter(option => values.some(value => valuesEqual(option.value, value))).map(option => option.value);
  };

  const handleChange: GroupChangeHandler = (event, candidateValue) => {
    if (disabled || readOnly) return;

    const nextValue = multiple
      ? normalizeMultipleValue(candidateValue)
      : (options.find(option => valuesEqual(option.value, candidateValue))?.value ?? null);
    const wouldClear = multiple ? (nextValue as TValue[]).length === 0 : nextValue === null;
    if (disableClearable && hasValue && wouldClear) return;

    groupSlotOnChange?.(event, nextValue);
    if (event.defaultPrevented) return;
    (onChange as ((event: React.MouseEvent<HTMLElement>, value: TValue[] | TValue | null) => void) | undefined)?.(
      event,
      nextValue,
    );
    if (event.defaultPrevented) return;

    (onValueChange as ((value: TValue[] | TValue | null) => void) | undefined)?.(nextValue);
    field.handleChange(nextValue);
  };

  const handleBlur: GroupBlurHandler = event => {
    groupSlotOnBlur?.(event);
    if (event.defaultPrevented) return;
    onBlur?.(event);
    if (event.defaultPrevented) return;
    field.handleBlur();
  };

  const selectedEnabledIndex = options.findIndex(option => isSelected(option.value) && !disabled && !option.disabled);
  const firstEnabledIndex = options.findIndex(option => !disabled && !option.disabled);
  const preferredFocusIndex = selectedEnabledIndex >= 0 ? selectedEnabledIndex : firstEnabledIndex;

  return (
    <VireoFormToggleButtonGroupFieldRoot
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
      <VireoFormToggleButtonGroupFieldToggleButtonGroup
        {...groupSlotOther}
        as={slots.toggleButtonGroup}
        ref={groupSlotRef}
        ownerState={ownerState}
        aria-describedby={describedBy}
        aria-invalid={effectiveError || isAriaInvalid(groupSlotAriaInvalid) || undefined}
        aria-label={ariaLabel ?? groupSlotAriaLabel}
        aria-labelledby={ariaLabelledBy ?? groupSlotAriaLabelledBy}
        aria-readonly={readOnly || undefined}
        aria-required={required || undefined}
        className={joinClassNames(classes.toggleButtonGroup, groupSlotClassName)}
        color={color}
        exclusive={!multiple}
        onBlur={handleBlur}
        onChange={handleChange}
        orientation={orientation}
        size={size}
        value={multiple ? multipleValue : exclusiveValue}
      >
        {options.map((option, index) => {
          const selected = isSelected(option.value);
          const optionDisabled = disabled || toggleButtonSlotDisabled === true || option.disabled === true;
          const optionState: VireoFormToggleButtonGroupFieldOptionState = { disabled: optionDisabled, index, selected };
          const optionProps = (getOptionProps?.(option, optionState) ?? {}) as unknown as ToggleButtonProps;
          const {
            children: _optionChildren,
            className: optionClassName,
            disabled: _optionDisabled,
            onChange: _optionOnChange,
            selected: _optionSelected,
            value: _optionValue,
            ...optionOther
          } = optionProps;
          void _optionChildren;
          void _optionDisabled;
          void _optionOnChange;
          void _optionSelected;
          void _optionValue;

          return (
            <VireoFormToggleButtonGroupFieldToggleButton
              {...toggleButtonSlotOther}
              {...optionOther}
              as={slots.toggleButton}
              key={optionKey(option.value)}
              ownerState={ownerState}
              aria-label={option.ariaLabel ?? optionOther["aria-label"]}
              className={joinClassNames(classes.toggleButton, toggleButtonSlotClassName, optionClassName)}
              data-vireo-field-focus-target={index === preferredFocusIndex ? "true" : undefined}
              disabled={optionDisabled}
              value={option.value}
            >
              {renderOption?.(option, optionState) ?? option.label}
            </VireoFormToggleButtonGroupFieldToggleButton>
          );
        })}
      </VireoFormToggleButtonGroupFieldToggleButtonGroup>
      {effectiveHelperText !== undefined && (
        <VireoFormToggleButtonGroupFieldFormHelperText
          {...helperSlotOther}
          as={slots.formHelperText}
          id={helperTextId}
          ownerState={ownerState}
          className={joinClassNames(classes.formHelperText, helperSlotClassName)}
        >
          {effectiveHelperText}
        </VireoFormToggleButtonGroupFieldFormHelperText>
      )}
    </VireoFormToggleButtonGroupFieldRoot>
  );
}

type VireoFormToggleButtonGroupFieldComponent = {
  <TValue extends VireoFormToggleButtonGroupFieldValue>(
    props: VireoFormToggleButtonGroupFieldProps<TValue> & React.RefAttributes<HTMLDivElement>,
  ): React.ReactElement;
  displayName?: string;
};

/**
 * Binds exclusive or multiple scalar choices to the current TanStack Form field through toggle buttons.
 *
 * Consumers render it as `field.ToggleButtonGroupField`; the raw runtime remains internal to the forms capability.
 */
export const VireoFormToggleButtonGroupField = React.forwardRef(
  VireoFormToggleButtonGroupFieldImpl,
) as VireoFormToggleButtonGroupFieldComponent;

VireoFormToggleButtonGroupField.displayName = VIREO_FORM_TOGGLE_BUTTON_GROUP_FIELD_NAME;
