import { RgoLabelBox } from "@/core/public";
import { RgoInputSlider, type RgoInputSliderProps } from "@/components/inputs/RgoInputSlider/RgoInputSlider";
import React from "react";

type RgoInputSliderWithDefaultPropsDemoProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

export function RgoInputSliderWithDefaultPropsDemo(props: RgoInputSliderWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(50);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSlider {...props} min={0} max={100} step={1} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputSliderWithDefaultPropsDemoCode = `
import { RgoLabelBox, RgoInputSlider, type RgoInputSliderProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputSliderWithDefaultPropsDemoProps = Partial<Omit<RgoInputSliderProps, "value" | "onChange">>;

export function RgoInputSliderWithDefaultPropsDemo(props: RgoInputSliderWithDefaultPropsDemoProps = {}) {
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
