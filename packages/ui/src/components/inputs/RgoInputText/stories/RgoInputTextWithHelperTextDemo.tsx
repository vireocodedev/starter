import { RgoLabelBox } from "@/core/public";
import { RgoInputText, type RgoInputTextProps } from "@/components/inputs/RgoInputText/RgoInputText";
import React from "react";

type RgoInputTextWithHelperTextDemoProps = Partial<Omit<RgoInputTextProps, "value" | "onChange">>;

export function RgoInputTextWithHelperTextDemo(
  props: RgoInputTextWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputText {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputTextWithHelperTextDemoCode = `
import { RgoLabelBox, RgoInputText, type RgoInputTextProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputTextWithHelperTextDemoProps = Partial<Omit<RgoInputTextProps, "value" | "onChange">>;

export function RgoInputTextWithHelperTextDemo(
  props: RgoInputTextWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputText {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
