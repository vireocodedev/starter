import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputPassword, type RgoInputPasswordProps } from "@/components/inputs/RgoInputPassword/RgoInputPassword";
import React from "react";

type RgoInputPasswordWithDefaultPropsDemoProps = Partial<Omit<RgoInputPasswordProps, "value" | "onChange">>;

export function RgoInputPasswordWithDefaultPropsDemo(props: RgoInputPasswordWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputPassword {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputPasswordWithDefaultPropsDemoCode = `
import { RgoLabelBox, RgoInputPassword, type RgoInputPasswordProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputPasswordWithDefaultPropsDemoProps = Partial<Omit<RgoInputPasswordProps, "value" | "onChange">>;

export function RgoInputPasswordWithDefaultPropsDemo(props: RgoInputPasswordWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputPassword {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
