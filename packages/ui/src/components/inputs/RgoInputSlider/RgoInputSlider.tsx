import { VireoSliderInput, type VireoSliderInputProps } from "@/core/components/inputs/VireoSliderInput";
import type { FormControlProps, FormHelperTextProps, Grid2Props, SliderProps } from "@mui/material";
import React from "react";
export type RgoInputSliderSlotProps = {
  root?: Omit<FormControlProps, "children" | "error" | "size">;
  gridContainer?: Omit<Grid2Props, "children" | "container" | "ref">;
  gridSliderIconContainer?: Omit<Grid2Props, "children">;
  gridSliderContainer?: Omit<Grid2Props, "children" | "size">;
  gridNumberInputContainer?: Omit<Grid2Props, "children">;
  slider?: Omit<SliderProps, "disabled" | "max" | "min" | "onChange" | "step" | "value">;
  formHelperText?: Omit<FormHelperTextProps, "children" | "error">;
};
export type RgoInputSliderProps = Omit<VireoSliderInputProps, "slotProps" | "slots"> & {
  rgoSlotProps?: RgoInputSliderSlotProps;
};
/** @deprecated Use VireoSliderInput. */
export const RgoInputSlider = React.forwardRef<HTMLDivElement, RgoInputSliderProps>(function RgoInputSlider(
  { rgoSlotProps, ...props },
  ref,
) {
  const slotProps = {
    root: rgoSlotProps?.root,
    slider: rgoSlotProps?.slider,
    helperText: rgoSlotProps?.formHelperText,
  } as unknown as VireoSliderInputProps["slotProps"];
  return <VireoSliderInput {...props} ref={ref} slotProps={slotProps} />;
});
