import { VireoSelectMultipleInput } from "@/core/public";
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
export type RgoInputSelectMultipleSlotProps<V extends string | number> = {
  root: Omit<FormControlProps, "error" | "children">;
  inputLabel: InputLabelProps;
  select: Omit<SelectProps<V[]>, keyof RgoInputProps | "displayEmpty" | "input" | "renderValue" | "multiple">;
  selectItem: Omit<MenuItemProps, "value" | "children">;
  selectItemText: Omit<ListItemTextProps, "primary" | "secondary">;
  formHelperText: Omit<FormHelperTextProps, "children">;
};
export type RgoInputSelectMultipleProps<T, V extends string | number> = RgoInputProps<
  V[],
  RgoInputSelectMultipleSlotProps<V>
> & {
  options: T[];
  renderOption: (option: T) => React.ReactNode;
  renderValue: (option: T) => V;
  placeholder?: string;
  disableClearable?: boolean;
};
function Impl<T, V extends string | number>(
  {
    disabled,
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
  }: RgoInputSelectMultipleProps<T, V>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const { children: label, ...labelProps } = rgoSlotProps?.inputLabel ?? {};
  return (
    <VireoSelectMultipleInput
      value={value}
      onChange={onChange}
      options={options}
      getOptionValue={renderValue}
      renderOption={renderOption}
      disabled={disabled}
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
/** @deprecated Use VireoSelectMultipleInput. */
export const RgoInputSelectMultiple = React.forwardRef(Impl) as <T, V extends string | number>(
  props: RgoInputSelectMultipleProps<T, V> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement;
