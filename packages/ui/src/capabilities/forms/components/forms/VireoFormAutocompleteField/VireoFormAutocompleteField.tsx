import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { useVireoFieldContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { formatFirstVireoFormError, shouldDisplayVireoFormError } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { Autocomplete, createFilterOptions, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import {
  type VireoFormAutocompleteFieldClassKey,
  getVireoFormAutocompleteFieldUtilityClass,
} from "./VireoFormAutocompleteField.classes";
import {
  VIREO_FORM_AUTOCOMPLETE_FIELD_NAME,
  type VireoFormAutocompleteFieldSlotName,
} from "./VireoFormAutocompleteField.identity";
import {
  VireoFormAutocompleteFieldClearButton,
  VireoFormAutocompleteFieldClearIcon,
  VireoFormAutocompleteFieldFilledInput,
  VireoFormAutocompleteFieldFormHelperText,
  VireoFormAutocompleteFieldGroup,
  VireoFormAutocompleteFieldGroupLabel,
  VireoFormAutocompleteFieldGroupList,
  VireoFormAutocompleteFieldInputLabel,
  VireoFormAutocompleteFieldListbox,
  VireoFormAutocompleteFieldLoadingIndicator,
  VireoFormAutocompleteFieldLoadingText,
  VireoFormAutocompleteFieldNoOptionsText,
  VireoFormAutocompleteFieldOption,
  VireoFormAutocompleteFieldOutlinedInput,
  VireoFormAutocompleteFieldPaper,
  VireoFormAutocompleteFieldPopper,
  VireoFormAutocompleteFieldPopupButton,
  VireoFormAutocompleteFieldPopupIcon,
  VireoFormAutocompleteFieldRoot,
  VireoFormAutocompleteFieldStandardInput,
  VireoFormAutocompleteFieldTextField,
} from "./VireoFormAutocompleteField.styled";
import type {
  VireoFormAutocompleteFieldInputChangeReason,
  VireoFormAutocompleteFieldOwnerState,
  VireoFormAutocompleteFieldProps,
  VireoFormAutocompleteFieldSelection,
  VireoFormAutocompleteFieldValue,
} from "./VireoFormAutocompleteField.types";

function useUtilityClasses(
  ownerState: VireoFormAutocompleteFieldOwnerState,
  classes?: VireoFormAutocompleteFieldProps["classes"],
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
        ownerState.hasUnresolvedValue && "hasUnresolvedValue",
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
    } as const satisfies UtilityClassSlotMap<VireoFormAutocompleteFieldSlotName, VireoFormAutocompleteFieldClassKey>,
    getVireoFormAutocompleteFieldUtilityClass,
    classes,
  );
}

function isValidValue(value: VireoFormAutocompleteFieldValue): boolean {
  return typeof value === "string" ? value.length > 0 : Number.isFinite(value);
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

function VireoFormAutocompleteFieldImpl<TOption, TValue extends VireoFormAutocompleteFieldValue>(
  inProps: VireoFormAutocompleteFieldProps<TOption, TValue>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({
    props: inProps,
    name: VIREO_FORM_AUTOCOMPLETE_FIELD_NAME,
  }) as VireoFormAutocompleteFieldProps<TOption, TValue>;
  const {
    className,
    classes: classesProp,
    clearIcon,
    clearLabel = "Clear selection",
    closeLabel = "Close options",
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
    getUnresolvedValueLabel,
    groupBy,
    helperText,
    inputRef,
    inputValue: inputValueProp,
    label,
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
    renderGroupLabel,
    renderOption,
    required = false,
    selectedOption,
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
  const field = useVireoFieldContext<TValue | null>();
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
  const [internalInputValue, setInternalInputValue] = React.useState(defaultInputValue);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [focused, setFocused] = React.useState(false);
  const effectiveInputValue = inputValueProp ?? internalInputValue;
  const effectiveOpen = openProp ?? internalOpen;

  const normalizedOptions = React.useMemo(() => {
    const seen = new Set<TValue>();
    const result: VireoFormAutocompleteFieldSelection<TOption, TValue>[] = [];
    for (const option of options) {
      const value = getOptionValue(option);
      if (!isValidValue(value) || seen.has(value)) {
        if (process.env.NODE_ENV !== "production")
          console.warn(
            `${VIREO_FORM_AUTOCOMPLETE_FIELD_NAME}: option values must be unique non-empty strings or finite numbers.`,
            value,
          );
        continue;
      }
      seen.add(value);
      result.push({ value, label: getOptionLabel(option), resolved: true, option });
    }
    return result;
  }, [getOptionLabel, getOptionValue, options]);

  const selected = React.useMemo((): VireoFormAutocompleteFieldSelection<TOption, TValue> | null => {
    if (fieldState.value === null) return null;
    const current = normalizedOptions.find(item => item.value === fieldState.value);
    if (current) return current;
    if (selectedOption && getOptionValue(selectedOption) === fieldState.value) {
      return { value: fieldState.value, label: getOptionLabel(selectedOption), resolved: true, option: selectedOption };
    }
    return {
      value: fieldState.value,
      label: getUnresolvedValueLabel?.(fieldState.value) ?? String(fieldState.value),
      resolved: false,
      option: null,
    };
  }, [fieldState.value, getOptionLabel, getOptionValue, getUnresolvedValueLabel, normalizedOptions, selectedOption]);

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
  const ownerState: VireoFormAutocompleteFieldOwnerState = {
    dirty: fieldState.dirty,
    disabled,
    error: effectiveError,
    focused,
    hasInputValue: effectiveInputValue.length > 0,
    hasUnresolvedValue: selected?.resolved === false,
    hasValue: selected !== null,
    loading,
    open: effectiveOpen,
    readOnly,
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
    () => createFilterOptions<VireoFormAutocompleteFieldSelection<TOption, TValue>>(),
    [],
  );
  const filterOptions = (
    items: VireoFormAutocompleteFieldSelection<TOption, TValue>[],
    state: { inputValue: string },
  ) => {
    if (filterMode === "server") return items;
    if (!filterOptionsProp) return defaultFilter(items, { ...state, getOptionLabel: item => item.label });
    const filtered = filterOptionsProp(
      items.map(item => item.option as TOption),
      state,
    );
    const allowed = new Set(filtered.map(getOptionValue));
    return items.filter(item => allowed.has(item.value));
  };

  const handleInputChange = (
    _event: React.SyntheticEvent,
    value: string,
    reason: VireoFormAutocompleteFieldInputChangeReason,
  ) => {
    if (inputValueProp === undefined) setInternalInputValue(value);
    onInputValueChange?.(value, reason);
  };
  const handleChange = (
    _event: React.SyntheticEvent,
    next: VireoFormAutocompleteFieldSelection<TOption, TValue> | null,
    reason: string,
  ) => {
    if (readOnly || disabled) return;
    const previousValue = fieldState.value;
    if (reason === "clear" || next === null) {
      field.handleChange(null);
      onValueChange?.(null, { reason: "clear", previousValue });
      return;
    }
    if (next.option) {
      field.handleChange(next.value);
      onValueChange?.(next.value, { reason: "selectOption", option: next.option, value: next.value });
    }
  };
  const handleOpen = () => {
    if (openProp === undefined) setInternalOpen(true);
    onOpen?.();
  };
  const handleClose: NonNullable<typeof onClose> = (event, reason) => {
    if (openProp === undefined) setInternalOpen(false);
    onClose?.(event, reason);
  };

  const LoadingText = slots.loadingText ?? VireoFormAutocompleteFieldLoadingText;
  const NoOptionsText = slots.noOptionsText ?? VireoFormAutocompleteFieldNoOptionsText;
  const ClearIcon = slots.clearIcon ?? VireoFormAutocompleteFieldClearIcon;
  const PopupIcon = slots.popupIcon ?? VireoFormAutocompleteFieldPopupIcon;
  const LoadingIndicator = slots.loadingIndicator ?? VireoFormAutocompleteFieldLoadingIndicator;

  return (
    <VireoFormAutocompleteFieldRoot
      {...rootOther}
      as={slots.root ?? "div"}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootClassName as string)}
      style={{ ...style, ...(rootStyle as React.CSSProperties) }}
      sx={mergeSx(sx, rootSx as never)}
    >
      <Autocomplete<VireoFormAutocompleteFieldSelection<TOption, TValue>, false, false, false>
        {...other}
        value={selected}
        options={normalizedOptions}
        getOptionLabel={item => item.label}
        getOptionKey={item => item.value}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        getOptionDisabled={item => (item.option ? Boolean(getOptionDisabled?.(item.option)) : true)}
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
            popper: slots.popper ?? VireoFormAutocompleteFieldPopper,
            paper: slots.paper ?? VireoFormAutocompleteFieldPaper,
            listbox: slots.listbox ?? VireoFormAutocompleteFieldListbox,
            clearIndicator: slots.clearButton ?? VireoFormAutocompleteFieldClearButton,
            popupIndicator: slots.popupButton ?? VireoFormAutocompleteFieldPopupButton,
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
          const Option = slots.option ?? VireoFormAutocompleteFieldOption;
          const content =
            item.option && renderOption
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
          const Group = slots.group ?? VireoFormAutocompleteFieldGroup;
          const GroupLabel = slots.groupLabel ?? VireoFormAutocompleteFieldGroupLabel;
          const GroupList = slots.groupList ?? VireoFormAutocompleteFieldGroupList;
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
          const TextField = slots.textField ?? VireoFormAutocompleteFieldTextField;
          const loadingAdornment = loading ? (
            <LoadingIndicator
              {...resolved.loadingIndicator}
              size={18}
              className={joinClassNames(classes.loadingIndicator, resolved.loadingIndicator?.className as string)}
              ownerState={ownerState}
            />
          ) : null;
          const autocompleteInputRef = params.inputProps.ref as React.Ref<HTMLInputElement> | undefined;
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
                inputLabel: slots.inputLabel ?? VireoFormAutocompleteFieldInputLabel,
                input:
                  slots.input ??
                  (variant === "filled"
                    ? VireoFormAutocompleteFieldFilledInput
                    : variant === "standard"
                      ? VireoFormAutocompleteFieldStandardInput
                      : VireoFormAutocompleteFieldOutlinedInput),
                // Keep MUI's internal InputBaseInput unless the consumer replaces this slot.
                // It owns the native-input reset required by every TextField variant.
                htmlInput: slots.htmlInput,
                formHelperText: slots.formHelperText ?? VireoFormAutocompleteFieldFormHelperText,
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
                setFocused(false);
                field.handleBlur();
              }}
              InputLabelProps={{
                ...params.InputLabelProps,
                ...resolved.inputLabel,
                className: joinClassNames(classes.inputLabel, resolved.inputLabel?.className as string),
              }}
              InputProps={{
                ...params.InputProps,
                ...resolved.input,
                className: joinClassNames(
                  classes.input,
                  params.InputProps.className,
                  resolved.input?.className as string,
                ),
                endAdornment: (
                  <>
                    {loadingAdornment}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              inputProps={{
                ...params.inputProps,
                ...htmlInputSlotProps,
                name: field.name,
                ref: (node: HTMLInputElement | null) => {
                  assignRef(autocompleteInputRef, node);
                  assignRef(combinedInputRef, node);
                },
                className: joinClassNames(
                  classes.htmlInput,
                  params.inputProps.className,
                  htmlInputSlotProps.className as string,
                ),
                "aria-invalid": effectiveError || undefined,
              }}
              FormHelperTextProps={{
                ...resolved.formHelperText,
                className: joinClassNames(classes.formHelperText, resolved.formHelperText?.className as string),
              }}
            />
          );
        }}
      />
    </VireoFormAutocompleteFieldRoot>
  );
}

type Component = <TOption, TValue extends VireoFormAutocompleteFieldValue>(
  props: VireoFormAutocompleteFieldProps<TOption, TValue> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
export const VireoFormAutocompleteField = React.forwardRef(VireoFormAutocompleteFieldImpl) as Component;
(VireoFormAutocompleteField as React.NamedExoticComponent).displayName = VIREO_FORM_AUTOCOMPLETE_FIELD_NAME;
