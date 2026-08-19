import { RgoLabelBox } from "@/core/public";
import { RgoInputNumber, type RgoInputNumberProps } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import dayjs from "dayjs";
import React from "react";

type RgoInputNumberWithDisabledDemoProps = Partial<Omit<RgoInputNumberProps, "value" | "onChange">>;

export function RgoInputNumberWithDisabledDemo(
  props: RgoInputNumberWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(dayjs().valueOf());

  return (
    <RgoLabelBox label="Input field">
      <RgoInputNumber {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}

export const RgoInputNumberWithDisabledDemoCode = `
import { RgoLabelBox, RgoInputNumber, type RgoInputNumberProps } from "@vireocodedev/starter-ui";
import dayjs from "dayjs";
import React from "react";

type RgoInputNumberWithDisabledDemoProps = Partial<Omit<RgoInputNumberProps, "value" | "onChange">>;

export function RgoInputNumberWithDisabledDemo(
  props: RgoInputNumberWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<number | null>(dayjs().valueOf());

  return (
    <RgoLabelBox label="Input field">
      <RgoInputNumber {...props} value={value} onChange={setValue} />
    </RgoLabelBox>
  );
}`;
