import { RgoInputSelect, RgoInputToggleButtonGroup, RgoLabelBox } from "@rgo/front-ui";
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
              <RgoInputSelect
                {...field}
                disableClearable={disableClearable}
                renderOption={renderOption}
                renderValue={o => o}
                options={options}
              />
            ) : (
              <RgoInputToggleButtonGroup<TValue>
                {...field}
                disableClearable={disableClearable}
                options={options}
                renderKey={renderKey}
                renderOption={renderOption}
                rgoSlotProps={{
                  ...rgoSlotProps,
                  toggleButtonGroup: {
                    ...rgoSlotProps?.toggleButtonGroup,
                    sx: {
                      width: "100%",
                      "& .MuiToggleButton-root": {
                        flex: 1,
                        minWidth: 0,
                      },
                      ...(rgoSlotProps?.toggleButtonGroup?.sx ?? {}),
                    },
                  },
                }}
              />
            )}
          </>
        )}
      />
    </RgoLabelBox>
  );
}
