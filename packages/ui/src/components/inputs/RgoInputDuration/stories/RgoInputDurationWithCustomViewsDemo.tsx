import { RgoLabelBox } from "@/core/public";
import { RgoInputDuration, type RgoInputDurationProps } from "@/components/inputs/RgoInputDuration/RgoInputDuration";
import React from "react";

type RgoInputDurationWithCustomViewsDemoProps = Partial<Omit<RgoInputDurationProps, "value" | "onChange">>;

export function RgoInputDurationWithCustomViewsDemo(props: RgoInputDurationWithCustomViewsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Duration (HH:MM:SS)">
      <RgoInputDuration
        {...props}
        value={value}
        onChange={setValue}
        durationUnit="seconds"
        durationViews={["hours", "minutes", "seconds"]}
      />
    </RgoLabelBox>
  );
}

export const RgoInputDurationWithCustomViewsDemoCode = `
import { RgoLabelBox, RgoInputDuration, type RgoInputDurationProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputDurationWithCustomViewsDemoProps = Partial<Omit<RgoInputDurationProps, "value" | "onChange">>;

export function RgoInputDurationWithCustomViewsDemo(props: RgoInputDurationWithCustomViewsDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Duration (HH:MM:SS)">
      <RgoInputDuration
        {...props}
        value={value}
        onChange={setValue}
        durationUnit="seconds"
        durationViews={["hours", "minutes", "seconds"]}
      />
    </RgoLabelBox>
  );
}`;
