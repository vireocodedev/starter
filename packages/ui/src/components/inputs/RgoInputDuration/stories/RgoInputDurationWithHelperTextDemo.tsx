import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputDuration, type RgoInputDurationProps } from "@/components/inputs/RgoInputDuration/RgoInputDuration";
import React from "react";

type RgoInputDurationWithHelperTextDemoProps = Partial<Omit<RgoInputDurationProps, "value" | "onChange">>;

export function RgoInputDurationWithHelperTextDemo(
  props: RgoInputDurationWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Duration">
      <RgoInputDuration {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputDurationWithHelperTextDemoCode = `
import { RgoLabelBox, RgoInputDuration, type RgoInputDurationProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDurationWithHelperTextDemoProps = Partial<Omit<RgoInputDurationProps, "value" | "onChange">>;

export function RgoInputDurationWithHelperTextDemo(
  props: RgoInputDurationWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Duration">
      <RgoInputDuration {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
