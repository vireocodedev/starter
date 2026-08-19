import { RgoLabelBox } from "@/core/public";
import { RgoInputText, type RgoInputTextProps } from "@/components/inputs/RgoInputText/RgoInputText";
import React from "react";

type RgoInputTextWithDisabledDemoProps = Partial<Omit<RgoInputTextProps, "value" | "onChange">>;

export function RgoInputTextWithDisabledDemo(
  props: RgoInputTextWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<string | null>("Sample disabled text");

  return (
    <RgoLabelBox label="Input field">
      <RgoInputText {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputTextWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputText, type RgoInputTextProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputTextWithDisabledDemoProps = Partial<Omit<RgoInputTextProps, "value" | "onChange">>;

export function RgoInputTextWithDisabledDemo(
  props: RgoInputTextWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<string | null>("Sample disabled text");

  return (
    <RgoLabelBox label="Input field">
      <RgoInputText {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
