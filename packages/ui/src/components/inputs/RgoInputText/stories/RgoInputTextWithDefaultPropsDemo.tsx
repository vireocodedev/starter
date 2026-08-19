import { RgoLabelBox } from "@/core/public";
import { RgoInputText, type RgoInputTextProps } from "@/components/inputs/RgoInputText/RgoInputText";
import React from "react";

type RgoInputTextWithDefaultPropsDemoProps = Partial<Omit<RgoInputTextProps, "value" | "onChange">>;

export function RgoInputTextWithDefaultPropsDemo(props: RgoInputTextWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputText {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputTextWithDefaultPropsDemoCode = `
import { RgoLabelBox, RgoInputText, type RgoInputTextProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputTextWithDefaultPropsDemoProps = Partial<Omit<RgoInputTextProps, "value" | "onChange">>;

export function RgoInputTextWithDefaultPropsDemo(props: RgoInputTextWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputText {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
