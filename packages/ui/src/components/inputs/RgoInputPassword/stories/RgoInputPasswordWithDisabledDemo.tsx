import { RgoLabelBox } from "@/core/public";
import { RgoInputPassword, type RgoInputPasswordProps } from "@/components/inputs/RgoInputPassword/RgoInputPassword";
import React from "react";

type RgoInputPasswordWithDisabledDemoProps = Partial<Omit<RgoInputPasswordProps, "value" | "onChange">>;

export function RgoInputPasswordWithDisabledDemo(
  props: RgoInputPasswordWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<string | null>("example123");

  return (
    <RgoLabelBox label="Input field">
      <RgoInputPassword {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputPasswordWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputPassword, type RgoInputPasswordProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputPasswordWithDisabledDemoProps = Partial<Omit<RgoInputPasswordProps, "value" | "onChange">>;

export function RgoInputPasswordWithDisabledDemo(
  props: RgoInputPasswordWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<string | null>("example123");

  return (
    <RgoLabelBox label="Input field">
      <RgoInputPassword {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
