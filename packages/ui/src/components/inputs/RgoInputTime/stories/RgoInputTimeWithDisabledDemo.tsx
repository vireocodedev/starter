import { RgoLabelBox } from "@/core/public";
import { RgoInputTime, type RgoInputTimeProps } from "@/components/inputs/RgoInputTime/RgoInputTime";
import React from "react";

type RgoInputTimeWithDisabledDemoProps = Partial<Omit<RgoInputTimeProps, "value" | "onChange">>;

export function RgoInputTimeWithDisabledDemo(
  props: RgoInputTimeWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(Date.now());

  return (
    <RgoLabelBox label="Time">
      <RgoInputTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputTimeWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputTime, type RgoInputTimeProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputTimeWithDisabledDemoProps = Partial<Omit<RgoInputTimeProps, "value" | "onChange">>;

export function RgoInputTimeWithDisabledDemo(
  props: RgoInputTimeWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(Date.now());

  return (
    <RgoLabelBox label="Time">
      <RgoInputTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
