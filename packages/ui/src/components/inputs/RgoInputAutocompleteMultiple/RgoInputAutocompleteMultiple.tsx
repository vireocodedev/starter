import { RgoInputText, type RgoInputTextSlotProps } from "@/components/inputs/RgoInputText/RgoInputText";
import { useRgoDebounce } from "@/hooks/useRgoDebounce/useRgoDebounce";
import { type RgoInputProps } from "@/utils/formutils";
import { filterOptionsNoop } from "@/utils/objectutils";
import { fixedForwardRef, type ReactStateSetter } from "@/utils/typeutils";
import { Autocomplete, Typography, type AutocompleteProps, type AutocompleteRenderInputParams } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import "./RgoInputAutocompleteMultiple.css";

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
  textField: RgoInputTextSlotProps["root"];
};

function RgoAutocompleteMultipleNoOptionsText({
  searchText,
  searchMinLength,
}: {
  searchText: string;
  searchMinLength: number;
}) {
  const searchTextTrimmed = searchText.trim();

  return (
    <Typography variant="body2" color="text.secondary">
      {searchTextTrimmed.length < searchMinLength
        ? `Start typing (${searchMinLength}+ characters) to see search results`
        : "No results found"}
    </Typography>
  );
}

export type RgoInputAutocompleteMultipleProps<T> = RgoInputProps<T[], RgoInputAutocompleteMultipleSlotProps<T>> & {
  /** Current search text */
  searchText: string;
  /** Setter for current search text */
  onSearchTextChange: ReactStateSetter<string>;
  /** Array of options to display in the dropdown OR async function to fetch options */
  options: T[] | ((searchText: string) => Promise<T[]>);
  /** Static options to always show (useful for async options) */
  standaloneOptions?: T[];
  /** Function to get the display label for an option */
  getOptionLabel: (option: T) => string;
  /** Function to determine if two options are equal */
  isOptionEqualToValue: (option: T, value: T) => boolean;
  /** Function to disable specific options */
  getOptionDisabled?: (option: T) => boolean;
  /** Custom render function for options */
  renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: T) => React.ReactNode;
  /** Minimum length of search text to trigger async search (default: 3) */
  searchMinLength?: number;
  /** Debounce delay for async search in milliseconds (default: 300) */
  debounceDelay?: number;
  /** Start adornment for the input */
  startAdornment?: React.ReactNode;
  /** End adornment for the input */
  endAdornment?: React.ReactNode;
};

function RgoInputAutocompleteMultipleImpl<T>(
  {
    value,
    onChange,
    options,
    standaloneOptions = [],
    getOptionLabel,
    isOptionEqualToValue,
    getOptionDisabled,
    renderOption,
    searchMinLength = 3,
    debounceDelay = 300,
    error,
    helperText,
    startAdornment,
    endAdornment,
    rgoSlotProps,
    searchText,
    onSearchTextChange,
    ...controllerProps
  }: RgoInputAutocompleteMultipleProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const uniqueReactId = React.useId();
  const uniqueId = `rgo-autocomplete-multiple-${uniqueReactId}`;
  const rootProps = rgoSlotProps?.root ?? ({} as RgoInputAutocompleteMultipleSlotProps<T>["root"]);
  const textFieldProps = rgoSlotProps?.textField ?? ({} as RgoInputTextSlotProps["root"]);

  // Ensure value is always an array
  const normalizedValue = React.useMemo(() => value ?? [], [value]);

  // Debounce search text using our callback-based useRgoDebounce
  const [debouncedInputValue, setDebouncedInputValue] = React.useState(searchText);
  const debouncedSetInputValue = useRgoDebounce((value: string) => setDebouncedInputValue(value), debounceDelay);

  React.useEffect(() => {
    debouncedSetInputValue(searchText);
  }, [searchText, debouncedSetInputValue]);

  // Check if options is async function
  const isAsyncOptions = typeof options === "function";
  const asyncOptionsFn = isAsyncOptions ? (options as (searchText: string) => Promise<T[]>) : null;

  // Fetch search results for async options
  const { data: searchResults, isLoading: isSearchLoading } = useQuery<T[]>({
    queryKey: [uniqueId, debouncedInputValue],
    queryFn: async () => {
      if (!asyncOptionsFn) return [];
      return await asyncOptionsFn(debouncedInputValue);
    },
    enabled: isAsyncOptions && debouncedInputValue.trim().length >= searchMinLength,
    initialData: [],
  });

  // Build final options array
  const finalOptions = React.useMemo(() => {
    if (isAsyncOptions) {
      // For async: combine search results with standaloneOptions and current values
      const combinedOptions: T[] = [];

      // Helper function to check if option already exists in the array
      const isOptionAlreadyIncluded = (optionToCheck: T) => {
        return combinedOptions.some(existingOption => isOptionEqualToValue(existingOption, optionToCheck));
      };

      // Add search results
      searchResults.forEach(option => {
        if (!isOptionAlreadyIncluded(option)) {
          combinedOptions.push(option);
        }
      });

      // Add standaloneOptions (don't override search results)
      standaloneOptions.forEach(option => {
        if (!isOptionAlreadyIncluded(option)) {
          combinedOptions.push(option);
        }
      });

      // Add current values if not already included
      normalizedValue.forEach(valueItem => {
        if (!isOptionAlreadyIncluded(valueItem)) {
          combinedOptions.push(valueItem);
        }
      });

      return combinedOptions;
    } else {
      // For sync: use provided options array
      return options as T[];
    }
  }, [isAsyncOptions, searchResults, standaloneOptions, normalizedValue, isOptionEqualToValue, options]);

  const handleChange = (_event: React.SyntheticEvent, newValue: T[]) => {
    onChange(newValue);
    // Clear search text when selection changes
    onSearchTextChange("");
  };

  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string, reason: string) => {
    if (reason === "input") onSearchTextChange(newInputValue);
    if (reason === "clear") onSearchTextChange("");
  };

  return (
    <Autocomplete
      {...rootProps}
      multiple
      disabled={controllerProps.disabled}
      fullWidth={rootProps.fullWidth ?? true}
      disableClearable={rootProps.disableClearable ?? false}
      options={finalOptions}
      value={normalizedValue}
      inputValue={searchText}
      onChange={handleChange}
      onInputChange={handleInputChange}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionDisabled={getOptionDisabled}
      renderOption={renderOption}
      filterOptions={rootProps.filterOptions ?? (isAsyncOptions ? filterOptionsNoop : undefined)}
      noOptionsText={
        rootProps.noOptionsText ?? (
          <RgoAutocompleteMultipleNoOptionsText searchText={debouncedInputValue} searchMinLength={searchMinLength} />
        )
      }
      loading={rootProps.loading ?? (isAsyncOptions && isSearchLoading)}
      renderInput={(params: AutocompleteRenderInputParams) => (
        <RgoInputText
          {...controllerProps}
          ref={ref}
          value={searchText}
          onChange={value => onSearchTextChange(value ?? "")}
          error={error}
          helperText={helperText}
          rgoSlotProps={{
            root: {
              ...params,
              ...(textFieldProps ?? {}),
              slotProps: {
                ...(textFieldProps.slotProps ?? {}),
                input: {
                  ...(textFieldProps.slotProps?.input ?? {}),
                  ...params.InputProps,
                  startAdornment: startAdornment ? (
                    <>
                      {startAdornment}
                      {params.InputProps.startAdornment}
                    </>
                  ) : (
                    params.InputProps.startAdornment
                  ),
                  endAdornment: endAdornment ? (
                    <>
                      {params.InputProps.endAdornment}
                      {endAdornment}
                    </>
                  ) : (
                    params.InputProps.endAdornment
                  ),
                },
                htmlInput: {
                  ...(textFieldProps.slotProps?.htmlInput ?? {}),
                  ...params.inputProps,
                  autoComplete: "off",
                },
              },
            },
          }}
        />
      )}
    />
  );
}

export const RgoInputAutocompleteMultiple = fixedForwardRef(RgoInputAutocompleteMultipleImpl);
