import { getTimestamp } from "@/utils/date";
import { type RgoInputProps } from "@/utils/formutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { DatePicker, type DatePickerProps } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";
import "./RgoInputDate.css";

export type RgoInputDateSlotProps = {
  root: Omit<DatePickerProps<Dayjs>, "inputRef" | keyof RgoInputProps>;
};

export type RgoInputDateProps = RgoInputProps<number | null, RgoInputDateSlotProps>;

function RgoInputDateImpl(
  { value, onChange, error, helperText, rgoSlotProps, ...controllerProps }: RgoInputDateProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const rootProps = rgoSlotProps?.root ?? {};
  const dayjsValue = typeof value === "number" ? dayjs(value) : null;

  const onChangeHandler: DatePickerProps<Dayjs>["onChange"] = newValue => {
    if (newValue) {
      // Check if time is at midnight (default) — adjust conditions as needed
      const isFirstInputViaDatePicker = newValue.hour() === 0 && newValue.minute() === 0 && newValue.second() === 0;
      if (isFirstInputViaDatePicker) {
        const now = dayjs();
        newValue = newValue.hour(now.hour()).minute(now.minute()).second(now.second());
      }
    }

    onChange(getTimestamp(newValue));
  };

  return (
    <DatePicker
      {...rootProps}
      {...controllerProps}
      inputRef={ref}
      value={dayjsValue}
      onChange={onChangeHandler}
      slotProps={{
        ...(rootProps.slotProps ?? {}),
        textField: {
          ...(rootProps.slotProps?.textField ?? {}),
          error,
          helperText,
        },
      }}
    />
  );
}

export const RgoInputDate = fixedForwardRef(RgoInputDateImpl);
