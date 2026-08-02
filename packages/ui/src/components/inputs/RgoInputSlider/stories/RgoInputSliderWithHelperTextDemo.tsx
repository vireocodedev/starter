import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputSlider, type RgoInputSliderProps } from "@/components/inputs/RgoInputSlider/RgoInputSlider";
import React from "react";

type RgoInputSliderWithHelperTextDemoProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

export function RgoInputSliderWithHelperTextDemo(
  props: RgoInputSliderWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(50);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSlider {...props} min={0} max={100} step={1} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputSliderWithHelperTextDemoCode = `
import { RgoLabelBox, RgoInputSlider, type RgoInputSliderProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputSliderWithHelperTextDemoProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

export function RgoInputSliderWithHelperTextDemo(
  props: RgoInputSliderWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(50);

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
