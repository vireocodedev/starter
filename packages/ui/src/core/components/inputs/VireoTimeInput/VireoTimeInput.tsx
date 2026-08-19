import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { TimePicker, type TimePickerProps, type TimeView } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";
import { type VireoTimeInputClassKey, getVireoTimeInputUtilityClass } from "./VireoTimeInput.classes";
import { VIREO_TIME_INPUT_NAME, type VireoTimeInputSlotName } from "./VireoTimeInput.identity";
import { VireoTimeInputRoot } from "./VireoTimeInput.styled";
import { type VireoTimeInputOwnerState, type VireoTimeInputProps } from "./VireoTimeInput.types";

function useUtilityClasses(_ownerState: VireoTimeInputOwnerState, classes?: VireoTimeInputProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoTimeInputSlotName, VireoTimeInputClassKey>,
    getVireoTimeInputUtilityClass,
    classes,
  );
}

/**
 * Edits a time of day while preserving timestamp-based application state and optional reference-date constraints.
 */
export const VireoTimeInput = React.forwardRef<HTMLDivElement, VireoTimeInputProps>(
  function VireoTimeInput(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_TIME_INPUT_NAME });
    const {
      allowedRefDateOffsetMs,
      className,
      classes: classesProp,
      disabled = false,
      error = false,
      helperText,
      inputRef,
      name,
      onBlur,
      onChange,
      pickerProps = {},
      refDateMax,
      refDateMin,
      slotProps = {},
      slots = {},
      style,
      sx,
      value,
      ...other
    } = props;

    const ownerState: VireoTimeInputOwnerState = { disabled, error, hasValue: value !== null };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const applyConstraints = React.useCallback(
      (time: Dayjs): Dayjs => {
        let adjusted = time;
        const limited =
          typeof allowedRefDateOffsetMs === "number" &&
          Number.isFinite(allowedRefDateOffsetMs) &&
          allowedRefDateOffsetMs >= 0;
        const seconds = (input: Dayjs) => input.hour() * 3600 + input.minute() * 60 + input.second();
        if (refDateMax != null) {
          const ref = dayjs(refDateMax);
          const sameDay = ref.hour(time.hour()).minute(time.minute()).second(time.second()).millisecond(0);
          const candidate = seconds(time) >= seconds(ref) ? sameDay.subtract(1, "day") : sameDay;
          adjusted = limited && ref.diff(candidate) > allowedRefDateOffsetMs ? sameDay : candidate;
        }
        if (refDateMin != null) {
          const ref = dayjs(refDateMin);
          const sameDay = ref.hour(adjusted.hour()).minute(adjusted.minute()).second(adjusted.second()).millisecond(0);
          const candidate = seconds(adjusted) > seconds(ref) ? sameDay : sameDay.add(1, "day");
          adjusted = limited && candidate.diff(ref) > allowedRefDateOffsetMs ? sameDay : candidate;
        }
        return adjusted;
      },
      [allowedRefDateOffsetMs, refDateMax, refDateMin],
    );
    const valueRef = React.useRef(value);
    valueRef.current = value;
    const onChangeRef = React.useRef(onChange);
    onChangeRef.current = onChange;
    React.useEffect(() => {
      const current = valueRef.current;
      if (current == null) return;
      const adjusted = applyConstraints(dayjs(current)).valueOf();
      if (adjusted !== current) onChangeRef.current(adjusted);
    }, [applyConstraints]);
    const views: readonly TimeView[] = pickerProps.views ?? ["hours", "minutes"];
    const format = views.map(view => (view === "hours" ? "HH" : view === "minutes" ? "mm" : "ss")).join(":");
    const handleChange: TimePickerProps<Dayjs>["onChange"] = nextValue =>
      onChange(nextValue?.isValid() ? applyConstraints(nextValue).valueOf() : null);
    const { slotProps: pickerSlotProps, ...pickerOther } = pickerProps;
    const textFieldProps = pickerSlotProps?.textField;

    return (
      <VireoTimeInputRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <TimePicker
          {...pickerOther}
          views={views}
          format={format}
          ampm={false}
          timeSteps={{ minutes: 1 }}
          disabled={disabled}
          inputRef={inputRef}
          value={value === null ? null : dayjs(value)}
          onChange={handleChange}
          slotProps={{
            ...pickerSlotProps,
            textField: pickerOwnerState => ({
              ...(typeof textFieldProps === "function" ? textFieldProps(pickerOwnerState) : textFieldProps),
              error,
              helperText,
              fullWidth: true,
              name,
              onBlur,
            }),
          }}
        />
      </VireoTimeInputRoot>
    );
  },
);

VireoTimeInput.displayName = VIREO_TIME_INPUT_NAME;
