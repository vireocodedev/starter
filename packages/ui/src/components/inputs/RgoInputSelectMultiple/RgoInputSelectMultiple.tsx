import { type RgoInputProps } from "@/utils/formutils";
import { composeSx } from "@/utils/muiutils";
import { fixedForwardRef } from "@/utils/typeutils";
import {
  Box,
  Checkbox,
  FormControl,
  type FormControlProps,
  FormHelperText,
  type FormHelperTextProps,
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
import "./RgoInputSelectMultiple.css";

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

function RgoInputSelectMultipleImpl<T, V extends string | number>(
  {
    value,
    onChange,
    options,
    renderOption,
    renderValue,
    placeholder,
    error,
    helperText,
    rgoSlotProps,
    ...controllerProps
  }: RgoInputSelectMultipleProps<T, V>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const rootProps = rgoSlotProps?.root ?? {};
  const inputLabelProps = rgoSlotProps?.inputLabel ?? {};
  const selectProps = rgoSlotProps?.select ?? {};
  const selectItemProps = rgoSlotProps?.selectItem ?? {};
  const selectItemTextProps = rgoSlotProps?.selectItemText ?? {};
  const formHelperProps = rgoSlotProps?.formHelperText ?? {};

  const handleChange = (event: SelectChangeEvent<V[]>) => {
    const {
      target: { value: targetValue },
    } = event;

    const newValue: V[] = typeof targetValue === "string" ? (targetValue.split(",") as V[]) : targetValue;
    onChange(newValue);
  };

  const selectRenderValue = (selected: V[]) => {
    if (selected.length === 0 && placeholder) {
      return (
        <Typography fontWeight={400} color="textDisabled">
          {placeholder}
        </Typography>
      );
    }

    const selectedOptions = selected.map(val => {
      const option = options.find(option => renderValue(option) === val)!;
      return renderOption(option);
    });

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
        {selectedOptions.map((optionDisplay, index) => (
          <React.Fragment key={index}>
            {typeof optionDisplay === "string" ? (
              <Typography component="span" variant="body2">
                {optionDisplay}
              </Typography>
            ) : (
              optionDisplay
            )}
            {index < selectedOptions.length - 1 && (
              <Typography component="span" variant="body2" sx={{ color: "text.secondary" }}>
                ,
              </Typography>
            )}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  return (
    <FormControl
      {...rootProps}
      error={error}
      sx={composeSx(rootProps.sx, {
        width: "100%",
      })}
    >
      <InputLabel {...inputLabelProps} />

      <Select<V[]>
        {...selectProps}
        {...controllerProps}
        displayEmpty
        multiple
        input={<OutlinedInput />}
        inputRef={ref}
        value={value}
        onChange={handleChange}
        renderValue={selectRenderValue}
      >
        {options.map(option => {
          const optionDisplay = renderOption(option);
          const optionValue = renderValue(option);

          return (
            <MenuItem {...selectItemProps} key={optionValue} value={optionValue}>
              <Checkbox checked={value.includes(optionValue)} />
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

export const RgoInputSelectMultiple = fixedForwardRef(RgoInputSelectMultipleImpl);
