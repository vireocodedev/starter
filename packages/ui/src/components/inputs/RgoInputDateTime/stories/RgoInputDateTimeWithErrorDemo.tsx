import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputDateTime, type RgoInputDateTimeProps } from "@/components/inputs/RgoInputDateTime/RgoInputDateTime";
import React from "react";

type RgoInputDateTimeWithErrorDemoProps = Partial<Omit<RgoInputDateTimeProps, "value" | "onChange">>;

export function RgoInputDateTimeWithErrorDemo(
  props: RgoInputDateTimeWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field" required>
      <RgoInputDateTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputDateTimeWithErrorDemoCode = `
import { RgoLabelBox, RgoInputDateTime, type RgoInputDateTimeProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDateTimeWithErrorDemoProps = Partial<Omit<RgoInputDateTimeProps, "value" | "onChange">>;

export function RgoInputDateTimeWithErrorDemo(
  props: RgoInputDateTimeWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field" required>
      <RgoInputDateTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
