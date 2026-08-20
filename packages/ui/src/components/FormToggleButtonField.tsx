import { RgoLabelBox } from "@/core/public";
import { Autocomplete, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { type ReactNode } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

type ToggleButtonGroupSlotProps = {
  toggleButtonGroup?: {
    sx?: object;
  };
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FormToggleButtonFieldProps<TFieldValues extends FieldValues, TValue extends {}> = {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  options: TValue[];
  renderKey: (option: TValue) => string;
  renderOption: (option: TValue) => ReactNode;
  disableClearable?: boolean;
  rgoSlotProps?: ToggleButtonGroupSlotProps;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function FormToggleButtonField<TFieldValues extends FieldValues, TValue extends {}>({
  name,
  control,
  label,
  options,
  renderKey,
  renderOption,
  disableClearable = true,
  rgoSlotProps,
}: FormToggleButtonFieldProps<TFieldValues, TValue>) {
  const optionsLength = options.length;

  return (
    <RgoLabelBox label={label}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            {optionsLength > 2 ? (
              <Autocomplete<TValue, false, boolean, false>
                value={field.value as TValue}
                onChange={(_event, value) => field.onChange(value)}
                onBlur={field.onBlur}
                disableClearable={disableClearable}
                options={options}
                getOptionLabel={renderKey}
                isOptionEqualToValue={(option, value) => renderKey(option) === renderKey(value)}
                renderOption={(props, option) => <li {...props}>{renderOption(option)}</li>}
                renderInput={params => <TextField {...params} name={field.name} />}
              />
            ) : (
              <ToggleButtonGroup
                exclusive
                value={field.value}
                onBlur={field.onBlur}
                onChange={(_event, value: TValue | null) => {
                  if (value !== null || !disableClearable) field.onChange(value);
                }}
                sx={{
                  width: "100%",
                  "& .MuiToggleButton-root": { flex: 1, minWidth: 0 },
                  ...(rgoSlotProps?.toggleButtonGroup?.sx ?? {}),
                }}
              >
                {options.map(option => (
                  <ToggleButton key={renderKey(option)} value={option}>
                    {renderOption(option)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
          </>
        )}
      />
    </RgoLabelBox>
  );
}
