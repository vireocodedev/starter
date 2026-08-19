import { RgoLabelBox } from "@/core/public";
import { RgoInputNumber, type RgoInputNumberProps } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import React from "react";

type RgoInputNumberWithErrorDemoProps = Partial<Omit<RgoInputNumberProps, "value" | "onChange">>;

export function RgoInputNumberWithErrorDemo(
  props: RgoInputNumberWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field" required>
      <RgoInputNumber {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputNumberWithErrorDemoCode = `
import { RgoLabelBox, RgoInputNumber, type RgoInputNumberProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputNumberWithErrorDemoProps = Partial<Omit<RgoInputNumberProps, "value" | "onChange">>;

export function RgoInputNumberWithErrorDemo(
  props: RgoInputNumberWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field" required>
      <RgoInputNumber {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
