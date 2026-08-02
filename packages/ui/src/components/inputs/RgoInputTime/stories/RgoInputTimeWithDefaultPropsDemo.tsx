import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputTime, type RgoInputTimeProps } from "@/components/inputs/RgoInputTime/RgoInputTime";
import React from "react";

type RgoInputTimeWithDefaultPropsDemoProps = Partial<Omit<RgoInputTimeProps, "value" | "onChange">>;

export function RgoInputTimeWithDefaultPropsDemo(props: RgoInputTimeWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Time">
      <RgoInputTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputTimeWithDefaultPropsDemoCode = `
import { RgoLabelBox, RgoInputTime, type RgoInputTimeProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputTimeWithDefaultPropsDemoProps = Partial<Omit<RgoInputTimeProps, "value" | "onChange">>;

export function RgoInputTimeWithDefaultPropsDemo(props: RgoInputTimeWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Time">
      <RgoInputTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
