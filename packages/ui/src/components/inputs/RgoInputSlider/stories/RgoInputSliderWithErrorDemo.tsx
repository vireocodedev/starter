import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputSlider, type RgoInputSliderProps } from "@/components/inputs/RgoInputSlider/RgoInputSlider";
import React from "react";

type RgoInputSliderWithErrorDemoProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

export function RgoInputSliderWithErrorDemo(
  props: RgoInputSliderWithErrorDemoProps = {
    error: true,
    helperText: "Oops, there seems to be an error",
  },
) {
  const [value, setValue] = React.useState<number | null>(25);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSlider {...props} min={0} max={100} step={1} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputSliderWithErrorDemoCode = `
import { RgoLabelBox, RgoInputSlider, type RgoInputSliderProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputSliderWithErrorDemoProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

export function RgoInputSliderWithErrorDemo(
  props: RgoInputSliderWithErrorDemoProps = {
    error: true,
    helperText: "Oops, there seems to be an error",
  },
) {
  const [value, setValue] = React.useState<number | null>(25);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSlider 
        {...props} 
        min={0}
        max={100}
        step={1}
        value={value} 
        onChange={setValue} 
      />
    </RgoLabelBox>
  );
}`;
