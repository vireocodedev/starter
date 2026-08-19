import { RgoLabelBox } from "@/core/public";
import { RgoInputDuration, type RgoInputDurationProps } from "@/components/inputs/RgoInputDuration/RgoInputDuration";
import React from "react";

type RgoInputDurationWithErrorDemoProps = Partial<Omit<RgoInputDurationProps, "value" | "onChange">>;

export function RgoInputDurationWithErrorDemo(
  props: RgoInputDurationWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Duration" required>
      <RgoInputDuration {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputDurationWithErrorDemoCode = `
import { RgoLabelBox, RgoInputDuration, type RgoInputDurationProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDurationWithErrorDemoProps = Partial<Omit<RgoInputDurationProps, "value" | "onChange">>;

export function RgoInputDurationWithErrorDemo(
  props: RgoInputDurationWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Duration" required>
      <RgoInputDuration {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
