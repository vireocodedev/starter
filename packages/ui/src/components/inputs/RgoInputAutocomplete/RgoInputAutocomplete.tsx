import { VireoAutocomplete } from "@/core/public";
import type { RgoInputProps } from "@/utils/formutils";
import type { ReactStateSetter } from "@/utils/typeutils";
import type { AutocompleteProps, TextFieldProps } from "@mui/material";
import React from "react";
export type RgoInputAutocompleteSlotProps<T> = {
  root: Omit<
    AutocompleteProps<T, false, boolean, false>,
    | keyof RgoInputProps
    | "renderInput"
    | "inputValue"
    | "onInputChange"
    | "options"
    | "getOptionLabel"
    | "isOptionEqualToValue"
    | "renderOption"
  >;
  textField: TextFieldProps;
};
export type RgoInputAutocompleteProps<T> = RgoInputProps<T | null, RgoInputAutocompleteSlotProps<T>> & {
  searchText?: string;
  onSearchTextChange?: ReactStateSetter<string>;
  options: T[] | ((searchText: string) => Promise<T[]>);
  standaloneOptions?: T[];
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue: (option: T, value: T) => boolean;
  getOptionDisabled?: (option: T) => boolean;
  renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: T) => React.ReactNode;
  sortOptions?: ((a: T, b: T) => number) | false;
  searchMinLength?: number;
  debounceDelay?: number;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
};
function Impl<T>(
  {
    debounceDelay,
    disabled,
    endAdornment,
    error,
    getOptionDisabled,
    getOptionLabel,
    helperText,
    isOptionEqualToValue,
    name,
    onBlur,
    onChange,
    onSearchTextChange,
    options,
    renderOption,
    rgoSlotProps,
    searchMinLength,
    searchText,
    sortOptions,
    standaloneOptions,
    startAdornment,
    value,
  }: RgoInputAutocompleteProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <VireoAutocomplete
      value={value}
      onChange={onChange}
      options={options}
      standaloneOptions={standaloneOptions}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionDisabled={getOptionDisabled}
      renderOption={renderOption}
      searchText={searchText}
      onSearchTextChange={onSearchTextChange}
      searchMinLength={searchMinLength}
      debounceDelay={debounceDelay}
      sortOptions={sortOptions}
      disabled={disabled}
      error={error}
      helperText={helperText}
      name={name}
      onBlur={onBlur}
      inputRef={ref}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      autocompleteProps={rgoSlotProps?.root}
      textFieldProps={rgoSlotProps?.textField}
    />
  );
}
/** @deprecated Use VireoAutocomplete. */
export const RgoInputAutocomplete = React.forwardRef(Impl) as <T>(
  props: RgoInputAutocompleteProps<T> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement;
