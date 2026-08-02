import { type RgoInputProps, type RhfInputProps } from "@/utils/formutils";
import { fixedForwardRef } from "@/utils/typeutils";
import {
  FormControl,
  FormControlLabel,
  type FormControlLabelProps,
  type FormControlProps,
  FormHelperText,
  type FormHelperTextProps,
  Switch,
  type SwitchProps,
  Typography,
  type TypographyProps,
} from "@mui/material";
import React from "react";
import "./RgoInputSwitch.css";

export type RgoInputSwitchValue = boolean | null;

export type RgoInputSwitchSlotProps = {
  root?: Omit<FormControlProps<"fieldset">, "children" | "error" | "component" | "variant">;
  formControlLabel?: Omit<FormControlLabelProps, "control" | "label">;
  formControlLabelSwitch?: Omit<SwitchProps, "ref" | "checked" | keyof RhfInputProps<boolean>>;
  formControlLabelTypography?: Omit<TypographyProps, "children" | "alignSelf" | "variant" | "fontWeight">;
  formHelperText?: Omit<FormHelperTextProps, "children">;
};

export type RgoInputSwitchProps = RgoInputProps<RgoInputSwitchValue, RgoInputSwitchSlotProps> & {
  label?: string | React.ReactNode;
};

function RgoInputSwitchImpl(
  { label, value, onChange, error, helperText, rgoSlotProps, ...controllerProps }: RgoInputSwitchProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const rootProps = rgoSlotProps?.root ?? {};
  const formControlLabelProps = rgoSlotProps?.formControlLabel ?? {};
  const formControlLabelSwitchProps = rgoSlotProps?.formControlLabelSwitch ?? {};
  const formControlLabelTypographyProps = rgoSlotProps?.formControlLabelTypography ?? {};
  const formHelperTextProps = rgoSlotProps?.formHelperText ?? {};

  return (
    <FormControl {...rootProps} error={error} component="fieldset" variant="standard">
      <FormControlLabel
        {...formControlLabelProps}
        sx={{
          ...(rgoSlotProps?.formControlLabel?.sx ?? {}),
          marginLeft: 0,
          gap: 1,
        }}
        control={
          <Switch
            {...formControlLabelSwitchProps}
            ref={ref}
            checked={value ?? false}
            onChange={e => onChange(e.target.checked)}
            {...controllerProps}
          />
        }
        label={
          typeof label === "string" ? (
            <Typography {...formControlLabelTypographyProps} alignSelf="center" variant="subtitle1" fontWeight="600">
              {label}
            </Typography>
          ) : (
            (label ?? undefined)
          )
        }
      />
      {helperText && <FormHelperText {...formHelperTextProps}>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export const RgoInputSwitch = fixedForwardRef(RgoInputSwitchImpl);
