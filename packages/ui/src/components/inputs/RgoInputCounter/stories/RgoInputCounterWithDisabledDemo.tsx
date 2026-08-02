import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputCounter, type RgoInputCounterProps } from "@/components/inputs/RgoInputCounter/RgoInputCounter";
import React from "react";

type RgoInputCounterWithDisabledDemoProps = Partial<Omit<RgoInputCounterProps, "value" | "onChange">>;

export function RgoInputCounterWithDisabledDemo(
  props: RgoInputCounterWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(5);

  return (
    <RgoLabelBox label="Quantity">
      <RgoInputCounter {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputCounterWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputCounter, type RgoInputCounterProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputCounterWithDisabledDemoProps = Partial<Omit<RgoInputCounterProps, "value" | "onChange">>;

export function RgoInputCounterWithDisabledDemo(
  props: RgoInputCounterWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(5);

  return (
    <RgoLabelBox label="Quantity">
      <RgoInputCounter {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
