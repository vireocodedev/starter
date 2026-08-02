import { RgoInputSwitch, type RgoInputSwitchProps } from "@/components/inputs/RgoInputSwitch/RgoInputSwitch";
import React from "react";

type RgoInputSwitchWithDefaultPropsDemoProps = Partial<Omit<RgoInputSwitchProps, "value" | "onChange">>;

export function RgoInputSwitchWithDefaultPropsDemo(props: RgoInputSwitchWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<boolean | null>(null);

  return <RgoInputSwitch {...props} value={value} onChange={setValue} />;
}

export const RgoInputSwitchWithDefaultPropsDemoCode = `
import { RgoInputSwitch, type RgoInputSwitchProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputSwitchWithDefaultPropsDemoProps = Partial<Omit<RgoInputSwitchProps, "value" | "onChange">>;

export function RgoInputSwitchWithDefaultPropsDemo(props: RgoInputSwitchWithDefaultPropsDemoProps = {}) {
  const [value, setValue] = React.useState<boolean | null>(null);

  return (
    <RgoInputSwitch {...props} label="Toggle option" value={value} onChange={setValue} />
  );
}`;
