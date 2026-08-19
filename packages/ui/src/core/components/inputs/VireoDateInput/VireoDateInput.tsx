import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { DatePicker, type DatePickerProps } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";
import { type VireoDateInputClassKey, getVireoDateInputUtilityClass } from "./VireoDateInput.classes";
import { VIREO_DATE_INPUT_NAME, type VireoDateInputSlotName } from "./VireoDateInput.identity";
import { VireoDateInputRoot } from "./VireoDateInput.styled";
import { type VireoDateInputOwnerState, type VireoDateInputProps } from "./VireoDateInput.types";

function useUtilityClasses(_ownerState: VireoDateInputOwnerState, classes?: VireoDateInputProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoDateInputSlotName, VireoDateInputClassKey>,
    getVireoDateInputUtilityClass,
    classes,
  );
}

/**
 * Edits an optional date while exposing the application value as a millisecond timestamp.
 */
export const VireoDateInput = React.forwardRef<HTMLDivElement, VireoDateInputProps>(
  function VireoDateInput(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_DATE_INPUT_NAME });
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

    const ownerState: VireoDateInputOwnerState = { disabled, error, hasValue: value !== null };
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

    const handleChange: DatePickerProps<Dayjs>["onChange"] = nextValue => {
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
      <VireoDateInputRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <DatePicker
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
      </VireoDateInputRoot>
    );
  },
);

VireoDateInput.displayName = VIREO_DATE_INPUT_NAME;
