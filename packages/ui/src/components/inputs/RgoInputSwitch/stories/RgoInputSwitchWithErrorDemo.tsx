import { RgoInputSwitch, type RgoInputSwitchProps } from "@/components/inputs/RgoInputSwitch/RgoInputSwitch";
import React from "react";

type RgoInputSwitchWithErrorDemoProps = Partial<Omit<RgoInputSwitchProps, "value" | "onChange">>;

export function RgoInputSwitchWithErrorDemo(
  props: RgoInputSwitchWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<boolean | null>(null);

  return <RgoInputSwitch {...props} label="Toggle option" value={value} onChange={setValue} />;
}

export const RgoInputSwitchWithErrorDemoCode = `
import { RgoInputSwitch, type RgoInputSwitchProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputSwitchWithErrorDemoProps = Partial<Omit<RgoInputSwitchProps, "value" | "onChange">>;

export function RgoInputSwitchWithErrorDemo(
  props: RgoInputSwitchWithErrorDemoProps = {
    error: true,
  },
) {
  const [value, setValue] = React.useState<boolean | null>(null);

  return (
    <RgoInputSwitch {...props} label="Toggle option" value={value} onChange={setValue} />
  );
}`;
