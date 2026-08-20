import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { TextField, unstable_composeClasses as composeClasses, type TextFieldProps } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { DatePicker, DateTimePicker, TimePicker } from "@mui/x-date-pickers";
import { useStore } from "@tanstack/react-form";
import { type Dayjs } from "dayjs";
import React from "react";
import {
  formatTemporalValue,
  parseTemporalValue,
  temporalErrorMessage,
  validateTemporalCandidate,
} from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/temporalValue";
import {
  type VireoFormTemporalFieldClassKey,
  getVireoFormTemporalFieldUtilityClass,
} from "./VireoFormTemporalField.classes";
import { VIREO_FORM_TEMPORAL_FIELD_NAME, type VireoFormTemporalFieldSlotName } from "./VireoFormTemporalField.identity";
import {
  VireoFormTemporalFieldClearButton,
  VireoFormTemporalFieldClearIcon,
  VireoFormTemporalFieldFilledInput,
  VireoFormTemporalFieldFormHelperText,
  VireoFormTemporalFieldOpenPickerButton,
  VireoFormTemporalFieldOpenPickerIcon,
  VireoFormTemporalFieldOutlinedInput,
  VireoFormTemporalFieldRoot,
  VireoFormTemporalFieldStandardInput,
} from "./VireoFormTemporalField.styled";
import {
  type VireoFormTemporalFieldError,
  type VireoFormTemporalFieldOwnerState,
  type VireoFormTemporalFieldPickerError,
  type VireoFormTemporalFieldProps,
  type VireoFormTemporalFieldValue,
} from "./VireoFormTemporalField.types";

type TemporalErrorFormApi = {
  setErrorMap: (errorMap: Record<string, unknown>) => void;
};

type TemporalFormErrorState = {
  errors: Map<string, string>;
};

const VIREO_TEMPORAL_ERROR_KEY = "__vireoTemporal";
const temporalFormErrors = new WeakMap<object, TemporalFormErrorState>();

function setTemporalFormError(form: TemporalErrorFormApi, fieldName: string, error: string | null): void {
  let state = temporalFormErrors.get(form as object);
  if (!state) {
    state = { errors: new Map() };
    temporalFormErrors.set(form as object, state);
  }

  if (error) state.errors.set(fieldName, error);
  else state.errors.delete(fieldName);

  if (state.errors.size > 0) {
    form.setErrorMap({ [VIREO_TEMPORAL_ERROR_KEY]: [...state.errors.values()] });
    return;
  }

  form.setErrorMap({ [VIREO_TEMPORAL_ERROR_KEY]: undefined });
  temporalFormErrors.delete(form as object);
}

function useUtilityClasses(
  ownerState: VireoFormTemporalFieldOwnerState,
  classes?: VireoFormTemporalFieldProps["classes"],
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
      input: ["input"],
      htmlInput: ["htmlInput"],
      formHelperText: ["formHelperText"],
      openPickerButton: ["openPickerButton"],
      openPickerIcon: ["openPickerIcon"],
      clearButton: ["clearButton"],
      clearIcon: ["clearIcon"],
    } as const satisfies UtilityClassSlotMap<VireoFormTemporalFieldSlotName, VireoFormTemporalFieldClassKey>,
    getVireoFormTemporalFieldUtilityClass,
    classes,
  );
}

function pickerErrorToTemporalError(error: VireoFormTemporalFieldPickerError): VireoFormTemporalFieldError | null {
  if (!error) return null;
  if (error === "minDate" || error === "minTime") return "min";
  if (error === "maxDate" || error === "maxTime") return "max";
  if (error === "minutesStep") return "minuteStep";
  return "invalid";
}

function resolveExternalSlotProps<TProps, TOwnerState>(
  slotProps: TProps | ((ownerState: TOwnerState) => TProps) | undefined,
  ownerState: TOwnerState,
): TProps | undefined {
  return typeof slotProps === "function" ? (slotProps as (state: TOwnerState) => TProps)(ownerState) : slotProps;
}

type TemporalPickerTextFieldProps = TextFieldProps & {
  vireoTextFieldComponent?: React.ElementType;
  vireoSlots?: TextFieldProps["slots"];
  vireoSlotProps?: TextFieldProps["slotProps"];
};

const TemporalPickerTextField = React.forwardRef<HTMLDivElement, TemporalPickerTextFieldProps>(
  function TemporalPickerTextField(
    { vireoSlotProps, vireoSlots, vireoTextFieldComponent, ...textFieldProps },
    forwardedRef,
  ) {
    const Component = vireoTextFieldComponent ?? TextField;
    const inputSlotProps = vireoSlotProps?.input;
    const htmlInputSlotProps = vireoSlotProps?.htmlInput;
    return (
      <Component
        {...textFieldProps}
        ref={forwardedRef}
        slots={{ ...textFieldProps.slots, ...vireoSlots }}
        slotProps={{
          ...textFieldProps.slotProps,
          ...vireoSlotProps,
          input: {
            ...(textFieldProps.InputProps as object),
            ...(textFieldProps.slotProps?.input as object),
            ...(inputSlotProps as object),
          },
          htmlInput: {
            ...(textFieldProps.inputProps as object),
            ...(textFieldProps.slotProps?.htmlInput as object),
            ...(htmlInputSlotProps as object),
          },
        }}
      />
    );
  },
);

/**
 * Binds localized MUI date and time pickers to canonical timezone-free `string | null` TanStack Form values.
 *
 * Consumers render this component through `field.TemporalField`; the raw runtime is intentionally capability-bound.
 */
export const VireoFormTemporalField = React.forwardRef<HTMLDivElement, VireoFormTemporalFieldProps>(
  function VireoFormTemporalField(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_TEMPORAL_FIELD_NAME });
    const {
      ampm = false,
      className,
      classes: classesProp,
      clearable = true,
      clearLabel = "Clear temporal value",
      disabled = false,
      error = false,
      errorDisplay: errorDisplayProp,
      formatError: formatErrorProp,
      fullWidth = true,
      helperText,
      inputRef,
      max,
      min,
      minuteStep = 1,
      mode,
      onBlur,
      onValueChange,
      openTo,
      pickerProps = {},
      precision = "minute",
      readOnly = false,
      referenceValue,
      required = false,
      secondStep = 1,
      slotProps = {},
      slots = {},
      style,
      sx,
      variant = "outlined",
      ...other
    } = props;
    const field = useVireoFieldContext<VireoFormTemporalFieldValue>();
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
    const [draftValue, setDraftValue] = React.useState<Dayjs | null>(() => parseTemporalValue(mode, fieldState.value));
    const [draftError, setDraftError] = React.useState<string | null>(null);
    const pickerOpenRef = React.useRef(false);
    const rootElementRef = React.useRef<HTMLDivElement | null>(null);
    const lastCommittedValueRef = React.useRef(fieldState.value);
    const lastModeRef = React.useRef(mode);
    const synchronizedRef = React.useRef(false);

    const normalizedMinuteStep = Number.isInteger(minuteStep) && minuteStep > 0 ? minuteStep : 1;
    const normalizedSecondStep = Number.isInteger(secondStep) && secondStep > 0 ? secondStep : 1;
    const minValue = parseTemporalValue(mode, min);
    const maxValue = parseTemporalValue(mode, max);
    const referenceDate = parseTemporalValue(mode, referenceValue);

    const validateCandidate = React.useCallback(
      (candidate: Dayjs | null, pickerError?: VireoFormTemporalFieldPickerError) => {
        const mappedPickerError = pickerErrorToTemporalError(pickerError ?? null);
        const candidateError =
          mappedPickerError ??
          validateTemporalCandidate(mode, candidate, {
            min: minValue,
            max: maxValue,
            minuteStep: normalizedMinuteStep,
            precision,
            secondStep: normalizedSecondStep,
          });
        return candidateError
          ? temporalErrorMessage(candidateError, mode, {
              max,
              min,
              minuteStep: normalizedMinuteStep,
              precision,
              secondStep: normalizedSecondStep,
            })
          : null;
      },
      [max, maxValue, min, minValue, mode, normalizedMinuteStep, normalizedSecondStep, precision],
    );

    const canonicalError = React.useMemo(() => {
      if (fieldState.value === null) return null;
      const canonicalValue = parseTemporalValue(mode, fieldState.value);
      return canonicalValue
        ? validateCandidate(canonicalValue)
        : temporalErrorMessage("invalid", mode, {
            max,
            min,
            minuteStep: normalizedMinuteStep,
            precision,
            secondStep: normalizedSecondStep,
          });
    }, [fieldState.value, max, min, mode, normalizedMinuteStep, normalizedSecondStep, precision, validateCandidate]);
    const temporalError = draftError ?? canonicalError;

    React.useLayoutEffect(() => {
      setTemporalFormError(field.form as unknown as TemporalErrorFormApi, field.name, temporalError);
    }, [field, temporalError]);

    const commitValue = React.useCallback(
      (candidate: Dayjs | null, pickerError?: VireoFormTemporalFieldPickerError) => {
        if (candidate === null) {
          setDraftError(null);
          lastCommittedValueRef.current = null;
          field.handleChange(null);
          onValueChange?.(null);
          return true;
        }

        const nextError = validateCandidate(candidate, pickerError);
        setDraftError(nextError);
        if (nextError) return false;

        const canonicalValue = formatTemporalValue(mode, candidate);
        lastCommittedValueRef.current = canonicalValue;
        field.handleChange(canonicalValue);
        onValueChange?.(canonicalValue);
        return true;
      },
      [field, mode, onValueChange, validateCandidate],
    );

    React.useEffect(() => {
      if (
        synchronizedRef.current &&
        fieldState.value === lastCommittedValueRef.current &&
        mode === lastModeRef.current
      ) {
        return;
      }
      synchronizedRef.current = true;
      lastCommittedValueRef.current = fieldState.value;
      lastModeRef.current = mode;
      const nextValue = parseTemporalValue(mode, fieldState.value);
      setDraftValue(nextValue);
      setDraftError(null);
    }, [fieldState.value, mode]);

    React.useEffect(() => {
      const handleReset = (event: Event) => {
        if (rootElementRef.current?.closest("form") !== event.target) return;
        queueMicrotask(() => {
          const resetValue = field.form.getFieldValue(field.name) as VireoFormTemporalFieldValue;
          lastCommittedValueRef.current = resetValue;
          setDraftValue(parseTemporalValue(mode, resetValue));
          setDraftError(null);
        });
      };
      document.addEventListener("reset", handleReset, true);
      return () => document.removeEventListener("reset", handleReset, true);
    }, [field, mode]);

    React.useEffect(
      () => () => {
        setTemporalFormError(field.form as unknown as TemporalErrorFormApi, field.name, null);
      },
      [field],
    );

    const errorDisplay = errorDisplayProp ?? formContext.errorDisplay;
    const invalid = fieldState.invalid || temporalError !== null;
    const errorVisible =
      invalid &&
      shouldDisplayVireoFormError(errorDisplay, {
        submissionAttempts: formContext.submissionAttempts,
        touched: fieldState.touched,
      });
    const formattedFormError = errorVisible
      ? formatFirstVireoFormError(fieldState.errors, formatErrorProp ?? formContext.formatError)
      : undefined;
    const ownerState: VireoFormTemporalFieldOwnerState = {
      dirty: fieldState.dirty,
      disabled,
      errorVisible,
      hasValue: fieldState.value !== null,
      invalid,
      mode,
      readOnly,
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
    const resolvedInputSlotProps = resolveSlotProps(slotProps.input, ownerState);
    const { className: inputSlotClassName, ...inputSlotOther } = resolvedInputSlotProps;
    const resolvedHtmlInputSlotProps = resolveSlotProps(slotProps.htmlInput, ownerState);
    const {
      className: htmlInputSlotClassName,
      ref: htmlInputSlotRef,
      ...htmlInputSlotOther
    } = resolvedHtmlInputSlotProps;
    const resolvedFormHelperTextSlotProps = resolveSlotProps(slotProps.formHelperText, ownerState);
    const { className: formHelperTextSlotClassName, ...formHelperTextSlotOther } = resolvedFormHelperTextSlotProps;
    const resolvedOpenPickerButtonSlotProps = resolveSlotProps(slotProps.openPickerButton, ownerState);
    const { className: openPickerButtonSlotClassName, ...openPickerButtonSlotOther } =
      resolvedOpenPickerButtonSlotProps;
    const resolvedOpenPickerIconSlotProps = resolveSlotProps(slotProps.openPickerIcon, ownerState);
    const { className: openPickerIconSlotClassName, ...openPickerIconSlotOther } = resolvedOpenPickerIconSlotProps;
    const resolvedClearButtonSlotProps = resolveSlotProps(slotProps.clearButton, ownerState);
    const { className: clearButtonSlotClassName, ...clearButtonSlotOther } = resolvedClearButtonSlotProps;
    const resolvedClearIconSlotProps = resolveSlotProps(slotProps.clearIcon, ownerState);
    const { className: clearIconSlotClassName, ...clearIconSlotOther } = resolvedClearIconSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef, rootElementRef);
    const nativeInputRef = useForkRef(inputRef, htmlInputSlotRef);

    const { slotProps: advancedSlotProps = {}, slots: advancedSlots = {}, ...advancedPickerProps } = pickerProps;
    const advancedTextFieldSlotProps = advancedSlotProps.textField;
    const advancedFieldSlotProps = advancedSlotProps.field;
    const advancedCalendarHeaderSlotProps =
      "calendarHeader" in advancedSlotProps ? advancedSlotProps.calendarHeader : undefined;
    const advancedOpenPickerButtonSlotProps = advancedSlotProps.openPickerButton;
    const advancedOpenPickerIconSlotProps = advancedSlotProps.openPickerIcon;
    const advancedClearButtonSlotProps = advancedSlotProps.clearButton;
    const advancedClearIconSlotProps = advancedSlotProps.clearIcon;
    const effectiveError = error || errorVisible;
    const effectiveHelperText = errorVisible ? (temporalError ?? formattedFormError) : helperText;
    const inputComponent =
      slots.input ??
      (variant === "filled"
        ? VireoFormTemporalFieldFilledInput
        : variant === "standard"
          ? VireoFormTemporalFieldStandardInput
          : VireoFormTemporalFieldOutlinedInput);

    const handleChange = (nextValue: Dayjs | null, context: { validationError: VireoFormTemporalFieldPickerError }) => {
      setDraftValue(nextValue);
      if (nextValue === null) {
        commitValue(null);
        return;
      }
      const nextError = validateCandidate(nextValue, context.validationError);
      setDraftError(nextError);
      if (!pickerOpenRef.current && !nextError) commitValue(nextValue, context.validationError);
    };

    const handleAccept = (nextValue: Dayjs | null, context: { validationError: VireoFormTemporalFieldPickerError }) => {
      setDraftValue(nextValue);
      commitValue(nextValue, context.validationError);
    };

    const createPickerSlotProps = () => ({
      ...advancedSlotProps,
      ...(mode !== "time" && {
        calendarHeader: (pickerOwnerState: unknown) => ({
          ...(resolveExternalSlotProps(advancedCalendarHeaderSlotProps as never, pickerOwnerState) as
            object | undefined),
          ...(mode === "month" && { format: "MMMM" }),
        }),
      }),
      field: (pickerOwnerState: unknown) => ({
        ...(resolveExternalSlotProps(advancedFieldSlotProps as never, pickerOwnerState) as object | undefined),
        clearable,
      }),
      clearButton: (pickerOwnerState: unknown) => ({
        ...(resolveExternalSlotProps(advancedClearButtonSlotProps as never, pickerOwnerState) as object | undefined),
        ...clearButtonSlotOther,
        "aria-label": clearLabel,
        ownerState,
        className: joinClassNames(classes.clearButton, clearButtonSlotClassName),
      }),
      clearIcon: (pickerOwnerState: unknown) => ({
        ...(resolveExternalSlotProps(advancedClearIconSlotProps as never, pickerOwnerState) as object | undefined),
        ...clearIconSlotOther,
        ownerState,
        className: joinClassNames(classes.clearIcon, clearIconSlotClassName),
      }),
      openPickerButton: (pickerOwnerState: unknown) => ({
        ...(resolveExternalSlotProps(advancedOpenPickerButtonSlotProps as never, pickerOwnerState) as
          object | undefined),
        ...openPickerButtonSlotOther,
        ownerState,
        className: joinClassNames(classes.openPickerButton, openPickerButtonSlotClassName),
      }),
      openPickerIcon: (pickerOwnerState: unknown) => ({
        ...(resolveExternalSlotProps(advancedOpenPickerIconSlotProps as never, pickerOwnerState) as object | undefined),
        ...openPickerIconSlotOther,
        ownerState,
        className: joinClassNames(classes.openPickerIcon, openPickerIconSlotClassName),
      }),
      textField: (pickerOwnerState: unknown) => {
        const advancedTextField = resolveExternalSlotProps(advancedTextFieldSlotProps as never, pickerOwnerState) as
          TextFieldProps | undefined;
        const advancedTextFieldSlots = advancedTextField?.slots ?? {};
        const advancedTextFieldNestedSlotProps = advancedTextField?.slotProps ?? {};
        return {
          ...advancedTextField,
          error: effectiveError,
          fullWidth,
          helperText: effectiveHelperText,
          inputRef: nativeInputRef,
          name: field.name,
          onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            advancedTextField?.onBlur?.(event);
            if (event.defaultPrevented) return;
            onBlur?.(event);
            if (event.defaultPrevented) return;
            field.handleBlur();
          },
          required,
          variant,
          vireoTextFieldComponent: advancedSlots.textField,
          vireoSlots: {
            ...advancedTextFieldSlots,
            input: inputComponent,
            htmlInput: slots.htmlInput ?? advancedTextFieldSlots.htmlInput,
            formHelperText: slots.formHelperText ?? VireoFormTemporalFieldFormHelperText,
          },
          vireoSlotProps: {
            ...advancedTextFieldNestedSlotProps,
            input: {
              ...(advancedTextFieldNestedSlotProps.input as object),
              ...inputSlotOther,
              ownerState,
              className: joinClassNames(classes.input, inputSlotClassName),
            },
            htmlInput: {
              ...(advancedTextFieldNestedSlotProps.htmlInput as object),
              ...htmlInputSlotOther,
              "aria-invalid": effectiveError || undefined,
              className: joinClassNames(classes.htmlInput, htmlInputSlotClassName),
            },
            formHelperText: {
              ...(advancedTextFieldNestedSlotProps.formHelperText as object),
              ...formHelperTextSlotOther,
              ownerState,
              className: joinClassNames(classes.formHelperText, formHelperTextSlotClassName),
            },
          },
        };
      },
    });

    const commonPickerProps = {
      ...advancedPickerProps,
      clearable,
      disabled,
      onAccept: handleAccept,
      onChange: handleChange,
      onClose: () => {
        pickerOpenRef.current = false;
      },
      onOpen: () => {
        pickerOpenRef.current = true;
      },
      readOnly,
      referenceDate: referenceDate ?? undefined,
      slotProps: createPickerSlotProps(),
      slots: {
        ...advancedSlots,
        textField: TemporalPickerTextField,
        clearButton: slots.clearButton ?? VireoFormTemporalFieldClearButton,
        clearIcon: slots.clearIcon ?? VireoFormTemporalFieldClearIcon,
        openPickerButton: slots.openPickerButton ?? VireoFormTemporalFieldOpenPickerButton,
        openPickerIcon: slots.openPickerIcon ?? VireoFormTemporalFieldOpenPickerIcon,
      },
      timezone: "UTC",
      value: draftValue,
    };

    let picker: React.ReactNode;
    if (mode === "time") {
      picker = (
        <TimePicker
          {...(commonPickerProps as React.ComponentProps<typeof TimePicker>)}
          ampm={ampm}
          minTime={minValue ?? undefined}
          maxTime={maxValue ?? undefined}
          openTo={openTo ?? "hours"}
          timeSteps={{ minutes: normalizedMinuteStep, seconds: normalizedSecondStep }}
          views={precision === "second" ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
        />
      );
    } else if (mode === "date-time") {
      picker = (
        <DateTimePicker
          {...(commonPickerProps as React.ComponentProps<typeof DateTimePicker>)}
          ampm={ampm}
          minDateTime={minValue ?? undefined}
          maxDateTime={maxValue ?? undefined}
          openTo={openTo ?? "day"}
          timeSteps={{ minutes: normalizedMinuteStep, seconds: normalizedSecondStep }}
          views={
            precision === "second"
              ? ["year", "month", "day", "hours", "minutes", "seconds"]
              : ["year", "month", "day", "hours", "minutes"]
          }
        />
      );
    } else {
      const views =
        mode === "year"
          ? (["year"] as const)
          : mode === "month"
            ? (["month"] as const)
            : mode === "year-month"
              ? (["year", "month"] as const)
              : (["year", "month", "day"] as const);
      picker = (
        <DatePicker
          {...(commonPickerProps as React.ComponentProps<typeof DatePicker>)}
          minDate={minValue ?? undefined}
          maxDate={maxValue ?? undefined}
          openTo={openTo ?? (mode === "year" ? "year" : mode === "month" || mode === "year-month" ? "month" : "day")}
          views={views}
        />
      );
    }

    return (
      <VireoFormTemporalFieldRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {picker}
      </VireoFormTemporalFieldRoot>
    );
  },
);

VireoFormTemporalField.displayName = VIREO_FORM_TEMPORAL_FIELD_NAME;
