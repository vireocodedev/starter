import type { RgoInputAutocompleteMultipleSlotProps } from "@/components/inputs/RgoInputAutocompleteMultiple/RgoInputAutocompleteMultiple";
import { VireoFreeSoloAutocompleteMultiple } from "@/core/public";
import type { RgoInputProps } from "@/utils/formutils";
import React from "react";

export type RgoInputAutocompleteFreeSoloMultipleProps<TOption> = Omit<
  RgoInputProps<string[], RgoInputAutocompleteMultipleSlotProps<TOption>>,
  "onChange"
> & {
  options: TOption[];
  getOptionLabel: (option: TOption) => string;
  isOptionEqualToValue: (option: TOption, value: TOption) => boolean;
  getStringValue: (option: TOption) => string | null;
  createSyntheticOption: (text: string) => TOption;
  addLabel: (input: string) => React.ReactNode;
  addIcon?: React.ReactNode;
  value: string[] | null;
  onChange: (value: string[] | null) => void;
};

function Impl<TOption>(
  {
    addIcon,
    addLabel,
    createSyntheticOption,
    disabled,
    error,
    getOptionLabel,
    getStringValue,
    helperText,
    isOptionEqualToValue,
    name,
    onBlur,
    onChange,
    options,
    rgoSlotProps,
    value,
  }: RgoInputAutocompleteFreeSoloMultipleProps<TOption>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <VireoFreeSoloAutocompleteMultiple
      value={value}
      onChange={onChange}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      getStringValue={getStringValue}
      createSyntheticOption={createSyntheticOption}
      addLabel={addLabel}
      addIcon={addIcon}
      disabled={disabled}
      error={error}
      helperText={helperText}
      name={name}
      onBlur={onBlur}
      inputRef={ref}
      autocompleteProps={rgoSlotProps?.root}
      textFieldProps={rgoSlotProps?.textField}
    />
  );
}

/** @deprecated Use VireoFreeSoloAutocompleteMultiple. */
export const RgoInputAutocompleteFreeSoloMultiple = React.forwardRef(Impl) as <TOption>(
  props: RgoInputAutocompleteFreeSoloMultipleProps<TOption> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement;
