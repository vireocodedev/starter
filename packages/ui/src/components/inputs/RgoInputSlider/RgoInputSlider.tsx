import { RgoInputNumber } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import { type RgoInputProps } from "@/utils/formutils";
import { fixedForwardRef } from "@/utils/typeutils";
import {
  FormControl,
  type FormControlProps,
  FormHelperText,
  type FormHelperTextProps,
  Grid2 as Grid,
  type Grid2Props,
  InputAdornment,
  Slider,
  type SliderProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import React from "react";
import "./RgoInputSlider.css";

export type RgoInputSliderSlotProps = {
  root?: Omit<FormControlProps, "children" | "error" | "size">;
  gridContainer?: Omit<Grid2Props, "children" | "container" | "ref">;
  gridSliderIconContainer?: Omit<Grid2Props, "children">;
  gridSliderContainer?: Omit<Grid2Props, "children" | "size">;
  gridNumberInputContainer?: Omit<Grid2Props, "children">;
  slider?: Omit<SliderProps, "value" | "onChange" | "disabled" | "step" | "min" | "max" | "slotProps">;
  formHelperText?: Omit<FormHelperTextProps, "children" | "error">;
};

export type RgoInputSliderProps = RgoInputProps<number | null, RgoInputSliderSlotProps> & {
  min: number;
  max: number;
  step: number;
  size?: "small" | "medium";
  sliderInputIcon?: React.ReactNode;
  numberInputIcon?: React.ReactNode;
  numberInputMaxWidth?: number;
};

function RgoInputSliderImpl(
  {
    value,
    onChange,
    error,
    helperText,
    disabled,
    min,
    max,
    step,
    size = "medium",
    sliderInputIcon,
    numberInputIcon,
    numberInputMaxWidth = 80,
    rgoSlotProps,
    ...controllerProps
  }: RgoInputSliderProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const id = React.useId();
  const rootProps = rgoSlotProps?.root ?? {};
  const gridContainerProps = rgoSlotProps?.gridContainer ?? {};
  const gridSliderIconContainerProps = rgoSlotProps?.gridSliderIconContainer ?? {};
  const gridSliderContainerProps = rgoSlotProps?.gridSliderContainer ?? {};
  const gridNumberInputContainerProps = rgoSlotProps?.gridNumberInputContainer ?? {};
  const sliderProps = rgoSlotProps?.slider ?? {};
  const formHelperTextProps = rgoSlotProps?.formHelperText ?? {};

  const numberInputVariant = "outlined";
  const sliderValue = typeof value === "number" ? value : min;
  const numberInputMaxWidthComputed = numberInputMaxWidth < 80 ? 80 : numberInputMaxWidth;

  const gridContainerSx: SxProps<Theme> = {
    alignItems: "center",
    paddingLeft: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: error ? "var(--mui-palette-error-main)" : "rgba(var(--mui-palette-common-onBackgroundChannel) / 0.23)",
    borderRadius: "var(--mui-shape-borderRadius)",
    "&:hover": {
      borderColor: error
        ? "var(--mui-palette-error-main)"
        : "rgba(var(--mui-palette-common-onBackgroundChannel) / 0.87)",
    },
    "&:active,&:focus-within, &:focus": {
      borderColor: error ? "var(--mui-palette-error-main)" : "transparent",
      outline: error ? "2px solid var(--mui-palette-error-main)" : "2px solid var(--mui-palette-primary-main)",
    },
    ...(gridContainerProps.sx || {}),
  };

  const sliderInputSx: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    ...(sliderProps.sx || {}),
  };

  const numberInputSx: SxProps<Theme> = {
    maxWidth: numberInputMaxWidthComputed,
    "& .MuiInputBase-input": {
      paddingRight: 0,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
  };

  const sliderInputIconSx: SxProps<Theme> = {
    display: "flex",
    marginLeft: "6px",
    ...(gridSliderIconContainerProps.sx || {}),
  };

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  const handleInputChange = (inputValue: number | null) => {
    onChange(inputValue);
  };

  const handleBlur = () => {
    if (value !== null) {
      if (value < min) {
        onChange(min);
      } else if (value > max) {
        onChange(max);
      }
    }
  };

  return (
    <FormControl {...controllerProps} {...rootProps} fullWidth={rootProps?.fullWidth} error={error}>
      <Grid {...gridContainerProps} ref={ref} container spacing={gridContainerProps?.spacing ?? 3} sx={gridContainerSx}>
        {sliderInputIcon && (
          <Grid {...gridSliderIconContainerProps} sx={sliderInputIconSx}>
            {sliderInputIcon}
          </Grid>
        )}

        <Grid {...gridSliderContainerProps} size="grow">
          <Slider
            {...sliderProps}
            slotProps={{ input: { id } }}
            disabled={disabled}
            step={step}
            min={min}
            max={max}
            value={sliderValue}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            sx={sliderInputSx}
          />
        </Grid>

        <Grid {...gridNumberInputContainerProps}>
          <RgoInputNumber
            disabled={disabled}
            error={error}
            value={value}
            min={min}
            max={max}
            onBlur={handleBlur}
            onChange={handleInputChange}
            rgoSlotProps={{
              root: {
                variant: numberInputVariant,
                size,
                sx: numberInputSx,
                slotProps: {
                  input: {
                    endAdornment: numberInputIcon ? (
                      <InputAdornment position="end">{numberInputIcon}</InputAdornment>
                    ) : undefined,
                  },
                },
              },
            }}
          />
        </Grid>
      </Grid>

      {helperText && (
        <FormHelperText {...formHelperTextProps} error={error}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}

export const RgoInputSlider = fixedForwardRef(RgoInputSliderImpl);
