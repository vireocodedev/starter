import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputNumber, type RgoInputNumberProps } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import React from "react";

type RgoInputNumberWithHelperTextDemoProps = Partial<Omit<RgoInputNumberProps, "value" | "onChange">>;

export function RgoInputNumberWithHelperTextDemo(
  props: RgoInputNumberWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputNumber {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputNumberWithHelperTextDemoCode = `
import { RgoLabelBox, RgoInputNumber, type RgoInputNumberProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputNumberWithHelperTextDemoProps = Partial<Omit<RgoInputNumberProps, "value" | "onChange">>;

export function RgoInputNumberWithHelperTextDemo(
  props: RgoInputNumberWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputNumber {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
