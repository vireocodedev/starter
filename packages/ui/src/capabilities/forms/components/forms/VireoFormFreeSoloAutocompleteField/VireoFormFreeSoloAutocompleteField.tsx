import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { VireoFormReadOnlyValue } from "@/capabilities/forms/components/data-display/VireoFormReadOnlyValue/VireoFormReadOnlyValue";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { Autocomplete, createFilterOptions, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import {
  type VireoFormFreeSoloAutocompleteFieldClassKey,
  getVireoFormFreeSoloAutocompleteFieldUtilityClass,
} from "./VireoFormFreeSoloAutocompleteField.classes";
import {
  VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME,
  type VireoFormFreeSoloAutocompleteFieldSlotName,
} from "./VireoFormFreeSoloAutocompleteField.identity";
import {
  VireoFormFreeSoloAutocompleteFieldClearButton,
  VireoFormFreeSoloAutocompleteFieldClearIcon,
  VireoFormFreeSoloAutocompleteFieldFilledInput,
  VireoFormFreeSoloAutocompleteFieldFormHelperText,
  VireoFormFreeSoloAutocompleteFieldGroup,
  VireoFormFreeSoloAutocompleteFieldGroupLabel,
  VireoFormFreeSoloAutocompleteFieldGroupList,
  VireoFormFreeSoloAutocompleteFieldInputLabel,
  VireoFormFreeSoloAutocompleteFieldListbox,
  VireoFormFreeSoloAutocompleteFieldLoadingIndicator,
  VireoFormFreeSoloAutocompleteFieldLoadingText,
  VireoFormFreeSoloAutocompleteFieldNoOptionsText,
  VireoFormFreeSoloAutocompleteFieldOption,
  VireoFormFreeSoloAutocompleteFieldOutlinedInput,
  VireoFormFreeSoloAutocompleteFieldPaper,
  VireoFormFreeSoloAutocompleteFieldPopper,
  VireoFormFreeSoloAutocompleteFieldPopupButton,
  VireoFormFreeSoloAutocompleteFieldPopupIcon,
  VireoFormFreeSoloAutocompleteFieldRoot,
  VireoFormFreeSoloAutocompleteFieldStandardInput,
  VireoFormFreeSoloAutocompleteFieldTextField,
} from "./VireoFormFreeSoloAutocompleteField.styled";
import type {
  VireoFormFreeSoloAutocompleteFieldInputChangeReason,
  VireoFormFreeSoloAutocompleteFieldOwnerState,
  VireoFormFreeSoloAutocompleteFieldProps,
  VireoFormFreeSoloAutocompleteFieldSelection,
} from "./VireoFormFreeSoloAutocompleteField.types";

function useUtilityClasses(
  ownerState: VireoFormFreeSoloAutocompleteFieldOwnerState,
  classes?: VireoFormFreeSoloAutocompleteFieldProps["classes"],
) {
  return composeClasses(
    {
      root: [
        "root",
        ownerState.disabled && "disabled",
        ownerState.readOnly && "readOnly",
        ownerState.required && "required",
        ownerState.error && "error",
        ownerState.focused && "focused",
        ownerState.dirty && "dirty",
        ownerState.touched && "touched",
        ownerState.submitting && "submitting",
        ownerState.validating && "validating",
        ownerState.open && "open",
        ownerState.loading && "loading",
        ownerState.hasValue && "hasValue",
        ownerState.hasInputValue && "hasInputValue",
      ],
      textField: ["textField"],
      inputLabel: ["inputLabel"],
      input: ["input"],
      htmlInput: ["htmlInput"],
      loadingIndicator: ["loadingIndicator"],
      clearButton: ["clearButton"],
      clearIcon: ["clearIcon"],
      popupButton: ["popupButton"],
      popupIcon: ["popupIcon"],
      formHelperText: ["formHelperText"],
      popper: ["popper"],
      paper: ["paper"],
      loadingText: ["loadingText"],
      noOptionsText: ["noOptionsText"],
      listbox: ["listbox"],
      option: ["option"],
      group: ["group"],
      groupLabel: ["groupLabel"],
      groupList: ["groupList"],
    } as const satisfies UtilityClassSlotMap<
      VireoFormFreeSoloAutocompleteFieldSlotName,
      VireoFormFreeSoloAutocompleteFieldClassKey
    >,
    getVireoFormFreeSoloAutocompleteFieldUtilityClass,
    classes,
  );
}

function isValidValue(value: string): boolean {
  return value.length > 0;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

function VireoFormFreeSoloAutocompleteFieldImpl<TOption>(
  inProps: VireoFormFreeSoloAutocompleteFieldProps<TOption>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({
    props: inProps,
    name: VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME,
  }) as VireoFormFreeSoloAutocompleteFieldProps<TOption>;
  const {
    className,
    classes: classesProp,
    clearIcon,
    clearLabel = "Clear selection",
    closeLabel = "Close options",
    commitOnBlur = true,
    createOptionLabel = value => `Add “${value}”`,
    defaultInputValue = "",
    defaultOpen = false,
    disabled = false,
    disableClearable = false,
    error = false,
    errorDisplay: errorDisplayProp,
    filterMode = "client",
    filterOptions: filterOptionsProp,
    formatError: formatErrorProp,
    fullWidth = true,
    getOptionDisabled,
    getOptionLabel,
    getOptionValue,
    groupBy,
    helperText = " ",
    inputRef,
    inputValue: inputValueProp,
    label,
    isValueEqual = (left, right) => left === right,
    loading = false,
    loadingText = "Loading…",
    noOptionsText = "No options",
    onBlur,
    onClose,
    onInputValueChange,
    onOpen,
    onValueChange,
    open: openProp,
    openLabel = "Open options",
    options,
    placeholder,
    popupIcon,
    readOnly = false,
    readOnlyEmptyValue,
    renderGroupLabel,
    renderOption,
    renderReadOnlyValue,
    required = false,
    normalizeValue = value => value.trim(),
    slotProps = {},
    slots = {},
    style,
    sx,
    variant = "outlined",
    size,
    color,
    margin,
    ...other
  } = props;
  const field = useVireoFieldContext<string | null>();
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
  const [internalInputValue, setInternalInputValue] = React.useState(defaultInputValue);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [focused, setFocused] = React.useState(false);
  const effectiveInputValue = inputValueProp ?? internalInputValue;
  const effectiveOpen = openProp ?? internalOpen;

  const normalizedOptions = React.useMemo(() => {
    const result: VireoFormFreeSoloAutocompleteFieldSelection<TOption>[] = [];
    for (const option of options) {
      const value = normalizeValue(getOptionValue(option));
      if (!isValidValue(value) || result.some(item => isValueEqual(item.value, value))) {
        if (process.env.NODE_ENV !== "production")
          console.warn(
            `${VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME}: normalized option values must be unique non-empty strings.`,
            value,
          );
        continue;
      }
      result.push({ value, label: getOptionLabel(option), custom: false, option });
    }
    return result;
  }, [getOptionLabel, getOptionValue, isValueEqual, normalizeValue, options]);

  const selected = React.useMemo((): VireoFormFreeSoloAutocompleteFieldSelection<TOption> | null => {
    if (fieldState.value === null) return null;
    const current = normalizedOptions.find(item => isValueEqual(item.value, fieldState.value as string));
    if (current) return current;
    return {
      value: fieldState.value,
      label: fieldState.value,
      custom: true,
      option: null,
    };
  }, [fieldState.value, isValueEqual, normalizedOptions]);

  const errorDisplay = errorDisplayProp ?? formContext.errorDisplay;
  const errorVisible =
    fieldState.invalid &&
    shouldDisplayVireoFormError(errorDisplay, {
      submissionAttempts: formContext.submissionAttempts,
      touched: fieldState.touched,
    });
  const effectiveError = error || errorVisible;
  const effectiveHelperText = errorVisible
    ? formatFirstVireoFormError(fieldState.errors, formatErrorProp ?? formContext.formatError)
    : helperText;
  const ownerState: VireoFormFreeSoloAutocompleteFieldOwnerState = {
    dirty: fieldState.dirty,
    disabled,
    error: effectiveError,
    focused,
    hasInputValue: effectiveInputValue.length > 0,
    hasValue: selected !== null,
    loading,
    open: effectiveOpen,
    readOnly: effectiveReadOnly,
    required,
    submitting,
    touched: fieldState.touched,
    validating: fieldState.validating,
  };
  const classes = useUtilityClasses(ownerState, classesProp);
  const resolved = Object.fromEntries(
    Object.entries(slotProps).map(([key, value]) => [key, resolveSlotProps(value as never, ownerState)]),
  ) as Record<string, Record<string, unknown>>;
  const rootSlotProps = resolved.root ?? {};
  const { className: rootClassName, ref: rootSlotRef, style: rootStyle, sx: rootSx, ...rootOther } = rootSlotProps;
  const rootRef = useForkRef(forwardedRef, rootSlotRef as React.Ref<HTMLDivElement>);
  const htmlInputSlotProps = resolved.htmlInput ?? {};
  const combinedInputRef = useForkRef(inputRef, htmlInputSlotProps.ref as React.Ref<HTMLInputElement>);

  const defaultFilter = React.useMemo(
    () => createFilterOptions<VireoFormFreeSoloAutocompleteFieldSelection<TOption>>(),
    [],
  );
  if (effectiveReadOnly) {
    const empty = selected === null || selected.value.trim().length === 0;
    return (
      <VireoFormReadOnlyValue
        {...rootOther}
        ref={rootRef}
        aria-label={htmlInputSlotProps["aria-label"] as string | undefined}
        className={joinClassNames(classes.root, className, rootClassName as string)}
        empty={empty}
        emptyValue={readOnlyEmptyValue ?? formContext.readOnlyEmptyValue}
        label={label}
        style={{ ...style, ...(rootStyle as React.CSSProperties) }}
        sx={mergeSx(sx, rootSx as never)}
      >
        {selected === null ? null : (renderReadOnlyValue?.(selected.value, selected) ?? selected.label)}
      </VireoFormReadOnlyValue>
    );
  }
  const filterOptions = (
    items: VireoFormFreeSoloAutocompleteFieldSelection<TOption>[],
    state: { inputValue: string },
  ) => {
    const filtered =
      filterMode === "server"
        ? items
        : !filterOptionsProp
          ? defaultFilter(items, { ...state, getOptionLabel: item => item.label })
          : (() => {
              const allowed = filterOptionsProp(
                items.map(item => item.option as TOption),
                state,
              );
              return items.filter(item => allowed.includes(item.option as TOption));
            })();
    const customValue = normalizeValue(state.inputValue);
    if (isValidValue(customValue) && !items.some(item => isValueEqual(item.value, customValue)))
      return [...filtered, { value: customValue, label: customValue, custom: true, option: null }];
    return filtered;
  };

  const handleInputChange = (
    _event: React.SyntheticEvent,
    value: string,
    reason: VireoFormFreeSoloAutocompleteFieldInputChangeReason,
  ) => {
    if (inputValueProp === undefined) setInternalInputValue(value);
    onInputValueChange?.(value, reason);
  };
  const handleChange = (
    _event: React.SyntheticEvent,
    next: VireoFormFreeSoloAutocompleteFieldSelection<TOption> | string | null,
    reason: string,
  ) => {
    if (effectiveReadOnly || disabled) return;
    const previousValue = fieldState.value;
    if (reason === "clear" || next === null) {
      field.handleChange(null);
      onValueChange?.(null, { reason: "clear", previousValue });
      return;
    }
    const selection = typeof next === "string" ? { value: normalizeValue(next), custom: true, option: null } : next;
    if (!isValidValue(selection.value)) return;
    field.handleChange(selection.value);
    if (inputValueProp === undefined) setInternalInputValue(selection.value);
    if (selection.option)
      onValueChange?.(selection.value, {
        reason: "selectOption",
        option: selection.option,
        value: selection.value,
      });
    else onValueChange?.(selection.value, { reason: "createOption", value: selection.value });
  };
  const handleOpen = () => {
    if (openProp === undefined) setInternalOpen(true);
    onOpen?.();
  };
  const handleClose: NonNullable<typeof onClose> = (event, reason) => {
    if (openProp === undefined) setInternalOpen(false);
    onClose?.(event, reason);
  };

  const LoadingText = slots.loadingText ?? VireoFormFreeSoloAutocompleteFieldLoadingText;
  const NoOptionsText = slots.noOptionsText ?? VireoFormFreeSoloAutocompleteFieldNoOptionsText;
  const ClearIcon = slots.clearIcon ?? VireoFormFreeSoloAutocompleteFieldClearIcon;
  const PopupIcon = slots.popupIcon ?? VireoFormFreeSoloAutocompleteFieldPopupIcon;
  const LoadingIndicator = slots.loadingIndicator ?? VireoFormFreeSoloAutocompleteFieldLoadingIndicator;

  return (
    <VireoFormFreeSoloAutocompleteFieldRoot
      {...rootOther}
      as={slots.root ?? "div"}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootClassName as string)}
      style={{ ...style, ...(rootStyle as React.CSSProperties) }}
      sx={mergeSx(sx, rootSx as never)}
    >
      <Autocomplete<VireoFormFreeSoloAutocompleteFieldSelection<TOption>, false, false, true>
        {...other}
        freeSolo
        value={selected}
        options={normalizedOptions}
        getOptionLabel={item => (typeof item === "string" ? item : item.label)}
        getOptionKey={item => (typeof item === "string" ? item : item.value)}
        isOptionEqualToValue={(option, value) => typeof value !== "string" && isValueEqual(option.value, value.value)}
        getOptionDisabled={item => Boolean(item.option && getOptionDisabled?.(item.option))}
        filterOptions={filterOptions}
        groupBy={groupBy ? item => (item.option ? groupBy(item.option) : "") : undefined}
        disabled={disabled}
        readOnly={readOnly}
        disableClearable={disableClearable as false}
        loading={loading}
        fullWidth={fullWidth}
        open={effectiveOpen}
        onOpen={handleOpen}
        onClose={handleClose}
        inputValue={effectiveInputValue}
        onInputChange={handleInputChange}
        onChange={handleChange}
        clearText={clearLabel}
        openText={openLabel}
        closeText={closeLabel}
        clearIcon={
          clearIcon ?? (
            <ClearIcon
              {...resolved.clearIcon}
              className={joinClassNames(classes.clearIcon, resolved.clearIcon?.className as string)}
              ownerState={ownerState}
            />
          )
        }
        popupIcon={
          popupIcon ?? (
            <PopupIcon
              {...resolved.popupIcon}
              className={joinClassNames(classes.popupIcon, resolved.popupIcon?.className as string)}
              ownerState={ownerState}
            />
          )
        }
        loadingText={
          <LoadingText
            {...resolved.loadingText}
            className={joinClassNames(classes.loadingText, resolved.loadingText?.className as string)}
            ownerState={ownerState}
          >
            {loadingText}
          </LoadingText>
        }
        noOptionsText={
          <NoOptionsText
            {...resolved.noOptionsText}
            className={joinClassNames(classes.noOptionsText, resolved.noOptionsText?.className as string)}
            ownerState={ownerState}
          >
            {noOptionsText}
          </NoOptionsText>
        }
        slots={
          {
            popper: slots.popper ?? VireoFormFreeSoloAutocompleteFieldPopper,
            paper: slots.paper ?? VireoFormFreeSoloAutocompleteFieldPaper,
            listbox: slots.listbox ?? VireoFormFreeSoloAutocompleteFieldListbox,
            clearIndicator: slots.clearButton ?? VireoFormFreeSoloAutocompleteFieldClearButton,
            popupIndicator: slots.popupButton ?? VireoFormFreeSoloAutocompleteFieldPopupButton,
          } as never
        }
        slotProps={{
          popper: {
            ...resolved.popper,
            className: joinClassNames(classes.popper, resolved.popper?.className as string),
            ownerState,
          } as never,
          paper: {
            ...resolved.paper,
            className: joinClassNames(classes.paper, resolved.paper?.className as string),
            ownerState,
          } as never,
          listbox: {
            ...resolved.listbox,
            className: joinClassNames(classes.listbox, resolved.listbox?.className as string),
            ownerState,
          } as never,
          clearIndicator: {
            ...resolved.clearButton,
            className: joinClassNames(classes.clearButton, resolved.clearButton?.className as string),
          },
          popupIndicator: {
            ...resolved.popupButton,
            className: joinClassNames(classes.popupButton, resolved.popupButton?.className as string),
          },
        }}
        renderOption={(optionProps, item, state) => {
          const Option = slots.option ?? VireoFormFreeSoloAutocompleteFieldOption;
          const content = item.custom
            ? createOptionLabel(item.value)
            : item.option && renderOption
              ? renderOption(item.option, {
                  inputValue: state.inputValue,
                  selected: state.selected,
                  disabled: item.option ? Boolean(getOptionDisabled?.(item.option)) : true,
                  index: state.index,
                })
              : item.label;
          return (
            <Option
              {...resolved.option}
              {...optionProps}
              key={item.value}
              className={joinClassNames(classes.option, resolved.option?.className as string, optionProps.className)}
              ownerState={ownerState}
            >
              {content}
            </Option>
          );
        }}
        renderGroup={params => {
          const Group = slots.group ?? VireoFormFreeSoloAutocompleteFieldGroup;
          const GroupLabel = slots.groupLabel ?? VireoFormFreeSoloAutocompleteFieldGroupLabel;
          const GroupList = slots.groupList ?? VireoFormFreeSoloAutocompleteFieldGroupList;
          return (
            <Group
              {...resolved.group}
              key={params.key}
              className={joinClassNames(classes.group, resolved.group?.className as string)}
              ownerState={ownerState}
            >
              <GroupLabel
                {...resolved.groupLabel}
                className={joinClassNames(classes.groupLabel, resolved.groupLabel?.className as string)}
                ownerState={ownerState}
              >
                {renderGroupLabel?.(params.group) ?? params.group}
              </GroupLabel>
              <GroupList
                {...resolved.groupList}
                className={joinClassNames(classes.groupList, resolved.groupList?.className as string)}
                ownerState={ownerState}
              >
                {params.children}
              </GroupList>
            </Group>
          );
        }}
        renderInput={params => {
          const TextField = slots.textField ?? VireoFormFreeSoloAutocompleteFieldTextField;
          const {
            ["aria-label"]: loadingIndicatorAriaLabel,
            ["aria-labelledby"]: loadingIndicatorAriaLabelledBy,
            ...loadingIndicatorOther
          } = resolved.loadingIndicator ?? {};
          const loadingIndicatorAriaProps =
            typeof loadingIndicatorAriaLabelledBy === "string" && loadingIndicatorAriaLabelledBy.trim()
              ? { "aria-labelledby": loadingIndicatorAriaLabelledBy }
              : typeof loadingIndicatorAriaLabel === "string" && loadingIndicatorAriaLabel.trim()
                ? { "aria-label": loadingIndicatorAriaLabel }
                : { "aria-label": "Loading options" };
          const loadingAdornment = loading ? (
            <LoadingIndicator
              {...loadingIndicatorOther}
              {...loadingIndicatorAriaProps}
              size={18}
              className={joinClassNames(classes.loadingIndicator, resolved.loadingIndicator?.className as string)}
              ownerState={ownerState}
            />
          ) : null;
          const autocompleteInputRef = params.slotProps.htmlInput.ref as React.Ref<HTMLInputElement> | undefined;
          return (
            <TextField
              {...params}
              {...resolved.textField}
              label={label}
              required={required}
              error={effectiveError}
              helperText={effectiveHelperText}
              fullWidth={fullWidth}
              placeholder={placeholder}
              variant={variant}
              size={size}
              color={color}
              margin={margin}
              className={joinClassNames(classes.textField, resolved.textField?.className as string)}
              slots={{
                inputLabel: slots.inputLabel ?? VireoFormFreeSoloAutocompleteFieldInputLabel,
                input:
                  slots.input ??
                  (variant === "filled"
                    ? VireoFormFreeSoloAutocompleteFieldFilledInput
                    : variant === "standard"
                      ? VireoFormFreeSoloAutocompleteFieldStandardInput
                      : VireoFormFreeSoloAutocompleteFieldOutlinedInput),
                // Keep MUI's internal InputBaseInput unless the consumer replaces this slot.
                // It owns the native-input reset required by every TextField variant.
                htmlInput: slots.htmlInput,
                formHelperText: slots.formHelperText ?? VireoFormFreeSoloAutocompleteFieldFormHelperText,
              }}
              onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
                setFocused(true);
                (resolved.textField?.onFocus as React.FocusEventHandler<HTMLInputElement> | undefined)?.(event);
              }}
              onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                (resolved.textField?.onBlur as React.FocusEventHandler<HTMLInputElement> | undefined)?.(event);
                if (event.defaultPrevented) return;
                onBlur?.(event);
                if (event.defaultPrevented) return;
                const nextValue = normalizeValue(effectiveInputValue);
                if (
                  commitOnBlur &&
                  !disabled &&
                  !readOnly &&
                  isValidValue(nextValue) &&
                  !(selected && effectiveInputValue === selected.label) &&
                  !isValueEqual(nextValue, fieldState.value ?? "")
                ) {
                  field.handleChange(nextValue);
                  onValueChange?.(nextValue, { reason: "createOption", value: nextValue });
                }
                setFocused(false);
                field.handleBlur();
              }}
              slotProps={{
                inputLabel: {
                  ...params.slotProps.inputLabel,
                  ...resolved.inputLabel,
                  className: joinClassNames(classes.inputLabel, resolved.inputLabel?.className as string),
                },
                input: {
                  ...params.slotProps.input,
                  ...resolved.input,
                  className: joinClassNames(
                    classes.input,
                    params.slotProps.input.className,
                    resolved.input?.className as string,
                  ),
                  endAdornment: (
                    <>
                      {loadingAdornment}
                      {params.slotProps.input.endAdornment}
                    </>
                  ),
                },
                htmlInput: {
                  ...params.slotProps.htmlInput,
                  ...htmlInputSlotProps,
                  name: field.name,
                  ref: (node: HTMLInputElement | null) => {
                    assignRef(autocompleteInputRef, node);
                    assignRef(combinedInputRef, node);
                  },
                  className: joinClassNames(
                    classes.htmlInput,
                    params.slotProps.htmlInput.className,
                    htmlInputSlotProps.className as string,
                  ),
                  "aria-invalid": effectiveError || undefined,
                },
                formHelperText: {
                  ...resolved.formHelperText,
                  className: joinClassNames(classes.formHelperText, resolved.formHelperText?.className as string),
                },
              }}
            />
          );
        }}
      />
    </VireoFormFreeSoloAutocompleteFieldRoot>
  );
}

type Component = <TOption>(
  props: VireoFormFreeSoloAutocompleteFieldProps<TOption> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
export const VireoFormFreeSoloAutocompleteField = React.forwardRef(VireoFormFreeSoloAutocompleteFieldImpl) as Component;
(VireoFormFreeSoloAutocompleteField as React.NamedExoticComponent).displayName =
  VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_FIELD_NAME;
