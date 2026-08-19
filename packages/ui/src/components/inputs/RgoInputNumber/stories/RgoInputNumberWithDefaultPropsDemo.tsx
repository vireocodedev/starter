import { RgoLabelBox } from "@/core/public";
import { RgoInputNumber, type RgoInputNumberProps } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import React from "react";

type RgoInputNumberWithDefaultPropsDemoProps = Partial<Omit<RgoInputNumberProps, "value" | "onChange">>;

export function RgoInputNumberWithDefaultPropsDemo(props: RgoInputNumberWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputNumber {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputNumberWithDefaultPropsDemoCode = `
import { RgoLabelBox, RgoInputNumber, type RgoInputNumberProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputNumberWithDefaultPropsDemoProps = Partial<Omit<RgoInputNumberProps, "value" | "onChange">>;

export function RgoInputNumberWithDefaultPropsDemo(props: RgoInputNumberWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputNumber {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
