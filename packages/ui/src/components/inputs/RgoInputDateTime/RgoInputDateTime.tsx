import { getTimestamp } from "@/utils/date";
import { type RgoInputProps } from "@/utils/formutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { DateTimePicker, type DateTimePickerProps } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";
import "./RgoInputDateTime.css";

export type RgoInputDateTimeSlotProps = {
  root: Omit<DateTimePickerProps<Dayjs>, "inputRef" | keyof RgoInputProps>;
};

export type RgoInputDateTimeProps = RgoInputProps<number | null, RgoInputDateTimeSlotProps>;

function RgoInputDateTimeImpl(
  { value, onChange, error, helperText, rgoSlotProps, ...controllerProps }: RgoInputDateTimeProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const rootProps = rgoSlotProps?.root ?? {};
  const dayjsValue = typeof value === "number" ? dayjs(value) : null;

  const onChangeHandler: DateTimePickerProps<Dayjs>["onChange"] = newValue => {
    if (newValue) {
      // Check if time is at midnight (default) — adjust conditions as needed
      const isFirstInputViaDatePicker = newValue.hour() === 0 && newValue.minute() === 0 && newValue.second() === 0;
      if (isFirstInputViaDatePicker) {
        const now = dayjs();
        newValue = newValue.hour(now.hour()).minute(now.minute()).second(now.second());
      }
    }

    onChange?.(getTimestamp(newValue));
  };

  return (
    <DateTimePicker
      {...rootProps}
      {...controllerProps}
      inputRef={ref}
      value={dayjsValue}
      onChange={onChangeHandler}
      slotProps={{
        ...(rootProps?.slotProps ?? {}),
        textField: {
          ...(rootProps?.slotProps?.textField ?? {}),
          error,
          helperText,
        },
      }}
    />
  );
}

export const RgoInputDateTime = fixedForwardRef(RgoInputDateTimeImpl);
