import { VireoSelectInput } from "@/core/public";
import type { RgoInputProps } from "@/utils/formutils";
import type {
  FormControlProps,
  FormHelperTextProps,
  InputLabelProps,
  ListItemTextProps,
  MenuItemProps,
  SelectProps,
} from "@mui/material";
import React from "react";
export type RgoInputSelectSlotProps<V extends string | number> = {
  root: Omit<FormControlProps, "error" | "children">;
  inputLabel: InputLabelProps;
  select: Omit<SelectProps<V>, keyof RgoInputProps | "displayEmpty" | "input" | "renderValue" | "endAdornment">;
  selectItem: Omit<MenuItemProps, "value" | "children">;
  selectItemText: Omit<ListItemTextProps, "primary" | "secondary">;
  formHelperText: Omit<FormHelperTextProps, "children">;
};
export type RgoInputSelectProps<T, V extends string | number> = RgoInputProps<V | null, RgoInputSelectSlotProps<V>> & {
  options: T[];
  renderOption: (option: T) => React.ReactNode;
  renderValue: (option: T) => V;
  disableClearable?: boolean;
  placeholder?: string;
};
function RgoInputSelectImpl<T, V extends string | number>(
  {
    disabled,
    disableClearable,
    error,
    helperText,
    name,
    onBlur,
    onChange,
    options,
    placeholder,
    renderOption,
    renderValue,
    rgoSlotProps,
    value,
  }: RgoInputSelectProps<T, V>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const { children: label, ...labelProps } = rgoSlotProps?.inputLabel ?? {};
  return (
    <VireoSelectInput
      value={value}
      onChange={onChange}
      options={options}
      getOptionValue={renderValue}
      renderOption={renderOption}
      disabled={disabled}
      disableClearable={disableClearable}
      error={error}
      helperText={helperText}
      inputRef={ref}
      label={label}
      placeholder={placeholder}
      slotProps={{
        root: rgoSlotProps?.root,
        label: labelProps,
        select: { ...rgoSlotProps?.select, name, onBlur },
        option: rgoSlotProps?.selectItem,
        optionText: rgoSlotProps?.selectItemText,
        helperText: rgoSlotProps?.formHelperText,
      }}
    />
  );
}
/** @deprecated Use VireoSelectInput. */
export const RgoInputSelect = React.forwardRef(RgoInputSelectImpl) as <T, V extends string | number>(
  props: RgoInputSelectProps<T, V> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement;
