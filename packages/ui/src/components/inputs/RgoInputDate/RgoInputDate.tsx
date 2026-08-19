import { VireoDateInput } from "@/core/public";
import type { RgoInputProps } from "@/utils/formutils";
import type { DatePickerProps } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import React from "react";

export type RgoInputDateSlotProps = { root: Omit<DatePickerProps<Dayjs>, "inputRef" | keyof RgoInputProps> };
export type RgoInputDateProps = RgoInputProps<number | null, RgoInputDateSlotProps>;

/** @deprecated Use VireoDateInput. */
export const RgoInputDate = React.forwardRef<HTMLInputElement, RgoInputDateProps>(function RgoInputDate(
  { disabled, error, helperText, name, onBlur, onChange, rgoSlotProps, value },
  ref,
) {
  return (
    <VireoDateInput
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
      helperText={helperText}
      inputRef={ref}
      name={name}
      onBlur={onBlur}
      pickerProps={rgoSlotProps?.root}
    />
  );
});
