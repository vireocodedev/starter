import { type RgoInputProps } from "@/utils/formutils";
import { composeSx } from "@/utils/muiutils";
import { fixedForwardRef } from "@/utils/typeutils";
import { TimeField, type TimeFieldProps, type TimePickerProps, type TimeView } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "./RgoInputDuration.css";

export type RgoInputDurationSlotProps = {
  root: Omit<TimeFieldProps<dayjs.Dayjs>, "inputRef" | "ampm" | keyof RgoInputProps>;
};

export type RgoInputDurationProps = RgoInputProps<number | null, RgoInputDurationSlotProps> & {
  durationUnit?: TimeView;
  durationViews?: readonly TimeView[];
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
};

function durationToDayJs(durationValue: number, durationUnit: TimeView): dayjs.Dayjs {
  switch (durationUnit) {
    case "hours":
      return dayjs()
        .hour(durationValue)
        .minute((durationValue - Math.floor(durationValue)) * 60);
    case "minutes":
      return dayjs()
        .hour(Math.floor(durationValue / 60))
        .minute(durationValue % 60);
    case "seconds":
      return dayjs()
        .hour(Math.floor(durationValue / 3600))
        .minute(Math.floor((durationValue % 3600) / 60))
        .second(durationValue % 60);
  }
}

function dayJsToDuration(d: dayjs.Dayjs, durationUnit: TimeView): number {
  switch (durationUnit) {
    case "hours":
      return d.get("hour") + d.get("minute") / 60 + d.get("second") / 3600;
    case "minutes":
      return d.get("hour") * 60 + d.get("minute") + d.get("second") / 60;
    case "seconds":
      return d.get("hour") * 3600 + d.get("minute") * 60 + d.get("second");
  }
}

function getFormatByTimeViews(views: readonly TimeView[]): string {
  const formatChunks: string[] = [];
  if (views.includes("hours")) formatChunks.push("HH");
  if (views.includes("minutes")) formatChunks.push("mm");
  if (views.includes("seconds")) formatChunks.push("ss");
  const format = formatChunks.join(":");
  return format;
}

function RgoInputDurationImpl(
  {
    durationUnit = "minutes",
    durationViews = ["hours", "minutes"],
    value,
    onChange,
    error,
    helperText,
    rgoSlotProps,
    startAdornment,
    endAdornment,
    ...controllerProps
  }: RgoInputDurationProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const rootProps = rgoSlotProps?.root ?? {};
  const dayjsValue = typeof value === "number" ? durationToDayJs(value, durationUnit) : null;

  const onChangeHandler: TimePickerProps<dayjs.Dayjs>["onChange"] = newValue => {
    onChange(newValue && newValue.isValid() ? dayJsToDuration(newValue, durationUnit) : null);
  };

  const format = getFormatByTimeViews(durationViews);

  return (
    <TimeField
      //views={views}
      format={format}
      ampm={false}
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
          InputProps: {
            ...(startAdornment !== undefined ? { startAdornment } : {}),
            ...(endAdornment !== undefined ? { endAdornment } : {}),
          },
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

export const RgoInputDuration = fixedForwardRef(RgoInputDurationImpl);
