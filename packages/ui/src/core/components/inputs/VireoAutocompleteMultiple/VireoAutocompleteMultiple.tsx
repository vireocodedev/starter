import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { Autocomplete, CircularProgress, TextField, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  getVireoAutocompleteMultipleUtilityClass,
  type VireoAutocompleteMultipleClassKey,
} from "./VireoAutocompleteMultiple.classes";
import {
  VIREO_AUTOCOMPLETE_MULTIPLE_NAME,
  type VireoAutocompleteMultipleSlotName,
} from "./VireoAutocompleteMultiple.identity";
import { VireoAutocompleteMultipleRoot } from "./VireoAutocompleteMultiple.styled";
import type { VireoAutocompleteMultipleProps } from "./VireoAutocompleteMultiple.types";
function useUtilityClasses(classes?: Partial<Record<VireoAutocompleteMultipleClassKey, string>>) {
  return composeClasses(
    { root: ["root"] } as const satisfies UtilityClassSlotMap<
      VireoAutocompleteMultipleSlotName,
      VireoAutocompleteMultipleClassKey
    >,
    getVireoAutocompleteMultipleUtilityClass,
    classes,
  );
}
function Impl<TOption>(
  inProps: VireoAutocompleteMultipleProps<TOption>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({ props: inProps, name: VIREO_AUTOCOMPLETE_MULTIPLE_NAME });
  const {
    autocompleteProps = {},
    className,
    classes: classesProp,
    debounceDelay = 300,
    disabled = false,
    endAdornment,
    error = false,
    getOptionDisabled,
    getOptionLabel,
    helperText,
    inputRef,
    isOptionEqualToValue,
    name,
    onBlur,
    onChange,
    onSearchTextChange,
    options,
    renderOption,
    searchMinLength = 0,
    searchText: searchTextProp,
    slotProps = {},
    slots = {},
    sortOptions = true,
    standaloneOptions = [],
    startAdornment,
    style,
    sx,
    textFieldProps,
    value,
    ...other
  } = props as VireoAutocompleteMultipleProps<TOption> & {
    className?: string;
    style?: React.CSSProperties;
    sx?: VireoAutocompleteMultipleProps<TOption>["sx"];
  };
  const [internalSearchText, setInternalSearchText] = React.useState("");
  const searchText = searchTextProp ?? internalSearchText;
  const setSearchText = React.useCallback(
    (next: string) => {
      if (searchTextProp === undefined) setInternalSearchText(next);
      onSearchTextChange?.(next);
    },
    [onSearchTextChange, searchTextProp],
  );
  const [loadedOptions, setLoadedOptions] = React.useState<readonly TOption[]>(
    typeof options === "function" ? [] : options,
  );
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (typeof options !== "function") {
      setLoadedOptions(options);
      return;
    }
    if (searchText.trim().length < searchMinLength) {
      setLoadedOptions([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      Promise.resolve(options(searchText))
        .then(result => {
          if (active) setLoadedOptions(result);
        })
        .catch(() => {
          if (active) setLoadedOptions([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, debounceDelay);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [debounceDelay, options, searchMinLength, searchText]);
  const resolvedOptions = React.useMemo(() => {
    const merged: TOption[] = [];
    for (const option of [...standaloneOptions, ...loadedOptions, ...value])
      if (!merged.some(existing => isOptionEqualToValue(existing, option))) merged.push(option);
    const compare =
      typeof sortOptions === "function"
        ? sortOptions
        : (a: TOption, b: TOption) => getOptionLabel(a).localeCompare(getOptionLabel(b));
    return sortOptions === false ? merged : merged.sort(compare);
  }, [getOptionLabel, isOptionEqualToValue, loadedOptions, sortOptions, standaloneOptions, value]);
  const ownerState = { disabled, error, loading, hasValue: value.length > 0 };
  const classes = useUtilityClasses(classesProp);
  const root = resolveSlotProps(slotProps.root, ownerState);
  const { className: rootClass, ref: rootSlotRef, style: rootStyle, sx: rootSx, ...rootOther } = root;
  const rootRef = useForkRef(forwardedRef, rootSlotRef);
  return (
    <VireoAutocompleteMultipleRoot
      {...other}
      {...rootOther}
      as={slots.root}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootClass)}
      style={{ ...style, ...rootStyle }}
      sx={mergeSx(sx, rootSx)}
    >
      <Autocomplete
        {...autocompleteProps}
        multiple
        disabled={disabled}
        options={resolvedOptions}
        value={[...value]}
        inputValue={searchText}
        onChange={(_event, next) => {
          onChange(next);
          setSearchText("");
        }}
        onInputChange={(_event, next, reason) => {
          if (reason === "input" || reason === "clear") setSearchText(next);
        }}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        getOptionDisabled={getOptionDisabled}
        renderOption={renderOption}
        loading={loading}
        filterOptions={typeof options === "function" ? candidates => candidates : autocompleteProps.filterOptions}
        renderInput={params => (
          <TextField
            {...params}
            {...textFieldProps}
            name={name ?? textFieldProps?.name}
            onBlur={onBlur ?? textFieldProps?.onBlur}
            inputRef={inputRef ?? textFieldProps?.inputRef}
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              ...textFieldProps?.InputProps,
              startAdornment: startAdornment ?? params.InputProps.startAdornment,
              endAdornment: (
                <>
                  {endAdornment}
                  {loading ? <CircularProgress size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </VireoAutocompleteMultipleRoot>
  );
}
export const VireoAutocompleteMultiple = React.forwardRef(Impl) as <TOption>(
  props: VireoAutocompleteMultipleProps<TOption> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
