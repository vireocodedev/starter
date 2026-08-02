import { RgoInputNumber, type RgoInputNumberProps } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import { fixedForwardRef } from "@/utils/typeutils";
import { Add, Remove } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import React from "react";
import "./RgoInputCounter.css";

export type RgoInputCounterProps = RgoInputNumberProps;

function RgoInputCounterImpl(
  { min = 1, max = 99, disabled = false, value, ...controllerProps }: RgoInputCounterProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const handleDecrement = () => {
    const newValue = Math.max(min, (value || min) - 1);
    controllerProps.onChange?.(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, (value || min) + 1);
    controllerProps.onChange?.(newValue);
  };

  const startAdornment = !disabled ? (
    <InputAdornment position="start">
      <IconButton onClick={handleDecrement} size="small" disabled={disabled || (value || min) <= min}>
        <Remove sx={{ fontSize: 20 }} />
      </IconButton>
    </InputAdornment>
  ) : undefined;

  const endAdornment = !disabled ? (
    <InputAdornment position="end">
      <IconButton onClick={handleIncrement} size="small" disabled={disabled || (value || min) >= max}>
        <Add sx={{ fontSize: 20 }} />
      </IconButton>
    </InputAdornment>
  ) : undefined;

  return (
    <RgoInputNumber
      {...controllerProps}
      ref={ref}
      value={value}
      min={min}
      max={max}
      rgoSlotProps={{
        root: {
          sx: {
            "& input": {
              textAlign: "center",
            },
          },
          InputProps: {
            startAdornment,
            endAdornment,
            disabled,
          },
        },
      }}
    />
  );
}

export const RgoInputCounter = fixedForwardRef(RgoInputCounterImpl);
