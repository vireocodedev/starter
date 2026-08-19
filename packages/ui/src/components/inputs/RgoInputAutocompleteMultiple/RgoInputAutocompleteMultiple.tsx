import { VireoAutocompleteMultiple } from "@/core/public";
import type { RgoInputProps } from "@/utils/formutils";
import type { ReactStateSetter } from "@/utils/typeutils";
import type { AutocompleteProps, TextFieldProps } from "@mui/material";
import React from "react";
export type RgoInputAutocompleteMultipleSlotProps<T> = {
  root: Omit<
    AutocompleteProps<T, true, boolean, false>,
    | keyof RgoInputProps
    | "renderInput"
    | "inputValue"
    | "onInputChange"
    | "options"
    | "getOptionLabel"
    | "isOptionEqualToValue"
    | "renderOption"
    | "multiple"
  >;
  textField: TextFieldProps;
};
export type RgoInputAutocompleteMultipleProps<T> = RgoInputProps<T[], RgoInputAutocompleteMultipleSlotProps<T>> & {
  searchText: string;
  onSearchTextChange: ReactStateSetter<string>;
  options: T[] | ((searchText: string) => Promise<T[]>);
  standaloneOptions?: T[];
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue: (option: T, value: T) => boolean;
  getOptionDisabled?: (option: T) => boolean;
  renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: T) => React.ReactNode;
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
    standaloneOptions,
    startAdornment,
    value,
  }: RgoInputAutocompleteMultipleProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <VireoAutocompleteMultiple
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
/** @deprecated Use VireoAutocompleteMultiple. */
export const RgoInputAutocompleteMultiple = React.forwardRef(Impl) as <T>(
  props: RgoInputAutocompleteMultipleProps<T> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement;
