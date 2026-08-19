import type { RgoInputAutocompleteSlotProps } from "@/components/inputs/RgoInputAutocomplete/RgoInputAutocomplete";
import { VireoFreeSoloAutocomplete } from "@/core/public";
import type { RgoInputProps } from "@/utils/formutils";
import React from "react";
export type RgoInputAutocompleteFreeSoloProps<TOption> = Omit<
  RgoInputProps<string | null, RgoInputAutocompleteSlotProps<TOption>>,
  "onChange"
> & {
  options: TOption[];
  getOptionLabel: (option: TOption) => string;
  isOptionEqualToValue: (option: TOption, value: TOption) => boolean;
  getStringValue: (option: TOption) => string | null;
  createSyntheticOption: (text: string) => TOption;
  addLabel: (input: string) => React.ReactNode;
  addIcon?: React.ReactNode;
  value: string | null;
  onChange: (value: string | null) => void;
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
  }: RgoInputAutocompleteFreeSoloProps<TOption>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <VireoFreeSoloAutocomplete
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
/** @deprecated Use VireoFreeSoloAutocomplete. */
export const RgoInputAutocompleteFreeSolo = React.forwardRef(Impl) as <TOption>(
  props: RgoInputAutocompleteFreeSoloProps<TOption> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement;
