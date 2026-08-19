import { RgoLabelBox } from "@/core/public";
import { RgoInputPassword, type RgoInputPasswordProps } from "@/components/inputs/RgoInputPassword/RgoInputPassword";
import React from "react";

type RgoInputPasswordWithErrorDemoProps = Partial<Omit<RgoInputPasswordProps, "value" | "onChange">>;

export function RgoInputPasswordWithErrorDemo(
  props: RgoInputPasswordWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field" required>
      <RgoInputPassword {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputPasswordWithErrorDemoCode = `
import { RgoLabelBox, RgoInputPassword, type RgoInputPasswordProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputPasswordWithErrorDemoProps = Partial<Omit<RgoInputPasswordProps, "value" | "onChange">>;

export function RgoInputPasswordWithErrorDemo(
  props: RgoInputPasswordWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field" required>
      <RgoInputPassword {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
