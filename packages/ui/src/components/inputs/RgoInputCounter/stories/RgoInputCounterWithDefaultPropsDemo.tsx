import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputCounter, type RgoInputCounterProps } from "@/components/inputs/RgoInputCounter/RgoInputCounter";
import React from "react";

type RgoInputCounterWithDefaultPropsDemoProps = Partial<Omit<RgoInputCounterProps, "value" | "onChange">>;

export function RgoInputCounterWithDefaultPropsDemo(props: RgoInputCounterWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(1);

  return (
    <RgoLabelBox label="Quantity">
      <RgoInputCounter {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputCounterWithDefaultPropsDemoCode = `
import { RgoLabelBox, RgoInputCounter, type RgoInputCounterProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputCounterWithDefaultPropsDemoProps = Partial<Omit<RgoInputCounterProps, "value" | "onChange">>;

export function RgoInputCounterWithDefaultPropsDemo(props: RgoInputCounterWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(1);

  return (
    <RgoLabelBox label="Quantity">
      <RgoInputCounter {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
