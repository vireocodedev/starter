import { RgoInputSwitch, type RgoInputSwitchProps } from "@/components/inputs/RgoInputSwitch/RgoInputSwitch";
import React from "react";

type RgoInputSwitchWithHelperTextDemoProps = Partial<Omit<RgoInputSwitchProps, "value" | "onChange">>;

export function RgoInputSwitchWithHelperTextDemo(
  props: RgoInputSwitchWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<boolean | null>(null);

  return <RgoInputSwitch {...props} label="Toggle option" value={value} onChange={setValue} />;
}

export const RgoInputSwitchWithHelperTextDemoCode = `
import { RgoInputSwitch, type RgoInputSwitchProps } from "@vireocodedev/starter-ui";
import React from "react";

type RgoInputSwitchWithHelperTextDemoProps = Partial<Omit<RgoInputSwitchProps, "value" | "onChange">>;

export function RgoInputSwitchWithHelperTextDemo(
  props: RgoInputSwitchWithHelperTextDemoProps = {
    helperText: "Your helpful text goes here",
  },
) {
  const [value, setValue] = React.useState<boolean | null>(null);

  return (
    <RgoInputSwitch {...props} label="Toggle option" value={value} onChange={setValue} />
  );
}`;
