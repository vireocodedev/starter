import { VireoDateTimeInput } from "@/core/public";
import type { RgoInputProps } from "@/utils/formutils";
import type { DateTimePickerProps } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import React from "react";

export type RgoInputDateTimeSlotProps = { root: Omit<DateTimePickerProps<Dayjs>, "inputRef" | keyof RgoInputProps> };
export type RgoInputDateTimeProps = RgoInputProps<number | null, RgoInputDateTimeSlotProps>;

/** @deprecated Use VireoDateTimeInput. */
export const RgoInputDateTime = React.forwardRef<HTMLInputElement, RgoInputDateTimeProps>(function RgoInputDateTime(
  { disabled, error, helperText, name, onBlur, onChange, rgoSlotProps, value },
  ref,
) {
  return (
    <VireoDateTimeInput
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
