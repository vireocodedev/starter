import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputDate, type RgoInputDateProps } from "@/components/inputs/RgoInputDate/RgoInputDate";
import dayjs from "dayjs";
import React from "react";

type RgoInputDateWithDisabledDemoProps = Partial<Omit<RgoInputDateProps, "value" | "onChange">>;

export function RgoInputDateWithDisabledDemo(
  props: RgoInputDateWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(dayjs().valueOf());

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDate {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputDateWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputDate, type RgoInputDateProps } from "@vireocodedev/starter-ui";
import dayjs from "dayjs";
import React from "react";

type RgoInputDateWithDisabledDemoProps = Partial<Omit<RgoInputDateProps, "value" | "onChange">>;

export function RgoInputDateWithDisabledDemo(
  props: RgoInputDateWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(dayjs().valueOf());

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDate {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
