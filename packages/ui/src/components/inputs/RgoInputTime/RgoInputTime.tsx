import { getTimestamp } from "@/utils/date";
import { type RgoInputProps } from "@/utils/formutils";
import { composeSx } from "@/utils/muiutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { type TimePickerProps, type TimeView } from "@mui/x-date-pickers";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import "./RgoInputTime.css";

export type RgoInputTimeSlotProps = {
  root: Omit<TimePickerProps<dayjs.Dayjs>, "inputRef" | "format" | "ampm" | keyof RgoInputProps>;
};

export type RgoInputTimeProps = RgoInputProps<number | null, RgoInputTimeSlotProps> & {
  /**
   * Timestamp of a reference upper-bound datetime.
   * When provided, the resolved value will always be strictly before this datetime.
   * The date part is auto-corrected: if the entered time is >= refDateMax's time the
   * date is set to one day before refDateMax; otherwise the date is kept equal to
   * refDateMax's date.
   */
  refDateMax?: number | null;
  /**
   * Timestamp of a reference lower-bound datetime.
   * When provided, the resolved value will always be strictly after this datetime.
   * The date part is auto-corrected: if the entered time is > refDateMin's time the
   * date is kept equal to refDateMin's date; otherwise the date is set to one day
   * after refDateMin.
   */
  refDateMin?: number | null;
  /**
   * Maximum allowed offset (in milliseconds) when auto-adjusting the date part
   * around refDateMin/refDateMax.
   *
   * Example with refDateMin=23:30 and entered time=01:00:
   * - if offset >= 1h30m, date can be shifted to next day
   * - if offset < 1h30m, date is kept on ref day (so validation can surface)
   */
  allowedRefDateOffsetMs?: number | null;
};

function getFormatByTimeViews(views: readonly TimeView[]): string {
  const formatChunks: string[] = [];
  if (views.includes("hours")) formatChunks.push("HH");
  if (views.includes("minutes")) formatChunks.push("mm");
  if (views.includes("seconds")) formatChunks.push("ss");
  const format = formatChunks.join(":");
  return format;
}

/** Returns the total number of seconds elapsed since midnight for the given dayjs value. */
function timeOfDaySeconds(d: dayjs.Dayjs): number {
  return d.hour() * 3600 + d.minute() * 60 + d.second();
}

/**
 * Applies refDateMax / refDateMin constraints to a valid dayjs time value and
 * returns the date-corrected dayjs. The input is expected to be valid.
 */
function applyRefConstraints(
  time: dayjs.Dayjs,
  refDateMax: number | null | undefined,
  refDateMin: number | null | undefined,
  allowedRefDateOffsetMs: number | null | undefined,
): dayjs.Dayjs {
  let adjusted = time;

  const canApplyOffsetLimit =
    typeof allowedRefDateOffsetMs === "number" &&
    Number.isFinite(allowedRefDateOffsetMs) &&
    allowedRefDateOffsetMs >= 0;

  if (refDateMax != null) {
    const refMax = dayjs(refDateMax);
    const sameDayCandidate = refMax.hour(time.hour()).minute(time.minute()).second(time.second()).millisecond(0);
    if (timeOfDaySeconds(time) >= timeOfDaySeconds(refMax)) {
      const previousDayCandidate = sameDayCandidate.subtract(1, "day");
      if (canApplyOffsetLimit && refMax.diff(previousDayCandidate, "millisecond") > allowedRefDateOffsetMs) {
        adjusted = sameDayCandidate;
      } else {
        adjusted = previousDayCandidate;
      }
    } else {
      adjusted = sameDayCandidate;
    }
  }

  if (refDateMin != null) {
    const refMin = dayjs(refDateMin);
    const sameDayCandidate = refMin
      .hour(adjusted.hour())
      .minute(adjusted.minute())
      .second(adjusted.second())
      .millisecond(0);
    if (timeOfDaySeconds(adjusted) > timeOfDaySeconds(refMin)) {
      adjusted = sameDayCandidate;
    } else {
      const nextDayCandidate = sameDayCandidate.add(1, "day");
      if (canApplyOffsetLimit && nextDayCandidate.diff(refMin, "millisecond") > allowedRefDateOffsetMs) {
        adjusted = sameDayCandidate;
      } else {
        adjusted = nextDayCandidate;
      }
    }
  }

  return adjusted;
}

function RgoInputTimeImpl(
  {
    value,
    onChange,
    error,
    helperText,
    rgoSlotProps,
    refDateMax,
    refDateMin,
    allowedRefDateOffsetMs,
    ...controllerProps
  }: RgoInputTimeProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const rootProps = rgoSlotProps?.root ?? {};
  const dayjsValue = typeof value === "number" ? dayjs(value) : null;

  // Keep stable refs to the latest value/onChange so the effect below can read
  // them without adding them to its dependency array.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // When a ref date changes, re-apply constraints to the current value.
  useEffect(() => {
    const currentValue = valueRef.current;
    if (currentValue == null) return;
    const current = dayjs(currentValue);
    if (!current.isValid()) return;
    const adjusted = applyRefConstraints(current, refDateMax, refDateMin, allowedRefDateOffsetMs);
    const adjustedTs = getTimestamp(adjusted);
    if (adjustedTs !== currentValue) {
      onChangeRef.current(adjustedTs);
    }
  }, [refDateMax, refDateMin, allowedRefDateOffsetMs]);

  const onChangeHandler: TimePickerProps<dayjs.Dayjs>["onChange"] = newValue => {
    if (!newValue || !newValue.isValid()) {
      onChange(null);
      return;
    }
    onChange(getTimestamp(applyRefConstraints(newValue, refDateMax, refDateMin, allowedRefDateOffsetMs)));
  };

  const views: readonly TimeView[] = rootProps.views ?? ["hours", "minutes"];
  const format = getFormatByTimeViews(views);

  return (
    <TimePicker
      views={views}
      format={format}
      ampm={false}
      timeSteps={{ minutes: 1 }}
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
      sx={composeSx(rootProps.sx, {
        "& .MuiInputBase-root": {
          paddingRight: 0,
        },

        "& .MuiInputBase-input": {
          paddingRight: 0,
        },

        "& .MuiInputAdornment-positionEnd": {
          marginLeft: 0,
          marginRight: "4px",
        },

        "& .MuiInputAdornment-positionEnd > .MuiIconButton-root": {
          marginRight: 0,
        },
      })}
    />
  );
}

export const RgoInputTime = fixedForwardRef(RgoInputTimeImpl);
