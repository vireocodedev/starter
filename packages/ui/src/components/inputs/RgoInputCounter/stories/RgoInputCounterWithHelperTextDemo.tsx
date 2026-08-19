import { RgoLabelBox } from "@/core/public";
import { RgoInputCounter, type RgoInputCounterProps } from "@/components/inputs/RgoInputCounter/RgoInputCounter";
import React from "react";

type RgoInputCounterWithHelperTextDemoProps = Partial<Omit<RgoInputCounterProps, "value" | "onChange">>;

export function RgoInputCounterWithHelperTextDemo(props: RgoInputCounterWithHelperTextDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(1);

  return (
    <RgoLabelBox label="Quantity">
      <RgoInputCounter {...props} value={value} onChange={setValue} helperText="Select a quantity between 1 and 99" />
    </RgoLabelBox>
  );
}

export const RgoInputCounterWithHelperTextDemoCode = `
import { RgoLabelBox, RgoInputCounter, type RgoInputCounterProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputCounterWithHelperTextDemoProps = Partial<Omit<RgoInputCounterProps, "value" | "onChange">>;

export function RgoInputCounterWithHelperTextDemo(props: RgoInputCounterWithHelperTextDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(1);

  return (
    <RgoLabelBox label="Quantity">
      <RgoInputCounter {...props} value={value} onChange={setValue} helperText="Select a quantity between 1 and 99" />
    </RgoLabelBox>
  );
}`;
