import { RgoLabelBox } from "@/core/public";
import { RgoInputText, type RgoInputTextProps } from "@/components/inputs/RgoInputText/RgoInputText";
import React from "react";

type RgoInputTextWithErrorDemoProps = Partial<Omit<RgoInputTextProps, "value" | "onChange">>;

export function RgoInputTextWithErrorDemo(
  props: RgoInputTextWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputText {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputTextWithErrorDemoCode = `
import { RgoLabelBox, RgoInputText, type RgoInputTextProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputTextWithErrorDemoProps = Partial<Omit<RgoInputTextProps, "value" | "onChange">>;

export function RgoInputTextWithErrorDemo(
  props: RgoInputTextWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputText {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
