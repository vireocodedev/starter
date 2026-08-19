import { VireoDurationInput } from "@/core/public";
import type { RgoInputProps } from "@/utils/formutils";
import type { TimeFieldProps, TimeView } from "@mui/x-date-pickers";
import type { Dayjs } from "dayjs";
import React from "react";
export type RgoInputDurationSlotProps = {
  root: Omit<TimeFieldProps<Dayjs>, "inputRef" | "ampm" | keyof RgoInputProps>;
};
export type RgoInputDurationProps = RgoInputProps<number | null, RgoInputDurationSlotProps> & {
  durationUnit?: TimeView;
  durationViews?: readonly TimeView[];
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
};
/** @deprecated Use VireoDurationInput. */
export const RgoInputDuration = React.forwardRef<HTMLInputElement, RgoInputDurationProps>(function RgoInputDuration(
  {
    disabled,
    durationUnit,
    durationViews,
    endAdornment,
    error,
    helperText,
    name,
    onBlur,
    onChange,
    rgoSlotProps,
    startAdornment,
    value,
  },
  ref,
) {
  return (
    <VireoDurationInput
      value={value}
      onChange={onChange}
      disabled={disabled}
      durationUnit={durationUnit}
      durationViews={durationViews}
      endAdornment={endAdornment}
      error={error}
      helperText={helperText}
      inputRef={ref}
      name={name}
      onBlur={onBlur}
      startAdornment={startAdornment}
      fieldProps={rgoSlotProps?.root}
    />
  );
});
