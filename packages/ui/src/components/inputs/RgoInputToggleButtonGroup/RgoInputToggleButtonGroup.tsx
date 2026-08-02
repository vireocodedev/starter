import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { type RgoInputProps } from "@/utils/formutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { Close } from "@mui/icons-material";
import {
  FormControl,
  type FormControlProps,
  FormHelperText,
  type FormHelperTextProps,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
  Tooltip,
} from "@mui/material";
import React from "react";
import "./RgoInputToggleButtonGroup.css";

type ToggleButtonSlotProps = Omit<ToggleButtonProps, "value" | "children" | "selected">;

export type RgoInputToggleButtonGroupSlotProps<TValue extends NonNullable<unknown>> = {
  root?: Omit<FormControlProps<"fieldset">, "children" | "error" | "component" | "variant">;
  toggleButtonGroup?: Omit<
    ToggleButtonGroupProps,
    "ref" | "value" | "onChange" | "exclusive" | "children" | "onBlur" | "name" | "disabled"
  >;
  toggleButton?: ((option: TValue) => ToggleButtonSlotProps) | ToggleButtonSlotProps;
  formHelperText?: Omit<FormHelperTextProps, "children">;
};

export type RgoInputToggleButtonGroupBaseProps<TValue extends NonNullable<unknown>> = {
  options: TValue[];
  renderOption: (option: TValue) => React.ReactNode;
  renderKey: (option: TValue) => React.Key;
  disableClearable?: boolean;
};

export type RgoInputToggleButtonGroupMultipleProps<TValue extends NonNullable<unknown>> = {
  multiple: true;
} & RgoInputProps<TValue[], RgoInputToggleButtonGroupSlotProps<TValue>>;

export type RgoInputToggleButtonGroupSingleProps<TValue extends NonNullable<unknown>> = {
  multiple?: false;
} & RgoInputProps<TValue | null, RgoInputToggleButtonGroupSlotProps<TValue>>;

export type RgoInputToggleButtonGroupProps<TValue extends NonNullable<unknown>> =
  RgoInputToggleButtonGroupBaseProps<TValue> &
    (RgoInputToggleButtonGroupMultipleProps<TValue> | RgoInputToggleButtonGroupSingleProps<TValue>);

function RgoInputToggleButtonGroupImpl<TValue extends NonNullable<unknown>>(
  {
    options,
    renderOption,
    renderKey,
    disableClearable = false,
    multiple,
    value,
    onChange,
    error,
    helperText,
    rgoSlotProps,
    ...controllerProps
  }: RgoInputToggleButtonGroupProps<TValue>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const t = useTranslationLocal();

  const rootProps = rgoSlotProps?.root ?? {};
  const toggleButtonGroupProps = rgoSlotProps?.toggleButtonGroup ?? {};
  const toggleButtonProps = rgoSlotProps?.toggleButton;
  const formHelperTextProps = rgoSlotProps?.formHelperText ?? {};

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newValue: unknown) => {
    if (!multiple) {
      if (disableClearable && (newValue === null || newValue === value)) {
        return;
      }
      (onChange as (value: TValue | null) => void)(newValue as TValue | null);
    } else {
      (onChange as (value: TValue[]) => void)((newValue ?? []) as TValue[]);
    }
  };

  return (
    <FormControl {...rootProps} error={error} component="fieldset" variant="standard">
      <ToggleButtonGroup
        {...toggleButtonGroupProps}
        {...controllerProps}
        ref={ref}
        exclusive={!multiple}
        value={value}
        onChange={handleChange}
      >
        {options.map(option => {
          const toggleButtonPropsForOption =
            typeof toggleButtonProps === "function" ? toggleButtonProps(option) : toggleButtonProps;
          return (
            <ToggleButton {...toggleButtonPropsForOption} key={renderKey(option)} value={option}>
              {renderOption(option)}
            </ToggleButton>
          );
        })}
        {!disableClearable && value !== null && (
          <Tooltip title={t("common.clearSelection")} placement="top">
            <IconButton size="small" onClick={() => (onChange as (value: TValue | null) => void)(null)}>
              <Close sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        )}
      </ToggleButtonGroup>

      {helperText && <FormHelperText {...formHelperTextProps}>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export const RgoInputToggleButtonGroup = fixedForwardRef(RgoInputToggleButtonGroupImpl);
