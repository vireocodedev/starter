import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { InputAdornment, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { getVireoSliderInputUtilityClass, type VireoSliderInputClassKey } from "./VireoSliderInput.classes";
import { VIREO_SLIDER_INPUT_NAME, type VireoSliderInputSlotName } from "./VireoSliderInput.identity";
import {
  VireoSliderInputHelperText,
  VireoSliderInputNumberInput,
  VireoSliderInputRoot,
  VireoSliderInputSlider,
  VireoSliderInputSliderIcon,
} from "./VireoSliderInput.styled";
import type { VireoSliderInputProps } from "./VireoSliderInput.types";
function useUtilityClasses(classes?: VireoSliderInputProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      sliderIcon: ["sliderIcon"],
      slider: ["slider"],
      numberInput: ["numberInput"],
      helperText: ["helperText"],
    } as const satisfies UtilityClassSlotMap<VireoSliderInputSlotName, VireoSliderInputClassKey>,
    getVireoSliderInputUtilityClass,
    classes,
  );
}
/** Controlled numeric field combining continuous slider adjustment with precise direct entry. */
export const VireoSliderInput = React.forwardRef<HTMLDivElement, VireoSliderInputProps>(
  function VireoSliderInput(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_SLIDER_INPUT_NAME });
    const {
      className,
      classes: classesProp,
      disabled = false,
      error = false,
      helperText,
      max,
      min,
      numberInputIcon,
      numberInputMaxWidth = 80,
      onChange,
      size = "medium",
      sliderInputIcon,
      slotProps = {},
      slots = {},
      step,
      style,
      sx,
      value,
      ...other
    } = props;
    const numericValue = value ?? min;
    const ownerState = { disabled, error, value: numericValue };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const icon = resolveSlotProps(slotProps.sliderIcon, ownerState);
    const slider = resolveSlotProps(slotProps.slider, ownerState);
    const input = resolveSlotProps(slotProps.numberInput, ownerState);
    const helper = resolveSlotProps(slotProps.helperText, ownerState);
    const { className: rootClassName, ref: rootRef, style: rootStyle, sx: rootSx, ...rootOther } = root;
    const { className: iconClassName, ...iconOther } = icon;
    const { className: sliderClassName, ...sliderOther } = slider;
    const { className: inputClassName, slotProps: inputMuiSlots, sx: inputSx, ...inputOther } = input;
    const { className: helperClassName, ...helperOther } = helper;
    const ref = useForkRef(forwardedRef, rootRef);
    const SliderIcon = slots.sliderIcon ?? VireoSliderInputSliderIcon;
    const Slider = slots.slider ?? VireoSliderInputSlider;
    const NumberInput = slots.numberInput ?? VireoSliderInputNumberInput;
    const HelperText = slots.helperText ?? VireoSliderInputHelperText;
    const clamp = (next: number) => Math.min(max, Math.max(min, next));
    return (
      <VireoSliderInputRoot
        {...other}
        {...rootOther}
        as={slots.root}
        ref={ref}
        ownerState={ownerState}
        error={error}
        disabled={disabled}
        className={joinClassNames(classes.root, className, rootClassName)}
        style={{ ...style, ...rootStyle }}
        sx={mergeSx(sx, rootSx)}
      >
        {sliderInputIcon !== undefined && (
          <SliderIcon
            {...iconOther}
            ownerState={ownerState}
            className={joinClassNames(classes.sliderIcon, iconClassName)}
          >
            {sliderInputIcon}
          </SliderIcon>
        )}
        <Slider
          {...sliderOther}
          ownerState={ownerState}
          className={joinClassNames(classes.slider, sliderClassName)}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={(_event: Event, next: number | number[]) => onChange(next as number)}
        />
        <NumberInput
          {...inputOther}
          ownerState={ownerState}
          className={joinClassNames(classes.numberInput, inputClassName)}
          disabled={disabled}
          error={error}
          type="number"
          size={size}
          value={value ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const next = event.target.value;
            onChange(next === "" ? null : clamp(Number(next)));
          }}
          onBlur={() => value !== null && onChange(clamp(value))}
          slotProps={{
            ...inputMuiSlots,
            input: {
              ...inputMuiSlots?.input,
              endAdornment:
                numberInputIcon === undefined ? undefined : (
                  <InputAdornment position="end">{numberInputIcon}</InputAdornment>
                ),
            },
          }}
          sx={mergeSx({ maxWidth: Math.max(80, numberInputMaxWidth), "& input": { pr: 0 } }, inputSx)}
        />
        {helperText !== undefined && (
          <HelperText
            {...helperOther}
            ownerState={ownerState}
            className={joinClassNames(classes.helperText, helperClassName)}
            error={error}
          >
            {helperText}
          </HelperText>
        )}
      </VireoSliderInputRoot>
    );
  },
);
VireoSliderInput.displayName = VIREO_SLIDER_INPUT_NAME;
