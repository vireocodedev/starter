import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputTime, type RgoInputTimeProps } from "@/components/inputs/RgoInputTime/RgoInputTime";
import dayjs from "dayjs";
import React from "react";

type RgoInputTimeWithRefDateConstraintsDemoProps = Partial<Omit<RgoInputTimeProps, "value" | "onChange">>;

export function RgoInputTimeWithRefDateConstraintsDemo(props: RgoInputTimeWithRefDateConstraintsDemoProps = {}) {
  const refDateMin = dayjs().hour(8).minute(0).second(0).valueOf();
  const refDateMax = dayjs().hour(18).minute(0).second(0).valueOf();
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Time (constrained between 08:00 and 18:00)">
      <RgoInputTime {...props} value={value} onChange={setValue} refDateMin={refDateMin} refDateMax={refDateMax} />
    </RgoLabelBox>
  );
}

export const RgoInputTimeWithRefDateConstraintsDemoCode = `
import { RgoLabelBox, RgoInputTime, type RgoInputTimeProps } from "@vireocodedev/starter-ui";
import dayjs from "dayjs";
import React from "react";

type RgoInputTimeWithRefDateConstraintsDemoProps = Partial<Omit<RgoInputTimeProps, "value" | "onChange">>;

export function RgoInputTimeWithRefDateConstraintsDemo(props: RgoInputTimeWithRefDateConstraintsDemoProps = {}) {
  const refDateMin = dayjs().hour(8).minute(0).second(0).valueOf();
  const refDateMax = dayjs().hour(18).minute(0).second(0).valueOf();
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Time (constrained between 08:00 and 18:00)">
      <RgoInputTime {...props} value={value} onChange={setValue} refDateMin={refDateMin} refDateMax={refDateMax} />
    </RgoLabelBox>
  );
}`;
