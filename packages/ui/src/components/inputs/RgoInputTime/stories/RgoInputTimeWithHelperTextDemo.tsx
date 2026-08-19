import { RgoLabelBox } from "@/core/public";
import { RgoInputTime, type RgoInputTimeProps } from "@/components/inputs/RgoInputTime/RgoInputTime";
import React from "react";

type RgoInputTimeWithHelperTextDemoProps = Partial<Omit<RgoInputTimeProps, "value" | "onChange">>;

export function RgoInputTimeWithHelperTextDemo(
  props: RgoInputTimeWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Time">
      <RgoInputTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputTimeWithHelperTextDemoCode = `
import { RgoLabelBox, RgoInputTime, type RgoInputTimeProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputTimeWithHelperTextDemoProps = Partial<Omit<RgoInputTimeProps, "value" | "onChange">>;

export function RgoInputTimeWithHelperTextDemo(
  props: RgoInputTimeWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Time">
      <RgoInputTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
