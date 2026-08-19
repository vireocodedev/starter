import { RgoLabelBox } from "@/core/public";
import { RgoInputDate, type RgoInputDateProps } from "@/components/inputs/RgoInputDate/RgoInputDate";
import React from "react";

type RgoInputDateWithDefaultPropsDemoProps = Partial<Omit<RgoInputDateProps, "value" | "onChange">>;

export function RgoInputDateWithDefaultPropsDemo(props: RgoInputDateWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDate {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputDateWithDefaultPropsDemoCode = `
import { RgoLabelBox, RgoInputDate, type RgoInputDateProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDateWithDefaultPropsDemoProps = Partial<Omit<RgoInputDateProps, "value" | "onChange">>;

export function RgoInputDateWithDefaultPropsDemo(props: RgoInputDateWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDate {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
