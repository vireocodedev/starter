import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputDate, type RgoInputDateProps } from "@/components/inputs/RgoInputDate/RgoInputDate";
import React from "react";

type RgoInputDateWithErrorDemoProps = Partial<Omit<RgoInputDateProps, "value" | "onChange">>;

export function RgoInputDateWithErrorDemo(
  props: RgoInputDateWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field" required>
      <RgoInputDate {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputDateWithErrorDemoCode = `
import { RgoLabelBox, RgoInputDate, type RgoInputDateProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDateWithErrorDemoProps = Partial<Omit<RgoInputDateProps, "value" | "onChange">>;

export function RgoInputDateWithErrorDemo(
  props: RgoInputDateWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field" required>
      <RgoInputDate {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
