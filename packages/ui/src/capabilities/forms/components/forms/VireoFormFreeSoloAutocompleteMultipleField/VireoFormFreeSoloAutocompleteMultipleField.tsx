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
  type VireoFormFreeSoloAutocompleteMultipleFieldClassKey,
  getVireoFormFreeSoloAutocompleteMultipleFieldUtilityClass,
} from "./VireoFormFreeSoloAutocompleteMultipleField.classes";
import {
  VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME,
  type VireoFormFreeSoloAutocompleteMultipleFieldSlotName,
} from "./VireoFormFreeSoloAutocompleteMultipleField.identity";
import {
  VireoFormFreeSoloAutocompleteMultipleFieldClearButton,
  VireoFormFreeSoloAutocompleteMultipleFieldClearIcon,
  VireoFormFreeSoloAutocompleteMultipleFieldFilledInput,
  VireoFormFreeSoloAutocompleteMultipleFieldFormHelperText,
  VireoFormFreeSoloAutocompleteMultipleFieldGroup,
  VireoFormFreeSoloAutocompleteMultipleFieldGroupLabel,
  VireoFormFreeSoloAutocompleteMultipleFieldGroupList,
  VireoFormFreeSoloAutocompleteMultipleFieldHiddenOptionsButton,
  VireoFormFreeSoloAutocompleteMultipleFieldInputLabel,
  VireoFormFreeSoloAutocompleteMultipleFieldListbox,
  VireoFormFreeSoloAutocompleteMultipleFieldLoadingIndicator,
  VireoFormFreeSoloAutocompleteMultipleFieldLoadingText,
  VireoFormFreeSoloAutocompleteMultipleFieldNoOptionsText,
  VireoFormFreeSoloAutocompleteMultipleFieldOption,
  VireoFormFreeSoloAutocompleteMultipleFieldOptionCheckbox,
  VireoFormFreeSoloAutocompleteMultipleFieldOutlinedInput,
  VireoFormFreeSoloAutocompleteMultipleFieldPaper,
  VireoFormFreeSoloAutocompleteMultipleFieldPopper,
  VireoFormFreeSoloAutocompleteMultipleFieldPopupButton,
  VireoFormFreeSoloAutocompleteMultipleFieldPopupIcon,
  VireoFormFreeSoloAutocompleteMultipleFieldRoot,
  VireoFormFreeSoloAutocompleteMultipleFieldSelectedOption,
  VireoFormFreeSoloAutocompleteMultipleFieldSelectedOptionDeleteIcon,
  VireoFormFreeSoloAutocompleteMultipleFieldSelectedOptions,
  VireoFormFreeSoloAutocompleteMultipleFieldStandardInput,
  VireoFormFreeSoloAutocompleteMultipleFieldTextField,
} from "./VireoFormFreeSoloAutocompleteMultipleField.styled";
import type {
  VireoFormFreeSoloAutocompleteMultipleFieldInputChangeReason,
  VireoFormFreeSoloAutocompleteMultipleFieldOwnerState,
  VireoFormFreeSoloAutocompleteMultipleFieldProps,
  VireoFormFreeSoloAutocompleteMultipleFieldSelection,
} from "./VireoFormFreeSoloAutocompleteMultipleField.types";

function useUtilityClasses(
  ownerState: VireoFormFreeSoloAutocompleteMultipleFieldOwnerState,
  classes?: VireoFormFreeSoloAutocompleteMultipleFieldProps["classes"],
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
        ownerState.atSelectionLimit && "atSelectionLimit",
        ownerState.hasHiddenOptions && "hasHiddenOptions",
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
      selectedOptions: ["selectedOptions"],
      selectedOption: ["selectedOption"],
      selectedOptionDeleteIcon: ["selectedOptionDeleteIcon"],
      hiddenOptionsButton: ["hiddenOptionsButton"],
      optionCheckbox: ["optionCheckbox"],
    } as const satisfies UtilityClassSlotMap<
      VireoFormFreeSoloAutocompleteMultipleFieldSlotName,
      VireoFormFreeSoloAutocompleteMultipleFieldClassKey
    >,
    getVireoFormFreeSoloAutocompleteMultipleFieldUtilityClass,
    classes,
  );
}
function validValue(value: string) {
  return value.length > 0;
}
function normalizedNonNegative(value: number | undefined, fallback: number) {
  return value === undefined || !Number.isFinite(value) ? fallback : Math.max(0, Math.floor(value));
}
function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

function VireoFormFreeSoloAutocompleteMultipleFieldImpl<TOption>(
  inProps: VireoFormFreeSoloAutocompleteMultipleFieldProps<TOption>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({
    props: inProps,
    name: VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME,
  }) as VireoFormFreeSoloAutocompleteMultipleFieldProps<TOption>;
  const {
    className,
    classes: classesProp,
    clearIcon,
    clearLabel = "Clear selections",
    closeLabel = "Close options",
    commitOnBlur = true,
    createOptionLabel = value => `Add “${value}”`,
    defaultInputValue = "",
    defaultOpen = false,
    disabled = false,
    disableClearable = false,
    disableCloseOnSelect = true,
    error = false,
    errorDisplay: errorDisplayProp,
    filterMode = "client",
    filterOptions: filterOptionsProp,
    formatError: formatErrorProp,
    fullWidth = true,
    getHiddenOptionsLabel = count => `${count} more selected options`,
    getHiddenOptionsText = count => `+${count}`,
    getOptionDisabled,
    getOptionLabel,
    getOptionValue,
    getRemoveOptionLabel = selection => `Remove ${selection.label}`,
    groupBy,
    helperText = " ",
    hideOptionCheckbox = false,
    inputRef,
    inputValue: inputValueProp,
    isValueEqual = (left, right) => left === right,
    label,
    loading = false,
    loadingText = "Loading…",
    margin,
    maxDisplayedOptions: maxDisplayedOptionsProp = 2,
    maxSelectedOptions: maxSelectedOptionsProp,
    noOptionsText = "No options",
    onBlur,
    onClose,
    onInputValueChange,
    onKeyDown,
    onOpen,
    onValueChange,
    open: openProp,
    openLabel = "Open options",
    options,
    placeholder,
    popupIcon,
    readOnly = false,
    removeOnBackspace = false,
    renderGroupLabel,
    renderOption,
    renderSelectedOptions,
    required = false,
    normalizeValue = value => value.trim(),
    size,
    color,
    slotProps = {},
    slots = {},
    style,
    sx,
    variant = "outlined",
    ...other
  } = props;
  const field = useVireoFieldContext<string[]>();
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
  const maxDisplayedOptions = normalizedNonNegative(maxDisplayedOptionsProp, 2);
  const maxSelectedOptions =
    maxSelectedOptionsProp === undefined ? undefined : normalizedNonNegative(maxSelectedOptionsProp, 0);

  const normalizedOptions = React.useMemo(() => {
    const result: VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption>[] = [];
    for (const option of options) {
      const value = normalizeValue(getOptionValue(option));
      if (!validValue(value) || result.some(item => isValueEqual(item.value, value))) {
        if (process.env.NODE_ENV !== "production")
          console.warn(
            `${VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME}: normalized option values must be unique non-empty strings.`,
            value,
          );
        continue;
      }
      result.push({ value, label: getOptionLabel(option), custom: false, option });
    }
    return result;
  }, [getOptionLabel, getOptionValue, isValueEqual, normalizeValue, options]);
  const selections = React.useMemo(
    () =>
      fieldState.value.map(value => {
        const current = normalizedOptions.find(item => isValueEqual(item.value, value));
        if (current) return current;
        return { value, label: value, custom: true, option: null };
      }),
    [fieldState.value, isValueEqual, normalizedOptions],
  );
  const displayedSelections = selections.slice(0, maxDisplayedOptions);
  const hiddenCount = selections.length - displayedSelections.length;
  const atSelectionLimit = maxSelectedOptions !== undefined && selections.length >= maxSelectedOptions;
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
  const ownerState: VireoFormFreeSoloAutocompleteMultipleFieldOwnerState = {
    dirty: fieldState.dirty,
    disabled,
    error: effectiveError,
    focused,
    hasInputValue: effectiveInputValue.length > 0,
    hasValue: selections.length > 0,
    loading,
    open: effectiveOpen,
    readOnly,
    required,
    submitting,
    touched: fieldState.touched,
    validating: fieldState.validating,
    atSelectionLimit,
    hasHiddenOptions: hiddenCount > 0,
  };
  const classes = useUtilityClasses(ownerState, classesProp);
  const resolved = Object.fromEntries(
    Object.entries(slotProps).map(([key, value]) => [key, resolveSlotProps(value as never, ownerState)]),
  ) as Record<string, Record<string, unknown>>;
  const rootProps = resolved.root ?? {};
  const { className: rootClassName, ref: rootSlotRef, style: rootStyle, sx: rootSx, ...rootOther } = rootProps;
  const rootRef = useForkRef(forwardedRef, rootSlotRef as React.Ref<HTMLDivElement>);
  const htmlInputProps = resolved.htmlInput ?? {};
  const combinedInputRef = useForkRef(inputRef, htmlInputProps.ref as React.Ref<HTMLInputElement>);
  const defaultFilter = React.useMemo(
    () => createFilterOptions<VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption>>(),
    [],
  );
  const filterOptions = (
    items: VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption>[],
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
    if (
      validValue(customValue) &&
      !items.some(item => isValueEqual(item.value, customValue)) &&
      !fieldState.value.some(value => isValueEqual(value, customValue))
    )
      return [...filtered, { value: customValue, label: customValue, custom: true, option: null }];
    return filtered;
  };
  const emitRemove = (selection: VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption>) => {
    if (disabled || readOnly) return;
    const next = fieldState.value.filter(value => !isValueEqual(value, selection.value));
    field.handleChange(next);
    onValueChange?.(next, { reason: "removeOption", option: selection.option, value: selection.value });
  };
  const handleChange = (
    _event: React.SyntheticEvent,
    next: (VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption> | string)[],
    reason: string,
    details?: { option?: VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption> | string },
  ) => {
    if (disabled || readOnly) return;
    if (reason === "clear") {
      const previousValues = [...fieldState.value];
      field.handleChange([]);
      onValueChange?.([], { reason: "clear", previousValues });
      return;
    }
    const rawChanged = details?.option;
    const changed =
      typeof rawChanged === "string"
        ? { value: normalizeValue(rawChanged), label: rawChanged, custom: true, option: null }
        : rawChanged;
    if (!changed) return;
    const values = next
      .map(item => normalizeValue(typeof item === "string" ? item : item.value))
      .filter((value, index, all) => validValue(value) && all.findIndex(item => isValueEqual(item, value)) === index);
    if (reason === "selectOption" || reason === "createOption") {
      if (fieldState.value.some(value => isValueEqual(value, changed.value))) return;
      if (atSelectionLimit && !fieldState.value.includes(changed.value)) return;
      field.handleChange(values);
      if (changed.option)
        onValueChange?.(values, { reason: "selectOption", option: changed.option, value: changed.value });
      else onValueChange?.(values, { reason: "createOption", value: changed.value });
    } else if (reason === "removeOption") {
      field.handleChange(values);
      onValueChange?.(values, { reason: "removeOption", option: changed.option, value: changed.value });
    }
  };
  const handleInputChange = (
    _event: React.SyntheticEvent,
    value: string,
    reason: VireoFormFreeSoloAutocompleteMultipleFieldInputChangeReason,
  ) => {
    if (inputValueProp === undefined) setInternalInputValue(value);
    onInputValueChange?.(value, reason);
  };
  const handleOpen = () => {
    if (openProp === undefined) setInternalOpen(true);
    onOpen?.();
  };
  const handleClose: NonNullable<typeof onClose> = (event, reason) => {
    if (openProp === undefined) setInternalOpen(false);
    onClose?.(event, reason);
  };
  const LoadingText = slots.loadingText ?? VireoFormFreeSoloAutocompleteMultipleFieldLoadingText;
  const NoOptionsText = slots.noOptionsText ?? VireoFormFreeSoloAutocompleteMultipleFieldNoOptionsText;
  const ClearIcon = slots.clearIcon ?? VireoFormFreeSoloAutocompleteMultipleFieldClearIcon;
  const PopupIcon = slots.popupIcon ?? VireoFormFreeSoloAutocompleteMultipleFieldPopupIcon;
  const LoadingIndicator = slots.loadingIndicator ?? VireoFormFreeSoloAutocompleteMultipleFieldLoadingIndicator;

  return (
    <VireoFormFreeSoloAutocompleteMultipleFieldRoot
      {...rootOther}
      as={slots.root ?? "div"}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootClassName as string)}
      style={{ ...style, ...(rootStyle as React.CSSProperties) }}
      sx={mergeSx(sx, rootSx as never)}
    >
      <Autocomplete<VireoFormFreeSoloAutocompleteMultipleFieldSelection<TOption>, true, false, true>
        {...other}
        freeSolo
        multiple
        value={selections}
        options={normalizedOptions}
        disableCloseOnSelect={disableCloseOnSelect}
        getOptionLabel={item => (typeof item === "string" ? item : item.label)}
        getOptionKey={item => (typeof item === "string" ? item : item.value)}
        isOptionEqualToValue={(option, value) => typeof value !== "string" && isValueEqual(option.value, value.value)}
        getOptionDisabled={item =>
          Boolean(item.option && getOptionDisabled?.(item.option)) ||
          (atSelectionLimit && !fieldState.value.some(value => isValueEqual(value, item.value)))
        }
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
        onKeyDown={event => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (!removeOnBackspace && event.key === "Backspace" && effectiveInputValue === "")
            (event as typeof event & { defaultMuiPrevented: boolean }).defaultMuiPrevented = true;
        }}
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
            popper: slots.popper ?? VireoFormFreeSoloAutocompleteMultipleFieldPopper,
            paper: slots.paper ?? VireoFormFreeSoloAutocompleteMultipleFieldPaper,
            listbox: slots.listbox ?? VireoFormFreeSoloAutocompleteMultipleFieldListbox,
            clearIndicator: slots.clearButton ?? VireoFormFreeSoloAutocompleteMultipleFieldClearButton,
            popupIndicator: slots.popupButton ?? VireoFormFreeSoloAutocompleteMultipleFieldPopupButton,
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
        renderValue={() => {
          const SelectedOptions = slots.selectedOptions ?? VireoFormFreeSoloAutocompleteMultipleFieldSelectedOptions;
          const SelectedOption = slots.selectedOption ?? VireoFormFreeSoloAutocompleteMultipleFieldSelectedOption;
          const DeleteIcon =
            slots.selectedOptionDeleteIcon ?? VireoFormFreeSoloAutocompleteMultipleFieldSelectedOptionDeleteIcon;
          const HiddenButton =
            slots.hiddenOptionsButton ?? VireoFormFreeSoloAutocompleteMultipleFieldHiddenOptionsButton;
          const getRemoveButtonProps = (value: string) => {
            const selection = selections.find(item => isValueEqual(item.value, value))!;
            return {
              "aria-label": getRemoveOptionLabel(selection),
              disabled: disabled || readOnly,
              onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                emitRemove(selection);
              },
            };
          };
          if (renderSelectedOptions)
            return (
              <SelectedOptions
                {...resolved.selectedOptions}
                className={joinClassNames(classes.selectedOptions, resolved.selectedOptions?.className as string)}
                ownerState={ownerState}
              >
                {renderSelectedOptions({
                  selections,
                  displayedSelections,
                  hiddenCount,
                  maxDisplayedOptions,
                  getRemoveButtonProps,
                })}
              </SelectedOptions>
            );
          return (
            <SelectedOptions
              {...resolved.selectedOptions}
              className={joinClassNames(classes.selectedOptions, resolved.selectedOptions?.className as string)}
              ownerState={ownerState}
            >
              {displayedSelections.map(selection => (
                <SelectedOption
                  {...resolved.selectedOption}
                  key={selection.value}
                  label={selection.label}
                  title={selection.label}
                  aria-label={getRemoveOptionLabel(selection)}
                  className={joinClassNames(classes.selectedOption, resolved.selectedOption?.className as string)}
                  ownerState={ownerState}
                  onDelete={
                    disabled || readOnly
                      ? undefined
                      : (event: React.SyntheticEvent) => {
                          (resolved.selectedOption?.onDelete as ((event: React.SyntheticEvent) => void) | undefined)?.(
                            event,
                          );
                          if (event.defaultPrevented) return;
                          emitRemove(selection);
                        }
                  }
                  onClick={
                    disabled || readOnly
                      ? undefined
                      : (event: React.MouseEvent) => {
                          (resolved.selectedOption?.onClick as React.MouseEventHandler | undefined)?.(event);
                          if (event.defaultPrevented) return;
                          emitRemove(selection);
                        }
                  }
                  deleteIcon={
                    <DeleteIcon
                      {...resolved.selectedOptionDeleteIcon}
                      aria-label={getRemoveOptionLabel(selection)}
                      role="button"
                      className={joinClassNames(
                        classes.selectedOptionDeleteIcon,
                        resolved.selectedOptionDeleteIcon?.className as string,
                      )}
                      ownerState={ownerState}
                    />
                  }
                />
              ))}
              {hiddenCount > 0 && (
                <HiddenButton
                  {...resolved.hiddenOptionsButton}
                  type="button"
                  aria-label={getHiddenOptionsLabel(hiddenCount)}
                  className={joinClassNames(
                    classes.hiddenOptionsButton,
                    resolved.hiddenOptionsButton?.className as string,
                  )}
                  ownerState={ownerState}
                  onClick={(event: React.MouseEvent) => {
                    (resolved.hiddenOptionsButton?.onClick as React.MouseEventHandler | undefined)?.(event);
                    if (event.defaultPrevented) return;
                    event.stopPropagation();
                    handleOpen();
                  }}
                >
                  {getHiddenOptionsText(hiddenCount)}
                </HiddenButton>
              )}
            </SelectedOptions>
          );
        }}
        renderOption={(optionProps, item, state) => {
          const Option = slots.option ?? VireoFormFreeSoloAutocompleteMultipleFieldOption;
          const Checkbox = slots.optionCheckbox ?? VireoFormFreeSoloAutocompleteMultipleFieldOptionCheckbox;
          const unavailable =
            Boolean(item.option && getOptionDisabled?.(item.option)) || (atSelectionLimit && !state.selected);
          const content = item.custom
            ? createOptionLabel(item.value)
            : item.option && renderOption
              ? renderOption(item.option, {
                  inputValue: state.inputValue,
                  selected: state.selected,
                  disabled: unavailable,
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
              {!hideOptionCheckbox && (
                <Checkbox
                  {...resolved.optionCheckbox}
                  checked={state.selected}
                  tabIndex={-1}
                  disableRipple
                  slotProps={{ input: { "aria-hidden": true } }}
                  className={joinClassNames(classes.optionCheckbox, resolved.optionCheckbox?.className as string)}
                  ownerState={ownerState}
                />
              )}
              {content}
            </Option>
          );
        }}
        renderGroup={params => {
          const Group = slots.group ?? VireoFormFreeSoloAutocompleteMultipleFieldGroup;
          const GroupLabel = slots.groupLabel ?? VireoFormFreeSoloAutocompleteMultipleFieldGroupLabel;
          const GroupList = slots.groupList ?? VireoFormFreeSoloAutocompleteMultipleFieldGroupList;
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
          const TextField = slots.textField ?? VireoFormFreeSoloAutocompleteMultipleFieldTextField;
          const loadingAdornment = loading ? (
            <LoadingIndicator
              {...resolved.loadingIndicator}
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
                inputLabel: slots.inputLabel ?? VireoFormFreeSoloAutocompleteMultipleFieldInputLabel,
                input:
                  slots.input ??
                  (variant === "filled"
                    ? VireoFormFreeSoloAutocompleteMultipleFieldFilledInput
                    : variant === "standard"
                      ? VireoFormFreeSoloAutocompleteMultipleFieldStandardInput
                      : VireoFormFreeSoloAutocompleteMultipleFieldOutlinedInput),
                // Keep MUI's internal InputBaseInput unless the consumer replaces this slot.
                // It owns the native-input reset required by every TextField variant.
                htmlInput: slots.htmlInput,
                formHelperText: slots.formHelperText ?? VireoFormFreeSoloAutocompleteMultipleFieldFormHelperText,
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
                  validValue(nextValue) &&
                  !fieldState.value.some(value => isValueEqual(value, nextValue)) &&
                  !atSelectionLimit
                ) {
                  const next = [...fieldState.value, nextValue];
                  field.handleChange(next);
                  onValueChange?.(next, { reason: "createOption", value: nextValue });
                  if (inputValueProp === undefined) setInternalInputValue("");
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
                  ...htmlInputProps,
                  name: field.name,
                  ref: (node: HTMLInputElement | null) => {
                    assignRef(autocompleteInputRef, node);
                    assignRef(combinedInputRef, node);
                  },
                  className: joinClassNames(
                    classes.htmlInput,
                    params.slotProps.htmlInput.className,
                    htmlInputProps.className as string,
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
    </VireoFormFreeSoloAutocompleteMultipleFieldRoot>
  );
}
type Component = <TOption>(
  props: VireoFormFreeSoloAutocompleteMultipleFieldProps<TOption> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
export const VireoFormFreeSoloAutocompleteMultipleField = React.forwardRef(
  VireoFormFreeSoloAutocompleteMultipleFieldImpl,
) as Component;
(VireoFormFreeSoloAutocompleteMultipleField as React.NamedExoticComponent).displayName =
  VIREO_FORM_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_FIELD_NAME;
