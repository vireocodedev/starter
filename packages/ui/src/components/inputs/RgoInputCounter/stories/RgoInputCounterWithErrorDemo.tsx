import { RgoLabelBox } from "@/core/public";
import { RgoInputCounter, type RgoInputCounterProps } from "@/components/inputs/RgoInputCounter/RgoInputCounter";
import React from "react";

type RgoInputCounterWithErrorDemoProps = Partial<Omit<RgoInputCounterProps, "value" | "onChange">>;

export function RgoInputCounterWithErrorDemo(props: RgoInputCounterWithErrorDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Quantity">
      <RgoInputCounter {...props} value={value} onChange={setValue} error helperText="Quantity is required" />
    </RgoLabelBox>
  );
}

export const RgoInputCounterWithErrorDemoCode = `
import { RgoLabelBox, RgoInputCounter, type RgoInputCounterProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputCounterWithErrorDemoProps = Partial<Omit<RgoInputCounterProps, "value" | "onChange">>;

export function RgoInputCounterWithErrorDemo(props: RgoInputCounterWithErrorDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Quantity">
      <RgoInputCounter {...props} value={value} onChange={setValue} error helperText="Quantity is required" />
    </RgoLabelBox>
  );
}`;
