import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { Add, Remove } from "@mui/icons-material";
import { InputAdornment, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import React from "react";
import { getVireoCounterInputUtilityClass, type VireoCounterInputClassKey } from "./VireoCounterInput.classes";
import { VIREO_COUNTER_INPUT_NAME, type VireoCounterInputSlotName } from "./VireoCounterInput.identity";
import {
  VireoCounterInputDecrementButton,
  VireoCounterInputIncrementButton,
  VireoCounterInputRoot,
} from "./VireoCounterInput.styled";
import type { VireoCounterInputProps } from "./VireoCounterInput.types";
function useUtilityClasses(classes?: VireoCounterInputProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      decrementButton: ["decrementButton"],
      incrementButton: ["incrementButton"],
    } as const satisfies UtilityClassSlotMap<VireoCounterInputSlotName, VireoCounterInputClassKey>,
    getVireoCounterInputUtilityClass,
    classes,
  );
}
/** Controlled numeric stepper with direct entry and bounded increment/decrement actions. */
export const VireoCounterInput = React.forwardRef<HTMLInputElement, VireoCounterInputProps>(
  function VireoCounterInput(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: VIREO_COUNTER_INPUT_NAME });
    const {
      className,
      classes: classesProp,
      decrementLabel = "Decrease value",
      disabled = false,
      error = false,
      incrementLabel = "Increase value",
      max = 99,
      min = 1,
      onChange,
      slotProps = {},
      slots = {},
      step = 1,
      style,
      sx,
      value,
      ...other
    } = props;
    const numericValue = value ?? min;
    const ownerState = { disabled, error, atMin: numericValue <= min, atMax: numericValue >= max };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const decrement = resolveSlotProps(slotProps.decrementButton, ownerState);
    const increment = resolveSlotProps(slotProps.incrementButton, ownerState);
    const { className: rootClassName, style: rootStyle, sx: rootSx, slotProps: muiSlotProps, ...rootOther } = root;
    const { className: decrementClassName, ...decrementOther } = decrement;
    const { className: incrementClassName, ...incrementOther } = increment;
    const DecrementButton = slots.decrementButton ?? VireoCounterInputDecrementButton;
    const IncrementButton = slots.incrementButton ?? VireoCounterInputIncrementButton;
    const startAdornment = disabled ? undefined : (
      <InputAdornment position="start">
        <DecrementButton
          {...decrementOther}
          ownerState={ownerState}
          className={joinClassNames(classes.decrementButton, decrementClassName)}
          size="small"
          aria-label={decrementLabel}
          disabled={ownerState.atMin}
          onClick={() => onChange(Math.max(min, numericValue - step))}
        >
          <Remove fontSize="small" />
        </DecrementButton>
      </InputAdornment>
    );
    const endAdornment = disabled ? undefined : (
      <InputAdornment position="end">
        <IncrementButton
          {...incrementOther}
          ownerState={ownerState}
          className={joinClassNames(classes.incrementButton, incrementClassName)}
          size="small"
          aria-label={incrementLabel}
          disabled={ownerState.atMax}
          onClick={() => onChange(Math.min(max, numericValue + step))}
        >
          <Add fontSize="small" />
        </IncrementButton>
      </InputAdornment>
    );
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      if (next === "") {
        onChange(null);
        return;
      }
      const parsed = Number(next);
      if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(min, parsed)));
    };
    return (
      <VireoCounterInputRoot
        {...other}
        {...rootOther}
        as={slots.root}
        inputRef={ref}
        ownerState={ownerState}
        disabled={disabled}
        error={error}
        type="number"
        value={value ?? ""}
        onChange={handleChange}
        slotProps={{ ...muiSlotProps, input: { ...muiSlotProps?.input, startAdornment, endAdornment } }}
        className={joinClassNames(classes.root, className, rootClassName)}
        style={{ ...style, ...rootStyle }}
        sx={mergeSx(sx, rootSx)}
      />
    );
  },
);
VireoCounterInput.displayName = VIREO_COUNTER_INPUT_NAME;
