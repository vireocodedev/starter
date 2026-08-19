import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { TimeField, type TimeFieldProps, type TimeView } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";
import { type VireoDurationInputClassKey, getVireoDurationInputUtilityClass } from "./VireoDurationInput.classes";
import { VIREO_DURATION_INPUT_NAME, type VireoDurationInputSlotName } from "./VireoDurationInput.identity";
import { VireoDurationInputRoot } from "./VireoDurationInput.styled";
import { type VireoDurationInputOwnerState, type VireoDurationInputProps } from "./VireoDurationInput.types";

function useUtilityClasses(_ownerState: VireoDurationInputOwnerState, classes?: VireoDurationInputProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoDurationInputSlotName, VireoDurationInputClassKey>,
    getVireoDurationInputUtilityClass,
    classes,
  );
}

/**
 * Edits a numeric duration through a clock-shaped field without changing the application's unit.
 */
export const VireoDurationInput = React.forwardRef<HTMLDivElement, VireoDurationInputProps>(
  function VireoDurationInput(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_DURATION_INPUT_NAME });
    const {
      className,
      classes: classesProp,
      disabled = false,
      durationUnit = "minutes",
      durationViews = ["hours", "minutes"],
      endAdornment,
      error = false,
      fieldProps = {},
      helperText,
      inputRef,
      name,
      onBlur,
      onChange,
      slotProps = {},
      slots = {},
      startAdornment,
      style,
      sx,
      value,
      ...other
    } = props;

    const ownerState: VireoDurationInputOwnerState = { disabled, error, hasValue: value !== null };
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

    const durationToDayjs = (duration: number): Dayjs => {
      if (durationUnit === "hours")
        return dayjs()
          .hour(Math.floor(duration))
          .minute((duration - Math.floor(duration)) * 60)
          .second(0);
      if (durationUnit === "seconds")
        return dayjs()
          .hour(Math.floor(duration / 3600))
          .minute(Math.floor((duration % 3600) / 60))
          .second(duration % 60);
      return dayjs()
        .hour(Math.floor(duration / 60))
        .minute(duration % 60)
        .second(0);
    };
    const dayjsToDuration = (nextValue: Dayjs): number => {
      const seconds = nextValue.hour() * 3600 + nextValue.minute() * 60 + nextValue.second();
      return durationUnit === "hours" ? seconds / 3600 : durationUnit === "seconds" ? seconds : seconds / 60;
    };
    const format = durationViews
      .filter((view): view is TimeView => ["hours", "minutes", "seconds"].includes(view))
      .map(view => (view === "hours" ? "HH" : view === "minutes" ? "mm" : "ss"))
      .join(":");
    const handleChange: TimeFieldProps<Dayjs>["onChange"] = nextValue =>
      onChange(nextValue?.isValid() ? dayjsToDuration(nextValue) : null);
    const { slotProps: fieldSlotProps, ...fieldOther } = fieldProps;
    const textFieldProps = fieldSlotProps?.textField;

    return (
      <VireoDurationInputRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <TimeField
          {...fieldOther}
          disabled={disabled}
          format={format}
          ampm={false}
          inputRef={inputRef}
          value={typeof value === "number" ? durationToDayjs(value) : null}
          onChange={handleChange}
          slotProps={{
            ...fieldSlotProps,
            textField: fieldOwnerState => ({
              ...(typeof textFieldProps === "function" ? textFieldProps(fieldOwnerState) : textFieldProps),
              error,
              helperText,
              fullWidth: true,
              name,
              onBlur,
              InputProps: {
                ...(typeof textFieldProps === "function"
                  ? textFieldProps(fieldOwnerState).InputProps
                  : textFieldProps?.InputProps),
                ...(startAdornment !== undefined ? { startAdornment } : {}),
                ...(endAdornment !== undefined ? { endAdornment } : {}),
              },
            }),
          }}
        />
      </VireoDurationInputRoot>
    );
  },
);

VireoDurationInput.displayName = VIREO_DURATION_INPUT_NAME;
