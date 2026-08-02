import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputTime, type RgoInputTimeProps } from "@/components/inputs/RgoInputTime/RgoInputTime";
import React from "react";

type RgoInputTimeWithErrorDemoProps = Partial<Omit<RgoInputTimeProps, "value" | "onChange">>;

export function RgoInputTimeWithErrorDemo(
  props: RgoInputTimeWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Time" required>
      <RgoInputTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputTimeWithErrorDemoCode = `
import { RgoLabelBox, RgoInputTime, type RgoInputTimeProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputTimeWithErrorDemoProps = Partial<Omit<RgoInputTimeProps, "value" | "onChange">>;

export function RgoInputTimeWithErrorDemo(
  props: RgoInputTimeWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Time" required>
      <RgoInputTime {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
