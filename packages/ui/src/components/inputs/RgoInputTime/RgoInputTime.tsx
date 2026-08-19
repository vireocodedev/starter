import { VireoTimeInput } from "@/core/public";
import type { RgoInputProps } from "@/utils/formutils";
import type { TimePickerProps } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import React from "react";
export type RgoInputTimeSlotProps = {
  root: Omit<TimePickerProps<Dayjs>, "inputRef" | "format" | "ampm" | keyof RgoInputProps>;
};
export type RgoInputTimeProps = RgoInputProps<number | null, RgoInputTimeSlotProps> & {
  refDateMax?: number | null;
  refDateMin?: number | null;
  allowedRefDateOffsetMs?: number | null;
};
/** @deprecated Use VireoTimeInput. */
export const RgoInputTime = React.forwardRef<HTMLInputElement, RgoInputTimeProps>(function RgoInputTime(
  {
    allowedRefDateOffsetMs,
    disabled,
    error,
    helperText,
    name,
    onBlur,
    onChange,
    refDateMax,
    refDateMin,
    rgoSlotProps,
    value,
  },
  ref,
) {
  return (
    <VireoTimeInput
      value={value}
      onChange={onChange}
      allowedRefDateOffsetMs={allowedRefDateOffsetMs}
      disabled={disabled}
      error={error}
      helperText={helperText}
      inputRef={ref}
      name={name}
      onBlur={onBlur}
      pickerProps={rgoSlotProps?.root}
      refDateMax={refDateMax}
      refDateMin={refDateMin}
    />
  );
});
