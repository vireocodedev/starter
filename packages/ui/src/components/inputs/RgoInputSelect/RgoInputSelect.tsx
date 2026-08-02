import { type RgoInputProps } from "@/utils/formutils";
import { composeSx } from "@/utils/muiutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { Close } from "@mui/icons-material";
import {
  FormControl,
  type FormControlProps,
  FormHelperText,
  type FormHelperTextProps,
  IconButton,
  InputAdornment,
  InputLabel,
  type InputLabelProps,
  ListItemText,
  type ListItemTextProps,
  MenuItem,
  type MenuItemProps,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  type SelectProps,
  Typography,
} from "@mui/material";
import React from "react";
import "./RgoInputSelect.css";

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
    value,
    onChange,
    options,
    renderOption,
    renderValue,
    placeholder,
    error,
    helperText,
    disableClearable = false,
    rgoSlotProps,
    ...controllerProps
  }: RgoInputSelectProps<T, V>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const rootProps = rgoSlotProps?.root ?? {};
  const inputLabelProps = rgoSlotProps?.inputLabel ?? {};
  const selectProps = rgoSlotProps?.select ?? {};
  const selectItemProps = rgoSlotProps?.selectItem ?? {};
  const selectItemTextProps = rgoSlotProps?.selectItemText ?? {};
  const formHelperProps = rgoSlotProps?.formHelperText ?? {};

  const handleChange = (event: SelectChangeEvent<V>) => {
    const newValue = event.target.value;
    onChange(newValue === "" ? null : (newValue as V));
  };

  const selectRenderValue = (selected: V) => {
    if ((selected === null || selected === undefined || selected === "") && placeholder) {
      return (
        <Typography fontWeight={400} color="textDisabled">
          {placeholder}
        </Typography>
      );
    }

    const option = options.find(option => renderValue(option) === selected);
    return option !== null && option !== undefined ? renderOption(option) : "";
  };

  const handleClear = () => {
    onChange(null);
  };

  const disabled = !!controllerProps.disabled;
  const shouldDisplayClearButton =
    !disabled && value !== null && value !== undefined && value !== "" && !disableClearable;

  const endAdornment = shouldDisplayClearButton ? (
    <InputAdornment sx={{ position: "absolute", right: 32 }} position="end">
      <IconButton size="small" onClick={handleClear}>
        <Close fontSize="small" />
      </IconButton>
    </InputAdornment>
  ) : null;

  return (
    <FormControl
      {...rootProps}
      error={error}
      sx={composeSx(rootProps.sx, {
        width: "100%",
      })}
    >
      <InputLabel {...inputLabelProps} />

      <Select<V>
        {...selectProps}
        {...controllerProps}
        displayEmpty
        input={<OutlinedInput />}
        inputRef={ref}
        value={value ?? ("" as V)}
        onChange={handleChange}
        renderValue={selectRenderValue}
        endAdornment={endAdornment}
        sx={composeSx(selectProps.sx, {
          "& .MuiInputBase-inputAdornedEnd": {
            paddingRight: shouldDisplayClearButton ? "48px !important" : undefined,
          },
        })}
      >
        {options.map(option => {
          const optionDisplay = renderOption(option);
          const optionValue = renderValue(option);

          return (
            <MenuItem {...selectItemProps} key={optionValue} value={optionValue}>
              {typeof optionDisplay === "string" ? (
                <ListItemText {...selectItemTextProps} primary={optionDisplay} />
              ) : (
                optionDisplay
              )}
            </MenuItem>
          );
        })}
      </Select>

      <FormHelperText {...formHelperProps}>{helperText}</FormHelperText>
    </FormControl>
  );
}

export const RgoInputSelect = fixedForwardRef(RgoInputSelectImpl);
