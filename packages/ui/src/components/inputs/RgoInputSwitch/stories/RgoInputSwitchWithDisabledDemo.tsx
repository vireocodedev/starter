import { RgoInputSwitch, type RgoInputSwitchProps } from "@/components/inputs/RgoInputSwitch/RgoInputSwitch";
import React from "react";

type RgoInputSwitchWithDisabledDemoProps = Partial<Omit<RgoInputSwitchProps, "value" | "onChange">>;

export function RgoInputSwitchWithDisabledDemo(
  props: RgoInputSwitchWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<boolean | null>(true);

  return <RgoInputSwitch {...props} label="Toggle option" value={value} onChange={setValue} />;
}

export const RgoInputSwitchWithDisabledDemoCode = `
import { RgoInputSwitch, type RgoInputSwitchProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputSwitchWithDisabledDemoProps = Partial<Omit<RgoInputSwitchProps, "value" | "onChange">>;

export function RgoInputSwitchWithDisabledDemo(
  props: RgoInputSwitchWithDisabledDemoProps = {
    disabled: true,
  },
) {
  const [value, setValue] = React.useState<boolean | null>(true);

  return (
    <RgoInputSwitch {...props} label="Toggle option" value={value} onChange={setValue} />
  );
}`;
