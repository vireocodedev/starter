import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { DateTimePicker, type DateTimePickerProps } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";
import { type VireoDateTimeInputClassKey, getVireoDateTimeInputUtilityClass } from "./VireoDateTimeInput.classes";
import { VIREO_DATE_TIME_INPUT_NAME, type VireoDateTimeInputSlotName } from "./VireoDateTimeInput.identity";
import { VireoDateTimeInputRoot } from "./VireoDateTimeInput.styled";
import { type VireoDateTimeInputOwnerState, type VireoDateTimeInputProps } from "./VireoDateTimeInput.types";

function useUtilityClasses(_ownerState: VireoDateTimeInputOwnerState, classes?: VireoDateTimeInputProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoDateTimeInputSlotName, VireoDateTimeInputClassKey>,
    getVireoDateTimeInputUtilityClass,
    classes,
  );
}

/**
 * Edits an optional date and time while exposing the application value as a millisecond timestamp.
 */
export const VireoDateTimeInput = React.forwardRef<HTMLDivElement, VireoDateTimeInputProps>(
  function VireoDateTimeInput(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_DATE_TIME_INPUT_NAME });
    const {
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
      slotProps = {},
      slots = {},
      style,
      sx,
      value,
      ...other
    } = props;

    const ownerState: VireoDateTimeInputOwnerState = { disabled, error, hasValue: value !== null };
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

    const handleChange: DateTimePickerProps<Dayjs>["onChange"] = nextValue => {
      if (!nextValue || !nextValue.isValid()) {
        onChange(null);
        return;
      }
      let normalizedValue = nextValue;
      if (nextValue.hour() === 0 && nextValue.minute() === 0 && nextValue.second() === 0) {
        const now = dayjs();
        normalizedValue = nextValue.hour(now.hour()).minute(now.minute()).second(now.second());
      }
      onChange(normalizedValue.valueOf());
    };
    const { slotProps: pickerSlotProps, ...pickerOther } = pickerProps;
    const pickerTextFieldProps = pickerSlotProps?.textField;

    return (
      <VireoDateTimeInputRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <DateTimePicker
          {...pickerOther}
          disabled={disabled}
          inputRef={inputRef}
          value={value === null ? null : dayjs(value)}
          onChange={handleChange}
          slotProps={{
            ...pickerSlotProps,
            textField: pickerOwnerState => ({
              ...(typeof pickerTextFieldProps === "function"
                ? pickerTextFieldProps(pickerOwnerState)
                : pickerTextFieldProps),
              error,
              helperText,
              fullWidth: true,
              name,
              onBlur,
            }),
          }}
        />
      </VireoDateTimeInputRoot>
    );
  },
);

VireoDateTimeInput.displayName = VIREO_DATE_TIME_INPUT_NAME;
