import { RgoLabelBox } from "@/core/public";
import { RgoInputCounter, type RgoInputCounterProps } from "@/components/inputs/RgoInputCounter/RgoInputCounter";
import React from "react";

type RgoInputCounterWithCustomRangeDemoProps = Partial<Omit<RgoInputCounterProps, "value" | "onChange">>;

export function RgoInputCounterWithCustomRangeDemo(props: RgoInputCounterWithCustomRangeDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(5);

  return (
    <RgoLabelBox label="Rating (1-10)">
      <RgoInputCounter {...props} value={value} onChange={setValue} min={1} max={10} />
    </RgoLabelBox>
  );
}

export const RgoInputCounterWithCustomRangeDemoCode = `
import { RgoLabelBox, RgoInputCounter, type RgoInputCounterProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputCounterWithCustomRangeDemoProps = Partial<Omit<RgoInputCounterProps, "value" | "onChange">>;

export function RgoInputCounterWithCustomRangeDemo(props: RgoInputCounterWithCustomRangeDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(5);

  return (
    <RgoLabelBox label="Rating (1-10)">
      <RgoInputCounter {...props} value={value} onChange={setValue} min={1} max={10} />
    </RgoLabelBox>
  );
}`;
