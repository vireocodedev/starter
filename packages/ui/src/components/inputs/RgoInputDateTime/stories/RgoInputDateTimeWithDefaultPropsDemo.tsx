import { RgoLabelBox } from "@/core/public";
import { RgoInputDateTime, type RgoInputDateTimeProps } from "@/components/inputs/RgoInputDateTime/RgoInputDateTime";
import React from "react";

type RgoInputDateTimeWithDefaultPropsDemoProps = Partial<Omit<RgoInputDateTimeProps, "value" | "onChange">>;

export function RgoInputDateTimeWithDefaultPropsDemo(props: RgoInputDateTimeWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDateTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputDateTimeWithDefaultPropsDemoCode = `
import { RgoLabelBox, RgoInputDateTime, type RgoInputDateTimeProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDateTimeWithDefaultPropsDemoProps = Partial<Omit<RgoInputDateTimeProps, "value" | "onChange">>;

export function RgoInputDateTimeWithDefaultPropsDemo(props: RgoInputDateTimeWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDateTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
