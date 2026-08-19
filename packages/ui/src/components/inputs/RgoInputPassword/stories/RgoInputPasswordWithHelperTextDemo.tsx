import { RgoLabelBox } from "@/core/public";
import { RgoInputPassword, type RgoInputPasswordProps } from "@/components/inputs/RgoInputPassword/RgoInputPassword";
import React from "react";

type RgoInputPasswordWithHelperTextDemoProps = Partial<Omit<RgoInputPasswordProps, "value" | "onChange">>;

export function RgoInputPasswordWithHelperTextDemo(
  props: RgoInputPasswordWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputPassword {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputPasswordWithHelperTextDemoCode = `
import { RgoLabelBox, RgoInputPassword, type RgoInputPasswordProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputPasswordWithHelperTextDemoProps = Partial<Omit<RgoInputPasswordProps, "value" | "onChange">>;

export function RgoInputPasswordWithHelperTextDemo(
  props: RgoInputPasswordWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputPassword {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
