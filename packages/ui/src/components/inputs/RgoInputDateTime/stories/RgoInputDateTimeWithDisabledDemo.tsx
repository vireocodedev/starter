import { RgoLabelBox } from "@/core/public";
import { RgoInputDateTime, type RgoInputDateTimeProps } from "@/components/inputs/RgoInputDateTime/RgoInputDateTime";
import dayjs from "dayjs";
import React from "react";

type RgoInputDateTimeWithDisabledDemoProps = Partial<Omit<RgoInputDateTimeProps, "value" | "onChange">>;

export function RgoInputDateTimeWithDisabledDemo(
  props: RgoInputDateTimeWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(dayjs().valueOf());

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDateTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputDateTimeWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputDateTime, type RgoInputDateTimeProps } from "@vireocodedev/starter-ui";
import dayjs from "dayjs";
import React from "react";

type RgoInputDateTimeWithDisabledDemoProps = Partial<Omit<RgoInputDateTimeProps, "value" | "onChange">>;

export function RgoInputDateTimeWithDisabledDemo(
  props: RgoInputDateTimeWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(dayjs().valueOf());

  return (
    <RgoLabelBox label="Input field">
      <RgoInputDateTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
