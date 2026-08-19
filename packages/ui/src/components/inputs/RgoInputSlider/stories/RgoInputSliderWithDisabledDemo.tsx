import { RgoLabelBox } from "@/core/public";
import { RgoInputSlider, type RgoInputSliderProps } from "@/components/inputs/RgoInputSlider/RgoInputSlider";
import React from "react";

type RgoInputSliderWithDisabledDemoProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

export function RgoInputSliderWithDisabledDemo(
  props: RgoInputSliderWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(50);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSlider {...props} min={0} max={100} step={1} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputSliderWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputSlider, type RgoInputSliderProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputSliderWithDisabledDemoProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

export function RgoInputSliderWithDisabledDemo(
  props: RgoInputSliderWithDisabledDemoProps = {
    disabled: true,
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
