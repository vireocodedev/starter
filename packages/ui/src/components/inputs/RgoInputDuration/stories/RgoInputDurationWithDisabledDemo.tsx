import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputDuration, type RgoInputDurationProps } from "@/components/inputs/RgoInputDuration/RgoInputDuration";
import React from "react";

type RgoInputDurationWithDisabledDemoProps = Partial<Omit<RgoInputDurationProps, "value" | "onChange">>;

export function RgoInputDurationWithDisabledDemo(
  props: RgoInputDurationWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(90);

  return (
    <RgoLabelBox label="Duration">
      <RgoInputDuration {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputDurationWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputDuration, type RgoInputDurationProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDurationWithDisabledDemoProps = Partial<Omit<RgoInputDurationProps, "value" | "onChange">>;

export function RgoInputDurationWithDisabledDemo(
  props: RgoInputDurationWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(90);

  return (
    <RgoLabelBox label="Duration">
      <RgoInputDuration {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
