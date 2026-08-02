import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputDate, type RgoInputDateProps } from "@/components/inputs/RgoInputDate/RgoInputDate";
import React from "react";

type RgoInputDateWithHelperTextDemoProps = Partial<Omit<RgoInputDateProps, "value" | "onChange">>;

export function RgoInputDateWithHelperTextDemo(
  props: RgoInputDateWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDate {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputDateWithHelperTextDemoCode = `
import { RgoLabelBox, RgoInputDate, type RgoInputDateProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDateWithHelperTextDemoProps = Partial<Omit<RgoInputDateProps, "value" | "onChange">>;

export function RgoInputDateWithHelperTextDemo(
  props: RgoInputDateWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDate {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
